"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderDot, 
  GraduationCap, 
  Menu, 
  X,
  Link2     
} from "lucide-react";

// 🟢 FIX-NYA DI SINI: Komponen NavLinks kita pindah ke LUAR biar aman!
function NavLinks({ expanded, onLinkClick }: { expanded: boolean; onLinkClick: () => void }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/experiences", label: "Pengalaman", icon: Briefcase },
    { href: "/admin/projects", label: "Proyek", icon: FolderDot },
    { href: "/admin/education", label: "Pendidikan", icon: GraduationCap },
    { href: "/admin/links", label: "Links & QR", icon: Link2 },
  ];

  return (
    <nav className="flex flex-col gap-3">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onLinkClick} // Manggil fungsi tutup dari props
          title={!expanded ? item.label : ""} 
          className={`flex items-center gap-3 rounded-xl p-3.5 font-bold text-sm transition-all group overflow-hidden ${
            isActive(item.href)
              ? "bg-[#013880] text-white shadow-lg shadow-[#013880]/20"
              : "text-slate-500 hover:bg-[#013880]/10 hover:text-[#013880]"
          } ${expanded ? "px-4" : "justify-center"}`}
        >
          <item.icon
            size={20}
            className={`flex-shrink-0 ${isActive(item.href) ? "text-white" : "text-slate-400 group-hover:text-[#013880]"}`}
          />
          <span className={`whitespace-nowrap transition-all duration-300 ${expanded ? "opacity-100 w-auto ml-2" : "opacity-0 w-0 ml-0"}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);

  return (
    // 🔥 KUNCI RAHASIA: Ganti min-h-screen jadi h-screen, dan pastikan overflow-hidden
    <div className="flex h-screen w-full bg-[#FAFAFA] relative overflow-hidden">
      
      {/* ✨ AMBIENT GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#007BC0]/10 blur-[120px] z-0 pointer-events-none transform-gpu"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#FFBD07]/10 blur-[120px] z-0 pointer-events-none transform-gpu"></div>

      {/* 👈 SIDEBAR DESKTOP (BISA NYUSUT) */}
      <aside className={`hidden md:flex flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 z-40 h-full flex-shrink-0 ${isDesktopExpanded ? "w-72 p-6" : "w-24 p-4"}`}>
        <div className={`mb-10 flex items-center h-10 ${isDesktopExpanded ? "justify-between" : "justify-center"}`}>
          {isDesktopExpanded ? (
            <span className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#013880] to-[#FFBD07] whitespace-nowrap">
              BaraAdmin.
            </span>
          ) : (
            <span className="text-3xl font-extrabold tracking-tighter text-[#013880]">
              B.
            </span>
          )}
        </div>
        {/* Panggil komponen NavLinks dengan Props yang bener */}
        <div className="overflow-y-auto flex-1 hide-scrollbar">
          <NavLinks expanded={isDesktopExpanded} onLinkClick={() => setIsMobileOpen(false)} />
        </div>
      </aside>

      {/* 📱 SIDEBAR MOBILE (OVERLAY) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-[60] p-6 shadow-2xl transition-transform duration-300 md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-extrabold tracking-tighter text-[#013880]">BaraAdmin.</div>
          <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 hide-scrollbar">
          <NavLinks expanded={true} onLinkClick={() => setIsMobileOpen(false)} />
        </div>
      </aside>

      {/* 👉 KONTEN UTAMA */}
      {/* 🔥 KUNCI RAHASIA: Pastikan bungkus kanan ini h-full dan overflow-hidden biar nahan tinggi layar */}
      <div className="flex flex-1 flex-col z-10 w-full min-w-0 h-full overflow-hidden">
        
        {/* HEADER */}
        {/* 🔥 Gak usah sticky lagi, cukup kasih flex-shrink-0 biar tinggi 72px-nya mutlak */}
        <header className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-6 md:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileOpen(true);
                } else {
                  setIsDesktopExpanded(!isDesktopExpanded);
                }
              }}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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

        {/* AREA KONTEN (SCROLLABLE) */}
        {/* 🔥 KUNCI RAHASIA: overflow-y-auto ditaruh di sini biar dia doang yang nge-scroll */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}