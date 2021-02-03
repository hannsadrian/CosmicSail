from autopilot.state import MotorState
from autopilot.pilot import AutoPilot
from autopilot.waypoint import WayPoint
from utility.coordinates import get_bearing, get_distance, get_point
from utility.angle_calc import get_turning_angle
from hardware.motors.servo import ServoMotor
from hardware.sensors.digital_shore import ShoreDistance
import math


def execute_motor_mode(autopilot: AutoPilot, state: MotorState, rudder: ServoMotor, sail: ServoMotor,
                       engine: ServoMotor, bearing: float,
                       current_lat: float, current_lng: float, way_point: WayPoint,
                       shortest_shore_distance: ShoreDistance):
    sail.set_state(1)
    if state is MotorState.LINEAR:
        linear(autopilot, bearing, current_lat, current_lng, way_point, rudder, engine,
               shortest_shore_distance)
    if state is MotorState.DANGER:
        danger(autopilot, current_lat, current_lng, shortest_shore_distance)


def linear(autopilot: AutoPilot, bearing: float, current_lat: float, current_lng: float, way_point: WayPoint,
           rudder: ServoMotor, engine: ServoMotor, closest_shore: ShoreDistance):
    if closest_shore.dist is not None and closest_shore.dist < 25:
        autopilot.set_state(motor=MotorState.DANGER)
        rudder.set_state(0)
        engine.set_state(0)
        return

    angle = get_turning_angle(bearing, get_bearing(current_lat, current_lng, way_point.lat, way_point.lng))
    dist = get_distance(current_lat, current_lng, way_point.lat, way_point.lng)

    # TODO: maybe slow down if currently turning?
    rudder.set_state(math.sin(math.pi / 360 * angle))

    speed = dist / 10
    if dist >= 10:
        speed = 1
    if dist <= 0:
        speed = 0

    engine.set_state(speed)


def danger(autopilot: AutoPilot, current_lat: float, current_lng: float, closest_shore: ShoreDistance):
    rescue_point = get_point(current_lat, current_lng, closest_shore.bearing - 180 % 360, 30)

    autopilot.add_immediate_way_point(WayPoint(rescue_point[0], rescue_point[1]))
    autopilot.set_state(motor=MotorState.LINEAR)
