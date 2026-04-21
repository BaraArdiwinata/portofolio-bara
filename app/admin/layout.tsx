"use client"; // 👈 Wajib tambah ini biar komponen bisa baca URL secara real-time!

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 👈 Alat pelacak URL
import { LayoutDashboard, Briefcase, FolderDot, GraduationCap } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Nangkep URL saat ini (misal: "/admin/experiences")

  // Fungsi buat ngecek apakah URL saat ini sama dengan link menu
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] relative overflow-hidden">
      
      {/* ✨ AMBIENT GLOWS */}
      <div style={{ willChange: 'transform' }} className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#007BC0]/15 blur-[120px] z-0 pointer-events-none transform-gpu"></div>
      <div style={{ willChange: 'transform' }} className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#FFBD07]/15 blur-[120px] z-0 pointer-events-none transform-gpu"></div>

      {/* 👈 SIDEBAR */}
      <aside className="hidden w-72 flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl p-6 md:flex z-10">
        <div className="mb-10 text-3xl font-extrabold tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013880] to-[#FFBD07]">
            BaraAdmin.
          </span>
        </div>
        
        <nav className="flex flex-col gap-3">
          {/* MENU 1: DASHBOARD */}
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-bold text-sm transition-all group ${
              isActive('/admin') 
                ? 'bg-[#013880] text-white shadow-lg shadow-[#013880]/20' 
                : 'text-slate-500 hover:bg-[#013880]/10 hover:text-[#013880]'
            }`}
          >
            <LayoutDashboard size={18} className={isActive('/admin') ? 'text-white' : 'text-slate-400 group-hover:text-[#013880]'} />
            Ringkasan Dashboard
          </Link>
          
          {/* MENU 2: EXPERIENCES */}
          <Link 
            href="/admin/experiences" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-bold text-sm transition-all group ${
              isActive('/admin/experiences') 
                ? 'bg-[#013880] text-white shadow-lg shadow-[#013880]/20' 
                : 'text-slate-500 hover:bg-[#013880]/10 hover:text-[#013880]'
            }`}
          >
            <Briefcase size={18} className={isActive('/admin/experiences') ? 'text-white' : 'text-slate-400 group-hover:text-[#013880]'} />
            Kelola Pengalaman
          </Link>
          
          {/* MENU 3: PROJECTS */}
          <Link 
            href="/admin/projects" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-bold text-sm transition-all group ${
              isActive('/admin/projects') 
                ? 'bg-[#013880] text-white shadow-lg shadow-[#013880]/20' 
                : 'text-slate-500 hover:bg-[#013880]/10 hover:text-[#013880]'
            }`}
          >
            <FolderDot size={18} className={isActive('/admin/projects') ? 'text-white' : 'text-slate-400 group-hover:text-[#013880]'} />
            Kelola Proyek
          </Link>

          {/* MENU 4: EDUCATION */}
          <Link 
            href="/admin/education" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-bold text-sm transition-all group ${
              isActive('/admin/education') 
                ? 'bg-[#013880] text-white shadow-lg shadow-[#013880]/20' 
                : 'text-slate-500 hover:bg-[#013880]/10 hover:text-[#013880]'
            }`}
          >
            <GraduationCap size={18} className={isActive('/admin/education') ? 'text-white' : 'text-slate-400 group-hover:text-[#013880]'} />
            Kelola Pendidikan
          </Link>
        </nav>
      </aside>

      {/* 👉 KONTEN UTAMA */}
      <div className="flex flex-1 flex-col z-10">
        <header className="flex h-[72px] items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-8">
          <div className="font-extrabold md:hidden text-transparent bg-clip-text bg-gradient-to-r from-[#013880] to-[#FFBD07] text-xl">
            BaraAdmin.
          </div>
          <div className="hidden text-sm font-semibold text-slate-500 md:block tracking-wide">
            Selamat Datang di Portal Administrasi.
          </div>
          <div className="flex items-center gap-4">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} /> 
          </div>
        </header>

        <main className="flex-1 p-8 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}