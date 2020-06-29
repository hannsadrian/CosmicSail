import socketio
import socketio.exceptions
import time
import os
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

sio = socketio.Client()


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
    except socketio.exceptions.ConnectionError:
        time.sleep(2)
        print("Reconnecting...")
        init()
        return

    while True:
        sio.emit("meta", {'test': 123})
        time.sleep(1)


init()
