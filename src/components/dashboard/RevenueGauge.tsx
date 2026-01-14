'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusGauge } from '@/components/ui/status-gauge' // Assuming this exists or I'll implement a simple one

export function RevenueGauge({ 
    paidAmount, 
    budgetedAmount, 
    paidCount, 
    totalCount 
}: { 
    paidAmount: number
    budgetedAmount: number
    paidCount: number
    totalCount: number
}) {
    const revenuePct = Math.min(100, Math.round((paidAmount / budgetedAmount) * 100))
    const participationPct = Math.min(100, Math.round((paidCount / totalCount) * 100))

    return (
        <Card className="border-brand-navy/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Tulokertymä (Revenue)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                        {/* Simple SVG Gauge */}
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={revenuePct > 95 ? "#10b981" : revenuePct > 80 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="3"
                                strokeDasharray={`${revenuePct}, 100`}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-bold text-brand-navy">{revenuePct}%</span>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-brand-navy">
                            {paidAmount.toLocaleString('fi-FI')} €
                        </p>
                        <p className="text-sm text-gray-500">
                            / {budgetedAmount.toLocaleString('fi-FI')} € tavoite
                        </p>
                        <div className="text-xs font-medium text-brand-emerald bg-brand-emerald/10 px-2 py-1 rounded inline-block mt-1">
                            {paidCount} / {totalCount} asuntoa maksanut
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
