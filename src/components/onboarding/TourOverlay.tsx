'use client'
import { useState } from 'react'
import { ArrowRight, Check, Hand, User, Building2, Bell, ShieldCheck, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '@/lib/store'

type Props = {
  step: number
  onNext: () => void
  onComplete: () => void
}

export function TourOverlay({ step, onNext, onComplete }: Props) {
  const { currentUser } = useStore()
  const [selectedRole, setSelectedRole] = useState<'RESIDENT' | 'BOARD' | null>(
    currentUser?.role === 'BOARD_MEMBER' || currentUser?.role === 'ADMIN' ? 'BOARD' : 'RESIDENT'
  )

  // Step 1: Swipe / Welcome
  // Step 2: Role Selection (Skipped if user profile exists)
  // Step 3: Select Apartment (Skipped if user profile exists)
  // Step 4: Finish

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex flex-col justify-end pb-24 md:pb-12 px-4 items-center bg-black/20 backdrop-blur-[2px]">
       
       {/* Animated Hand for Step 1 */}
       {step === 1 && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="animate-bounce">
                <Hand size={64} className="text-white drop-shadow-lg" />
            </div>
            <p className="text-white font-bold text-lg mt-4 drop-shadow-md text-center">Pyyhkäise tai raahaa<br/>pyörittääksesi</p>
         </div>
       )}

       <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-2xl w-full max-w-sm transition-all duration-500 animate-in slide-in-from-bottom-10 fade-in">
          
          {/* Step 1: Intro */}
          {step === 1 && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {currentUser ? `Hei ${currentUser.name.split(' ')[0]}!` : 'Tervetuloa Talovahtiin'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {currentUser 
                    ? `Olemme tunnistaneet sinut asunnon ${currentUser.apartmentId || currentUser.apartmentNumber || ''} ${currentUser.role === 'BOARD_MEMBER' ? 'hallituksen jäseneksi' : 'asukkaaksi'}.`
                    : 'Tutustu taloyhtiösi digitaaliseen kaksoseen.'}
                </p>
              </div>
              <button onClick={onNext} className="w-full py-3 bg-[#002f6c] text-white rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2">
                Aloita kierros <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 text-center">Kuka olet?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedRole('RESIDENT')}
                  className={clsx("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                    selectedRole === 'RESIDENT' ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 hover:border-blue-300"
                  )}
                >
                  <User size={24} />
                  <span className="font-bold text-sm">Asukas</span>
                </button>
                <button 
                  onClick={() => setSelectedRole('BOARD')}
                  className={clsx("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                    selectedRole === 'BOARD' ? "border-purple-600 bg-purple-50 text-purple-900" : "border-slate-200 hover:border-purple-300"
                  )}
                >
                  <ShieldCheck size={24} />
                  <span className="font-bold text-sm">Hallitus</span>
                </button>
              </div>
              <button 
                disabled={!selectedRole}
                onClick={onNext}
                className="w-full py-3 bg-[#002f6c] text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Jatka
              </button>
            </div>
          )}

          {/* Step 3: Select Apartment */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600">
                <Hand size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Valitse asuntosi</h3>
                <p className="text-sm text-slate-500 mt-1">Napauta 3D-mallista omaa asuntoasi jatkaaksesi.</p>
              </div>
            </div>
          )}

          {/* Step 4: Finish */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
                <Bell size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pysy ajan tasalla</h3>
              <p className="text-sm text-slate-500">
                {(selectedRole === 'BOARD' || currentUser?.role === 'BOARD_MEMBER' || currentUser?.role === 'ADMIN')
                  ? "Salli ilmoitukset hyväksyäksesi laskut nopeasti."
                  : "Salli ilmoitukset saadaksesi tiedon huoltokatkoista."}
              </p>
              
              <div className="pt-2 space-y-2">
                <button onClick={onComplete} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Check size={18} /> Salli ja Valmis
                </button>
                <button onClick={onComplete} className="w-full py-2 text-slate-400 text-sm font-medium hover:text-slate-600">
                  Ei nyt
                </button>
              </div>
            </div>
          )}

       </div>
    </div>
  )
}
