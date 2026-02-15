// src/components/resident/RenovationNotificationForm.tsx
"use client";

import { useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RenovationCategory } from "@prisma/client";
import { createRenovationNotificationAction } from "@/app/actions/renovation-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  component: z.string().min(2, "Kohteen nimi on pakollinen"),
  description: z.string().min(10, "Kuvaus on pakollinen (väh. 10 merkkiä)"),
  category: z.nativeEnum(RenovationCategory),
  contractorInfo: z.string().min(2, "Urakoitsijan tiedot ovat pakollisia"),
  schedule: z.string().min(2, "Aikataulu on pakollinen"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  userId: string;
  housingCompanyId: string;
}

export function RenovationNotificationForm({
  userId,
  housingCompanyId,
}: Props) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      component: "",
      description: "",
      category: RenovationCategory.SURFACE,
      contractorInfo: "",
      schedule: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    try {
      const res = await createRenovationNotificationAction({
        ...values,
        userId,
        housingCompanyId,
      });

      if (res.success) {
        toast.success("Muutostyöilmoitus lähetetty onnistuneesti!");
        router.push("/profile"); // Or wherever appropriate
      } else {
        toast.error(res.error || "Ilmoituksen jättäminen epäonnistui.");
      }
    } catch (error) {
      console.error("Renovation submit error:", error);
      toast.error("Jokin meni vikaan.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="component"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "component">;
          }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                Remontin kohde
              </FormLabel>
              <FormControl>
                <Input placeholder="esm. Kylpyhuoneen kaakelointi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "category">;
            }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Kategoria
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse kategoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={RenovationCategory.SURFACE}>
                      Pintamateriaalit (Maalaus, parketti)
                    </SelectItem>
                    <SelectItem value={RenovationCategory.LVI}>
                      LVI (Hanojen vaihto, putket)
                    </SelectItem>
                    <SelectItem value={RenovationCategory.ELECTRICAL}>
                      Sähkö (Pistorasiat, valaisimet)
                    </SelectItem>
                    <SelectItem value={RenovationCategory.STRUCTURAL}>
                      Rakenteellinen (Seinien purku)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-[10px]">
                  Kategoria vaikuttaa automaattiseen riskianalyysiin.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedule"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "schedule">;
            }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Arvioitu aikataulu
                </FormLabel>
                <FormControl>
                  <Input placeholder="esim. Maaliskuu 2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "description">;
          }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                Työseloste / Kuvaus
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Kuvaile tehtävä työ mahdollisimman tarkasti..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contractorInfo"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "contractorInfo">;
          }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                Urakoitsijan tiedot
              </FormLabel>
              <FormControl>
                <Input placeholder="Yrityksen nimi ja Y-tunnus" {...field} />
              </FormControl>
              <FormDescription className="text-[10px]">
                Taloyhtiö vaatii usein urakoitsijalta vakuutukset ja pätevyydet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-navy hover:bg-slate-800 text-white font-black uppercase tracking-widest h-12 rounded-xl transition-all shadow-lg"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Käsitellään...
            </>
          ) : (
            "Lähetä muutostyöilmoitus"
          )}
        </Button>
      </form>
    </Form>
  );
}
