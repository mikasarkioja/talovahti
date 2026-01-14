import * as THREE from 'three'

export class ExtruderEngine {
    static extrudeApartment(points: [number, number][], floorLevel: number, ceilingHeight: number = 3.0) {
        if (!points || points.length === 0) return null

        const shape = new THREE.Shape()
        shape.moveTo(points[0][0], points[0][1])
        for (let i = 1; i < points.length; i++) {
            shape.lineTo(points[i][0], points[i][1])
        }
        shape.closePath()

        const extrudeSettings = {
            depth: ceilingHeight,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 2
        }

        // Vertical position: (Floor - 1) * Height
        const y = (floorLevel - 1) * ceilingHeight

        return {
            shape,
            extrudeSettings,
            y
        }
    }

    static createBuildingSpine(height: number, width: number = 4, depth: number = 4) {
        // Simple core geometry
        return new THREE.BoxGeometry(width, height, depth)
    }

    static map2DTo3D(pixelX: number, pixelY: number, scale: number = 0.1): [number, number] {
        return [pixelX * scale, pixelY * scale]
    }
}
