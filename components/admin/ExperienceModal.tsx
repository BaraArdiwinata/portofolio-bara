"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createExperience } from "@/actions/experience";

export default function ExperienceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi buat nangkep isi form pas tombol 'Simpan' diklik
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      role: formData.get("role") as string,
      category: formData.get("category") as string,
      year: formData.get("year") as string,
      link: formData.get("link") as string,
      description: formData.get("description") as string,
    };

    // Manggil SERVER ACTION yang kita bikin di Task 8 tadi!
    const res = await createExperience(data);

    if (res.success) {
      setIsOpen(false); // Tutup modal kalau sukses
    } else {
      alert("Gagal menyimpan data!");
    }
    
    setIsLoading(false);
  }

  return (
    <>
      {/* TOMBOL TRIGGER (Menggantikan tombol static di page.tsx) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#013880] px-5 py-3 font-bold text-sm text-white shadow-lg shadow-[#013880]/20 hover:bg-[#007BC0] transition-all transform hover:-translate-y-0.5"
      >
        <Plus size={18} />
        Tambah Data
      </button>

      {/* POP-UP MODAL FORM */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Tambah Pengalaman Baru</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Isi Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Posisi/Event */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Event/Organisasi</label>
                  <input required name="title" type="text" placeholder="Cth: RDK ITS 47" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jabatan</label>
                  <input required name="role" type="text" placeholder="Cth: Ketua Pelaksana" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
                </div>

                {/* Kategori & Tahun */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kategori</label>
                  <select required name="category" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all bg-white">
                    <option value="Leadership">Leadership</option>
                    <option value="Event">Event Management</option>
                    <option value="Sosmas">Sosial Masyarakat</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tahun Pelaksanaan</label>
                  <input required name="year" type="text" placeholder="Cth: 2024 - 2025" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
                </div>
              </div>

              {/* Link Bukti (Opsional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link Bukti / Sertifikat (Opsional)</label>
                <input name="link" type="url" placeholder="Cth: https://drive.google.com/..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
              </div>

              {/* Deskripsi (Nah ini dia yang kamu tanyain!) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi Tugas</label>
                <textarea required name="description" rows={4} placeholder="Ceritakan tanggung jawab dan pencapaianmu di sini..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all resize-none"></textarea>
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#FFBD07] hover:bg-[#e5aa06] shadow-lg shadow-[#FFBD07]/20 transition-all disabled:opacity-70">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Data"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}