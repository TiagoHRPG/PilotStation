import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import Ground, { WORLD_SIZE } from "./Ground";
import { Line, OrbitControls } from "@react-three/drei";
import './WorldMap.css';
import { useEffect, useState } from "react";

interface WorldMapProps {
    dronePosition: {x: number, y: number, z: number}
}

const Drone = ({ position }: { position: {x: number, y: number, z: number} }) => {
    return (
        <mesh position={[position.x, position.y, position.z]}>
            <boxGeometry args={[1,1,1]} />
            <meshStandardMaterial color='orange' />
        </mesh>
    )
}

function WorldMap({ dronePosition }: WorldMapProps){
    const initialCameraPosition = new Vector3(2,2,2);
    const [trajectory, setTrajectory] = useState<Vector3[]>([]);


    useEffect(() => {
        const newPosition = new Vector3(
          dronePosition.x,
          dronePosition.y,
          dronePosition.z
        );
        setTrajectory((prev) => [...prev, newPosition]);
      }, [dronePosition]);

    return (
        <div className="world-map-container">
            <Canvas camera={{ position: initialCameraPosition, up: [0, 1, 0] }}>
                <Ground />
                <ambientLight intensity={0.6} />
                <hemisphereLight color={'#ffffff'} groundColor={'#000000'} intensity={1} />
                <Drone position={dronePosition}/>
                <OrbitControls />
                <gridHelper args={[WORLD_SIZE, 50]} />
                <Line
                points={trajectory}
                color="blue"
                lineWidth={2}
                />
            </Canvas>
        </div>)
}

export default WorldMap;
