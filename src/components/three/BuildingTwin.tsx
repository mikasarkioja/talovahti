import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

// 1. Custom Thermal Shader
const EnergyShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uHealth: 100, // 0-100
    uColorSafe: new THREE.Color('#001133'), // Deep Blue
    uColorWarn: new THREE.Color('#ffaa00'), // Neon Orange
    uColorCrit: new THREE.Color('#ff0000'), // Pulsing Red
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vNoise;
    uniform float uTime;

    // Simple Noise
    float random (in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Gradient Noise
    float noise (in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vUv = uv;
      vPosition = position;
      
      // Pulse Animation (Vertex Displacement)
      float pulse = sin(uTime * 2.0 + position.y * 2.0) * 0.05;
      vec3 pos = position + normal * pulse * 0.5;

      vNoise = noise(uv * 10.0 + uTime * 0.5);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uHealth;
    uniform vec3 uColorSafe;
    uniform vec3 uColorWarn;
    uniform vec3 uColorCrit;
    uniform float uTime;
    
    varying vec2 vUv;
    varying float vNoise;

    void main() {
      // Map Health (0-100) to 0-1
      float h = uHealth / 100.0;
      
      // Base Color Mix
      vec3 color;
      if (h > 0.5) {
        color = mix(uColorWarn, uColorSafe, (h - 0.5) * 2.0);
      } else {
        color = mix(uColorCrit, uColorWarn, h * 2.0);
      }

      // Heat Shimmer Effect (Noise)
      float shimmer = vNoise * 0.2;
      
      // Rim Lighting / Glow
      float intensity = 1.0; // Simplified for Box

      gl_FragColor = vec4(color + shimmer, 0.9);
    }
  `
)

extend({ EnergyShaderMaterial })

type BuildingProps = {
  health?: number
  onClickPoint?: (point: THREE.Vector3) => void
}

export function BuildingTwin({ health = 100, onClickPoint }: BuildingProps) {
  const ref = useRef<any>(null)

  useFrame((state, delta) => {
    if (ref.current) {
        ref.current.uTime += delta
        ref.current.uHealth = health
    }
  })

  return (
    <mesh 
      onClick={(e) => {
        e.stopPropagation()
        onClickPoint?.(e.point)
      }}
    >
      <boxGeometry args={[3, 5, 3]} />
      {/* @ts-ignore */}
      <energyShaderMaterial ref={ref} transparent />
    </mesh>
  )
}
