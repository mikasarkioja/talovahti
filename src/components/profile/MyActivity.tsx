"use client";

import { useEffect, useState, useTransition } from "react";
import { getUserActivity } from "@/app/actions/resident-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Vote, MessageSquare, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { VoteChoice, GovernanceStatus } from "@prisma/client";

interface ActivityData {
  initiatives: Array<{
    id: string;
    title: string;
    description: string;
    status: GovernanceStatus;
    createdAt: string | Date;
  }>;
  votes: Array<{
    id: string;
    initiative: { title: string };
    choice: VoteChoice;
    timestamp: string | Date;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string | Date;
  }>;
}

export function MyActivity() {
  const { currentUser } = useStore();
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (currentUser?.id) {
      startTransition(async () => {
        const res = await getUserActivity(currentUser.id);
        if (res.success) {
          setActivity(res.data as unknown as ActivityData);
        }
      });
    }
  }, [currentUser?.id]);

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-brand-navy uppercase tracking-tight">
          Omat toiminnot
        </h2>
        {isPending && (
          <Loader2 className="animate-spin text-brand-navy" size={20} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Initiatives */}
        <Card className="shadow-soft border-brand-navy/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
              <MessageSquare size={14} />
              Aloitteet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!activity?.initiatives?.length && (
              <p className="text-[10px] text-slate-500 italic">
                Ei omia aloitteita.
              </p>
            )}
            {activity?.initiatives?.map((init) => (
              <div
                key={init.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="font-bold text-[10px] text-brand-navy line-clamp-1">
                  {init.title}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[8px] uppercase">
                    {init.status}
                  </Badge>
                  <span className="text-[9px] text-slate-400">
                    {new Date(init.createdAt).toLocaleDateString("fi-FI")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Votes */}
        <Card className="shadow-soft border-brand-navy/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
              <Vote size={14} />
              Äänestykset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!activity?.votes?.length && (
              <p className="text-[10px] text-slate-500 italic">
                Ei annettuja ääniä.
              </p>
            )}
            {activity?.votes?.map((vote) => (
              <div
                key={vote.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="font-bold text-[10px] text-brand-navy line-clamp-1">
                  {vote.initiative?.title || "Poistettu aloite"}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge
                    className={`text-[8px] uppercase ${
                      vote.choice === "YES"
                        ? "bg-brand-emerald"
                        : vote.choice === "NO"
                          ? "bg-red-500"
                          : "bg-slate-400"
                    }`}
                  >
                    {vote.choice === "YES"
                      ? "Kyllä"
                      : vote.choice === "NO"
                        ? "Ei"
                        : "Tyhjä"}
                  </Badge>
                  <span className="text-[9px] text-slate-400">
                    {new Date(vote.timestamp).toLocaleDateString("fi-FI")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Volunteer Tasks */}
        <Card className="shadow-soft border-brand-navy/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
              <CheckCircle size={14} />
              Talkootehtävät
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!activity?.tasks?.length && (
              <p className="text-[10px] text-slate-500 italic">
                Ei talkootehtäviä.
              </p>
            )}
            {activity?.tasks?.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="font-bold text-[10px] text-brand-navy line-clamp-1">
                  {task.title}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge
                    variant={
                      task.status === "COMPLETED" ? "default" : "outline"
                    }
                    className={`text-[8px] uppercase ${
                      task.status === "COMPLETED"
                        ? "bg-brand-emerald text-white"
                        : ""
                    }`}
                  >
                    {task.status === "COMPLETED" ? "Valmis" : "Kesken"}
                  </Badge>
                  <span className="text-[9px] text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString("fi-FI")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
