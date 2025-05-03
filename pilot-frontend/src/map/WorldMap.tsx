import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import Ground, { WORLD_SIZE } from "./Ground";
import { Line, OrbitControls } from "@react-three/drei";
import "./WorldMap.css";
import { useEffect, useState, useMemo } from "react";
import { Drone } from "../store/droneStore";
import { convertNEDToXYZ } from "../utils/converters";

// Predefined colors for drones and their trajectories
const DRONE_COLORS = [
  "#FF5733", // Orange-Red
  "#33FF57", // Bright Green
  "#3357FF", // Blue
  "#FF33E0", // Magenta
  "#FFD700", // Gold
  "#00FFFF", // Cyan
  "#FF00FF", // Fuchsia
  "#9400D3", // Violet
  "#1E90FF", // Dodger Blue
  "#32CD32", // Lime Green
];

// Threshold for position change detection (in units)
const POSITION_CHANGE_THRESHOLD = 0.05;

/**
 * Function to check if the position has changed significantly
 */
const hasPositionChanged = (newPos: Vector3, lastPos: Vector3): boolean => {
  if (!lastPos) return true;

  // Calculate distance between positions
  const distance = newPos.distanceTo(lastPos);
  return distance > POSITION_CHANGE_THRESHOLD;
};

const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const DroneObject = ({
  position,
  color,
  heading,
}: {
  position: { x: number; y: number; z: number };
  color: string;
  heading: number;
}) => {
  // Convert heading from degrees to radians
  // In NED coordinate system, heading is clockwise from North (0 degrees)
  // In Three.js, we need to rotate around the Y axis
  const headingRadians = degreesToRadians(-heading + 90);

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Main drone body as sphere */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Direction indicator (cone) pointing in heading direction */}
      <group rotation={[0, headingRadians, 0]}>
        {/* Cone points in the heading direction, rotated to point horizontally */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};

function WorldMap({ drones }: { drones: Drone[] }) {
  const initialCameraPosition = new Vector3(2, 2, 2);
  const [trajectories, setTrajectories] = useState<Record<string, Vector3[]>>({});

  // Create a persistent color mapping for each drone ID
  const droneColorMap = useMemo(() => {
    const colorMap: Record<string, string> = {};

    // Use existing mapping for previously seen drones
    drones.forEach((drone, index) => {
      if (!colorMap[drone.id]) {
        // Assign a color from our palette, or cycle through them if we have more drones than colors
        colorMap[drone.id] = DRONE_COLORS[index % DRONE_COLORS.length];
      }
    });

    return colorMap;
  }, [drones.map((d) => d.id).join(",")]); // Only recreate when drone IDs change

  useEffect(() => {
    // Update trajectories for each active drone
    const newTrajectories = { ...trajectories };

    drones.forEach((drone) => {
      const newPosition = convertNEDToXYZ(drone.worldPosition);
      const positionVector = new Vector3(
        newPosition.x,
        newPosition.y,
        newPosition.z
      );

      // Initialize trajectory array if it doesn't exist
      if (!newTrajectories[drone.id]) {
        newTrajectories[drone.id] = [];
      }

      // Get the last recorded position
      const lastPosition =
        newTrajectories[drone.id][newTrajectories[drone.id].length - 1];

      // Only add position if it has changed significantly or it's the first point
      if (
        newTrajectories[drone.id].length === 0 ||
        hasPositionChanged(positionVector, lastPosition)
      ) {
        // Add new position to trajectory
        newTrajectories[drone.id].push(positionVector);

        // Limit trajectory length to prevent performance issues
        if (newTrajectories[drone.id].length > 100) {
          newTrajectories[drone.id] = newTrajectories[drone.id].slice(-100);
        }
      }
    });

    setTrajectories(newTrajectories);
  }, [drones]);

  // Get active drone IDs to only show trajectories for connected drones
  const activeDroneIds = useMemo(() => new Set(drones.map((d) => d.id)), [
    drones,
  ]);

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
            color={droneColorMap[drone.id] || "#FF5733"}
            heading={drone.info.vfr.heading}
          />
        ))}

        <OrbitControls />
        <gridHelper args={[WORLD_SIZE, 50]} />

        {Object.entries(trajectories)
          .filter(([droneId]) => activeDroneIds.has(droneId))
          .map(([droneId, points]) => (
            <Line
              key={droneId}
              points={points}
              color={droneColorMap[droneId] || "#FF5733"}
              lineWidth={2}
            />
          ))}
      </Canvas>
    </div>
  );
}

export default WorldMap;
