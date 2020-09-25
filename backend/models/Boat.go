package models

import (
	"CosmicSailBackend/models/database"
	"github.com/jinzhu/gorm"
	"math/rand"
	"time"
)

type Boat struct {
	gorm.Model
	BoatEmblem string `gorm:"type:varchar(5);unique_index"`
	UserID     uint
	Name       string
	Series     string
	Make       string
	Online     bool
	LastOnline time.Time
	Motors     []Motor
	Sensors    []Sensor
	Trips 	   []Trip
}

func CreateBoat(owner User, name string, series string, make string) (Boat, error) {
	rand.Seed(time.Now().UnixNano())
	boatId := randSeq(5)

	boat := Boat{
		BoatEmblem: boatId,
		UserID:     owner.ID,
		Name:       name,
		Series:     series,
		Make:       make,
		Online:     false,
		LastOnline: time.Now(),
	}

	database.Db.NewRecord(boat)
	database.Db.Create(&boat)

	return boat, nil
}

func SetOnline(boatEmblem string) {
	boat := Boat{}
	database.Db.Where("boat_emblem = ?", boatEmblem).First(&boat)
	boat.Online = true
	database.Db.Model(&boat).Updates(boat)
}

func SetOffline(boatEmblem string) {
	boat := Boat{}
	database.Db.Where("boat_emblem = ?", boatEmblem).First(&boat)
	database.Db.Model(&boat).Updates(map[string]interface{}{"online": false, "last_online": time.Now()})
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
