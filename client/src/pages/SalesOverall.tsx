/*
 * Sales Overall Page — Revenue, units sold, purchase rates, top content
 * Source: digest_oculus_beatsaber_iap, digest_oculus_beatsaber_iap_view
 * Neon Arcade design
 */
import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell, AreaChart, Area
} from "recharts";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import { salesOverallData, formatNum, formatUSD, COUNTRY_LABELS } from "@/lib/data";
import { CHART_COLORS, CHART_PALETTE, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";

export default function SalesOverall() {
  const d = salesOverallData;

  // SUM(gross_revenue_usd_1d) grouped by ds
  const revenueTimelineData = useMemo(() =>
    d.salesTimeline.ds.map((ds, i) => ({
      ds,
      gross_revenue_usd_1d: d.salesTimeline.gross_revenue_usd_1d[i],
    })), [d]
  );

  // YoY cumulative revenue
  const yoyData = useMemo(() =>
    d.yoyCumulative.labels.map((label, i) => ({
      month: label,
      "2024": d.yoyCumulative.year2024[i],
      "2025": d.yoyCumulative.year2025[i],
    })), [d]
  );

  // Cumulative Sales By Music Pack — All Time
  const packRevenueData = useMemo(() =>
    d.cumulativeByPack.slice(0, 10).map(p => ({
      name: p.music_pack_id.length > 14 ? p.music_pack_id.slice(0, 12) + "..." : p.music_pack_id,
      fullName: p.music_pack_id,
      sales: p.sales,
    })), [d]
  );

  // Attach Rate - Overall per pack
  const attachRateData = useMemo(() =>
    d.purchaseRateByPack.map(p => ({
      name: p.music_pack_id.length > 10 ? p.music_pack_id.slice(0, 8) + "..." : p.music_pack_id,
      fullName: p.music_pack_id,
      "Day 1": p.attach_rate_l1,
      "Week 1": p.attach_rate_l7,
      "Month 1": p.attach_rate_l28,
      "Overall": p.attach_rate_overall,
    })), [d]
  );

  // New IAP Users — mass entitled vs non-mass entitled
  const newIapData = useMemo(() =>
    d.newIapUsers.ds.map((ds, i) => ({
      ds,
      "Mass Entitled": d.newIapUsers.mass_entitled[i],
      "Non Mass Entitled": d.newIapUsers.non_mass_entitled[i],
    })), [d]
  );

  // Top songs table
  const songTableData = useMemo(() =>
    d.topSongSales.map((s, i) => ({
      rank: i + 1,
      levelid: s.levelid,
      music_pack_id: s.music_pack_id,
      distinct_rev_users: s.distinct_rev_users_hyperlog_lifetime,
      gross_revenue_usd: s.gross_revenue_usd_lifetime,
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
    { key: "levelid", label: "Song (Level ID)" },
    { key: "music_pack_id", label: "Music Pack" },
    { key: "distinct_rev_users", label: "Purchasers", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatNum(v as number)}</span> },
    { key: "gross_revenue_usd", label: "Revenue (USD)", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-green">{formatUSD(v as number)}</span> },
  ];

  // Suppress unused import warning
  void COUNTRY_LABELS;

  return (
    <div>
      <PageHeader
        title="Music Pack Sales — Overall"
        description="Revenue, purchasers, attach rates, and top-performing content"
      />

      {/* KPIs — from digest_oculus_beatsaber_iap */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="Lifetime Revenue (USD)" value={d.kpis.gross_revenue_usd_lifetime} index={0} />
        <KpiCard label="Lifetime Purchasers" value={d.kpis.distinct_rev_users_lifetime} index={1} />
        <KpiCard label="Avg Revenue / User" value={d.kpis.avg_revenue_per_user} index={2} />
        <KpiCard label="Attach Rate (Overall)" value={d.kpis.attach_rate_overall} index={3} />
        <KpiCard label="Top Music Pack" value={d.kpis.top_music_pack} index={4} />
        <KpiCard label="WoW Growth" value={d.kpis.wow_growth} index={5} change="trending up" changeType="positive" />
      </div>

      {/* Revenue Timeline — SUM(gross_revenue_usd_1d) */}
      <div className="mb-6">
        <ChartCard title="Revenue — gross_revenue_usd (Monthly)" badge="24 months" height="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueTimelineData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} interval={2} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatUSD(value), "Revenue"]} />
              <Bar dataKey="gross_revenue_usd_1d" fill={CHART_COLORS.cyan} fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Revenue (1d)" />
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

        <ChartCard title="New IAP Buyers (ME vs Non-ME)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={newIapData}>
              <defs>
                <linearGradient id="meGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="nonMeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatNum(value)]} />
              <Legend />
              <Area type="monotone" dataKey="Non Mass Entitled" stroke={CHART_COLORS.cyan} fill="url(#nonMeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Mass Entitled" stroke={CHART_COLORS.green} fill="url(#meGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Pack charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Cumulative Sales by Music Pack" height="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={packRevenueData} layout="vertical">
              <CartesianGrid {...GRID_STYLE} />
              <XAxis type="number" tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={100} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatUSD(value), "Sales"]} />
              <Bar dataKey="sales" radius={[0, 4, 4, 0]} name="Lifetime Sales">
                {packRevenueData.map((_: unknown, i: number) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attach Rate by Music Pack" height="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attachRateData}>
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
        title="Top Songs — Lifetime Sales"
        badge="Top 20"
        columns={songColumns}
        data={songTableData}
      />
    </div>
  );
}
