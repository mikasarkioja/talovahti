import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Shield, Eye, Trash2, FileText, User } from 'lucide-react'

// Mock Data if DB is empty
const MOCK_LOGS = [
    {
        id: '1',
        actor: { name: 'Isännöitsijä Järvinen', role: 'MANAGER' },
        action: 'READ',
        targetEntity: 'User:Matti M.',
        details: 'Accessed contact info for HVAC maintenance',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        ipAddress: '88.112.x.x'
    },
    {
        id: '2',
        actor: { name: 'Matti Meikäläinen', role: 'OSAKAS' },
        action: 'DATA_EXPORT',
        targetEntity: 'User:Matti M.',
        details: 'Right to Data Portability invoked',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        ipAddress: '192.168.x.x'
    },
    {
        id: '3',
        actor: { name: 'Hallitus PJ', role: 'BOARD' },
        action: 'READ',
        targetEntity: 'Apartment:A5',
        details: 'Viewed arrears status',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        ipAddress: '10.0.x.x'
    }
]

export default async function AuditLogPage() {
    // In production, fetch from DB
    // const logs = await prisma.gDPRLog.findMany({
    //     include: { actor: true },
    //     orderBy: { timestamp: 'desc' },
    //     take: 50
    // })
    const logs = MOCK_LOGS

    const getIcon = (action: string) => {
        switch (action) {
            case 'READ': return <Eye className="h-4 w-4 text-blue-500" />
            case 'DELETE': return <Trash2 className="h-4 w-4 text-red-500" />
            case 'DATA_EXPORT': return <FileText className="h-4 w-4 text-amber-500" />
            default: return <Shield className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-2">
                    <Shield className="h-8 w-8 text-brand-emerald" />
                    Tietosuojaloki (Audit Log)
                </h1>
                <p className="text-text-obsidian/60 mt-2">
                    Tämä näkymä näyttää kaikki henkilötietoihin kohdistuneet toimenpiteet viimeisen 30 päivän ajalta.
                    Tämä on osa EU:n tietosuoja-asetuksen (GDPR) mukaista läpinäkyvyysperiaatetta.
                </p>
            </div>

            <Card className="border-brand-navy/10">
                <CardHeader>
                    <CardTitle>Tapahtumaloki</CardTitle>
                    <CardDescription>Viimeisimmät 50 tapahtumaa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-lichen/50 text-brand-navy font-medium">
                                <tr>
                                    <th className="p-4 rounded-tl-lg">Aikaleima</th>
                                    <th className="p-4">Tekijä (Actor)</th>
                                    <th className="p-4">Toiminto</th>
                                    <th className="p-4">Kohde</th>
                                    <th className="p-4 rounded-tr-lg">Lisätiedot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-gray-500">
                                            {format(log.timestamp, 'dd.MM.yyyy HH:mm')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{log.actor.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.actor.role}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {getIcon(log.action)}
                                                <span className="font-semibold">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-xs bg-gray-50 rounded px-2 py-1 w-fit">
                                            {log.targetEntity}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {log.details}
                                            {log.ipAddress && (
                                                <span className="block text-xs text-gray-400 mt-1">IP: {log.ipAddress}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
