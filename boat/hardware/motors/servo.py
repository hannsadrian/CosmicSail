from utils import remap
import math


class ServoMotor:
    state = 0
    name = ""

    def __init__(self, name, channel, minimum, maximum, default):
        self.name = name
        self.channel = channel
        self.max = maximum
        self.min = minimum
        self.default = default

    def set_state(self, val):
        remapped = remap(val, -1, 1, self.min, self.max)
        self.state = remapped
        self.channel.duty_cycle = math.floor(remapped)

    def get_state(self):
        return remap(self.state, self.min, self.max, -1, 1)

    def get_name(self):
        return self.name
