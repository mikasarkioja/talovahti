"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  PenTool,
  CheckCircle2,
  Clock,
  Search,
  Hammer,
} from "lucide-react";
import { clsx } from "clsx";
import { useSearchParams } from "next/navigation";
import { createTicket } from "@/app/actions/ops-actions";
import { toast } from "sonner";
import { TicketPriority, TicketType, TicketCategory } from "@prisma/client";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  type: string;
  apartmentId: string | null;
  createdAt: Date;
}

function StatusTimeline({
  status,
  category,
}: {
  status: string;
  category: string;
}) {
  const steps = [
    { id: "RECEIVED", label: "Vastaanotettu", icon: Clock },
    { id: "MAINTENANCE", label: "Huoltoarvio", icon: Search },
    { id: "EXPERT", label: "Asiantuntija", icon: Search },
    { id: "PROGRESS", label: "Työn alla", icon: Hammer },
    { id: "DONE", label: "Valmis", icon: CheckCircle2 },
  ];

  let currentIdx = 0;
  if (status === "RESOLVED" || status === "CLOSED") currentIdx = 4;
  else if (status === "IN_PROGRESS") currentIdx = 3;
  else if (category === "PROJECT") currentIdx = 2;
  else if (status === "OPEN") currentIdx = 1;

  return (
    <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        // Skip "Expert" step for non-project routine items unless already passed
        if (step.id === "EXPERT" && category !== "PROJECT" && currentIdx < 2)
          return null;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={clsx(
                "flex flex-col items-center gap-1 min-w-[80px]",
                isActive ? "text-blue-600" : "text-slate-300",
              )}
            >
              <div
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all",
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-600"
                    : isActive
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-white text-slate-300 border-slate-200",
                )}
              >
                <Icon size={14} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tight">
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={clsx(
                  "w-4 h-0.5 mt-[-14px]",
                  idx < currentIdx ? "bg-blue-200" : "bg-slate-100",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TicketsClient({
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
        category: TicketCategory.MAINTENANCE,
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
    visibleTickets = visibleTickets.filter(
      (t) => t.status === "CLOSED" || t.status === "RESOLVED",
    );
  } else {
    visibleTickets = visibleTickets.filter(
      (t) => t.status !== "CLOSED" && t.status !== "RESOLVED",
    );
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
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
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
                    {{
                      OPEN: "AVOIN",
                      IN_PROGRESS: "TYÖN ALLA",
                      RESOLVED: "RATKAISTU",
                      CLOSED: "SULJETTU",
                    }[ticket.status] || ticket.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {{
                      MAINTENANCE: "YLLÄPITO",
                      RENOVATION: "REMONTTI",
                    }[ticket.type] || ticket.type}
                  </span>
                </div>
                <p className="text-slate-600">{ticket.description}</p>
                <div className="text-sm text-slate-400 flex items-center gap-4 pt-1">
                  <span>Asunto: {ticket.apartmentId || "Yleiset tilat"}</span>
                  <span>
                    Prioriteetti:{" "}
                    {{
                      LOW: "Matala",
                      MEDIUM: "Normaali",
                      HIGH: "Korkea",
                      CRITICAL: "Kriittinen",
                    }[ticket.priority] || ticket.priority}
                  </span>
                </div>
                {filter !== "closed" && (
                  <StatusTimeline
                    status={ticket.status}
                    category={ticket.category}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
