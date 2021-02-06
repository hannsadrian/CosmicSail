import math
from simulation.Vector2D import Vector2D, vector_from_heading
from .boat import get_forward_force_by_wind
from utility.coordinates import get_point, get_distance


class Simulation:
    motors = {}
    motor_types = {}
    sensors = {}
    sensor_types = {}

    origin_lat = 50.919547
    origin_lng = 13.652643

    position = Vector2D(0, 0)
    rotation = 0

    wind_direction = 0  # degrees
    wind_speed = 0  # m/s

    running = False

    def __init__(self, motors, motor_types, sensors, sensor_types) -> None:
        self.motors = motors
        self.motor_types = motor_types
        self.sensors = sensors
        self.sensor_types = sensor_types

    def set_wind(self, direction, speed):
        self.wind_direction = direction
        self.wind_speed = speed
        return

    def reset(self) -> None:
        self.origin_lat = 50.919547
        self.origin_lng = 13.652643
        self.position = Vector2D(0, 0)
        self.rotation = 0
        self.wind_direction = 0  # degrees
        self.wind_speed = 0  # m/s

    def start(self) -> None:
        # potential setup
        return None

    def update(self, time_step) -> None:
        if not self.running:
            return

        f3 = get_forward_force_by_wind(self.motors.__getitem__(self.motor_types.__getitem__('sail')).get_state(),
                                       self.wind_speed, self.wind_direction, self.rotation)

        f_engine = self.motors.__getitem__(self.motor_types.__getitem__('engine')).get_state() * 6

        self.rotation = (self.rotation + self.motors.__getitem__(
            self.motor_types.__getitem__('rudder')).get_state() * 3) % 360

        sail_vector = (vector_from_heading(360 - (self.rotation - 90) % 360) * -f3) * time_step
        engine_vector = (vector_from_heading(360 - (self.rotation - 90) % 360) * f_engine) * time_step

        velocity = sail_vector + engine_vector

        self.position = self.position + velocity

        # set sensor state
        self.sensors.__getitem__(self.sensor_types.__getitem__('bno')).set_simulated_heading(round(self.rotation))
        coords = get_point(self.origin_lat, self.origin_lng, math.degrees(math.atan2(self.position.x, self.position.y)),
                           abs(self.position))
        distance = get_distance(self.sensors.__getitem__(self.sensor_types.__getitem__('gps')).get_lat(),
                                self.sensors.__getitem__(self.sensor_types.__getitem__('gps')).get_lng(),
                                coords[0],
                                coords[1])
        speed = distance / time_step
        self.sensors.__getitem__(self.sensor_types.__getitem__('gps')).set_simulated_coords(coords[0], coords[1])
        self.sensors.__getitem__(self.sensor_types.__getitem__('gps')).set_simulated_speed(speed)
