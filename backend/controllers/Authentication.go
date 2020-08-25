package controllers

import (
	"CosmicSailBackend/models"
	"errors"
	"github.com/gbrlsnchs/jwt/v3"
	"github.com/gofiber/fiber"
	_ "github.com/joho/godotenv/autoload"
	"golang.org/x/crypto/bcrypt"
	"os"
	"time"
)

type registerBody struct {
	Username string `json:"username" xml:"username" form:"username"`
	Password string `json:"password" xml:"password" form:"password"`
	FullName string `json:"fullName" xml:"fullName" form:"fullName"`
	Email    string `json:"email" xml:"email" form:"email"`
}

func RegisterUser(c *fiber.Ctx) {
	body := registerBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}
	user, err := models.CreateUser(body.Username, body.Password, body.FullName, body.Email)
	if err != nil {
		panic(fiber.NewError(fiber.StatusInternalServerError, "User creation failed!"))
	}

	token, err := GetJWTForUser(body.Username, body.Password)

	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, err.Error()))
	}
	c.JSON(fiber.Map{"username": user.Username, "fullName": user.FullName, "mail": user.Email, "token": token})
}

type loginBody struct {
	Username string `json:"username" xml:"username" form:"username"`
	Password string `json:"password" xml:"password" form:"password"`
}

func LoginUser(c *fiber.Ctx) {
	body := loginBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}
	token, err := GetJWTForUser(body.Username, body.Password)

	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, err.Error()))
	}

	c.JSON(fiber.Map{"username": body.Username, "token": token})
}

type CosmicPayload struct {
	jwt.Payload
	Type       string `json:"type,omitempty"`
	Identifier string `json:"identifier,omitempty"`
}

var hs = jwt.NewHS256([]byte(os.Getenv("JWT_SECRET")))

func GetJWTForUser(username string, password string) (string, error) {
	var users []models.User
	models.Db.Where("username = ?", username).Find(&users)
	if len(users) == 0 {
		return "", errors.New("User not found")
	}
	if len(users) > 1 {
		return "", errors.New("Internal Server Error")
	}

	err := bcrypt.CompareHashAndPassword([]byte(users[0].PasswordHash), []byte(password))
	if err != nil {
		return "", errors.New("Password invalid")
	}

	now := time.Now()
	pl := CosmicPayload{
		Payload: jwt.Payload{
			Issuer:         "CosmicSail",
			Subject:        username,
			ExpirationTime: jwt.NumericDate(now.Add(24 * time.Hour)),
			NotBefore:      jwt.NumericDate(now),
			IssuedAt:       jwt.NumericDate(now),
		},
		Type:       "user",
		Identifier: username,
	}

	token, err := jwt.Sign(pl, hs)
	if err != nil {
		return "", errors.New("JWT Error")
	}

	return string(token), nil
}
