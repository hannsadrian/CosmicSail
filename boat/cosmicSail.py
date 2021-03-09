import asyncio
import socketio
import socketio.exceptions
import requests
import time
import os
from os.path import join, dirname
from dotenv import load_dotenv

from autopilot.state import AutoPilotMode, MotorState, SailState
from hardware.motors.servo import ServoMotor
from hardware.sensors.gps import GpsSensor
from hardware.sensors.bandwidth import Bandwidth
from hardware.sensors.ip import IP
# from hardware.sensors.imu import IMU
from hardware.sensors.bno import BNO
from hardware.sensors.digital_wind import DigitalWindSensor
from hardware.sensors.digital_shore import DigitalShoreSensor
from autopilot.waypoint import WayPoint
from simulation.simulation import Simulation
from autopilot.pilot import AutoPilot

import json
import subprocess
import sys

# environment
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

SIMULATION = True if os.getenv("SIMULATION") == 'True' else False

if SIMULATION is False:
    from board import SCL, SDA
    import busio
    import adafruit_pca9685 as pca_driver

meta_interval = 1 / 3
if SIMULATION:
    print('SIMULATION ACTIVE')
    meta_interval = 1 / 5

# socket
sio = socketio.Client(request_timeout=1, reconnection_delay=0.5, reconnection_delay_max=1)

# PWM Control
if SIMULATION is False:
    i2c_bus = busio.I2C(SCL, SDA)
    pca = pca_driver.PCA9685(i2c_bus)
    pca.frequency = 24

# boat data
boatData = {}
sensors = {}
sensorTypes = {}
motors = {}
motorTypes = {}

# autopilot
autopilot: AutoPilot

# simulation
simulation = Simulation({}, {}, {}, {})


async def internet_check():
    try:
        t = requests.get('https://rudder.cosmicsail.online', timeout=3).text
    except requests.exceptions.Timeout:
        # print("timeout!")
        reset_all_motors()
        return False
    except requests.exceptions.ConnectionError:
        print("connection error!")
        reset_all_motors()
        return False
    finally:
        return True


@sio.event
def connect():
    print("Connected")
    set_all_motors(1)
    time.sleep(0.7)
    set_all_motors(0)
    time.sleep(0.7)
    set_all_motors(-1)
    time.sleep(0.7)
    set_all_motors(0)
    time.sleep(0.7)
    reset_all_motors()


@sio.event
def connect_error(data):
    reset_all_motors()
    print(data)


@sio.event
def disconnect():
    print("Disconnected")
    reset_all_motors()


@sio.event
def command(data):
    command = json.loads(data)
    if command["type"] == "motor":
        motors[command["name"]].set_state(command["value"])
    elif command["type"] == "full_meta":
        send_meta(True)


@sio.event
def setup(data):
    payload = json.loads(data)

    if payload['type'] == 'toggle_sim' and SIMULATION is True:
        simulation.running = not simulation.running

    if payload['type'] == 'sim_wind_dir' and SIMULATION is True:
        try:
            sensors.__getitem__(sensorTypes.__getitem__('wind')).debug = True
            sensors.__getitem__(sensorTypes.__getitem__('wind')).debug_wind_dir = float(payload['wind_dir'])
        except:
            sensors.__getitem__(sensorTypes.__getitem__('wind')).debug = False
            pass

    if payload['type'] == 'sim_wind_speed' and SIMULATION is True:
        try:
            sensors.__getitem__(sensorTypes.__getitem__('wind')).debug = True
            sensors.__getitem__(sensorTypes.__getitem__('wind')).debug_wind_speed = float(payload['wind_speed'])
        except:
            sensors.__getitem__(sensorTypes.__getitem__('wind')).debug = False
            pass

    if payload['type'] == 'sim_origin' and SIMULATION is True:
        try:
            simulation.origin_lat = float(payload['lat'])
            simulation.origin_lng = float(payload['lng'])
        except:
            pass

    if payload['type'] == 'autopilot_start':
        autopilot.start()

    if payload['type'] == 'autopilot_stop':
        autopilot.stop()

    if payload['type'] == 'autopilot_reset':
        try:
            if SIMULATION:
                simulation.reset()
                sensors.__getitem__(sensorTypes.__getitem__('wind')).debug = False
            autopilot.reset()
        except:
            pass

    if payload['type'] == 'tack' and autopilot.running:
        autopilot.turning_direction = 0
        autopilot.set_state(sail=SailState.TACK)
    if payload['type'] == 'gybe' and autopilot.running:
        autopilot.turning_direction = 0
        autopilot.set_state(sail=SailState.GYBE)

    if payload['type'] == 'autopilot_mode':
        autopilot.set_mode(AutoPilotMode.MOTOR if autopilot.mode is AutoPilotMode.SAIL else AutoPilotMode.SAIL)

    if payload['type'] == 'autopilot_state':
        if payload['state'] == 'linear_motor':
            autopilot.set_state(motor=MotorState.LINEAR)
        if payload['state'] == 'stay_motor':
            autopilot.set_state(motor=MotorState.STAY)

    if payload['type'] == 'autopilot_waypoints':
        way_points = []
        if isinstance(payload['waypoints'], list):
            points = sorted(payload['waypoints'], key=lambda k: k['index'])
            for point in points:
                if 'lat' in point and 'lng' in point:
                    way_points.append(WayPoint(point['lat'], point['lng']))
        else:
            print("Way Points not valid!")
            return

        autopilot.set_way_points(way_points)

    # type=agps name=from config lat=51 lon=13
    if payload['type'] == 'agps' and not SIMULATION:
        sensors[payload['name']].init_agps(payload['lat'], payload['lon'])

    if payload['type'] == 'reload':
        print("Reloading...")
        sio.disconnect()
        autopilot.stop()
        os.execv(sys.executable, ['python3'] + sys.argv)
        quit()

    if payload['type'] == 'shutdown' and not SIMULATION:
        print("Shutdown!")
        subprocess.run("sudo shutdown now", shell=True, check=True)


# @sio.event
# def instruction(data):
#     if "setup_" in data['name']:
#         if "agps" in data['name']:
#             gps = GpsSensor(os.getenv("UBLOX_TOKEN"), os.getenv("PORT"), data['lat'], data['lon'])
#             sensors.__setitem__("gps", gps)
#         return
#
#     motor = motors[data['name']]
#     if motor is None:
#         return
#     motor.setstate(data['value'])


def init():
    global boatData, autopilot, simulation
    print("Retrieving data from rudder service on " + os.getenv("BACKEND"))

    connected = False

    while not connected:
        # call rudder api for hardware loading!
        # get `/boat/v1/` with Auth Header
        try:
            url = os.getenv("BACKEND") + "/boat/v1/"
            headers = {'Authorization': 'Bearer ' + os.getenv("TOKEN")}

            r = requests.get(url, headers=headers)
            r.raise_for_status()

            # save data locally
            boatData = r.json()
            connected = True
        except requests.HTTPError:
            raise Exception("Access error!")
        except requests.ConnectionError:
            print("Couldn't connect, retrying!")
            connected = False
            time.sleep(1)

    if not boatData:
        raise Exception("No boat data!")

    # ultra long & fancy console spam
    print("\n" +
          "╔═╗┌─┐┌─┐┌┬┐┬┌─┐╔═╗┌─┐┬┬  \n" +
          "║  │ │└─┐│││││  ╚═╗├─┤││  \n" +
          "╚═╝└─┘└─┘┴ ┴┴└─┘╚═╝┴ ┴┴┴─┘")
    print(f" | {boatData['BoatEmblem']}")
    print(f" | {boatData['Series']}, {boatData['Make']}")
    print(f" | {len(boatData['Motors'])} Motor(s)")
    print(f" | {len(boatData['Sensors'])} Sensor(s)")
    print()

    # load hardware
    # ⚠ We are currently ignoring per-motor-pwm-cycle from config ⚠
    for motor in boatData['Motors']:
        motorTypes.__setitem__(motor['Type'], motor['Name'])
        motors.__setitem__(motor['Name'],
                           ServoMotor(motor['Name'],
                                      pca.channels[int(motor['Channel']) - 1] if SIMULATION is False else None,
                                      float(motor['Min']),
                                      float(motor['Max']), float(motor['Default']), motor['Type']))

    for sensor in boatData['Sensors']:
        sensorTypes.__setitem__(sensor['Type'], sensor['Name'])
        if sensor['Type'] == "gps":
            sensors.__setitem__(sensor['Name'],
                                GpsSensor(sensor['Name'], os.getenv("UBLOX_TOKEN"), sensor['Channel'], SIMULATION))
        if sensor['Type'] == "bandwidth":
            sensors.__setitem__(sensor['Name'], Bandwidth(sensor['Name']))
        if sensor['Type'] == "ip":
            sensors.__setitem__(sensor['Name'], IP(sensor['Name']))
        # if sensor['Type'] == "imu":
        #     sensors.__setitem__(sensor['Name'], IMU(sensor['Name']))
        if sensor['Type'] == "bno":
            sensors.__setitem__(sensor['Name'], BNO(sensor['Name'], SIMULATION))
        if sensor['Type'] == "wind":
            sensors.__setitem__(sensor['Name'], DigitalWindSensor(sensor['Name'], os.getenv("OPENWEATHERMAP_TOKEN")))
        if sensor['Type'] == "shore":
            sensors.__setitem__(sensor['Name'], DigitalShoreSensor(sensor['Name'], os.getenv("ONWATER_TOKEN")))

    # load autopilot
    autopilot = AutoPilot(0,
                          motors.__getitem__(motorTypes.__getitem__('rudder')),
                          motors.__getitem__(motorTypes.__getitem__('sail')),
                          motors.__getitem__(motorTypes.__getitem__('engine')),
                          sensors.__getitem__(sensorTypes.__getitem__('gps')),
                          sensors.__getitem__(sensorTypes.__getitem__('bno')),
                          sensors.__getitem__(sensorTypes.__getitem__('wind')),
                          sensors.__getitem__(sensorTypes.__getitem__('shore')))

    if SIMULATION:
        simulation = Simulation(motors, motorTypes, sensors, sensorTypes)

    connect_socket()

    try:
        asyncio.run(main_loops())
    except asyncio.CancelledError:
        pass

    except KeyboardInterrupt:
        if SIMULATION is False:
            pca.deinit()
        quit()


def connect_socket():
    try:
        sio.connect(os.getenv("SOCKET") + "?token=" + os.getenv("TOKEN") + "&boatEmblem=" + os.getenv("BOAT_EMBLEM"), )
    except socketio.exceptions.ConnectionError:
        time.sleep(2)
        print("Reconnecting...")
        connect_socket()
        return


def set_all_motors(to):
    for motor in motors:
        motors[motor].set_state(to)


def reset_all_motors():
    for motor in motors:
        motors[motor].reset()


async def main_loops():
    # register services mandatory for running the boat
    await asyncio.gather(internet_loop(), meta_loop(), autopilot_loop(), digital_shore_loop(), shore_api_loop(),
                         digital_wind_loop(), simulation_loop())


async def simulation_loop():
    if not SIMULATION:
        return

    simulation.start()

    while True:
        # run simulation at 15 Hz
        simulation.update(1 / 15)
        await asyncio.sleep(1 / 15)


# check if the rudder service is reachable to react to outages quickly
async def internet_loop():
    while True:
        await internet_check()
        await asyncio.sleep(3)


# fetches shore data every 5 seconds
async def shore_api_loop():
    alternate = False
    while True:
        try:
            # get location information
            lat = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lat()
            lng = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lng()
            heading = sensors.__getitem__(sensorTypes.__getitem__('bno')).get_heading()

            if (lat is not None or lng is not None and heading is not None) and \
                    (simulation.running is True or SIMULATION is False):
                # fetch shore-data from api
                sensors.__getitem__(sensorTypes.__getitem__('shore')).fetch_shore(lat, lng, heading, alternate)
                alternate = not alternate
        except KeyError:
            pass
        await asyncio.sleep(5)


# checks shore distance based on existing land data
async def digital_shore_loop():
    while True:
        try:
            lat = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lat()
            lng = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lng()
            heading = sensors.__getitem__(sensorTypes.__getitem__('bno')).get_heading()

            if lat is not None or lng is not None and heading is not None:
                sensors.__getitem__(sensorTypes.__getitem__('shore')).get_meta()
                sensors.__getitem__(sensorTypes.__getitem__('shore')).get_shore_dist(lat, lng, heading)
        except KeyError:
            pass
        await asyncio.sleep(0.5)


# fetch wind data
async def digital_wind_loop():
    while True:
        try:
            lat = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lat()
            lng = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lng()

            if (lat is not None or lng is not None) and (simulation.running is True or SIMULATION is False):
                sensors.__getitem__(sensorTypes.__getitem__('wind')).fetch_wind(lat, lng)
                simulation.set_wind(sensors.__getitem__(sensorTypes.__getitem__('wind')).get_value()['direction'],
                                    sensors.__getitem__(sensorTypes.__getitem__('wind')).get_value()['speed'])
        except KeyError:
            pass
        await asyncio.sleep(15)


# execute autopilot logic
async def autopilot_loop():
    while True:
        if autopilot.running:
            autopilot.cycle()
        await asyncio.sleep(1 / 15)


# send metadata over socket
async def meta_loop():
    counter = 4  # weird counter logic counting down; starting at 4 to give some time to setup
    while True:
        if counter == 0:
            send_meta(True)
            counter = 50
        else:
            send_meta(False)
        await asyncio.sleep(meta_interval)

        counter -= 1


previous_motor_data = []
previous_sensor_data = []


def send_meta(entire_meta):
    global previous_motor_data, previous_sensor_data

    # check if connected!

    motor_data = []
    sensor_data = []

    for motor in motors:
        if entire_meta or motors[motor].has_changed():
            motor_data.append({'Name': motors[motor].get_name(), 'State': motors[motor].get_state()})

    for sensor in sensors:
        if entire_meta or sensors[sensor].has_changed():
            sensor_data.append({'Name': sensors[sensor].get_name(), 'State': sensors[sensor].get_meta()})

    # autopilot
    if entire_meta or autopilot.has_changed():
        sensor_data.append({'Name': 'autopilot', 'State': autopilot.get_meta()})

    if entire_meta:
        sensor_data.append({'Name': 'simulated', 'State': SIMULATION})
        sensor_data.append({'Name': 'simulation', 'State': simulation.running})

    if len(motor_data) != 0:
        sio.emit("data", json.dumps({
            'full': entire_meta,
            'motors': motor_data
        }))

    if len(sensor_data) != 0:
        sio.emit("data", sio.emit("data", json.dumps({
            'full': entire_meta,
            'sensors': sensor_data
        })))


init()
