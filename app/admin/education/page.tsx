import { prisma } from "@/lib/prisma";
import { GraduationCap } from "lucide-react";
import EducationModal from "@/components/admin/EducationModal";
import EducationRowActions from "@/components/admin/EducationRowActions";

export default async function EducationPage() {
  const educations = await prisma.education.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Kelola Pendidikan</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Manajemen riwayat pendidikan dan kualifikasi akademik.
          </p>
        </div>
        <EducationModal />
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-200/60 text-[#013880]">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Institusi & Jurusan</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Tingkat</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Tahun</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {educations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-4 bg-slate-50 rounded-full mb-3"><GraduationCap size={24} className="text-slate-300" /></div>
                      <p className="font-medium">Belum ada data pendidikan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                educations.map((edu) => (
                  <tr key={edu.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A]">{edu.institution}</div>
                      <div className="text-xs text-slate-500 mt-1">{edu.major}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{edu.degree}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">{edu.year}</td>
                    <td className="px-6 py-4">
                      <EducationRowActions edu={edu} />
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