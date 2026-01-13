// Mock Indices
const CONSTRUCTION_COST_INDEX = 1.035; // +3.5% annual
const ENERGY_INFLATION = 1.05; // +5% annual

// KH-kortti Mocks
const KH_STANDARDS: Record<string, { life: number, price: number }> = {
    'WINDOWS': { life: 40, price: 450 },
    'ROOF': { life: 30, price: 120 },
    'PIPE': { life: 50, price: 900 },
    'FACADE': { life: 35, price: 300 },
}

export const scenarioPlanner = {
    estimateHistoricalCost(category: string, year: number, buildingM2: number) {
        const standard = KH_STANDARDS[category.toUpperCase()] || { price: 200 };
        const currentCost = standard.price * buildingM2;
        
        const yearsAgo = new Date().getFullYear() - year;
        // Deflate
        return currentCost / Math.pow(CONSTRUCTION_COST_INDEX, yearsAgo);
    },

    forecastPTSCost(project: { type: string, area?: number, estimatedCost?: number }, buildingM2: number) {
        if (project.estimatedCost) return project.estimatedCost;

        const category = project.type.toUpperCase();
        const standard = KH_STANDARDS[category];
        
        if (!standard) return 50000; // Fallback

        // Synergy Discount Logic would go here if we had project overlaps
        // For now, simple unit price * area
        const area = project.area || buildingM2;
        return standard.price * area;
    },

    calculateSynergy(projects: { year: number, type: string, cost: number }[]) {
        // Group by year
        const byYear: Record<number, typeof projects> = {};
        projects.forEach(p => {
            if (!byYear[p.year]) byYear[p.year] = [];
            byYear[p.year].push(p);
        });

        let totalSavings = 0;
        
        Object.values(byYear).forEach(group => {
            if (group.length > 1) {
                // If Facade + Windows -> Save 15% on Scaffolding (approx 5% of total)
                const types = group.map(p => p.type);
                if (types.includes('FACADE') && types.includes('WINDOWS')) {
                    const totalCost = group.reduce((sum, p) => sum + p.cost, 0);
                    totalSavings += totalCost * 0.05;
                }
            }
        });

        return totalSavings;
    }
}
