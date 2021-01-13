from hardware.sensors.lib.adafruit_bno055 import BNO055_I2C
from busio import I2C
from board import SDA, SCL


class BNO:
    name = ""
    prev_state = {}

    def __init__(self, name):
        self.name = name

        i2c = I2C(SCL, SDA)
        self.sensor = BNO055_I2C(i2c)

    def get_value(self):
        euler = self.sensor.euler
        return {"pitch": euler[2], "roll": euler[1], "heading": euler[0],
                "cal_status": self.sensor.calibration_status}

    def get_pitch(self):
        return self.sensor.euler[2]

    def get_roll(self):
        return self.sensor.euler[1]

    def get_heading(self):
        return self.sensor.euler[0]

    def get_name(self):
        return self.name

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        elr = self.sensor.euler
        euler = [0, 0, 0]
        if not any(map(lambda x: x is None, elr)):
            euler[0] = round(elr[0])
            euler[1] = round(elr[1])
            euler[2] = round(elr[2])
        return {"pitch": euler[2], "roll": euler[1], "heading": euler[0],
                "cal_status": self.sensor.calibration_status}
