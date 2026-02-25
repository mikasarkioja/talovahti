import * as THREE from 'three'

export type ApartmentLayout = {
    id: string
    staircase: string
    stackId: string // e.g. A-1 (Staircase A, Position 1)
    floor: number
    number: number
    areaM2: number
    balcony: boolean
    position: [number, number, number] // Center position of the unit
    dimensions: [number, number, number] // Bounding box for fallback
    polygonPoints: [number, number][] // 2D footprint relative to center
    rooms: number
    rotation?: number
}

export type POI = {
    id: string
    label: string
    type: 'SAUNA' | 'LAUNDRY' | 'STORAGE' | 'TECHNICAL'
    position: [number, number, number]
}

export type BuildingConfig = {
    shape: 'I' | 'L'
    staircases: string[]
    floors: number
    unitsPerFloor: number
    floorHeight?: number
    aptDepth?: number
    staircaseWidth?: number
    turnAtStaircase?: string // For L-shape, where the turn occurs
}

export const BuildingGenerator = {
    generateLayout(config?: BuildingConfig): { apartments: ApartmentLayout[], pois: POI[], buildingDimensions: [number, number, number] } {
        const apartments: ApartmentLayout[] = []
        
        // Defaults
        const shape = config?.shape || 'I'
        const staircases = config?.staircases || ['A', 'B', 'C']
        const floors = config?.floors || 4
        const unitsPerFloor = config?.unitsPerFloor || 3
        const floorHeight = config?.floorHeight || 3.0
        const aptDepth = config?.aptDepth || 10.0
        const staircaseWidth = config?.staircaseWidth || 4.0
        const turnAtStaircase = config?.turnAtStaircase || 'B'

        // Base unit dimensions
        const uWidths = [5.0, 3.5, 6.0] // Default unit widths for variation
        
        // Define Shapes relative to local center (0,0)
        const unitPolys: [number, number][][] = [
            // Unit 1 (Rect)
            [[-2.5, -5], [2.5, -5], [2.5, 5], [-2.5, 5]],
            // Unit 2 (Rect)
            [[-1.75, -5], [1.75, -5], [1.75, 5], [-1.75, 5]],
            // Unit 3 (L-Shape cutout)
            [[-3, -5], [3, -5], [3, 3], [1, 3], [1, 5], [-3, 5]]
        ]

        let currentX = 0
        let currentZ = 0
        let direction: [number, number] = [1, 0] // Start moving along X

        staircases.forEach((stair, sIndex) => {
            // Check for turn in L-shape
            if (shape === 'L' && stair === turnAtStaircase && sIndex > 0) {
                direction = [0, 1] // Turn towards Z
            }

            const sectionWidth = uWidths.slice(0, unitsPerFloor).reduce((a, b) => a + b, 0)
            
            for (let f = 1; f <= floors; f++) {
                const y = (f - 1) * floorHeight + (floorHeight / 2)

                let sectionOffset = 0
                for (let u = 0; u < unitsPerFloor; u++) {
                    const uWidth = uWidths[u]
                    const centerInRow = sectionOffset + uWidth / 2
                    
                    // Position calculation based on direction
                    const posX = currentX + direction[0] * centerInRow
                    const posZ = currentZ + direction[1] * centerInRow

                    // Rotation of the apartment if it's on the turned wing
                    const rotation = direction[1] !== 0 ? Math.PI / 2 : 0

                    apartments.push({
                        id: `${stair} ${((f - 1) * unitsPerFloor) + u + 1}`,
                        staircase: stair,
                        stackId: `${stair}-${u + 1}`,
                        floor: f,
                        number: u + 1,
                        areaM2: Math.round(uWidth * aptDepth * 0.9), // rough estimate
                        balcony: u % 2 === 0,
                        position: [posX, y, posZ],
                        dimensions: [uWidth, floorHeight, aptDepth],
                        polygonPoints: unitPolys[u % unitPolys.length],
                        rooms: u + 1,
                        rotation: rotation
                    })
                    sectionOffset += uWidth
                }
            }
            
            // Advance for next staircase
            currentX += direction[0] * (sectionWidth + staircaseWidth)
            currentZ += direction[1] * (sectionWidth + staircaseWidth)
        })

        // Simple centering logic (find bounds and shift)
        const minX = Math.min(...apartments.map(a => a.position[0]))
        const maxX = Math.max(...apartments.map(a => a.position[0]))
        const minZ = Math.min(...apartments.map(a => a.position[2]))
        const maxZ = Math.max(...apartments.map(a => a.position[2]))
        
        const offsetX = (minX + maxX) / 2
        const offsetZ = (minZ + maxZ) / 2
        
        apartments.forEach(a => {
            a.position[0] -= offsetX
            a.position[2] -= offsetZ
        })

        const totalWidth = maxX - minX + uWidths[0]
        const totalDepth = maxZ - minZ + aptDepth

        const pois: POI[] = [
            { id: 'sauna-a', label: 'Talosauna', type: 'SAUNA', position: [0, -1.5, 2] },
            { id: 'tech', label: 'Tekninen tila', type: 'TECHNICAL', position: [offsetX - 2, -1.5, -2] }
        ]

        return {
            apartments,
            pois,
            buildingDimensions: [totalWidth, floors * floorHeight, totalDepth]
        }
    }
}
