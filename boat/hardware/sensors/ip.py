import requests


class IP:
    name = ""
    ip = "---.---.--.---"

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

    def get_meta(self):
        return self.get_value()