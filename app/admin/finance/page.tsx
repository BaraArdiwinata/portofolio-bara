import { prisma } from "@/lib/prisma";
import { ArrowDownRight, ArrowUpRight, Wallet, Landmark, Activity } from "lucide-react";
import FinanceLineChart from "@/components/FinanceLineChart";
import RoastButton from "@/components/RoastButton";

export const dynamic = "force-dynamic";

export default async function FinanceDashboard() {
  const logs = await prisma.financialLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  let totalIn = 0;
  let totalOut = 0;
  const walletBalances: Record<string, number> = {};
  
  // 🔥 Siapin keranjang buat data Grafik (Dikelompokkan per hari)
  const chartDataMap = new Map<string, { dateStr: string; in: number; out: number; timestamp: number }>();

  logs.forEach((log) => {
    // 1. Kalkulasi Card & Dompet
    if (log.type === "IN") totalIn += log.amount;
    if (log.type === "OUT") totalOut += log.amount;

    if (!walletBalances[log.wallet]) walletBalances[log.wallet] = 0;
    if (log.type === "IN") walletBalances[log.wallet] += log.amount;
    else if (log.type === "OUT") walletBalances[log.wallet] -= log.amount;

    // 2. Kalkulasi Grafik
    const dateObj = new Date(log.createdAt);
    const dateStr = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    const timestamp = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();

    if (!chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, { dateStr, in: 0, out: 0, timestamp });
    }

    const currentDay = chartDataMap.get(dateStr)!;
    if (log.type === "IN") currentDay.in += log.amount;
    if (log.type === "OUT") currentDay.out += log.amount;
  });

  // Urutkan data grafik dari tanggal terlama ke terbaru biar ngalir dari kiri ke kanan
  const financeChartData = Array.from(chartDataMap.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => ({
      name: item.dateStr,
      Pemasukan: item.in,
      Pengeluaran: item.out,
    }));

  const balance = totalIn - totalOut;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 w-full max-w-5xl pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-[#013880]">Keuangan Liquid</h1>
        <p className="text-gray-500 mt-1 text-sm">Laporan mutasi dompet dan rekening dari JARVIS.</p>
      </div>

      {/* TIGA KARTU UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#013880] text-white p-6 rounded-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <Wallet size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Total Saldo Liquid</h2>
          </div>
          <p className="text-3xl font-black">{formatIDR(balance)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <ArrowUpRight size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Pemasukan (IN)</h2>
          </div>
          <p className="text-3xl font-black text-gray-900">{formatIDR(totalIn)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4 text-rose-600">
            <ArrowDownRight size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Pengeluaran (OUT)</h2>
          </div>
          <p className="text-3xl font-black text-gray-900">{formatIDR(totalOut)}</p>
        </div>
      </div>

      {/* 🔥 TOMBOL ROASTING AI */}
    <RoastButton />

      {/* 🔥 GRAFIK ARUS KAS BARU */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <Activity className="text-[#013880]" size={20} />
          <h3 className="font-bold text-gray-800 tracking-wide">Tren Arus Kas Harian</h3>
        </div>
        <div className="p-6">
          {financeChartData.length > 0 ? (
            <FinanceLineChart data={financeChartData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium">
              Belum ada data transaksi yang cukup untuk grafik.
            </div>
          )}
        </div>
      </div>

      {/* SALDO PER DOMPET */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
         <div className="flex items-center gap-3 mb-6">
            <Landmark className="text-[#013880]" size={24} />
            <h3 className="font-bold text-xl text-gray-800">Saldo Per Dompet</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(walletBalances).map(([walletName, amount]) => (
            <div key={walletName} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{walletName}</p>
              <p className={`text-lg font-black ${amount < 0 ? 'text-rose-600' : 'text-gray-800'}`}>
                {formatIDR(amount)}
              </p>
            </div>
          ))}
          {Object.keys(walletBalances).length === 0 && (
            <div className="col-span-full p-4 text-center text-sm text-gray-500">Belum ada data dompet.</div>
          )}
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Riwayat Transaksi Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-bold tracking-wider">Tipe</th>
                <th className="px-6 py-4 font-bold tracking-wider">Sumber</th>
                <th className="px-6 py-4 font-bold tracking-wider">Keterangan</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{log.createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.type === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{log.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-600">{log.wallet}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{log.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${log.type === "IN" ? "text-emerald-600" : "text-rose-600"}`}>
                    {log.type === "IN" ? "+" : "-"}{formatIDR(log.amount)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center font-medium">Belum ada transaksi. Silakan input via WA.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}