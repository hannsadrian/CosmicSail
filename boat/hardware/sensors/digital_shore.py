from utility.coordinates import get_bearing, get_distance, get_point
import requests


def get_points(lat, lng, bearing, alternate, dist):
    p = [get_point(lat, lng, bearing, 25)]

    if dist <= 25:
        p.append(get_point(lat, lng, bearing, 15))
        p.append(get_point(lat, lng, bearing, 35))
    elif alternate:
        p.append(get_point(lat, lng, bearing - 45 % 360, 15))
        p.append(get_point(lat, lng, bearing + 45 % 360, 15))
    else:
        p.append(get_point(lat, lng, bearing, 10))
        p.append(get_point(lat, lng, bearing, 75))

    points = []
    for t in p:
        points.append(', '.join(map(str, t)))

    return points


class ShoreDistance:
    dist = None
    bearing = None
    relative_angle = None

    def __init__(self, dist, bearing, relative_angle):
        self.dist = dist
        self.bearing = bearing
        self.relative_angle = relative_angle

    def to_dict(self):
        return {
            'dist': self.dist,
            'bearing': self.bearing,
            'relative_angle': self.relative_angle
        }


class DigitalShoreSensor:
    name = ""

    straightest_distance = ShoreDistance(None, None, None)
    shortest_distance = ShoreDistance(None, None, None)
    prev_state = {}

    land_data = []

    def __init__(self, name, token):
        self.name = name
        self.token = token

    def get_value(self):
        return self.get_meta()

    def get_name(self):
        return self.name

    def get_shore_dist(self, lat, lng, bearing):
        # sort shore data to get nearest coords
        self.land_data = sorted(self.land_data, key=lambda p: (p['lat'] - lat) ** 2 + (p['lng'] - lng) ** 2)

        smallest_relative_angle = 360
        straightest_distance = {'dist': None, 'bearing': None, 'relative_angle': None}
        shortest_distance = {'dist': None, 'bearing': None, 'relative_angle': None}

        # loop trough nearest 50 land coords
        for point in self.land_data[:50]:
            d = get_distance(lat, lng, point['lat'], point['lng'])
            b = get_bearing(lat, lng, point['lat'], point['lng']) % 360
            relative_angle = round(b - bearing)
            if abs(relative_angle) < smallest_relative_angle and abs(relative_angle) < 20:
                smallest_relative_angle = abs(relative_angle)
                straightest_distance = {'dist': round(d), 'bearing': round(b), 'relative_angle': abs(relative_angle)}
            if shortest_distance['dist'] is None or d < shortest_distance['dist']:
                shortest_distance = {'dist': round(d), 'bearing': round(b), 'relative_angle': abs(relative_angle)}

        self.straightest_distance = ShoreDistance(straightest_distance['dist'], straightest_distance['bearing'],
                                                  straightest_distance['relative_angle'])
        self.shortest_distance = ShoreDistance(shortest_distance['dist'], shortest_distance['bearing'],
                                               shortest_distance['relative_angle'])

        return [self.straightest_distance, self.shortest_distance]

    def fetch_shore(self, lat, lng, bearing, alternate):
        dist = self.get_shore_dist(lat, lng, bearing)[0].dist
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
        return {
            'straight': self.straightest_distance.to_dict(),
            'shortest': self.shortest_distance.to_dict()
        }
