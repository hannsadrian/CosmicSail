package database

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var Db *gorm.DB

func ConnectDb(connectionString string) (*gorm.DB, error) {
	db, err := gorm.Open("postgres", connectionString)
	Db = db
	return Db, err
}
