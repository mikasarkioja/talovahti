'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PrivacySettings } from '@/components/profile/PrivacySettings'
import { toast } from 'sonner'
import { User, Mail, Phone, Globe, Bell } from 'lucide-react'

export default function ProfilePage() {
    // Mock Data - In real app, fetch from API
    const [profile, setProfile] = useState({
        name: 'Matti Meikäläinen',
        email: 'matti.meikalainen@example.com',
        phone: '+358 40 123 4567',
        language: 'fi',
        role: 'OSAKAS' as const
    })

    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Profile updated successfully')
        setIsLoading(false)
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-navy">Omat Tiedot</h1>
                    <p className="text-text-obsidian/60 mt-1">Hallitse yhteystietojasi ja yksityisyysasetuksiasi.</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1 bg-brand-navy/5 border-brand-navy text-brand-navy">
                    {profile.role}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSave}>
                        <Card className="border-brand-navy/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-brand-navy" />
                                    Perustiedot
                                </CardTitle>
                                <CardDescription>Pidä yhteystietosi ajan tasalla.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-lg text-brand-navy">Koko Nimi</Label>
                                    <Input 
                                        id="name" 
                                        value={profile.name} 
                                        onChange={e => setProfile({...profile, name: e.target.value})}
                                        className="h-12 text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-lg text-brand-navy">Sähköposti</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input 
                                            id="email" 
                                            type="email"
                                            value={profile.email} 
                                            onChange={e => setProfile({...profile, email: e.target.value})}
                                            className="h-12 text-lg pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-lg text-brand-navy">Puhelinnumero</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input 
                                            id="phone" 
                                            type="tel"
                                            value={profile.phone} 
                                            onChange={e => setProfile({...profile, phone: e.target.value})}
                                            className="h-12 text-lg pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="language" className="text-lg text-brand-navy">Kieli / Language</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <select 
                                                id="language"
                                                className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                                value={profile.language}
                                                onChange={e => setProfile({...profile, language: e.target.value})}
                                            >
                                                <option value="fi">Suomi</option>
                                                <option value="en">English</option>
                                                <option value="sv">Svenska</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-lg text-brand-navy">Ilmoitukset</Label>
                                        <div className="flex items-center h-12 px-3 border rounded-md bg-gray-50">
                                            <Bell className="h-5 w-5 text-brand-emerald mr-2" />
                                            <span className="text-gray-600">Push-ilmoitukset päällä</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button 
                                        type="submit" 
                                        size="lg" 
                                        className="w-full bg-brand-navy text-white hover:bg-brand-navy/90 h-14 text-lg font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Tallennetaan...' : 'Tallenna Muutokset'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    <PrivacySettings />
                </div>

                {/* Right Column: Info & Help */}
                <div className="space-y-6">
                    <Card className="bg-surface-lichen border-none">
                        <CardHeader>
                            <CardTitle>Tietosuoja & GDPR</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-text-obsidian/80 space-y-4">
                            <p>
                                Talovahti on suunniteltu noudattamaan EU:n yleistä tietosuoja-asetusta (GDPR).
                            </p>
                            <ul className="list-disc pl-4 space-y-2">
                                <li>Sinulla on oikeus nähdä omat tietosi.</li>
                                <li>Voit ladata tietosi konekielisessä muodossa.</li>
                                <li>Voit pyytää tietojesi poistamista ("oikeus tulla unohdetuksi").</li>
                            </ul>
                            <p className="mt-4 font-semibold">
                                Tietosuojavastaava:<br/>
                                hallitus@taloyhtio.fi
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
