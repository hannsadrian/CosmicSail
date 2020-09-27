package v1

import (
	"CosmicSailBackend/logic"
	"github.com/gofiber/fiber"
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
	user, err := logic.CreateUser(body.Username, body.Password, body.FullName, body.Email)
	if err != nil {
		panic(fiber.NewError(fiber.StatusInternalServerError, "User creation failed!"))
	}

	token, err := logic.GetJWTForUser(body.Username, body.Password)

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
	token, err := logic.GetJWTForUser(body.Username, body.Password)

	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, err.Error()))
	}

	c.JSON(fiber.Map{"Username": body.Username, "Token": token})
}
