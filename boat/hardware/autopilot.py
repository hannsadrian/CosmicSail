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
        self.running = False

    def cycle(self):
        ta = get_turning_angle(self.gps.get_bearing(),
                               get_dest_bearing(self.gps.get_lat(), self.gps.get_lng(), self.destLat, self.destLng))
        dist = get_distance(self.gps.get_lat(), self.gps.get_lng(), self.destLat, self.destLng)

        self.rudder.set_state(math.sin(0.5*ta))

        speed = dist/40-1/4
        if dist >= 50:
            speed = 1
        if dist <= 10:
            speed = 0

        self.engine.set_state(speed)



def get_turning_angle(heading, bearing):
    return -(heading-bearing)


def get_dest_bearing(lat1, lng1, lat2, lng2):
    y = math.sin(lng2 - lng1) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(lng2 - lng1)
    return math.atan2(y, x) * 180/math.pi


def get_distance(lat1, lng1, lat2, lng2):
    R = 6371e3
    phi1 = lat1 * math.pi / 180
    phi2 = lat2 * math.pi / 180
    delta_phi = (lat2 - lat1) * math.pi / 180
    delta_lambda = (lng2 - lng1) * math.pi / 180

    a = math.sin(delta_phi / 2) * math.sin(delta_phi / 2) + math.cos(phi1) * math.cos(phi2) * math.sin(
        delta_lambda / 2) * math.sin(delta_lambda / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
