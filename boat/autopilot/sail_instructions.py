from autopilot.pilot import AutoPilot
from autopilot.state import SailState
from autopilot.waypoint import WayPoint
from hardware.motors.servo import ServoMotor
from hardware.sensors.digital_shore import ShoreDistance
from utility.angle_calc import get_turning_angle, get_optimal_rudder_state
from utility.coordinates import get_bearing, get_distance


def execute_sail_mode(autopilot: AutoPilot, state: SailState, rudder: ServoMotor, sail: ServoMotor,
                      engine: ServoMotor, bearing: float, wind_direction: float, speed: float,
                      current_lat: float, current_lng: float, way_point: WayPoint,
                      straightest_shore_distance: ShoreDistance,
                      shortest_shore_distance: ShoreDistance, way_point_proximity_trend: float):
    angle = get_turning_angle(bearing, way_point.magnetic_bearing(current_lat, current_lng))
    dist = get_distance(current_lat, current_lng, way_point.lat, way_point.lng)
    # angle between heading/bearing and wind
    wind_diff = (bearing - wind_direction)
    boat_gamma = (360 + wind_diff if wind_diff < 0 else -360 - wind_diff) if abs(wind_diff) > 180 else wind_diff
    # angle between turning angle and wind
    gamma = abs(boat_gamma) - angle
    # angle between wind_direction and magnetic bearing of waypoint
    beta = abs(wind_direction - (way_point.magnetic_bearing(current_lat, current_lng) % 360))

    if state is SailState.LINEAR:
        linear(autopilot, rudder, sail, shortest_shore_distance, boat_gamma, beta, angle)
    if state is SailState.TRACKING:
        tracking(autopilot, rudder, sail, straightest_shore_distance, way_point_proximity_trend, boat_gamma, beta,
                 angle, speed)
    if state is SailState.GYBE:
        gybe(autopilot, rudder, sail, boat_gamma)
    if state is SailState.TACK:
        tack(autopilot, rudder, sail, boat_gamma)


def linear(autopilot: AutoPilot, rudder: ServoMotor, sail: ServoMotor, closest_shore: ShoreDistance, boat_gamma: float,
           beta: float, angle: float):
    if abs(beta) < 70:
        autopilot.set_state(sail=SailState.TRACKING)
        return

    rudder.set_state(get_optimal_rudder_state(angle))
    sail.set_state(remap(abs(boat_gamma), 180, 70, 1, -1))

    # TODO: check if shore is too close

    return


def tracking(autopilot: AutoPilot, rudder: ServoMotor, sail: ServoMotor, shore_ahead: ShoreDistance, shore_straight: ShoreDistance,
             way_point_proximity_trend: float, boat_gamma: float, beta: float, angle: float, speed: float):
    if abs(beta) >= 70:
        autopilot.set_state(sail=SailState.LINEAR)
        return

    rudder.set_state(get_optimal_rudder_state(-boat_gamma - 60 if boat_gamma < 0 else -boat_gamma + 60))
    sail.set_state(remap(abs(boat_gamma), 180, 60, 1, -1))

    if way_point_proximity_trend <= -0.25 or (shore_ahead.dist is not None and shore_ahead.dist < 60) or (shore_straight.dist is not None and shore_straight.dist < 20):
        if angle < 0:
            autopilot.turning_direction = -1
        else:
            autopilot.turning_direction = 1

        if speed < 1:
            autopilot.set_state(sail=SailState.TACK)
        else:
            autopilot.set_state(sail=SailState.GYBE)

    return


def gybe(autopilot: AutoPilot, rudder: ServoMotor, sail: ServoMotor, boat_gamma: float):
    sail.set_state(1)
    if abs(boat_gamma) > 70:
        autopilot.set_state(sail=SailState.TRACKING)

    rudder.set_state(autopilot.turning_direction)


def tack(autopilot: AutoPilot, rudder: ServoMotor, sail: ServoMotor, boat_gamma: float):
    sail.set_state(1)
    if abs(boat_gamma) < 50:
        autopilot.set_state(sail=SailState.TRACKING)

    rudder.set_state(-autopilot.turning_direction)


def remap(value, max_input, min_input, max_output, min_output):
    value = max_input if value > max_input else value
    value = min_input if value < min_input else value

    input_span = max_input - min_input
    output_span = max_output - min_output

    scaled_thrust = float(value - min_input) / float(input_span)

    return min_output + (scaled_thrust * output_span)
