'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExtruderEngine } from '@/lib/three/ExtruderEngine'

export default function CalibrationPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [points, setPoints] = useState<[number, number][]>([])
    const [isDrawing, setIsDrawing] = useState(false)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const img = new Image()
            img.onload = () => setImage(img)
            img.src = URL.createObjectURL(file)
        }
    }

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!isDrawing) return
        const rect = canvasRef.current!.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setPoints([...points, [x, y]])
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        }

        // Draw points and lines
        if (points.length > 0) {
            ctx.strokeStyle = '#ef4444'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(points[0][0], points[0][1])
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1])
            }
            if (points.length > 2) {
                // Close loop preview
                // ctx.closePath() 
            }
            ctx.stroke()
            
            // Draw dots
            ctx.fillStyle = '#ef4444'
            points.forEach(p => {
                ctx.beginPath()
                ctx.arc(p[0], p[1], 4, 0, Math.PI * 2)
                ctx.fill()
            })
        }
    }, [image, points])

    const handleSave = () => {
        // Convert to 3D world coords
        const worldPoints = points.map(p => ExtruderEngine.map2DTo3D(p[0], p[1], 0.05)) // 1px = 5cm
        console.log("Extruded Points:", worldPoints)
        alert(`Saved ${worldPoints.length} points for extrusion!`)
        setPoints([])
        setIsDrawing(false)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">3D Kalibrointi</h1>
                <div className="space-x-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload" />
                    <Button variant="outline" onClick={() => document.getElementById('upload')?.click()}>Lataa Pohjakuva</Button>
                    <Button onClick={() => setIsDrawing(!isDrawing)} variant={isDrawing ? "destructive" : "default"}>
                        {isDrawing ? "Lopeta Piirto" : "Aloita Piirto"}
                    </Button>
                    <Button onClick={handleSave} disabled={points.length < 3}>Tallenna Muoto</Button>
                </div>
            </div>

            <Card className="p-4 overflow-hidden bg-slate-100 flex justify-center">
                <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={600} 
                    className="bg-white shadow-sm cursor-crosshair"
                    onClick={handleCanvasClick}
                />
            </Card>
            
            <div className="text-sm text-slate-500">
                <p>Ohje: Lataa pohjakuva ja klikkaa kulmapisteet kiertäen myötäpäivään.</p>
            </div>
        </div>
    )
}
