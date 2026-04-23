"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TimeData {
  name: string; 
  total: number; 
}

const filterRanges = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "All", value: "All" },
];

export default function DashboardChart({ 
  chartData, 
  currentRange,
  totalViews,
  totalVisitors
}: { 
  chartData: TimeData[]; 
  currentRange: string;
  totalViews: number;
  totalVisitors: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterClick = (value: string) => {
    // scroll: false biar layarnya smooth gak lompat pas nge-refresh data
    router.push(pathname + "?" + createQueryString("range", value), { scroll: false });
  };

  return (
    <div className="w-full">
      {/* Header, Legend, & Filter UI (Lebih Profesional) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
        
        {/* Kiri: Judul dan Legend Angka */}
        <div>
          <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            Analitik Lalu Lintas
          </h2>
          <p className="text-xs text-gray-500 mt-1">Metrik kunjungan berdasarkan rentang waktu yang dipilih.</p>
          
          {/* ✅ INI DIA LEGEND PAGEVIEWS & VISITORS NYA */}
          <div className="flex items-center gap-8 mt-5">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Pageviews</p>
              <p className="text-3xl font-black text-[#013880]">{totalViews}</p>
            </div>
            <div className="w-px h-10 bg-gray-200"></div> {/* Garis Pemisah */}
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Unique Visitors</p>
              <p className="text-3xl font-black text-[#013880]">{totalVisitors}</p>
            </div>
          </div>
        </div>
        
        {/* Kanan: Tombol Filter */}
        <div className="bg-gray-50 p-1.5 rounded-xl flex items-center border border-gray-200 self-start">
          {filterRanges.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterClick(filter.value)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                currentRange === filter.value
                  ? "bg-[#013880] text-white shadow-md scale-100"
                  : "text-gray-500 hover:bg-white hover:text-[#013880] hover:shadow-sm"
              }`}
            >
              {currentRange === filter.value && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-300"></span>
                </span>
              )}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📈 GRAFIK SAHAM */}
      <div className="h-72 w-full mt-6 -ml-4">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#013880" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#013880" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
                interval="preserveStartEnd" 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
                allowDecimals={false} 
                domain={['dataMin', 'dataMax + 2']} 
              />
              <Tooltip 
                cursor={{ stroke: '#013880', strokeWidth: 1, strokeDasharray: '4 4' }} 
                contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }} 
                labelStyle={{ fontWeight: '800', color: '#111827', fontSize: '12px', marginBottom: '4px' }}
                itemStyle={{ color: '#013880', fontSize: '14px', fontWeight: '700' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value || 0} Kunjungan`, 'Traffic']} 
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#013880" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 3, fill: '#013880', style: { filter: 'drop-shadow(0px 2px 4px rgba(1,56,128,0.4))' } }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : chartData.length === 1 ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
             <p className="text-xl font-bold text-gray-800 mb-2">Kurang Data Historis</p>
             <p className="text-sm text-gray-500 max-w-sm">Baru ada 1 titik data di waktu {chartData[0].name}. Sistem memerlukan minimal 2 titik waktu berbeda untuk merender grafik.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
             <p className="text-xl font-bold text-gray-400 mb-2">Tidak Ada Data</p>
             <p className="text-sm text-gray-400 max-w-sm">Belum ada aktivitas kunjungan yang tercatat dalam rentang waktu yang dipilih ({currentRange}).</p>
          </div>
        )}
      </div>

    </div>
  );
}