from simulation.Vector2D import Vector2D, vector_from_heading


class Simulation:

    motors = {}
    motor_types = {}
    sensors = {}
    sensor_types = {}

    def __init__(self, motors, motor_types, sensors, sensor_types) -> None:
        self.motors = motors
        self.motor_types = motor_types
        self.sensors = sensors
        self.sensor_types = sensor_types

    def start(self) -> None:
        # TODO: set all hardware into simulation mode

        return None

    def update(self) -> None:


        return None
