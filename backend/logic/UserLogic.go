package logic

import (
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"github.com/gofiber/fiber"
	"golang.org/x/crypto/bcrypt"
	"strings"
)

func CreateUser(username string, password string, name string, email string) (models.User, error) {
	// Validate password
	if len(password) < 8 {
		panic(fiber.NewError(fiber.StatusBadRequest, "Password needs to be at least 8 characters long"))
	}

	// Validation

	// Unique username
	var users []models.User
	database.Db.Where("username = ?", username).Find(&users)
	if len(users) > 0 {
		panic(fiber.NewError(fiber.StatusBadRequest, "A user with that name already exists!"))
	}

	// Name not empty
	if len(name) == 0 {
		panic(fiber.NewError(fiber.StatusBadRequest, "FullName cannot be empty"))
	}

	// Email invalid
	if len(email) == 0 || !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		panic(fiber.NewError(fiber.StatusBadRequest, "E-Mail invalid"))
	}

	// Create user
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 15)
	user := models.User{
		Username:     username,
		PasswordHash: string(hash),
		FullName:     name,
		Email:        email,
		IsAdmin:      false,
	}

	database.Db.NewRecord(user)
	database.Db.Create(&user)

	return user, err
}

