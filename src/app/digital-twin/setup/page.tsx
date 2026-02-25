import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { DigitalTwinWizard } from "@/components/setup/DigitalTwinWizard";
import { Box, Wrench } from "lucide-react";

export default async function DigitalTwinSetupPage({
  searchParams,
}: {
  searchParams: { user?: string };
}) {
  const userEmail = searchParams.user;
  
  // Find user and company
  const user = userEmail 
    ? await prisma.user.findUnique({ 
        where: { email: userEmail },
        include: { housingCompany: true } 
      })
    : await prisma.user.findFirst({
        where: { role: UserRole.BOARD_MEMBER },
        include: { housingCompany: true }
      });

  if (!user || (user.role !== UserRole.BOARD_MEMBER && user.role !== UserRole.ADMIN)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-200">
          <Wrench size={48} className="mx-auto text-slate-300 mb-4" />
          <h1 className="text-xl font-black text-slate-800">Pääsy evätty</h1>
          <p className="text-slate-500 mt-2">Vain hallituksen jäsenet voivat muokata digitaalista kaksosta.</p>
        </div>
      </div>
    );
  }

  const company = user.housingCompany;

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Box size={14} />
                <span>Kiinteistön Digitaalinen Hallinta</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Digital Twin <span className="text-blue-600">Wizard</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-2xl">
                Rakenna taloyhtiösi 3D-malli ja asuntoluettelo minuuteissa. {company.name} hallinta.
              </p>
            </div>
          </header>

          <DigitalTwinWizard />
        </div>
      </main>
    </div>
  );
}
