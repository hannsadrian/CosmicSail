import requests
import math


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

    straight_distance = None
    diagonal_distance = None

    land_data = []

    def __init__(self, name, token):
        self.name = name
        self.token = token

    def get_value(self):
        return {
        }

    def get_name(self):
        return self.name

    def fetch_shore(self, lat, lng, bearing, alternate):
        dist = 100
        if self.straight_distance is not None:
            dist = self.straight_distance

        print(str(get_points(lat, lng, bearing, alternate, dist)).replace("'", '"'))

        response = requests.post(
            'https://api.onwater.io/api/v1/results',
            params={
                'access_token': self.token
            },
            data=str(get_points(lat, lng, bearing, alternate, dist)).replace("'", '"')
        )

        for res in response.json():
            if 'water' not in res or 'lat' not in res or 'lon' not in res:
                continue

            if not res['water']:
                self.land_data.append({'lat': res['lat'], 'lng': res['lon']})
        
        return None

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        return self.get_value()

