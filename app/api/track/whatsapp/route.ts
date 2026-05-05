import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleStockAction } from "@/actions/stock"; 
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { google } from "googleapis";

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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
        console.error("❌ Roasting Error:", error);
        await sendFonnteMessage(sender, "❌ JARVIS gagal konek ke satelit Google.");
        return NextResponse.json({ status: "fetch error" });
      }
    }

    // =================================================================
    // 🔥 FITUR BARU: GOOGLE TASKS SINKRONISASI
    // Format: TASK [Judul] [DD/MM] [HH.MM]
    // =================================================================
    const taskMatch = text.match(/^TASK\s+(.+?)\s+(\d{2}\/\d{2})\s+(\d{2}\.\d{2})$/i);
    if (taskMatch) {
      const title = taskMatch[1];
      const [day, month] = taskMatch[2].split('/');
      const [hour, minute] = taskMatch[3].split('.');
      const currentYear = new Date().getFullYear();
      
      // Format waktu dengan zona WIB (+07:00)
      const dueTimeISO = `${currentYear}-${month}-${day}T${hour}:${minute}:00+07:00`;

      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

        const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
        await tasks.tasks.insert({
          tasklist: '@default', // Masuk ke list utama
          requestBody: {
            title: title,
            due: dueTimeISO
          }
        });

        await sendFonnteMessage(sender, `✅ *TASK DITAMBAHKAN*\n\n📝: ${title}\n⏳: ${taskMatch[2]} jam ${taskMatch[3]}\n\nJARVIS telah menyinkronkan tugas ini ke Google Tasks Anda!`);
      } catch (error) {
        console.error("❌ Google Tasks Error:", error);
        await sendFonnteMessage(sender, "❌ Gagal menambahkan ke Google Tasks. Cek terminal Bos!");
      }
      return NextResponse.json({ status: "success" });
    }

    // =================================================================
    // 🔥 FITUR BARU: GOOGLE CALENDAR SINKRONISASI
    // Format: CALENDAR [Judul] [DD/MM] [HH.MM] - [HH.MM]
    // =================================================================
    const calMatch = text.match(/^CALENDAR\s+(.+?)\s+(\d{2}\/\d{2})\s+(\d{2}\.\d{2})\s*-\s*(\d{2}\.\d{2})$/i);
    if (calMatch) {
      const title = calMatch[1];
      const [day, month] = calMatch[2].split('/');
      const [startHour, startMinute] = calMatch[3].split('.');
      const [endHour, endMinute] = calMatch[4].split('.');
      const currentYear = new Date().getFullYear();

      const startTimeISO = `${currentYear}-${month}-${day}T${startHour}:${startMinute}:00+07:00`;
      const endTimeISO = `${currentYear}-${month}-${day}T${endHour}:${endMinute}:00+07:00`;

      try {
        // Pake Service Account bawaan yang udah lu setting di Cron
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ["https://www.googleapis.com/auth/calendar.events"], // Akses nulis!
        });

        const calendar = google.calendar({ version: 'v3', auth });
        await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          requestBody: {
            summary: title,
            start: { dateTime: startTimeISO, timeZone: 'Asia/Jakarta' },
            end: { dateTime: endTimeISO, timeZone: 'Asia/Jakarta' }
          }
        });

        await sendFonnteMessage(sender, `✅ *AGENDA DIBUAT*\n\n📅: ${title}\n📆: ${calMatch[2]}\n⏰: ${calMatch[3]} - ${calMatch[4]}\n\nJARVIS telah memblokir kalender Anda!`);
      } catch (error) {
        console.error("❌ Google Calendar Error:", error);
        await sendFonnteMessage(sender, "❌ Gagal membuat agenda di Google Calendar. Cek terminal Bos!");
      }
      return NextResponse.json({ status: "success" });
    }

    // =================================================================
    // 🔥 FITUR BARU: TANDAI TASK SELESAI (MARK AS DONE)
    // Format: TASK DONE [Kata Kunci Judul]
    // =================================================================
    const doneMatch = text.match(/^TASK\s+DONE\s+(.+)$/i);
    if (doneMatch) {
      const keyword = doneMatch[1].toLowerCase().trim();

      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        const tasksApi = google.tasks({ version: 'v1', auth: oauth2Client });

        // 1. Ambil semua task yang masih pending
        const response = await tasksApi.tasks.list({
          tasklist: '@default',
          showHidden: false, // Hanya tarik task yang belum selesai
        });

        const pendingTasks = response.data.items || [];
        
        // 2. Cari task yang judulnya mengandung kata kunci (Fuzzy Search)
        const matchedTask = pendingTasks.find(t => t.title && t.title.toLowerCase().includes(keyword));

        if (!matchedTask) {
          await sendFonnteMessage(sender, `❌ JARVIS tidak menemukan task yang mengandung kata "${keyword}". Pastikan ejaannya mirip Bos!`);
          return NextResponse.json({ status: "not found" });
        }

        // 3. Eksekusi coret Task!
        await tasksApi.tasks.patch({
          tasklist: '@default',
          task: matchedTask.id!,
          requestBody: {
            status: 'completed'
          }
        });

        await sendFonnteMessage(sender, `✅ *TASK SELESAI*\n\nJARVIS telah mencoret tugas ini dari daftar:\n📝: ${matchedTask.title}\n\nGood job, Bos! Lanjut eksekusi yang lain! 🔥`);
      } catch (error) {
        console.error("❌ Google Tasks Update Error:", error);
        await sendFonnteMessage(sender, "❌ Gagal mencoret Google Tasks. Cek terminal Bos!");
      }
      return NextResponse.json({ status: "success" });
    }

    // =================================================================
    // 🔥 FITUR BARU: NUTRITION & CALORIE TRACKER (AI AI-AN)
    // Format: EAT [Nama Makanan] atau DRINK [Nama Minuman]
    // =================================================================
    const eatMatch = text.match(/^(?:EAT|DRINK)\s+(.+)$/i);
    if (eatMatch) {
      const foodDescription = eatMatch[1].trim();
      await sendFonnteMessage(sender, `⏳ JARVIS sedang meneliti kandungan gizi dari: ${foodDescription}...`);

      try {
        const prompt = `Kamu adalah ahli gizi. Estimasikan kandungan gizi untuk makanan/minuman ini: "${foodDescription}".
        Format yang diwajibkan (harus berupa JSON):
        {
          "foodName": "(Nama makanan yang rapi, max 30 karakter)",
          "calories": (integer, estimasi total kalori dalam kcal),
          "protein": (float, estimasi total protein dalam gram),
          "carbs": (float, estimasi total karbohidrat dalam gram),
          "fat": (float, estimasi total lemak dalam gram),
          "sugar": (float, estimasi total gula dalam gram)
        }`;

        let responseText = "";
        let isSuccess = false;
        let attempt = 0;
        const maxRetries = 2; // Kita kasih JARVIS 2 nyawa

        // 🔥 JURUS AUTO-RETRY & FALLBACK
        while (attempt < maxRetries && !isSuccess) {
          try {
            // Percobaan 1: Pakai 2.5 Flash. Kalau gagal, turun ke 2.0 Flash
            const modelName = attempt === 0 ? "gemini-2.5-flash" : "gemini-2.0-flash";
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: { responseMimeType: "application/json" } 
            });

            const result = await model.generateContent(prompt);
            responseText = result.response.text();
            isSuccess = true; // Kalau berhasil lewat sini, keluar dari loop!
          } catch (apiError: any) {
            attempt++;
            console.error(`❌ Percobaan ${attempt} API Error:`, apiError.message);
            if (attempt >= maxRetries) throw apiError; // Udah 2x gagal? Baru lempar error beneran
            
            // Tunggu 2 detik sebelum nyoba lagi (Biar satpam Google santai dikit)
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        const nutritionData = JSON.parse(responseText);

        // 1. Simpan ke Database
        await prisma.healthLog.create({
          data: {
            foodName: String(nutritionData.foodName || foodDescription),
            calories: parseInt(nutritionData.calories) || 0,
            protein: parseFloat(nutritionData.protein) || 0,
            carbs: parseFloat(nutritionData.carbs) || 0,
            fat: parseFloat(nutritionData.fat) || 0,
            sugar: parseFloat(nutritionData.sugar) || 0,
          }
        });

        // 2. Hitung Total Kalori Hari Ini (Zona Waktu WIB)
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric', month: '2-digit', day: '2-digit'
        });
        const [{value: mo}, , {value: da}, , {value: ye}] = formatter.formatToParts(new Date());
        const startOfDay = new Date(`${ye}-${mo}-${da}T00:00:00+07:00`);
        const endOfDay = new Date(`${ye}-${mo}-${da}T23:59:59+07:00`);

        const todaysLogs = await prisma.healthLog.findMany({
          where: {
            loggedAt: { gte: startOfDay, lte: endOfDay }
          }
        });

        let totalCaloriesToday = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        todaysLogs.forEach((log: any) => totalCaloriesToday += log.calories);

        // 3. Set Target Kalori Bos Bara
        const targetCalories = 2200; 
        const remaining = targetCalories - totalCaloriesToday;
        const sisaTeks = remaining > 0 ? `${remaining} kcal` : `OVER LIMIT! 🚨 Kurangin jajan Bos!`;

        // 4. Kirim Balasan
        const replyMsg = `✅ *FOOD RECORDED!*\n\n🍛 Menu: ${nutritionData.foodName}\n🔥 Kalori: ${nutritionData.calories} kcal\n🥩 Protein: ${nutritionData.protein}g\n🍚 Karbo: ${nutritionData.carbs}g\n🥑 Lemak: ${nutritionData.fat}g\n🍭 Gula: ${nutritionData.sugar}g\n\n📊 *DAILY CALORIES:*\nMasuk: ${totalCaloriesToday} / ${targetCalories} kcal\nSisa Kuota: ${sisaTeks}`;

        await sendFonnteMessage(sender, replyMsg);

      } catch (error: any) {
        // 🔥 FIX 2: BIKIN JARVIS CEPU ERRORNYA KE WA!
        console.error("❌ AI Nutrition Error:", error);
        await sendFonnteMessage(sender, `🚨 *JARVIS SYSTEM ERROR* 🚨\n\nPesan Error:\n${error.message}\n\nSilakan kirim pesan ini ke teknisi!`);
      }
      return NextResponse.json({ status: "success" });
      return NextResponse.json({ status: "success" });
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