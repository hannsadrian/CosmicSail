package v1

import (
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"errors"
	"github.com/gbrlsnchs/jwt/v3"
	"github.com/gofiber/fiber"
	_ "github.com/joho/godotenv/autoload"
	"golang.org/x/crypto/bcrypt"
	"os"
	"time"
)

// Register function
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
	c.JSON(fiber.Map{"Username": user.Username, "FullName": user.FullName, "Email": user.Email, "Token": token})
}

// Login function
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

	c.JSON(fiber.Map{"Username": body.Username, "Token": token})
}

// JWT Management
type CosmicPayload struct {
	jwt.Payload
	Type       string `json:"type,omitempty"`
	Identifier string `json:"identifier,omitempty"`
}

var hs = jwt.NewHS256([]byte(os.Getenv("JWT_SECRET")))

// Generating JWT
func GetJWTForUser(username string, password string) (string, error) {
	var users []models.User
	database.Db.Where("username = ?", username).Find(&users)
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

	return GetJWT("user", username, true)
}

func GetJWTForBoat(boatId string) (string, error) {
	return GetJWT("boat", boatId, false)
}

func GetJWT(jwtType string, jwtIdentifier string, expires bool) (string, error) {
	now := time.Now()
	expiration := jwt.NumericDate(now.Add(24 * time.Hour))
	if !expires {
		expiration = nil
	}

	pl := CosmicPayload{
		Payload: jwt.Payload{
			Issuer:         "CosmicSail",
			Subject:        jwtIdentifier,
			ExpirationTime: expiration,
			NotBefore:      jwt.NumericDate(now),
			IssuedAt:       jwt.NumericDate(now),
		},
		Type:       jwtType,
		Identifier: jwtIdentifier,
	}

	token, err := jwt.Sign(pl, hs)
	if err != nil {
		return "", errors.New("JWT Error")
	}

	return string(token), nil
}

// Verifying JWT
func VerifyUserJWT(token string) (CosmicPayload, error) {
	payload, err := VerifyJWT(token)
	if err != nil {
		return CosmicPayload{}, err
	}
	if payload.Type != "user" {
		return CosmicPayload{}, errors.New("Insufficient permission")
	}

	return payload, nil
}

func VerifyBoatJWT(token string) (CosmicPayload, error) {
	payload, err := VerifyJWT(token)
	if err != nil {
		return CosmicPayload{}, err
	}
	if payload.Type != "boat" {
		return CosmicPayload{}, errors.New("Insufficient permission")
	}

	return payload, nil
}

func VerifyJWT(token string) (CosmicPayload, error) {
	var payload CosmicPayload
	_, err := jwt.Verify([]byte(token), hs, &payload)
	if err != nil {
		return CosmicPayload{}, err
	}
	if payload.ExpirationTime.Unix() < time.Now().Unix() {
		return CosmicPayload{}, errors.New("Token expired")
	}

	return payload, nil
}

// GetBoatForUser searches in all to the user available boats and returns the corresponding one.
// Admins have access to all boats.
func GetBoatForUser(user models.User, emblem string) (models.Boat, error) {
	var boats []models.Boat
	if user.IsAdmin {
		database.Db.Find(&boats)
	} else {
		database.Db.Model(&user).Association("Boats").Find(&boats)
	}

	var entity models.Boat
	for _, value := range boats {
		if value.BoatEmblem == emblem {
			entity = value
		}
	}
	if entity.BoatEmblem == "" {
		return models.Boat{}, errors.New("No Boat found!")
	}

	return entity, nil
}