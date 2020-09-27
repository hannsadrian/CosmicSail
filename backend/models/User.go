package models

import (
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model
	Username     string  `gorm:"unique;not null"`
	PasswordHash string  `gorm:"not null"`
	FullName     string  `gorm:"not null"`
	Email        string  `gorm:"unique;not null"`
	Boats		 []Boat `gorm:"foreignkey:UserID"`
	IsAdmin      bool
}