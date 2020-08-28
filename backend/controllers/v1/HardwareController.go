package v1

import (
	"CosmicSailBackend/models"
	boat "CosmicSailBackend/models/boat"
	"errors"
	"github.com/gofiber/fiber"
	"strconv"
)

//
// Hardware Management
//
type motorBody struct {
	Name    string  `json:"name" xml:"name" form:"name"`
	Channel int     `json:"channel" xml:"channel" form:"channel"`
	Min     float32 `json:"min" xml:"min" form:"min"`
	Max     float32 `json:"max" xml:"max" form:"max"`
	Default float32 `json:"default" xml:"default" form:"default"`
	Cycle   int     `json:"cycle" xml:"cycle" form:"cycle"`
}
type sensorBody struct {
	Name    string `json:"name" xml:"name" form:"name"`
	Channel string `json:"channel" xml:"channel" form:"channel"`
	Type    string `json:"type" xml:"type" form:"type"`
}

//    Registration
func RegisterBoatHardware(c *fiber.Ctx) {
	if c.Params("hardware") == "motor" {
		registerBoatMotor(c)
	} else if c.Params("hardware") == "sensor" {
		registerBoatSensor(c)
	} else {
		c.Status(400).Send(c.Params("hardware") + " not found")
	}
}

func registerBoatMotor(c *fiber.Ctx) {
	body := motorBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	entity, err := getBoatForUser(c.Locals("user").(models.User), c.Params("emblem"))
	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+c.Params("emblem")))
	}

	if body.Name == "" {
		panic(fiber.NewError(fiber.StatusBadRequest, "Invalid request body"))
	}

	boat.AddMotor(boat.Motor{
		Name:    body.Name,
		Channel: body.Channel,
		Min:     body.Min,
		Max:     body.Max,
		Default: body.Default,
		Cycle:   body.Cycle,
	}, entity)
	c.Send("Motor added!")
}

func registerBoatSensor(c *fiber.Ctx) {
	body := sensorBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	entity, err := getBoatForUser(c.Locals("user").(models.User), c.Params("emblem"))
	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+c.Params("emblem")))
	}

	if body.Name == "" || body.Type == "" || body.Channel == "" {
		panic(fiber.NewError(fiber.StatusBadRequest, "Invalid request body"))
	}

	boat.AddSensor(boat.Sensor{
		Name:    body.Name,
		Channel: body.Channel,
		Type:    body.Type,
	}, entity)
	c.Send("Sensor added!")
}

//    Updating
func UpdateBoatHardware(c *fiber.Ctx) {
	if c.Params("hardware") == "motor" {
		updateBoatMotor(c)
	} else if c.Params("hardware") == "sensor" {
		updateBoatSensor(c)
	} else {
		c.Status(400).Send(c.Params("hardware") + " not found")
	}
}

func updateBoatMotor(c *fiber.Ctx) {
	body := motorBody{}
	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))
	boat.UpdateMotor(id, boat.Motor{
		Name:    body.Name,
		Channel: body.Channel,
		Min:     body.Min,
		Max:     body.Max,
		Default: body.Default,
		Cycle:   body.Cycle,
	})
	c.Send("Motor updated!")
}

func updateBoatSensor(c *fiber.Ctx) {
	body := sensorBody{}
	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))
	boat.UpdateSensor(id, boat.Sensor{
		Name:    body.Name,
		Channel: body.Channel,
		Type:    body.Type,
	})
	c.Send("Sensor updated!")
}

//    Deleting
func DeleteBoatHardware(c *fiber.Ctx) {
	if c.Params("hardware") == "motor" {
		deleteBoatMotor(c)
	} else if c.Params("hardware") == "sensor" {
		deleteBoatSensor(c)
	} else {
		c.Status(400).Send(c.Params("hardware") + " not found")
	}
}

func deleteBoatMotor(c *fiber.Ctx) {
	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))

	boat.RemoveMotor(id)
	c.Send("Motor deleted!")
}

func deleteBoatSensor(c *fiber.Ctx) {
	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))

	boat.RemoveSensor(id)
	c.Send("Sensor deleted!")
}

// validateHardwareAccess checks whether a user is allowed to access certain hardware parts by id.
// It returns the hardware id when access is allowed and panics with a GoFiber error when denied.
func validateHardwareAccess(user models.User, boatEmblem string, hardwareID string) uint {
	_, boatErr := getBoatForUser(user, boatEmblem)
	if boatErr != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+boatEmblem))
	}

	id, parseErr := strconv.ParseUint(hardwareID, 10, 0)
	if parseErr != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Id invalid"))
	}

	return uint(id)
}

// getBoatForUser searches in all to the user available boats and returns the corresponding one.
// Admins have access to all boats.
func getBoatForUser(user models.User, emblem string) (boat.Boat, error) {
	var boats []boat.Boat
	if user.IsAdmin {
		models.Db.Find(&boats)
	} else {
		models.Db.Model(&user).Association("Boats").Find(&boats)
	}

	var entity boat.Boat
	for _, value := range boats {
		if value.BoatEmblem == emblem {
			entity = value
		}
	}
	if entity.BoatEmblem == "" {
		return boat.Boat{}, errors.New("No Boat found!")
	}

	return entity, nil
}
