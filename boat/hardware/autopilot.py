from utility.coordinates import get_point, get_distance, get_bearing
import math


class AutoPilot:
    mode = 0
    rudder = None
    sail = None
    engine = None

    gps = None
    bno = None
    wind = None
    shore = None

    destLat = 0
    destLng = 0

    running = False

    def __init__(self, mode, rudder, sail, engine, gps, bno, wind, shore):
        self.mode = mode
        self.rudder = rudder
        self.sail = sail
        self.engine = engine
        self.gps = gps
        self.bno = bno
        self.wind = wind
        self.shore = shore

    def set_dest(self, lat, lng):
        self.destLat = lat
        self.destLng = lng

    def start_autopilot(self):
        self.running = True

    def stop_autopilot(self):
        # TODO: Cancel all running data fetches!
        self.running = False

    def cycle(self):
        ta = get_turning_angle(self.gps.get_bearing(),
                               get_bearing(self.gps.get_lat(), self.gps.get_lng(), self.destLat, self.destLng))
        dist = get_distance(self.gps.get_lat(), self.gps.get_lng(), self.destLat, self.destLng)

        self.rudder.set_state(math.sin(math.pi / 360 * ta))

        speed = dist / 40 - 1 / 4
        if dist >= 50:
            speed = 1
        if dist <= 10:
            speed = 0

        self.engine.set_state(speed)


def get_turning_angle(heading, bearing):
    return -(heading - bearing)
