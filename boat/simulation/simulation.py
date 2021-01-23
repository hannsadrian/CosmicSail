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
        sail = 1  # sail value from -1 to 1
        wind_speed = 3  # in m/s
        wind_direction = 270  # degrees
        heading = 0  # degrees

        sail_area = 0.366  # in m**2
        air_density = 1.229  # in kg/m**3

        wind_force = (sail_area ** 2) * (air_density ** 3) * wind_speed ** 2  # results in Newton

        # find smallest possible angle from wind_dir to heading
        gamma = math.radians(360 - abs(wind_direction - heading) if abs(wind_direction - heading) > 180 else abs(
            wind_direction - heading))

        beta = 2 * math.asin(math.sqrt((6 + (sail + 1) * 3) ** 2 - 36) / 21)  # elongation from middle of boat
        if beta > gamma:
            beta = gamma

        # alpha = gamma - beta
        alpha = math.radians(180) - abs(gamma - beta) if abs(gamma - beta) > math.radians(90) else abs(gamma - beta)

        f1 = vector_from_heading(math.degrees(gamma))  # wind vector
        f1 = f1 * wind_force

        f2 = f1 * (1 - alpha * 2 / math.pi)  # force that's "reflected" by the sails
        f3 = vector_from_heading(math.degrees(beta) + 90) * abs(f1 * alpha * 2 / math.pi)  # actual force on the sails
        print("forward force:", abs(f3.x))  # this is the forward force on the boat!

        return None
