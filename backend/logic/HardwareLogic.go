package logic

import (
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
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
	Type    string  `json:"type" xml:"type" form:"type"`
}
type sensorBody struct {
	Name    string `json:"name" xml:"name" form:"name"`
	Channel string `json:"channel" xml:"channel" form:"channel"`
	Type    string `json:"type" xml:"type" form:"type"`
}

func RegisterBoatMotor(c *fiber.Ctx) {
	body := motorBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	entity, err := GetBoatForUser(c.Locals("user").(models.User), c.Params("emblem"))
	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+c.Params("emblem")))
	}

	if body.Name == "" {
		panic(fiber.NewError(fiber.StatusBadRequest, "Invalid request body"))
	}

	AddMotor(models.Motor{
		Name:    body.Name,
		Channel: body.Channel,
		Min:     body.Min,
		Max:     body.Max,
		Default: body.Default,
		Cycle:   body.Cycle,
		Type:    body.Type,
	}, entity)
	c.Send("Motor added!")
}

func RegisterBoatSensor(c *fiber.Ctx) {
	body := sensorBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	entity, err := GetBoatForUser(c.Locals("user").(models.User), c.Params("emblem"))
	if err != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+c.Params("emblem")))
	}

	if body.Name == "" || body.Type == "" || body.Channel == "" {
		panic(fiber.NewError(fiber.StatusBadRequest, "Invalid request body"))
	}

	AddSensor(models.Sensor{
		Name:    body.Name,
		Channel: body.Channel,
		Type:    body.Type,
	}, entity)
	c.Send("Sensor added!")
}

func UpdateBoatMotor(c *fiber.Ctx) {
	body := motorBody{}
	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))
	UpdateMotor(id, models.Motor{
		Name:    body.Name,
		Channel: body.Channel,
		Min:     body.Min,
		Max:     body.Max,
		Default: body.Default,
		Cycle:   body.Cycle,
		Type:    body.Type,
	})
	c.Send("Motor updated!")
}

func UpdateBoatSensor(c *fiber.Ctx) {
	body := sensorBody{}
	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))
	UpdateSensor(id, models.Sensor{
		Name:    body.Name,
		Channel: body.Channel,
		Type:    body.Type,
	})
	c.Send("Sensor updated!")
}

func DeleteBoatMotor(c *fiber.Ctx) {
	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))

	RemoveMotor(id)
	c.Send("Motor deleted!")
}

func DeleteBoatSensor(c *fiber.Ctx) {
	id := validateHardwareAccess(c.Locals("user").(models.User), c.Params("emblem"), c.Params("id"))

	RemoveSensor(id)
	c.Send("Sensor deleted!")
}

// validateHardwareAccess checks whether a user is allowed to access certain hardware parts by id.
// It returns the hardware id when access is allowed and panics with a GoFiber error when denied.
func validateHardwareAccess(user models.User, boatEmblem string, hardwareID string) uint {
	_, boatErr := GetBoatForUser(user, boatEmblem)
	if boatErr != nil {
		panic(fiber.NewError(fiber.StatusForbidden, "You don't have access to "+boatEmblem))
	}

	id, parseErr := strconv.ParseUint(hardwareID, 10, 0)
	if parseErr != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Id invalid"))
	}

	return uint(id)
}

// Database functions

func AddMotor(motor models.Motor, boat models.Boat) {
	motor.BoatID = boat.ID
	database.Db.NewRecord(motor)
	database.Db.Create(&motor)
}

func UpdateMotor(id uint, motor models.Motor) {
	motor.ID = id
	database.Db.Model(&motor).Updates(motor)
}

func RemoveMotor(id uint) {
	database.Db.Where("id = ?", id).Delete(models.Motor{})
}

func AddSensor(sensor models.Sensor, boat models.Boat) {
	sensor.BoatID = boat.ID
	database.Db.NewRecord(sensor)
	database.Db.Create(&sensor)
}

func UpdateSensor(id uint, sensor models.Sensor) {
	sensor.ID = id
	database.Db.Model(&sensor).Updates(sensor)
}

func RemoveSensor(id uint) {
	database.Db.Where("id = ?", id).Delete(models.Sensor{})
}