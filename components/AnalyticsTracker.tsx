"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Cek apakah ini pengunjung lama? Kalau baru, buatin ID KTP (UUID)
    let sessionId = localStorage.getItem("bara_visitor_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID(); // Bikin ID Unik acak
      localStorage.setItem("bara_visitor_id", sessionId);
    }

    // 2. Fungsi buat ngirim laporan ke API
    const trackPage = async () => {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            sessionId: sessionId,
          }),
        });
      } catch (error) {
        console.error("Gagal merekam jejak:", error);
      }
    };

    // 3. Eksekusi pengintaian!
    trackPage();
  }, [pathname]); // Akan jalan ulang tiap orang pindah halaman

  return null; // Render "null" karena ini CCTV gaib, nggak boleh kelihatan di UI
}