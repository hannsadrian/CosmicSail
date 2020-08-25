package models

import (
	"github.com/gofiber/fiber"
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
	"strings"
)

type User struct {
	gorm.Model
	Username     string `gorm:"unique;not null"`
	PasswordHash string `gorm:"not null"`
	FullName     string `gorm:"not null"`
	Email        string `gorm:"unique;not null"`
	IsAdmin      bool
}

func CreateUser(username string, password string, name string, email string) (User, error) {
	// Validate password
	if len(password) < 8 {
		panic(fiber.NewError(fiber.StatusBadRequest, "Password needs to be at least 8 characters long"))
	}

	// Validation

	// Unique username
	var users []User
	Db.Where("username = ?", username).Find(&users)
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
	user := User{
		Username:     username,
		PasswordHash: string(hash),
		FullName:     name,
		Email:        email,
		IsAdmin:      false,
	}

	Db.NewRecord(user)
	Db.Create(&user)

	return user, err
}
