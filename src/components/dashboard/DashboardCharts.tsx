"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MonthlyData {
  month: string;
  total: number;
  completed: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export function OverviewMonthlyChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="total" name="Total Masuk" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="completed" name="Selesai" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDistributionChart({ data }: { data: StatusData[] }) {
  const filteredData = data.filter((d) => d.value > 0);

  return (
    <div className="h-72 w-full flex flex-col justify-between">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
        {filteredData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600 truncate">{item.name}:</span>
            <span className="font-bold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
