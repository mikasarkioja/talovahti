'use client'
import { useStore } from "@/lib/store"
import { calculateWeightedResult } from "@/lib/voting-logic"
import { WeightedVoteBar } from "@/components/governance/WeightedVoteBar"
import { VoteChoice } from "@prisma/client"
import { Scale } from "lucide-react"

export default function VotingPage() {
  const { initiatives, currentUser, castVote } = useStore()
  
  const activeVotes = initiatives.filter(i => i.status === 'VOTING')
  
  // Mock total shares possible (e.g., 1000 for this housing company)
  const TOTAL_SHARES = 1000

  const handleVote = (id: string, choice: VoteChoice) => {
    if (!currentUser) return
    castVote(id, currentUser.id, choice, currentUser.shareCount)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Avoimet äänestykset</h1>
        <p className="text-slate-500">Käytä äänioikeuttasi yhtiön asioihin.</p>
      </div>
      
      {activeVotes.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
          Ei aktiivisia äänestyksiä juuri nyt.
        </div>
      ) : (
        <div className="space-y-6">
          {activeVotes.map(init => {
            const hasVoted = init.votes.some(v => v.userId === currentUser?.id)
            const result = calculateWeightedResult(init.votes, TOTAL_SHARES)
            
            return (
              <div key={init.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{init.title}</h2>
                    <p className="text-slate-600 mt-1 leading-relaxed">{init.description}</p>
                  </div>
                  {hasVoted ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full border border-green-200 flex-shrink-0 ml-4">
                      Ääni annettu
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200 flex-shrink-0 ml-4 animate-pulse">
                      Äänestä nyt
                    </span>
                  )}
                </div>
                
                <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                   <h3 className="text-sm font-medium text-slate-700 mb-3">Reaaliaikainen tilanne</h3>
                   <WeightedVoteBar result={result} />
                </div>
                
                {!hasVoted && (
                  <div>
                    <div className="mb-3 flex items-center justify-end text-sm text-slate-500 font-medium">
                       <Scale size={16} className="mr-1 text-slate-400" />
                       Äänivaltasi tässä kohteessa: <span className="text-slate-900 ml-1">{currentUser?.shareCount} osaketta</span>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => handleVote(init.id, 'YES')}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow active:translate-y-0"
                      >
                        JAA (Kyllä)
                      </button>
                      <button 
                        onClick={() => handleVote(init.id, 'NO')}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow active:translate-y-0"
                      >
                        EI (Ei)
                      </button>
                      <button 
                        onClick={() => handleVote(init.id, 'ABSTAIN')}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow active:translate-y-0"
                      >
                        TYHJÄ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
