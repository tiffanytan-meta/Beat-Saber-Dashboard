/*
 * Individual Music Pack Page — Deep-dive into a specific music pack
 * Source: digest_oculus_beatsaber_iap, cube_oculus_beatsaber_metrics
 * Queries: % of Gameplays, Individual Music Pack - Sales in Period
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

  // SUM(gross_revenue_usd_1d) and CARDINALITY(MERGE(distinct_rev_users_hyperlog_1d))
  const salesData = useMemo(() => {
    if (!d) return [];
    return d.sales.ds.map((ds, i) => ({
      ds,
      gross_revenue_usd_1d: d.sales.gross_revenue_usd_1d[i],
      distinct_rev_users_1d: d.sales.distinct_rev_users_1d[i],
    }));
  }, [d]);

  // New IAP buyers — mass entitled vs non-mass entitled
  const purchaserData = useMemo(() => {
    if (!d) return [];
    return d.purchasers.ds.map((ds, i) => ({
      ds,
      "New IAP Buyers": d.purchasers.new_iap_buyers[i],
      "Mass Entitled Buyers": d.purchasers.mass_entitled_buyers[i],
    }));
  }, [d]);

  // Gender breakdown from cube_oculus_beatsaber_metrics.u_fb_gender
  const genderData = useMemo(() => {
    if (!d) return [];
    return d.genderBreakdown.map(g => ({
      name: g.u_fb_gender === "male" ? "Male" : g.u_fb_gender === "female" ? "Female" : "Unknown",
      value: g.event_count_pct,
    }));
  }, [d]);

  // Song purchases from digest_oculus_beatsaber_iap per levelid
  const songTableData = useMemo(() => {
    if (!d) return [];
    return d.songPurchases.map((s, i) => ({
      rank: i + 1,
      levelid: s.levelid,
      distinct_rev_users: s.distinct_rev_users,
      gross_revenue_usd: s.gross_revenue_usd,
    }));
  }, [d]);

  const songColumns = [
    { key: "rank", label: "#", align: "center" as const },
    { key: "levelid", label: "Song (Level ID)" },
    { key: "distinct_rev_users", label: "Purchasers", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatNum(v as number)}</span> },
    { key: "gross_revenue_usd", label: "Revenue (USD)", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-green">{formatUSD(v as number)}</span> },
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

      {/* KPIs — from digest_oculus_beatsaber_iap and cube_oculus_beatsaber_metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="% of Gameplays" value={d.gameplay_pct + "%"} index={0} />
        <KpiCard label="Day 1 Attach Rate" value={d.attach_rates.attach_rate_l1 + "%"} index={1} />
        <KpiCard label="Week 1 Attach Rate" value={d.attach_rates.attach_rate_l7 + "%"} index={2} />
        <KpiCard label="Month 1 Attach Rate" value={d.attach_rates.attach_rate_l28 + "%"} index={3} />
        <KpiCard label="Overall Attach Rate" value={d.attach_rates.attach_rate_overall + "%"} index={4} />
        <KpiCard
          label="Sales (7d / 28d)"
          value={formatUSD(d.sales_windows.sales_7d)}
          subtitle={`28d: ${formatUSD(d.sales_windows.sales_28d)}`}
          index={5}
        />
      </div>

      {/* Sales Chart — gross_revenue_usd_1d + distinct_rev_users_1d */}
      <div className="mb-6">
        <ChartCard title={`${selectedPack} — Revenue & Purchasers`} height="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={salesData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} />
              <YAxis yAxisId="left" tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <YAxis yAxisId="right" orientation="right" tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number, name: string) => [
                name === "distinct_rev_users_1d" ? formatNum(value) : formatUSD(value),
                name === "distinct_rev_users_1d" ? "Purchasers" : "Revenue"
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="gross_revenue_usd_1d" fill={CHART_COLORS.cyan} fillOpacity={0.6} radius={[4, 4, 0, 0]} name="Revenue (USD)" />
              <Line yAxisId="right" type="monotone" dataKey="distinct_rev_users_1d" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 3 }} name="Purchasers" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="New IAP Buyers (ME vs Non-ME)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaserData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatNum(value)]} />
              <Legend />
              <Bar dataKey="New IAP Buyers" stackId="a" fill={CHART_COLORS.green} fillOpacity={0.8} />
              <Bar dataKey="Mass Entitled Buyers" stackId="a" fill={CHART_COLORS.magenta} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Breakdown (u_fb_gender)" height="h-[300px]">
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
                label={({ name, percent, x, y }: { name: string; percent: number; x: number; y: number }) => (
                  <text x={x} y={y} fill="#e2e8f0" fontSize={12} fontFamily="'DM Sans', sans-serif" textAnchor="middle">
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {genderData.map((_: unknown, i: number) => (
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
        title={`${selectedPack} — Song-Level Sales`}
        columns={songColumns}
        data={songTableData}
      />
    </div>
  );
}
