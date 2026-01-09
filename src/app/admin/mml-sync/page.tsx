'use client'
import { useStore, MockMMLSyncLog } from '@/lib/store'
import { Database, RefreshCw, CheckCircle2, XCircle, FileJson } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

export default function MMLSyncPage() {
  const { mmlSyncLogs, renovations, addMMLSyncLog } = useStore()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = () => {
    setIsSyncing(true)
    // Simulate API call to Maanmittauslaitos
    setTimeout(() => {
      const success = Math.random() > 0.2 // 80% success chance
      const log: MockMMLSyncLog = {
        id: `sync-${Date.now()}`,
        status: success ? 'SUCCESS' : 'FAILED',
        recordCount: renovations.filter(r => r.status === 'COMPLETED').length,
        timestamp: new Date()
      }
      addMMLSyncLog(log)
      setIsSyncing(false)
    }, 2000)
  }

  // Mini-classification mapping (Mock)
  const mappedRenovations = renovations.filter(r => r.status === 'COMPLETED').map(r => ({
    ...r,
    mmlCode: r.component.includes('Katto') ? '112 VESIKATTO' : 
             r.component.includes('Putki') ? '211 KÄYTTÖVESI' : '999 MUU'
  }))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="text-[#002f6c]" />
          MML Tietopalvelu
        </h1>
        <p className="text-slate-500 mt-1">
          Hallinnoi lakisääteisiä ilmoituksia Maanmittauslaitoksen huoneistotietojärjestelmään.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sync Controls */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <RefreshCw size={20} className={isSyncing ? "animate-spin text-blue-600" : "text-slate-400"} />
            Synkronoi tiedot
          </h2>
          
          <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
            <div className="text-sm font-medium text-slate-700 mb-2">Valmiina lähetettäväksi:</div>
            <div className="flex items-center gap-2">
               <span className="text-2xl font-bold text-slate-900">{mappedRenovations.length}</span>
               <span className="text-sm text-slate-500">korjaushanketta</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Sisältää: {mappedRenovations.map(r => r.component).join(', ')}
            </div>
          </div>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full bg-[#002f6c] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSyncing ? 'Lähetetään...' : 'Lähetä tiedot rekisteriin'}
          </button>
        </div>

        {/* Sync History */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Historia</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {mmlSyncLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  {log.status === 'SUCCESS' ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <XCircle size={18} className="text-red-500" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-700">
                      {log.status === 'SUCCESS' ? 'Onnistunut siirto' : 'Virhe siirrossa'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {log.timestamp.toLocaleDateString()} klo {log.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                  {log.recordCount} rec
                </div>
              </div>
            ))}
            {mmlSyncLogs.length === 0 && <p className="text-sm text-slate-400 italic">Ei aiempia siirtoja.</p>}
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-x-auto">
        <div className="flex items-center gap-2 mb-4 text-white font-bold">
           <FileJson size={18} />
           JSON Payload Preview
        </div>
        <pre>{JSON.stringify(mappedRenovations.map(r => ({
          id: r.id,
          code: r.mmlCode,
          description: r.description,
          completed: r.yearDone
        })), null, 2)}</pre>
      </div>
    </div>
  )
}
