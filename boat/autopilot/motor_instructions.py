from .state import MotorState
from .autopilot import AutoPilot
from utility.coordinates import get_bearing, get_distance
from utility.angle_calc import get_turning_angle
from hardware.motors.servo import ServoMotor
from hardware.sensors.digital_shore import ShoreDistance
import math


def execute_motor_mode(autopilot: AutoPilot, state: MotorState, rudder: ServoMotor, sail: ServoMotor,
                       engine: ServoMotor, bearing: float,
                       current_lat: float, current_lng: float, target_lat: float, target_lng: float,
                       shortest_shore_distance: ShoreDistance):
    sail.set_state(1)
    if state is MotorState.LINEAR:
        linear(autopilot, bearing, current_lat, current_lng, target_lat, target_lng, rudder, engine,
               shortest_shore_distance)


def linear(autopilot: AutoPilot, bearing: float, current_lat: float, current_lng: float, target_lat: float,
           target_lng: float, rudder: ServoMotor, engine: ServoMotor, closest_shore: ShoreDistance):
    if closest_shore.dist < 25:
        autopilot.set_state(MotorState.DANGER)
        rudder.set_state(0)
        engine.set_state(0)
        return

    angle = get_turning_angle(bearing, get_bearing(current_lat, current_lng, target_lat, target_lng))
    dist = get_distance(current_lat, current_lng, target_lat, target_lng)

    # TODO: maybe slow down if currently turning?
    rudder.set_state(math.sin(math.pi / 360 * angle))

    speed = dist / 40 - 1 / 4
    if dist >= 50:
        speed = 1
    if dist <= 10:
        speed = 0

    engine.set_state(speed)
