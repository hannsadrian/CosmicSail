package main

import (
	v1 "CosmicSailBackend/controllers/v1"
	"CosmicSailBackend/models"
	"github.com/gbrlsnchs/jwt/v3"
	"github.com/gofiber/cors"
	"github.com/gofiber/fiber"
	"github.com/gofiber/fiber/middleware"
	"github.com/joho/godotenv"
	"log"
	"os"
	"strings"
)

var hs = jwt.NewHS256([]byte(os.Getenv("JWT_SECRET")))
func main() {
	// Load .env file
	envErr := godotenv.Load()
	if envErr != nil {
		log.Println(" ! Error while loading .env file")
	} else {
		log.Println("-> Loaded env file")
	}


	// Connect to postgres
	_, dbErr := models.ConnectDb("host="+os.Getenv("POSTGRES_HOST")+
			" port="+os.Getenv("POSTGRES_PORT")+
			" user="+os.Getenv("POSTGRES_USER")+
			" dbname="+os.Getenv("POSTGRES_DB")+
			" password="+os.Getenv("POSTGRES_PSWD"))
	if dbErr != nil {
		panic(dbErr)
	} else {
		log.Println("-> Connected to database at " + os.Getenv("POSTGRES_HOST"))
	}
	defer models.Db.Close()

	// Migrate Models
	models.Db.AutoMigrate(&models.Boat{})
	models.Db.AutoMigrate(&models.User{})
	models.Db.AutoMigrate(&models.Motor{})
	models.Db.AutoMigrate(&models.Sensor{})



	// Init webserver
	app := fiber.New()
	app.Use(cors.New())
	app.Use(middleware.Recover())
	app.Use(middleware.Logger("${time} | ${status} ${method} from ${ip} -> ${path} \n"))


	// Register Routes
	auth := app.Group("/auth")
	auth.Post("/register", v1.RegisterUser)
	auth.Post("/login", v1.LoginUser)

	apiV1 := app.Group("/v1", func(c *fiber.Ctx) {
		// Get Header
		bearer := c.Get("Authorization", "")
		if bearer == "" {
			panic(fiber.NewError(fiber.StatusBadRequest, "No Authorization Header present"))
		}

		// Verify JWT
		payload, err := v1.VerifyUserJWT(strings.ReplaceAll(bearer, "Bearer ", ""))
		if err != nil {
			panic(fiber.NewError(fiber.StatusForbidden, err.Error()))
		}

		// Add user from db to context
		var user models.User
		models.Db.Where("username = ?", payload.Identifier).First(&user)
		c.Locals("user", user)

		c.Next()
	})
	apiV1.Post("/boats", v1.RegisterBoatForUser)
	apiV1.Get("/boats", v1.GetAllBoats)
	apiV1.Post("/boats/:emblem/motor", v1.RegisterBoatMotor)
	apiV1.Post("/boats/:emblem/sensor", v1.RegisterBoatSensor)
	apiV1.Delete("/boats/:emblem/motor/:id", v1.DeleteBoatMotor)
	apiV1.Delete("/boats/:emblem/sensor/:id", v1.DeleteBoatSensor)

	// Deliver static files
	app.Static("/", "static")

	// Start the server
	panic(app.Listen(os.Getenv("SERVER_PORT")))
}
