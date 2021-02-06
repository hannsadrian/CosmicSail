package models

import (
	"github.com/jinzhu/gorm"
	"time"
)

type Boat struct {
	gorm.Model
	BoatEmblem string `gorm:"type:varchar(5);unique_index"`
	UserID     uint
	Name       string
	ImageUrl   string
	Series     string
	Make       string
	Online     bool
	LastOnline time.Time
	Motors     []Motor
	Sensors    []Sensor
	Trips 	   []Trip
}


