"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

const MOCK_DYNASTY_DATA = [
  {
    id: "dyn-1",
    title: "Naapuritontin aidan uusiminen",
    area: "Esimerkkikuja 10",
    date: "12.02.2026",
    status: "ILMOITUS",
    importance: "LOW",
  },
  {
    id: "dyn-2",
    title: "Julkisivuremontti (lupahakemus)",
    area: "Mallikatu 5",
    date: "10.02.2026",
    status: "KÄSITTELYSSÄ",
    importance: "MEDIUM",
  },
  {
    id: "dyn-3",
    title: "Uusi katusuunnitelma (pyörätie)",
    area: "Alueen keskusta",
    date: "08.02.2026",
    status: "PÄÄTÖS",
    importance: "HIGH",
  },
];

export function DynastyPanel() {
  return (
    <Card className="border-brand-navy/10 bg-white shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Ympäristövalvonta (Dynasty)
        </CardTitle>
        <Badge
          variant="outline"
          className="text-[10px] bg-blue-50 text-blue-700 border-blue-100"
        >
          Uusi data
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {MOCK_DYNASTY_DATA.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold text-brand-navy group-hover:text-brand-emerald transition-colors">
                  {item.title}
                </h4>
                <Badge
                  className={
                    item.importance === "HIGH"
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-50"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                  }
                  variant="secondary"
                >
                  <span className="text-[8px]">{item.status}</span>
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin size={10} />
                  {item.area}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar size={10} />
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-brand-navy transition-colors pt-2 uppercase tracking-widest">
          Selaa kaikkia ilmoituksia
          <ArrowRight size={12} />
        </button>
      </CardContent>
    </Card>
  );
}
