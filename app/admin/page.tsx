import { prisma } from "@/lib/prisma";
import { Briefcase, FolderDot, Star } from "lucide-react";

export const metadata = {
  title: "Dashboard | BaraAdmin",
};

export const revalidate = 0;

export default async function AdminDashboard() {
  // 🔥 AMBIL TOTAL DATA REAL-TIME DARI DATABASE
  const totalMasterpiece = await prisma.project.count({
    where: { isFeatured: true }
  });

  const totalArchive = await prisma.project.count({
    where: { isFeatured: false }
  });

  const totalExperience = await prisma.experience.count();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Ringkasan Dashboard</h1>
        <p className="text-slate-500 mt-2 font-medium text-sm">
          Sistem Manajemen Portofolio Terintegrasi.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KOTAK 1: MASTERPIECE */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
          <div className="p-3 bg-blue-50 rounded-xl w-fit group-hover:bg-[#013880] group-hover:text-white transition-colors">
            <Star size={20} className="text-[#013880] group-hover:text-white" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Proyek Utama</p>
          <h2 className="text-5xl font-black text-[#013880] mt-2">{totalMasterpiece}</h2>
        </div>

        {/* KOTAK 2: ARSIP */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
          <div className="p-3 bg-amber-50 rounded-xl w-fit group-hover:bg-[#FFBD07] group-hover:text-white transition-colors">
            <FolderDot size={20} className="text-[#FFBD07] group-hover:text-white" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Arsip Proyek</p>
          <h2 className="text-5xl font-black text-[#013880] mt-2">{totalArchive}</h2>
        </div>

        {/* KOTAK 3: EXPERIENCES */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
          <div className="p-3 bg-blue-50 rounded-xl w-fit group-hover:bg-[#007BC0] group-hover:text-white transition-colors">
            <Briefcase size={20} className="text-[#007BC0] group-hover:text-white" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Pengalaman & Sosmas</p>
          <h2 className="text-5xl font-black text-[#013880] mt-2">{totalExperience}</h2>
        </div>

      </div>
    </div>
  );
}