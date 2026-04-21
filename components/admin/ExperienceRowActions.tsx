"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 👈 Jurus Portal buat nembus tabel!
import { Pencil, Trash2, X, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { deleteExperience, updateExperience } from "@/actions/experience";

export default function ExperienceRowActions({ exp }: { exp: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // 👈 State khusus buat Modal Delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wajib buat React Portal di Next.js biar ga error di server
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔴 FUNGSI HAPUS DATA (Sekarang dipanggil dari Modal custom)
  async function confirmDelete() {
    setIsDeleting(true);
    await deleteExperience(exp.id);
    setIsDeleting(false);
    setIsDeleteOpen(false); // Tutup modal setelah beres
  }

  // 🟡 FUNGSI EDIT DATA
  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
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

    const res = await updateExperience(exp.id, data);
    if (res.success) {
      setIsEditOpen(false);
    } else {
      alert("Gagal update data!");
    }
    setIsLoading(false);
  }

  return (
    <>
      {/* ⚙️ TOMBOL AKSI DI TABEL */}
      <div className="flex items-center justify-end gap-2">
        {exp.link && (
          <a href={exp.link} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#007BC0] bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all" title="Lihat Bukti/Link">
            <ExternalLink size={16} />
          </a>
        )}
        <button onClick={() => setIsEditOpen(true)} className="p-2 text-slate-400 hover:text-[#FFBD07] bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all" title="Edit Data">
          <Pencil size={16} />
        </button>
        {/* Tombol Hapus sekarang buka Modal, bukan alert bawaan! 👇 */}
        <button onClick={() => setIsDeleteOpen(true)} className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all" title="Hapus Data">
          <Trash2 size={16} />
        </button>
      </div>

      {/* 🟡 PORTAL: POP-UP MODAL EDIT */}
      {mounted && isEditOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Edit Pengalaman</h2>
              <button onClick={() => setIsEditOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Event/Organisasi</label>
                  <input required name="title" defaultValue={exp.title} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jabatan</label>
                  <input required name="role" defaultValue={exp.role} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kategori</label>
                  <select required name="category" defaultValue={exp.category} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all bg-white">
                    <option value="Leadership">Leadership</option>
                    <option value="Event">Event Management</option>
                    <option value="Sosmas">Sosial Masyarakat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tahun Pelaksanaan</label>
                  <input required name="year" defaultValue={exp.year} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link Bukti / Sertifikat</label>
                <input name="link" defaultValue={exp.link || ""} type="url" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi Tugas</label>
                <textarea required name="description" defaultValue={exp.description} rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#013880]/20 focus:border-[#013880] transition-all resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#FFBD07] hover:bg-[#e5aa06] shadow-lg shadow-[#FFBD07]/20 transition-all disabled:opacity-70">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Update Data"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 🔴 PORTAL: POP-UP MODAL HAPUS (Custom Alert) */}
      {mounted && isDeleteOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 p-8">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Hapus Data?</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Kamu yakin mau menghapus data <span className="font-bold text-[#013880]">"{exp.title}"</span>? Aksi ini permanen dan nggak bisa dibalikin loh.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                Batal
              </button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all disabled:opacity-70">
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Ya, Hapus!"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}