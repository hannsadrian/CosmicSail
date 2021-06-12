from autopilot.waypoint import WayPoint
from hardware.motors.servo import ServoMotor
from hardware.sensors.digital_shore import DigitalShoreSensor
from hardware.sensors.bno import BNO
from hardware.sensors.digital_wind import DigitalWindSensor
from hardware.sensors.gps import GpsSensor
from autopilot.state import AutoPilotMode, MotorState, SailState


# from autopilot.motor_instructions import execute_motor_mode


class AutoPilot:
    prev_state = {}
    prev_waypoint_dist = 0

    rudder = None
    sail = None
    engine = None

    gps = None
    bno = None
    wind = None
    shore = None

    way_points: [WayPoint] = []
    approach_rate = 0
    last_instruction = ''

    turning_direction = 0

    running = False

    mode = AutoPilotMode.MOTOR
    motor_state = MotorState.LINEAR
    sail_state = SailState.LINEAR

    def __init__(self, mode, rudder: ServoMotor, sail: ServoMotor, engine: ServoMotor, gps: GpsSensor, bno: BNO,
                 wind: DigitalWindSensor, shore: DigitalShoreSensor):
        self.mode = mode
        self.rudder = rudder
        self.sail = sail
        self.engine = engine
        self.gps = gps
        self.bno = bno
        self.wind = wind
        self.shore = shore
        self.mode = AutoPilotMode.MOTOR
        self.motor_state = MotorState.LINEAR
        self.sail_state = SailState.LINEAR

    def reset(self):
        self.set_way_points([])
        self.set_mode(AutoPilotMode.MOTOR)
        self.set_state(motor=MotorState.LINEAR, sail=SailState.LINEAR)

    def set_way_points(self, way_points: [WayPoint]):
        """sets given waypoints for the autopilot"""
        self.way_points = way_points

    def add_immediate_way_point(self, way_point: WayPoint):
        """adds a given way_point to be the next target"""
        self.way_points.insert(0, way_point)

    def start(self):
        """starts execution of the autopilot"""
        self.running = True

    def stop(self):
        """stops execution of the autopilot"""
        self.running = False

    def set_mode(self, mode: AutoPilotMode):
        """modifies the state of the autopilot"""
        self.mode = mode

    def set_state(self, motor: MotorState = None, sail: SailState = None):
        """modifies motor and sail state of the autopilot"""
        if motor is not None:
            self.motor_state = motor
        if sail is not None:
            self.sail_state = sail

    def cycle(self):
        """executes one autopilot iteration"""
        time_step = 1 / 15

        # check gps for availability
        if self.gps.get_lat() is None or self.gps.get_lat() is None or self.bno.get_heading() is None:
            return

        # iterate through waypoints
        if (len(self.way_points) > 0 and self.way_points[0].distance(self.gps.get_lat(), self.gps.get_lng()) < 20) and \
                (self.motor_state is not MotorState.STAY or self.mode is AutoPilotMode.SAIL):
            self.way_points.pop(0)

        # add final waypoint with motor-mode set to stay -> prevents the boat from drifting
        if len(self.way_points) == 0:
            self.set_mode(AutoPilotMode.MOTOR)
            self.set_state(motor=MotorState.STAY)
            self.add_immediate_way_point(
                WayPoint(self.gps.get_lat(), self.gps.get_lng()))

        # calculate relevant autopilot performance data
        waypoint_distance = self.way_points[0].distance(
            self.gps.get_lat(), self.gps.get_lng())
        self.approach_rate = (self.prev_waypoint_dist -
                              waypoint_distance) / time_step
        self.prev_waypoint_dist = waypoint_distance

        if self.mode is AutoPilotMode.MOTOR:
            # execute motor instructions
            from autopilot.motor_instructions import execute_motor_mode
            execute_motor_mode(self, self.motor_state, self.rudder, self.sail, self.engine, self.bno.get_heading(),
                               self.gps.get_lat(), self.gps.get_lng(
            ), self.way_points[0], self.shore.shortest_distance,
                self.shore.straightest_distance, self.wind.get_wind_direction())
        if self.mode is AutoPilotMode.SAIL:
            # execute sailing instructions
            from autopilot.sail_instructions import execute_sail_mode
            execute_sail_mode(self, self.sail_state, self.rudder, self.sail, self.engine, self.bno.get_heading(),
                              self.bno.get_roll(), self.wind.get_wind_direction(), self.gps.get_speed(),
                              self.gps.get_lat(),
                              self.gps.get_lng(
            ), self.way_points[0], self.shore.straightest_distance,
                self.shore.shortest_distance, self.approach_rate)

    def has_changed(self):
        """compares changes in the autopilot telemetry"""
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        """:returns a dictionary with information about the current autopilot state"""
        next_waypoint_dist = "--m"
        if len(self.way_points) > 0 and self.gps.get_lat() is not None and self.gps.get_lng() is not None:
            next_waypoint_dist = str(
                round(self.way_points[0].distance(self.gps.get_lat(), self.gps.get_lng()), 1)) + "m"

        state = "----"
        if self.running and self.mode == AutoPilotMode.MOTOR:
            state = self.motor_state
        if self.running and self.mode == AutoPilotMode.SAIL:
            state = self.sail_state
        if self.gps.get_lat() is None or self.gps.get_lat() is None or self.bno.get_heading() is None:
            state = "No position data!"

        approach_rate = '---m/s'
        if self.running:
            approach_rate = '{0:+}m/s'.format(round(self.approach_rate, 1))

        waypoints = []
        for wp in self.way_points:
            waypoints.append(wp.to_dict())

        return {
            'active': self.running,
            'mission_progress': "--%",
            'next_waypoint_dist': next_waypoint_dist,
            'mode': str(self.mode),
            'state': str(state),
            'approach_rate': approach_rate,
            'way_points': waypoints
        }
