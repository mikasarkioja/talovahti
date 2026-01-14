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
}

export type POI = {
    id: string
    label: string
    type: 'SAUNA' | 'LAUNDRY' | 'STORAGE' | 'TECHNICAL'
    position: [number, number, number]
}

export const BuildingGenerator = {
    generateLayout(): { apartments: ApartmentLayout[], pois: POI[], buildingDimensions: [number, number, number] } {
        const apartments: ApartmentLayout[] = []
        const staircases = ['A', 'B', 'C']
        const floors = 4 // 1-4
        const unitsPerFloor = 3 // 1-3

        // Dimensions (meters)
        const floorHeight = 3.0
        const aptDepth = 10.0
        const staircaseWidth = 4.0
        
        // Define Shapes relative to local center (0,0)
        // Unit 1 (Left): 5m wide rect
        const u1Width = 5.0
        const u1Poly: [number, number][] = [
            [-u1Width/2, -aptDepth/2], [u1Width/2, -aptDepth/2],
            [u1Width/2, aptDepth/2], [-u1Width/2, aptDepth/2]
        ]
        
        // Unit 2 (Middle): 3.5m wide rect
        const u2Width = 3.5
        const u2Poly: [number, number][] = [
            [-u2Width/2, -aptDepth/2], [u2Width/2, -aptDepth/2],
            [u2Width/2, aptDepth/2], [-u2Width/2, aptDepth/2]
        ]

        // Unit 3 (Right): L-Shape (6m wide, but with cutout)
        const u3Width = 6.0
        // L-shape: Full rect minus 2x2 corner at top right
        // Local coords: w/2=3, d/2=5. TopRight corner is [3, 5]
        const u3Poly: [number, number][] = [
            [-3, -5], [3, -5], // Bottom edge
            [3, 3], // Right edge up to cutout start
            [1, 3], // Cutout horizontal in
            [1, 5], // Cutout vertical up
            [-3, 5] // Top edge left
        ]

        let currentX = 0

        staircases.forEach((stair, sIndex) => {
            for (let f = 1; f <= floors; f++) {
                const y = (f - 1) * floorHeight + (floorHeight / 2)

                // Unit 1: Left of staircase
                const u1X = currentX + u1Width / 2
                apartments.push({
                    id: `${stair} ${((f - 1) * unitsPerFloor) + 1 + (sIndex * floors * unitsPerFloor)}`,
                    staircase: stair,
                    stackId: `${stair}-1`,
                    floor: f,
                    number: 1,
                    areaM2: 45,
                    balcony: true,
                    position: [u1X, y, 0],
                    dimensions: [u1Width, floorHeight, aptDepth],
                    polygonPoints: u1Poly,
                    rooms: 2
                })

                // Unit 2: Middle (Studio)
                const u2X = currentX + u1Width + u2Width / 2
                apartments.push({
                    id: `${stair} ${((f - 1) * unitsPerFloor) + 2 + (sIndex * floors * unitsPerFloor)}`,
                    staircase: stair,
                    stackId: `${stair}-2`,
                    floor: f,
                    number: 2,
                    areaM2: 30,
                    balcony: false,
                    position: [u2X, y, 0],
                    dimensions: [u2Width, floorHeight, aptDepth],
                    polygonPoints: u2Poly,
                    rooms: 1
                })

                // Unit 3: Right (Family)
                const u3X = currentX + u1Width + u2Width + u3Width / 2
                apartments.push({
                    id: `${stair} ${((f - 1) * unitsPerFloor) + 3 + (sIndex * floors * unitsPerFloor)}`,
                    staircase: stair,
                    stackId: `${stair}-3`,
                    floor: f,
                    number: 3,
                    areaM2: 75,
                    balcony: true,
                    position: [u3X, y, 0],
                    dimensions: [u3Width, floorHeight, aptDepth],
                    polygonPoints: u3Poly,
                    rooms: 3
                })
            }
            
            // Advance X for next staircase
            currentX += (u1Width + u2Width + u3Width) + staircaseWidth
        })

        // Center the building
        const totalWidth = currentX - staircaseWidth
        const offsetX = totalWidth / 2
        apartments.forEach(a => {
            a.position[0] -= offsetX
        })

        const pois: POI[] = [
            { id: 'sauna-a', label: 'Lenkkisauna', type: 'SAUNA', position: [-offsetX + 5, -1.5, 2] },
            { id: 'laundry', label: 'Pesutupa', type: 'LAUNDRY', position: [0, -1.5, 2] },
            { id: 'tech', label: 'Lämmönjakohuone', type: 'TECHNICAL', position: [offsetX - 5, -1.5, -2] }
        ]

        return {
            apartments,
            pois,
            buildingDimensions: [totalWidth, floors * floorHeight, aptDepth]
        }
    }
}
