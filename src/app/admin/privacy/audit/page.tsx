import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Shield,
  Eye,
  Trash2,
  FileText,
  User,
  Database,
  Info,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const logs = await prisma.gDPRLog.findMany({
    include: { actor: true },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const getIcon = (action: string) => {
    switch (action) {
      case "READ":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "WRITE":
        return <Database className="h-4 w-4 text-emerald-500" />;
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "EXPORT":
        return <FileText className="h-4 w-4 text-amber-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-2">
            <Shield className="h-8 w-8 text-brand-emerald" />
            Tietosuojaloki (Lokitiedot)
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            Tämä näkymä näyttää kaikki henkilötietoihin ja kriittisiin
            resursseihin kohdistuneet toimenpiteet. Tämä on osa EU:n
            tietosuoja-asetuksen (GDPR) mukaista läpinäkyvyysperiaatetta.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-brand-emerald/10 text-brand-emerald border-none px-4 py-1"
        >
          GDPR-Yhteensopiva
        </Badge>
      </div>

      <Card className="border-brand-navy/10 shadow-soft">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Tapahtumahistoria</CardTitle>
            <Info size={14} className="text-slate-400" />
          </div>
          <CardDescription>
            Viimeisimmät 50 lokitapahtumaa yhtiön tietokannassa.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="p-4 border-b border-slate-100">Aikaleima</th>
                  <th className="p-4 border-b border-slate-100">Tekijä</th>
                  <th className="p-4 border-b border-slate-100">Toiminto</th>
                  <th className="p-4 border-b border-slate-100">Resurssi</th>
                  <th className="p-4 border-b border-slate-100">
                    Peruste / Syy
                  </th>
                  <th className="p-4 border-b border-slate-100">
                    Tekniset tiedot
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-12 text-center text-slate-400 italic"
                    >
                      Ei lokitapahtumia tallennettuna.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-slate-400 text-[11px]">
                        {format(log.timestamp, "dd.MM.yyyy HH:mm:ss")}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="font-bold text-slate-700">
                              {log.actor.name || "Nimetön"}
                            </span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-4">
                            {log.actor.role}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getIcon(log.action)}
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold border-slate-200"
                          >
                            {log.action}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {log.resource || "Unknown"}
                        </code>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {log.reason || "Ylläpidollinen toimenpide"}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {log.details || "-"}
                          </span>
                          {log.ipAddress && (
                            <span className="text-[9px] text-slate-400 font-mono italic">
                              IP: {log.ipAddress}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">
            Käyttöoikeudet
          </p>
          <p className="text-xs text-blue-800 leading-relaxed">
            Tämä loki on tarkoitettu hallitukselle ja isännöitsijälle yhtiön
            tietoturvan valvontaan. Asukkailla on oikeus pyytää itseään koskevat
            lokiotteet isännöitsijältä.
          </p>
        </div>
      </div>
    </div>
  );
}
