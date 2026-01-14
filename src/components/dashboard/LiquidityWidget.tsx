import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react'

export function LiquidityWidget({ balance, upcoming }: { balance: number, upcoming: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-brand-navy border-none text-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                        <Wallet className="mr-2 h-4 w-4" /> Pankkitili
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{balance.toLocaleString('fi-FI')} €</div>
                    <div className="text-xs text-emerald-400 mt-1">+2,500 € vs. viime kuu</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
                        <ArrowUpRight className="mr-2 h-4 w-4 text-red-500" /> Lähtevät (30pv)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{upcoming.toLocaleString('fi-FI')} €</div>
                    <div className="text-xs text-slate-500 mt-1">3 avointa laskua</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
                        <ArrowDownLeft className="mr-2 h-4 w-4 text-emerald-500" /> Vastikerästit
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0,00 €</div>
                    <div className="text-xs text-emerald-600 mt-1">Kaikki maksettu ajallaan</div>
                </CardContent>
            </Card>
        </div>
    )
}
