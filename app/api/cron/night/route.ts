import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const MY_NUMBER = "6281233177952"; // Nomor WA asli lu

async function sendWhatsAppMessage(to: string, body: string) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
  });
}

export async function GET(request: Request) {
  try {
    // 1. Hitung Net Worth
    const [financialLogs, stocks] = await Promise.all([
      prisma.financialLog.findMany(),
      prisma.stockPortfolio.findMany(),
    ]);

    let totalIn = 0; let totalOut = 0;
    financialLogs.forEach(log => {
      if (log.type === "IN") totalIn += log.amount;
      if (log.type === "OUT") totalOut += log.amount;
    });
    const liquidBalance = totalIn - totalOut;
    const stockAssets = stocks.reduce((acc, stock) => acc + (stock.totalValue || stock.totalInvested), 0);
    const netWorth = liquidBalance + stockAssets;

    // 2. Bikin Teks Laporan Malam
    const message = `🌙 *JARVIS NIGHTLY RECAP*\n\nSelamat istirahat Bos Bara. Ini ringkasan asetmu hari ini:\n\n💵 *Saldo Liquid:* Rp${liquidBalance.toLocaleString("id-ID")}\n📈 *Aset Saham:* Rp${stockAssets.toLocaleString("id-ID")}\n💎 *TOTAL NET WORTH:* Rp${netWorth.toLocaleString("id-ID")}\n\nGood night, sleep tight! 💤`;

    // 3. Tembak ke WA lu!
    await sendWhatsAppMessage(MY_NUMBER, message);

    return NextResponse.json({ status: "success", message: "Nightly Recap Sent" });
  } catch (error) {
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}