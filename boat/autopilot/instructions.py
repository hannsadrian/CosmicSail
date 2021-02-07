from autopilot.pilot import AutoPilot
from autopilot.state import MotorState, SailState
from autopilot.waypoint import WayPoint
from hardware.sensors.digital_shore import ShoreDistance
from utility.coordinates import get_point


def danger(autopilot: AutoPilot, current_lat: float, current_lng: float, closest_shore: ShoreDistance):
    rescue_coords = get_point(current_lat, current_lng, closest_shore.bearing - 180 % 360, 30)
    rescue_point = WayPoint(rescue_coords[0], rescue_coords[1])
    rescue_point.danger_point = True

    autopilot.add_immediate_way_point(rescue_point)
    autopilot.set_state(motor=MotorState.LINEAR, sail=SailState.LINEAR)
