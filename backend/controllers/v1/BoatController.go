package v1

import (
	"CosmicSailBackend/logic"
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"github.com/gofiber/fiber"
)

//
// Boat Management
//
type registerBoatBody struct {
	Name   string `json:"name" xml:"name" form:"name"`
	Series string `json:"series" xml:"series" form:"series"`
	Make   string `json:"make" xml:"make" form:"make"`
}

func RegisterBoatForUser(c *fiber.Ctx) {
	body := registerBoatBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}
	boat, err := logic.CreateBoat(c.Locals("user").(models.User), body.Name, body.Series, body.Make)
	if err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, err.Error()))
	}

	// Get Token for Boat
	token, err := logic.GetJWTForBoat(boat.BoatEmblem)
	if err != nil {
		panic(fiber.NewError(fiber.StatusInternalServerError, err.Error()))
	}

	c.JSON(fiber.Map{"Token": token, "Boat": fiber.Map{"BoatEmblem": boat.BoatEmblem, "Name": boat.Name, "Owner": c.Locals("user").(models.User).Username}})
}

func GetBoatTrips(c *fiber.Ctx) {
	result, err := logic.GetBoatForUser(c.Locals("user").(models.User), c.Params("emblem"))
	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, err.Error()))
	}

	trips, tripErr := logic.GetAllTrips(result.ID)
	if tripErr != nil {
		panic(fiber.NewError(fiber.StatusNotFound, tripErr.Error()))
	}

	c.JSON(trips)
}

func GetAllBoats(c *fiber.Ctx) {
	var user models.User
	user = c.Locals("user").(models.User)
	if !user.IsAdmin {
		var boats []models.Boat
		database.Db.Model(&user).Related(&boats)
		var output []fiber.Map
		for _, boat := range boats {
			database.Db.Model(&boat).Association("Motors").Find(&boat.Motors)
			database.Db.Model(&boat).Association("Sensors").Find(&boat.Sensors)
			database.Db.Model(&boat).Association("Trips").Find(&boat.Trips)
			output = append(output, logic.SerializeBoat(boat))
		}
		c.JSON(output)
	} else {
		var boats []models.Boat
		database.Db.Model(&boats)

		var output []fiber.Map
		for _, boat := range boats {
			output = append(output, logic.SerializeBoat(boat))
		}
		c.JSON(output)
	}
}
