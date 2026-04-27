import { prisma } from "@/lib/prisma";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import YahooFinance from "yahoo-finance2";

export const dynamic = "force-dynamic";

const yahooFinance = new YahooFinance();

export default async function StocksDashboard() {
  // 1. Tarik histori pembelian dari Database
  const dbStocks = await prisma.stockPortfolio.findMany({
    orderBy: { totalInvested: "desc" },
  });

  // 2. Tarik Harga LIVE dari Yahoo Finance (Bursa Efek Indonesia / .JK)
  const stocks = await Promise.all(
    dbStocks.map(async (stock) => {
      try {
        // Tembak API Yahoo Finance pakai kode emiten + .JK (contoh: BBCA.JK)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quote: any = await yahooFinance.quote(`${stock.emitenCode}.JK`);
        const livePrice = quote.regularMarketPrice || stock.averageBuyPrice;
        
        // Hitung ulang kekayaan lu berdasarkan harga LIVE detik ini
        const liveTotalValue = livePrice * stock.lotQuantity * 100;
        const liveGainLoss = liveTotalValue - stock.totalInvested;
        const liveGainLossPercent = (liveGainLoss / stock.totalInvested) * 100;

        return {
          ...stock,
          currentPrice: livePrice,
          totalValue: liveTotalValue,
          gainLoss: liveGainLoss,
          gainLossPercent: liveGainLossPercent,
        };
      } catch (error) {
        console.error(`Gagal narik harga ${stock.emitenCode}:`, error);
        // Kalau Yahoo Finance lagi down, pake harga modal aja sementara
        return {
          ...stock,
          currentPrice: stock.averageBuyPrice,
          totalValue: stock.totalInvested,
          gainLoss: 0,
          gainLossPercent: 0,
        };
      }
    })
  );

  // 3. Kalkulasi Grand Total Saham
  const totalInvestedStock = stocks.reduce((acc, stock) => acc + stock.totalInvested, 0);
  const totalValueStock = stocks.reduce((acc, stock) => acc + stock.totalValue, 0);
  const totalGainLoss = totalValueStock - totalInvestedStock;
  const totalGainLossPercent = totalInvestedStock > 0 ? (totalGainLoss / totalInvestedStock) * 100 : 0;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-5xl pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#013880]">Portofolio Saham</h1>
        <p className="text-gray-500 mt-1 text-xs sm:text-sm">JARVIS Automated Wealth Management System (Live IDX).</p>
      </div>

      <div className="bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-800">
        
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 text-white">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h3 className="font-bold text-base sm:text-lg">Aset Saham</h3>
          </div>
          <div className="text-left sm:text-right">
             <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Total Nilai Saat Ini</p>
             <p className="text-xl sm:text-2xl font-black text-white">{formatIDR(totalValueStock)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-800/30">
           <div className="p-5 sm:p-6">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-1">Total Modal Diinvestasikan</p>
              <p className="text-lg sm:text-xl font-bold text-slate-200">{formatIDR(totalInvestedStock)}</p>
           </div>
           <div className="p-5 sm:p-6">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-1">Floating Profit / Loss</p>
              <div className="flex items-center gap-2">
                {totalGainLoss >= 0 ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
                <p className={`text-lg sm:text-xl font-bold ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalGainLoss > 0 ? "+" : ""}{formatIDR(totalGainLoss)} ({totalGainLossPercent.toFixed(2)}%)
                </p>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="min-w-[700px] w-full text-left text-sm text-slate-300">
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