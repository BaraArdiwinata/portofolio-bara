import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const MY_NUMBER = "6281233177952"; // Nomor WA asli lu

// ==========================================
// 1. FUNGSI KIRIM WA
// ==========================================
async function sendWhatsAppMessage(to: string, body: string) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
  });
}

// ==========================================
// 2. FUNGSI BACA GOOGLE CALENDAR
// ==========================================
async function getTodayAgenda() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Hack penting: Replace \\n jadi \n beneran biar key-nya gak error
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    
    // Set waktu dari 00:00 hari ini sampai 23:59 hari ini
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items;
    if (!events || events.length === 0) {
      return "Tidak ada jadwal meeting/acara hari ini. Gas fokus eksekusi task!";
    }

    let agendaText = "";
    events.forEach((event, index) => {
      // Format jam (contoh: 10:00)
      const startTime = event.start?.dateTime 
        ? new Date(event.start.dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':')
        : "All Day";
      agendaText += `🗓️ [${startTime}] ${event.summary}\n`;
    });

    return agendaText.trim();
  } catch (error) {
    console.error("❌ Google Calendar Error:", error);
    return "Gagal narik jadwal dari Google Calendar. Pastikan key/email valid.";
  }
}

// ==========================================
// 3. ENDPOINT CRON JOB (JAM 6 PAGI)
// ==========================================
export async function GET(request: Request) {
  try {
    // 1. Tarik Saldo Finance
    const logs = await prisma.financialLog.findMany();
    let totalIn = 0; let totalOut = 0;
    logs.forEach(log => {
      if (log.type === "IN") totalIn += log.amount;
      if (log.type === "OUT") totalOut += log.amount;
    });
    const liquidBalance = totalIn - totalOut;

    // 2. Tarik Jadwal Google Calendar
    const agendaHariIni = await getTodayAgenda();

    // 3. Rakit Pesan JARVIS
    const message = `☀️ *SELAMAT PAGI BOS BARA!*\n\nSemoga hari ini penuh semangat! 🔥\n\n💰 *Saldo Liquid Saat Ini:* Rp${liquidBalance.toLocaleString("id-ID")}\n\n📋 *AGENDA HARI INI:*\n${agendaHariIni}\n\nJangan lupa sarapan dan semangat berkarya! 🚀`;

    // 4. Kirim WA!
    await sendWhatsAppMessage(MY_NUMBER, message);

    return NextResponse.json({ status: "success", agenda: agendaHariIni });
  } catch (error) {
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}