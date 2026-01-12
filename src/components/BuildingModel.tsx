'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Billboard, Loader } from '@react-three/drei'
import { useStore } from '@/lib/store'
import { useMemo, Suspense } from 'react'

function ApartmentBox({ position, label, id, color }: { position: [number, number, number], label: string, id: string, color: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.6, 1.2, 1.6]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[1.61, 1.21, 1.61]}>
         <boxGeometry />
         <meshBasicMaterial wireframe color="#334155" />
      </mesh>
      <Text position={[0, 0, 0.81]} fontSize={0.4} color="black" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  )
}

function ObservationMarker({ position, count, onClick }: { position: [number, number, number], count: number, onClick: () => void }) {
  if (count === 0) return null
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick() }}>
      <Billboard>
         <mesh position={[0, 0.8, 0]}>
           <circleGeometry args={[0.4, 32]} />
           <meshBasicMaterial color="#eab308" />
         </mesh>
         <Text position={[0, 0.8, 0.01]} fontSize={0.4} color="black" anchorX="center" anchorY="middle">
           {count}
         </Text>
      </Billboard>
    </group>
  )
}

export function BuildingModel({ onApartmentClick, highlightId }: { onApartmentClick?: (id: string) => void, highlightId?: string }) {
  const { tickets, initiatives, observations } = useStore()

  // Generate a grid of apartments
  // 3 floors, 4 apartments per floor
  // IDs: A 1, A 2 ... A 12
  const apartments = useMemo(() => {
    const apts = []
    let count = 1
    for (let floor = 0; floor < 3; floor++) {
      for (let num = 0; num < 4; num++) {
        const id = `A ${count}`
        apts.push({
          id,
          label: id,
          position: [(num - 1.5) * 2, floor * 1.5, 0] as [number, number, number]
        })
        count++
      }
    }
    return apts
  }, [])

  return (
    <div className="h-[500px] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative shadow-inner touch-none">
      <div className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded text-xs backdrop-blur-sm shadow-sm pointer-events-none select-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Avoin vikailmoitus</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Aktiivinen päätöksenteko</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Kuntohavainto</span>
        </div>
      </div>
      
      <Canvas 
        frameloop="demand"
        camera={{ position: [6, 4, 8], fov: 45 }}
        className="touch-none"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />
          <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2} 
            minDistance={5} 
            maxDistance={20} 
            makeDefault
          />
          
          <group position={[0, -1.5, 0]}>
            {apartments.map(apt => {
              // Check status
              const hasTicket = tickets.some(t => t.apartmentId === apt.id && t.status !== 'CLOSED')
              const activeVote = initiatives.some(i => 
                i.pipelineStage === 'VOTING' && 
                (i.affectedArea === apt.id || !i.affectedArea)
              )
              
            // Map observations loosely to apartments if location string matches ID
            // In a real app, this would use precise coordinates
            const obsCount = observations.filter(o => o.location && o.location.includes(apt.id) && o.status === 'OPEN').length

            let color = '#f1f5f9' // slate-100
            if (highlightId === apt.id) color = '#fbbf24' // amber-400 (Highlight)
            else if (hasTicket) color = '#ef4444' // red-500
            else if (activeVote) color = '#3b82f6' // blue-500
            
            return (
              <group 
                key={apt.id}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onApartmentClick) onApartmentClick(apt.id)
                }}
              >
                <ApartmentBox 
                  {...apt} 
                  color={color}
                />
                <ObservationMarker 
                  position={apt.position} 
                  count={obsCount} 
                  onClick={() => alert(`Havaintoja asunnossa ${apt.id}: ${obsCount}`)} 
                />
              </group>
            )
            })}
          </group>
          <gridHelper args={[20, 20]} position={[0, -2.5, 0]} />
        </Suspense>
      </Canvas>
      <Loader />
    </div>
  )
}
