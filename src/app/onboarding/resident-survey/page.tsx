'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox' // Ensure this exists or use standard input
import { toast } from 'sonner'
import { Trophy, CheckCircle2 } from 'lucide-react'

export default function ResidentSurveyPage() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        windowType: '',
        windowYear: '',
        radiatorType: '',
        balconyGlazed: false
    })

    const handleSubmit = async () => {
        // Mock submission
        toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
            loading: 'Tallennetaan tietoja...',
            success: 'Kiitos! Ansaitsit 50 Karma-pistettä.',
            error: 'Virhe tallennuksessa'
        })
        setStep(2)
    }

    if (step === 2) {
        return (
            <div className="min-h-screen bg-surface-lichen flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="mx-auto bg-brand-emerald/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                        <Trophy className="w-10 h-10 text-brand-emerald" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-navy mb-2">Tehtävä Suoritettu!</h2>
                    <p className="text-slate-600 mb-6">Olet auttanut taloyhtiötäsi päivittämään digitaalisen kaksosen. Lompakkoosi on lisätty 50 pistettä.</p>
                    <Button onClick={() => window.location.href = '/dashboard'}>Palaa Etusivulle</Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface-lichen flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Asunnon Tekninen Kartoitus</CardTitle>
                    <CardDescription>Auta hallitusta päivittämään huoltokirja ja ansaitse pisteitä.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Millaiset ikkunat asunnossasi on?</Label>
                        <Select onValueChange={(v) => setFormData({...formData, windowType: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Valitse tyyppi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="original">Alkuperäiset (1960-luku)</SelectItem>
                                <SelectItem value="renewed_2000">Uusittu (2000-luku)</SelectItem>
                                <SelectItem value="triple">Kolminkertaiset (Moderni)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Patterien tyyppi</Label>
                        <Select onValueChange={(v) => setFormData({...formData, radiatorType: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Valitse tyyppi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cast_iron">Valurauta (Vanha)</SelectItem>
                                <SelectItem value="panel">Levypatteri (Uudempi)</SelectItem>
                                <SelectItem value="floor">Lattialämmitys</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input 
                            type="checkbox" 
                            id="balcony" 
                            className="h-4 w-4 rounded border-gray-300 text-brand-navy focus:ring-brand-emerald"
                            checked={formData.balconyGlazed}
                            onChange={(e) => setFormData({...formData, balconyGlazed: e.target.checked})}
                        />
                        <Label htmlFor="balcony">Parveke on lasitettu</Label>
                    </div>

                    <Button className="w-full" onClick={handleSubmit} disabled={!formData.windowType || !formData.radiatorType}>
                        Lähetä Tiedot (+50 Karma)
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
