"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createShortlink } from "@/actions/shortlink";

export default function LinkModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const data = {
      slug: formData.get("slug") as string,
      url: formData.get("url") as string,
    };

    const res = await createShortlink(data);
    if (res.success) {
      setIsOpen(false);
    } else {
      setErrorMsg(res.error || "Gagal menyimpan data");
    }
    setIsLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#013880] px-5 py-3 font-bold text-sm text-white shadow-lg hover:bg-[#007BC0] transition-all transform hover:-translate-y-0.5">
        <Plus size={18} /> Buat Shortlink
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Buat Shortlink Baru</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Kata Kunci (Slug)</label>
                <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#013880]/20 focus-within:border-[#013880]">
                  <span className="pl-4 pr-2 py-3 text-slate-400 font-medium text-sm">bara.com/</span>
                  <input required name="slug" type="text" placeholder="cv" className="w-full py-3 pr-4 bg-transparent outline-none text-sm font-bold text-[#013880]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Link Tujuan (URL Asli)</label>
                <input required name="url" type="url" placeholder="https://drive.google.com/..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#013880] disabled:opacity-70">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}