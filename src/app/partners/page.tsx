"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Star, Phone, CheckCircle } from 'lucide-react'

// Mock Data
const MOCK_PARTNERS = [
  { id: '1', name: 'Putki-Pekka Oy', category: 'PLUMBER', rating: 4.8, verified: true, phone: '040-1234567' },
  { id: '2', name: 'Sähkö-Simo Tmi', category: 'ELECTRICIAN', rating: 4.5, verified: true, phone: '050-9876543' },
  { id: '3', name: 'Piha & Puutarha', category: 'LANDSCAPER', rating: 4.2, verified: false, phone: '044-5555555' },
  { id: '4', name: 'Lukko-Lasse', category: 'LOCKSMITH', rating: 4.9, verified: true, phone: '040-9998877' },
]

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const handleRequestQuote = (partnerName: string) => {
    // Mock 3D location sending
    alert(`Tarjouspyyntö lähetetty yritykselle ${partnerName}.\n\nLiitetty sijaintitieto: "Keittiö / Vesipiste (3D-malli)"`)
  }

  const filteredPartners = MOCK_PARTNERS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Palveluhakemisto</h1>
          <p className="text-slate-500">Löydä luotettavat tekijät taloyhtiösi tarpeisiin.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Etsi putkimiestä, sähkömiestä..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPartners.map(partner => (
          <Card key={partner.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary">{partner.category}</Badge>
                {partner.verified && (
                  <div className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Vahvistettu
                  </div>
                )}
              </div>
              <CardTitle className="mt-2 text-xl">{partner.name}</CardTitle>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-slate-700">{partner.rating}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                <Phone className="w-4 h-4" />
                {partner.phone}
              </div>
              <p className="text-sm text-slate-600">
                Paikallinen toimija, erikoistunut taloyhtiöiden huoltotöihin.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleRequestQuote(partner.name)}>
                <MapPin className="w-4 h-4 mr-2" />
                Pyydä Tarjous
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
