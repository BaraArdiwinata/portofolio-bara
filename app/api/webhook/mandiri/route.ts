import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Tangkap data dari Make.com
    const body = await req.json();
    const emailText = body.text; 

    if (!emailText) {
      return NextResponse.json({ status: "error", message: "Teks email kosong Bos!" }, { status: 400 });
    }

    // 2. Suruh Llama 3 bedah teks emailnya
    const groqApiKey = process.env.GROQ_API_KEY;
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Kamu adalah API ekstrak data keuangan. Ekstrak data dari struk Bank Mandiri berikut. WAJIB balas HANYA JSON flat: {"merchant": "nama toko", "amount": 50000}. Kalau nominal tidak ditemukan, isi amount dengan 0.`
          },
          { role: "user", content: emailText }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    const groqData = await groqResponse.json();
    const rawJson = groqData.choices[0].message.content;
    const parsedData = JSON.parse(rawJson);

    const amount = parseInt(parsedData.amount) || 0;
    const merchant = parsedData.merchant || "Toko Tidak Diketahui";

    // Kalau gagal nemu angka, stop aja
    if (amount === 0) {
        return NextResponse.json({ status: "ignored", message: "Bukan email resi pengeluaran" });
    }

    // 3. Masukin ke Database Keuangan
    await prisma.financeLog.create({
      data: {
        merchant: merchant,
        amount: amount,
        type: "EXPENSE"
      }
    });

    // 4. (OPSIONAL) Kirim Notif ke WA Bos Bara via Fonnte
    // Kalau lu mau JARVIS lapor ke WA, masukin fungsi sendFonnteMessage di sini.

    return NextResponse.json({ status: "success", merchant, amount });

  } catch (error: any) {
    console.error("❌ Webhook Mandiri Error:", error.message);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}