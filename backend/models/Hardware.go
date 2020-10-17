package models

import (
	"github.com/jinzhu/gorm"
)

type Motor struct {
	gorm.Model
	BoatID  uint
	Name    string
	Channel int
	Min     float32
	Max     float32
	Default float32
	Cycle   int
	Type    string
}

type Sensor struct {
	gorm.Model
	BoatID  uint
	Name    string
	Channel string
	Type    string
}
