package logic

import (
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"errors"
	"github.com/gofiber/fiber"
	"math/rand"
	"time"
)

func CreateBoat(owner models.User, name string, series string, make string) (models.Boat, error) {
	rand.Seed(time.Now().UnixNano())
	boatId := randSeq(5)

	boat := models.Boat{
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

// GetBoatForUser searches in all to the user available boats and returns the corresponding one.
// Admins have access to all boats.
func GetBoatForUser(user models.User, emblem string) (models.Boat, error) {
	var boats []models.Boat
	if user.IsAdmin {
		database.Db.Find(&boats)
	} else {
		database.Db.Model(&user).Association("Boats").Find(&boats)
	}

	var entity models.Boat
	for _, value := range boats {
		if value.BoatEmblem == emblem {
			entity = value
		}
	}
	if entity.BoatEmblem == "" {
		return models.Boat{}, errors.New("No Boat found!")
	}

	return entity, nil
}

func GetBoatByEmblem(emblem string) (models.Boat, error) {
	var boats []models.Boat
	database.Db.Find(&boats)

	var entity models.Boat
	for _, value := range boats {
		if value.BoatEmblem == emblem {
			entity = value
		}
	}
	if entity.BoatEmblem == "" {
		return models.Boat{}, errors.New("No Boat found!")
	}

	return entity, nil
}


func SerializeBoat(boat models.Boat) fiber.Map {
	return fiber.Map{"BoatEmblem": boat.BoatEmblem, "Name": boat.Name, "Series": boat.Series, "Make": boat.Make, "Online": boat.Online, "LastOnline": boat.LastOnline, "Motors": boat.Motors, "Sensors": boat.Sensors}
}

func SetOnline(boatEmblem string) {
	boat := models.Boat{}
	database.Db.Where("boat_emblem = ?", boatEmblem).First(&boat)
	database.Db.Model(&boat).Updates(map[string]interface{}{"online": true})
}

func SetOffline(boatEmblem string) {
	boat := models.Boat{}
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
