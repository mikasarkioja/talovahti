'use client'
import { calculate20YearPath, getScenarioSummaries } from '@/lib/scenario-logic'
import { ScenarioChart } from '@/components/finance/ScenarioChart'
import { ScenarioPreview } from '@/components/finance/ScenarioPreview'
import { FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ScenariosPage() {
  const chartData = calculate20YearPath()
  const summaries = getScenarioSummaries()

  const handleExport = () => {
    alert("PDF Generoitu: Yhtiökokousmateriaali_2026.pdf")
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <Link href="/finance" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Takaisin talousnäkymään
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Strateginen Skenaariotyökalu</h1>
          <p className="text-slate-500 mt-1">
            Vertaile kolmea vaihtoehtoista tulevaisuutta taloyhtiölle.
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <FileText size={16} /> Luo esitys yhtiökokoukseen
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Chart */}
        <div className="lg:col-span-2 space-y-6">
           <ScenarioChart data={chartData} />
           
           <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 leading-relaxed">
             <strong>Tulkintaohje:</strong> Kuvaaja esittää 50m² huoneistolle kohdistuvan kokonaiskustannuksen (hoitovastike + rahoitusvastike + energialasku) kumulatiivisesti. Skenaario C on alkuinvestoinnista huolimatta edullisin vaihtoehto vuoteen 2038 mennessä.
           </div>
        </div>

        {/* Right: Summaries */}
        <div>
           <h3 className="font-bold text-slate-900 mb-4">Valitse polku</h3>
           <ScenarioPreview scenarios={summaries} />
        </div>

      </div>
    </div>
  )
}
