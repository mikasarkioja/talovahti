'use client'

import { Drawer } from 'vaul'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ActivityItem } from './ActivityStream'
import { Suspense } from 'react'

// Simple 3D Component for Mini-Map
function MiniMapBuilding({ highlight }: { highlight: boolean }) {
    return (
        <mesh rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial 
                color={highlight ? "#fbbf24" : "#e2e8f0"} 
                emissive={highlight ? "#fbbf24" : "#000000"}
                emissiveIntensity={highlight ? 0.5 : 0}
            />
        </mesh>
    )
}

export function SpatialDrawer({ isOpen, onClose, activeItem }: { isOpen: boolean, onClose: () => void, activeItem: ActivityItem | null }) {
  const isHvac = activeItem?.title.includes('LVI') || activeItem?.title.includes('Vesi')

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 h-[60vh] outline-none z-50">
          <div className="p-4 bg-white rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 mb-8" />
            <div className="max-w-md mx-auto">
              <Drawer.Title className="font-medium mb-4 text-slate-900">
                {activeItem?.title} - Sijainti
              </Drawer.Title>
              
              <div className="h-[300px] w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                <Canvas camera={{ position: [4, 4, 4] }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <Suspense fallback={null}>
                        <MiniMapBuilding highlight={!!isHvac} />
                    </Suspense>
                    <OrbitControls autoRotate />
                </Canvas>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                {isHvac ? "LVI-järjestelmä korostettu (Keltainen)." : "Kohde näytetään kartalla."}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
