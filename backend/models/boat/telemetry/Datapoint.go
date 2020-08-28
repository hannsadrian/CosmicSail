package telemetry

import "time"

type Datapoint struct {
	TripID    uint
	Timestamp time.Time
	Data      string
}
