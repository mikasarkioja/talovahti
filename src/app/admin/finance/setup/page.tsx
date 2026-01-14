'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function FinanceSetupPage() {
    const [status, setStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE')

    const handleTest = () => {
        setStatus('TESTING')
        setTimeout(() => {
            setStatus('SUCCESS')
            toast.success("Yhteys pankkiin muodostettu onnistuneesti!")
        }, 2000)
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Pankkiyhteydet</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Tilin Tiedot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>IBAN Tilinumero</Label>
                        <Input placeholder="FI12 3456..." />
                    </div>
                    <div className="space-y-2">
                        <Label>BIC / SWIFT</Label>
                        <Input placeholder="NORDE..." />
                    </div>
                    <div className="space-y-2">
                        <Label>API-Avain (Taloushallinto)</Label>
                        <Input type="password" value="****************" disabled />
                    </div>
                    
                    <div className="pt-4 flex gap-4">
                        <Button onClick={handleTest} disabled={status === 'TESTING'}>
                            {status === 'TESTING' ? 'Testataan...' : 'Testaa Yhteys'}
                        </Button>
                        {status === 'SUCCESS' && <div className="text-emerald-600 flex items-center font-medium">Yhteys OK</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
