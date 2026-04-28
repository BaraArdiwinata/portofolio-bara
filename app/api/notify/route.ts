import { NextResponse } from "next/server";

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const MY_NUMBER = "6281233177952"; // Nomor WA lu

export async function POST(req: Request) {
  try {
    const { action } = await req.json(); 

    // ====================================================
    // 1. NGUMPULIN DATA INTELIJEN DARI HEADERS
    // ====================================================
    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    
    // Deteksi Tipe Device
    let deviceType = "Desktop 💻";
    if (/mobile/i.test(userAgent)) deviceType = "Mobile 📱";
    if (/tablet/i.test(userAgent)) deviceType = "Tablet 💊";

    // Deteksi OS
    let os = "Unknown OS";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/mac os x/i.test(userAgent)) os = "Mac OS";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";
    else if (/linux/i.test(userAgent)) os = "Linux";

    // Deteksi Browser
    let browser = "Unknown Browser";
    if (/chrome|crios/i.test(userAgent) && !/edge|opr\//i.test(userAgent)) browser = "Chrome";
    else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = "Safari";
    else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
    else if (/edg/i.test(userAgent)) browser = "Edge";

    // Deteksi Lokasi & IP (Otomatis dari Vercel Headers)
    let ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown IP";
    ip = ip.split(",")[0].trim(); // Ambil IP pertama kalau ada banyak

    let city = req.headers.get("x-vercel-ip-city") || "Kota Unknown";
    let country = req.headers.get("x-vercel-ip-country") || "Negara Unknown";

    // Fallback Geolocation API (Kalau Vercel headers kosong)
    if (city === "Kota Unknown" && ip !== "Unknown IP" && ip !== "::1" && ip !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          city = geoData.city;
          country = geoData.country;
        }
      } catch (e) {
        // Abaikan kalau gagal
      }
    }

    // Kalau lu ngetest di laptop sendiri (Localhost)
    if (ip === "::1" || ip === "127.0.0.1") {
      city = "Localhost (Laptop Sendiri)";
      country = "Local";
    }

    // ====================================================
    // 2. RAKIT LAPORAN JARVIS
    // ====================================================
    const details = `\n\n🔍 *DETAIL PENGUNJUNG:*\n📱 Tipe: ${deviceType}\n💻 OS: ${os}\n🌐 Browser: ${browser}\n📍 Lokasi: ${city}, ${country}\n🌍 IP: ${ip}`;

    let message = "🚨 *JARVIS ALERT* 🚨\n\nAda aktivitas di website Anda Bos!";
    if (action === "DOWNLOAD_CV") {
       message = `🚨 *JARVIS HOT LEADS* 🚨\n\nBos Bara! Ada pengunjung web yang baru aja nge-klik tombol *Download CV*! Siap-siap rapiin baju buat interview nih! 🔥👔${details}`;
    } else if (action === "HIRE_ME") {
       message = `💸 *CLIENT ALERT* 💸\n\nBos! Seseorang baru aja nge-klik tombol *Contact / Hire Me* di portofolio lu! Siapkan invoice sekarang juga! 💰🚀${details}`;
    }

    // ====================================================
    // 3. TEMBAK KE WA BOS BARA
    // ====================================================
    const url = "https://api.fonnte.com/send";
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: FONNTE_TOKEN || "",
      },
      body: JSON.stringify({
        target: MY_NUMBER,
        message: message,
      }),
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Notif Gagal:", error);
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}