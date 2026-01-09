'use client'
import { FileSignature } from 'lucide-react'

export default function SignPage() {
  return (
    <div className="p-12 text-center max-w-2xl mx-auto mt-20 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
        <FileSignature size={40} />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-slate-900">Sähköinen allekirjoitus</h1>
      <p className="text-slate-500 mb-8">
        Tämä osio on integroitu ulkoiseen allekirjoituspalveluun (esim. Visma Sign tai DocuSign). 
        Tunnistautuminen vaaditaan asiakirjojen virallista hyväksyntää varten.
      </p>
      <button className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
        Tunnistaudu (Demo)
      </button>
    </div>
  )
}
