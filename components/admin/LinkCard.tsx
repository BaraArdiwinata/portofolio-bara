"use client";

import { useState, useRef } from "react";
import { Trash2, ExternalLink, Copy, Download, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react"; 
import { deleteShortlink } from "@/actions/shortlink";
import { Shortlink } from "@prisma/client"; // 👈 1. INI OBAT ANTI ERROR ESLINT-NYA!

// 👈 2. Ganti 'any' jadi 'Shortlink' biar TypeScript bahagia
export default function LinkCard({ link }: { link: Shortlink }) { 
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);
  
  // Nanti disesuaikan sama domain asli kamu pas rilis
  const fullLink = `https://bara-ardiwinata.com/${link.slug}`;

  // Fungsi COPY
  const handleCopy = () => {
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  // Fungsi DOWNLOAD QR jadi PNG
  const handleDownload = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${link.slug}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col group relative">
      <div className="flex justify-between items-start mb-6">
        {/* QR CODE GENERATOR (DENGAN LOGO) */}
        <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
          <QRCodeCanvas 
            id={`qr-${link.id}`}
            ref={qrRef}
            value={fullLink} 
            size={100} 
            bgColor={"#ffffff"}
            fgColor={"#0F172A"}
            level={"H"} 
            imageSettings={{
              src: "/icon.png", // 👈 GANTI JADI INI (Sesuai nama file di folder public)
              height: 24,
              width: 24,
              excavate: true, 
            }}
          />
        </div>
        
        <button onClick={() => deleteShortlink(link.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Link">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custom Link</p>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-lg font-extrabold text-[#013880] truncate">bara.com/{link.slug}</span>
          <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-[#007BC0] bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors" title="Copy Link">
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
        
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tujuan Asli</p>
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#007BC0] truncate max-w-full mb-6">
          <ExternalLink size={14} className="flex-shrink-0" />
          <span className="truncate">{link.url}</span>
        </a>

        {/* TOMBOL DOWNLOAD QR */}
        <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#013880]/5 hover:bg-[#013880] text-[#013880] hover:text-white font-bold text-sm rounded-xl transition-all border border-[#013880]/10">
          <Download size={16} /> Download QR Code
        </button>
      </div>
    </div>
  );
}