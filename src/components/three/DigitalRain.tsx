import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Leak = {
    x: number
    y: number
    z: number
}

export function DigitalRain({ leaks = [] }: { leaks: Leak[] }) {
  const count = 500
  const ref = useRef<THREE.Points>(null)

  // Initial Positions
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = Math.random() * 10 // Start high
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      
      vel[i * 3] = 0
      vel[i * 3 + 1] = -0.05 - Math.random() * 0.05 // Fall down
      vel[i * 3 + 2] = 0
    }
    return [pos, vel]
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
        // Apply Gravity
        pos[i * 3 + 1] += velocities[i * 3 + 1]

        // Reset if too low
        if (pos[i * 3 + 1] < -5) {
            pos[i * 3 + 1] = 10
            pos[i * 3] = (Math.random() - 0.5) * 10
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10
        }

        // Attraction to Leaks
        // Simple boid-like steer towards nearest leak
        if (leaks.length > 0) {
            let closestDist = 9999
            let closestLeak = leaks[0]

            // Find closest
            for(const leak of leaks) {
                const dx = leak.x - pos[i*3]
                const dy = leak.y - pos[i*3+1]
                const dz = leak.z - pos[i*3+2]
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
                if (dist < closestDist) {
                    closestDist = dist
                    closestLeak = leak
                }
            }

            // Attract if close enough
            if (closestDist < 3) {
                pos[i*3] += (closestLeak.x - pos[i*3]) * 0.02
                pos[i*3+1] += (closestLeak.y - pos[i*3+1]) * 0.02
                pos[i*3+2] += (closestLeak.z - pos[i*3+2]) * 0.02
            }
        }
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
