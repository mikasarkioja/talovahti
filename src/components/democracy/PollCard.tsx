"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, TrendingUp, TrendingDown, Lock } from 'lucide-react'

type PollOption = {
    id: string
    label: string
    vastikeImpact: number // e.g. 0.50 (€/m2/mo)
    votes: number
}

type PollProps = {
    id: string
    title: string
    description: string
    expiresAt: string
    userRole: 'OWNER' | 'RESIDENT'
    options: PollOption[]
    totalVotes: number
}

// Mock Data
const MOCK_POLL = {
    id: 'poll-1',
    title: 'Energiaremontin Valinta',
    description: 'Valitse taloyhtiölle paras tapa parantaa energiatehokkuutta. Päätös vaikuttaa tuleviin vastikkeisiin.',
    expiresAt: '2026-06-30',
    userRole: 'OWNER' as const, // Hardcoded for demo
    totalVotes: 45,
    options: [
        { id: 'opt-1', label: 'Maalämpö (GSHP)', vastikeImpact: 1.50, votes: 25 },
        { id: 'opt-2', label: 'Aurinkopaneelit + LTO', vastikeImpact: 0.40, votes: 15 },
        { id: 'opt-3', label: 'Ei toimenpiteitä', vastikeImpact: 0.00, votes: 5 }
    ]
}

export default function PollCard() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isVoted, setIsVoted] = useState(false)
  const [poll, setPoll] = useState(MOCK_POLL)

  // Calculate user's apartment size (Mock)
  const APARTMENT_SIZE_M2 = 75

  const handleVote = () => {
    if (!selectedOption) return
    setIsVoted(true)
    // Simulate API call to register vote
    const updatedOptions = poll.options.map(opt => 
        opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
    )
    setPoll({ ...poll, options: updatedOptions, totalVotes: poll.totalVotes + 1 })
  }

  const selectedOptionData = poll.options.find(o => o.id === selectedOption)

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-emerald-100">
      <CardHeader className="bg-emerald-50/50 pb-4">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-bold text-emerald-950">{poll.title}</CardTitle>
                <CardDescription className="text-emerald-700/80 mt-1">{poll.description}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white text-emerald-600 border-emerald-200 whitespace-nowrap">
                Äänestys (Osakkaat)
            </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {!isVoted ? (
            // Voting View
            <div className="space-y-3">
                {poll.options.map((option) => (
                    <div 
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedOption === option.id 
                                ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                                : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-900">{option.label}</span>
                            {selectedOption === option.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </div>
                        
                        {/* Cost Impact Preview */}
                        <div className="mt-2 text-xs flex items-center gap-2">
                             <Badge variant="secondary" className={`${option.vastikeImpact > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                {option.vastikeImpact > 0 ? '+' : ''}{option.vastikeImpact.toFixed(2)} €/m²/kk
                             </Badge>
                             <span className="text-slate-400">
                                (Arvio asunnollesi: <span className="font-mono font-bold text-slate-600">{(option.vastikeImpact * APARTMENT_SIZE_M2).toFixed(2)} €/kk</span>)
                             </span>
                        </div>
                    </div>
                ))}

                {poll.userRole !== 'OWNER' && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded text-sm">
                        <Lock className="w-4 h-4" />
                        <span>Vain osakkaat voivat äänestää sitovasti. Voit jättää vain palautetta.</span>
                    </div>
                )}
            </div>
        ) : (
            // Results View
            <div className="space-y-4 animate-in fade-in duration-500">
                {poll.options.map((option) => {
                    const percentage = Math.round((option.votes / poll.totalVotes) * 100)
                    return (
                        <div key={option.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className={selectedOption === option.id ? 'font-bold text-emerald-700' : ''}>
                                    {option.label} {selectedOption === option.id && '(Sinun äänesi)'}
                                </span>
                                <span className="font-mono font-bold">{percentage}%</span>
                            </div>
                            <Progress value={percentage} className={`h-2 ${selectedOption === option.id ? 'bg-emerald-100' : ''}`} />
                        </div>
                    )
                })}
                <div className="pt-4 text-center text-sm text-slate-500">
                    Yhteensä {poll.totalVotes} ääntä annettu.
                </div>
            </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50 border-t p-4 flex justify-between items-center">
        <div className="text-xs text-slate-400">
            Sulkeutuu: {poll.expiresAt}
        </div>
        {!isVoted && (
            <Button onClick={handleVote} disabled={!selectedOption || poll.userRole !== 'OWNER'} className="bg-emerald-600 hover:bg-emerald-700">
                Vahvista Ääni
            </Button>
        )}
      </CardFooter>
    </Card>
  )
}
