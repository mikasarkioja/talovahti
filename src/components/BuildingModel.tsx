'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Billboard, Html, useCursor } from '@react-three/drei'
import { useStore } from '@/lib/store'
import { useMemo, Suspense, useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, RotateCcw, Layers, Thermometer, Droplets } from 'lucide-react'
import { BuildingGenerator, ApartmentLayout, POI } from '@/lib/three/BuildingGenerator'
import { ExtruderEngine } from '@/lib/three/ExtruderEngine'
import { HudCard } from '@/components/ui/hud-card'
import * as THREE from 'three'

function ExtrudedApartmentMesh({ 
    data, 
    color, 
    pulseColor,
    isHovered, 
    onClick,
    opacity = 1,
    transparent = false
}: { 
    data: ApartmentLayout, 
    color: string, 
    pulseColor?: string,
    isHovered: boolean, 
    onClick: (e: any) => void,
    opacity?: number,
    transparent?: boolean
}) {
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
        const intensity = (Math.sin(t * 3) + 1) / 2 * 0.5 + 0.2
        if (!Array.isArray(mesh.current.material)) {
            (mesh.current.material as THREE.MeshStandardMaterial).emissive.set(pulseColor);
            (mesh.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        }
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
            color={isHovered ? '#fbbf24' : color} 
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

function Balconies({ apartments }: { apartments: ApartmentLayout[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const balconyApts = useMemo(() => apartments.filter(a => a.balcony), [apartments])

    useEffect(() => {
        if (!meshRef.current) return
        const tempObj = new THREE.Object3D()
        
        balconyApts.forEach((apt, i) => {
            // Position: Center of apt + Offset to front (+Z)
            // Front face is at apt.dimensions[2]/2
            // Height: Lower 1m of the 3m floor. Relative to apt center Y (-1.5 to +1.5), it should be at bottom edge (-1.5) + 0.5 (half height of railing)
            
            const zOffset = apt.dimensions[2] / 2 + 0.5 // 0.5m sticking out
            const yOffset = -apt.dimensions[1] / 2 + 0.5 // Bottom aligned
            
            tempObj.position.set(apt.position[0], apt.position[1] + yOffset, apt.position[2] + zOffset)
            tempObj.updateMatrix()
            meshRef.current!.setMatrixAt(i, tempObj.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [balconyApts])

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, balconyApts.length]}>
            <boxGeometry args={[3, 1, 1]} /> {/* 3m wide, 1m high, 1m deep */}
            <meshStandardMaterial color="#64748b" />
        </instancedMesh>
    )
}

function PoiMarker({ data }: { data: POI }) {
    return (
        <group position={data.position}>
            <Billboard>
                <mesh>
                    <circleGeometry args={[0.6, 32]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
                </mesh>
                <Text position={[0, 0, 0.1]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
                    {data.type === 'SAUNA' ? '♨️' : data.type === 'LAUNDRY' ? '👕' : '⚙️'}
                </Text>
            </Billboard>
            <Text position={[0, -0.8, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="top">
                {data.label}
            </Text>
        </group>
    )
}

export function BuildingModel({ onApartmentClick, highlightId }: { onApartmentClick?: (id: string) => void, highlightId?: string }) {
  const { tickets, initiatives } = useStore()
  const controlsRef = useRef<any>(null)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null) 
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null)

  // Generate Layout
  const { apartments, pois } = useMemo(() => BuildingGenerator.generateLayout(), [])

  const handleResetView = () => {
    if (controlsRef.current) {
        controlsRef.current.reset()
    }
    setSelectedFloor(null)
    setSelectedAptId(null)
  }

  const handleAptClick = (id: string) => {
      setSelectedAptId(id === selectedAptId ? null : id) // Toggle
      if (onApartmentClick) onApartmentClick(id)
  }

  return (
    <div className="h-[600px] w-full bg-slate-50 rounded-2xl overflow-hidden border border-surface-greige relative shadow-inner touch-none group" aria-label="3D Malli Taloyhtiöstä">
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none select-none">
        <HudCard className="w-auto min-w-[150px]">
            <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> <span>Hälytys (Vuoto)</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span>Päätöksenteko</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400" /> <span>Normaali</span></div>
            </div>
        </HudCard>
      </div>

      {/* Floor Controls */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 flex flex-col gap-2">
        <div className="bg-white/80 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-200 flex flex-col gap-1">
            <Button 
                size="sm" 
                variant={selectedFloor === null ? 'primary' : 'ghost'} 
                className="h-8 w-8 p-0 text-xs font-bold"
                onClick={() => setSelectedFloor(null)}
            >
                ALL
            </Button>
            {[4, 3, 2, 1].map(f => (
                <Button 
                    key={f}
                    size="sm" 
                    variant={selectedFloor === f ? 'primary' : 'ghost'} 
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setSelectedFloor(f)}
                >
                    {f}
                </Button>
            ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur shadow-sm h-9 text-xs" onClick={() => alert("Mock: Kalibrointi...")}>
            <RefreshCw size={14} className="mr-2" /> Kalibroi
        </Button>
        <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur shadow-sm h-9 text-xs" onClick={handleResetView}>
            <RotateCcw size={14} className="mr-2" /> Palauta
        </Button>
      </div>
      
      <Canvas 
        frameloop="demand"
        camera={{ position: [20, 15, 20], fov: 35 }}
        className="touch-none"
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <hemisphereLight intensity={0.4} groundColor="#f8fafc" />
          
          <OrbitControls 
            ref={controlsRef}
            enablePan={true} 
            maxPolarAngle={Math.PI / 2.2} 
            minDistance={10} 
            maxDistance={60} 
            makeDefault
            autoRotate={!selectedAptId}
            autoRotateSpeed={0.5}
          />
          
          <group position={[0, -2, 0]}>
            {/* Ground Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#f1f5f9" />
            </mesh>
            <gridHelper args={[100, 50, "#cbd5e1", "#e2e8f0"]} position={[0, -0.05, 0]} />

            {/* Balconies (Instanced) */}
            <Balconies apartments={apartments} />

            {/* Apartments */}
            {apartments.map(apt => {
              // Status Logic
              const hasTicket = tickets.some(t => t.apartmentId === apt.id && t.status !== 'CLOSED')
              const activeVote = initiatives.some(i => i.status === 'VOTING')
              
              const isSelected = selectedAptId === apt.id
              const isAnySelected = selectedAptId !== null
              
              // Filtering
              const isVisible = selectedFloor === null || selectedFloor === apt.floor
              if (!isVisible) return null 

              // Color Logic
              let baseColor = '#e2e8f0' // Nordic Concrete
              let opacity = 1
              let transparent = false

              // X-Ray Mode:
              if (isAnySelected) {
                  if (isSelected) {
                      baseColor = '#002f6c' // Brand Navy
                      opacity = 1
                      transparent = false
                  } else {
                      opacity = 0.1
                      transparent = true
                  }
              }

              let pulseColor = undefined
              if (highlightId === apt.id) baseColor = '#fbbf24' // Highlight
              
              if (hasTicket) pulseColor = '#ef4444' // Red Pulse
              else if (activeVote) pulseColor = '#3b82f6' // Blue Pulse

              return (
                <group key={apt.id}>
                    <ExtrudedApartmentMesh 
                        data={apt}
                        color={baseColor}
                        pulseColor={pulseColor}
                        isHovered={false} 
                        onClick={() => handleAptClick(apt.id)}
                        opacity={opacity}
                        transparent={transparent}
                    />
                    
                    {/* Floating HUD anchored to 3D position */}
                    {isSelected && (
                        <Html position={[apt.position[0], apt.position[1] + 2, apt.position[2]]} center>
                            <div className="w-[200px] pointer-events-none">
                                <HudCard title={apt.id}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Pinta-ala</span>
                                            <span className="font-mono">{apt.areaM2} m²</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Lämpötila</span>
                                            <span className="font-mono flex items-center gap-1"><Thermometer size={10} /> 21.5°C</span>
                                        </div>
                                        {hasTicket && (
                                            <Badge variant="destructive" className="mt-1 text-[10px]">
                                                <Droplets size={10} className="mr-1" /> Vuotoepäily
                                            </Badge>
                                        )}
                                    </div>
                                </HudCard>
                            </div>
                        </Html>
                    )}
                </group>
              )
            })}

            {/* POIs */}
            {pois.map(poi => (
                <PoiMarker key={poi.id} data={poi} />
            ))}

          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}
