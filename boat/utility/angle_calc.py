import math


def get_turning_angle(heading, bearing):
    """calculates the steering angle based from current heading to the desired bearing, which is relative to the
    magnetic north"""
    angle = -(heading - bearing)
    angle = (360 + angle if angle < 0 else -360 - angle) if abs(angle) > 180 else angle
    return angle


def get_optimal_rudder_state(angle):
    """calculate desired rudder state for a given steering angle"""
    return math.sin(0.5 * math.radians(angle))
