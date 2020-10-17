package socket

import (
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

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowHeaders := "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
		allowedOrigins := []string{"localhost:5000", "waterway.cosmicsail.online", "192.168.1.5:5000"}

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