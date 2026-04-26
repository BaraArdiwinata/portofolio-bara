import { prisma } from "@/lib/prisma";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StocksDashboard() {
  // Cuma narik data saham
  const stocks = await prisma.stockPortfolio.findMany({
    orderBy: { totalInvested: "desc" },
  });

  // Kalkulasi Saham
  const totalInvestedStock = stocks.reduce((acc, stock) => acc + stock.totalInvested, 0);
  const totalValueStock = stocks.reduce((acc, stock) => acc + (stock.totalValue || stock.totalInvested), 0);
  const totalGainLoss = totalValueStock - totalInvestedStock;
  const totalGainLossPercent = totalInvestedStock > 0 ? (totalGainLoss / totalInvestedStock) * 100 : 0;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 w-full max-w-5xl pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-[#013880]">Portofolio Saham</h1>
        <p className="text-gray-500 mt-1 text-sm">JARVIS Automated Wealth Management System (Live IDX).</p>
      </div>

      <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Briefcase size={24} className="text-blue-400" />
            <h3 className="font-bold text-lg">Aset Saham</h3>
          </div>
          <div className="text-right">
             <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Nilai Saat Ini</p>
             <p className="text-2xl font-black text-white">{formatIDR(totalValueStock)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 divide-x divide-slate-800 bg-slate-800/30">
           <div className="p-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Modal Diinvestasikan</p>
              <p className="text-xl font-bold text-slate-200">{formatIDR(totalInvestedStock)}</p>
           </div>
           <div className="p-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Floating Profit / Loss</p>
              <div className="flex items-center gap-2">
                {totalGainLoss >= 0 ? <TrendingUp size={20} className="text-emerald-400" /> : <TrendingDown size={20} className="text-rose-400" />}
                <p className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalGainLoss > 0 ? "+" : ""}{formatIDR(totalGainLoss)} ({totalGainLossPercent.toFixed(2)}%)
                </p>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900 border-y border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Emiten</th>
                <th className="px-6 py-4 font-bold tracking-wider">Lot / Lembar</th>
                <th className="px-6 py-4 font-bold tracking-wider">Avg Price</th>
                <th className="px-6 py-4 font-bold tracking-wider">Live Price</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Gain / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-slate-800/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-black text-blue-400 text-base">{stock.emitenCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-slate-200">{stock.lotQuantity}</span> Lot <span className="text-slate-500 text-xs">({stock.lotQuantity * 100} lbr)</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">{formatIDR(stock.averageBuyPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-200">{formatIDR(stock.currentPrice || 0)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${(stock.gainLoss || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {(stock.gainLoss || 0) > 0 ? "+" : ""}{formatIDR(stock.gainLoss || 0)} <br/>
                    <span className="text-xs opacity-80">{(stock.gainLossPercent || 0).toFixed(2)}%</span>
                  </td>
                </tr>
              ))}
              {stocks.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">Belum ada portofolio saham. Silakan order via WA.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}