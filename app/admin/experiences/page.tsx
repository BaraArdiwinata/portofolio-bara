import { prisma } from "@/lib/prisma";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import ExperienceModal from "@/components/admin/ExperienceModal";
import ExperienceRowActions from "@/components/admin/ExperienceRowActions";

export const metadata = {
  title: "Kelola Pengalaman | BaraAdmin",
};

// Perhatikan ada kata 'async' di sini! Ini adalah Server Component.
export default async function ExperiencesPage() {
  
  // 🔥 SIHIR NEXT.JS: Ambil data langsung dari database Supabase sebelum halamannya dirender!
  const experiences = await prisma.experience.findMany({
    orderBy: { createdAt: "desc" }, // Urutin dari yang paling baru ditambahin
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Kelola Pengalaman</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Manajemen data rekam jejak organisasi, event, dan sosial masyarakat.
          </p>
        </div>
        <ExperienceModal /> {/* Pindahkan tombol "Tambah Data" ke dalam komponen modal */}
      </div>

      {/* 📊 KOTAK TABEL */}
      <div className="rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            
            {/* KEPALA TABEL */}
            <thead className="bg-slate-50/50 border-b border-slate-200/60 text-[#013880]">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Posisi & Event</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Kategori</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Tahun</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            
            {/* BADAN TABEL (ISI DATA) */}
            <tbody className="divide-y divide-slate-100">
              {experiences.length === 0 ? (
                // 🪹 TAMPILAN KALAU DATABASE MASIH KOSONG
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-4 bg-slate-50 rounded-full mb-3">
                        <Plus size={24} className="text-slate-300" />
                      </div>
                      <p className="font-medium">Belum ada data pengalaman.</p>
                      <p className="text-xs mt-1">Klik tombol "Tambah Data" di atas untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // 📝 TAMPILAN KALAU ADA DATA DI DATABASE
                experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A] group-hover:text-[#013880] transition-colors">{exp.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{exp.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block text-[10px] font-bold text-[#FFBD07] bg-[#FFBD07]/10 px-2.5 py-1 rounded-full border border-[#FFBD07]/20 uppercase tracking-wider">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{exp.year}</td>
                    <td className="px-6 py-4">
                      <ExperienceRowActions exp={exp} />
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