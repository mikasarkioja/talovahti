"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Lock, Coins, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import { format, addDays, startOfDay, addMinutes, isSameDay, isBefore, isAfter, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { fi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

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
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedResource, setSelectedResource] = useState(RESOURCES[0])
  const [myBookings, setMyBookings] = useState<Booking[]>(MOCK_BOOKINGS)

  // Booking Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [bookingSlot, setBookingSlot] = useState<Date | null>(null)
  const [bookingDuration, setBookingDuration] = useState(60) // minutes
  const [paymentType, setPaymentType] = useState<'EURO' | 'KARMA'>('EURO')

  // Weekly View Helpers
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
  
  // Time Slots (10:00 - 22:00)
  const timeSlots: Date[] = []
  for (let i = 0; i < 24; i++) { // 12 hours * 2 slots
    const d = new Date()
    d.setHours(10, 0, 0, 0)
    timeSlots.push(addMinutes(d, i * 30))
  }

  const handleSlotClick = (day: Date, time: Date) => {
    const slot = new Date(day)
    slot.setHours(time.getHours(), time.getMinutes(), 0, 0)
    
    // Prevent booking in the past
    if (isBefore(slot, new Date())) {
        alert("Et voi varata menneisyyteen.")
        return
    }

    setBookingSlot(slot)
    setBookingDuration(60) // Reset to default
    setIsDialogOpen(true)
  }

  const checkAvailability = (start: Date, durationMinutes: number) => {
    const end = addMinutes(start, durationMinutes)
    return !myBookings.some(b => 
        b.resourceId === selectedResource.id &&
        b.status === 'CONFIRMED' &&
        (
            (b.startTime < end && b.endTime > start) // Overlaps
        )
    )
  }

  const handleConfirmBooking = () => {
    if (!bookingSlot) return

    const endTime = addMinutes(bookingSlot, bookingDuration)
    
    // Final check
    if (!checkAvailability(bookingSlot, bookingDuration)) {
        alert("Valittu aika on jo varattu (osittain tai kokonaan).")
        return
    }

    const newBooking: Booking = {
        id: Math.random().toString(),
        resourceId: selectedResource.id,
        startTime: bookingSlot,
        endTime: endTime,
        userId: 'me',
        status: 'CONFIRMED',
        accessCode: Math.floor(1000 + Math.random() * 9000).toString()
    }
    setMyBookings([...myBookings, newBooking])
    setIsDialogOpen(false)
  }

  const calculatePrice = (type: 'EURO' | 'KARMA') => {
    const hours = bookingDuration / 60
    if (type === 'EURO') {
        return (selectedResource.priceEuro * hours).toFixed(2)
    } else {
        return Math.ceil(selectedResource.priceKarma * hours)
    }
  }

  const isSlotAvailable = bookingSlot ? checkAvailability(bookingSlot, bookingDuration) : false

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
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

                {/* Week Navigation */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => setViewDate(subWeeks(viewDate, 1))}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-center">
                        <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">
                            Viikko {format(weekStart, 'w', { locale: fi })}
                        </div>
                        <div className="text-xl font-bold">
                            {format(weekStart, 'd.M.')} - {format(endOfWeek(viewDate, { weekStartsOn: 1 }), 'd.M.yyyy')}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setViewDate(addWeeks(viewDate, 1))}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Weekly Grid */}
                <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-slate-50">
                            <div className="p-2 text-xs font-medium text-slate-400 text-center border-r">Aika</div>
                            {weekDays.map(day => (
                                <div key={day.toISOString()} className={cn(
                                    "p-2 text-center border-r last:border-r-0",
                                    isSameDay(day, new Date()) ? "bg-blue-50/50" : ""
                                )}>
                                    <div className="text-xs font-bold uppercase text-slate-500">{format(day, 'EEE', { locale: fi })}</div>
                                    <div className={cn(
                                        "text-sm font-bold",
                                        isSameDay(day, new Date()) ? "text-blue-600" : "text-slate-900"
                                    )}>
                                        {format(day, 'd.M.')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Body */}
                        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                            {/* Time Labels Column */}
                            <div className="border-r bg-slate-50">
                                {timeSlots.map((time, i) => (
                                    <div key={i} className="h-12 border-b text-xs text-slate-400 flex items-center justify-center relative">
                                        {/* Only show label for full hours or specific logic */}
                                        {time.getMinutes() === 0 ? format(time, 'HH:mm') : ''}
                                    </div>
                                ))}
                            </div>

                            {/* Days Columns */}
                            {weekDays.map(day => (
                                <div key={day.toISOString()} className="border-r last:border-r-0">
                                    {timeSlots.map((time, i) => {
                                        // Construct exact Date object for this slot
                                        const slotStart = new Date(day)
                                        slotStart.setHours(time.getHours(), time.getMinutes(), 0, 0)
                                        const slotEnd = addMinutes(slotStart, 30)

                                        // Check Booking Status
                                        // Find any booking that covers this slot
                                        const booking = myBookings.find(b => 
                                            b.resourceId === selectedResource.id &&
                                            b.status === 'CONFIRMED' &&
                                            b.startTime < slotEnd && b.endTime > slotStart
                                        )

                                        const isMyBooking = booking?.userId === 'me'
                                        const isPast = isBefore(slotStart, new Date())

                                        return (
                                            <div 
                                                key={i} 
                                                className={cn(
                                                    "h-12 border-b transition-colors text-[10px] flex items-center justify-center cursor-pointer select-none",
                                                    booking 
                                                        ? (isMyBooking ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 cursor-not-allowed")
                                                        : (isPast ? "bg-slate-50/50" : "hover:bg-blue-50")
                                                )}
                                                onClick={() => !booking && handleSlotClick(day, time)}
                                            >
                                                {booking ? (
                                                    // Only show title on the first slot of the booking to avoid clutter? 
                                                    // For now just show concise text or icon
                                                    isMyBooking ? "Oma" : "Varattu"
                                                ) : (
                                                    // Show + on hover?
                                                    <span className="opacity-0 hover:opacity-100 text-slate-400">+</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
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
                            const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60)
                            return (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-full border">
                                            <CalendarIcon className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{resource?.name}</div>
                                            <div className="text-sm text-slate-500">
                                                {format(booking.startTime, 'd.M. HH:mm')} - {format(booking.endTime, 'HH:mm')} ({duration} min)
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

        {/* Booking Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Uusi Varaus</DialogTitle>
                    <DialogDescription>
                        {selectedResource.name} - {bookingSlot && format(bookingSlot, 'd.M.yyyy')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Alkaa</Label>
                        <div className="col-span-3 font-mono font-bold text-lg">
                            {bookingSlot && format(bookingSlot, 'HH:mm')}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Kesto</Label>
                        <div className="col-span-3">
                            <Select 
                                value={bookingDuration.toString()} 
                                onValueChange={(val) => setBookingDuration(parseInt(val))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Valitse kesto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="60">1 tunti</SelectItem>
                                    <SelectItem value="90">1.5 tuntia</SelectItem>
                                    <SelectItem value="120">2 tuntia</SelectItem>
                                    <SelectItem value="150">2.5 tuntia</SelectItem>
                                    <SelectItem value="180">3 tuntia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Päättyy</Label>
                        <div className="col-span-3 font-mono text-slate-500">
                            {bookingSlot && format(addMinutes(bookingSlot, bookingDuration), 'HH:mm')}
                        </div>
                    </div>

                    {!isSlotAvailable && (
                        <div className="col-span-4 p-3 bg-red-50 text-red-600 rounded flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Valittu kesto menee päällekkäin toisen varauksen kanssa.
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t">
                        <Label className="text-right">Hinta</Label>
                        <div className="col-span-3 flex items-center gap-4">
                             <div 
                                onClick={() => setPaymentType('EURO')}
                                className={`cursor-pointer border p-2 rounded flex items-center gap-2 ${paymentType === 'EURO' ? 'border-emerald-500 bg-emerald-50' : ''}`}
                             >
                                <span className="font-bold">{calculatePrice('EURO')} €</span>
                             </div>
                             <div 
                                onClick={() => setPaymentType('KARMA')}
                                className={`cursor-pointer border p-2 rounded flex items-center gap-2 ${paymentType === 'KARMA' ? 'border-emerald-500 bg-emerald-50' : ''}`}
                             >
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <span className="font-bold">{calculatePrice('KARMA')} Karma</span>
                             </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Peruuta</Button>
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700" 
                        onClick={handleConfirmBooking}
                        disabled={!isSlotAvailable}
                    >
                        Vahvista Varaus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
