package telemetry

import (
	"CosmicSailBackend/models"
	"errors"
	"github.com/jinzhu/gorm"
	"time"
)

type Trip struct {
	gorm.Model
	BoatID uint
	Name string
	StartDate time.Time
	EndDate time.Time
	Datapoints []Datapoint
}

func SaveDatapoint(boatID uint, datapoint Datapoint) {
	trip := GetLatestTripOrCreateNew(boatID, 10)

	datapoint.TripID = trip.ID
	models.Db.NewRecord(datapoint)
	models.Db.Save(&datapoint)
}

// GetLatestTripOrCreateNew returns GetLatestTrip
// If no Trip was found or the latest Datapoint was saved more than `timeout` minutes ago, a new Trip is created
func GetLatestTripOrCreateNew(boatID uint, timeout int) Trip {
	createNewTrip := false

	trip, err := GetLatestTrip(boatID)
	if err != nil {
		createNewTrip = true
	}

	// Skip this step if a new Trip will already be created
	if !createNewTrip {
		// TODO: Determine latest Datapoint and check whether to create a new Trip
	}

	if createNewTrip {
		var datapoints []Datapoint
		trip := Trip{
			BoatID:     boatID,
			Name:       time.Now().Format("15:04 2.1.2006"),
			StartDate:  time.Now(),
			EndDate:    nil,
			Datapoints: datapoints,
		}

		models.Db.NewRecord(trip)
		models.Db.Save(&trip)

		return trip
	} else {
		return trip
	}
}

// GetLatestTrip returns the Trip for a boat queried by StartDate that is closest to time.Now()
// If no Trip is found, then the error is not nil
func GetLatestTrip(boatID uint) (Trip, error) {
	var boatTrips []Trip
	var datapoints []Datapoint
	models.Db.Where("boat_id = ?", boatID).Order("start_date desc").Find(&boatTrips).Association("Datapoints").Find(&datapoints)

	if len(boatTrips) == 0 {
		return Trip{}, errors.New("no trip found")
	}

	// Gorm should theoretically assign the datapoints automatically
	// To reduce bugs we make sure here:
	boatTrips[0].Datapoints = datapoints

	return boatTrips[0], nil
}