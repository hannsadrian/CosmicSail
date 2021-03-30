from enum import Enum


# mode enum to distinguish between driving with motor and sailing
class AutoPilotMode(Enum):
    MOTOR = 0
    SAIL = 1


class MotorState(Enum):
    LINEAR = 1  # drives to one way-point after the other
    DANGER = 2  # activated when land is too close
    STAY = 3  # stays on point


class SailState(Enum):
    LINEAR = 1  # sails straight to target
    TRACKING = 2  # is tracking the wind as close as possible
    GYBE = 3  # turn maneuver while tracking
    TACK = 4  # EXPERIMENTAL: turn maneuver while tracking
    DANGER = 5
