/*
 * Individual Music Pack Page — Deep-dive into a specific music pack
 * Sales, purchasers, demographics, and individual song purchases
 */
import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ComposedChart
} from "recharts";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import PackSelector from "@/components/PackSelector";
import { individualPackData, MUSIC_PACKS, formatNum, formatUSD, getPackFromSlug } from "@/lib/data";
import { CHART_COLORS, CHART_PALETTE, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";

const MUSIC_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319088936/Xjt8uekCvgUMTbSr3yvdQX/music-pack-bg-39erBNsyyeqsgik2sRMQRv.webp";

export default function IndividualPack() {
  const params = useParams<{ packName?: string }>();
  const [, setLocation] = useLocation();
  const initialPack = params.packName ? getPackFromSlug(params.packName) : MUSIC_PACKS[0];
  const [selectedPack, setSelectedPack] = useState(
    MUSIC_PACKS.includes(initialPack) ? initialPack : MUSIC_PACKS[0]
  );

  const handlePackChange = (pack: string) => {
    setSelectedPack(pack);
    setLocation(`/pack/${encodeURIComponent(pack)}`);
  };

  const d = individualPackData[selectedPack];

  const salesData = useMemo(() => {
    if (!d) return [];
    return d.sales.labels.map((label, i) => ({
      month: label,
      units: d.sales.units[i],
      revenue: d.sales.revenue[i],
    }));
  }, [d]);

  const purchaserData = useMemo(() => {
    if (!d) return [];
    return d.purchasers.labels.map((label, i) => ({
      month: label,
      "New Purchasers": d.purchasers.newPurchasers[i],
      "Repeat Purchasers": d.purchasers.repeatPurchasers[i],
    }));
  }, [d]);

  const genderData = useMemo(() => {
    if (!d) return [];
    return d.genderBreakdown.labels.map((label, i) => ({
      name: label,
      value: d.genderBreakdown.values[i],
    }));
  }, [d]);

  const songTableData = useMemo(() => {
    if (!d) return [];
    return d.songPurchases.map((s, i) => ({
      rank: i + 1,
      song: s.name,
      units: s.units,
      revenue: s.revenue,
    }));
  }, [d]);

  const songColumns = [
    { key: "rank", label: "#", align: "center" as const },
    { key: "song", label: "Song" },
    { key: "units", label: "Units", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatNum(v as number)}</span> },
    { key: "revenue", label: "Revenue", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-green">{formatUSD(v as number)}</span> },
  ];

  if (!d) {
    return (
      <div>
        <PageHeader title="Individual Music Pack" description="Select a pack to analyze" bgImage={MUSIC_BG} />
        <PackSelector value={selectedPack} onChange={handlePackChange} />
        <p className="text-muted-foreground mt-8 text-center">No data available for this pack.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Individual Music Pack"
        description={`Deep-dive into ${selectedPack} — sales, purchasers, and demographics`}
        bgImage={MUSIC_BG}
      />

      {/* Pack Selector */}
      <div className="mb-6">
        <PackSelector value={selectedPack} onChange={handlePackChange} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="% of Gameplays" value={d.gameplayPct + "%"} index={0} />
        <KpiCard label="Day 1 Purchase Rate" value={d.purchaseRate.day1 + "%"} index={1} />
        <KpiCard label="Week 1 Purchase Rate" value={d.purchaseRate.week1 + "%"} index={2} />
        <KpiCard label="Month 1 Purchase Rate" value={d.purchaseRate.month1 + "%"} index={3} />
        <KpiCard label="Overall Purchase Rate" value={d.purchaseRate.overall + "%"} index={4} />
        <KpiCard
          label="Week 1 / Week 2 Sales"
          value={formatNum(d.week1_2.week1)}
          subtitle={`Week 2: ${formatNum(d.week1_2.week2)}`}
          index={5}
        />
      </div>

      {/* Sales Chart — Full Width */}
      <div className="mb-6">
        <ChartCard title={`${selectedPack} — Sales (Units + Revenue)`} height="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={salesData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis yAxisId="left" tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <YAxis yAxisId="right" orientation="right" tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number, name: string) => [
                name === "units" ? formatNum(value) : formatUSD(value),
                name === "units" ? "Units" : "Revenue"
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="units" fill={CHART_COLORS.cyan} fillOpacity={0.6} radius={[4, 4, 0, 0]} name="Units" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 3 }} name="Revenue ($)" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Purchasers (New vs Repeat)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaserData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatNum(value)]} />
              <Legend />
              <Bar dataKey="New Purchasers" stackId="a" fill={CHART_COLORS.green} fillOpacity={0.8} />
              <Bar dataKey="Repeat Purchasers" stackId="a" fill={CHART_COLORS.magenta} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Breakdown (Lifetime)" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent, x, y }) => (
                  <text x={x} y={y} fill="#e2e8f0" fontSize={12} fontFamily="'DM Sans', sans-serif" textAnchor="middle">
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i]} stroke="none" />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Song Purchases Table */}
      <DataTable
        title={`${selectedPack} — Single Song Purchases`}
        columns={songColumns}
        data={songTableData}
      />
    </div>
  );
}
