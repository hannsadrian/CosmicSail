import math
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
        sail_area = 0.366  # in m**2
        air_density = 1.229  # in kg/m**3
        wind_speed = 3  # in m/s
        wind_force = (sail_area ** 2) * (air_density ** 3) * wind_speed ** 2  # results in Newton
        wind_direction = 90  # degrees
        heading = 0  # degrees

        sail = 0.81  # sail value from -1 to 1
        beta = 2 * math.asin(
            math.sqrt((6 + (sail + 1) * 3) ** 2 - 36) / 21)  # degrees of elongation from middle of boat
        # find smallest possible angle from wind_dir to heading
        gamma = math.radians(360 - abs(wind_direction - heading) if abs(wind_direction - heading) > 180 else abs(
            wind_direction - heading))
        alpha = gamma - beta

        f1 = vector_from_heading(math.degrees(gamma))  # wind vector
        f1 = f1 * wind_force

        f3 = vector_from_heading(math.degrees(beta + math.radians(90)) % 360)

        print(math.degrees(alpha))

        f2 = f1 * (1 - alpha * 2 / math.pi)
        f3 = f1 * alpha * 2 / math.pi
        print(f3.y) # this is the forward force on the boat!

        return None
