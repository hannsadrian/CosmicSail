import requests
import math


def get_bearing(lat1, lng1, lat2, lng2):
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


def get_points(lat, lng, bearing, alternate, dist):

    p = []
    p.append(get_point(lat, lng, bearing, 25))
    if dist <= 25:
        p.append(get_point(lat, lng, bearing, 5))
        p.append(get_point(lat, lng, bearing, 15))
    elif alternate:
        p.append(get_point(lat, lng, bearing-45 % 360, 15))
        p.append(get_point(lat, lng, bearing+45 % 360, 15))
    else:
        p.append(get_point(lat, lng, bearing, 35))
        p.append(get_point(lat, lng, bearing, 50))
    
    points = []
    for t in p:
        points.append(', '.join(map(str, t)))

    return points


class DigitalShoreSensor:
    name = ""

    prev_state = {}
    distances = [] # all detected land points, structured like nearest distance

    land_data = []

    def __init__(self, name, token):
        self.name = name
        self.token = token

    def get_value(self):
        return {
        }

    def get_name(self):
        return self.name

    def get_shore_dist(self, lat, lng, bearing):
        # sort shore data to get nearest coords
        self.land_data = sorted(self.land_data, key = lambda p: (p['lat'] - lat)**2 + (p['lng'] - lng)**2)

        smallestRelativeAngle = 360
        straightest_distance = {'dist': None, 'bearing': None}
        shortest_distance = {'dist': None, 'bearing': None}

        # loop trough first 50 land coords
        for point in self.land_data[:50]:
            d = get_distance(lat, lng, point['lat'], point['lng'])
            b = get_bearing(lat, lng, point['lat'], point['lng'])%360
            relativeAngle = round(b - bearing)
            if abs(relativeAngle) < smallestRelativeAngle:
                smallestRelativeAngle = abs(relativeAngle)
                straightest_distance = {'dist': d, 'bearing': b}
            if shortest_distance['dist'] is None or d < shortest_distance['dist']:
                shortest_distance = {'dist': d, 'bearing': b}

        return {
            'straight': straightest_distance,
            'shortest': shortest_distance
        }

    def fetch_shore(self, lat, lng, bearing, alternate):
        dist = self.get_shore_dist(lat, lng, bearing)['straight']['dist']
        if dist is None:
            dist = 100

        response = requests.post(
            'https://api.onwater.io/api/v1/results',
            params={
                'access_token': self.token
            },
            data=str(get_points(lat, lng, bearing, alternate, dist)).replace("'", '"')
        )

        try:
            for res in response.json():
                if 'water' not in res or 'lat' not in res or 'lon' not in res:
                    continue

                entry = {'lat': res['lat'], 'lng': res['lon']}

                if not res['water'] and entry not in self.land_data:
                    self.land_data.append(entry)
        except Exception:
            pass

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        return self.get_value()

