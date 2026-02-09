"use client";

import React, { useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { submitBid } from "@/app/actions/marketplace";
import { toast } from "sonner";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  amount: z.coerce.number().positive("Hinnan on oltava positiivinen luku."),
  startDate: z.string().min(1, "Aloituspäivämäärä on pakollinen."),
  notes: z.string().optional(),
});

type BidFormValues = z.infer<typeof formSchema>;

interface BidFormProps {
  token: string;
  vendorName: string;
  projectName: string;
}

export function BidForm({ token, vendorName, projectName }: BidFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<BidFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: 0,
      startDate: "",
      notes: "",
    },
  });

  const onSubmit: SubmitHandler<BidFormValues> = async (values) => {
    startTransition(async () => {
      const result = await submitBid({
        token,
        amount: values.amount,
        startDate: new Date(values.startDate),
        notes: values.notes,
      });

      if (result.success) {
        toast.success("Tarjous lähetetty onnistuneesti!");
        setIsSubmitted(true);
      } else {
        toast.error(result.error || "Tarjouksen lähettäminen epäonnistui.");
      }
    });
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto border-emerald-100 bg-emerald-50/30">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Tarjous Vastaanotettu!</h2>
          <p className="text-slate-600">
            Kiitos tarjouksestasi, <strong>{vendorName}</strong>. 
            Hallitus on saanut tiedon tarjouksestasi liittyen kohteeseen <strong>{projectName}</strong>.
          </p>
          <p className="text-sm text-slate-500 italic">
            Voit sulkea tämän sivun.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-xl">Jätä Tarjous</CardTitle>
        <p className="text-sm text-slate-500">Täytä tarjouksesi tiedot alle.</p>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="amount">Hinta-arvio (€, alv 0%)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium">€</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 text-lg font-mono"
                {...form.register("amount")}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-xs text-red-500 font-medium">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDate">Toivottu Aloitusajankohta</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="startDate"
                type="date"
                className="pl-10"
                min={new Date().toISOString().split("T")[0]}
                {...form.register("startDate")}
              />
            </div>
            {form.formState.errors.startDate && (
              <p className="text-xs text-red-500 font-medium">{form.formState.errors.startDate.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Lisätiedot ja Huomiot</Label>
            <Textarea
              id="notes"
              placeholder="Esim. 'Hinta sisältää materiaalit', 'Tarvitsemme pääsyn tekniseen tilaan'..."
              className="min-h-[120px] resize-none"
              {...form.register("notes")}
            />
            {form.formState.errors.notes && (
              <p className="text-xs text-red-500 font-medium">{form.formState.errors.notes.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/30 border-t border-slate-100 mt-2 px-6 py-4">
          <Button 
            type="submit" 
            className="w-full bg-[#002f6c] hover:bg-blue-900 text-lg py-6"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Lähetetään...
              </>
            ) : (
              "Lähetä Tarjous"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
