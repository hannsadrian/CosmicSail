import asyncio
import socketio
import socketio.exceptions
import requests
import time
import os
from os.path import join, dirname
from dotenv import load_dotenv
from board import SCL, SDA
import busio
import adafruit_pca9685 as pca_driver
import json
import subprocess
import sys

from hardware.motors.servo import ServoMotor
from hardware.sensors.gps import GpsSensor
from hardware.sensors.bandwidth import Bandwidth
from hardware.sensors.ip import IP
from hardware.sensors.imu import IMU
from hardware.sensors.bno import BNO
from hardware.sensors.digital_wind import DigitalWindSensor
from hardware.sensors.digital_shore import DigitalShoreSensor
from hardware.autopilot import AutoPilot

# For later compass implementation see: https://dev.to/welldone2094/use-gps-and-magnetometer-for-accurate-heading-4hbi

DEBUG = False

# environment
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

# socket
sio = socketio.Client(request_timeout=1, reconnection_delay=0.5, reconnection_delay_max=1)
simulation = socketio.Client(request_timeout=1, reconnection_delay=0.5, reconnection_delay_max=1)

# PWM Control
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
autopilot = AutoPilot(0, None, None, None, None)


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
    setup = json.loads(data)
    print("Setup!")
    print(data)

    # type=agps name=from config lat=51 lon=13
    if setup['type'] == 'agps':
        sensors[setup['name']].init_agps(setup['lat'], setup['lon'])

    if setup['type'] == 'reload':
        sio.disconnect()
        autopilot.stop_autopilot()
        # TODO: test reloading
        os.execv(sys.executable, ['python3'] + sys.argv)
        quit()

    if setup['type'] == 'shutdown':
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
    global boatData, autopilot
    print("Retrieving data from rudder service on " + os.getenv("BACKEND"))

    # call rudder api for hardware loading!
    # get `/boat/v1/` with Auth Header
    try:
        url = os.getenv("BACKEND") + "/boat/v1/"
        headers = {'Authorization': 'Bearer ' + os.getenv("TOKEN")}

        r = requests.get(url, headers=headers)
        r.raise_for_status()

        # save data locally
        boatData = r.json()
    except requests.HTTPError:
        raise Exception("Access error!")
    except requests.ConnectionError:
        raise Exception("Connection error!")

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
                           ServoMotor(motor['Name'], pca.channels[int(motor['Channel']) - 1], float(motor['Min']),
                                      float(motor['Max']), float(motor['Default']), motor['Type']))

    for sensor in boatData['Sensors']:
        sensorTypes.__setitem__(sensor['Type'], sensor['Name'])
        if sensor['Type'] == "gps":
            sensors.__setitem__(sensor['Name'], GpsSensor(sensor['Name'], os.getenv("UBLOX_TOKEN"), sensor['Channel']))
        if sensor['Type'] == "bandwidth":
            sensors.__setitem__(sensor['Name'], Bandwidth(sensor['Name']))
        if sensor['Type'] == "ip":
            sensors.__setitem__(sensor['Name'], IP(sensor['Name']))
        if sensor['Type'] == "imu":
            sensors.__setitem__(sensor['Name'], IMU(sensor['Name']))
        if sensor['Type'] == "bno":
            sensors.__setitem__(sensor['Name'], BNO(sensor['Name']))
        if sensor['Type'] == "wind":
            sensors.__setitem__(sensor['Name'], DigitalWindSensor(sensor['Name'], os.getenv("OPENWEATHERMAP_TOKEN")))
        if sensor['Type'] == "shore":
            sensors.__setitem__(sensor['Name'], DigitalShoreSensor(sensor['Name'], os.getenv("ONWATER_TOKEN")))

    print(motors)
    print(sensors)

    # load autopilot
    autopilot = AutoPilot(0,
                          motors.__getitem__(motorTypes.__getitem__('rudder')),
                          motors.__getitem__(motorTypes.__getitem__('sail')),
                          motors.__getitem__(motorTypes.__getitem__('engine')),
                          sensors.__getitem__(sensorTypes.__getitem__('gps')))

    connect_socket()

    try:
        asyncio.run(main_loops())
    except asyncio.CancelledError:
        pass

    except KeyboardInterrupt:
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
                         digital_wind_loop())


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
            lat = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lat()
            lng = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lng()
            heading = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_value()['heading']

            if lat is not None or lng is not None and heading is not None:
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
            heading = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_value()['heading']

            if lat is not None or lng is not None and heading is not None:
                sensors.__getitem__(sensorTypes.__getitem__('shore')).get_shore_dist(lat, lng, heading)
        except KeyError:
            pass
        await asyncio.sleep(1)


# fetch wind data
async def digital_wind_loop():
    while True:
        try:
            lat = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lat()
            lng = sensors.__getitem__(sensorTypes.__getitem__('gps')).get_lng()

            if lat is not None or lng is not None:
                sensors.__getitem__(sensorTypes.__getitem__('wind')).fetch_wind(lat, lng)
        except KeyError:
            pass
        await asyncio.sleep(5)


# execute autopilot logic
async def autopilot_loop():
    while True:
        try:
            sensors.__getitem__(sensorTypes.__getitem__('imu')).loop()
        except KeyError:
            pass

        if autopilot.running:
            autopilot.cycle()
        await asyncio.sleep(0.1)


# send metadata over socket
async def meta_loop():
    counter = 4  # weird counter logic counting down; starting at 4 to give some time to setup
    while True:
        if counter == 0:
            send_meta(True)
            counter = 50
        else:
            send_meta(False)
        await asyncio.sleep(0.5)

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
