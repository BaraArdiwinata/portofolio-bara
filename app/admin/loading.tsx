import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#013880]" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
        Mengambil Data JARVIS...
      </p>
    </div>
  );
}