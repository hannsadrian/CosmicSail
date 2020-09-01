package main

import (
	v1 "CosmicSailBackend/controllers/v1"
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"CosmicSailBackend/socket"
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
	_, dbErr := database.ConnectDb("host="+os.Getenv("POSTGRES_HOST")+
			" port="+os.Getenv("POSTGRES_PORT")+
			" user="+os.Getenv("POSTGRES_USER")+
			" dbname="+os.Getenv("POSTGRES_DB")+
			" password="+os.Getenv("POSTGRES_PSWD"))
	if dbErr != nil {
		panic(dbErr)
	} else {
		log.Println("-> Connected to database at " + os.Getenv("POSTGRES_HOST"))
	}
	defer database.Db.Close()

	// Migrate Models
	database.Db.AutoMigrate(&models.User{})

	database.Db.AutoMigrate(&models.Boat{})
	database.Db.AutoMigrate(&models.Motor{})
	database.Db.AutoMigrate(&models.Sensor{})

	database.Db.AutoMigrate(&models.Trip{})
	database.Db.AutoMigrate(&models.Datapoint{})


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
		database.Db.Where("username = ?", payload.Identifier).First(&user)
		c.Locals("user", user)

		c.Next()
	})
	apiV1.Post("/boats", v1.RegisterBoatForUser)
	apiV1.Get("/boats", v1.GetAllBoats)

	// Trips
	apiV1.Get("/boats/:emblem/trips", v1.GetBoatTrips)

	// Hardware
	apiV1.Post("/boats/:emblem/:hardware", v1.RegisterBoatHardware)
	apiV1.Put("/boats/:emblem/:hardware/:id", v1.UpdateBoatHardware)
	apiV1.Delete("/boats/:emblem/:hardware/:id", v1.DeleteBoatHardware)

	// Deliver static files
	app.Static("/", "static")

	go socket.StartSocket("3030")
	// Start the server
	panic(app.Listen(os.Getenv("SERVER_PORT")))
}
