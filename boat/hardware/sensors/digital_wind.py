import arrow
import requests


class DigitalWindSensor:
    name = ""
    prev_state = {}

    wind_data = [{'gust': {'noaa': 3.04, 'sg': 3.04}, 'time': '2021-01-16T00:00:00+00:00',
                  'windDirection': {'noaa': 285.05, 'sg': 285.05}, 'windSpeed': {'noaa': 2.51, 'sg': 2.51}},
                 {'gust': {'noaa': 4.74, 'sg': 4.74}, 'time': '2021-01-16T01:00:00+00:00',
                  'windDirection': {'noaa': 284.0, 'sg': 284.0}, 'windSpeed': {'noaa': 3.06, 'sg': 3.06}},
                 {'gust': {'noaa': 6.45, 'sg': 6.45}, 'time': '2021-01-16T02:00:00+00:00',
                  'windDirection': {'noaa': 282.94, 'sg': 282.94}, 'windSpeed': {'noaa': 3.6, 'sg': 3.6}},
                 {'gust': {'noaa': 8.15, 'sg': 8.15}, 'time': '2021-01-16T03:00:00+00:00',
                  'windDirection': {'noaa': 281.89, 'sg': 281.89}, 'windSpeed': {'noaa': 4.15, 'sg': 4.15}},
                 {'gust': {'noaa': 7.96, 'sg': 7.96}, 'time': '2021-01-16T04:00:00+00:00',
                  'windDirection': {'noaa': 275.85, 'sg': 275.85}, 'windSpeed': {'noaa': 4.05, 'sg': 4.05}},
                 {'gust': {'noaa': 7.77, 'sg': 7.77}, 'time': '2021-01-16T05:00:00+00:00',
                  'windDirection': {'noaa': 269.8, 'sg': 269.8}, 'windSpeed': {'noaa': 3.95, 'sg': 3.95}},
                 {'gust': {'noaa': 7.57, 'sg': 7.57}, 'time': '2021-01-16T06:00:00+00:00',
                  'windDirection': {'noaa': 263.76, 'sg': 263.76}, 'windSpeed': {'noaa': 3.85, 'sg': 3.85}},
                 {'gust': {'noaa': 7.92, 'sg': 7.92}, 'time': '2021-01-16T07:00:00+00:00',
                  'windDirection': {'noaa': 265.86, 'sg': 265.86}, 'windSpeed': {'noaa': 4.18, 'sg': 4.18}},
                 {'gust': {'noaa': 8.28, 'sg': 8.28}, 'time': '2021-01-16T08:00:00+00:00',
                  'windDirection': {'noaa': 267.97, 'sg': 267.97}, 'windSpeed': {'noaa': 4.5, 'sg': 4.5}},
                 {'gust': {'noaa': 8.63, 'sg': 8.63}, 'time': '2021-01-16T09:00:00+00:00',
                  'windDirection': {'noaa': 270.07, 'sg': 270.07}, 'windSpeed': {'noaa': 4.83, 'sg': 4.83}},
                 {'gust': {'noaa': 8.56, 'sg': 8.56}, 'time': '2021-01-16T10:00:00+00:00',
                  'windDirection': {'noaa': 272.9, 'sg': 272.9}, 'windSpeed': {'noaa': 5.04, 'sg': 5.04}},
                 {'gust': {'noaa': 8.49, 'sg': 8.49}, 'time': '2021-01-16T11:00:00+00:00',
                  'windDirection': {'noaa': 275.73, 'sg': 275.73}, 'windSpeed': {'noaa': 5.24, 'sg': 5.24}},
                 {'gust': {'noaa': 8.42, 'sg': 8.42}, 'time': '2021-01-16T12:00:00+00:00',
                  'windDirection': {'noaa': 278.56, 'sg': 278.56}, 'windSpeed': {'noaa': 5.45, 'sg': 5.45}},
                 {'gust': {'noaa': 8.56, 'sg': 8.56}, 'time': '2021-01-16T13:00:00+00:00',
                  'windDirection': {'noaa': 280.55, 'sg': 280.55}, 'windSpeed': {'noaa': 5.11, 'sg': 5.11}},
                 {'gust': {'noaa': 8.7, 'sg': 8.7}, 'time': '2021-01-16T14:00:00+00:00',
                  'windDirection': {'noaa': 282.55, 'sg': 282.55}, 'windSpeed': {'noaa': 4.76, 'sg': 4.76}},
                 {'gust': {'noaa': 8.84, 'sg': 8.84}, 'time': '2021-01-16T15:00:00+00:00',
                  'windDirection': {'noaa': 284.54, 'sg': 284.54}, 'windSpeed': {'noaa': 4.42, 'sg': 4.42}},
                 {'gust': {'noaa': 8.2, 'sg': 8.2}, 'time': '2021-01-16T16:00:00+00:00',
                  'windDirection': {'noaa': 280.58, 'sg': 280.58}, 'windSpeed': {'noaa': 4.04, 'sg': 4.04}},
                 {'gust': {'noaa': 7.55, 'sg': 7.55}, 'time': '2021-01-16T17:00:00+00:00',
                  'windDirection': {'noaa': 276.63, 'sg': 276.63}, 'windSpeed': {'noaa': 3.67, 'sg': 3.67}},
                 {'gust': {'noaa': 6.91, 'sg': 6.91}, 'time': '2021-01-16T18:00:00+00:00',
                  'windDirection': {'noaa': 272.67, 'sg': 272.67}, 'windSpeed': {'noaa': 3.29, 'sg': 3.29}},
                 {'gust': {'noaa': 7.02, 'sg': 7.02}, 'time': '2021-01-16T19:00:00+00:00',
                  'windDirection': {'noaa': 269.36, 'sg': 269.36}, 'windSpeed': {'noaa': 3.49, 'sg': 3.49}},
                 {'gust': {'noaa': 7.14, 'sg': 7.14}, 'time': '2021-01-16T20:00:00+00:00',
                  'windDirection': {'noaa': 266.04, 'sg': 266.04}, 'windSpeed': {'noaa': 3.7, 'sg': 3.7}},
                 {'gust': {'noaa': 7.26, 'sg': 7.26}, 'time': '2021-01-16T21:00:00+00:00',
                  'windDirection': {'noaa': 262.73, 'sg': 262.73}, 'windSpeed': {'noaa': 3.9, 'sg': 3.9}},
                 {'gust': {'noaa': 6.01, 'sg': 6.01}, 'time': '2021-01-16T22:00:00+00:00',
                  'windDirection': {'noaa': 254.33, 'sg': 254.33}, 'windSpeed': {'noaa': 3.59, 'sg': 3.59}},
                 {'gust': {'noaa': 4.76, 'sg': 4.76}, 'time': '2021-01-16T23:00:00+00:00',
                  'windDirection': {'noaa': 245.93, 'sg': 245.93}, 'windSpeed': {'noaa': 3.28, 'sg': 3.28}}]

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

    def get_current_entry(self):
        hour = arrow.utcnow().floor('hour')
        for i, dic in enumerate(self.wind_data):
            if arrow.get(dic['time']) == hour:
                return dic
        return None

    def get_time(self):
        if not self.get_current_entry():
            return None

        return self.get_current_entry()['time']

    # wind direction in degrees
    def get_wind_direction(self):
        if not self.get_current_entry():
            return None

        wind_dir = self.get_current_entry()['windDirection']
        return sum(wind_dir.values()) / len(wind_dir)

    # wind speed in m/s
    def get_wind_speed(self):
        if not self.get_current_entry():
            return None

        wind_speed = self.get_current_entry()['windSpeed']
        return sum(wind_speed.values()) / len(wind_speed)

    # wind gusts in m/s
    def get_gust(self):
        if not self.get_current_entry():
            return None

        gust = self.get_current_entry()['gust']
        return sum(gust.values()) / len(gust)

    def fetch_wind(self, lat, lng):
        # TODO: check how much coordinates changed

        # fetch api
        start = arrow.now().floor('day')
        end = arrow.now().ceil('day')

        response = requests.get(
            'https://api.stormglass.io/v2/weather/point',
            params={
                'lat': lat,
                'lng': lng,
                'params': ','.join(['gust', 'waveDirection', 'windDirection', 'windSpeed']),
                'start': start.to('UTC').timestamp,  # Convert to UTC timestamp
                'end': end.to('UTC').timestamp  # Convert to UTC timestamp
            },
            headers={
                'Authorization': self.token
            }
        )

        self.wind_data = response.json()['hours']
        return None

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        return self.get_value()
