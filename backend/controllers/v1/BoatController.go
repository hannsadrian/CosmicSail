package v1

import (
	"CosmicSailBackend/models"
	"errors"
	"github.com/gofiber/fiber"
	"strconv"
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

//
// Hardware Management
//
//    Registration
type registerMotorBody struct {
	Name    string  `json:"name" xml:"name" form:"name"`
	Channel int     `json:"channel" xml:"channel" form:"channel"`
	Min     float32 `json:"min" xml:"min" form:"min"`
	Max     float32 `json:"max" xml:"max" form:"max"`
	Default float32 `json:"default" xml:"default" form:"default"`
	Cycle   int     `json:"cycle" xml:"cycle" form:"cycle"`
}

func RegisterBoatMotor(c *fiber.Ctx) {
	body := registerMotorBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	boat, err := getBoatForUser(c.Locals("user").(models.User), c.Params("emblem"))
	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+c.Params("emblem")))
	}

	if body.Name == "" {
		panic(fiber.NewError(fiber.StatusBadRequest, "Invalid request body"))
	}

	models.AddMotor(models.Motor{
		Name:    body.Name,
		Channel: body.Channel,
		Min:     body.Min,
		Max:     body.Max,
		Default: body.Default,
		Cycle:   body.Cycle,
	}, boat)
	c.Send("Motor added!")
}

type registerSensorBody struct {
	Name    string `json:"name" xml:"name" form:"name"`
	Channel string `json:"channel" xml:"channel" form:"channel"`
	Type    string `json:"type" xml:"type" form:"type"`
}

func RegisterBoatSensor(c *fiber.Ctx) {
	body := registerSensorBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	boat, err := getBoatForUser(c.Locals("user").(models.User), c.Params("emblem"))
	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+c.Params("emblem")))
	}

	if body.Name == "" || body.Type == "" || body.Channel == "" {
		panic(fiber.NewError(fiber.StatusBadRequest, "Invalid request body"))
	}

	models.AddSensor(models.Sensor{
		Name:    body.Name,
		Channel: body.Channel,
		Type:    body.Type,
	}, boat)
	c.Send("Sensor added!")
}

//    Deletion
func DeleteBoatMotor(c *fiber.Ctx) {
	id := validateDeletion(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))

	models.RemoveMotor(id)
	c.Send("Motor deleted!")
}

func DeleteBoatSensor(c *fiber.Ctx) {
	id := validateDeletion(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))

	models.RemoveSensor(id)
	c.Send("Sensor deleted!")
}

func validateDeletion(user models.User, emblem string, ident string) uint {
	_, boatErr := getBoatForUser(user, emblem)
	if boatErr != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+emblem))
	}

	id, parseErr := strconv.ParseUint(ident, 10, 0)
	if parseErr != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Id invalid"))
	}

	return uint(id)
}

func getBoatForUser(user models.User, emblem string) (models.Boat, error) {
	var boats []models.Boat
	if user.IsAdmin {
		models.Db.Find(&boats)
	} else {
		models.Db.Model(&user).Related(&boats)
	}

	var boat models.Boat
	for _, value := range boats {
		if value.BoatEmblem == emblem {
			boat = value
		}
	}
	if boat.BoatEmblem == "" {
		return models.Boat{}, errors.New("No Boat found!")
	}

	return boat, nil
}
