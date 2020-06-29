from utils import remap


class ServoMotor:
    state = 0
    name = ""

    def __init__(self, name, pin, minimum, maximum, default):
        self.name = name
        self.pin = pin
        self.max = maximum
        self.min = minimum
        self.default = default
        # TODO: init servo

    def setstate(self, val):
        remapped = remap(val, -1, 1, self.min, self.max)
        self.state = remapped
        print(remapped)

    def getstate(self):
        return remap(self.state, self.min, self.max, -1, 1)

