import math
from simulation.Vector2D import Vector2D, vector_from_heading


# sail            -> sail value from -1 to 1
# wind_speed      -> in m/s
# wind_direction  -> degrees, direction the wind comes from
# heading         -> degrees
def get_forward_force_by_wind(sail, wind_speed, wind_direction, heading) -> float:
    sail_area = 0.366  # in m**2
    air_density = 1.229  # in kg/m**3

    wind_force = (sail_area ** 2) * (air_density ** 3) * wind_speed ** 2  # results in Newton

    # find smallest possible angle from wind_dir to heading
    gamma = math.radians(360 - abs(wind_direction - heading) if abs(wind_direction - heading) > 180 else abs(
        wind_direction - heading))

    beta = 2 * math.asin(math.sqrt((6 + (sail + 1) * 3) ** 2 - 36) / 21) + 0.08727  # elongation from middle of boat
    if beta > gamma:
        beta = gamma

    # alpha = gamma - beta
    alpha = math.radians(180) - abs(gamma - beta) if abs(gamma - beta) > math.radians(90) else abs(gamma - beta)

    f1 = vector_from_heading(math.degrees(gamma))  # wind vector
    f1 = f1 * wind_force

    f2 = f1 * (1 - alpha * 2 / math.pi)  # force that's "reflected" by the sails
    f3 = vector_from_heading(math.degrees(beta) + 90) * abs(f1 * alpha * 2 / math.pi)  # actual force on the sails
    return f3.x  # this is the forward force on the boat!


def get_point(lat, lng, bearing, distance):
    R = 6371e3
    bearing = math.radians(bearing)

    lat = math.radians(lat)
    lng = math.radians(lng)

    lat2 = math.asin(math.sin(lat) * math.cos(distance / R) +
                     math.cos(lat) * math.sin(distance / R) * math.cos(bearing))

    lng2 = lng + math.atan2(math.sin(bearing) * math.sin(distance / R) * math.cos(lat),
                            math.cos(distance / R) - math.sin(lat) * math.sin(lat2))

    return round(math.degrees(lat2), 6), round(math.degrees(lng2), 6)
