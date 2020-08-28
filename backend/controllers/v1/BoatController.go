package v1

import (
	"CosmicSailBackend/models"
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
	boat, err := models.CreateBoat(c.Locals("user").(models.User), body.Name, body.Series, body.Make)
	if err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, err.Error()))
	}

	// Get Token for Boat
	token, err := GetJWTForBoat(boat.BoatEmblem)
	if err != nil {
		panic(fiber.NewError(fiber.StatusInternalServerError, err.Error()))
	}

	c.JSON(fiber.Map{"Token": token, "Boat": fiber.Map{"BoatEmblem": boat.BoatEmblem, "Name": boat.Name, "Owner": c.Locals("user").(models.User).Username}})
}

func GetAllBoats(c *fiber.Ctx) {
	var user models.User
	user = c.Locals("user").(models.User)
	if !user.IsAdmin {
		var boats []models.Boat
		models.Db.Model(&user).Related(&boats)
		var output []fiber.Map
		for _, boat := range boats {
			models.Db.Model(&boat).Association("Motors").Find(&boat.Motors)
			models.Db.Model(&boat).Association("Sensors").Find(&boat.Sensors)
			output = append(output, serializeBoat(boat))
		}
		c.JSON(output)
	} else {
		var boats []models.Boat
		models.Db.Model(&boats)
		var output []fiber.Map
		for _, boat := range boats {
			output = append(output, serializeBoat(boat))
		}
		c.JSON(output)
	}
}

func serializeBoat(boat models.Boat) fiber.Map {
	return fiber.Map{"BoatEmblem": boat.BoatEmblem, "Name": boat.Name, "Series": boat.Series, "Make": boat.Make, "Online": boat.Online, "LastOnline": boat.LastOnline, "Motors": boat.Motors, "Sensors": boat.Sensors}
}
