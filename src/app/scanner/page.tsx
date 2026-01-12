"use client"

import React, { useState, useEffect } from 'react'
import { EnergyHeatmap } from '@/components/three/EnergyHeatmap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scan, AlertTriangle, Zap, CheckCircle } from 'lucide-react'
import * as THREE from 'three'

// Mock leaks
const INITIAL_LEAKS = [
    { x: 1, y: 2, z: 1.5, severity: 0.8 }
]

export default function ScannerPage() {
  const [leaks, setLeaks] = useState(INITIAL_LEAKS)
  const [health, setHealth] = useState(85)
  const [scanProgress, setScanProgress] = useState(0)
  const [orientation, setOrientation] = useState<[number, number, number]>([0, 0, 0])
  const [isScanning, setIsScanning] = useState(false)

  // Device Orientation Tracker
  useEffect(() => {
    if (!isScanning) return

    const handleOrientation = (e: DeviceOrientationEvent) => {
        // Convert to Radians (Approx)
        const x = (e.beta || 0) * (Math.PI / 180)
        const y = (e.gamma || 0) * (Math.PI / 180)
        const z = (e.alpha || 0) * (Math.PI / 180)
        setOrientation([x, y, 0]) // Simplified

        // Gamification: Scan Progress
        setScanProgress(prev => Math.min(100, prev + 0.1))
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [isScanning])

  const handleLeakReport = (point: THREE.Vector3) => {
    if (!isScanning) return

    // 1. Raycast result comes from Three.js onClick (mocked here as point)
    
    // 2. Add Leak
    const newLeak = { x: point.x, y: point.y, z: point.z, severity: Math.random() }
    setLeaks(prev => [...prev, newLeak])
    setHealth(prev => Math.max(0, prev - 5))

    // 3. Haptic Glitch
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 100, 50])
    }

    // 4. Save to DB (Mock)
    console.log('[SCANNER] Reported leak at', point)
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* 3D Viewport */}
        <div className="absolute inset-0 z-0">
            <EnergyHeatmap 
                health={health} 
                leaks={leaks} 
                onLeakReport={handleLeakReport}
                rotation={orientation} 
            />
        </div>

        {/* HUD Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
            {/* Top HUD */}
            <div className="flex justify-between items-start">
                <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl text-emerald-400">
                    <div className="text-xs uppercase tracking-widest mb-1 opacity-70">Energy Health</div>
                    <div className="text-4xl font-mono font-bold">{health}%</div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <Badge variant="outline" className="bg-slate-900/80 text-cyan-400 border-cyan-500/50 backdrop-blur-md">
                        <Scan className="w-3 h-3 mr-1" /> MODE: THERMAL
                    </Badge>
                    {leaks.length > 0 && (
                        <Badge variant="outline" className="bg-slate-900/80 text-red-400 border-red-500/50 backdrop-blur-md animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {leaks.length} LEAKS
                        </Badge>
                    )}
                </div>
            </div>

            {/* Center Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-emerald-500/20 rounded-full flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <div className="absolute inset-0 border-t-2 border-emerald-500/50 w-full h-full rounded-full animate-spin-slow" />
            </div>

            {/* Bottom HUD */}
            <div className="pointer-events-auto space-y-4">
                {/* Scan Progress */}
                <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>SCAN COVERAGE</span>
                        <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${scanProgress}%` }} 
                        />
                    </div>
                </div>

                <Button 
                    size="lg" 
                    className={`w-full h-14 text-lg font-bold tracking-wider shadow-lg shadow-emerald-900/20 backdrop-blur-sm border ${isScanning ? 'bg-red-500/80 hover:bg-red-600/80 border-red-400' : 'bg-emerald-500/80 hover:bg-emerald-600/80 border-emerald-400'}`}
                    onClick={() => setIsScanning(!isScanning)}
                >
                    {isScanning ? 'STOP SCAN' : 'START THERMAL SCAN'}
                </Button>
            </div>
        </div>
    </div>
  )
}
