import requests


class IP:
    name = ""
    ip = "---.---.--.---"

    prev_state = "---.---.--.---"

    def __init__(self, name):
        self.name = name
        try:
            self.ip = requests.get("http://ifconfig.me/ip").text
        finally:
            return

    def get_value(self):
        return self.ip

    def get_name(self):
        return self.name

    def has_changed(self):
        """compares changes in the ip address for telemetry purposes"""
        changed = self.get_value() != self.prev_state
        self.prev_state = self.get_value()

        return changed

    def get_change(self):
        return self.get_value()

    def get_meta(self):
        return self.get_value()
