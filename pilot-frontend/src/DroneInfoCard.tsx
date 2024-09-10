import React from 'react';
import DroneInfoInterface from './DroneInfoInterface';



interface DroneInfoCardProps {
  info: DroneInfoInterface;
}

const DroneInfoCard: React.FC<DroneInfoCardProps> = ({ info }) => {
  return (
    <div className="card">
        <h3>Drone Information</h3>
        <p><strong>Position:</strong> 
        {info.position.x.toLocaleString(undefined, {maximumFractionDigits:2})}, 
        {info.position.y.toLocaleString(undefined, {maximumFractionDigits:2})}, 
        {info.position.z.toLocaleString(undefined, {maximumFractionDigits:2})}</p>
        <p><strong>Mode:</strong> {info.mode}</p>
        <p><strong>Dist. to WP:</strong> {String(info.waypoint_distance)}m</p>
        <p><strong>Yaw:</strong> {String(info.vfr.heading)}º</p>
        <p><strong>Armed:</strong> {String(info.armed)}</p>

        <p><strong>Battery:</strong> {String(info.battery_level)}</p>
    </div>
  );
};

export default DroneInfoCard;