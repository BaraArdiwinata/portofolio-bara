import { Briefcase, FolderDot, LayoutTemplate } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      
      {/* HEADER PROFESSIONAL */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Ringkasan Dashboard</h1>
        <p className="text-slate-500 mt-2 font-medium text-sm">
          Sistem Manajemen Portofolio Terintegrasi.
        </p>
      </div>

      {/* CARD GRID (Elegan & Clean) */}
      <div className="grid gap-6 md:grid-cols-3 mt-4">
        
        {/* Kartu 1 */}
        <div className="group rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#007BC0]/30 cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-[#007BC0] group-hover:bg-[#007BC0] group-hover:text-white transition-colors">
              <LayoutTemplate size={20} />
            </div>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Proyek Utama</h3>
          <p className="text-4xl font-extrabold text-[#0F172A] group-hover:text-[#013880] transition-colors">2</p>
        </div>

        {/* Kartu 2 */}
        <div className="group rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#FFBD07]/30 cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-[#FFBD07] group-hover:bg-[#FFBD07] group-hover:text-white transition-colors">
              <FolderDot size={20} />
            </div>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Arsip Proyek</h3>
          <p className="text-4xl font-extrabold text-[#0F172A] group-hover:text-[#013880] transition-colors">6</p>
        </div>

        {/* Kartu 3 */}
        <div className="group rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#007BC0]/30 cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-[#007BC0] group-hover:bg-[#007BC0] group-hover:text-white transition-colors">
              <Briefcase size={20} />
            </div>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pengalaman & Sosmas</h3>
          <p className="text-4xl font-extrabold text-[#0F172A] group-hover:text-[#013880] transition-colors">9</p>
        </div>

      </div>
      
    </div>
  );
}