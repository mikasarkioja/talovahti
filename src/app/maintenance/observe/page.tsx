'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Camera, MapPin, Loader2, CheckCircle2 } from 'lucide-react'

export default function ObservePage() {
  const { addObservation, currentUser } = useStore()
  const router = useRouter()
  
  const [component, setComponent] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    addObservation({
      id: `obs-${Date.now()}`,
      component,
      description,
      status: 'OPEN',
      location: 'Määrittelemätön', // In real app, would come from 3D model pick
      userId: currentUser?.id || 'anon',
      createdAt: new Date(),
      imageUrl: null
    })
    
    setSuccess(true)
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Havainto kirjattu!</h2>
        <p className="text-slate-500 mt-2">
          Asiantuntija arvioi havaintosi ja saat ilmoituksen, kun se on käsitelty.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ilmoita havainto</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ota kuva ja kuvaile vaurio tai huoltotarve. Tämä auttaa kuntoarvion laatimisessa.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Photo Upload Mock */}
        <div className="aspect-video bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
          <Camera size={32} className="mb-2" />
          <span className="text-sm font-medium">Ota kuva tai valitse tiedosto</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rakennusosa</label>
          <select 
            value={component} 
            onChange={e => setComponent(e.target.value)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Valitse kohde...</option>
            <option value="Vesikatto">Vesikatto</option>
            <option value="Julkisivu">Julkisivu</option>
            <option value="Ikkunat">Ikkunat</option>
            <option value="Parveke">Parveke</option>
            <option value="Piha-alue">Piha-alue</option>
            <option value="Sisätilat">Sisätilat</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kuvaus</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Mitä havaitsit? Missä vaurio sijaitsee tarkalleen?"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 bg-[#002f6c] hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Lähetetään...
            </>
          ) : (
            <>
              <MapPin size={20} /> Lähetä havainto
            </>
          )}
        </button>

      </form>
    </div>
  )
}
