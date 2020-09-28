from . import gpsd
import time
import requests
import serial
import subprocess

# https://github.com/MartijnBraam/gpsd-py3/blob/master/DOCS.md
class GpsSensor():
    name = ""

    def __init__(self, name, token, port):
        self.name = name
        #subprocess.run("sudo service gpsd start", shell=True, check=True)
        self.token = token
        self.port = port
        #self.get_agps(lat, lon)
        gpsd.connect()

    def init_agps(self, lat, lon):
        print("Stopping GPSD for AGPS")
        subprocess.run("sudo service gpsd stop", shell=True, check=True)
        time.sleep(2)

        token = self.token
        comPort = self.port
        r = requests.get(
            "http://online-live1.services.u-blox.com/GetOnlineData.ashx?token=" + token + ";lat="+str(lat)+";lon="+str(lon)+";gnss=gps;datatype=eph,alm,aux,pos;format=aid;",
            stream=True)

        ser = serial.Serial(comPort, 9600)
        drainer = True
        while drainer:
            drainer = ser.inWaiting()
            ser.read(drainer)

        ser.write(r.content)

        ser.close()
        subprocess.run("sudo service gpsd start", shell=True, check=True)
        print("Uploaded AGPS Data!")

    def get_value(self):
        try:
            return gpsd.get_current()
        except Exception:
            return None

    def get_device(self):
        return gpsd.device()

    def get_name(self):
        return self.name

    def get_meta(self):
        current_gps_data = self.get_value()
        if current_gps_data is None:
            return None
        position = None
        speed = None
        precision = None
        heading = None
        error = None
        altitude = None
        mode = current_gps_data.mode
        sats = current_gps_data.sats
        if current_gps_data.mode > 1:
            position = current_gps_data.position()
            speed = current_gps_data.hspeed
            precision = current_gps_data.position_precision()
            heading = current_gps_data.track
            error = current_gps_data.error

        if current_gps_data.mode > 2:
            altitude = current_gps_data.altitude()

        return {
            'mode': mode,
            'sats': sats,
            # Mode 2:
            'error': error,
            'position': position,
            'speed': speed,
            'precision': precision,
            'heading': heading,
            # Mode 3:
            'altitude': altitude
        }
