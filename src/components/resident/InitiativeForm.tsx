"use client";

import { useState } from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createInitiativeAction } from "@/app/actions/resident-actions";
import { useRouter } from "next/navigation";

export function InitiativeForm({
  userId,
  housingCompanyId,
}: {
  userId: string;
  housingCompanyId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [affectedArea, setAffectedArea] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createInitiativeAction({
        title,
        description,
        userId,
        housingCompanyId,
        affectedArea,
      });

      if (result.success) {
        toast.success("Aloite luotu onnistuneesti!");
        setTitle("");
        setDescription("");
        setAffectedArea("");
        router.refresh();
      } else {
        toast.error("Virhe: " + result.error);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="text-xs font-black uppercase tracking-widest text-slate-500"
        >
          Aloitteen otsikko
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Esim. Pihajuhlat tai Aurinkopaneelit"
          required
          className="rounded-xl border-slate-200 focus:ring-brand-emerald"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-xs font-black uppercase tracking-widest text-slate-500"
        >
          Kuvaus
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kerro lyhyesti mistä on kyse ja miksi tämä on tärkeää."
          required
          className="rounded-xl border-slate-200 min-h-[100px] focus:ring-brand-emerald"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="area"
          className="text-xs font-black uppercase tracking-widest text-slate-500"
        >
          Vaikutusalue (valinnainen)
        </Label>
        <Input
          id="area"
          value={affectedArea}
          onChange={(e) => setAffectedArea(e.target.value)}
          placeholder="Esim. A-rappu, piha-alue"
          className="rounded-xl border-slate-200 focus:ring-brand-emerald"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-emerald hover:bg-emerald-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-emerald-100 transition-all"
      >
        {isPending ? "Luodaan..." : "Lähetä aloite"}
      </Button>
    </form>
  );
}
