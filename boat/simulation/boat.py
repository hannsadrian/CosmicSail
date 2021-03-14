import math
from simulation.Vector2D import Vector2D, vector_from_heading
from utility.coordinates import get_point, get_distance


# sail            -> sail value from -1 to 1
# wind_speed      -> in m/s
# wind_direction  -> degrees, direction the wind comes from
# heading         -> degrees
def get_forward_force_by_wind(sail, wind_speed, wind_direction, heading) -> float:
    sail_area = 0.366  # in m**2
    air_density = 1.225  # in kg/m**3

    wind_force = sail_area * (1/2 * air_density) * wind_speed**2  # results in Newton

    # smallest possible angle/difference from wind_dir to heading
    gamma = math.radians(360 - abs(wind_direction - heading) if abs(wind_direction - heading) > 180 else abs(
        wind_direction - heading))

    min_sheet_len = 6
    max_sheet_len = 12
    boom_height = 4
    boom_len = 21
    # 2 * asin(sqrt(c^2-b^2)/21)
    # calculate elongation from middle of boat with minimal offset
    # -> the sail is never straight over the middle of the boat, as this calculation proposes without offset
    # latex: \beta = 2\arcsin{\frac{\sqrt{(a + \frac{(x + 1)}{2} * (q-a))^2 - a^2}}{2b}} + 0.17453
    beta = 2 * math.asin(math.sqrt((min_sheet_len + ((sail + 1)/2) * (max_sheet_len - min_sheet_len)) ** 2 - boom_height ** 2) / (2 * boom_len)) + 0.17453
    # if the sail elongation is greater than the wind, simulate sail flutter in the wind
    if beta > gamma:
        beta = gamma

    # alpha = gamma - beta
    alpha = math.radians(180) - abs(gamma - beta) if abs(gamma - beta) > math.radians(90) else abs(gamma - beta)

    f1 = vector_from_heading(math.degrees(gamma))  # wind vector
    # multiply directional vector with wind force
    f1 = f1 * wind_force

    f2 = f1 * (1 - alpha * 2 / math.pi)  # force that's "reflected" by the sails
    f3 = vector_from_heading(math.degrees(beta) + 90) * abs(f1 * alpha * 2 / math.pi)  # actual force on the sails
    return f3.x  # this is the forward force on the boat!
