import socketio


class DummyGpsSensor:
    name = ""
    bearing = 0
    lat = 0
    lng = 0
    simulation = socketio.Client(request_timeout=1, reconnection_delay=0.5, reconnection_delay_max=1)

    def __init__(self, name, simulation):
        self.name = name
        self.simulation = simulation

    def register_listeners(self):
        @self.simulation.event
        def bearing_update(data):
            self.bearing = int(data)

    def init_agps(self, lat, lon):
        print("Dummy")

    def get_value(self):
        # todo
        return None

    def get_device(self):
        return None

    def get_name(self):
        return self.name

    def get_bearing(self):
        return self.bearing

    def get_lat(self):
        return self.lat

    def get_lng(self):
        return self.lng

    def get_meta(self):
        return {
            'mode': 10,
            'sats': 33,
            'error': '',
            'position': [self.get_lat(), self.get_lng()],
            'speed': 'No',
            'precision': '0+-',
            'heading': self.get_bearing(),
            # Mode 3:
            'altitude': 0
        }
