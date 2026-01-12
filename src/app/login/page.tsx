'use client'
import { Building2, ScanFace, ArrowRight, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBiometricLogin = () => {
    setLoading(true)
    // Simulate biometric delay
    setTimeout(() => {
        router.push('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#002f6c] rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6">
            <Building2 className="text-white h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tervetuloa takaisin</h1>
          <p className="text-slate-500">As Oy Esimerkki</p>
        </div>

        {/* Biometric Action */}
        <div className="space-y-4">
          <button 
            onClick={handleBiometricLogin}
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
                <span className="animate-pulse">Tunnistetaan...</span>
            ) : (
                <>
                    <ScanFace size={24} />
                    Kirjaudu FaceID:llä
                </>
            )}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Tai</span>
            </div>
          </div>

          <button className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            Käytä salasanaa
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <Smartphone size={12} />
            <span>Suojattu passkey-teknologialla</span>
        </div>
      </div>
    </div>
  )
}
