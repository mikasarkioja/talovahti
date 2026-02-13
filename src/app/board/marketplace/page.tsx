import { ExpertMarketplace } from "@/components/marketplace/ExpertMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-brand-navy tracking-tight">
          Asiantuntijapalvelut
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Riippumattomat asiantuntijat taloyhtiön päätöksenteon tueksi ja
          laadunvarmistukseen.
        </p>
      </header>

      <Card className="bg-brand-emerald/5 border-brand-emerald/20 border-2">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-brand-emerald/10 rounded-full flex items-center justify-center text-brand-emerald shrink-0">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy">
              Vastuuvapaus ja laatu ensin
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Riippumattoman asiantuntijan käyttö suurissa hankkeissa (yli 5 000
              €) on hallituksen paras vakuutus. Asiantuntija varmistaa, että
              urakka toteutetaan sopimuksen mukaan ja hallituksen jäsenet saavat
              vastuuvapauden.
            </p>
          </div>
        </CardContent>
      </Card>

      <ExpertMarketplace />
    </div>
  );
}
