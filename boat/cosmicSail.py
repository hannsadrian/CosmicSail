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

from hardware.motors.servo import ServoMotor
from hardware.sensors.gps import GpsSensor
from hardware.sensors.bandwidth import Bandwidth

# For later compass implementation see: https://dev.to/welldone2094/use-gps-and-magnetometer-for-accurate-heading-4hbi


# environment
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

# socket
sio = socketio.Client()

# PWM Control
i2c_bus = busio.I2C(SCL, SDA)
pca = pca_driver.PCA9685(i2c_bus)
pca.frequency = 24

# boat data
boatData = {}
sensors = {}
motors = {}


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


@sio.event
def connect_error(data):
    set_all_motors(0)
    print(data)


@sio.event
def disconnect():
    print("Disconnected")
    set_all_motors(0)


@sio.event
def command(data):
    command = json.loads(data)
    if command["type"] == "motor":
        motors[command["name"]].set_state(command["value"])


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
    global boatData
    print("Retrieving data from " + os.getenv("BACKEND"))

    # call golang api for hardware loading!
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
        motors.__setitem__(motor['Name'],
                           ServoMotor(motor['Name'], pca.channels[int(motor['Channel']) - 1], float(motor['Min']),
                                      float(motor['Max']), float(motor['Default'])))

    for sensor in boatData['Sensors']:
        if sensor['Type'] == "gps":
            sensors.__setitem__(sensor['Name'], GpsSensor(sensor['Name'], os.getenv("UBLOX_TOKEN"), sensor['Channel']))
        if sensor['Type'] == "bandwidth":
            sensors.__setitem__(sensor['Name'], Bandwidth(sensor['Name']))

    # connect to socket
    connect_socket()

    loop = asyncio.get_event_loop()
    try:
        loop.create_task(meta_loop())
        loop.run_forever()
    except asyncio.CancelledError:
        pass

    except KeyboardInterrupt:
        pca.deinit()
        quit()


def connect_socket():
    try:
        sio.connect(os.getenv("SOCKET") + "?token=" + os.getenv("TOKEN") + "&boatEmblem=" + os.getenv("BOAT_EMBLEM"))
    except socketio.exceptions.ConnectionError:
        time.sleep(2)
        print("Reconnecting...")
        connect_socket()
        return


def set_all_motors(to):
    for motor in motors:
        motors[motor].set_state(to)


async def meta_loop():
    counter = 4  # weird counter logic counting down; starting at 4 to give some time to setup
    while True:
        if counter == 0:
            send_meta(True)
            counter = 100
        else:
            send_meta(False)
        time.sleep(0.2)

        counter -= 1


previous_motor_data = []
previous_sensor_data = []


def send_meta(entire_meta):
    global previous_motor_data, previous_sensor_data

    # check if connected!

    motor_data = []
    sensor_data = []

    for motor in motors:
        motor_data.append({'Name': motors[motor].get_name(), 'State': motors[motor].get_state()})

    for sensor in sensors:
        sensor_data.append({'Name': sensors[sensor].get_name(), 'State': sensors[sensor].get_meta()})

    if previous_motor_data != motor_data or entire_meta:
        previous_motor_data = motor_data
        print(motor_data)
        sio.emit("data", json.dumps({
            'motors': motor_data
        }))

    if previous_sensor_data != sensor_data or entire_meta:
        previous_sensor_data = sensor_data
        print(sensor_data)
        sio.emit("data", sio.emit("data", json.dumps({
            'sensors': sensor_data
        })))


init()
