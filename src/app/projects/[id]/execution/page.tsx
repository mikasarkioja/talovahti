import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Guardrail } from "@/components/finance/Guardrail";
import { CheckCircle2, Clock, FileText } from "lucide-react";

export default async function ProjectExecutionPage({ params }: { params: { id: string } }) {
  // Haetaan projekti, urakoitsija ja maksuerät (installments)
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: { 
      observation: true,
      building: true,
      milestones: true // Oletetaan Milestone-malli maksuerille
    }
  });

  if (!project) return <div>Projektia ei löytynyt.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Urakan toteutus: {project.observation.technicalVerdict}</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Tila: Käynnissä (YSE 1998)
        </Badge>
      </div>

      {/* 1. Urakan edistyminen */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Urakan kokonaisvalmius</span>
            <span>65%</span>
          </div>
          <Progress value={65} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. Maksuerät ja Hyväksyntä */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Maksuerät & Laskutus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {m.status === 'PAID' ? <CheckCircle2 className="text-green-500" /> : <Clock className="text-slate-400" />}
                  <div>
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-xs text-slate-500">Eräpäivä: {m.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-bold">{m.amount.toLocaleString()} €</p>
                  {m.status === 'PENDING' && (
                    <Guardrail amount={m.amount}>
                      <Button size="sm">Hyväksy maksuun</Button>
                    </Guardrail>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Valvojan raportit & Dokumentit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valvonta & Raportit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-md flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Aloituskokouksen pöytäkirja</span>
              </div>
              <Button variant="ghost" size="sm">Avaa</Button>
            </div>
            <div className="p-3 border rounded-md flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Viikkotiedote vko 6</span>
              </div>
              <Button variant="ghost" size="sm">Avaa</Button>
            </div>
            <hr />
            <p className="text-xs text-slate-500 italic">
              Valvoja: Tekniikka-Tiina (KSA 2013)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}