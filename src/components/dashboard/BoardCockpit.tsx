"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { WorkflowState } from '@/components/orchestrator/WorkflowEngine'
import { ArrowRight, CheckCircle2, AlertTriangle, PlayCircle, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { CommunityPulse } from './CommunityPulse'

interface PulseItem {
    id: string
    type: 'ALERT' | 'INFO' | 'SUCCESS'
    source: 'LEAK' | 'SAUNA' | 'CONSTRUCTION'
    message: string
    timestamp: string
}

interface BoardCockpitProps {
    workflowState: WorkflowState
    pulseItems: PulseItem[]
}

export function BoardCockpit({ workflowState, pulseItems }: BoardCockpitProps) {
    const { currentPhase, healthScore, nextActions, metrics } = workflowState

    const phases = ['SCAN', 'OPTIMIZE', 'FUND', 'EXECUTE', 'SETTLE']
    const currentPhaseIdx = phases.indexOf(currentPhase)

    return (
        <div className="space-y-6">
            {/* Global Health Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
                        {healthScore}%
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Yhtiön Terveys</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className={metrics.complianceStatus === 'OK' ? 'text-green-500' : 'text-red-500'}>
                                {metrics.complianceStatus === 'OK' ? 'Compliant' : 'Attention Needed'}
                            </span>
                            <span>•</span>
                            <span>BIG: {metrics.investmentGrade}</span>
                        </div>
                    </div>
                </div>
                
                <div className="hidden md:flex flex-1 gap-1">
                    {phases.map((phase, i) => (
                        <div key={phase} className="flex-1 flex flex-col items-center gap-2">
                            <div className={`h-1 w-full rounded-full ${i <= currentPhaseIdx ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                            <span className={`text-[10px] font-bold ${i === currentPhaseIdx ? 'text-emerald-400' : 'text-slate-600'}`}>
                                {phase}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        <ShieldCheck className="w-4 h-4 mr-2" /> Audit Trail
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Action Feed (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Toimenpiteet (Action Center)</h2>
                    
                    {nextActions.length === 0 && (
                        <Card className="bg-slate-900 border-slate-800 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-slate-500">
                                <CheckCircle2 className="w-10 h-10 mb-4 text-emerald-500/50" />
                                <p>Kaikki ajan tasalla. Ei vaadittuja toimenpiteitä.</p>
                            </CardContent>
                        </Card>
                    )}

                    {nextActions.map(action => (
                        <Card key={action.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-lg ${
                                    action.type === 'URGENT' ? 'bg-red-500/10 text-red-500' : 
                                    action.type === 'OPPORTUNITY' ? 'bg-blue-500/10 text-blue-500' : 
                                    'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                    {action.type === 'URGENT' ? <AlertTriangle className="w-6 h-6" /> : 
                                     action.type === 'OPPORTUNITY' ? <Zap className="w-6 h-6" /> : 
                                     <PlayCircle className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                            {action.title}
                                        </h3>
                                        <Badge variant="outline" className="border-slate-700 text-slate-500">
                                            {action.phase}
                                        </Badge>
                                    </div>
                                    <p className="text-slate-400 mt-1 mb-4">{action.description}</p>
                                    <Button asChild className={
                                        action.type === 'URGENT' ? 'bg-red-600 hover:bg-red-700' : 
                                        'bg-slate-800 hover:bg-slate-700 text-white'
                                    }>
                                        <Link href={action.actionUrl}>
                                            Suorita Tehtävä <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sidebar / Pulse */}
                <div className="space-y-6">
                    <CommunityPulse items={pulseItems} />
                    
                    {/* Progressive Disclosure Widget */}
                    {currentPhase === 'FUND' && (
                        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/30">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">Rahoitustilanne</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white mb-2">3 Tarjousta</div>
                                <p className="text-xs text-indigo-200 mb-4">Paras korko: 3.85% (OP)</p>
                                <Progress value={66} className="h-1 bg-indigo-950" indicatorClassName="bg-indigo-400" />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
