from utils import remap
import math


class ServoMotor:
    state = 0
    name = ""

    def __init__(self, name, channel, minimum, maximum, default):
        print(f"Name: {name}, Chan: {channel}, Min: {minimum}, Max {maximum}, Default {default}")
        self.name = name
        self.channel = channel
        self.max = maximum
        self.min = minimum
        self.default = default
        self.set_raw_state(default)

    def set_raw_state(self, raw):
        self.set_state(remap(raw, self.min, self.max, -1, 1))

    def set_state(self, val):
        self.state = val
        remapped = math.floor(remap(val, -1, 1, self.min, self.max))
        self.channel.duty_cycle = remapped

    def get_state(self):
        return self.state

    def get_name(self):
        return self.name
