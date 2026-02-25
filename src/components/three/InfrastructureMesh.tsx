'use client'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { ApartmentLayout } from '@/lib/three/BuildingGenerator'

export function InfrastructureMesh({ apartments }: { apartments: ApartmentLayout[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const balconyApts = useMemo(() => apartments.filter(a => a.balcony), [apartments])

    useEffect(() => {
        if (!meshRef.current) return
        const tempObj = new THREE.Object3D()
        
        balconyApts.forEach((apt, i) => {
            const zOffset = apt.dimensions[2] / 2 + 0.5 // 0.5m sticking out
            const yOffset = -apt.dimensions[1] / 2 + 0.5 // Bottom aligned
            
            const rotation = apt.rotation || 0
            const relX = 0
            const relZ = zOffset
            
            const rotatedX = relX * Math.cos(rotation) - relZ * Math.sin(rotation)
            const rotatedZ = relX * Math.sin(rotation) + relZ * Math.cos(rotation)

            tempObj.position.set(apt.position[0] + rotatedX, apt.position[1] + yOffset, apt.position[2] + rotatedZ)
            tempObj.rotation.set(0, rotation, 0)
            tempObj.updateMatrix()
            meshRef.current!.setMatrixAt(i, tempObj.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [balconyApts])

    return (
        <group>
             {/* Balconies */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, balconyApts.length]}>
                <boxGeometry args={[3, 1, 1]} /> {/* 3m wide, 1m high, 1m deep */}
                <meshStandardMaterial color="#64748b" />
            </instancedMesh>
            
            {/* Ground Plane (Infrastructure) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#f1f5f9" />
            </mesh>
            <gridHelper args={[100, 50, "#cbd5e1", "#e2e8f0"]} position={[0, -0.05, 0]} />
        </group>
    )
}
