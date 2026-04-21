"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, X, Loader2, AlertTriangle } from "lucide-react";
import { deleteEducation, updateEducation } from "@/actions/education";

export default function EducationRowActions({ edu }: { edu: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function confirmDelete() {
    setIsDeleting(true);
    await deleteEducation(edu.id);
    setIsDeleting(false);
    setIsDeleteOpen(false);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
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

    const res = await updateEducation(edu.id, data);
    if (res.success) setIsEditOpen(false);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => setIsEditOpen(true)} className="p-2 text-slate-400 hover:text-[#FFBD07] bg-white border border-slate-200 rounded-lg shadow-sm" title="Edit Data">
          <Pencil size={16} />
        </button>
        <button onClick={() => setIsDeleteOpen(true)} className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm" title="Hapus Data">
          <Trash2 size={16} />
        </button>
      </div>

      {mounted && isEditOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Edit Pendidikan</h2>
              <button onClick={() => setIsEditOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Institusi</label>
                  <input required name="institution" defaultValue={edu.institution} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Jurusan / Program Studi</label>
                  <input required name="major" defaultValue={edu.major} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tingkat Gelar</label>
                  <input required name="degree" defaultValue={edu.degree} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tahun Masa Studi</label>
                  <input required name="year" defaultValue={edu.year} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi</label>
                <textarea name="description" defaultValue={edu.description || ""} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#013880] disabled:opacity-70">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Update Pendidikan"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {mounted && isDeleteOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={36} /></div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Hapus Pendidikan?</h2>
            <p className="text-slate-500 mb-8">Yakin mau hapus data <span className="font-bold text-[#013880]">"{edu.institution}"</span>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Batal</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600">
                {isDeleting ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Ya, Hapus!"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}