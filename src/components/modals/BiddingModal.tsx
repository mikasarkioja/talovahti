// src/components/modals/BiddingModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Send,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMatchingVendors,
  sendBidInvitations,
} from "@/app/actions/ops-actions";

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
}

interface BiddingModalProps {
  observationId: string | null;
  projectId: string | null;
  onClose: () => void;
  userId: string;
}

export function BiddingModal({
  observationId,
  projectId,
  onClose,
  userId,
}: BiddingModalProps) {
  const [step, setStep] = useState(1);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (observationId && step === 1) {
      const fetchVendors = async () => {
        setLoading(true);
        try {
          const res = await getMatchingVendors(observationId);
          if (res.success && res.vendors) {
            setVendors(res.vendors as Vendor[]);
            setSelectedVendors((res.vendors as Vendor[]).map((v) => v.id));
          }
        } catch (error) {
          console.error(error);
          toast.error("Urakoitsijoiden haku epäonnistui.");
        } finally {
          setLoading(false);
        }
      };
      fetchVendors();
    }
  }, [observationId, step]);

  const handleToggleVendor = (id: string) => {
    setSelectedVendors((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleSend = async () => {
    if (!projectId || selectedVendors.length === 0) return;
    setIsSending(true);
    try {
      const res = await sendBidInvitations({
        projectId,
        vendorIds: selectedVendors,
        userId,
      });

      if (res.success) {
        toast.success("Tarjouspyynnöt lähetetty!", {
          description:
            "Magic Linkit on toimitettu urakoitsijoille. Projekti siirretty Kilpailutus-sarakkeeseen.",
        });
        setStep(2);
      } else {
        toast.error(res.error || "Lähetys epäonnistui.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Jokin meni vikaan.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={!!observationId} onOpenChange={() => onClose()}>
      <DialogContent className="bg-white border-slate-200 sm:max-w-[600px] rounded-3xl p-0 overflow-hidden shadow-2xl">
        {step === 1 ? (
          <div className="flex flex-col h-full">
            <DialogHeader className="p-8 pb-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                  <Brain size={24} />
                </div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  Kilpailuta Urakka (AI)
                </DialogTitle>
              </div>
              <DialogDescription className="text-slate-500 font-medium">
                AI loi RFQ-yhteenvedon valvojan lausunnon pohjalta. Valitse
                urakoitsijat kilpailutukseen.
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Suositellut urakoitsijat (Marketplace)
                  </label>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-slate-200 bg-slate-50"
                  >
                    MATCHING ENGINE ACTIVE
                  </Badge>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Loader2
                      size={32}
                      className="animate-spin text-indigo-500"
                    />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Etsitään sopivimpia tekijöitä...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        onClick={() => handleToggleVendor(vendor.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                          selectedVendors.includes(vendor.id)
                            ? "border-brand-navy bg-slate-50 shadow-md"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              selectedVendors.includes(vendor.id)
                                ? "bg-brand-navy text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">
                              {vendor.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                              {vendor.category} • ★ {vendor.rating}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedVendors.includes(vendor.id)
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-200"
                          }`}
                        >
                          {selectedVendors.includes(vendor.id) && (
                            <CheckCircle2 size={14} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 items-start">
                <Zap className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-indigo-400">
                    AI Huomio
                  </p>
                  <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                    RFQ sisältää vaatimuksen **YSE 1998** vakioehdoista ja 5%
                    palvelumaksun automaattisesta vähennyksestä.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 pt-0 flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs text-slate-500"
              >
                Peruuta
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || selectedVendors.length === 0}
                className="flex-[2] h-12 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-xs gap-2 shadow-xl"
              >
                {isSending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
                Lähetä tarjouspyynnöt ({selectedVendors.length})
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
              <ShieldCheck size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                Urakka Kilpailutettu!
              </h2>
              <p className="text-slate-500 font-medium">
                Tarjouspyynnöt on lähetetty valituille urakoitsijoille. Seuraa
                saapuvia tarjouksia Kilpailutus-sarakkeessa.
              </p>
            </div>
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 text-left">
              <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm border border-slate-100">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
                  Status: Magic Linkit lähetetty
                </p>
                <p className="text-xs text-slate-700 font-bold">
                  Urakoitsijat voivat nyt jättää tarjoukset ilman kirjautumista.
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              className="w-full h-14 bg-brand-navy hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest"
            >
              Sulje ja siirry laudalle
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
