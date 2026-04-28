/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import DashboardChart from "@/components/DashboardChart";
import ExpensePieChart from "@/components/ExpensePieChart"; 
import { Wallet, TrendingUp, DollarSign, Landmark, CheckSquare, CalendarClock, PieChart as PieChartIcon } from "lucide-react"; 
import { google } from "googleapis";
import YahooFinance from "yahoo-finance2"; // 🔥 IMPORT YAHOO FINANCE

export const dynamic = "force-dynamic";
export const revalidate = 0; 

const yahooFinance = new YahooFinance();

// ==========================================
// 🧠 HELPER 1: TARIK DATA GOOGLE TASKS
// ==========================================
async function getGoogleTasks() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const tasksApi = google.tasks({ version: "v1", auth: oauth2Client });
    const response = await tasksApi.tasks.list({
      tasklist: "@default",
      showCompleted: false,
      maxResults: 10,
    });
    return response.data.items || [];
  } catch (error) {
    console.error("❌ Google Tasks Error:", error);
    return [];
  }
}

// ==========================================
// 🧠 HELPER 2: TARIK DATA GOOGLE CALENDAR
// ==========================================
async function getGoogleCalendarEvents() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items || [];
  } catch (error) {
    console.error("❌ Google Calendar Error:", error);
    return [];
  }
}

// ==========================================
// 🧠 HELPER 3: FORMAT TANGGAL GRAFIK
// ==========================================
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
  searchParams: Promise<{ range?: string }>;
}) {
  const resolvedParams = await searchParams;
  const range = resolvedParams?.range || "1M"; 
  const startDate = getStartDate(range);

  // 1. TARIK SEMUA DATA EKSTERNAL & DATABASE
  const [financialLogs, dbStocks, tasks, calendarEvents] = await Promise.all([
    prisma.financialLog.findMany(),
    prisma.stockPortfolio.findMany(),
    getGoogleTasks(),
    getGoogleCalendarEvents(),
  ]);

  // 🔥 2. CANGKOK LOGIKA YAHOO FINANCE BUAT HARGA LIVE
  const stocks = await Promise.all(
    dbStocks.map(async (stock) => {
      try {
        const quote: any = await yahooFinance.quote(`${stock.emitenCode}.JK`);
        const livePrice = quote.regularMarketPrice || stock.averageBuyPrice;
        const liveTotalValue = livePrice * stock.lotQuantity * 100;
        return { ...stock, totalValue: liveTotalValue };
      } catch {
        return { ...stock, totalValue: stock.totalInvested }; // Fallback kalau down
      }
    })
  );

  let totalIn = 0; let totalOut = 0;
  financialLogs.forEach((log: any) => {
    if (log.type === "IN") totalIn += log.amount;
    if (log.type === "OUT") totalOut += log.amount;
  });
  
  const liquidBalance = totalIn - totalOut;
  // 🔥 FIX: Sekarang udah ngambil hasil kalkulasi live dari Yahoo Finance
  const stockAssetsLive = stocks.reduce((acc: any, stock: any) => acc + stock.totalValue, 0);
  const netWorth = liquidBalance + stockAssetsLive;

  // 🔥 LOGIC BARU: Ngitung Kategori Pengeluaran buat Pie Chart
  const expenseLogs = financialLogs.filter((log: any) => log.type === "OUT");
  const categoryMap = new Map<string, number>();
  expenseLogs.forEach((log: any) => {
    const cat = log.category || "Lain-lain";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + log.amount);
  });
  const pieChartData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  // 3. TARIK DATA PORTOFOLIO WEB
  const [totalPengalaman, totalProyek, totalPendidikan, totalShortlink] = await Promise.all([
    prisma.experience.count(),
    prisma.project.count(),
    prisma.education.count(),
    prisma.shortlink.count(),
  ]);

  // 4. TARIK DATA ANALYTICS
  const logsInRanges = await prisma.visitorLog.findMany({
    where: { createdAt: { gte: startDate } },
    orderBy: { createdAt: "asc" },
  });

  const visitorsMap = new Map();
  logsInRanges.forEach((log: any) => visitorsMap.set(log.sessionId, true));
  const totalUnique = visitorsMap.size;
  const totalPageViews = logsInRanges.length;

  const dailyDataMap = new Map();
  logsInRanges.forEach((log: any) => {
    let intervalKey: string;
    if (range === "1D") intervalKey = log.createdAt.toISOString().substring(0, 13) + ":00:00.000Z";
    else intervalKey = log.createdAt.toISOString().substring(0, 10) + "T00:00:00.000Z";
    dailyDataMap.set(intervalKey, (dailyDataMap.get(intervalKey) || 0) + 1);
  });

  const chartData = Array.from(dailyDataMap.entries()).map(([dateStr, count]) => {
    const dateObj = new Date(dateStr);
    return { name: formatChartDate(dateObj, range), total: count, fullDate: dateObj.getTime() };
  }).sort((a: any, b: any) => a.fullDate - b.fullDate);

  // ==========================================
  // 🎨 RENDER UI PROFESSIONAL
  // ==========================================
  return (
    <div className="space-y-8 w-full max-w-7xl pb-10">
      
      {/* Header Eksekutif */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#013880]">Executive Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">JARVIS System Overview: Net Worth, Tasks, & Web Analytics.</p>
      </div>

      {/* 💰 SUPER CARD: JARVIS WEALTH (NET WORTH) */}
      <div className="bg-gradient-to-br from-[#013880] to-[#001f4d] rounded-3xl shadow-xl overflow-hidden text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="px-6 py-6 sm:px-8 sm:py-8 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 opacity-80">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest">Total Kekayaan Bersih (Net Worth)</h2>
          </div>
          <p className="text-4xl sm:text-5xl font-black tracking-tight truncate">{formatIDR(netWorth)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-black/20 relative z-10 backdrop-blur-sm">
          <div className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:bg-white/5 transition-colors">
             <div className="bg-blue-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl"><Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" /></div>
             <div>
               <p className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Saldo Liquid</p>
               <p className="text-xl sm:text-2xl font-bold">{formatIDR(liquidBalance)}</p>
             </div>
          </div>
          <div className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:bg-white/5 transition-colors">
             <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" /></div>
             <div>
               <p className="text-[10px] sm:text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">Aset Saham (Live Value)</p>
               <p className="text-xl sm:text-2xl font-bold">{formatIDR(stockAssetsLive)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* 📊 SUPER CARD: Manajemen Konten */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50/50 px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Landmark size={20} className="text-[#013880]" />
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Manajemen Konten Portofolio Web</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-4 sm:p-6 text-center hover:bg-gray-50 flex flex-col justify-center h-24 sm:h-28"><p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mb-1">Pengalaman</p><p className="text-2xl sm:text-3xl font-black text-[#013880]">{totalPengalaman}</p></div>
          <div className="p-4 sm:p-6 text-center hover:bg-gray-50 flex flex-col justify-center h-24 sm:h-28"><p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mb-1">Proyek</p><p className="text-2xl sm:text-3xl font-black text-[#013880]">{totalProyek}</p></div>
          <div className="p-4 sm:p-6 text-center hover:bg-gray-50 flex flex-col justify-center h-24 sm:h-28"><p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mb-1">Pendidikan</p><p className="text-2xl sm:text-3xl font-black text-[#013880]">{totalPendidikan}</p></div>
          <div className="p-4 sm:p-6 text-center hover:bg-gray-50 flex flex-col justify-center h-24 sm:h-28"><p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mb-1">Shortlink</p><p className="text-2xl sm:text-3xl font-black text-[#013880]">{totalShortlink}</p></div>
        </div>
      </div>

      {/* 🔥 GRID BARU: ANALYTICS & PIE CHART EXPENSES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KIRI (Analitik Web - 2 Kolom) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <DashboardChart chartData={chartData} currentRange={range} totalViews={totalPageViews} totalVisitors={totalUnique} /> 
        </div>

        {/* KANAN (Pie Chart - 1 Kolom) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[400px] overflow-hidden">
          <div className="bg-[#013880] px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <PieChartIcon size={20} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Kategori Pengeluaran</h2>
            </div>
          </div>
          <div className="p-4 flex-1 w-full h-full min-h-[300px]">
            <ExpensePieChart data={pieChartData} />
          </div>
        </div>

      </div>

      {/* 🔥 DAILY BRIEFING: CALENDAR (KIRI) & TASKS (KANAN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[500px] overflow-hidden">
          <div className="bg-[#013880] px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <CalendarClock size={20} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Agenda Hari Ini</h2>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">Sync: Live</span>
          </div>
          
          <div className="p-6 overflow-y-auto bg-slate-50/50 hide-scrollbar">
            {calendarEvents.length > 0 ? (
              <div className="relative border-l-2 border-blue-200 ml-3 space-y-6">
                {calendarEvents.map((event: any) => {
                  const startTime = event.start?.dateTime 
                    ? new Date(event.start.dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':')
                    : "All Day";
                  
                  return (
                    <div key={event.id} className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-[#013880] rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                      <p className="text-xs font-bold text-[#013880] mb-1">{startTime}</p>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-bold text-slate-800">{event.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3 opacity-60">
                <CalendarClock size={48} strokeWidth={1} />
                <p className="text-sm font-medium">Schedule is clear. Time to deep work!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[500px] overflow-hidden">
          <div className="bg-[#013880] px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <CheckSquare size={20} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Urgent Tasks</h2>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">Sync: Live</span>
          </div>
          
          <div className="p-6 overflow-y-auto bg-slate-50/50 hide-scrollbar">
            {tasks.length > 0 ? (
              <ul className="space-y-4">
                {tasks.map((task: any) => (
                  <li key={task.id} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mt-1 w-4 h-4 rounded border-2 border-[#013880]/50 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{task.title}</p>
                      {task.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3 opacity-60">
                <CheckSquare size={48} strokeWidth={1} />
                <p className="text-sm font-medium">All tasks cleared! Great job, Boss.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}