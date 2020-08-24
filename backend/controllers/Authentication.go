package controllers

import (
	"CosmicSailBackend/models"
	"github.com/gofiber/fiber"
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

	// TODO: Return JWT for direct login
	c.JSON(fiber.Map{"username": user.Username, "fullName": user.FullName, "mail": user.Email})
}
