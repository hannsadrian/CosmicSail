package models

import (
	"github.com/jinzhu/gorm"
	"time"
)

type Boat struct {
	gorm.Model
	BoatId     string `gorm:"type:varchar(5);unique_index"`
	Token      string
	Name       string
	Series     string
	Make       string
	Online     bool
	LastOnline time.Time
}
