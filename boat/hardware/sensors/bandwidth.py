import time
import psutil


class Bandwidth:
    def get_value(self):
        return (psutil.net_io_counters().bytes_sent + psutil.net_io_counters().bytes_recv)/1024/1024
