import { toast } from "react-toastify";

export const convertNEDToXYZ = (position: {x: number, y: number, z: number}) => {
    return {x: position.y, y: -position.z, z: position.x}
}

export function notifyExceptions(response: Response, responseJson: Record<string, string>) {
    if(response.status != 200 && responseJson?.type == "DroneNotConnectedException"){
        toast.error(responseJson.response);
    }
	if(response.status != 200 && responseJson?.type == "ACKTimeoutException"){
		toast.warning(responseJson.response);
	}
	else if(response.status != 200 && responseJson?.type == "DroneAlreadyConnectedException"){
		toast.warning(responseJson.response);
	}
    else if(response.status != 200 && responseJson?.type == "CommandFailedException"){
        toast.error(responseJson.response);
    }
    else if(response.status != 200 && responseJson?.type == "ValueError"){
		toast.error(responseJson.response);
	}
	return
}

export const nonArmableModes = ["AUTOTUNE", "BRAKE", "CIRCLE", "FLIP", "FOLLOW", "LAND", "RTL", "SMARTRTL", "SYSID", "AVOIDADSB"]