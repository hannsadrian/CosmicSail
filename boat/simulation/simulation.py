import math
from simulation.Vector2D import Vector2D, vector_from_heading
from .boat import get_forward_force_by_wind, get_point


class Simulation:
    motors = {}
    motor_types = {}
    sensors = {}
    sensor_types = {}

    origin_lat = 50.919547
    origin_lng = 13.652643

    position = Vector2D(0, 0)
    rotation = 0

    wind_direction = 90  # degrees
    wind_speed = 10  # m/s

    def __init__(self, motors, motor_types, sensors, sensor_types) -> None:
        self.motors = motors
        self.motor_types = motor_types
        self.sensors = sensors
        self.sensor_types = sensor_types

    def start(self) -> None:
        # TODO: set all hardware into simulation mode

        return None

    def update(self, time_step) -> None:
        f3 = get_forward_force_by_wind(self.motors.__getitem__(self.motor_types.__getitem__('sail')).get_state(),
                                       self.wind_speed, self.wind_direction, self.rotation)

        self.rotation = (self.rotation + self.motors.__getitem__(
            self.motor_types.__getitem__('rudder')).get_state()) % 360

        velocity = vector_from_heading(self.rotation) * f3 * time_step

        self.position = self.position + velocity

        # set sensor state
        self.sensors.__getitem__(self.sensor_types.__getitem__('bno')).set_simulated_heading(self.rotation)
        coords = get_point(self.origin_lat, self.origin_lng, math.atan2(self.position.y, self.position.x),
                           abs(self.position))
        self.sensors.__getitem__(self.sensor_types.__getitem__('gps')).set_simulated_coords(coords[0], coords[1])
