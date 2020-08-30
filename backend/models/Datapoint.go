package models

import (
	"github.com/jinzhu/gorm"
	"time"
)

type Datapoint struct {
	gorm.Model
	TripID    uint
	Timestamp time.Time
	Data      string
}
