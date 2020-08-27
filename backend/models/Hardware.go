package models

import "github.com/jinzhu/gorm"

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
	Db.NewRecord(motor)
	Db.Create(&motor)
}

func RemoveMotor(id uint) {
	Db.Where("id = ?", id).Delete(Motor{})
}

func AddSensor(sensor Sensor, boat Boat) {
	sensor.BoatID = boat.ID
	Db.NewRecord(sensor)
	Db.Create(&sensor)
}

func RemoveSensor(id uint) {
	Db.Where("id = ?", id).Delete(Sensor{})
}