import { prisma } from "@/lib/prisma";
import { FolderDot, Star, Archive } from "lucide-react";
import ProjectModal from "@/components/admin/ProjectModal";
import ProjectRowActions from "@/components/admin/ProjectRowActions";

export const metadata = {
  title: "Kelola Proyek | BaraAdmin",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Kelola Proyek</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Manajemen portfolio masterpiece dan arsip karya.
          </p>
        </div>
        <ProjectModal />
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-200/60 text-[#013880]">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Nama & Tipe Proyek</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Tech Stack</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-4 bg-slate-50 rounded-full mb-3"><FolderDot size={24} className="text-slate-300" /></div>
                      <p className="font-medium">Belum ada data proyek.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A]">{project.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{project.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.map((tech, idx) => (
                          <span key={idx} className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.isFeatured ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#FFBD07] bg-[#FFBD07]/10 px-2.5 py-1 rounded-full border border-[#FFBD07]/20">
                          <Star size={12} fill="currentColor" /> Masterpiece
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <Archive size={12} /> Arsip
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ProjectRowActions project={project} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}