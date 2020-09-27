package logic

import (
	v1 "CosmicSailBackend/controllers/v1"
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"github.com/gofiber/fiber"
	"strconv"
)

func RegisterBoatMotor(c *fiber.Ctx) {
	body := v1.MotorBody{}

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
	}, entity)
	c.Send("Motor added!")
}

func RegisterBoatSensor(c *fiber.Ctx) {
	body := v1.SensorBody{}

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
	body := v1.MotorBody{}
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
	})
	c.Send("Motor updated!")
}

func UpdateBoatSensor(c *fiber.Ctx) {
	body := v1.SensorBody{}
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