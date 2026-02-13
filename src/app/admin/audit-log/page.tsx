import { prisma } from "@/lib/db";
import { AuditLogClient } from "./AuditLogClient";
import { RBAC } from "@/lib/auth/rbac";
import { Gavel, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  // 1. Fetch Logs with User Info
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    take: 100, // Limit to recent 100 for performance
  });

  // 2. GDPR Audit: Log that someone viewed the Audit Log
  // In a real app, we'd get the actual userId from the session
  const mockAdminId = "system-admin"; 
  await RBAC.auditAccess(
    mockAdminId,
    "READ",
    "AuditLog",
    "Hallituksen päätöshistorian katselu",
    "internal-admin-ui"
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 bg-white min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-navy text-white rounded-lg">
              <History size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-brand-navy uppercase">
              Päätöshistoria & Vastuunhallinta
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
            Lakisääteinen kirjausketju kaikista hallituksen tekemistä operatiivisista päätöksistä. 
            Tämä raportti varmistaa hallituksen jäsenten oikeusturvan ja yhtiön päätöksenteon läpinäkyvyyden.
          </p>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aktiiviset kirjaukset</p>
            <p className="text-2xl font-black text-brand-navy">{logs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
            <Gavel size={20} />
          </div>
        </div>
      </header>

      <AuditLogClient initialLogs={logs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      }))} />
    </div>
  );
}
