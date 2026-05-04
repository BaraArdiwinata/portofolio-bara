import { prisma } from "@/lib/prisma";
import HealthCharts from "@/components/HealthCharts";
import { Activity, Flame, Beef, Wheat, Droplets, Candy, AlertTriangle } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

// ==========================================
// 🧠 HELPER: AMBIL DATA HARI INI & 7 HARI TERAKHIR
// ==========================================
async function getHealthData() {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
  
  // 1. Setup Tanggal Hari Ini
  const now = new Date();
  const [{value: mo}, , {value: da}, , {value: ye}] = formatter.formatToParts(now);
  const startOfToday = new Date(`${ye}-${mo}-${da}T00:00:00+07:00`);
  const endOfToday = new Date(`${ye}-${mo}-${da}T23:59:59+07:00`);

  // 2. Setup Tanggal 7 Hari Mundur
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // 3. Tarik Data dari Database
  const [todaysLogs, weeklyLogs] = await Promise.all([
    prisma.healthLog.findMany({
      where: { loggedAt: { gte: startOfToday, lte: endOfToday } },
      orderBy: { loggedAt: 'desc' }
    }),
    prisma.healthLog.findMany({
      where: { loggedAt: { gte: sevenDaysAgo, lte: endOfToday } },
      orderBy: { loggedAt: 'asc' }
    })
  ]);

  // 4. Kalkulasi Macros Hari Ini
  const macros = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };
  todaysLogs.forEach(log => {
    macros.calories += log.calories;
    macros.protein += log.protein;
    macros.carbs += log.carbs;
    macros.fat += log.fat;
    macros.sugar += log.sugar;
  });

  // 5. Susun Data Buat Bar Chart (7 Hari Terakhir)
  const chartMap = new Map();
  // Bikin kerangka 7 hari kosong biar grafiknya nggak bolong kalau lu ga makan
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    chartMap.set(dateStr, 0);
  }
  // Isi dengan data beneran
  weeklyLogs.forEach(log => {
    const d = new Date(log.loggedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'Asia/Jakarta' });
    if (chartMap.has(d)) {
      chartMap.set(d, chartMap.get(d) + log.calories);
    }
  });
  
  const chartData = Array.from(chartMap.entries()).map(([date, calories]) => ({ date, calories }));

  return { todaysLogs, macros, chartData };
}

// ==========================================
// 🎨 KOMPONEN ASYNC (BIAR RENDER INSTAN)
// ==========================================
async function HealthDashboardContent() {
  const { todaysLogs, macros, chartData } = await getHealthData();
  const TARGET_CALORIES = 2200;
  const isOverLimit = macros.calories > TARGET_CALORIES;
  const isSugarDanger = macros.sugar > 50; // Batas WHO: ~50g/hari

  return (
    <div className="space-y-8 w-full max-w-7xl pb-10">
      
      {/* 🟢 SUPER CARD: KALORI HARIAN */}
      <div className={`rounded-3xl shadow-xl overflow-hidden text-white relative ${isOverLimit ? 'bg-gradient-to-br from-red-600 to-red-900' : 'bg-gradient-to-br from-[#013880] to-[#001f4d]'}`}>
        <div className="px-6 py-6 sm:px-8 sm:py-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Konsumsi Kalori Hari Ini</h2>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl sm:text-6xl font-black tracking-tight">{macros.calories}</p>
              <p className="text-xl opacity-70 font-medium">/ {TARGET_CALORIES} kcal</p>
            </div>
            {isOverLimit && (
              <div className="mt-3 inline-flex items-center gap-2 bg-red-950/50 text-red-200 px-3 py-1.5 rounded-lg text-sm font-bold border border-red-500/30">
                <AlertTriangle size={16} /> OVER LIMIT! Waktunya Puasa Bos!
              </div>
            )}
          </div>
          
          {isSugarDanger && (
            <div className="bg-pink-500/20 border border-pink-400/50 p-4 rounded-2xl backdrop-blur-md max-w-xs">
              <div className="flex items-center gap-2 text-pink-300 font-bold mb-1">
                <Candy size={18} /> Gula Darah Waspada!
              </div>
              <p className="text-xs text-pink-100/80">
                Lu udah konsumsi <b>{macros.sugar.toFixed(1)}g</b> gula hari ini. Ingat temen lu di Mojokerto yang cuma minum air putih!
              </p>
            </div>
          )}
        </div>

        {/* 🍱 MACRO CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-black/20 relative z-10 backdrop-blur-sm">
          <div className="p-4 sm:p-6 flex items-center gap-4 hover:bg-white/5 transition">
             <div className="bg-orange-500/20 p-3 rounded-2xl"><Beef className="w-6 h-6 text-orange-400" /></div>
             <div><p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest mb-1">Protein</p><p className="text-2xl font-bold">{macros.protein.toFixed(1)}g</p></div>
          </div>
          <div className="p-4 sm:p-6 flex items-center gap-4 hover:bg-white/5 transition">
             <div className="bg-yellow-500/20 p-3 rounded-2xl"><Wheat className="w-6 h-6 text-yellow-400" /></div>
             <div><p className="text-[10px] font-bold text-yellow-200 uppercase tracking-widest mb-1">Karbohidrat</p><p className="text-2xl font-bold">{macros.carbs.toFixed(1)}g</p></div>
          </div>
          <div className="p-4 sm:p-6 flex items-center gap-4 hover:bg-white/5 transition">
             <div className="bg-emerald-500/20 p-3 rounded-2xl"><Droplets className="w-6 h-6 text-emerald-400" /></div>
             <div><p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Lemak</p><p className="text-2xl font-bold">{macros.fat.toFixed(1)}g</p></div>
          </div>
          <div className="p-4 sm:p-6 flex items-center gap-4 hover:bg-white/5 transition">
             <div className="bg-pink-500/20 p-3 rounded-2xl"><Candy className="w-6 h-6 text-pink-400" /></div>
             <div><p className="text-[10px] font-bold text-pink-200 uppercase tracking-widest mb-1">Gula</p><p className="text-2xl font-bold text-pink-300">{macros.sugar.toFixed(1)}g</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 📊 GRAFIK MINGGUAN */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-[#013880]" /> Tren Kalori (7 Hari Terakhir)
          </h2>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <HealthCharts data={chartData} />
          </div>
        </div>

        {/* 📜 TABEL RIWAYAT HARI INI */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[400px] overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-5">
             <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Food Logs (Hari Ini)</h2>
          </div>
          <div className="p-0 overflow-y-auto hide-scrollbar">
            {todaysLogs.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {todaysLogs.map((log: any) => (
                  <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{log.foodName}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {new Date(log.loggedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':')} WIB
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#013880]">{log.calories} kcal</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        P: {log.protein} | K: {log.carbs} | L: {log.fat}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 opacity-60">
                <Activity size={40} className="mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium">Belum ada makanan yang masuk. Gih sarapan Bos!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🚀 RENDER UTAMA
// ==========================================
export default function HealthDashboard() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-[#013880]">Klinik JARVIS</h1>
        <p className="text-gray-500 mt-1 text-sm">Personal AI Nutritionist & Calorie Tracker.</p>
      </div>
      <Suspense fallback={<div className="w-full h-[400px] bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center font-bold text-slate-400">Loading Rekam Medis...</div>}>
        <HealthDashboardContent />
      </Suspense>
    </div>
  );
}