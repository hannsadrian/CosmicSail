package main

import (
	"CosmicSailBackend/controllers"
	"CosmicSailBackend/models"
	"github.com/gofiber/cors"
	"github.com/gofiber/fiber"
	"github.com/gofiber/fiber/middleware"
	"github.com/joho/godotenv"
	"log"
	"os"
)

func main() {
	// Load .env file
	envErr := godotenv.Load()
	if envErr != nil {
		log.Println(" ! Error while loading .env file")
	} else {
		log.Println("-> Loaded env file")
	}


	// Connect to postgres
	db, dbErr := models.ConnectDb("host="+os.Getenv("POSTGRES_HOST")+
			" port="+os.Getenv("POSTGRES_PORT")+
			" user="+os.Getenv("POSTGRES_USER")+
			" dbname="+os.Getenv("POSTGRES_DB")+
			" password="+os.Getenv("POSTGRES_PSWD"))
	if dbErr != nil {
		panic(dbErr)
	} else {
		log.Println("-> Connected to database at " + os.Getenv("POSTGRES_HOST"))
	}
	defer db.Close()

	// Migrate Models
	db.AutoMigrate(&models.Boat{})
	db.AutoMigrate(&models.User{})



	// Init webserver
	app := fiber.New()
	app.Use(cors.New())
	app.Use(middleware.Recover())
	app.Use(middleware.Logger("${time} | ${status} ${method} from ${ip} -> ${path} \n"))

	auth := app.Group("/auth")
	auth.Post("/register", controllers.RegisterUser)
	auth.Post("/login", controllers.LoginUser)


	// Register routes
	app.Get("/v1/boats", func(c *fiber.Ctx) {
		// TODO: Authenticate and only show boats for user
		boats := []models.Boat{}
		db.Find(&boats)
		c.JSON(&boats)
	})

	// Deliver static files
	app.Static("/", "static")

	// Start the server
	panic(app.Listen(os.Getenv("SERVER_PORT")))
}
