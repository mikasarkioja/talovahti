"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KanbanItem, escalateTicketToObservation, submitExpertAssessment, createProjectFromObservation, completeProject } from '@/app/actions/ops-actions'
import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList, Hammer, ShoppingCart, UserCheck, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface OpsBoardProps {
    items: KanbanItem[]
}

const COLUMNS = [
    { id: 'INBOX', title: 'Vikailmoitukset', icon: AlertCircle, color: 'text-red-400' },
    { id: 'ASSESSMENT', title: 'Kuntoarvio', icon: Search, color: 'text-blue-400' },
    { id: 'MARKETPLACE', title: 'Palvelutori', icon: ShoppingCart, color: 'text-purple-400' },
    { id: 'EXECUTION', title: 'Työn Alla', icon: Hammer, color: 'text-orange-400' },
    { id: 'VERIFICATION', title: 'Tarkastus', icon: UserCheck, color: 'text-emerald-400' },
]

export function OpsKanbanBoard({ items }: OpsBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null)
  const [dialogMode, setDialogMode] = useState<'ASSESS' | null>(null)
  const [verdict, setVerdict] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEscalate = async (id: string) => {
    setLoading(true)
    await escalateTicketToObservation(id)
    setLoading(false)
  }

  const handleAssessment = (item: KanbanItem) => {
    setActiveItem(item)
    setDialogMode('ASSESS')
  }

  const submitAssessment = async () => {
    if (!activeItem) return
    setLoading(true)
    await submitExpertAssessment(activeItem.id, verdict)
    setLoading(false)
    setDialogMode(null)
    setVerdict('')
  }

  const handleOrder = async (id: string) => {
    setLoading(true)
    await createProjectFromObservation(id)
    setLoading(false)
  }

  const handleVerify = async (id: string) => {
    setLoading(true)
    await completeProject(id)
    setLoading(false)
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-x-auto">
        <div className="flex gap-4 h-full min-w-[1200px]">
            {COLUMNS.map(col => {
                const colItems = items.filter(i => i.stage === col.id)
                const Icon = col.icon
                
                return (
                    <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-slate-900/50 rounded-xl border border-slate-800">
                        {/* Column Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Icon className={`w-5 h-5 ${col.color}`} />
                                <h3 className="font-semibold text-slate-200">{col.title}</h3>
                            </div>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                                {colItems.length}
                            </Badge>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                            {colItems.map(item => (
                                <Card key={item.id} className="bg-slate-950 border-slate-800 hover:border-slate-700 transition-all group">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className={`
                                                ${item.priority === 'CRITICAL' ? 'border-red-500 text-red-500' : 'border-slate-700 text-slate-500'}
                                            `}>
                                                {item.type}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(item.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardTitle className="text-sm font-medium text-white leading-tight">
                                            {item.title}
                                        </CardTitle>
                                        <p className="text-xs text-slate-400 mt-1">{item.subtitle}</p>
                                    </CardHeader>
                                    
                                    <CardFooter className="p-3 pt-0 flex justify-end">
                                        {/* Context Actions */}
                                        {col.id === 'INBOX' && (
                                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 w-full" onClick={() => handleEscalate(item.id)} disabled={loading}>
                                                Siirrä Kuntoarvioon <ArrowRight className="w-3 h-3 ml-2" />
                                            </Button>
                                        )}
                                        {col.id === 'ASSESSMENT' && (
                                            <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 w-full" onClick={() => handleAssessment(item)}>
                                                Anna Lausunto <ClipboardList className="w-3 h-3 ml-2" />
                                            </Button>
                                        )}
                                        {col.id === 'MARKETPLACE' && (
                                            <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 w-full" onClick={() => handleOrder(item.id)}>
                                                Tilaa Työ <ShoppingCart className="w-3 h-3 ml-2" />
                                            </Button>
                                        )}
                                        {col.id === 'VERIFICATION' && (
                                            <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 w-full" onClick={() => handleVerify(item.id)}>
                                                Hyväksy & Valmis <CheckCircle2 className="w-3 h-3 ml-2" />
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>

        {/* Dialogs */}
        <Dialog open={dialogMode === 'ASSESS'} onOpenChange={() => setDialogMode(null)}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Asiantuntijan Lausunto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-slate-400">Kohde: {activeItem?.title}</p>
                    <Textarea 
                        placeholder="Kirjoita tekninen arvio ja suositus..." 
                        className="bg-slate-950 border-slate-800 text-white min-h-[100px]"
                        value={verdict}
                        onChange={(e) => setVerdict(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setDialogMode(null)}>Peruuta</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitAssessment} disabled={loading}>
                        Tallenna & Siirrä Palvelutorille
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
