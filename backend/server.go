package main

import (
	"github.com/gofiber/cors"
	"github.com/gofiber/fiber"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/joho/godotenv"
	"log"
	"os"
	"time"
)

type Boat struct {
	gorm.Model
	BoatId     string `gorm:"type:varchar(5);unique_index"`
	Token      string
	Name       string
	Series     string
	Make       string
	Online     bool
	LastOnline time.Time
}

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("! WARNING ! -> Error while loading .env file")
	} else {
		log.Println("-> Loaded env file")
	}

	// Connect to postgres
	db, err := gorm.Open("postgres",
		"host="+os.Getenv("POSTGRES_HOST")+
		" port="+os.Getenv("POSTGRES_PORT")+
		" user="+os.Getenv("POSTGRES_USER")+
		" dbname="+os.Getenv("POSTGRES_DB")+
		" password="+os.Getenv("POSTGRES_PSWD"))
	if err != nil {
		panic(err)
	} else {
		log.Println("-> Connected to database at " + os.Getenv("POSTGRES_HOST"))
	}
	defer db.Close()
	db.AutoMigrate(&Boat{})

	// Init webserver
	app := fiber.New()
	app.Use(cors.New())

	// Register routes
	app.Get("/v1/boats", func(c *fiber.Ctx) {
		// TODO: Authenticate and only show boats for user
		boats := []Boat{}
		db.Find(&boats)
		c.JSON(boats)
	})

	// Deliver static files
	app.Static("/", "static")

	// Start the server
	panic(app.Listen(os.Getenv("SERVER_PORT")))
}
