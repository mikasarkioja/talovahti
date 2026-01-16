'use client'
import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { ApartmentLayout } from '@/lib/three/BuildingGenerator'
import { ExtruderEngine } from '@/lib/three/ExtruderEngine'

interface ApartmentMeshProps {
    data: ApartmentLayout
    color: string
    pulseColor?: string
    isHovered: boolean
    onClick: (e: any) => void
    opacity?: number
    transparent?: boolean
}

export function ApartmentMesh({ 
    data, 
    color, 
    pulseColor,
    isHovered, 
    onClick,
    opacity = 1,
    transparent = false
}: ApartmentMeshProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  useCursor(hovered)

  // Create Geometry from ExtruderEngine
  const { shape, extrudeSettings } = useMemo(() => {
    // Extrude with height=3 (from generator)
    const result = ExtruderEngine.extrudeApartment(data.polygonPoints, data.floor, data.dimensions[1])
    return result || { shape: new THREE.Shape(), extrudeSettings: {} }
  }, [data])

  useFrame((state) => {
    if (mesh.current && pulseColor) {
        const t = state.clock.getElapsedTime()
        const intensity = (Math.sin(t * 5) + 1) / 2 * 0.6 + 0.2 // Faster pulse for "Pulsing" effect
        if (!Array.isArray(mesh.current.material)) {
            (mesh.current.material as THREE.MeshStandardMaterial).emissive.set(pulseColor);
            (mesh.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        }
    } else if (mesh.current && !Array.isArray(mesh.current.material)) {
        // Reset emissive if no pulse
         (mesh.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    }
  })

  // Center vertical adjustment: Extrusion starts at Z=0. We rotate -90 X -> Y=0.
  // Group is at Center Y. Mesh goes 0..3. So shift mesh Y by -1.5.
  const verticalOffset = -data.dimensions[1] / 2

  return (
    <group position={data.position} onClick={(e) => { e.stopPropagation(); onClick(e) }} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, verticalOffset, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
            color={isHovered || hovered ? '#fbbf24' : color} 
            roughness={0.8} // Nordic Concrete
            transparent={transparent || opacity < 1}
            opacity={opacity} 
        />
      </mesh>
      
      {/* Wireframe edges for style */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[0, verticalOffset, 0]}>
         <edgesGeometry args={[new THREE.ExtrudeGeometry(shape, extrudeSettings)]} />
         <lineBasicMaterial color="#94a3b8" transparent opacity={0.3 * opacity} />
      </lineSegments>

      {/* Label */}
      <Text 
        position={[0, 0, data.dimensions[2] / 2 + 0.2]} 
        fontSize={0.4} 
        color="#1e293b" 
        anchorX="center" 
        anchorY="middle"
        fillOpacity={opacity}
      >
        {data.id}
      </Text>
    </group>
  )
}
