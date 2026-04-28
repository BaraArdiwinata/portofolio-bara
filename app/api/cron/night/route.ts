import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import YahooFinance from "yahoo-finance2";

// 🔥 PAKE FONNTE SEKARANG
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const MY_NUMBER = "6281233177952"; // Nomor WA asli lu
const yahooFinance = new YahooFinance();

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

export async function GET() {
  try {
    // 1. Tarik Data Database
    const [financialLogs, dbStocks] = await Promise.all([
      prisma.financialLog.findMany(),
      prisma.stockPortfolio.findMany(),
    ]);

    // 2. Tarik Harga Saham Live Penutupan Hari Ini
    const stocks = await Promise.all(
      dbStocks.map(async (stock) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const quote: any = await yahooFinance.quote(`${stock.emitenCode}.JK`);
          const livePrice = quote.regularMarketPrice || stock.averageBuyPrice;
          const liveTotalValue = livePrice * stock.lotQuantity * 100;
          return { ...stock, totalValue: liveTotalValue };
        } catch {
          return { ...stock, totalValue: stock.totalInvested };
        }
      })
    );

    // 3. Kalkulasi Net Worth
    let totalIn = 0; let totalOut = 0;
    financialLogs.forEach((log) => {
      if (log.type === "IN") totalIn += log.amount;
      if (log.type === "OUT") totalOut += log.amount;
    });
    
    const liquidBalance = totalIn - totalOut;
    const stockAssetsLive = stocks.reduce((acc, stock) => acc + stock.totalValue, 0);
    const netWorth = liquidBalance + stockAssetsLive;

    // 4. Bikin Teks Laporan Malam
    const message = `🌙 *JARVIS NIGHTLY RECAP*\n\nSelamat istirahat Bara. Ini ringkasan asetmu hari ini (Closing Market):\n\n💵 *Saldo Liquid:* Rp${liquidBalance.toLocaleString("id-ID")}\n📈 *Aset Saham (Live):* Rp${stockAssetsLive.toLocaleString("id-ID")}\n💎 *TOTAL NET WORTH:* Rp${netWorth.toLocaleString("id-ID")}\n\nGood night, sleep tight! 💤`;

    // 5. Tembak ke WA lu!
    await sendFonnteMessage(MY_NUMBER, message);

    return NextResponse.json({ status: "success", message: "Nightly Recap Sent" });
  } catch (error) {
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}