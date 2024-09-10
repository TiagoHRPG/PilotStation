interface DroneInfoInterface {
    battery_level: Number;
    position: {
        x: Number;
        y: Number;
        z: Number;
    }
    waypoint_distance: Number;
    armed: Boolean;
    mode: string;
    vfr: {
        airspeed: Number;
        groundspeed: Number;
        heading: Number;
        throttle: Number;
        altitude: Number;
        climb: Number;
    }
    attitude: {
        roll: Number;
        pitch: Number;
        yaw: Number;
    }
}

export class DroneInfo implements DroneInfoInterface {
    battery_level: Number;
    position: {
        x: Number;
        y: Number;
        z: Number;
    }
    waypoint_distance: Number;
    armed: Boolean;
    mode: string;
    vfr: {
        airspeed: Number;
        groundspeed: Number;
        heading: Number;
        throttle: Number;
        altitude: Number;
        climb: Number;
    }
    attitude: {
        roll: Number;
        pitch: Number;
        yaw: Number;
    }

    constructor(
        battery_level: Number = 0, 
        position: { x: Number; y: Number; z: Number; } = { x: 0, y: 0, z: 0 }, 
        waypoint_distance: Number = 0, 
        armed: Boolean = false, 
        mode: string = '', 
        vfr: { airspeed: Number; groundspeed: Number; heading: Number; throttle: Number; altitude: Number; climb: Number; } = { airspeed: 0, groundspeed: 0, heading: 0, throttle: 0, altitude: 0, climb: 0 },
        attitude: { roll: Number; pitch: Number; yaw: Number; } = { roll: 0, pitch: 0, yaw: 0 }
    ) {   
        this.battery_level = battery_level;
        this.position = position;
        this.waypoint_distance = waypoint_distance;
        this.armed = armed;
        this.mode = mode;
        this.vfr = vfr;
        this.attitude = attitude;
    }

}

export default DroneInfoInterface;
