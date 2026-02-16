// src/app/digital-twin/page.tsx
import { BuildingModel } from "@/components/BuildingModel";
import { Badge } from "@/components/ui/badge";
import { Info, Box } from "lucide-react";

export default function DigitalTwinPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Badge
            variant="outline"
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-blue-200 bg-blue-50"
          >
            Reaaliaikainen tilannekuva
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <Box size={32} className="text-blue-600" />
            Digitaalinen Kaksonen
          </h1>
          <p className="text-slate-500 font-medium">
            Selaa taloyhtiön 3D-mallia, tarkastele teknistä tilaa ja ilmoita havainnoista.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-1 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group">
          <BuildingModel />
          
          {/* Help Overlay */}
          <div className="absolute top-6 right-20 z-10 hidden md:block">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 p-3 rounded-2xl shadow-lg max-w-[250px]">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Info size={16} />
                <span className="text-[10px] font-black uppercase">Käyttöohje</span>
              </div>
              <ul className="text-[10px] space-y-1.5 text-slate-600 font-medium">
                <li>• Pyöritä mallia hiirellä tai kosketuksella</li>
                <li>• Klikkaa asuntoa nähdäksesi lisätiedot</li>
                <li>• Käytä kerrosvalitsinta tarkempaan tarkasteluun</li>
                <li>• Aktivoi läpivalaisu nähdäksesi rakenteet</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-2">
            <h3 className="font-black text-emerald-900 uppercase text-xs tracking-widest">Läpinäkyvyys</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Digitaalinen kaksonen tuo yhtiön kunnossapitohistorian ja tulevat remontit visuaaliseen muotoon kaikkien saataville.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl space-y-2">
            <h3 className="font-black text-blue-900 uppercase text-xs tracking-widest">Tietosuoja</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Asukkaat ja osakkaat näkevät mallissa vain julkiset tilat sekä oman huoneistonsa yksityiskohtaiset tiedot.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-2">
            <h3 className="font-black text-amber-900 uppercase text-xs tracking-widest">Ennakointi</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Sensoridatan (lämpötila, kosteus) visualisointi auttaa havaitsemaan mahdolliset ongelmat ennen kuin niistä tulee kalliita remontteja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
