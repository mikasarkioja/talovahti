"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInitiative } from "@/app/actions/governance";
import { toast } from "sonner";

interface VotingClientProps {
  housingCompanyId: string;
  userId?: string;
}

export function VotingClient({ housingCompanyId, userId }: VotingClientProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      toast.error("Sinun on oltava kirjautunut luodaksesi aloitteen.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || !description) {
      toast.error("Täytä kaikki pakolliset kentät.");
      return;
    }

    startTransition(async () => {
      const result = await createInitiative({
        title,
        description,
        housingCompanyId,
        authorId: userId,
      });

      if (result.success) {
        toast.success("Aloite luotu onnistuneesti!");
        setOpen(false);
      } else {
        toast.error(result.error || "Aloitteen luonti epäonnistui.");
      }
    });
  };

  return (
    <header className="flex justify-between items-end border-b border-slate-100 pb-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Päätöksenteko</h1>
        <p className="text-slate-500 mt-1">
          Hallitse yhtiökokousasioita ja äänestä osakemääräisellä äänivallalla.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#002f6c] hover:bg-blue-900" disabled={!userId}>
            <Plus className="w-4 h-4 mr-2" />
            Uusi Aloite
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Luo uusi aloite</DialogTitle>
              <DialogDescription>
                Tee ehdotus yhtiökokoukselle tai hallitukselle. Aloite siirtyy
                kannatusvaiheeseen.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Otsikko</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Esim. Sähköautojen latauspisteet"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Kuvaus</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Kuvaile aloitteesi tavoite ja vaikutukset..."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Peruuta
              </Button>
              <Button
                type="submit"
                className="bg-[#002f6c]"
                disabled={isPending}
              >
                {isPending ? "Luodaan..." : "Lähetä aloite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
