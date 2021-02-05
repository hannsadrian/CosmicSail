import math


def get_turning_angle(heading, bearing):
    angle = -(heading - bearing)
    angle = (360 + angle if angle < 0 else -360 - angle) if abs(angle) > 180 else angle
    return angle


def get_optimal_rudder_state(angle):
    return math.sin(0.5 * math.radians(angle))
