import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { BuildingTwin } from './BuildingTwin'
import { DigitalRain } from './DigitalRain'
import * as THREE from 'three'

type Props = {
    health: number
    leaks: Array<{x: number, y: number, z: number}>
    onLeakReport?: (point: THREE.Vector3) => void
    rotation?: [number, number, number] // From device orientation
}

export function EnergyHeatmap({ health, leaks, onLeakReport, rotation = [0,0,0] }: Props) {
  return (
    <Canvas className="w-full h-full bg-slate-900">
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <OrbitControls enablePan={false} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <group rotation={rotation}>
        <BuildingTwin health={health} onClickPoint={onLeakReport} />
        <DigitalRain leaks={leaks} />
      </group>
      
      {/* Leak Indicators */}
      {leaks.map((leak, i) => (
        <mesh key={i} position={[leak.x, leak.y, leak.z]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </Canvas>
  )
}
