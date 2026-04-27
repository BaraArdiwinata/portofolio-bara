import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleStockAction } from "@/actions/stock"; // Import otak saham
import { GoogleGenerativeAI } from "@google/generative-ai"; // 🔥 Otak Gemini

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ==========================================
// 1. FUNGSI KIRIM PESAN WA
// ==========================================
async function sendWhatsAppMessage(to: string, body: string) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: body },
    }),
  });
  if (!response.ok) {
    console.error("❌ Gagal kirim WA:", await response.text());
  }
}

// ==========================================
// 2. FUNGSI DOWNLOAD GAMBAR DARI META
// ==========================================
async function getWhatsAppMedia(mediaId: string) {
  // A. Minta URL Gambar ke Meta
  const res = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const data = await res.json();
  
  // B. Download File Binary-nya
  const mediaRes = await fetch(data.url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const arrayBuffer = await mediaRes.arrayBuffer();
  
  // C. Ubah jadi Base64 buat dibaca Gemini
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { mimeType: data.mime_type, base64 };
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
// 4. ENDPOINT WEBHOOK
// ==========================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.entry || !body.entry[0].changes[0].value.messages) {
      return NextResponse.json({ status: "ignored" });
    }

    const message = body.entry[0].changes[0].value.messages[0];
    const from = message.from;

    // 🔥 LOGIC BARU: KALAU YANG DIKIRIM GAMBAR STRUK
    if (message.type === "image") {
      await sendWhatsAppMessage(from, "⏳ JARVIS Vision sedang memindai struk...");
      
      const mediaId = message.image.id;
      const media = await getWhatsAppMedia(mediaId);

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

      // Simpan ke Karantina (PendingTransaction)
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
      await sendWhatsAppMessage(from, replyMsg);
      return NextResponse.json({ status: "success" });
    }

    // -----------------------------------------------------------------
    // LOGIC TEKS (Perintah Biasa & Konfirmasi)
    const text = message.text?.body?.trim().toUpperCase();
    if (!text) return NextResponse.json({ status: "no text" });

    // 🔥 LOGIC BARU: KONFIRMASI STRUK (YA / BATAL)
    if (text === "YA" || text === "BATAL") {
      const pendingTx = await prisma.pendingTransaction.findFirst({ orderBy: { createdAt: 'desc' } });
      
      if (!pendingTx) {
        await sendWhatsAppMessage(from, "❌ Tidak ada transaksi struk yang pending.");
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
        await sendWhatsAppMessage(from, `✅ Berhasil! Rp${pendingTx.amount.toLocaleString("id-ID")} telah dicatat ke pengeluaran ${pendingTx.category}.`);
      } 
      else if (text === "BATAL") {
        await prisma.pendingTransaction.delete({ where: { id: pendingTx.id } });
        await sendWhatsAppMessage(from, "🗑️ Pemindaian struk dibatalkan dan dihapus.");
      }
      return NextResponse.json({ status: "success" });
    }

    // LOGIC LAMA: PARSER MANUAL
    const parsed = parseMessage(text);
    if (!parsed) {
      await sendWhatsAppMessage(from, "❌ Format salah. Gunakan:\nKeuangan: OUT DANA 50000 Makan\nSaham: BUY BBCA 10 10200\nAtau kirim foto struk.");
      return NextResponse.json({ status: "invalid format" });
    }

    if (parsed.category === "STOCK") {
      const replyMsg = await handleStockAction(parsed.action, parsed.emiten!, parsed.lot!, parsed.price!);
      await sendWhatsAppMessage(from, replyMsg);
      console.log("📈 Stock log saved:", parsed);
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
      await sendWhatsAppMessage(from, replyMsg);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}