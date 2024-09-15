interface DroneInfoInterface {
    battery_level: number;
    position: {
        x: number;
        y: number;
        z: number;
    }
    waypoint_distance: number;
    armed: Boolean;
    mode: string;
    vfr: {
        airspeed: number;
        groundspeed: number;
        heading: number;
        throttle: number;
        altitude: number;
        climb: number;
    }
    attitude: {
        roll: number;
        pitch: number;
        yaw: number;
    }
    is_ekf_ok: Boolean;
}

export class DroneInfo implements DroneInfoInterface {
    battery_level: number;
    position: {
        x: number;
        y: number;
        z: number;
    }
    waypoint_distance: number;
    armed: Boolean;
    mode: string;
    vfr: {
        airspeed: number;
        groundspeed: number;
        heading: number;
        throttle: number;
        altitude: number;
        climb: number;
    }
    attitude: {
        roll: number;
        pitch: number;
        yaw: number;
    }
    is_ekf_ok: Boolean = false;

    constructor(
        battery_level: number = 0, 
        position: { x: number; y: number; z: number; } = { x: 0, y: 0, z: 0 }, 
        waypoint_distance: number = 0, 
        armed: Boolean = false, 
        mode: string = '', 
        vfr: { airspeed: number; groundspeed: number; heading: number; throttle: number; altitude: number; climb: number; } = { airspeed: 0, groundspeed: 0, heading: 0, throttle: 0, altitude: 0, climb: 0 },
        attitude: { roll: number; pitch: number; yaw: number; } = { roll: 0, pitch: 0, yaw: 0 },
        is_ekf_ok: Boolean = false
    ) {   
        this.battery_level = battery_level;
        this.position = position;
        this.waypoint_distance = waypoint_distance;
        this.armed = armed;
        this.mode = mode;
        this.vfr = vfr;
        this.attitude = attitude;
        this.is_ekf_ok = is_ekf_ok;
    }

}

export default DroneInfoInterface;
