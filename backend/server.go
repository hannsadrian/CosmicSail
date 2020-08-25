package main

import (
	"CosmicSailBackend/controllers"
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



	// Init webserver
	app := fiber.New()
	app.Use(cors.New())
	app.Use(middleware.Recover())
	app.Use(middleware.Logger("${time} | ${status} ${method} from ${ip} -> ${path} \n"))


	// Register Routes
	auth := app.Group("/auth")
	auth.Post("/register", controllers.RegisterUser)
	auth.Post("/login", controllers.LoginUser)

	v1 := app.Group("/v1", func(c *fiber.Ctx) {
		// Get Header
		bearer := c.Get("Authorization", "")
		if bearer == "" {
			panic(fiber.NewError(fiber.StatusBadRequest, "No Authorization Header present"))
		}

		// Verify JWT
		payload, err := controllers.VerifyUserJWT(strings.ReplaceAll(bearer, "Bearer ", ""))
		if err != nil {
			panic(fiber.NewError(fiber.StatusForbidden, err.Error()))
		}

		// Add user from db to context
		var user models.User
		models.Db.Where("username = ?", payload.Identifier).First(&user)
		c.Locals("user", user)

		c.Next()
	})
	v1.Post("/boats", controllers.RegisterBoatForUser)
	v1.Get("/boats", controllers.GetAllBoats)

	// Deliver static files
	app.Static("/", "static")

	// Start the server
	panic(app.Listen(os.Getenv("SERVER_PORT")))
}
