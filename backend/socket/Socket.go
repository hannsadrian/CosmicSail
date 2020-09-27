package socket

import (
	v1 "CosmicSailBackend/controllers/v1"
	"CosmicSailBackend/models"
	"errors"
	"github.com/googollee/go-socket.io"
	"log"
	"net/http"
	"strings"
)

const boatSuffix = "-boat"
const userSuffix = "-user"

var boatRooms = make(map[string]string)

func StartSocket(port string) {
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}

	registerMethods(server)

	go server.Serve()
	defer server.Close()

	http.Handle("/", corsMiddleware(server))
	log.Println("-> Serving socket at port " + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func registerMethods(server *socketio.Server) {
	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")

		url := s.URL()
		boatEmblem := url.Query().Get("boatEmblem")

		err := ""

		// check connection parameters
		if boatEmblem == "" {
			err = "Boat Emblem Empty"
		} else if url.Query().Get("token") == "" {
			err = "Token Empty"
		}

		payload, jwtErr := v1.VerifyJWT(url.Query().Get("token"))
		if jwtErr != nil {
			err = "Token invalid"
		}
		if payload.Type == "boat" && payload.Identifier != boatEmblem {
			err = "Data invalid"
		}

		// return if error was thrown
		if err != "" {
			_ = s.Close()
			return errors.New(err)
		} else {
			// join right room
			roomName := boatEmblem
			if payload.Type == "boat" {
				roomName += boatSuffix

				models.SetOnline(boatEmblem)
				boatRooms[s.ID()] = boatEmblem
				log.Println("| " + boatEmblem + " connected")
				server.BroadcastToRoom("/", boatEmblem + userSuffix, "online", "true")
			} else if payload.Type == "user" {
				roomName += userSuffix
				log.Println("User connected!")

				if server.RoomLen("/", boatEmblem + boatEmblem) > 0 {
					server.BroadcastToRoom("/", roomName, "online", "true")
				}
			}
			s.Join(roomName)

			return nil
		}
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		emblem := boatRooms[s.ID()]

		if emblem == "" {
			return
		}

		models.SetOffline(emblem)
		log.Println("| " + emblem + " disconnected")
		server.BroadcastToRoom("/", emblem + userSuffix, "online", "false")

		delete(boatRooms, s.ID())
	})

	// ---------------------

	server.OnEvent("/", "command", func(s socketio.Conn, msg string) {
		emblem, isBoat, err := getBoatEmblemFromRooms(s.Rooms())

		if err != nil {
			log.Println(err)
			log.Println("Error while executing command event")
			return
		}

		if !isBoat {
			server.BroadcastToRoom("/", emblem + boatSuffix, "command", msg)
		}
	})

	server.OnEvent("/", "data", func(s socketio.Conn, msg string) {
		emblem, isBoat, err := getBoatEmblemFromRooms(s.Rooms())

		if err != nil {
			log.Println("Error while executing data event")
			return
		}

		if isBoat {
			server.BroadcastToRoom("/", emblem + userSuffix, "data", msg)
		}
	})
}

// getBoatEmblemFromRooms parses a room with either -boat or -user suffix from a room array.
// We need to do this, because Socket.io also joins the client in a room with its own current connection id,
// so we cannot just use the first index of a room array.
func getBoatEmblemFromRooms(rooms []string) (boatEmblem string, isBoat bool, err error) {
	for _, room := range rooms {
		if strings.Contains(room, boatSuffix) {
			isBoat = true
			boatEmblem = strings.ReplaceAll(room, boatSuffix, "")
		} else if strings.Contains(room, userSuffix) {
			isBoat = false
			boatEmblem = strings.ReplaceAll(room, userSuffix, "")
		}
	}

	if boatEmblem == "" {
		return "", false, errors.New("no boatEmblem in room found")
	}

	return
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowHeaders := "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
		allowedOrigins := []string{"localhost:5000", "waterway.cosmicsail.online"}

		if contains(allowedOrigins, r.Header.Get("Origin")) {
			w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
		}
		r.Header.Del("Origin")
		w.Header().Set("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", allowHeaders)

		next.ServeHTTP(w, r)
	})
}

func contains(s []string, search string) bool {
	contains := false
	for entry := range s {
		if strings.Contains(search, s[entry]) {
			contains = true
		}
	}
	return contains
}