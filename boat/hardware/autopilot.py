import math


# motor mode

# determine direction & distance from current pos to target
# set motor speed accordingly
# turn rudder


class AutoPilot:
    mode = 0
    rudder = None
    sail = None
    engine = None

    gps = None

    destLat = 0
    destLng = 0

    running = False

    def __init__(self, mode, rudder, sail, engine, gps):
        self.mode = mode
        self.rudder = rudder
        self.sail = sail
        self.engine = engine
        self.gps = gps

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
                               get_dest_bearing(self.gps.get_lat(), self.gps.get_lng(), self.destLat, self.destLng))
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


def get_dest_bearing(lat1, lng1, lat2, lng2):
    y = math.sin(lng2 - lng1) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(lng2 - lng1)
    return math.degrees(math.atan2(y, x))


def get_distance(lat1, lng1, lat2, lng2):
    R = 6371e3
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = math.sin(delta_phi / 2) * math.sin(delta_phi / 2) + math.cos(phi1) * math.cos(phi2) * math.sin(
        delta_lambda / 2) * math.sin(delta_lambda / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_point(lat, lng, bearing, distance):
    R = 6371e3
    bearing = math.radians(bearing)

    lat = math.radians(lat)
    lng = math.radians(lng)

    lat2 = math.asin(math.sin(lat) * math.cos(distance / R) +
                     math.cos(lat) * math.sin(distance / R) * math.cos(bearing))

    lng2 = lng + math.atan2(math.sin(bearing) * math.sin(distance / R) * math.cos(lat),
                            math.cos(distance / R) - math.sin(lat) * math.sin(lat2))

    return round(math.degrees(lat2), 6), round(math.degrees(lng2), 6)
