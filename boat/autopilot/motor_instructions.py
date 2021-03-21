from autopilot.instructions import danger
from autopilot.state import MotorState
from autopilot.pilot import AutoPilot
from autopilot.waypoint import WayPoint
from utility.coordinates import get_bearing, get_distance, get_point
from utility.angle_calc import get_turning_angle, get_optimal_rudder_state
from hardware.motors.servo import ServoMotor
from hardware.sensors.digital_shore import ShoreDistance
import math


def execute_motor_mode(autopilot: AutoPilot, state: MotorState, rudder: ServoMotor, sail: ServoMotor,
                       engine: ServoMotor, bearing: float,
                       current_lat: float, current_lng: float, way_point: WayPoint,
                       shortest_shore_distance: ShoreDistance, straightest_shore_distance: ShoreDistance,
                       wind_direction: float):
    # turn the sails out to minimize wind impact
    sail.set_state(1)
    if state is MotorState.LINEAR or state is MotorState.STAY:
        # execute linear-state instructions
        linear(autopilot, bearing, current_lat, current_lng, way_point, rudder, engine,
               shortest_shore_distance, straightest_shore_distance, wind_direction,
               False if state is MotorState.LINEAR else True)
    if state is MotorState.DANGER:
        # execute danger-state instructions
        danger(autopilot, current_lat, current_lng, shortest_shore_distance)


def linear(autopilot: AutoPilot, bearing: float, current_lat: float, current_lng: float, way_point: WayPoint,
           rudder: ServoMotor, engine: ServoMotor, closest_shore: ShoreDistance, straightest_shore: ShoreDistance,
           wind_direction: float, stay: bool):
    # check shore proximity
    if ((straightest_shore.dist is not None and straightest_shore.dist < 60) or (
            closest_shore.dist is not None and closest_shore.dist < 20)) and way_point.danger_point is False:
        # activate danger state and try to stop the boat with engine = -1
        autopilot.set_state(motor=MotorState.DANGER)
        rudder.set_state(0)
        engine.set_state(-1)
        return

    # calculate angle from current position and direction to target waypoint
    angle = get_turning_angle(bearing, get_bearing(current_lat, current_lng, way_point.lat, way_point.lng))
    # calculate distance from current position to target waypoint
    dist = get_distance(current_lat, current_lng, way_point.lat, way_point.lng)

    # turn the boat into the wind if state equals stay and the boat is close enough to the target
    if stay is True and dist < 20:
        wind_diff = (bearing - wind_direction)
        boat_gamma = (360 + wind_diff if wind_diff < 0 else -360 - wind_diff) if abs(wind_diff) > 180 else wind_diff
        angle = -boat_gamma

    # turn the rudder to eventually reach the calculated heading/angle
    rudder.set_state(get_optimal_rudder_state(angle))

    # calculate desired motor-speed based on proximity to target waypoint
    speed = dist / 50
    if dist >= 50:
        speed = 1
    if dist <= 0:
        speed = 0

    engine.set_state(speed)
