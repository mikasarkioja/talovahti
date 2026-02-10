"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Hammer, Check } from "lucide-react";
import { clsx } from "clsx";

export default function RenovationPage() {
  const { addTicket, currentUser } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleFinish = () => {
    addTicket({
      id: `renov-${Date.now()}`,
      title: `Muutostyöilmoitus: ${category}`,
      description: `Kategoria: ${category}\n\nKuvaus:\n${description}`,
      status: "OPEN",
      priority: "MEDIUM",
      type: "RENOVATION",
      category: "PROJECT",
      triageLevel: "ROUTINE",
      apartmentId: currentUser?.apartmentId || null,
      createdAt: new Date(),
    });
    router.push("/maintenance/tickets");
  };

  const categories = [
    "Keittiöremontti",
    "Kylpyhuoneremontti",
    "Pintaremontti (lattiat/seinät)",
    "Muu",
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Hammer className="text-blue-600" />
          Muutostyöilmoitus
        </h1>
        <p className="text-slate-500 mt-1">
          Hae lupaa huoneiston muutostöille (AsOYL 4:7).
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={clsx(
                "h-2 flex-1 rounded-full transition-colors",
                step >= i ? "bg-blue-600" : "bg-slate-200",
              )}
            />
          ))}
        </div>

        <div className="p-8 min-h-[300px] flex flex-col">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold">
                1. Valitse remontin tyyppi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setStep(2);
                    }}
                    className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-medium text-slate-700"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold">2. Remontin kuvaus</h2>
              <p className="text-sm text-slate-500">
                Kuvaile remontin laajuus, aikataulu ja käytettävät urakoitsijat.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Remontti alkaa..."
              />
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Takaisin
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!description}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Seuraava
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <Check size={32} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Valmista lähetettäväksi?
                </h2>
                <p className="mx-auto mt-2 max-w-md text-slate-500">
                  Ilmoituksesi &quot;{category}&quot; lähetetään isännöitsijälle
                  ja hallitukselle käsittelyyn.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Muokkaa
                </button>
                <button
                  onClick={handleFinish}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Lähetä ilmoitus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
