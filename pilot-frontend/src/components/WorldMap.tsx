import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import Ground, { WORLD_SIZE } from "./Ground";
import { Line, OrbitControls } from "@react-three/drei";
import "./WorldMap.css";
import { useEffect, useState } from "react";
import { Drone } from "../contexts/DronesContext";
import { convertNEDToXYZ } from "../utilities";

// TODO: add different colors to each drone and trajectories
const DroneObject = ({
	position,
}: {
	position: { x: number; y: number; z: number };
}) => {
	return (
		<mesh position={[position.x, position.y, position.z]}>
			<sphereGeometry args={[0.3, 16, 16]} />
			<meshStandardMaterial color="orange" />
		</mesh>
	);
};
function WorldMap({ drones }: { drones: Drone[] }) {
	const initialCameraPosition = new Vector3(2, 2, 2);
	const [trajectories, setTrajectories] = useState<Record<string, Vector3[]>>(
		{}
	);

	useEffect(() => {
		const newTrajectories = { ...trajectories };
		drones.forEach((drone) => {
			const newPosition = convertNEDToXYZ(drone.worldPosition);
			const positionVector = new Vector3(
				newPosition.x,
				newPosition.y,
				newPosition.z
			);
			if (!newTrajectories[drone.id]) {
				newTrajectories[drone.id] = [];
			}
			newTrajectories[drone.id].push(positionVector);
			if (newTrajectories[drone.id].length > 100) {
				newTrajectories[drone.id] = newTrajectories[drone.id].slice(1);
			}
		});
		setTrajectories(newTrajectories);
	}, [drones]);

	return (
		<div className="world-map-container">
			<Canvas camera={{ position: initialCameraPosition, up: [0, 1, 0] }}>
				<Ground />
				<ambientLight intensity={0.6} />
				<hemisphereLight
					color={"#ffffff"}
					groundColor={"#000000"}
					intensity={1}
				/>
				{drones.map((drone) => (
					<DroneObject
						key={drone.id}
						position={convertNEDToXYZ(drone.worldPosition)}
					/>
				))}
				<OrbitControls />
				<gridHelper args={[WORLD_SIZE, 50]} />
				{Object.keys(trajectories).map((droneId) => (
					<Line
						key={droneId}
						points={trajectories[droneId]}
						color="blue"
						lineWidth={2}
					/>
				))}
			</Canvas>
		</div>
	);
}

export default WorldMap;
