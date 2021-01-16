import arrow
import requests
import math


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


class DigitalWindSensor:
    name = ""
    prev_state = {}

    wind_data = {}

    def __init__(self, name, token):
        self.name = name
        self.token = token

    def get_value(self):
        return {
            "time": self.get_time(),
            "gust": self.get_gust(),
            "direction": self.get_wind_direction(),
            "speed": self.get_wind_speed()
        }

    def get_name(self):
        return self.name

    def get_time(self):
        if 'dt' not in self.wind_data:
            return None
        return arrow.get(self.wind_data['dt']).to('local').timestamp

    # wind direction in degrees
    def get_wind_direction(self):
        if 'wind_deg' not in self.wind_data:
            return None
        return self.wind_data['wind_deg']

    # wind speed in m/s
    def get_wind_speed(self):
        if 'wind_speed' not in self.wind_data:
            return None
        return self.wind_data['wind_speed']

    # wind gusts in m/s
    def get_gust(self):
        if 'wind_gust' not in self.wind_data:
            return None
        return self.wind_data['wind_gust']

    def fetch_wind(self, lat, lng):
        if 'lat' in self.wind_data and get_distance(self.wind_data['lat'], self.wind_data['lng'], lat, lng) < 10:
            return None

        response = requests.get(
            'http://api.openweathermap.org/data/2.5/onecall',
            params={
                'lat': lat,
                'lon': lng,
                'appid': self.token
            }
        )

        self.wind_data = response.json()['current']
        self.wind_data['lat'] = lat
        self.wind_data['lng'] = lng
        return None

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        return self.get_value()
