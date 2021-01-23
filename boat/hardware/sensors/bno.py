from hardware.sensors.lib.adafruit_bno055 import BNO055_I2C
from busio import I2C
from board import SDA, SCL


class BNO:
    name = ""
    prev_state = {}

    simulation = False
    simulated_heading = 0

    def __init__(self, name, simulation):
        self.name = name
        self.simulation = simulation

        i2c = I2C(SCL, SDA)
        self.sensor = BNO055_I2C(i2c)

    def get_value(self):
        return {"pitch": self.get_pitch(), "roll": self.get_roll(), "heading": self.get_heading(),
                "cal_status": self.get_calibration_status()}

    def get_pitch(self):
        elr = self.sensor.euler[2]
        if elr is not None:
            return round(elr)

        return None

    def get_roll(self):
        elr = self.sensor.euler[1]
        if elr is not None:
            return round(elr)

        return None

    def get_heading(self):
        if self.simulation:
            return self.simulated_heading

        elr = self.sensor.euler[0]
        if elr is not None:
            return round(elr)

        return None

    def set_simulated_heading(self, heading):
        if not self.simulation:
            return None

        self.simulated_heading = heading

    def get_calibration_status(self):
        if self.simulation:
            return [2, 2, 2, 2]

        return self.sensor.calibration_status

    def get_name(self):
        return self.name

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        return {"pitch": self.get_pitch(),
                "roll": self.get_roll(),
                "heading": self.get_heading(),
                "cal_status": self.get_calibration_status()}
