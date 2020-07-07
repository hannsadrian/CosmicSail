import gpsd

# https://github.com/MartijnBraam/gpsd-py3/blob/master/DOCS.md
class GpsSensor():
    def __init__(self):
        gpsd.connect()

    def get_value(self):
        return gpsd.get_current()

    def get_device(self):
        return gpsd.device()

    def get_meta(self):
        current_gps_data = self.get_value()
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
