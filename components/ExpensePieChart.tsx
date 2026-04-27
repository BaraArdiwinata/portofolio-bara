"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react"; // 🔥 FIX 1: Import Icon dengan nama beda

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b", "#f43f5e"];

export default function ExpensePieChart({ data }: { data: { name: string; value: number }[] }) {
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-60">
        <PieChartIcon size={48} strokeWidth={1} /> {/* 🔥 FIX 2: Pake icon yang bener */}
        <p className="text-sm font-medium">Belum ada data pengeluaran.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => formatIDR(Number(value))} 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}