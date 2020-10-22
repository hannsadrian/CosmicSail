import requests


class IP:
    name = ""

    def __init__(self, name):
        self.name = name

    def get_value(self):
        return requests.get("http://ifconfig.me/ip").text

    def get_name(self):
        return self.name

    def get_meta(self):
        return self.get_value()