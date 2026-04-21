"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createProject } from "@/actions/project";

export default function ProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Trik mengubah teks "Next.js, Tailwind" jadi Array ["Next.js", "Tailwind"]
    const rawTechStack = formData.get("techStack") as string;
    const techArray = rawTechStack.split(",").map((tech) => tech.trim()).filter(Boolean);

    const data = {
      title: formData.get("title") as string,
      type: formData.get("type") as string,
      techStack: techArray,
      link: formData.get("link") as string,
      image: formData.get("image") as string,
      description: formData.get("description") as string,
      isFeatured: formData.get("isFeatured") === "true", // Convert string to boolean
    };

    const res = await createProject(data);
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
        Tambah Proyek
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-100 z-10">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Tambah Proyek Baru</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Proyek</label>
                  <input required name="title" type="text" placeholder="Cth: ITS Virtual Tour" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipe Proyek</label>
                  <input required name="type" type="text" placeholder="Cth: Web App" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kategori (Masterpiece/Arsip)</label>
                  <select required name="isFeatured" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] bg-white">
                    <option value="true">⭐ Masterpiece (Sorotan Utama)</option>
                    <option value="false">📁 Arsip (Proyek Sampingan)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tech Stack (Pisahkan dgn koma)</label>
                  <input required name="techStack" type="text" placeholder="Cth: Next.js, Tailwind, Prisma" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link Live / Repo (Opsional)</label>
                  <input name="link" type="url" placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link URL Gambar (Opsional)</label>
                  <input name="image" type="url" placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi Proyek (Opsional)</label>
                <textarea name="description" rows={3} placeholder="Ceritakan fitur utama dari proyek ini..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] resize-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#013880] hover:bg-[#007BC0] transition-all disabled:opacity-70">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}