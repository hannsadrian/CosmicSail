package models

import (
	"CosmicSailBackend/models/database"
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
}

type Sensor struct {
	gorm.Model
	BoatID  uint
	Name    string
	Channel string
	Type    string
}

func AddMotor(motor Motor, boat Boat) {
	motor.BoatID = boat.ID
	database.Db.NewRecord(motor)
	database.Db.Create(&motor)
}

func UpdateMotor(id uint, motor Motor) {
	motor.ID = id
	database.Db.Model(&motor).Updates(motor)
}

func RemoveMotor(id uint) {
	database.Db.Where("id = ?", id).Delete(Motor{})
}

func AddSensor(sensor Sensor, boat Boat) {
	sensor.BoatID = boat.ID
	database.Db.NewRecord(sensor)
	database.Db.Create(&sensor)
}

func UpdateSensor(id uint, sensor Sensor) {
	sensor.ID = id
	database.Db.Model(&sensor).Updates(sensor)
}

func RemoveSensor(id uint) {
	database.Db.Where("id = ?", id).Delete(Sensor{})
}