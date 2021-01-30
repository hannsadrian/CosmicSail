from enum import Enum


class AutoPilotMode(Enum):
    MOTOR = 0
    SAIL = 1


class MotorState(Enum):
    LINEAR = 1  # drives to one way-point after the other
    DANGER = 2  # currently activated when land is too close
    STAY = 3  # stays on point


class SailState(Enum):
    LINEAR = 1  # sails straight to target
    TRACKING = 2  # is tracking the wind as close as possible
    GYBE = 3  # wende
    TACK = 4  # halse
