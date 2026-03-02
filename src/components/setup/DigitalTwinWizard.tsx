"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { BuildingModel } from "@/components/BuildingModel";
import { BuildingConfig } from "@/lib/three/BuildingGenerator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveBuildingConfig } from "@/app/actions/building-actions";
import {
  Box,
  Building2,
  Save,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DigitalTwinWizard() {
  const housingCompany = useStore((state) => state.housingCompany);
  const hydrate = useStore((state) => state.hydrate);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generateApts, setGenerateApts] = useState(true);

  // Initial config from housingCompany or defaults
  const [config, setConfig] = useState<BuildingConfig>(
    (housingCompany?.buildingConfig as BuildingConfig) || {
      shape: "I",
      staircases: ["A", "B"],
      floors: 3,
      unitsPerFloor: 2,
      floorHeight: 3.0,
      aptDepth: 10.0,
      staircaseWidth: 4.0,
      turnAtStaircase: "B",
    },
  );

  const updateConfig = (updates: Partial<BuildingConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    // Also update store for live preview if housingCompany exists
    if (housingCompany) {
      hydrate({
        housingCompany: {
          ...housingCompany,
          buildingConfig: next,
        },
      });
    }
  };

  const handleStaircaseChange = (count: number) => {
    const newStaircases = Array.from({ length: count }, (_, i) =>
      String.fromCharCode(65 + i),
    );
    updateConfig({ staircases: newStaircases });
  };

  const handleSave = async () => {
    if (!housingCompany?.id) return;
    setLoading(true);
    const res = await saveBuildingConfig(
      housingCompany.id,
      config,
      generateApts,
    );
    setLoading(false);

    if (res.success) {
      toast.success("Digitaalinen kaksonen on päivitetty.");
      router.push("/digital-twin");
    } else {
      toast.error(res.error || "Tallennus epäonnistui");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* 3D Preview Panel */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[600px] relative">
          <BuildingModel />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 px-4 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-700">
            <Sparkles size={14} className="text-amber-500" />
            <span>Live Esikatselu</span>
          </div>
        </div>

        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  Automaattinen Ehdotus
                </h4>
                <p className="text-emerald-700 text-xs leading-relaxed mt-1">
                  Wizard ehdottaa{" "}
                  <strong>
                    {config.staircases.length *
                      config.floors *
                      config.unitsPerFloor}
                  </strong>{" "}
                  asuntoa näillä valinnoilla.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Box size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-slate-900">
                Talotyypin Konfigurointi
              </CardTitle>
              <p className="text-slate-500 font-medium">
                Vaihe {step} / 3:{" "}
                {step === 1
                  ? "Perusmassa"
                  : step === 2
                    ? "Kerrokset ja portaat"
                    : "Asunnot"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-blue-600" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <Label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                  <Building2 size={16} className="text-blue-500" /> Rakennuksen
                  Muoto
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={config.shape === "I" ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-auto py-6 rounded-2xl border-2 transition-all ${config.shape === "I" ? "border-blue-600 bg-blue-50/50 text-blue-900" : "border-slate-100 bg-white"}`}
                    onClick={() => updateConfig({ shape: "I" })}
                  >
                    <div className="w-12 h-6 bg-slate-300 rounded mb-2 border border-slate-400/20" />
                    <span className="font-bold text-sm">I-Malli</span>
                    <span className="text-[10px] opacity-60">
                      Suora rakennus
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant={config.shape === "L" ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-auto py-6 rounded-2xl border-2 transition-all ${config.shape === "L" ? "border-blue-600 bg-blue-50/50 text-blue-900" : "border-slate-100 bg-white"}`}
                    onClick={() => updateConfig({ shape: "L" })}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      <div className="w-6 h-12 bg-slate-300 rounded-l border border-slate-400/20 translate-x-3" />
                      <div className="w-12 h-6 bg-slate-300 rounded-b border border-slate-400/20 -translate-y-3" />
                    </div>
                    <span className="font-bold text-sm">L-Malli</span>
                    <span className="text-[10px] opacity-60">Kulmatalo</span>
                  </Button>
                </div>
              </div>

              {config.shape === "L" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                    Kääntöpiste
                  </Label>
                  <Select
                    value={config.turnAtStaircase}
                    onValueChange={(v: string) =>
                      updateConfig({ turnAtStaircase: v })
                    }
                  >
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Valitse porras" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.staircases.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}-porras
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400 italic">
                    Valitse porras, jonka kohdalla rakennus kääntyy.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                    <Layers size={14} className="text-blue-500" /> Kerrosmäärä
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={config.floors}
                    onChange={(e) =>
                      updateConfig({ floors: parseInt(e.target.value) || 1 })
                    }
                    className="rounded-xl h-12 text-lg font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                    <Building2 size={14} className="text-blue-500" />{" "}
                    Rappukäytävät
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={config.staircases.length}
                    onChange={(e) =>
                      handleStaircaseChange(parseInt(e.target.value) || 1)
                    }
                    className="rounded-xl h-12 text-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Tekniset Mitat (m)
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Kerroskorkeus
                    </span>
                    <Input
                      type="number"
                      step={0.1}
                      value={config.floorHeight}
                      onChange={(e) =>
                        updateConfig({
                          floorHeight: parseFloat(e.target.value) || 3.0,
                        })
                      }
                      className="rounded-lg h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Rungon Syvyys
                    </span>
                    <Input
                      type="number"
                      step={0.1}
                      value={config.aptDepth}
                      onChange={(e) =>
                        updateConfig({
                          aptDepth: parseFloat(e.target.value) || 10.0,
                        })
                      }
                      className="rounded-lg h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Rapun Leveys
                    </span>
                    <Input
                      type="number"
                      step={0.1}
                      value={config.staircaseWidth}
                      onChange={(e) =>
                        updateConfig({
                          staircaseWidth: parseFloat(e.target.value) || 4.0,
                        })
                      }
                      className="rounded-lg h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <Label className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                  Asuntoja per kerros / rappu
                </Label>
                <Select
                  value={config.unitsPerFloor.toString()}
                  onValueChange={(v) =>
                    updateConfig({ unitsPerFloor: parseInt(v) })
                  }
                >
                  <SelectTrigger className="rounded-xl h-12 font-bold">
                    <SelectValue placeholder="Lukumäärä" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 asunto (Läpitalon)</SelectItem>
                    <SelectItem value="2">2 asuntoa</SelectItem>
                    <SelectItem value="3">3 asuntoa</SelectItem>
                    <SelectItem value="4">4 asuntoa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">
                      Automaattinen Asuntolista
                    </h4>
                    <p className="text-slate-500 text-[10px]">
                      Luo asunnot tietokantaan automaattisesti tallennuksen
                      yhteydessä.
                    </p>
                  </div>
                  <Switch
                    checked={generateApts}
                    onCheckedChange={setGenerateApts}
                  />
                </div>

                {generateApts && (
                  <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {config.staircases.map((s) =>
                      Array.from(
                        { length: config.floors * config.unitsPerFloor },
                        (_, i) => (
                          <div
                            key={`${s}-${i}`}
                            className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-mono text-slate-600"
                          >
                            Asunto {s} {i + 1}
                          </div>
                        ),
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-100 p-8 flex justify-between">
          <Button
            variant="ghost"
            className="rounded-xl h-12 px-6 font-bold text-slate-500"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
          >
            Edellinen
          </Button>

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-blue-200"
                onClick={() => setStep(step + 1)}
              >
                Seuraava
              </Button>
            ) : (
              <Button
                className="bg-brand-emerald hover:bg-emerald-600 text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-emerald-200"
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? "Tallennetaan..." : "Luo Digitaalinen Kaksonen"}
                {!loading && <Save size={18} className="ml-2" />}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
