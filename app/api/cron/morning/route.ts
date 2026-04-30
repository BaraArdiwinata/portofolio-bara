import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

// 🔥 PAKE FONNTE SEKARANG
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const MY_NUMBER = "6281233177952"; // Nomor WA asli lu

// ==========================================
// 1. FUNGSI KIRIM WA (FONNTE)
// ==========================================
async function sendFonnteMessage(target: string, message: string) {
  const url = "https://api.fonnte.com/send";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: FONNTE_TOKEN || "",
    },
    body: JSON.stringify({
      target: target,
      message: message,
    }),
  });
  if (!response.ok) {
    console.error("❌ Gagal kirim Fonnte:", await response.text());
  }
}

// ==========================================
// 2. FUNGSI BACA GOOGLE CALENDAR
// ==========================================
async function getTodayAgenda() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    
    // 🔥 FIX: Paksa ambil tanggal hari ini sesuai zona WIB (Asia/Jakarta)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    
    // Pecah format MM/DD/YYYY dari Intl.DateTimeFormat
    const [{value: mo}, , {value: da}, , {value: ye}] = formatter.formatToParts(new Date());

    // Rakit manual ISO string dengan offset +07:00 (WIB)
    const startOfDay = `${ye}-${mo}-${da}T00:00:00+07:00`;
    const endOfDay = `${ye}-${mo}-${da}T23:59:59+07:00`;

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
    events.forEach((event) => {
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
export async function GET() {
  try {
    // 1. Tarik Saldo Finance
    const logs = await prisma.financialLog.findMany();
    let totalIn = 0; let totalOut = 0;
    logs.forEach((log) => {
      if (log.type === "IN") totalIn += log.amount;
      if (log.type === "OUT") totalOut += log.amount;
    });
    const liquidBalance = totalIn - totalOut;

    // 2. Tarik Jadwal Google Calendar
    const agendaHariIni = await getTodayAgenda();

    // 3. Rakit Pesan JARVIS
    const message = `☀️ *JARVIS DAILY REMINDER*\n\nSelamat pagi Bara.\nSemoga hari ini penuh semangat! 🔥\n\n💰 *Saldo Liquid Saat Ini:* Rp${liquidBalance.toLocaleString("id-ID")}\n\n📋 *AGENDA HARI INI:*\n${agendaHariIni}\n\nJangan lupa sarapan dan semangat berkarya! 🚀`;

    // 4. Kirim WA!
    await sendFonnteMessage(MY_NUMBER, message);

    return NextResponse.json({ status: "success", agenda: agendaHariIni });
  } catch (error) {
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}