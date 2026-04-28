"use client";

import { useState } from "react";
import { getFinancialRoast } from "@/actions/roast";
import { Flame } from "lucide-react";

export default function RoastButton() {
  const [loading, setLoading] = useState(false);
  const [roastMsg, setRoastMsg] = useState<string | null>(null);

  const handleRoast = async () => {
    setLoading(true);
    setRoastMsg(null);
    const res = await getFinancialRoast();
    setRoastMsg(res);
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center my-8">
      <button
        onClick={handleRoast}
        disabled={loading}
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black uppercase tracking-widest rounded-full shadow-lg hover:shadow-rose-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        <Flame size={24} className={loading ? "animate-bounce" : ""} />
        {loading ? "JARVIS Sedang Ngetik..." : "Roast Me, JARVIS!"}
      </button>

      {roastMsg && (
        <div className="mt-8 p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl w-full max-w-3xl text-slate-800 shadow-sm relative overflow-hidden">
            <Flame className="absolute -top-4 -right-4 text-rose-100 opacity-40 rotate-12" size={120} />
            <div className="relative z-10">
                <h3 className="font-black text-rose-600 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Flame size={20} /> JARVIS AI ROASTING:
                </h3>
                <p className="whitespace-pre-wrap font-medium leading-relaxed text-sm sm:text-base text-gray-700">{roastMsg}</p>
            </div>
        </div>
      )}
    </div>
  );
}