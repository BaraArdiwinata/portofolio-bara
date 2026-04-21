"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, X, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { deleteProject, updateProject } from "@/actions/project";

export default function ProjectRowActions({ project }: { project: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function confirmDelete() {
    setIsDeleting(true);
    await deleteProject(project.id);
    setIsDeleting(false);
    setIsDeleteOpen(false);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawTechStack = formData.get("techStack") as string;
    const techArray = rawTechStack.split(",").map((t) => t.trim()).filter(Boolean);

    const data = {
      title: formData.get("title") as string,
      type: formData.get("type") as string,
      techStack: techArray,
      link: formData.get("link") as string,
      image: formData.get("image") as string,
      description: formData.get("description") as string,
      isFeatured: formData.get("isFeatured") === "true",
    };

    const res = await updateProject(project.id, data);
    if (res.success) setIsEditOpen(false);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#007BC0] bg-white border border-slate-200 rounded-lg shadow-sm" title="Lihat Project">
            <ExternalLink size={16} />
          </a>
        )}
        <button onClick={() => setIsEditOpen(true)} className="p-2 text-slate-400 hover:text-[#FFBD07] bg-white border border-slate-200 rounded-lg shadow-sm" title="Edit Data">
          <Pencil size={16} />
        </button>
        <button onClick={() => setIsDeleteOpen(true)} className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm" title="Hapus Data">
          <Trash2 size={16} />
        </button>
      </div>

      {mounted && isEditOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-100 z-10">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Edit Proyek</h2>
              <button onClick={() => setIsEditOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Proyek</label>
                  <input required name="title" defaultValue={project.title} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipe Proyek</label>
                  <input required name="type" defaultValue={project.type} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                  <select required name="isFeatured" defaultValue={project.isFeatured ? "true" : "false"} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
                    <option value="true">⭐ Masterpiece (Sorotan Utama)</option>
                    <option value="false">📁 Arsip (Proyek Sampingan)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tech Stack (Pisahkan koma)</label>
                  <input required name="techStack" defaultValue={project.techStack.join(", ")} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Link Live/Repo</label>
                  <input name="link" defaultValue={project.link || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Link URL Gambar</label>
                  <input name="image" defaultValue={project.image || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi</label>
                <textarea name="description" defaultValue={project.description || ""} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[#013880] disabled:opacity-70">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Update Proyek"}
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
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Hapus Proyek?</h2>
            <p className="text-slate-500 mb-8">Yakin mau hapus proyek <span className="font-bold text-[#013880]">"{project.title}"</span>?</p>
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