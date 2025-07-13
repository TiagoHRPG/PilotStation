from __future__ import print_function

from pymavlink import mavutil
import time

master = mavutil.mavlink_connection('127.0.0.1:14562')
# Wait a heartbeat before sending commands
master.wait_heartbeat()


start_time = time.time()
while time.time() - start_time < 1:
    try:
        master.recv_msg()
        altitude = master.messages['BATTERY_STATUS']  # Note, you can access message fields as attributes!
        timestamp = master.time_since('BATTERY_STATUS')
        print(altitude, timestamp)
    except:
        pass 

