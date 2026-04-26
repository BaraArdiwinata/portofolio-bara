import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleStockAction } from "@/actions/stock"; // Import otak saham

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

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
// 2. PARSER PINTAR (KEUANGAN & SAHAM)
// ==========================================
function parseMessage(text: string) {
  const parts = text.trim().toUpperCase().split(/\s+/);
  if (parts.length < 2) return null;

  const action = parts[0];

  // LOGIC 1: SAHAM (Contoh: BUY BBCA 10 10200)
  if (["BUY", "SELL", "HOLD"].includes(action)) {
    return {
      category: "STOCK",
      action: action,
      emiten: parts[1],
      lot: parseInt(parts[2] || "0"),
      price: parseInt(parts[3] || "0"),
    };
  }

  // LOGIC 2: KEUANGAN (Contoh: OUT DANA 50000 Nasi)
  if (["IN", "OUT"].includes(action)) {
    let wallet = "CASH";
    let amountStr = parts[1];
    let descIndex = 2;

    if (isNaN(parseInt(parts[1], 10))) {
      wallet = parts[1];
      amountStr = parts[2];
      descIndex = 3;
    }
    return {
      category: "FINANCE",
      action: action,
      wallet: wallet,
      amount: parseInt(amountStr, 10),
      description: parts.slice(descIndex).join(" "),
    };
  }

  return null;
}

// ==========================================
// 3. ENDPOINT WEBHOOK
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
    const from = message.from; // Nomor pengirim
    const text = message.text?.body;

    if (!text) return NextResponse.json({ status: "no text" });

    const parsed = parseMessage(text);

    if (!parsed) {
      await sendWhatsAppMessage(from, "❌ Format salah. Gunakan:\nKeuangan: OUT DANA 50000 Makan\nSaham: BUY BBCA 10 10200");
      return NextResponse.json({ status: "invalid format" });
    }

    // === EKSEKUSI SAHAM ===
    if (parsed.category === "STOCK") {
      const replyMsg = await handleStockAction(parsed.action, parsed.emiten!, parsed.lot!, parsed.price!);
      await sendWhatsAppMessage(from, replyMsg);
      console.log("📈 Stock log saved:", parsed);
    }
    
    // === EKSEKUSI KEUANGAN ===
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
      console.log("💾 Financial log saved:", parsed);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}