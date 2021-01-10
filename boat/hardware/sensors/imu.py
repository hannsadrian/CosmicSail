from hardware.sensors.MPU6050 import MPU6050


class IMU:
    name = ""
    prev_state = {}

    i2c_bus = 1
    device_address = 0x68
    # The offsets are different for each device and should be changed
    # accordingly using a calibration procedure
    x_accel_offset = 503
    y_accel_offset = -1628
    z_accel_offset = 15000
    x_gyro_offset = -16
    y_gyro_offset = -184
    z_gyro_offset = 263
    enable_debug_output = False

    pitch = 0
    roll = 0
    yaw = 0

    FIFO_buffer = [0] * 64
    FIFO_count_list = list()

    def __init__(self, name):
        self.name = name
        self.mpu = MPU6050(self.i2c_bus, self.device_address, self.x_accel_offset, self.y_accel_offset,
                           self.z_accel_offset, self.x_gyro_offset, self.y_gyro_offset, self.z_gyro_offset,
                           self.enable_debug_output)

        self.mpu.dmp_initialize()
        self.mpu.set_DMP_enabled(True)
        self.mpu_int_status = self.mpu.get_int_status()

        self.packet_size = self.mpu.DMP_get_FIFO_packet_size()
        self.FIFO_count = self.mpu.get_FIFO_count()

    def loop(self):
        self.FIFO_count = self.mpu.get_FIFO_count()
        self.mpu_int_status = self.mpu.get_int_status()

        # If overflow is detected by status or fifo count we want to reset
        if (self.FIFO_count == 1024) or (self.mpu_int_status & 0x10):
            self.mpu.reset_FIFO()
        # Check if fifo data is ready
        elif self.mpu_int_status & 0x02:
            # Wait until packet_size number of bytes are ready for reading, default
            # is 42 bytes
            while self.FIFO_count < self.packet_size:
                self.FIFO_count = self.mpu.get_FIFO_count()
            self.FIFO_buffer = self.mpu.get_FIFO_bytes(self.packet_size)
            accel = self.mpu.DMP_get_acceleration_int16(self.FIFO_buffer)
            quat = self.mpu.DMP_get_quaternion_int16(self.FIFO_buffer)
            grav = self.mpu.DMP_get_gravity(quat)
            roll_pitch_yaw = self.mpu.DMP_get_euler_roll_pitch_yaw(quat, grav)
            self.roll = roll_pitch_yaw.x * 2
            self.pitch = roll_pitch_yaw.y * 2
            self.yaw = roll_pitch_yaw.z * 2

    def get_value(self):
        return {"pitch": self.pitch, "roll": self.roll, "yaw": self.yaw}

    def get_pitch(self):
        return self.pitch

    def get_roll(self):
        return self.roll

    def get_yaw(self):
        return self.yaw

    def get_name(self):
        return self.name

    def has_changed(self):
        changed = self.get_meta() != self.prev_state
        self.prev_state = self.get_meta()

        return changed

    def get_meta(self):
        return {"pitch": round(self.pitch), "roll": round(self.roll), "yaw": round(self.yaw)}
