import socketio
import socketio.exceptions
import requests
import time
import os
from os.path import join, dirname
from dotenv import load_dotenv
from board import SCL, SDA
import busio
from adafruit_pca9685 import PCA9685

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
pca = PCA9685(i2c_bus)
pca.frequency = 24

# boat data
boatData = {}
sensors = {}
motors = {}


@sio.event
def connect():
    print("I'm connected!")


@sio.event
def connect_error(data):
    print(data)


@sio.event
def disconnect():
    print("I'm disconnected!")


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
                           ServoMotor(motor['Name'], pca.channels[motor['Channel']], motor['Min'], motor['Max'],
                                      motor['Default']))

    for sensor in boatData['Sensors']:
        if sensor['Type'] == "gps":
            sensors.__setitem__(sensor['Name'], GpsSensor(sensor['Name'], os.getenv("UBLOX_TOKEN"), sensor['Channel']))
        if sensor['Type'] == "bandwidth":
            sensors.__setitem__(sensor['Name'], Bandwidth(sensor['Name']))

    print(motors)
    print(sensors)

    # connect to socket
    connect_socket()

    while True:
        send_meta()
        time.sleep(1)


def connect_socket():
    try:
        print("connection to socket!")
        # sio.connect(os.getenv("SERVER") + "?token=" + os.getenv("TOKEN") + "&boatId=" + os.getenv("BOATID"))

        # rudder = ServoMotor("Rudder", 0, 1500, 3000, 2000, pca)
        # motors.__setitem__("rudder", rudder)
        # sail = ServoMotor("Sail", 1, 2000, 3000, 1500, pca)
        # motors.__setitem__("sail", sail)
        # esc = ServoMotor("Esc", 2, 2250, 2750, 2500, pca)
        # motors.__setitem__("esc", esc)
        #
        # bandwidth = Bandwidth()
        # sensors.__setitem__("bandwidth", bandwidth)
    except socketio.exceptions.ConnectionError:
        time.sleep(2)
        print("Reconnecting...")
        init()
        return


def send_meta():
    # check if connected!

    motor_data = []
    sensor_data = []

    for motor in motors:
        motor_data.append({'Name': motors[motor].get_name(), 'State': motors[motor].get_state()})

    for sensor in sensors:
        sensor_data.append({'Name': sensors[sensor].get_name(), 'State': sensors[sensor].get_meta()})

    print()
    print(motor_data)
    print(sensor_data)
    print()

    sio.emit("meta", {
        'motors': motor_data,
        'sensors': sensor_data
    })


init()
