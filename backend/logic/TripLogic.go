package logic

import (
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"errors"
	"github.com/gofiber/fiber"
	"time"
)

func SaveDatapoint(boatID uint, datapoint models.Datapoint) {
	trip := GetLatestTripOrCreateNew(boatID, 20)

	datapoint.TripID = trip.ID
	database.Db.NewRecord(datapoint)
	database.Db.Save(&datapoint)
}

func GetAllTrips(boatID uint) ([]fiber.Map, error) {
	var boatTrips []models.Trip
	database.Db.Where("boat_id = ?", boatID).Order("start_date desc").Find(&boatTrips)

	if len(boatTrips) == 0 {
		return []fiber.Map{}, errors.New("no trip found")
	}

	// We output everything as fiber.Map to remove unnecessary info like CreatedAt or UpdatedAt
	var out []fiber.Map

	for _, trip := range boatTrips {
		database.Db.Model(trip) //.Related(&trip.Datapoints)

		var datapoints []fiber.Map
		// Prettify Datapoints
		for _, datapoint := range trip.Datapoints {
			datapoints = append(datapoints, fiber.Map{
				"TripID":    datapoint.TripID,
				"Timestamp": datapoint.Timestamp,
				"Data":      datapoint.Data,
			})
		}

		out = append(out, fiber.Map{
			"ID":         trip.ID,
			"BoatID":     trip.BoatID,
			"Name":       trip.Name,
			"StartDate":  trip.StartDate,
			"EndDate":    trip.EndDate,
			"Datapoints": datapoints,
		})
	}

	return out, nil
}

func GetTripDetail(boatID uint, tripID uint) ([]fiber.Map, error) {
	var boatTrip models.Trip
	database.Db.Where("boat_id = ?", boatID).Order("start_date desc").Find(&boatTrip)

	// We output everything as fiber.Map to remove unnecessary info like CreatedAt or UpdatedAt
	var out []fiber.Map

	database.Db.Model(boatTrip).Related(&boatTrip.Datapoints)

	var datapoints []fiber.Map
	// Prettify Datapoints
	for _, datapoint := range boatTrip.Datapoints {
		datapoints = append(datapoints, fiber.Map{
			"TripID":    datapoint.TripID,
			"Timestamp": datapoint.Timestamp,
			"Data":      datapoint.Data,
		})
	}

	out = append(out, fiber.Map{
		"ID":         boatTrip.ID,
		"BoatID":     boatTrip.BoatID,
		"Name":       boatTrip.Name,
		"StartDate":  boatTrip.StartDate,
		"EndDate":    boatTrip.EndDate,
		"Datapoints": datapoints,
	})

	return out, nil
}

// GetLatestTripOrCreateNew essentially returns GetLatestTrip
// If no Trip was found or the latest Datapoint was saved more than `timeout` minutes ago, a new Trip is created
func GetLatestTripOrCreateNew(boatID uint, timeout int) models.Trip {
	createNewTrip := false

	trip, err := GetLatestTrip(boatID)
	if err != nil {
		createNewTrip = true
	}

	// Skip this step if a new Trip will already be created or there are no datapoints yet
	if !createNewTrip && len(trip.Datapoints) != 0 {
		// Determine latest Datapoint
		var latestStamp int64 = 0
		for _, datapoint := range trip.Datapoints {
			if latestStamp < datapoint.Timestamp.Unix() {
				latestStamp = datapoint.Timestamp.Unix()
			}
		}

		// Check whether timestamp is out of timeout
		if latestStamp-(time.Now().Unix()-int64(60*timeout)) < 1 {
			createNewTrip = true
			// Set EndDate for old Trip
			trip.EndDate = time.Unix(latestStamp, 0)
			database.Db.Save(&trip)
		}
	}

	if createNewTrip {
		var datapoints []models.Datapoint
		trip := models.Trip{
			BoatID:     boatID,
			Name:       time.Now().Format("15:04 2.1.2006"),
			StartDate:  time.Now(),
			EndDate:    time.Time{},
			Datapoints: datapoints,
		}

		database.Db.NewRecord(trip)
		database.Db.Save(&trip)

		return trip
	} else {
		return trip
	}
}

// GetLatestTrip returns the Trip for a boat queried by StartDate that is closest to time.Now()
// If no Trip is found, then the error is not nil
func GetLatestTrip(boatID uint) (models.Trip, error) {
	var boatTrips []models.Trip
	database.Db.Where("boat_id = ?", boatID).Order("start_date desc").Find(&boatTrips)

	if len(boatTrips) == 0 {
		return models.Trip{}, errors.New("no trip found")
	}

	var datapoints []models.Datapoint
	database.Db.Model(boatTrips[0]).Related(&datapoints)
	boatTrips[0].Datapoints = datapoints

	return boatTrips[0], nil
}
