import { prisma } from "@/lib/prisma";
import DashboardChart from "@/components/DashboardChart";

// Mantra sakti biar Next.js nggak nge-cache halaman ini dan filternya bisa jalan!
export const dynamic = "force-dynamic";

function getStartDate(range: string) {
  const now = new Date();
  switch (range) {
    case "1D": now.setDate(now.getDate() - 1); return now;
    case "1W": now.setDate(now.getDate() - 7); return now;
    case "1M": now.setMonth(now.getMonth() - 1); return now;
    case "All": return new Date(0);
    default: now.setMonth(now.getMonth() - 1); return now;
  }
}

function formatChartDate(date: Date, range: string): string {
  if (range === "1D") return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':');
  if (range === "All") return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default async function AdminDashboard({
  searchParams,
}: {
  // Kita pakai Promise karena di versi Next.js terbaru, searchParams itu asinkron
  searchParams: Promise<{ range?: string }>;
}) {
  const resolvedParams = await searchParams;
  const range = resolvedParams?.range || "1M"; 
  const startDate = getStartDate(range);

  // ==========================================
  // 🧠 1. TARIK DATA PORTOFOLIO 
  // ==========================================
  const [totalPengalaman, totalProyek, totalPendidikan, totalShortlink] = await Promise.all([
    prisma.experience.count(),
    prisma.project.count(),
    prisma.education.count(),
    prisma.shortlink.count(),
  ]);

  // ==========================================
  // 🧠 2. TARIK DATA ANALYTICS BERDASAR FILTER
  // ==========================================
  const logsInRanges = await prisma.visitorLog.findMany({
    where: { createdAt: { gte: startDate } },
    orderBy: { createdAt: "asc" },
  });

  const visitorsMap = new Map();
  logsInRanges.forEach(log => visitorsMap.set(log.sessionId, true));
  const totalUnique = visitorsMap.size;
  const totalPageViews = logsInRanges.length;

  // ==========================================
  // 🧠 3. FORMAT DATA GRAFIK SAHAM
  // ==========================================
  const dailyDataMap = new Map();

  logsInRanges.forEach((log) => {
    let intervalKey: string;
    if (range === "1D") {
      intervalKey = log.createdAt.toISOString().substring(0, 13) + ":00:00.000Z";
    } else {
      intervalKey = log.createdAt.toISOString().substring(0, 10) + "T00:00:00.000Z";
    }
    dailyDataMap.set(intervalKey, (dailyDataMap.get(intervalKey) || 0) + 1);
  });

  const chartData = Array.from(dailyDataMap.entries()).map(([dateStr, count]) => {
    const dateObj = new Date(dateStr);
    return {
      name: formatChartDate(dateObj, range),
      total: count,
      fullDate: dateObj.getTime(),
    };
  }).sort((a, b) => a.fullDate - b.fullDate);

  // ==========================================
  // 🎨 4. RENDER UI PROFESSIONAL
  // ==========================================
  return (
    <div className="p-8 space-y-8 w-full max-w-5xl">
      
      {/* Header Eksekutif */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#013880]">Executive Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Ringkasan performa portofolio dan analitik lalu lintas situs web.</p>
      </div>

      {/* 📊 SUPER CARD: Cuma Data Portofolio (Ada Judulnya Sekarang) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Judul Card */}
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Manajemen Konten Portofolio</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 text-center hover:bg-gray-50 transition flex flex-col items-center justify-center h-28">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Pengalaman</p>
            <p className="text-3xl font-black text-[#013880]">{totalPengalaman}</p>
          </div>
          <div className="p-6 text-center hover:bg-gray-50 transition flex flex-col items-center justify-center h-28">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Proyek</p>
            <p className="text-3xl font-black text-[#013880]">{totalProyek}</p>
          </div>
          <div className="p-6 text-center hover:bg-gray-50 transition flex flex-col items-center justify-center h-28">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Pendidikan</p>
            <p className="text-3xl font-black text-[#013880]">{totalPendidikan}</p>
          </div>
          <div className="p-6 text-center hover:bg-gray-50 transition flex flex-col items-center justify-center h-28">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Shortlink</p>
            <p className="text-3xl font-black text-[#013880]">{totalShortlink}</p>
          </div>
        </div>
      </div>

      {/* 📈 COMPONENT GRAFIK SAHAM (Dengan Legend di Dalemnya) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <DashboardChart 
          chartData={chartData} 
          currentRange={range}
          totalViews={totalPageViews} 
          totalVisitors={totalUnique} 
        /> 
      </div>

    </div>
  );
}