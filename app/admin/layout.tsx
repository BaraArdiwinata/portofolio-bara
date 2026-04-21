"use client";

import { useState } from "react"; // Tambah state buat buka-tutup
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderDot, 
  GraduationCap, 
  Menu, // Ikon Hamburger
  X     // Ikon Tutup
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State mobile menu
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Komponen Link biar nggak ngetik ulang
  const NavLinks = () => (
    <nav className="flex flex-col gap-3">
      {[
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/experiences", label: "Pengalaman", icon: Briefcase },
        { href: "/admin/projects", label: "Proyek", icon: FolderDot },
        { href: "/admin/education", label: "Pendidikan", icon: GraduationCap },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsSidebarOpen(false)} // Tutup sidebar otomatis pas klik di HP
          className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-bold text-sm transition-all group ${
            isActive(item.href)
              ? "bg-[#013880] text-white shadow-lg shadow-[#013880]/20"
              : "text-slate-500 hover:bg-[#013880]/10 hover:text-[#013880]"
          }`}
        >
          <item.icon
            size={18}
            className={isActive(item.href) ? "text-white" : "text-slate-400 group-hover:text-[#013880]"}
          />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] relative overflow-hidden">
      
      {/* ✨ AMBIENT GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#007BC0]/10 blur-[120px] z-0 pointer-events-none transform-gpu"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#FFBD07]/10 blur-[120px] z-0 pointer-events-none transform-gpu"></div>

      {/* 👈 SIDEBAR DESKTOP */}
      <aside className="hidden w-72 flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl p-6 md:flex z-40">
        <div className="mb-10 text-3xl font-extrabold tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013880] to-[#FFBD07]">
            BaraAdmin.
          </span>
        </div>
        <NavLinks />
      </aside>

      {/* 📱 SIDEBAR MOBILE (OVERLAY) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-[60] p-6 shadow-2xl transition-transform duration-300 md:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-extrabold tracking-tighter text-[#013880]">BaraAdmin.</div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        <NavLinks />
      </aside>

      {/* 👉 KONTEN UTAMA */}
      <div className="flex flex-1 flex-col z-10 w-full">
        {/* HEADER */}
        <header className="flex h-[72px] items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-6 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger Button Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="font-extrabold text-[#013880] md:hidden text-xl tracking-tighter">
              BaraAdmin.
            </div>
            <div className="hidden text-sm font-semibold text-slate-500 md:block tracking-wide italic">
              Selamat Datang di Dashboard Admin Bara!
            </div>
          </div>

          <div className="flex items-center gap-4">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-slate-200" } }} /> 
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}