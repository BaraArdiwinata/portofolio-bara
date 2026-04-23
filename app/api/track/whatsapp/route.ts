import { NextRequest, NextResponse } from "next/server";
import { prisma as prismaClient } from "@/lib/prisma";

// 🟢 GET: Webhook Verification dari Meta
// Meta akan send request ke endpoint ini dengan challenge token
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  // Log untuk debugging
  console.log("🔍 Webhook Verification Request:", { 
    mode, 
    token, 
    challenge,
    verifyTokenExists: !!verifyToken,
    tokenMatch: token === verifyToken
  });

  // Verify token harus match dengan yang di .env
  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook terverifikasi!");
    // Return challenge sebagai plain text
    return new NextResponse(challenge, { 
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      }
    });
  } else {
    console.log("❌ Webhook verification failed");
    console.log("Expected token:", verifyToken);
    console.log("Received token:", token);
    console.log("Mode:", mode);
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// 🔵 POST: Terima pesan dari WhatsApp
// Setiap ada pesan masuk ke nomor WhatsApp Anda, Meta akan kirim ke endpoint ini
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📨 Pesan masuk dari WhatsApp:", JSON.stringify(body, null, 2));

    // Struktur webhook dari Meta WhatsApp
    // Dokumentasi: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-example

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages?.[0];

    if (!messages) {
      console.log("⚠️ Tidak ada pesan dalam webhook");
      return NextResponse.json({ received: true });
    }

    const from = messages.from; // Nomor pengirim (format: 62812xxxxx)
    const messageType = messages.type; // "text", "image", "document", dll
    const messageText = messages.text?.body; // Isi pesan kalau text

    console.log(`💬 Pesan dari ${from} (${messageType}): ${messageText}`);

    // 🎯 Parse Financial Report dari pesan
    // Format: OUT 2000 Es Teh
    if (messageType === "text" && messageText) {
      const parsed = parseFinancialMessage(messageText);

      if (parsed) {
        // Simpan ke database
        const log = await prismaClient.financialLog.create({
          data: {
            type: parsed.type,
            amount: parsed.amount,
            description: parsed.description,
          },
        });

        console.log("💾 Data finansial tersimpan:", log);

        // Balas pesan ke WhatsApp
        await sendWhatsAppMessage(
          from,
          `✅ DATA MASUK FINANSIAL REPORT\n\n📊 ${parsed.type === "IN" ? "💰 PEMASUKAN" : "💸 PENGELUARAN"}: Rp${parsed.amount.toLocaleString("id-ID")}\n📝 Keterangan: ${parsed.description}\n\n🕐 Waktu: ${new Date().toLocaleString("id-ID")}`
        );

        return NextResponse.json({ success: true, saved: true });
      }
    }

    // Kalau format tidak sesuai, beri tahu user
    if (messageType === "text") {
      await sendWhatsAppMessage(
        from,
        `❌ Format tidak dikenal\n\nGunakan format:\nOUT [nominal] [keterangan]\n\nContoh:\nOUT 2000 Es Teh`
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Parse pesan financial report
 * Format: OUT 2000 Es Teh
 * Return: { type: "OUT", amount: 2000, description: "Es Teh" }
 */
function parseFinancialMessage(text: string) {
  const trimmed = text.trim().toUpperCase();
  const parts = trimmed.split(/\s+/);

  if (parts.length < 3) return null;

  const type = parts[0]; // "IN" atau "OUT"
  const amount = parseInt(parts[1], 10);
  const description = parts.slice(2).join(" ");

  if (!["IN", "OUT"].includes(type) || isNaN(amount) || amount <= 0) {
    return null;
  }

  return { type, amount, description };
}

/**
 * Kirim pesan ke WhatsApp user
 * @param phoneNumber Nomor tujuan (format: 62812xxxxx)
 * @param message Isi pesan
 */
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.error("❌ Missing WhatsApp credentials in .env");
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("📤 WhatsApp message sent:", data);

    if (!response.ok) {
      console.error("❌ Gagal kirim pesan:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
    return false;
  }
}
