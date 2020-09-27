package logic

import (
	"CosmicSailBackend/models"
	"CosmicSailBackend/models/database"
	"errors"
	"github.com/gbrlsnchs/jwt/v3"
	_ "github.com/joho/godotenv/autoload"
	"golang.org/x/crypto/bcrypt"
	"os"
	"time"
)

// JWT Management
type CosmicPayload struct {
	jwt.Payload
	Type       string `json:"type,omitempty"`
	Identifier string `json:"identifier,omitempty"`
}

var hs = jwt.NewHS256([]byte(os.Getenv("JWT_SECRET")))

// Generating JWT
func GetJWTForUser(username string, password string) (string, error) {
	var users []models.User
	database.Db.Where("username = ?", username).Find(&users)
	if len(users) == 0 {
		return "", errors.New("User not found")
	}
	if len(users) > 1 {
		return "", errors.New("Internal Server Error")
	}

	err := bcrypt.CompareHashAndPassword([]byte(users[0].PasswordHash), []byte(password))
	if err != nil {
		return "", errors.New("Password invalid")
	}

	return GetJWT("user", username, true)
}

func GetJWTForBoat(boatEmblem string) (string, error) {
	return GetJWT("boat", boatEmblem, false)
}

func GetJWT(jwtType string, jwtIdentifier string, expires bool) (string, error) {
	now := time.Now()
	expiration := jwt.NumericDate(now.Add(24 * time.Hour))
	if !expires {
		expiration = nil
	}

	pl := CosmicPayload{
		Payload: jwt.Payload{
			Issuer:         "CosmicSail",
			Subject:        jwtIdentifier,
			ExpirationTime: expiration,
			NotBefore:      jwt.NumericDate(now),
			IssuedAt:       jwt.NumericDate(now),
		},
		Type:       jwtType,
		Identifier: jwtIdentifier,
	}

	token, err := jwt.Sign(pl, hs)
	if err != nil {
		return "", errors.New("JWT Error")
	}

	return string(token), nil
}

// Verifying JWT
func VerifyUserJWT(token string) (CosmicPayload, error) {
	payload, err := VerifyJWT(token)
	if err != nil {
		return CosmicPayload{}, err
	}
	if payload.Type != "user" {
		return CosmicPayload{}, errors.New("Insufficient permission")
	}

	return payload, nil
}

func VerifyBoatJWT(token string) (CosmicPayload, error) {
	payload, err := VerifyJWT(token)
	if err != nil {
		return CosmicPayload{}, err
	}
	if payload.Type != "boat" {
		return CosmicPayload{}, errors.New("Insufficient permission")
	}

	return payload, nil
}

func VerifyJWT(token string) (CosmicPayload, error) {
	var payload CosmicPayload
	_, err := jwt.Verify([]byte(token), hs, &payload)
	if err != nil {
		return CosmicPayload{}, err
	}
	if payload.ExpirationTime != nil && payload.ExpirationTime.Unix() < time.Now().Unix() {
		return CosmicPayload{}, errors.New("Token expired")
	}

	return payload, nil
}
