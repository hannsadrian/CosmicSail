from utils import remap
import math


class ServoMotor:
    state = 0
    name = ""
    type = ""

    prev_state = 0

    def __init__(self, name, channel, minimum, maximum, default, servo_type):
        self.name = name
        self.channel = channel
        self.max = maximum
        self.min = minimum
        self.default = default
        self.type = servo_type
        self.reset()

    def reset(self):
        #print(self.name + " resetting to " + str(self.default))
        self.set_state(self.default)

    def set_raw_state(self, raw):
        self.set_state(remap(raw, self.min, self.max, -1, 1))

    def set_state(self, val):
        self.state = val
        remapped = math.floor(remap(val, -1, 1, self.min, self.max))
        self.channel.duty_cycle = remapped

    def has_changed(self):
        changed = self.state != self.prev_state
        self.prev_state = self.state

        return changed

    def get_state(self):
        return self.state

    def get_name(self):
        return self.name
