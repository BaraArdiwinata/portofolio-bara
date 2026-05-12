import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🛠️ HELPER: Fungsi buat nyari tanggal awal periode (Senin buat Weekly, Tgl 1 buat Monthly)
function getStartDate(period: string) {
  const now = new Date();
  if (period === "WEEKLY") {
    const day = now.getDay() || 7;
    const diff = now.getDate() - day + 1;
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  } else {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

export async function POST(req: Request) {
  try {
    const emailText = await req.text();
    if (!emailText) return NextResponse.json({ status: "error", message: "Teks email kosong Bos!" }, { status: 400 });

    const groqApiKey = process.env.GROQ_API_KEY;
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Kamu API ekstrak data. Ekstrak dari struk Mandiri. Balas HANYA JSON: {"merchant": "nama", "amount": 50000, "category": "KATEGORI"}.
            PILIH KATEGORI: Bensin, Makan_Jajan, Nongkrong, Kuota, Lain_Lain.`
          },
          { role: "user", content: emailText }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    const groqData = await groqResponse.json();
    const parsedData = JSON.parse(groqData.choices[0].message.content);
    const amount = parseInt(parsedData.amount) || 0;
    const merchant = parsedData.merchant || "Toko Tidak Diketahui";
    const validCategories = ["Bensin", "Makan_Jajan", "Nongkrong", "Kuota", "Lain_Lain"];
    const category = validCategories.includes(parsedData.category) ? parsedData.category : "Lain_Lain";

    if (amount === 0) return NextResponse.json({ status: "ignored" });

    // 1. Simpan Transaksi
    await prisma.financialLog.create({
      data: { description: merchant, amount: amount, type: "OUT", wallet: "LIVIN", category: category }
    });

    // 2. 🧠 LOGIKA SUBSIDI SILANG (FALLBACK)
    const budgetPlan = await prisma.categoryBudget.findUnique({ where: { category: category } });
    let budgetText = "";

    if (budgetPlan) {
      const startDate = getStartDate(budgetPlan.period);
      const totalSpent = await prisma.financialLog.aggregate({
        _sum: { amount: true },
        where: { category: category, type: "OUT", createdAt: { gte: startDate } }
      });

      const spentAmount = totalSpent._sum.amount || 0;
      let remainingAmount = budgetPlan.limit - spentAmount;
      const periodText = budgetPlan.period === "WEEKLY" ? "MINGGU INI" : "BULAN INI";
      
      budgetText = `\n\n📉 *STATUS JATAH ${category.toUpperCase()} (${periodText}):*\nTerpakai: Rp ${spentAmount.toLocaleString('id-ID')} / Rp ${budgetPlan.limit.toLocaleString('id-ID')}\nSisa Jatah: *Rp ${remainingAmount.toLocaleString('id-ID')}*`;

      // 🚨 JIKA OVERBUDGET & BUKAN KATEGORI LAIN_LAIN
      if (remainingAmount < 0 && category !== "Lain_Lain") {
        const overage = Math.abs(remainingAmount);
        
        // Cek sisa jatah di Lain_Lain (Dana Darurat)
        const fallbackPlan = await prisma.categoryBudget.findUnique({ where: { category: "Lain_Lain" } });
        if (fallbackPlan) {
          const fbStart = getStartDate("MONTHLY");
          const fbSpent = await prisma.financialLog.aggregate({
            _sum: { amount: true },
            where: { category: "Lain_Lain", type: "OUT", createdAt: { gte: fbStart } }
          });
          const fbRemaining = fallbackPlan.limit - (fbSpent._sum.amount || 0);

          budgetText += `\n\n🚨 *OVERBUDGET BOS!* (Minus Rp ${overage.toLocaleString('id-ID')})`;
          
          if (fbRemaining >= overage) {
            budgetText += `\n🚑 *TENANG!* Masih bisa dicover dana *Lain_Lain*.\nSisa Dana Darurat lu: *Rp ${(fbRemaining - overage).toLocaleString('id-ID')}*`;
          } else {
            budgetText += `\n💀 *KRITIS!* Dana *Lain_Lain* pun gak cukup buat cover! Lu beneran harus hemat!`;
          }
        }
      } else if (remainingAmount < (budgetPlan.limit * 0.2)) {
        budgetText += `\n⚠️ *WARNING:* Jatah lu sisa dikit lagi!`;
      }
    }

    // 3. Kirim WA
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (fonnteToken) {
      const waMessage = `💸 *JAJAN TERCATAT BOS!*\n\n🏪 Toko: ${merchant}\n💰 Nominal: Rp ${amount.toLocaleString('id-ID')}\n📊 Kategori: ${category}${budgetText}\n\n> _JARVIS LifeOS v2.0_`;

      await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { "Authorization": fonnteToken, "Content-Type": "application/json" },
        body: JSON.stringify({ target: "081233177952", message: waMessage, countryCode: "62" })
      });
    }

    return NextResponse.json({ status: "success", amount, category });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}