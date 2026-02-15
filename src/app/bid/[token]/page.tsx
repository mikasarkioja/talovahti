// src/app/bid/[token]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { BidForm } from "@/components/bid/BidForm";

interface BidPageProps {
  params: Promise<{ token: string }>;
}

export default async function BidPage({ params }: BidPageProps) {
  const { token } = await params;

  const invitation = await prisma.bidInvitation.findUnique({
    where: { token },
    include: {
      project: true,
      vendor: true,
    },
  });

  if (!invitation) {
    notFound();
  }

  const isExpired = new Date() > invitation.expiresAt;
  const isUsed = !!invitation.usedAt;

  if (isUsed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <CardTitle>Tarjous vastaanotettu</CardTitle>
            <CardDescription>
              Kiitos! Tarjouksesi on tallennettu onnistuneesti järjestelmäämme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Olemme yhteydessä teihin, kun hallitus on käsitellyt tarjoukset.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <CardTitle>Linkki vanhentunut</CardTitle>
            <CardDescription>
              Tämä tarjouslinkki ei ole enää voimassa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Ota yhteyttä isännöitsijään tai valvojaan saadaksesi uuden linkin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="text-2xl font-bold text-blue-900 mb-2 italic">
            TALOVAHTI
          </div>
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
        </div>

        <Card className="border-t-4 border-t-blue-600 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl md:text-2xl">
                  Jätä tarjous
                </CardTitle>
                <CardDescription className="mt-2 text-slate-600">
                  {invitation.vendor.name}, olet kutsuttu jättämään tarjous
                  kohteeseen:
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-1">
                {invitation.project.title}{" "}
                {invitation.project.unitIdentifier
                  ? `- Asunto ${invitation.project.unitIdentifier}`
                  : ""}
              </h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {invitation.project.description ||
                  "Ei tarkempaa kuvausta saatavilla."}
              </p>
            </div>

            <BidForm token={token} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Talovahti Marketplace - Turvallista ja läpinäkyvää urakointia.
        </p>
      </div>
    </div>
  );
}
