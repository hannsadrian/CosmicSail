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
    print("The connection failed!")


@sio.event
def disconnect():
    print("I'm disconnected!")


def init():
    try:
        sio.connect(os.getenv("SERVER"))
    except socketio.exceptions.ConnectionError:
        time.sleep(2)
        print("Reconnecting...")
        init()


init()
