package v1

import (
	"CosmicSailBackend/logic"
	"github.com/gofiber/fiber"
)

//
// Hardware Management
//
type MotorBody struct {
	Name    string  `json:"name" xml:"name" form:"name"`
	Channel int     `json:"channel" xml:"channel" form:"channel"`
	Min     float32 `json:"min" xml:"min" form:"min"`
	Max     float32 `json:"max" xml:"max" form:"max"`
	Default float32 `json:"default" xml:"default" form:"default"`
	Cycle   int     `json:"cycle" xml:"cycle" form:"cycle"`
}
type SensorBody struct {
	Name    string `json:"name" xml:"name" form:"name"`
	Channel string `json:"channel" xml:"channel" form:"channel"`
	Type    string `json:"type" xml:"type" form:"type"`
}

//    Registration
func RegisterBoatHardware(c *fiber.Ctx) {
	body := MotorBody{}

	if err := c.BodyParser(&body); err != nil {
		panic(fiber.NewError(fiber.StatusBadRequest, "Could not parse request!"))
	}

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
