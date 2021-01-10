import psutil


class Bandwidth:
    name = ""
    prev_state = 0

    def __init__(self, name):
        self.name = name

    def get_value(self):
        return "{:.1f}".format((psutil.net_io_counters().bytes_sent + psutil.net_io_counters().bytes_recv) / 1024 / 1024)

    def get_name(self):
        return self.name

    def has_changed(self):
        changed = self.get_value() != self.prev_state
        self.prev_state = self.get_value()

        return changed

    def get_change(self):
        return self.get_value()

    def get_meta(self):
        return self.get_value()
