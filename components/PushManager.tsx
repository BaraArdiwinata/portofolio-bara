"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";

export default function PushManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) return alert("Browser tidak support!");
    
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: { "Content-Type": "application/json" },
      });

      setIsSubscribed(true);
      alert("✅ Notifikasi JARVIS berhasil diaktifkan!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mengaktifkan notifikasi.");
    }
  };

  const testNotif = async () => {
    await fetch("/api/push/send", {
      method: "POST",
      body: JSON.stringify({ title: "JARVIS Online", body: "Sistem notifikasi berjalan lancar, Bos!" }),
    });
  };

  return (
    <div className="flex gap-2">
      {!isSubscribed ? (
        <button onClick={subscribe} className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600/20 transition-colors">
          <Bell size={14} /> Aktifkan Notifikasi
        </button>
      ) : (
        <button onClick={testNotif} className="flex items-center gap-2 bg-emerald-600/10 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600/20 transition-colors">
          <BellRing size={14} /> Test Notifikasi
        </button>
      )}
    </div>
  );
}