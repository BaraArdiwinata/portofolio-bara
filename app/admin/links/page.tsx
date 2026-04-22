import { prisma } from "@/lib/prisma";
import { Link2 } from "lucide-react";
import LinkModal from "@/components/admin/LinkModal";
import LinkCard from "@/components/admin/LinkCard"; // 👈 Import Card yang baru kita bikin

export const metadata = {
  title: "Kelola Links & QR | BaraAdmin",
};
export const revalidate = 0;

export default async function LinksPage() {
  const links = await prisma.shortlink.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Links & QR Code</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Manajemen Custom URL (Shortlink) dan generator QR Code otomatis.
          </p>
        </div>
        <LinkModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 bg-slate-50 rounded-full mb-3"><Link2 size={24} className="text-slate-300" /></div>
              <p className="font-medium">Belum ada shortlink yang dibuat.</p>
            </div>
          </div>
        ) : (
          links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))
        )}
      </div>
    </div>
  );
}