// src/components/resident/ResidentTicketForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TicketCategory, TicketPriority, TicketType } from "@prisma/client";
import { createTicket } from "@/app/actions/ops-actions";
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
import {
  Loader2,
  Camera,
  MapPin,
  Key,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Otsikko on liian lyhyt (väh. 5 merkkiä)"),
  description: z.string().min(10, "Kuvaus on pakollinen (väh. 10 merkkiä)"),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
  type: z.nativeEnum(TicketType),
  imageUrl: z.string().min(1, "Kuva on pakollinen nopeaa arviota varten"),
  accessInfo: z.string().min(5, "Pääsyohjeet ovat pakollisia"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  userId: string;
  housingCompanyId: string;
  apartmentNumber: string;
}

export function ResidentTicketForm({
  userId,
  housingCompanyId,
  apartmentNumber,
}: Props) {
  const [step, setStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: TicketCategory.MAINTENANCE,
      priority: TicketPriority.MEDIUM,
      type: TicketType.MAINTENANCE,
      imageUrl: "",
      accessInfo: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    try {
      const res = await createTicket({
        ...values,
        createdById: userId,
        housingCompanyId,
      });

      if (res.success) {
        toast.success("Vikailmoitus lähetetty!");
        router.push("/resident");
      } else {
        toast.error(res.error || "Lähetys epäonnistui.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Jokin meni vikaan.");
    } finally {
      setIsPending(false);
    }
  }

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? "bg-brand-navy" : "bg-slate-200"}`}
          />
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-brand-navy/30 hover:text-slate-600 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <div className="text-center">
                  <p className="font-black uppercase text-xs tracking-widest text-slate-900">
                    Kuvallinen havainto (Pakollinen)
                  </p>
                  <p className="text-[10px] font-medium">
                    Ota kuva viasta tai vauriosta
                  </p>
                </div>
                <Input
                  type="text"
                  placeholder="Paste kuvan URL tässä (Demo)"
                  className="max-w-xs text-xs h-8"
                  {...form.register("imageUrl")}
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-red-500 text-[10px] font-bold uppercase">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Vian otsikko
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="esim. Keittiön hana vuotaa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                onClick={nextStep}
                className="w-full h-12 bg-brand-navy text-white font-black uppercase tracking-widest rounded-xl gap-2"
              >
                Seuraava <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Tekninen oirekuvaus
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Valitse kategoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TicketCategory.MAINTENANCE}>
                            LVI / Putket
                          </SelectItem>
                          <SelectItem value={TicketCategory.PROJECT}>
                            Sähkö / Valastus
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Kiireellisyys
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Valitse kiireellisyys" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TicketPriority.LOW}>
                            Matala
                          </SelectItem>
                          <SelectItem value={TicketPriority.MEDIUM}>
                            Normaali
                          </SelectItem>
                          <SelectItem value={TicketPriority.HIGH}>
                            Kiireellinen
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Tarkempi kuvaus
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Milloin vika alkoi? Mitä tapahtui?"
                        className="min-h-[120px] rounded-xl resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest"
                >
                  <ChevronLeft size={16} /> Takaisin
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-12 bg-brand-navy text-white font-black uppercase tracking-widest rounded-xl gap-2"
                >
                  Seuraava <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-400">
                    Kohde
                  </p>
                  <p className="font-bold text-blue-900">
                    Asunto {apartmentNumber}
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="accessInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Key size={14} /> Pääsy huoneistoon
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Onko kotona lemmikkejä? Saako käyttää yleisavainta? Oletko kotona arkisin klo 8-16?"
                        className="min-h-[100px] rounded-xl resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Asiantuntija tarvitsee nämä tiedot huoltokäynnin
                      suunnitteluun.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest"
                >
                  <ChevronLeft size={16} /> Takaisin
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-12 bg-brand-emerald hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-900/20 transition-all"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Lähetetään...
                    </>
                  ) : (
                    "Vahvista ja lähetä"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
