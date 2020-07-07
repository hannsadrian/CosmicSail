import socketio
import socketio.exceptions
import time
import os
from os.path import join, dirname
from dotenv import load_dotenv

from hardware.motors.servo import ServoMotor
from hardware.sensors.gps import GpsSensor
from hardware.sensors.bandwidth import Bandwidth

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

sio = socketio.Client()

motors = {}
sensors = {}

@sio.event
def connect():
    print("I'm connected!")


@sio.event
def connect_error(data):
    print(data)


@sio.event
def disconnect():
    print("I'm disconnected!")


@sio.event
def instruction(data):
    motor = motors[data['name']]
    if motor is None:
        return
    motor.setstate(data['value'])


def init():
    try:
        sio.connect(os.getenv("SERVER") + "?token=" + os.getenv("TOKEN") + "&boatId=" + os.getenv("BOATID"))

        rudder = ServoMotor("Rudder", 8, 4, 7, 3)
        motors.__setitem__("rudder", rudder)

        gps = GpsSensor()
        sensors.__setitem__("gps", gps)
        bandwidth = Bandwidth()
        sensors.__setitem__("bandwidth", bandwidth)
    except socketio.exceptions.ConnectionError:
        time.sleep(2)
        print("Reconnecting...")
        init()
        return

    while True:
        sendMeta()
        time.sleep(1)



def sendMeta():
    try:
        sio.emit("meta", {
            'gps': sensors["gps"].get_meta(),
            'network': sensors["bandwidth"].get_value()
        })
    except UserWarning as e:
        print(e)


init()
