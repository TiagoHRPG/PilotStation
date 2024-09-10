import time
from pymavlink import mavutil


def request_param_from_index(connection: mavutil.mavserial, index: int) -> dict:
    connection.mav.param_request_read_send(
        connection.target_system, connection.target_component, bytes(), index
    )
    message = connection.recv_match(type='PARAM_VALUE', blocking=True, timeout=2)
    return message

def retrieve_all_params(connection: mavutil.mavserial) -> dict:
    parameters = dict()
    params_idxs = []
    param_count = 0

    # Request all parameters
    connection.mav.param_request_list_send(
        connection.target_system, 0
    )

    try:
        message = connection.recv_match(type='PARAM_VALUE', blocking=True, timeout=2)
        while message is not None:
            message_dict: dict = message.to_dict()

            parameters[message_dict['param_id']] = message_dict['param_value']
            params_idxs.append(message_dict['param_index'])
            param_count = message_dict['param_count']

            message = connection.recv_match(type='PARAM_VALUE', blocking=True, timeout=2)

        for i in range(param_count):
            if i not in params_idxs:
                message = request_param_from_index(connection, i)
                message_dict: dict = message.to_dict()

                parameters[message_dict['param_id']] = message_dict['param_value']
                
    except Exception as error:
        raise error
    return parameters

if __name__ == '__main__':
    master = mavutil.mavlink_connection('127.0.0.1:14562')
    master.wait_heartbeat()
    start_time = time.time()

    print(len(retrieve_all_params(master)))

    print("elapsed time:", time.time() - start_time)