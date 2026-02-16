import { prisma } from "@/lib/db";
import { getInitiatives } from "@/app/actions/resident-actions";
import { InitiativeForm } from "@/components/resident/InitiativeForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Clock,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { SupportButton } from "@/components/resident/SupportButton";

export default async function InitiativesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userEmail =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  const company = await prisma.housingCompany.findFirst();
  if (!company) return <div>Yhtiötä ei löytynyt.</div>;

  let user = null;
  if (userEmail) {
    user = await prisma.user.findFirst({
      where: { email: userEmail, housingCompanyId: company.id },
    });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: "RESIDENT", housingCompanyId: company.id },
    });
  }

  if (!user) return <div>Käyttäjää ei löytynyt.</div>;

  const initiatives = await getInitiatives(company.id);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/resident">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Osakasaloitteet
          </h1>
          <p className="text-slate-500 font-medium">
            Vaikuta taloyhtiösi tulevaisuuteen tekemällä tai kannattamalla
            aloitteita.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <MessageSquare size={14} /> Avoimet aloitteet
          </h2>

          <div className="space-y-4">
            {initiatives.map((init) => (
              <Card
                key={init.id}
                className="border-slate-200 shadow-sm overflow-hidden group"
              >
                <CardContent className="p-0">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-emerald transition-colors">
                            {init.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold uppercase tracking-wider"
                          >
                            {init.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {init.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-slate-300" />
                        <span>{init.user.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-300" />
                        <span>
                          {format(init.createdAt, "d.M.yyyy", { locale: fi })}
                        </span>
                      </div>
                      {init.affectedArea && (
                        <div className="flex items-center gap-1.5 text-blue-500">
                          <MapPin size={14} className="text-blue-300" />
                          <span>{init.affectedArea}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(3, init.supporters.length))].map(
                            (_: unknown, i: number) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"
                              />
                            ),
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                          {init.supporters.reduce(
                            (sum: number, s: any) =>
                              sum + (s.user.apartment?.shareCount || 0),
                            0,
                          )}{" "}
                          ääntä
                          <span className="text-slate-300 mx-1">/</span>
                          {init.requiredSupport} tarvitaan
                        </p>
                      </div>

                      <SupportButton
                        initiativeId={init.id}
                        userId={user.id}
                        isSupported={init.supporters.some(
                          (s: any) => s.userId === user.id,
                        )}
                        disabled={
                          init.status !== "OPEN_FOR_SUPPORT" ||
                          user.role === "RESIDENT"
                        }
                      />
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-brand-emerald transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (init.supporters.reduce((sum: number, s: any) => sum + (s.user.apartment?.shareCount || 0), 0) / init.requiredSupport) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {initiatives.length === 0 && (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 italic">
                Ei vielä aloitteita. Ole ensimmäinen!
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <ThumbsUp size={14} /> Tee uusi aloite
          </h2>
          <InitiativeForm
        userId={user.id}
        housingCompanyId={company.id}
        disabled={user.role === "RESIDENT"}
      />

          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                <Users size={18} className="text-blue-400" /> Vaikuttamisen
                polku
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </div>
                  <p className="text-xs text-slate-300">
                    Tee aloite tärkeästä aiheesta.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </div>
                  <p className="text-xs text-slate-300">
                    Kerää {initiatives[0]?.requiredSupport || 10} kannattajaa
                    muilta osakkailta.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold shrink-0 border border-blue-500/50">
                    3
                  </div>
                  <p className="text-xs text-slate-100 font-bold">
                    Aloite etenee automaattisesti yhtiökokouksen asialistalle.
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
