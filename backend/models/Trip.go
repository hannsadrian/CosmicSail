package models

import (
	"github.com/jinzhu/gorm"
	"time"
)

type Trip struct {
	gorm.Model
	BoatID     uint
	Name       string
	StartDate  time.Time
	EndDate    time.Time
	Datapoints []Datapoint
}
