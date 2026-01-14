'use client'
import { useState } from 'react'
import { generateMinutesMarkdown, MeetingMinutesData } from '@/lib/minutes-generator'
import { useStore } from '@/lib/store'
import { calculateWeightedResult } from '@/lib/voting-logic'
import { FileText, Download, Check, Sparkles } from 'lucide-react'

export default function LibraryPage() {
  const { initiatives, currentUser } = useStore()
  const [minutes, setMinutes] = useState<string | null>(null)

  const handleGenerate = () => {
    // Mock: Use initiatives in VOTING or CLOSED as "Decisions" for this meeting
    // In real app, we would select a specific meeting context
    const decisionItems = initiatives.filter(i => i.status === 'VOTING' || i.status === 'APPROVED' || i.status === 'REJECTED')
    
    const data: MeetingMinutesData = {
      title: 'Ylimääräinen yhtiökokous',
      date: new Date(),
      type: 'GENERAL',
      location: 'Taloyhtiö OS - Virtuaalikokous',
      chairmanName: 'Matti Meikäläinen', // Mock
      secretaryName: currentUser?.name || 'Kirjaaja',
      attendeeCount: 15, // Mock
      totalSharesRepresented: 850, // Mock
      decisions: decisionItems.map(init => {
        const res = calculateWeightedResult(init.votes)
        const passed = res.yes > res.no
        return {
          title: init.title,
          description: init.description,
          proposal: 'Hallituksen pohjaehdotus',
          decision: passed ? 'PASSED' : 'REJECTED',
          voteResult: { yes: res.yes, no: res.no, abstain: res.abstain }
        }
      })
    }
    
    const md = generateMinutesMarkdown(data)
    setMinutes(md)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Asiakirjakirjasto
          </h1>
          <p className="text-slate-500 mt-1">Selaa ja luo pöytäkirjoja.</p>
        </div>
        
        <button 
          onClick={handleGenerate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Sparkles size={18} className="text-yellow-400" />
          Luo pöytäkirja (AI)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Document List (Mock) */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-700">Viimeisimmät asiakirjat</h2>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Yhtiökokous 202{5-i}</div>
                  <div className="text-xs text-slate-500">12.04.202{5-i} • Allekirjoitettu</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Editor / Preview Area */}
        <div className="md:col-span-2">
          {minutes ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <span className="font-medium text-slate-700">Esikatselu: Luonnos</span>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1">
                    <Check size={14} /> Allekirjoita
                  </button>
                  <button className="text-xs px-3 py-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 flex items-center gap-1">
                    <Download size={14} /> Lataa PDF
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-8 font-mono text-sm bg-white">
                <pre className="whitespace-pre-wrap">{minutes}</pre>
              </div>
            </div>
          ) : (
            <div className="h-[600px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Sparkles size={48} className="mx-auto mb-4 text-slate-200" />
                <p>Valitse "Luo pöytäkirja" generoidaksesi uuden luonnoksen.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
