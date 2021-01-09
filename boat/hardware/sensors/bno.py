from hardware.sensors.adafruit_bno055 import BNO055_I2C
from busio import I2C
from board import SDA, SCL


class BNO:
    name = ""

    def __init__(self, name):
        self.name = name

        i2c = I2C(SCL, SDA)
        self.sensor = BNO055_I2C(i2c)

    def get_value(self):
        euler = self.sensor.euler
        return {"pitch": euler[2], "roll": euler[1], "heading": euler[0],
                "cal_status": self.sensor.calibration_status}

    # TODO
    def get_pitch(self):
        return 0

    # TODO
    def get_roll(self):
        return 0

    # TODO
    def get_yaw(self):
        return 0

    # TODO
    def get_name(self):
        return self.name

    def get_meta(self):
        elr = self.sensor.euler
        euler = [0, 0, 0]
        if not any(map(lambda x: x is None, elr)):
            euler[0] = round(elr[0])
            euler[1] = round(elr[1])
            euler[2] = round(elr[2])
        return {"pitch": euler[2], "roll": euler[1], "heading": euler[0],
                "cal_status": self.sensor.calibration_status, "temp": self.sensor.temperature}
