"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, Coins, Euro, Calendar as CalendarIcon, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { format, addDays, startOfDay, addMinutes, isSameDay } from 'date-fns'
import { fi } from 'date-fns/locale'

// Mock Data
const RESOURCES = [
    { id: 'sauna-a', name: 'Sauna A (Lenkkisauna)', type: 'SAUNA', priceEuro: 15, priceKarma: 100 },
    { id: 'laundry-1', name: 'Pesutupa 1', type: 'LAUNDRY', priceEuro: 2, priceKarma: 20 },
    { id: 'club-room', name: 'Kerhohuone', type: 'CLUB_ROOM', priceEuro: 0, priceKarma: 50 },
]

type Booking = {
    id: string
    resourceId: string
    startTime: Date
    endTime: Date
    userId: string
    status: 'CONFIRMED' | 'CANCELLED'
    accessCode?: string
}

const MOCK_BOOKINGS: Booking[] = [
    { 
        id: '1', 
        resourceId: 'sauna-a', 
        startTime: addMinutes(new Date(), 120), // Today + 2h
        endTime: addMinutes(new Date(), 180), 
        userId: 'me', 
        status: 'CONFIRMED',
        accessCode: '1234'
    }
]

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedResource, setSelectedResource] = useState(RESOURCES[0])
  const [myBookings, setMyBookings] = useState<Booking[]>(MOCK_BOOKINGS)

  // Generate Time Slots (10:00 - 22:00, 30 min intervals)
  const timeSlots = []
  let start = startOfDay(selectedDate)
  start.setHours(10, 0, 0, 0)
  for (let i = 0; i < 24; i++) {
    timeSlots.push(addMinutes(start, i * 30))
  }

  const handleBook = (slot: Date) => {
    if (confirm(`Varaatko vuoron ${format(slot, 'HH:mm')} hintaan ${selectedResource.priceEuro}€?`)) {
        const newBooking: Booking = {
            id: Math.random().toString(),
            resourceId: selectedResource.id,
            startTime: slot,
            endTime: addMinutes(slot, 60), // 1h default
            userId: 'me',
            status: 'CONFIRMED',
            accessCode: Math.floor(1000 + Math.random() * 9000).toString()
        }
        setMyBookings([...myBookings, newBooking])
        alert(`Varaus onnistui! Ovikoodisi on: ${newBooking.accessCode}`)
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Varauskalenteri</h1>
                <p className="text-slate-500">Varaa sauna, pesutupa tai kerhohuone.</p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Coins className="w-4 h-4 mr-2" /> Karma-saldo: 450
            </Badge>
        </div>

        <Tabs defaultValue="calendar">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calendar">Kalenteri</TabsTrigger>
                <TabsTrigger value="my-bookings">Omat Varaukset</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
                {/* Resource Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {RESOURCES.map(res => (
                        <Button
                            key={res.id}
                            variant={selectedResource.id === res.id ? 'default' : 'outline'}
                            onClick={() => setSelectedResource(res)}
                            className="whitespace-nowrap"
                        >
                            {res.name}
                        </Button>
                    ))}
                </div>

                {/* Date Picker */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-center">
                        <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">
                            {format(selectedDate, 'EEEE', { locale: fi })}
                        </div>
                        <div className="text-xl font-bold">
                            {format(selectedDate, 'd.M.yyyy')}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {timeSlots.map((slot, i) => {
                        const isBooked = myBookings.some(b => 
                            b.resourceId === selectedResource.id &&
                            isSameDay(b.startTime, slot) &&
                            (
                                (b.startTime <= slot && b.endTime > slot) // Overlaps
                            )
                        )

                        return (
                            <Button
                                key={i}
                                variant={isBooked ? "secondary" : "outline"}
                                className={`h-16 flex flex-col items-center justify-center gap-1 ${isBooked ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500 hover:text-emerald-600'}`}
                                disabled={isBooked}
                                onClick={() => handleBook(slot)}
                            >
                                <span className="text-lg font-bold">{format(slot, 'HH:mm')}</span>
                                <span className="text-xs text-slate-500">
                                    {isBooked ? 'Varattu' : `${selectedResource.priceEuro}€ / ${selectedResource.priceKarma}k`}
                                </span>
                            </Button>
                        )
                    })}
                </div>
            </TabsContent>

            <TabsContent value="my-bookings">
                <Card>
                    <CardHeader>
                        <CardTitle>Tulevat Varaukset</CardTitle>
                        <CardDescription>Muista perua viimeistään 12h ennen alkua.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {myBookings.map(booking => {
                            const resource = RESOURCES.find(r => r.id === booking.resourceId)
                            return (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-full border">
                                            <CalendarIcon className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{resource?.name}</div>
                                            <div className="text-sm text-slate-500">
                                                {format(booking.startTime, 'd.M. HH:mm')} - {format(booking.endTime, 'HH:mm')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-1 rounded">
                                            <Lock className="w-3 h-3" />
                                            {booking.accessCode}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Ovikoodi</div>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  )
}
