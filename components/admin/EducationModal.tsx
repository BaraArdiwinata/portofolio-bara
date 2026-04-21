"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createEducation } from "@/actions/education";

export default function EducationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      institution: formData.get("institution") as string,
      major: formData.get("major") as string,
      degree: formData.get("degree") as string,
      year: formData.get("year") as string,
      description: formData.get("description") as string,
    };

    const res = await createEducation(data);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert("Gagal menyimpan data!");
    }
    setIsLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#013880] px-5 py-3 font-bold text-sm text-white shadow-lg shadow-[#013880]/20 hover:bg-[#007BC0] transition-all transform hover:-translate-y-0.5">
        <Plus size={18} />
        Tambah Pendidikan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Tambah Pendidikan Baru</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Institusi</label>
                  <input required name="institution" type="text" placeholder="Cth: Institut Teknologi Sepuluh Nopember" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jurusan / Program Studi</label>
                  <input required name="major" type="text" placeholder="Cth: Sistem Informasi" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tingkat Gelar</label>
                  <input required name="degree" type="text" placeholder="Cth: Sarjana (S1)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tahun Masa Studi</label>
                  <input required name="year" type="text" placeholder="Cth: 2022 - Sekarang" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi / Capaian (Opsional)</label>
                <textarea name="description" rows={3} placeholder="Ceritakan IPK, penghargaan, atau aktivitas utamamu..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] resize-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#013880] hover:bg-[#007BC0] transition-all disabled:opacity-70">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Pendidikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}