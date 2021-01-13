import time
import requests


class DigitalWindSensor():
    name = ""
    prev_state = {}

    wind_data = []

    def __init__(self, name, token):
        self.name = name
        self.token = token

    def get_value(self):
        # TODO
        return None

    def get_name(self):
        return self.name

    def get_wind_direction(self):
        # TODO
        return None

    def get_wind_speed(self):
        # TODO
        return None

    def fetch_wind(self, force):
        # TODO
        # check cool-down
        # (if force) check force cool-down

        # fetch api
        return None

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        return self.get_value(False)