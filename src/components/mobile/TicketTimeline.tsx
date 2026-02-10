"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Hammer, Search, ShieldCheck } from "lucide-react";
import { TicketCategory, TriageLevel, TicketStatus } from "@prisma/client";

interface TicketTimelineProps {
  status: TicketStatus;
  category: TicketCategory;
  triageLevel: TriageLevel;
}

export function TicketTimeline({
  status,
  category,
  triageLevel,
}: TicketTimelineProps) {
  const steps = [
    {
      id: "RECEIVED",
      label: "Vastaanotettu",
      icon: Clock,
      completed: true,
      active: status === "OPEN" && triageLevel === "ROUTINE",
    },
    {
      id: "TRIAGE",
      label: "Huollon arvio",
      icon: Search,
      completed: triageLevel !== "ROUTINE" || status !== "OPEN",
      active: status === "OPEN" && triageLevel === "ROUTINE", // Simplified for demo
    },
    {
      id: "EXPERT",
      label: "Asiantuntija",
      icon: ShieldCheck,
      completed: status === "CLOSED" || status === "RESOLVED",
      active: triageLevel === "ESCALATED" && status !== "CLOSED",
      hidden: category !== "PROJECT",
    },
    {
      id: "WORK",
      label: "Työn alla",
      icon: Hammer,
      completed: status === "CLOSED" || status === "RESOLVED",
      active: status === "IN_PROGRESS",
    },
    {
      id: "DONE",
      label: "Valmis",
      icon: CheckCircle2,
      completed: status === "CLOSED" || status === "RESOLVED",
      active: status === "RESOLVED" || status === "CLOSED",
    },
  ];

  const visibleSteps = steps.filter((s) => !s.hidden);

  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

        {visibleSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  step.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : step.active
                      ? "bg-white border-blue-500 text-blue-500 animate-pulse"
                      : "bg-white border-slate-200 text-slate-300",
                )}
              >
                <Icon size={14} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  step.active ? "text-blue-600 font-bold" : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
