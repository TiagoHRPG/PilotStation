export const convertNEDToXYZ = (position: {x: number, y: number, z: number}) => {
    return {x: position.y, y: -position.z, z: position.x}
}

export const nonArmableModes = ["AUTOTUNE", "BRAKE", "CIRCLE", "FLIP", "FOLLOW", "LAND", "RTL", "SMARTRTL", "SYSID", "AVOIDADSB"]