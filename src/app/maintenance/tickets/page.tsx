"use client";
import { useState, useTransition } from "react";
import { Plus, PenTool } from "lucide-react";
import { clsx } from "clsx";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createTicket } from "@/app/actions/ops-actions";
import { toast } from "sonner";
import { prisma } from "@/lib/db";
import { TicketPriority, TicketType } from "@prisma/client";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  apartmentId: string | null;
  createdAt: Date;
}

function TicketsContent({
  initialTickets,
  context,
}: {
  initialTickets: Ticket[];
  context: { companyId?: string; userId?: string };
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const searchParams = useSearchParams();
  const filter = searchParams.get("filter"); // 'closed' or null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (!context.companyId || !context.userId) {
      toast.error("Yhtiön tai käyttäjän tietoja ei löytynyt.");
      return;
    }

    startTransition(async () => {
      const result = await createTicket({
        title,
        description,
        priority: TicketPriority.MEDIUM,
        type: TicketType.MAINTENANCE,
        housingCompanyId: context.companyId!,
        createdById: context.userId!,
      });

      if (result.success) {
        toast.success("Vikailmoitus lähetetty!");
        setIsCreating(false);
        setTitle("");
        setDescription("");
      } else {
        toast.error(result.error || "Lähetys epäonnistui.");
      }
    });
  };

  // Filter tickets
  let visibleTickets = initialTickets;

  if (filter === "closed") {
    visibleTickets = visibleTickets.filter((t) => t.status === "CLOSED");
  } else {
    visibleTickets = visibleTickets.filter((t) => t.status !== "CLOSED");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <PenTool className="text-blue-600" />
            {filter === "closed" ? "Huoltokirja (Historia)" : "Vikailmoitukset"}
          </h1>
          <p className="text-slate-500 mt-1">
            {filter === "closed"
              ? "Arkisto suoritetuista huoltotoimenpiteistä."
              : "Hallinnoi huoltopyyntöjä ja ilmoita vioista."}
          </p>
        </div>

        {filter !== "closed" && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <Plus size={18} />
            Uusi ilmoitus
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="font-semibold text-lg mb-4">Uusi vikailmoitus</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Otsikko
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Esim. Vuotava hana"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kuvaus
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Tarkempi kuvaus ongelmasta..."
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900"
                disabled={isPending}
              >
                Peruuta
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                disabled={isPending}
              >
                {isPending ? "Lähetetään..." : "Lähetä ilmoitus"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {visibleTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            {filter === "closed"
              ? "Ei huoltohistoriaa."
              : "Ei avoimia vikailmoituksia."}
          </div>
        ) : (
          visibleTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {ticket.title}
                  </h3>
                  <span
                    className={clsx(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      ticket.status === "OPEN" &&
                        "bg-red-50 text-red-700 border-red-200",
                      ticket.status === "IN_PROGRESS" &&
                        "bg-yellow-50 text-yellow-700 border-yellow-200",
                      ticket.status === "RESOLVED" &&
                        "bg-green-50 text-green-700 border-green-200",
                      ticket.status === "CLOSED" &&
                        "bg-slate-100 text-slate-600 border-slate-200",
                    )}
                  >
                    {ticket.status === "CLOSED" ? "SUORITETTU" : ticket.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {ticket.type}
                  </span>
                </div>
                <p className="text-slate-600">{ticket.description}</p>
                <div className="text-sm text-slate-400 flex items-center gap-4 pt-1">
                  <span>Asunto: {ticket.apartmentId || "Yleiset tilat"}</span>
                  <span>Prioriteetti: {ticket.priority}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Separate Server Component to fetch data
async function TicketsPageServer() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: { apartment: true },
  });

  const company = await prisma.housingCompany.findFirst();
  const boardUser = await prisma.user.findFirst({
    where: { role: "BOARD", housingCompanyId: company?.id },
  });

  return (
    <TicketsContent
      initialTickets={JSON.parse(JSON.stringify(tickets))}
      context={{ companyId: company?.id, userId: boardUser?.id }}
    />
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div>Ladataan...</div>}>
      <TicketsPageServer />
    </Suspense>
  );
}
