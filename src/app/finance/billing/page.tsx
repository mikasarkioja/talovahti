'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'

// Mock Data
const MOCK_INVOICES = [
    {
        id: '1',
        period: new Date(2026, 1, 1), // Feb
        dueDate: new Date(2026, 1, 5),
        amount: 350.50,
        status: 'PENDING',
        ref: '100054321'
    },
    {
        id: '2',
        period: new Date(2026, 0, 1), // Jan
        dueDate: new Date(2026, 0, 5),
        amount: 350.50,
        status: 'PAID',
        ref: '100012345'
    },
    {
        id: '3',
        period: new Date(2025, 11, 1), // Dec
        dueDate: new Date(2025, 11, 5),
        amount: 345.00,
        status: 'PAID',
        ref: '100009876'
    }
]

export default function BillingPage() {
    const nextInvoice = MOCK_INVOICES.find(i => i.status === 'PENDING')

    return (
        <div className="container mx-auto py-8 space-y-8 px-4">
            <div>
                <h1 className="text-3xl font-bold text-brand-navy">Omat Laskut</h1>
                <p className="text-gray-500">Hoitovastikkeet ja käyttökorvaukset.</p>
            </div>

            {/* NEXT DUE */}
            {nextInvoice && (
                <Card className="border-brand-navy/10 bg-surface-lichen/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-brand-navy" />
                            Seuraava Eräpäivä
                        </CardTitle>
                        <CardDescription>Maksa viimeistään {format(nextInvoice.dueDate, 'd.M.yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-500">Summa</span>
                            <span className="text-3xl font-bold text-brand-navy">{nextInvoice.amount.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-500">Viitenumero</span>
                            <span className="font-mono text-lg">{nextInvoice.ref}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-500">Tilinumero</span>
                            <span className="font-mono text-sm">FI12 3456 7890 1234 56</span>
                        </div>
                        <Button className="w-full bg-brand-navy h-12 text-lg">
                            Maksa Verkkopankissa
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* HISTORY */}
            <Card className="border-brand-navy/10">
                <CardHeader>
                    <CardTitle>Maksuhistoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {MOCK_INVOICES.map((inv) => (
                            <div key={inv.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${inv.status === 'PAID' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                        <FileText className={`h-4 w-4 ${inv.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-brand-navy">Vastike {format(inv.period, 'MMMM yyyy', { locale: fi })}</p>
                                        <p className="text-xs text-gray-500">Eräpäivä {format(inv.dueDate, 'd.M.yyyy')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{inv.amount.toFixed(2)} €</p>
                                    <Badge variant="outline" className={`
                                        ${inv.status === 'PAID' ? 'text-green-600 border-green-200 bg-green-50' : 'text-amber-600 border-amber-200 bg-amber-50'}
                                    `}>
                                        {inv.status === 'PAID' ? 'Maksettu' : 'Avoin'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
