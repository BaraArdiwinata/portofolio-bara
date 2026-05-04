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
    // 1. Tarik Data Database (Keuangan & Saham)
    const [financialLogs, dbStocks] = await Promise.all([
      prisma.financialLog.findMany(),
      prisma.stockPortfolio.findMany(),
    ]);

    // 2. Tarik Harga Saham Live Penutupan Hari Ini
    const stocks = await Promise.all(
      dbStocks.map(async (stock: any) => {
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

    // 3. Kalkulasi Net Worth & Rincian Dompet Dinamis
    let totalIn = 0; 
    let totalOut = 0;
    const walletBalances: Record<string, number> = {};

    financialLogs.forEach((log: any) => {
      const amount = log.amount;
      const walletName = log.wallet ? log.wallet.toUpperCase() : "CASH";

      if (!walletBalances[walletName]) walletBalances[walletName] = 0;

      if (log.type === "IN") {
        totalIn += amount;
        walletBalances[walletName] += amount;
      } 
      else if (log.type === "OUT") {
        totalOut += amount;
        walletBalances[walletName] -= amount;
      }
    });
    
    const liquidBalance = totalIn - totalOut;
    const stockAssetsLive = stocks.reduce((acc: any, stock: any) => acc + stock.totalValue, 0);
    const netWorth = liquidBalance + stockAssetsLive;

    let detailDompet = "";
    for (const [wallet, balance] of Object.entries(walletBalances)) {
      detailDompet += `💳 *${wallet}:* Rp${balance.toLocaleString("id-ID")}\n`;
    }

    // ==========================================
    // 🔥 4. TAMBAHAN BARU: TARIK DATA KESEHATAN HARI INI
    // ==========================================
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const [{value: mo}, , {value: da}, , {value: ye}] = formatter.formatToParts(new Date());
    const startOfDay = new Date(`${ye}-${mo}-${da}T00:00:00+07:00`);
    const endOfDay = new Date(`${ye}-${mo}-${da}T23:59:59+07:00`);

    const todaysHealthLogs = await prisma.healthLog.findMany({
      where: { loggedAt: { gte: startOfDay, lte: endOfDay } }
    });

    let totalCalories = 0; let totalProtein = 0; let totalSugar = 0;
    todaysHealthLogs.forEach((log: any) => {
      totalCalories += log.calories;
      totalProtein += log.protein;
      totalSugar += log.sugar;
    });

    const TARGET_CALORIES = 2200;
    const kaloriStatus = totalCalories > TARGET_CALORIES ? "🔴 OVER LIMIT" : "🟢 AMAN";

    // 5. Rakit Teks Laporan Malam (Duit + Gizi)
    const message = `🌙 *JARVIS NIGHTLY RECAP*\n\nSelamat istirahat Bara. Ini ringkasan aset dan kesehatanmu hari ini:\n\n*💰 LAPORAN KEUANGAN:*\n${detailDompet}💵 *Saldo Liquid:* Rp${liquidBalance.toLocaleString("id-ID")}\n📈 *Aset Saham:* Rp${stockAssetsLive.toLocaleString("id-ID")}\n💎 *NET WORTH:* Rp${netWorth.toLocaleString("id-ID")}\n\n*🍎 LAPORAN KLINIK JARVIS:*\n🔥 Kalori: ${totalCalories} / ${TARGET_CALORIES} kcal (${kaloriStatus})\n🥩 Protein: ${totalProtein.toFixed(1)}g\n🍭 Gula: ${totalSugar.toFixed(1)}g\n\nGood night, sleep tight! 💤`;

    // 6. Tembak ke WA lu!
    await sendFonnteMessage(MY_NUMBER, message);

    return NextResponse.json({ status: "success", message: "Nightly Recap Sent" });
  } catch (error) {
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}