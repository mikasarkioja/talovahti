'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { BudgetVariance } from '@/lib/finance-analytics'

export function VarianceChart({ data }: { data: BudgetVariance[] }) {
  // Filter out tiny variances for cleaner chart
  const chartData = data.filter(d => Math.abs(d.absoluteVariance) > 50)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}€`} />
          <YAxis dataKey="label" type="category" width={100} stroke="#475569" fontSize={11} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload as BudgetVariance
                return (
                  <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                    <div className="font-bold mb-1">{d.label}</div>
                    <div className={d.absoluteVariance > 0 ? "text-red-600" : "text-emerald-600"}>
                      {d.absoluteVariance > 0 ? '+' : ''}{d.absoluteVariance.toLocaleString()} €
                    </div>
                    <div className="text-xs text-slate-500">
                      Budjetoitu: {d.budgeted.toLocaleString()} € <br/>
                      Toteutunut: {d.actual.toLocaleString()} €
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine x={0} stroke="#334155" />
          <Bar dataKey="absoluteVariance" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.absoluteVariance > 0 ? '#ef4444' : '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
