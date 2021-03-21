from . import gpsd
import time
import requests
import subprocess


# https://github.com/MartijnBraam/gpsd-py3/blob/master/DOCS.md
class GpsSensor():
    name = ""
    prev_state = {}

    simulation = False
    simulated_lat = 50.919547
    simulated_lng = 13.652643
    simulated_speed = 0

    def __init__(self, name, token, port, simulation):
        self.simulation = simulation
        self.name = name
        self.token = token
        self.port = port

    def init_agps(self, lat, lon):
        if self.simulation:
            return None

        print("Stopping GPSD for AGPS")
        subprocess.run("sudo service gpsd stop", shell=True, check=True)
        time.sleep(2)

        token = self.token
        com_port = self.port
        r = requests.get(
            "http://online-live1.services.u-blox.com/GetOnlineData.ashx?token=" + token + ";lat="+str(lat)+";lon="+str(lon)+";gnss=gps;datatype=eph,alm,aux,pos;format=aid;",
            stream=True)

        import serial
        ser = serial.Serial(com_port, 9600)
        drainer = True
        while drainer:
            drainer = ser.inWaiting()
            ser.read(drainer)

        ser.write(r.content)

        ser.close()
        subprocess.run("sudo service gpsd start", shell=True, check=True)
        time.sleep(2)
        print("Uploaded AGPS Data!")
        gpsd.connect()

    def get_value(self):
        if self.simulation:
            return None

        try:
            return gpsd.get_current()
        except Exception:
            try:
                subprocess.run("sudo service gpsd start", shell=True, check=True)
                time.sleep(2)
                gpsd.connect()
            except Exception:
                print("starting gpsd failed!")
            return None

    def get_device(self):
        if self.simulation:
            return ""
        return gpsd.device()

    def get_name(self):
        return self.name

    def get_bearing(self):
        data = self.get_value()
        if data is None:
            return None
        if data.mode < 1:
            return None
        return data.track

    def get_lat(self):
        if self.simulation:
            return self.simulated_lat

        data = self.get_value()
        if data is None:
            return None
        if data.mode < 2:
            return None
        return data.position()[0]

    def get_lng(self):
        if self.simulation:
            return self.simulated_lng

        data = self.get_value()
        if data is None:
            return None
        if data.mode < 2:
            return None
        return data.position()[1]

    def get_speed(self):
        if self.simulation:
            return self.simulated_speed

        data = self.get_value()
        if data is None:
            return None
        if data.mode < 2:
            return None
        return data.hspeed

    def set_simulated_coords(self, lat, lng):
        if not self.simulation:
            return

        self.simulated_lat = lat
        self.simulated_lng = lng

    def set_simulated_speed(self, speed):
        if not self.simulation:
            return

        self.simulated_speed = speed

    def has_changed(self):
        """compares changes in the gps data for telemetry purposes"""
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        if self.simulation:
            return {
                'mode': 4,
                'sats': 10,
                # Mode 2:
                'error': {},
                'position': [self.get_lat(), self.get_lng()],
                'speed': self.simulated_speed,
                'precision': {},
                'heading': 0,
                # Mode 3:
                'altitude': None
            }

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
