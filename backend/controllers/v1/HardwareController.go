package v1

import (
	"CosmicSailBackend/logic"
	"github.com/gofiber/fiber"
)

//    Registration
func RegisterBoatHardware(c *fiber.Ctx) {
	if c.Params("hardware") == "motor" {
		logic.RegisterBoatMotor(c)
	} else if c.Params("hardware") == "sensor" {
		logic.RegisterBoatSensor(c)
	} else {
		c.Status(400).Send(c.Params("hardware") + " not found")
	}
}

//    Updating
func UpdateBoatHardware(c *fiber.Ctx) {
	if c.Params("hardware") == "motor" {
		logic.UpdateBoatMotor(c)
	} else if c.Params("hardware") == "sensor" {
		logic.UpdateBoatSensor(c)
	} else {
		c.Status(400).Send(c.Params("hardware") + " not found")
	}
}

//    Deleting
func DeleteBoatHardware(c *fiber.Ctx) {
	if c.Params("hardware") == "motor" {
		logic.DeleteBoatMotor(c)
	} else if c.Params("hardware") == "sensor" {
		logic.DeleteBoatSensor(c)
	} else {
		c.Status(400).Send(c.Params("hardware") + " not found")
	}
}
