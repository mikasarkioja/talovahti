import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Leak = {
  x: number;
  y: number;
  z: number;
};

export function DigitalRain({ leaks = [] }: { leaks: Leak[] }) {
  const count = 500;
  const ref = useRef<THREE.Points>(null);

  // Initial Positions - stable across renders
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    // Use a stable random seed or just initialize once
    // We use a local generator to keep it pure within the memo
    const random = () => {
      let seed = 12345;
      return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    };
    const rng = random();

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() - 0.5) * 10;
      pos[i * 3 + 1] = rng() * 10; // Start high
      pos[i * 3 + 2] = (rng() - 0.5) * 10;

      vel[i * 3] = 0;
      vel[i * 3 + 1] = -0.05 - rng() * 0.05; // Fall down
      vel[i * 3 + 2] = 0;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Apply Gravity
      pos[i * 3 + 1] += velocities[i * 3 + 1];

      // Reset if too low
      if (pos[i * 3 + 1] < -5) {
        pos[i * 3 + 1] = 10;
        // Here Math.random is fine because it's in useFrame (event/animation loop), not render
        pos[i * 3] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }

      // Attraction to Leaks
      // Simple boid-like steer towards nearest leak
      if (leaks.length > 0) {
        let closestDistSq = 9999;
        let closestLeak = leaks[0];

        // Find closest (using squared distance to avoid Math.sqrt)
        for (const leak of leaks) {
          const dx = leak.x - pos[i * 3];
          const dy = leak.y - pos[i * 3 + 1];
          const dz = leak.z - pos[i * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < closestDistSq) {
            closestDistSq = distSq;
            closestLeak = leak;
          }
        }

        // Attract if close enough (threshold 3m -> 9m^2)
        if (closestDistSq < 9) {
          pos[i * 3] += (closestLeak.x - pos[i * 3]) * 0.02;
          pos[i * 3 + 1] += (closestLeak.y - pos[i * 3 + 1]) * 0.02;
          pos[i * 3 + 2] += (closestLeak.z - pos[i * 3 + 2]) * 0.02;
        }
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
