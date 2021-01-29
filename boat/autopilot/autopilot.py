from utility.coordinates import get_point, get_distance, get_bearing
from hardware.motors.servo import ServoMotor
from hardware.sensors.digital_shore import DigitalShoreSensor
from hardware.sensors.bno import BNO
from hardware.sensors.digital_wind import DigitalWindSensor
from hardware.sensors.gps import GpsSensor
from .state import AutopilotMode, MotorState, SailState
from .motor_instructions import execute_motor_mode
import math


class AutoPilot:
    rudder = None
    sail = None
    engine = None

    gps = None
    bno = None
    wind = None
    shore = None

    way_points = []

    running = False

    mode = AutopilotMode.MOTOR
    motor_state = MotorState.LINEAR
    sail_state = SailState.LINEAR

    def __init__(self, mode, rudder: ServoMotor, sail: ServoMotor, engine: ServoMotor, gps: GpsSensor, bno: BNO,
                 wind: DigitalWindSensor, shore: DigitalShoreSensor):
        self.mode = mode
        self.rudder = rudder
        self.sail = sail
        self.engine = engine
        self.gps = gps
        self.bno = bno
        self.wind = wind
        self.shore = shore

    def set_dest(self, lat, lng):
        self.destLat = lat
        self.destLng = lng

    def start_autopilot(self):
        self.running = True

    def stop_autopilot(self):
        self.running = False

    def set_mode(self, mode: AutopilotMode):
        self.mode = mode

    def set_state(self, motor: MotorState = None, sail: SailState = None):
        if motor is not None:
            self.motor_state = motor
        if sail is not None:
            self.sail_state = sail

    def cycle(self):
        if self.mode is AutopilotMode.MOTOR:
            execute_motor_mode(self, self.motor_state, self.rudder, self.sail, self.engine, self.bno.get_heading(),
                               self.gps.get_lat(), self.gps.get_lng(), self.way_points[0]['lat'],
                               self.way_points[0]['lng'], self.shore.shortest_distance)
