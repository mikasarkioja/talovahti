'use client'
import { useStore } from '@/lib/store'
import { generateIsannointitodistus, checkPTSSafety } from '@/lib/docs-generator'
import { FileText, Lock, ShoppingCart, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

export default function DocumentOrderPage() {
  const { currentUser, finance, renovations, addDocumentOrder, documentOrders } = useStore()
  const [selectedDoc, setSelectedDoc] = useState<'CERTIFICATE' | 'ARTICLES' | 'STATEMENTS' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Safety Check
  const { safe, lastUpdated } = checkPTSSafety(renovations)

  const products = [
    { id: 'CERTIFICATE', label: 'Isännöitsijäntodistus', price: 80.00, desc: 'Virallinen todistus huoneiston ja yhtiön tiedoista.' },
    { id: 'ARTICLES', label: 'Yhtiöjärjestys', price: 25.00, desc: 'Yhtiön säännöt ja vastikeperusteet.' },
    { id: 'STATEMENTS', label: 'Tilinpäätös & Toimintakertomus', price: 15.00, desc: 'Viimeisin vahvistettu tilinpäätös.' }
  ] as const

  const handleOrder = () => {
    if (!currentUser || !selectedDoc) return
    setIsProcessing(true)
    
    // Simulate Payment Processing
    setTimeout(() => {
      const product = products.find(p => p.id === selectedDoc)
      if (product) {
        addDocumentOrder({
          id: `order-${Date.now()}`,
          userId: currentUser.id,
          type: selectedDoc,
          amount: product.price,
          status: 'PAID',
          createdAt: new Date()
        })
        
        // If certificate, we could log the generation or offer download
        if (selectedDoc === 'CERTIFICATE') {
           console.log("Generated:", generateIsannointitodistus(currentUser, finance, renovations))
        }
      }
      setIsProcessing(false)
      setSelectedDoc(null)
      alert('Tilaus vahvistettu! Asiakirja on lähetetty sähköpostiisi.')
    }, 1500)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-[#002f6c]" />
          Asiakirjatilaus
        </h1>
        <p className="text-slate-500 mt-1">
          Tilaa viralliset asiakirjat heti toimitettuna. Tuotot ohjataan yhtiön hoitovaroihin.
        </p>
      </header>

      {/* Safety Warning */}
      {!safe && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
           <AlertTriangle className="text-red-600 shrink-0 mt-0.5" />
           <div>
             <h3 className="font-bold text-red-900 text-sm">Varoitus: Kunnossapitosuunnitelma vanhentunut</h3>
             <p className="text-sm text-red-800 mt-1">
               Isännöitsijäntodistusta ei voi generoida automaattisesti, koska yhtiön PTS-tiedot ovat yli 12kk vanhoja. 
               Ole hyvä ja ota yhteys hallitukseen.
             </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Product Selection */}
        <div className="space-y-4">
           {products.map(product => (
             <div 
               key={product.id}
               onClick={() => safe ? setSelectedDoc(product.id) : null}
               className={clsx(
                 "p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden",
                 selectedDoc === product.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 bg-white",
                 !safe && product.id === 'CERTIFICATE' && "opacity-50 cursor-not-allowed grayscale"
               )}
             >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900">{product.label}</h3>
                  <span className="font-mono font-bold text-slate-700">{product.price.toFixed(2)} €</span>
                </div>
                <p className="text-sm text-slate-500">{product.desc}</p>
                
                {selectedDoc === product.id && (
                  <div className="absolute top-0 right-0 p-1 bg-blue-600 text-white rounded-bl-lg">
                    <CheckCircle2 size={16} />
                  </div>
                )}
             </div>
           ))}
        </div>

        {/* Checkout Summary */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
             <ShoppingCart size={18} /> Tilausyhteenveto
           </h3>
           
           {selectedDoc ? (
             <div className="space-y-6">
                <div className="flex justify-between text-sm">
                   <span>{products.find(p => p.id === selectedDoc)?.label}</span>
                   <span className="font-bold">{products.find(p => p.id === selectedDoc)?.price.toFixed(2)} €</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg">
                   <span>Yhteensä</span>
                   <span>{products.find(p => p.id === selectedDoc)?.price.toFixed(2)} €</span>
                </div>
                
                <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                   <Lock size={12} />
                   <span>Maksu käsitellään turvallisesti (Stripe Mock).</span>
                </div>

                <button 
                  onClick={handleOrder}
                  disabled={isProcessing}
                  className="w-full bg-[#002f6c] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-70"
                >
                  {isProcessing ? 'Käsitellään...' : 'Maksa ja Lataa'}
                </button>
             </div>
           ) : (
             <div className="text-slate-400 text-sm text-center py-10">
               Valitse tuote vasemmalta.
             </div>
           )}
        </div>
      </div>

      {/* Recent Orders */}
      {documentOrders.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
           <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Omat tilaukset</h3>
           <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
             {documentOrders.map(order => (
               <div key={order.id} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{products.find(p => p.id === order.type)?.label}</div>
                    <div className="text-xs text-slate-400">{order.createdAt.toLocaleDateString()}</div>
                  </div>
                  <div className="text-green-600 text-xs font-bold px-2 py-1 bg-green-50 rounded flex items-center gap-1">
                    <CheckCircle2 size={12} /> TOIMITETTU
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  )
}
