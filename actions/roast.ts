"use server";

import { prisma } from "@/lib/prisma";

export async function getFinancialRoast() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const logs = await prisma.financialLog.findMany({
    where: { createdAt: { gte: startOfMonth } }
  });

  let totalIn = 0; let totalOut = 0;
  const expenseDetails: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logs.forEach((log: any) => {
    if (log.type === "IN") totalIn += log.amount;
    if (log.type === "OUT") {
      totalOut += log.amount;
      expenseDetails.push(`${log.category || 'Lainnya'}: Rp${log.amount} (${log.description})`);
    }
  });

  const prompt = `Kamu adalah JARVIS, asisten keuangan AI yang sangat cerewet, julid, dan suka memberikan kritik pedas tapi kocak ala stand-up komedi. Bos kamu (Bara) minta di-roasting soal keuangannya bulan ini.
  Data Bulan Ini:
  Pemasukan: Rp${totalIn}
  Pengeluaran: Rp${totalOut}
  Detail Pengeluaran: ${expenseDetails.join(", ")}

  Berikan roastingan kocak dan menohok dalam bahasa Indonesia gaul gaul kekinian. Maksimal 3 paragraf singkat. Sindir pengeluarannya yang boros. Akhiri dengan satu kalimat motivasi tapi tetep nyinyir. Jangan gunakan kata-kata kasar atau makian.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "Bos, GEMINI_API_KEY di .env lu nggak kebaca nih!";

    // 🔥 FIX: KITA PAKE GEMINI 2.5 FLASH DARI LIST DATABASE GOOGLE LU
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ ERROR GOOGLE API:", data);
      return `JARVIS Error dari Google: ${data.error?.message || "Unknown Error"}`;
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("❌ ERROR FETCH:", error);
    return "JARVIS gagal konek ke satelit Google. Server lagi down!";
  }
}