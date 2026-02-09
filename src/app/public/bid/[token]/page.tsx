import React from "react";
import { Metadata } from "next";
import { getProjectByToken } from "@/app/actions/marketplace";
import { BidForm } from "./BidForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BuildingModel } from "@/components/BuildingModel";

export const metadata: Metadata = {
  title: "Jätä Tarjous | Talovahti",
  robots: {
    index: false,
    follow: false,
  },
};

interface PublicBidPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicBidPage(props: PublicBidPageProps) {
  const params = await props.params;
  const result = await getProjectByToken(params.token);

  if ("error" in result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-100 bg-red-50/20">
          <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
              <Info size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Linkki ei toimi</h2>
            <p className="text-slate-600">{result.error}</p>
            <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium pt-2">
              <ArrowLeft size={14} /> Takaisin etusivulle
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project, vendor } = result;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#002f6c] text-white py-8 px-4 border-b-4 border-emerald-500 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-500 text-white border-none px-3 py-0.5 font-bold">PROJEKTI</Badge>
              <span className="text-blue-200 text-sm font-medium tracking-wide">ID: {project.id.slice(-6).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{project.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm uppercase font-bold tracking-widest mb-1">Tervetuloa</p>
            <p className="text-xl font-medium">{vendor.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Project Details & 3D Twin */}
        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold">Projektin Kuvaus</h2>
            </div>
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <p className="text-slate-700 leading-relaxed text-lg">
                  {project.description || "Ei tarkennettua kuvausta."}
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <MapPin className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold">Sijainti & Kohde</h2>
            </div>
            <p className="text-slate-500 text-sm mb-4 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-3">
              <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
              <span>
                Alla oleva 3D-malli näyttää huollon kohteena olevan rakennusosan tai huoneiston sijainnin digitaalisessa kaksosessa.
              </span>
            </p>
            <div className="rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner bg-slate-100 h-[500px]">
              {/* Using existing BuildingModel component */}
              <BuildingModel highlightId={project.observation?.location ? JSON.parse(project.observation.location).aptId : undefined} />
            </div>
          </section>
        </div>

        {/* Bidding Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <BidForm 
              token={params.token} 
              vendorName={vendor.name} 
              projectName={project.title} 
            />
            
            <div className="mt-8 p-6 bg-slate-100 rounded-xl border border-slate-200 border-dashed">
              <h4 className="font-bold text-slate-700 mb-2">Tarvitsetko apua?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mikäli sinulla on kysyttävää projektin laajuudesta tai tarvitset lisätietoja, ota yhteyttä taloyhtiön hallitukseen.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto py-12 px-4 border-t border-slate-200 mt-12 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Talovahti | Moderni Kiinteistönhallinta</p>
      </footer>
    </div>
  );
}
