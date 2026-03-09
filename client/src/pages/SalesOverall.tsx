/*
 * Sales Overall Page — Revenue, units sold, purchase rates, top content
 * Neon Arcade design
 */
import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell
} from "recharts";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import { salesOverallData, formatNum, formatUSD } from "@/lib/data";
import { CHART_COLORS, CHART_PALETTE, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";

export default function SalesOverall() {
  const d = salesOverallData;

  const overallSalesData = useMemo(() =>
    d.overallSales.labels.map((label, i) => ({
      month: label,
      revenue: d.overallSales.revenue[i],
      units: d.overallSales.units[i],
    })), [d]
  );

  const yoyData = useMemo(() =>
    d.yoyCumulative.labels.map((label, i) => ({
      month: label,
      "2024": d.yoyCumulative.year2024[i],
      "2025": d.yoyCumulative.year2025[i],
    })), [d]
  );

  const packRevenueData = useMemo(() =>
    d.cumulativeByPack.slice(0, 10).map(p => ({
      name: p.name.length > 14 ? p.name.slice(0, 12) + "..." : p.name,
      fullName: p.name,
      revenue: p.revenue,
    })), [d]
  );

  const purchaseRateData = useMemo(() =>
    d.purchaseRateByPack.map(p => ({
      name: p.name.length > 10 ? p.name.slice(0, 8) + "..." : p.name,
      fullName: p.name,
      "Day 1": p.day1,
      "Week 1": p.week1,
      "Month 1": p.month1,
      "Overall": p.overall,
    })), [d]
  );

  const revenue1dData = useMemo(() =>
    d.revenue1d.labels.map((label, i) => ({
      month: label,
      revenue: d.revenue1d.values[i],
    })), [d]
  );

  const songTableData = useMemo(() =>
    d.individualSongSales.map((s, i) => ({
      rank: i + 1,
      song: s.song,
      pack: s.pack,
      units: s.units,
      revenue: s.revenue,
    })), [d]
  );

  const songColumns = [
    {
      key: "rank", label: "#", align: "center" as const,
      render: (value: unknown) => {
        const rank = value as number;
        const colors = ["text-neon-amber bg-neon-amber/10", "text-muted-foreground bg-muted/50", "text-neon-amber/70 bg-neon-amber/5"];
        const cls = rank <= 3 ? colors[rank - 1] : "text-muted-foreground bg-muted/30";
        return <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${cls}`}>{rank}</span>;
      }
    },
    { key: "song", label: "Song" },
    { key: "pack", label: "Music Pack" },
    { key: "units", label: "Units Sold", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatNum(v as number)}</span> },
    { key: "revenue", label: "Revenue", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-green">{formatUSD(v as number)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Music Pack Sales — Overall"
        description="Revenue, units sold, purchase rates, and top-performing content"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="Total Revenue" value={d.kpis.totalRevenue} index={0} />
        <KpiCard label="Total Units Sold" value={d.kpis.totalUnitsSold} index={1} />
        <KpiCard label="Avg Revenue / User" value={d.kpis.avgRevenuePerUser} index={2} />
        <KpiCard label="Purchase Rate" value={d.kpis.purchaseRate} index={3} />
        <KpiCard label="Top Music Pack" value={d.kpis.topPack} index={4} />
        <KpiCard label="WoW Growth" value={d.kpis.weekOverWeekGrowth} index={5} change="trending up" changeType="positive" />
      </div>

      {/* Overall Sales Trend */}
      <div className="mb-6">
        <ChartCard title="Sales — Overall Revenue" badge="24 months" height="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overallSalesData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} interval={2} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatUSD(value), "Revenue"]} />
              <Bar dataKey="revenue" fill={CHART_COLORS.cyan} fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="YoY Cumulative Revenue ($M)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yoyData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} label={{ value: "Revenue ($M)", angle: -90, position: "insideLeft", style: { ...AXIS_STYLE, fontSize: 10 } }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="2024" stroke={CHART_COLORS.amber} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="2025" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Revenue (1d)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue1dData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatUSD(value), "Daily Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Pack charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Cumulative Revenue by Music Pack" height="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={packRevenueData} layout="vertical">
              <CartesianGrid {...GRID_STYLE} />
              <XAxis type="number" tick={AXIS_STYLE} tickFormatter={(v) => "$" + v + "K"} />
              <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={100} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => ["$" + value + "K", "Revenue"]} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {packRevenueData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Purchase Rate by Music Pack" height="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseRateData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 9 }} interval={0} angle={-35} textAnchor="end" height={60} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="Day 1" fill={CHART_COLORS.cyan} fillOpacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Week 1" fill={CHART_COLORS.blue} fillOpacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Month 1" fill={CHART_COLORS.green} fillOpacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Overall" fill={CHART_COLORS.magenta} fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Songs Table */}
      <DataTable
        title="Top Individual Song Sales"
        badge="Top 20"
        columns={songColumns}
        data={songTableData}
      />
    </div>
  );
}
