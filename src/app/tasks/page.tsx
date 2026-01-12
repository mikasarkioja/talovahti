"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, CheckSquare, Clock, Coins, PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock Data
type Task = {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  reward: number
  rewardType: 'CREDIT' | 'CASH'
  assignedTo?: string
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Nurimikon leikkaus (B-talo)', description: 'Leikkaa B-talon takapihan nurmikko.', status: 'OPEN', reward: 20, rewardType: 'CREDIT' },
  { id: '2', title: 'Roskakatoksen siivous', description: 'Lakaisi roskakatos ja järjestele astiat.', status: 'OPEN', reward: 15, rewardType: 'CREDIT' },
  { id: '3', title: 'Syystalkoot: Haravointi', description: 'Sisäpihan vaahteranlehtien haravointi.', status: 'IN_PROGRESS', reward: 50, rewardType: 'CASH', assignedTo: 'me' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [activeTab, setActiveTab] = useState('open')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newReward, setNewReward] = useState('')
  const [newType, setNewType] = useState('CREDIT')

  const handleClaim = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'IN_PROGRESS', assignedTo: 'me' } : t
    ))
    alert('Tehtävä varattu! Löydät sen "Omat Tehtävät" -välilehdeltä.')
  }

  const handleComplete = (taskId: string) => {
    // Mock Photo Upload
    const photo = confirm('Ota kuva suoritetusta työstä (Proof of Work)?\n\n[OK] = Ota Kuva\n[Cancel] = Peruuta')
    if (photo) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'REVIEW' } : t
      ))
      alert('Kuva ladattu! Tehtävä siirtyi hallituksen tarkastettavaksi.')
    }
  }

  const handleCreateTask = () => {
    // In real app: Call server action that calls communityTasks.createTask
    const newTask: Task = {
        id: `new-${Date.now()}`,
        title: newTitle,
        description: newDesc,
        reward: Number(newReward),
        rewardType: newType as 'CREDIT' | 'CASH',
        status: 'OPEN'
    }
    
    setTasks(prev => [newTask, ...prev])
    setIsCreateOpen(false)
    setNewTitle('')
    setNewDesc('')
    setNewReward('')
    
    // Simulate notification trigger
    alert(`Tehtävä "${newTitle}" luotu.\n\nPUSH-ILMOITUS LÄHETETTY KAIKILLE ASUKKAILLE: "Uusi talkootehtävä saatavilla!"`)
  }

  const openTasks = tasks.filter(t => t.status === 'OPEN')
  const myTasks = tasks.filter(t => t.assignedTo === 'me')
  const boardTasks = tasks // Board sees all

  return (
    <div className="space-y-6 max-w-lg mx-auto p-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Talkootori</h1>
            <p className="text-slate-500 text-sm">Ansaitse vastikehyvitystä tekemällä pieniä töitä.</p>
        </div>
        <div className="bg-emerald-100 p-2 rounded-full">
            <Coins className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      <Tabs defaultValue="open" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="open">Avoimet</TabsTrigger>
          <TabsTrigger value="my">Omat</TabsTrigger>
          <TabsTrigger value="board">Hallitus</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4 mt-4">
          {openTasks.length === 0 && <p className="text-center text-slate-500 py-8">Ei avoimia tehtäviä juuri nyt.</p>}
          {openTasks.map(task => (
            <TaskCard key={task.id} task={task} onAction={() => handleClaim(task.id)} actionLabel="Varaa Tehtävä" />
          ))}
        </TabsContent>

        <TabsContent value="my" className="space-y-4 mt-4">
           {myTasks.length === 0 && <p className="text-center text-slate-500 py-8">Et ole varannut tehtäviä.</p>}
           {myTasks.map(task => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onAction={() => handleComplete(task.id)} 
                actionLabel={task.status === 'REVIEW' ? 'Odottaa Hyväksyntää' : 'Merkitse Valmiiksi'}
                isDisabled={task.status === 'REVIEW'}
                isSecondaryAction={true}
            />
          ))}
        </TabsContent>

        <TabsContent value="board" className="space-y-4 mt-4">
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Luo Uusi Tehtävä
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Luo Uusi Talkootehtävä</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tehtävän Otsikko</Label>
                                <Input placeholder="esim. Pihan haravointi" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Kuvaus</Label>
                                <Textarea placeholder="Mitä pitää tehdä?" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Palkkio (€)</Label>
                                    <Input type="number" placeholder="20" value={newReward} onChange={e => setNewReward(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Palkkiotyyppi</Label>
                                    <Select value={newType} onValueChange={setNewType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CREDIT">Vastikehyvitys</SelectItem>
                                            <SelectItem value="CASH">Rahapalkkio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateTask}>Julkaise & Lähetä Ilmoitus</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {boardTasks.map(task => (
                 <div key={task.id} className="p-3 border rounded bg-slate-50 flex justify-between items-center text-sm">
                    <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-slate-500">{task.status}</div>
                    </div>
                    <div>{task.assignedTo || '-'}</div>
                 </div>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TaskCard({ task, onAction, actionLabel, isDisabled, isSecondaryAction }: { task: Task, onAction: () => void, actionLabel: string, isDisabled?: boolean, isSecondaryAction?: boolean }) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="pb-3 bg-slate-50/50">
        <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-white">{task.rewardType === 'CREDIT' ? 'Vastikehyvitys' : 'Rahapalkkio'}</Badge>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
                +{task.reward} €
            </span>
        </div>
        <CardTitle className="mt-2 text-lg">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <p className="text-sm text-slate-600">{task.description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
            className={`w-full ${isSecondaryAction && !isDisabled ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`} 
            variant={isSecondaryAction ? "default" : "outline"}
            onClick={onAction}
            disabled={isDisabled}
        >
          {isSecondaryAction ? <Camera className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
