"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, Search, FileText, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditLogEntry {
  id: string;
  action: string;
  timestamp: string | Date;
  user: {
    name: string | null;
    email: string | null;
  };
  metadata: any;
}

interface AuditLogClientProps {
  initialLogs: AuditLogEntry[];
}

const translateAction = (action: string) => {
  const translations: Record<string, string> = {
    "INVOICE_APPROVED": "Lasku hyväksytty",
    "EXPERT_ORDERED": "Asiantuntija tilattu",
    "TRIAGE_ESCALATED": "Tiketti eskaloitu",
    "MAINTENANCE_MARKED": "Huolto kuitattu",
    "PROJECT_CREATED": "Hanke luotu",
    "BID_ACCEPTED": "Tarjous hyväksytty"
  };
  return translations[action] || action;
};

/**
 * Metadata formatting helper
 */
const formatMetadata = (action: string, metadata: Record<string, unknown> | string | null) => {
  if (!metadata) return "-";
  
  try {
    const data = (typeof metadata === "string" ? JSON.parse(metadata) : metadata) as Record<string, unknown>;
    
    switch (action) {
      case "INVOICE_APPROVED":
        return `Summa: ${Number(data.amount || 0).toLocaleString("fi-FI")} € | Lasku: ${String(data.invoiceNumber || data.invoiceId || "-")}`;
      case "EXPERT_ORDERED":
        return `Asiantuntija: ${String(data.expertName || data.vendor || "-")} | Tehtävä: ${String(data.serviceType || "-")}`;
      case "TRIAGE_ESCALATED":
        return `Kohde: ${String(data.title || "-")} | Taso: ${String(data.triageLevel || "-")}`;
      case "MAINTENANCE_MARKED":
        return `Huolto: ${String(data.contractor || "-")} | Huomiot: ${String(data.notes || "-")}`;
      default:
        // Fallback to simple string extraction
        if (data.amount) return `Summa: ${Number(data.amount as number).toLocaleString("fi-FI")} €`;
        if (data.title) return String(data.title);
        return JSON.stringify(data).slice(0, 100);
    }
  } catch {
    return String(metadata);
  }
};

export function AuditLogClient({ initialLogs }: AuditLogClientProps) {
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      // Action Filter
      if (filterAction !== "ALL" && log.action !== filterAction) return false;

      // Search Filter (User or Metadata)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        log.user.name?.toLowerCase().includes(searchLower) || 
        log.user.email?.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.metadata).toLowerCase().includes(searchLower);
      
      if (searchTerm && !matchesSearch) return false;

      // Date Filter
      const logDate = new Date(log.timestamp);
      if (dateFrom && logDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (logDate > toDate) return false;
      }

      return true;
    });
  }, [initialLogs, filterAction, searchTerm, dateFrom, dateTo]);

  const handleDownloadPDF = () => {
    // UI placeholder for PDF generation
    alert("Raportin generointi aloitetaan... (Ominaisuus tulossa)");
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-xs font-bold text-slate-500 uppercase">Haku</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Etsi tekijää tai kohdetta..." 
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 w-full md:w-48">
          <label className="text-xs font-bold text-slate-500 uppercase">Toimenpide</label>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Kaikki" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Kaikki</SelectItem>
              <SelectItem value="INVOICE_APPROVED">Laskut</SelectItem>
              <SelectItem value="EXPERT_ORDERED">Asiantuntijat</SelectItem>
              <SelectItem value="TRIAGE_ESCALATED">Eskalaatiot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase">Aikaväli</label>
          <div className="flex gap-2 items-center">
            <Input 
              type="date" 
              className="bg-white text-xs" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-slate-400">-</span>
            <Input 
              type="date" 
              className="bg-white text-xs" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <Button 
          variant="outline" 
          className="bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
          onClick={handleDownloadPDF}
        >
          <Download size={16} className="mr-2" />
          Lataa PDF
        </Button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[180px]">Aikaleima</TableHead>
              <TableHead>Päättäjä</TableHead>
              <TableHead>Toimenpide</TableHead>
              <TableHead>Päätöksen kohde & Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-400 italic">
                  Ei löytyneitä tapahtumia valituilla suodattimilla.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-[11px] text-slate-500">
                    {format(new Date(log.timestamp), "dd.MM.yyyy | HH:mm", { locale: fi })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{log.user.name || "Nimetön"}</span>
                      <span className="text-[10px] text-slate-400 tracking-tight">{log.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-none",
                        log.action === "INVOICE_APPROVED" ? "bg-emerald-50 text-emerald-700" :
                        log.action === "EXPERT_ORDERED" ? "bg-blue-50 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      )}
                    >
                      {translateAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="text-slate-300 mt-0.5 shrink-0" />
                      <span>{formatMetadata(log.action, log.metadata)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* GDPR Note Footer */}
      <footer className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <ShieldAlert size={20} className="text-blue-500 shrink-0" />
          <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
            <span className="font-bold uppercase tracking-wider block mb-0.5">Tietosuojailmoitus</span>
            Tämä näkymä on suojattu ja tarkoitettu vain hallituksen sisäiseen valvontaan. 
            Jokainen katselukerta, haku ja vienti kirjataan automaattisesti GDPR-lokiin oikeusturvasi ja läpinäkyvyyden varmistamiseksi.
          </p>
        </div>
      </footer>
    </div>
  );
}
