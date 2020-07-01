import gpsd

# https://github.com/MartijnBraam/gpsd-py3/blob/master/DOCS.md
class GpsSensor():
    def __init__(self):
        gpsd.connect()

    def get_value(self):
        return gpsd.get_current()

    def get_device(self):
        return gpsd.device()
