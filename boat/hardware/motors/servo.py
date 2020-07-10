from utils import remap
import math


class ServoMotor:
    state = 0
    name = ""

    def __init__(self, name, channel, minimum, maximum, default, pca):
        self.name = name
        self.channel = channel
        self.max = maximum
        self.min = minimum
        self.default = default
        self.pca = pca

    def setstate(self, val):
        remapped = remap(val, -1, 1, self.min, self.max)
        self.state = remapped
        self.pca.channels[self.channel].duty_cycle = math.floor(remapped)

    def getstate(self):
        return remap(self.state, self.min, self.max, -1, 1)

