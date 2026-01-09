'use client'
import { useState } from 'react'
import { useStore, MockObservation, MockSolutionOption } from '@/lib/store'
import { Plus, Trash2, Check, ArrowRight } from 'lucide-react'

export function SolutionDesigner({ observation }: { observation: MockObservation }) {
  const { addSolutionOption } = useStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState<number>(0)
  const [lifeSpan, setLifeSpan] = useState<number>(0)
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addSolutionOption(observation.id, {
      id: `opt-${Date.now()}`,
      title,
      description,
      estimatedCost: cost,
      lifeSpanExtension: lifeSpan
    })
    setIsAdding(false)
    setTitle('')
    setDescription('')
    setCost(0)
    setLifeSpan(0)
  }

  if (!observation.assessment) return null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-slate-800">Korjausvaihtoehdot (Phase 2)</h4>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-1"
          >
            <Plus size={14} /> Lisää vaihtoehto
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Otsikko</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm"
              placeholder="Esim. Paikkakorjaus"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Kuvaus</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm"
              placeholder="Menetelmän kuvaus..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hinta-arvio (€)</label>
              <input 
                type="number" 
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Elinkaarihyöty (v)</label>
              <input 
                type="number" 
                value={lifeSpan}
                onChange={e => setLifeSpan(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded text-sm"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Peruuta
            </button>
            <button 
              type="submit"
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700"
            >
              Tallenna
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {observation.assessment.options?.map(opt => (
          <div key={opt.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm flex justify-between items-center group">
            <div>
              <div className="font-medium text-slate-900 text-sm">{opt.title}</div>
              <div className="text-xs text-slate-500">{opt.estimatedCost.toLocaleString()} € • +{opt.lifeSpanExtension} vuotta</div>
            </div>
            {/* Future: Edit/Delete actions */}
          </div>
        ))}
        {(!observation.assessment.options || observation.assessment.options.length === 0) && !isAdding && (
          <div className="text-center py-4 text-xs text-slate-400 italic bg-slate-50/50 rounded border border-dashed border-slate-200">
            Ei vaihtoehtoja määritelty.
          </div>
        )}
      </div>
    </div>
  )
}
