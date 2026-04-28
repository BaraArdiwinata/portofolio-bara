import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleStockAction } from "@/actions/stock"; 
import { GoogleGenerativeAI } from "@google/generative-ai"; 

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ==========================================
// 1. FUNGSI KIRIM PESAN WA (FONNTE)
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
// 2. FUNGSI DOWNLOAD GAMBAR DARI FONNTE
// ==========================================
async function fetchFonnteImage(imageUrl: string) {
  const res = await fetch(imageUrl);
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  
  // Deteksi mimetype
  let mimeType = "image/jpeg";
  if (imageUrl.toLowerCase().endsWith(".png")) mimeType = "image/png";
  if (imageUrl.toLowerCase().endsWith(".webp")) mimeType = "image/webp";

  return { base64, mimeType };
}

// ==========================================
// 3. PARSER PINTAR (KEUANGAN & SAHAM)
// ==========================================
function parseMessage(text: string) {
  const parts = text.trim().toUpperCase().split(/\s+/);
  if (parts.length < 2) return null;

  const action = parts[0];

  if (["BUY", "SELL", "HOLD"].includes(action)) {
    return { category: "STOCK", action, emiten: parts[1], lot: parseInt(parts[2] || "0"), price: parseInt(parts[3] || "0") };
  }

  if (["IN", "OUT"].includes(action)) {
    let wallet = "CASH";
    let amountStr = parts[1];
    let descIndex = 2;

    if (isNaN(parseInt(parts[1], 10))) {
      wallet = parts[1];
      amountStr = parts[2];
      descIndex = 3;
    }
    return { category: "FINANCE", action, wallet, amount: parseInt(amountStr, 10), description: parts.slice(descIndex).join(" ") };
  }

  return null;
}

// ==========================================
// 4. ENDPOINT WEBHOOK (POST ONLY)
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Payload dari Fonnte
    const sender = body.sender; 
    let text = body.message || "";
    const attachmentUrl = body.url; // URL gambar kalau lu ngirim foto
    
    // Kalau yang nge-hit webhook bukan pesan orang (cuma ping sistem Fonnte)
    if (!sender) return NextResponse.json({ status: "ignored" });

    // 🔥 LOGIC GAMBAR STRUK (AI VISION)
    if (attachmentUrl) {
      await sendFonnteMessage(sender, "⏳ JARVIS Vision sedang memindai struk...");
      
      const media = await fetchFonnteImage(attachmentUrl);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analisis gambar struk belanja ini. Kembalikan HANYA format JSON valid (tanpa blok kode markdown). 
      Format JSON yang diwajibkan:
      {
        "amount": (angka total belanjaan, integer murni tanpa titik/koma),
        "description": "(ringkasan singkat barang yang dibeli)",
        "category": "(Pilih SATU dari ini: F&B, Transport, Groceries, Utilities, Entertainment, Health, Lain-lain)",
        "wallet": "(Tebak metode pembayaran dari struk: BCA, DANA, GOPAY, OVO, atau CASH)"
      }`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: media.base64, mimeType: media.mimeType } }
      ]);
      
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const aiData = JSON.parse(cleanJson);

      await prisma.pendingTransaction.create({
        data: {
          type: "OUT",
          wallet: aiData.wallet || "CASH",
          amount: aiData.amount || 0,
          category: aiData.category || "Lain-lain",
          description: aiData.description || "Scan Struk",
        }
      });

      const replyMsg = `🧾 *SCAN STRUK SELESAI*\n\n🏦 Wallet: ${aiData.wallet}\n💰 Total: Rp${aiData.amount.toLocaleString("id-ID")}\n📂 Kategori: ${aiData.category}\n📝 Item: ${aiData.description}\n\nKetik *YA* untuk menyimpan ke database, atau *BATAL* untuk membatalkan.`;
      await sendFonnteMessage(sender, replyMsg);
      return NextResponse.json({ status: "success" });
    }

    // -----------------------------------------------------------------
    // LOGIC TEKS (Perintah Biasa & Konfirmasi)
    text = text.trim().toUpperCase();
    if (!text) return NextResponse.json({ status: "no text" });

    if (text === "YA" || text === "BATAL") {
      const pendingTx = await prisma.pendingTransaction.findFirst({ orderBy: { createdAt: 'desc' } });
      
      if (!pendingTx) {
        await sendFonnteMessage(sender, "❌ Tidak ada transaksi struk yang pending.");
        return NextResponse.json({ status: "success" });
      }

      if (text === "YA") {
        await prisma.financialLog.create({
          data: {
            type: pendingTx.type,
            wallet: pendingTx.wallet,
            amount: pendingTx.amount,
            category: pendingTx.category,
            description: pendingTx.description || "Dari Struk",
          }
        });
        await prisma.pendingTransaction.delete({ where: { id: pendingTx.id } });
        await sendFonnteMessage(sender, `✅ Berhasil! Rp${pendingTx.amount.toLocaleString("id-ID")} telah dicatat ke pengeluaran ${pendingTx.category}.`);
      } 
      else if (text === "BATAL") {
        await prisma.pendingTransaction.delete({ where: { id: pendingTx.id } });
        await sendFonnteMessage(sender, "🗑️ Pemindaian struk dibatalkan dan dihapus.");
      }
      return NextResponse.json({ status: "success" });
    }

    // 🔥 FITUR BARU: ROASTING AI VIA WA (GEMINI 2.5 FLASH)
    if (text === "ROAST") {
      await sendFonnteMessage(sender, "🔥 JARVIS sedang menganalisis kebobrokan finansial Anda bulan ini. Mohon tunggu...");

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

      Berikan roastingan kocak dan menohok dalam bahasa Indonesia gaul gaul kekinian. Maksimal 3 paragraf singkat. Sindir pengeluarannya yang boros. Akhiri dengan satu kalimat motivasi tapi tetep nyinyir.`;

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        // 🔥 FIX: PAKE MODEL GEMINI 2.5 FLASH
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        if (!response.ok) {
           await sendFonnteMessage(sender, `❌ JARVIS Error dari Google: ${data.error?.message}`);
           return NextResponse.json({ status: "error api" });
        }

        const roastText = data.candidates[0].content.parts[0].text;
        await sendFonnteMessage(sender, `🔥 *ROASTING JARVIS* 🔥\n\n${roastText}`);
        return NextResponse.json({ status: "success" });
      } catch (error) {
        await sendFonnteMessage(sender, "❌ JARVIS gagal konek ke satelit Google.");
        return NextResponse.json({ status: "fetch error" });
      }
    }

    // LOGIC LAMA: PARSER MANUAL
    const parsed = parseMessage(text);
    if (!parsed) {
      await sendFonnteMessage(sender, "❌ Format salah. Gunakan:\nKeuangan: OUT DANA 50000 Makan\nSaham: BUY BBCA 10 10200\nAtau kirim foto struk.");
      return NextResponse.json({ status: "invalid format" });
    }

    if (parsed.category === "STOCK") {
      const replyMsg = await handleStockAction(parsed.action, parsed.emiten!, parsed.lot!, parsed.price!);
      await sendFonnteMessage(sender, replyMsg);
    }
    
    if (parsed.category === "FINANCE") {
      if (isNaN(parsed.amount!) || parsed.amount! <= 0) return NextResponse.json({ status: "invalid amount" });
      await prisma.financialLog.create({
        data: {
          type: parsed.action,
          wallet: parsed.wallet!,
          amount: parsed.amount!,
          description: parsed.description!,
        },
      });
      const replyMsg = `✅ DATA FINANSIAL MASUK\n🏦 ${parsed.wallet}\n📊 ${parsed.action === "IN" ? "PEMASUKAN" : "PENGELUARAN"}: Rp${parsed.amount?.toLocaleString("id-ID")}\n📝 ${parsed.description}`;
      await sendFonnteMessage(sender, replyMsg);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}