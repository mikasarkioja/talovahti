'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Download, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'

export function PrivacySettings() {
    const [isExporting, setIsExporting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [consents, setConsents] = useState({
        analytics: false,
        marketing: false,
        optimization: true
    })

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const res = await fetch('/api/gdpr/export')
            if (!res.ok) throw new Error('Export failed')
            
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'talovahti-data-archive.json'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            toast.success('Data archive downloaded successfully')
        } catch (error) {
            toast.error('Failed to export data')
        } finally {
            setIsExporting(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch('/api/gdpr/delete', { method: 'DELETE' })
            if (!res.ok) throw new Error('Deletion failed')
            
            toast.success('Account scheduled for anonymization')
            // Redirect to logout or home
        } catch (error) {
            toast.error('Failed to request deletion')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-brand-navy/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-brand-emerald" />
                        Consent Manager
                    </CardTitle>
                    <CardDescription>
                        Manage how your data is used to improve building services.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-lichen rounded-lg">
                        <div>
                            <h4 className="font-semibold text-text-obsidian">Building Optimization</h4>
                            <p className="text-sm text-gray-600">Allow water/energy usage trends to be used for aggregate tuning.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            className="h-6 w-6 rounded border-gray-300 text-brand-emerald focus:ring-brand-emerald"
                            checked={consents.optimization}
                            onChange={(e) => setConsents({...consents, optimization: e.target.checked})}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-brand-navy/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-brand-navy" />
                        Data Portability
                    </CardTitle>
                    <CardDescription>
                        Download a copy of all your personal data in JSON format.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={handleExport} 
                        disabled={isExporting}
                        className="bg-brand-navy text-white hover:bg-brand-navy/90"
                    >
                        {isExporting ? 'Generating Archive...' : 'Download My Data'}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-red-100 bg-red-50/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <ShieldAlert className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Permanently delete your account and anonymize your data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="text-red-600 border border-red-200 hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Request Account Deletion
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. Your personal data (Name, Email, Phone) will be permanently anonymized.
                                    Historical records like maintenance requests and booking statistics will be retained anonymously for building maintenance purposes.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => {}}>Cancel</Button>
                                <Button 
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Processing...' : 'Yes, Delete My Account'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}
