import { MyActivity } from "@/components/profile/MyActivity";
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Building, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-brand-navy uppercase tracking-tighter">
          Oma Profiili
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Hallitse tietojasi ja seuraa toimintaasi Talovahdissa.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 shadow-soft border-brand-navy/5 bg-white overflow-hidden">
          <div className="h-24 bg-brand-navy relative">
            <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center">
              <User size={40} className="text-brand-navy" />
            </div>
          </div>
          <CardContent className="pt-14 pb-6 px-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-brand-navy">Käyttäjä</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Asukas / Osakas
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Building size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">
                    Taloyhtiö
                  </div>
                  <div className="text-xs font-bold">As Oy Esimerkki</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">
                    Huoneisto
                  </div>
                  <div className="text-xs font-bold">A 12</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">
                    GDPR-suostumus
                  </div>
                  <div className="text-xs font-bold text-brand-emerald">
                    Aktiivinen
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <div className="lg:col-span-2">
          <MyActivity />
        </div>
      </div>
    </div>
  );
}
