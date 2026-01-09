'use client'
import { useStore, MockInvoice } from '@/lib/store'
import { accountingApi } from '@/lib/accounting-api'
import { getCategoryLabel } from '@/lib/finance'
import { suggestCategory, getRequiredApprovers } from '@/lib/invoice-matcher'
import { RefreshCw, CheckCircle2, XCircle, FileText, AlertTriangle, Calendar, Euro, Brain, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { BudgetCategory } from '@prisma/client'

export default function InvoiceApprovalPage() {
  const { invoices, budgetLines, syncInvoices, updateInvoiceStatus, updateInvoiceCategory, addVendorRule, vendorRules, currentUser } = useStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<MockInvoice | null>(null)

  useEffect(() => {
    if (invoices.length === 0) {
        handleSync()
    }
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
        const newInvoices = await accountingApi.fetchNewInvoices()
        // Apply matching logic to incoming invoices
        const processedInvoices = newInvoices.map(inv => {
            const match = suggestCategory(inv, vendorRules)
            // If match confidence is high, auto-assign
            // For now, we just attach it or let the UI display it. 
            // Better to update the category in the object if it's currently generic.
            return { ...inv, category: match.category } 
        })
        syncInvoices(processedInvoices)
    } catch (e) {
        console.error("Sync failed", e)
    } finally {
        setIsSyncing(false)
    }
  }

  const handleApproval = async (invoice: MockInvoice, approved: boolean) => {
      if (!currentUser?.canApproveFinance) {
          alert("Sinulla ei ole oikeuksia hyväksyä laskuja.")
          return
      }
      const newStatus = approved ? 'APPROVED' : 'REJECTED'
      updateInvoiceStatus(invoice.id, newStatus, currentUser.id)
      if (invoice.externalId) {
          await accountingApi.pushApprovalStatus(invoice.externalId, newStatus, currentUser.id)
      }
      if (selectedInvoice?.id === invoice.id) setSelectedInvoice(null)
  }

  const handleCategoryChange = (invoice: MockInvoice, newCategory: BudgetCategory) => {
      updateInvoiceCategory(invoice.id, newCategory)
      
      // Learning Loop
      if (invoice.yTunnus) {
          addVendorRule({
              id: `rule-${Date.now()}`,
              yTunnus: invoice.yTunnus,
              vendorName: invoice.vendorName,
              category: newCategory,
              createdAt: new Date()
          })
          alert(`Järjestelmä oppi: ${invoice.vendorName} -> ${getCategoryLabel(newCategory)}`)
      }
  }

  const pendingInvoices = invoices.filter(i => i.status === 'PENDING')
  const historyInvoices = invoices.filter(i => i.status !== 'PENDING')

  const getBudgetStatus = (invoice: MockInvoice) => {
      const line = budgetLines.find(l => l.category === invoice.category)
      if (!line) return { remaining: 0, status: 'UNKNOWN' }
      const remaining = line.budgetedAmount - line.actualSpent
      const afterInvoice = remaining - invoice.amount
      return { totalBudget: line.budgetedAmount, used: line.actualSpent, remaining, afterInvoice, isOverBudget: afterInvoice < 0 }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col space-y-6">
      <header className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-[#002f6c]" />
            Ostolaskujen Hyväksyntä
          </h1>
          <p className="text-slate-500 mt-1">Tarkasta ja hyväksy saapuneet laskut.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? 'Haetaan...' : 'Hae laskut (Netvisor)'}
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        
        {/* Left: Invoice List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
                Odottaa hyväksyntää ({pendingInvoices.length})
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {pendingInvoices.length === 0 && <div className="text-center py-10 text-slate-400">Ei avoimia laskuja.</div>}
                {pendingInvoices.map(invoice => {
                    const match = suggestCategory(invoice, vendorRules)
                    return (
                        <div 
                            key={invoice.id}
                            onClick={() => setSelectedInvoice(invoice)}
                            className={clsx(
                                "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md relative",
                                selectedInvoice?.id === invoice.id 
                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                                    : "border-slate-200 bg-white hover:border-blue-300"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900">{invoice.vendorName}</h4>
                                <span className="font-mono font-bold">{invoice.amount.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 items-center">
                                <div className="flex items-center gap-1">
                                    <Tag size={12} />
                                    <span>{getCategoryLabel(invoice.category)}</span>
                                    {match.confidence < 100 && (
                                        <span title="Tekoälyehdotus">
                                            <Brain size={12} className="text-purple-500 ml-1" />
                                        </span>
                                    )}
                                </div>
                                <span className={clsx("flex items-center gap-1", invoice.dueDate < new Date() ? "text-red-600 font-bold" : "")}>
                                    <Calendar size={12} /> {invoice.dueDate.toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="p-3 border-t border-slate-100 text-center">
                 <span className="text-xs text-slate-400">Näytä käsitellyt ({historyInvoices.length})</span>
            </div>
        </div>

        {/* Right: Detail View */}
        <div className="lg:col-span-2 bg-slate-100 rounded-xl border border-slate-200 flex flex-col overflow-hidden relative">
            {selectedInvoice ? (
                <div className="flex-1 flex flex-col h-full">
                    {/* Header Controls */}
                    <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                         <div>
                             <h2 className="text-xl font-bold text-slate-900">{selectedInvoice.vendorName}</h2>
                             <div className="flex items-center gap-4 text-sm text-slate-500">
                                 <span>Eräpäivä: {selectedInvoice.dueDate.toLocaleDateString()}</span>
                                 <span className="text-slate-300">|</span>
                                 <span>Vaatii hyväksynnän: {getRequiredApprovers(selectedInvoice).join(', ')}</span>
                             </div>
                         </div>
                         
                         {currentUser?.canApproveFinance ? (
                             <div className="flex gap-3">
                                <button onClick={() => handleApproval(selectedInvoice, false)} className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-bold flex items-center gap-2 transition-colors"><XCircle size={18} /> Hylkää</button>
                                <button onClick={() => handleApproval(selectedInvoice, true)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-md transition-colors"><CheckCircle2 size={18} /> Hyväksy</button>
                             </div>
                         ) : (
                             <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded">Vain lukuoikeus</div>
                         )}
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* PDF/Image Preview */}
                        <div className="flex-1 bg-slate-800 p-4 flex items-center justify-center overflow-auto">
                             {selectedInvoice.imageUrl ? <img src={selectedInvoice.imageUrl} alt="Lasku" className="max-w-full shadow-2xl rounded-sm" /> : <div className="text-slate-500 flex flex-col items-center"><FileText size={64} className="mb-2 opacity-20" />Ei kuvaa saatavilla</div>}
                        </div>

                        {/* Analysis Sidebar */}
                        <div className="w-full md:w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tiliöinti</label>
                                <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                                    value={selectedInvoice.category}
                                    onChange={(e) => handleCategoryChange(selectedInvoice, e.target.value as BudgetCategory)}
                                >
                                    <option value="HEATING">Lämmitys</option>
                                    <option value="WATER">Vesi & Jätevesi</option>
                                    <option value="MAINTENANCE">Huolto & Korjaukset</option>
                                    <option value="CLEANING">Siivous</option>
                                    <option value="ADMIN">Hallinto</option>
                                </select>
                                {(() => {
                                    const match = suggestCategory(selectedInvoice, vendorRules)
                                    if (match.confidence < 100 && match.reason !== 'RULE_MATCH') return <div className="text-xs text-purple-600 mt-1 flex items-center gap-1"><Brain size={12}/> Ehdotus: {getCategoryLabel(match.category)} ({match.confidence}%)</div>
                                    if (match.reason === 'RULE_MATCH') return <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 size={12}/> Opetettu sääntö</div>
                                    return null
                                })()}
                            </div>

                            {/* Budget Check */}
                            {(() => {
                                const check = getBudgetStatus(selectedInvoice)
                                if (check.status === 'UNKNOWN' || check.used === undefined || check.totalBudget === undefined) return <div className="text-slate-400">Kategoriaa ei löydy.</div>
                                const percentUsed = (check.used / check.totalBudget) * 100
                                const percentAfter = ((check.used + selectedInvoice.amount) / check.totalBudget) * 100
                                
                                return (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-2">Budjetin käyttöaste</div>
                                            <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden mb-1">
                                                <div className="absolute left-0 top-0 bottom-0 bg-slate-400" style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
                                                <div className={clsx("absolute top-0 bottom-0", check.isOverBudget ? "bg-red-500" : "bg-blue-500")} style={{ left: `${Math.min(percentUsed, 100)}%`, width: `${Math.min(percentAfter - percentUsed, 100 - percentUsed)}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium">
                                                <span>0%</span>
                                                <span className={check.isOverBudget ? "text-red-600 font-bold" : "text-slate-600"}>{Math.round(percentAfter)}%</span>
                                            </div>
                                        </div>
                                        {check.isOverBudget && (
                                            <div className="bg-red-50 p-3 rounded border border-red-100 flex gap-2 text-xs text-red-800 leading-snug">
                                                <AlertTriangle size={16} className="shrink-0" />
                                                Huomio: Tämän laskun hyväksyminen ylittää budjetin.
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <FileText size={64} className="mb-4 opacity-20" />
                    <p>Valitse lasku vasemmalta tarkasteltavaksi.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
