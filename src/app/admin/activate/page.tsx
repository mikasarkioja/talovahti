'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Building, Check, Search, Shield, ArrowRight, Database } from 'lucide-react'
import { verifyCompany, activateCompany } from './actions'
import { MMLCompanyData } from '@/lib/mml/client'

export default function ActivationWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    
    // Data
    const [yTunnus, setYTunnus] = useState('')
    const [mmlData, setMMLData] = useState<MMLCompanyData | null>(null)

    // STEP 1: Identification
    const handleIdentify = async () => {
        setIsLoading(true)
        // Mock Suomi.fi delay
        await new Promise(r => setTimeout(r, 1500))
        setIsLoading(false)
        setStep(2)
        toast.success('Henkilöllisyys varmennettu (Suomi.fi)')
    }

    // STEP 2: Verify Y-Tunnus
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        
        const res = await verifyCompany(yTunnus)
        
        if (res.error) {
            toast.error(res.error)
            setIsLoading(false)
            return
        }

        if (res.data) {
            setMMLData(res.data)
            setStep(3)
        }
        setIsLoading(false)
    }

    // STEP 3: Confirm & Activate
    const handleActivate = async () => {
        if (!mmlData) return
        
        setIsLoading(true)
        setStep(4) // Show Progress

        // Simulate Progress Stages
        const stages = [
            { pct: 10, msg: 'Yhdistetään kaupparekisteriin...' },
            { pct: 35, msg: 'Noudetaan osakeluetteloa...' },
            { pct: 65, msg: 'Luodaan taloyhtiön tietokantaa...' },
            { pct: 85, msg: 'Generoidaan 3D-mallia...' },
            { pct: 100, msg: 'Valmis!' }
        ]

        for (const stage of stages) {
            setProgress(stage.pct)
            toast.message(stage.msg)
            await new Promise(r => setTimeout(r, 600)) // Visual delay
        }

        const res = await activateCompany(mmlData)

        if (res.success) {
            toast.success('Taloyhtiö aktivoitu!')
            // Optimistic Redirect
            router.push(`/admin/dashboard`)
        } else {
            setStep(3)
            toast.error('Aktivointi epäonnistui')
        }
        setIsLoading(false)
    }

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-brand-navy">Aktivoi Taloyhtiö</h1>
                <p className="text-gray-500">Ota käyttöön Talovahti-palvelu virallisilla MML-tiedoilla.</p>
            </div>

            {/* STEP PROGRESS */}
            <div className="flex justify-between items-center px-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`
                            h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg
                            ${step >= s ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-400'}
                            transition-all duration-300
                        `}>
                            {step > s ? <Check className="h-5 w-5" /> : s}
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                            {s === 1 ? 'Tunnistus' : s === 2 ? 'Y-Tunnus' : s === 3 ? 'Tarkistus' : 'Valmis'}
                        </span>
                    </div>
                ))}
            </div>

            {/* STEP 1: IDENTIFICATION */}
            {step === 1 && (
                <Card className="border-brand-navy/10 text-center py-8">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <Shield className="h-12 w-12 text-brand-emerald" />
                            <span>Varmenna Hallituksen Puheenjohtaja</span>
                        </CardTitle>
                        <CardDescription>
                            Haemme kaupparekisteristä (PRH) tiedon nimenkirjoitusoikeudesta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            size="lg" 
                            className="bg-[#0052C2] hover:bg-[#004199] text-white gap-2 h-14 text-lg" // Suomi.fi Blue
                            onClick={handleIdentify}
                            disabled={isLoading}
                        >
                            <img src="https://suomi.fi/assets/images/suomi-fi-logo.svg" alt="" className="h-6 w-6 brightness-0 invert" />
                            Tunnistaudu Suomi.fi
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* STEP 2: Y-TUNNUS */}
            {step === 2 && (
                <Card className="border-brand-navy/10">
                    <CardHeader>
                        <CardTitle>Anna Y-Tunnus</CardTitle>
                        <CardDescription>Esimerkki: 1234567-8</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="y-tunnus">Y-Tunnus</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input 
                                        id="y-tunnus"
                                        placeholder="1234567-8" 
                                        value={yTunnus}
                                        onChange={(e) => setYTunnus(e.target.value)}
                                        className="pl-10 h-12 text-lg"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full bg-brand-navy"
                                disabled={isLoading || yTunnus.length < 9}
                            >
                                {isLoading ? 'Tarkistetaan...' : 'Hae Tiedot'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* STEP 3: PREVIEW */}
            {step === 3 && mmlData && (
                <Card className="border-brand-navy/10">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{mmlData.basicInfo.name}</span>
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {mmlData.apartments.length} Huoneistoa
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Tarkista tiedot ennen aktivointia. Nämä tiedot haettiin Maanmittauslaitokselta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm bg-surface-lichen p-4 rounded-lg">
                            <div>
                                <span className="text-gray-500 block">Osoite</span>
                                <span className="font-medium">{mmlData.basicInfo.address}, {mmlData.basicInfo.city}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Valmistumisvuosi</span>
                                <span className="font-medium">{mmlData.basicInfo.constructionYear}</span>
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto border rounded-md">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-3">Huoneisto</th>
                                        <th className="p-3">Pinta-ala</th>
                                        <th className="p-3">Osakkeet</th>
                                        <th className="p-3">Omistajatyyppi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {mmlData.apartments.slice(0, 10).map((apt, i) => ( // Show first 10
                                        <tr key={i}>
                                            <td className="p-3 font-medium">{apt.apartmentNumber}</td>
                                            <td className="p-3">{apt.area} m²</td>
                                            <td className="p-3">{apt.sharesStart}-{apt.sharesEnd}</td>
                                            <td className="p-3">
                                                {mmlData.shareholders.find(s => s.apartmentNumber === apt.apartmentNumber)?.ownershipType === 'INSTITUTIONAL' 
                                                    ? 'Yritys/Kaupunki' 
                                                    : 'Yksityinen'}
                                            </td>
                                        </tr>
                                    ))}
                                    {mmlData.apartments.length > 10 && (
                                        <tr>
                                            <td colSpan={4} className="p-3 text-center text-gray-500 italic">
                                                ... ja {mmlData.apartments.length - 10} muuta
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Button 
                            onClick={handleActivate} 
                            size="lg" 
                            className="w-full bg-brand-navy h-14 text-lg"
                        >
                            Vahvista ja Aktivoi
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* STEP 4: PROGRESS */}
            {step === 4 && (
                <Card className="border-brand-navy/10 text-center py-12">
                    <CardContent className="space-y-8">
                        <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                            {/* Simple CSS Spinner or just the icon */}
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-emerald rounded-full border-t-transparent animate-spin"></div>
                            <Database className="h-10 w-10 text-brand-navy relative z-10" />
                        </div>
                        
                        <div className="space-y-4 max-w-md mx-auto">
                            <h3 className="text-xl font-semibold text-brand-navy">Valmistellaan Talovahtia...</h3>
                            <Progress value={progress} className="h-3" />
                            <p className="text-sm text-gray-500 animate-pulse">
                                Älä sulje selainikkunaa.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
