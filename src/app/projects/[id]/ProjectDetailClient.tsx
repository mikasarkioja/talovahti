"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  FileText,
  Handshake,
  History as HistoryIcon,
  Info,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { fi } from "date-fns/locale";

interface ProjectDetailProps {
  project: {
    id: string;
    title: string;
    description?: string;
    status: string;
    type: string;
    createdAt: string;
    observation?: {
      technicalVerdict?: string;
      severityGrade?: number;
    };
    bids?: {
      id: string;
      amount: number;
      createdAt: string;
      status: string;
      vendor?: {
        name: string;
      };
    }[];
  };
}

export function ProjectDetailClient({ project }: ProjectDetailProps) {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {{
                MAINTENANCE: "YLLÄPITO",
                RENOVATION: "REMONTTI",
              }[project.type] || project.type}
            </Badge>
            <Badge className="bg-slate-900">
              {{
                PLANNED: "Suunnitteilla",
                TENDERING: "Kilpailutuksessa",
                EXECUTION: "Käynnissä",
                WARRANTY: "Takuuvaihe",
                COMPLETED: "Valmis",
              }[project.status] || project.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Calendar size={14} />
            Aloitettu{" "}
            {format(new Date(project.createdAt), "d. MMMM yyyy", {
              locale: fi,
            })}
          </p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px] bg-slate-100/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Info size={14} />{" "}
            <span className="hidden md:inline">Yleiskuva</span>
          </TabsTrigger>
          <TabsTrigger value="technical" className="gap-2">
            <FileText size={14} />{" "}
            <span className="hidden md:inline">Tekniset tiedot</span>
          </TabsTrigger>
          <TabsTrigger value="bids" className="gap-2">
            <Handshake size={14} />{" "}
            <span className="hidden md:inline">Tarjoukset</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <HistoryIcon size={14} />{" "}
            <span className="hidden md:inline">Historia</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent
            value="overview"
            className="space-y-6 animate-in fade-in duration-300"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info size={18} className="text-blue-500" />
                  Projektin kuvaus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {project.description || "Ei kuvausta saatavilla."}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {{
                          PLANNED: "Suunnitteilla",
                          TENDERING: "Kilpailutuksessa",
                          EXECUTION: "Käynnissä",
                          WARRANTY: "Takuuvaihe",
                          COMPLETED: "Valmis",
                        }[project.status] || project.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        Projekti etenee aikataulussa
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Budjetti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {project.bids?.[0]?.amount
                          ? `${project.bids[0].amount.toLocaleString("fi-FI")} €`
                          : "Odottaa tarjouksia"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Alustava kustannusarvio
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="technical"
            className="space-y-6 animate-in fade-in duration-300"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 size={18} className="text-purple-500" />
                  Tekninen lausunto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.observation?.technicalVerdict ? (
                  <>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-700">
                      &quot;{project.observation.technicalVerdict}&quot;
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        Kiireellisyys:{" "}
                        {project.observation.severityGrade || "Ei määritetty"}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 py-8 justify-center border-2 border-dashed rounded-xl">
                    <AlertTriangle size={18} />
                    <span>Ei teknistä lausuntoa vielä.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="bids"
            className="space-y-6 animate-in fade-in duration-300"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Handshake size={18} className="text-orange-500" />
                  Saapuneet tarjoukset
                </CardTitle>
                <Badge variant="secondary">
                  {project.bids?.length || 0} kpl
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.bids?.map((bid) => (
                    <div
                      key={bid.id}
                      className="p-4 border rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {bid.vendor?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Lähetetty{" "}
                          {format(new Date(bid.createdAt), "d.M.yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">
                          {bid.amount.toLocaleString("fi-FI")} €
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                          {{
                            PENDING: "Odottaa",
                            ACCEPTED: "Hyväksytty",
                            REJECTED: "Hylätty",
                          }[bid.status] || bid.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!project.bids || project.bids.length === 0) && (
                    <p className="text-center py-12 text-slate-400">
                      Ei vielä saapuneita tarjouksia.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="history"
            className="animate-in fade-in duration-300"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HistoryIcon size={18} className="text-slate-500" />
                  Muutoshistoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  <div className="relative">
                    <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Projekti luotu
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(project.createdAt), "d.M.yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  {project.observation && (
                    <div className="relative">
                      <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Kuntoarvio valmistunut
                        </p>
                        <p className="text-xs text-slate-500">
                          Määritetty projektin pohjaksi
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
