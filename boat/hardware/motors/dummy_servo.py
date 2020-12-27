from utils import remap

class DummyServoMotor:
    state = 0
    name = ""

    def __init__(self, name, socket):
        self.name = name
        self.socket = socket

    def set_raw_state(self, raw):
        self.set_state(remap(raw, -1, 1, -1, 1))

    def set_state(self, val):
        self.state = val
        socket.emit("rudder", val)

    def get_state(self):
        return self.state

    def get_name(self):
        return self.name
