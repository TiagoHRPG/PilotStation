import { toast } from "react-toastify";


export function notifyExceptions(response: Response, responseJson: Record<string, string>) {
    if(response.status != 200 && responseJson?.type == "DroneNotConnectedException"){
        toast.error(responseJson.response);
    }
	if(response.status != 200 && responseJson?.type == "ACKTimeoutException"){
		toast.warning(responseJson.response);
	}
	else if(response.status != 200){
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
