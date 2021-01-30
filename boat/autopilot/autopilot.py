from utility.coordinates import get_point, get_distance, get_bearing
from hardware.motors.servo import ServoMotor
from hardware.sensors.digital_shore import DigitalShoreSensor
from hardware.sensors.bno import BNO
from hardware.sensors.digital_wind import DigitalWindSensor
from hardware.sensors.gps import GpsSensor
from .state import AutoPilotMode, MotorState, SailState
from .motor_instructions import execute_motor_mode
import math


class WayPoint:
    lat = 0
    lng = 0

    def __init__(self, lat: float, lng: float):
        self.lat = 0
        self.lng = 0

    def distance(self, from_lat: float, from_lng: float):
        return get_distance(from_lat, from_lng, self.lat, self.lng)

    def magnetic_bearing(self, from_lat: float, from_lng: float):
        return get_bearing(from_lat, from_lng, self.lat, self.lng)


class AutoPilot:
    rudder = None
    sail = None
    engine = None

    gps = None
    bno = None
    wind = None
    shore = None

    way_points: [WayPoint]

    running = False

    mode = AutoPilotMode.MOTOR
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

    def set_way_points(self, way_points: [WayPoint]):
        self.way_points = way_points

    def add_immediate_way_point(self, way_point: WayPoint):
        self.way_points.insert(0, way_point)

    def start_autopilot(self):
        self.running = True

    def stop_autopilot(self):
        self.running = False

    def set_mode(self, mode: AutoPilotMode):
        self.mode = mode

    def set_state(self, motor: MotorState = None, sail: SailState = None):
        if motor is not None:
            self.motor_state = motor
        if sail is not None:
            self.sail_state = sail

    def cycle(self):
        if len(self.way_points) == 0:
            self.set_mode(AutoPilotMode.MOTOR)
            self.set_state(motor=MotorState.STAY)
            self.add_immediate_way_point(WayPoint(self.gps.get_lat(), self.gps.get_lng()))

        if self.mode is AutoPilotMode.MOTOR:
            execute_motor_mode(self, self.motor_state, self.rudder, self.sail, self.engine, self.bno.get_heading(),
                               self.gps.get_lat(), self.gps.get_lng(), self.way_points[0], self.shore.shortest_distance)
