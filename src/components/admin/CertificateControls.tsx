"use client";

import { Printer } from "lucide-react";

export function CertificateControls() {
  return (
    <div className="max-w-5xl mx-auto mt-8 flex justify-between items-center print:hidden">
      <p className="text-xs text-slate-500 font-medium italic">
        Tämä näkymä on optimoitu tulostettavaksi (Cmd+P).
      </p>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-6 py-2 rounded-xl text-sm font-black transition-all shadow-lg hover:shadow-blue-900/20"
      >
        <Printer size={16} />
        Lataa PDF / Tulosta
      </button>
    </div>
  );
}
