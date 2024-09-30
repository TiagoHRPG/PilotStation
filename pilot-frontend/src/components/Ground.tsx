

export const WORLD_SIZE = 10;
const Ground = () => {

    return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow castShadow>
        <planeGeometry attach="geometry" args={[WORLD_SIZE, WORLD_SIZE]} />
        <meshStandardMaterial attach="material" color="gray" />
    </mesh>
    )
}
export default Ground;