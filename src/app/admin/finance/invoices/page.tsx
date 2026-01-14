'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ActionCard } from '@/components/ui/action-card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, X, FileText, MapPin } from 'lucide-react'
import { AccountingProvider, PendingInvoice } from '@/lib/finance/accounting-provider'

export default function InvoiceApprovalPage() {
    const [invoices, setInvoices] = useState<PendingInvoice[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch mocks via client wrapper or server action. 
        // For prototype, we call library directly in useEffect (not ideal for prod but ok for mock)
        // In real app, utilize server actions.
        const load = async () => {
            // Mock fetching
            const data = await AccountingProvider.fetchPendingInvoices('mock-company-id')
            setInvoices(data)
            setLoading(false)
        }
        load()
    }, [])

    const handleApprove = async (id: string) => {
        toast.promise(AccountingProvider.approveInvoice(id, 'mock-user-id'), {
            loading: 'Vahvistetaan maksua...',
            success: () => {
                setInvoices(prev => prev.filter(i => i.id !== id))
                return 'Lasku hyväksytty maksuun.'
            },
            error: 'Virhe hyväksynnässä'
        })
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-brand-navy">Ostolaskujen Hyväksyntä</h1>
                    <p className="text-slate-500">Tarkasta ja hyväksy saapuneet laskut.</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>Päivitä</Button>
            </div>

            <div className="grid gap-4">
                {loading ? <p>Ladataan laskuja...</p> : invoices.length === 0 ? <p>Ei avoimia laskuja.</p> : invoices.map(inv => (
                    <ActionCard 
                        key={inv.id}
                        title={inv.vendor}
                        icon={FileText}
                        badgeText={`Erääntyy ${inv.dueDate}`}
                        badgeColor="amber"
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-4 mt-2">
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{inv.amount.toFixed(2)} €</div>
                                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    <span>Viite: {inv.id}</span>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-brand-emerald">
                                        <MapPin size={14} className="mr-1" /> Kohdista 3D-malliin
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Button variant="ghost" className="text-slate-500 hover:text-slate-900">Näytä PDF</Button>
                                <Button variant="destructive" size="sm" onClick={() => toast.error("Hylkäys ei implementoitu vielä")}>
                                    <X size={16} className="mr-2" /> Hylkää
                                </Button>
                                <Button variant="default" size="sm" className="bg-brand-emerald hover:bg-emerald-600" onClick={() => handleApprove(inv.id)}>
                                    <Check size={16} className="mr-2" /> Hyväksy
                                </Button>
                            </div>
                        </div>
                    </ActionCard>
                ))}
            </div>
        </div>
    )
}
