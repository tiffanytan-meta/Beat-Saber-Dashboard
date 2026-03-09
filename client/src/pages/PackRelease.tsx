/*
 * Pack Release Page — Release impact analysis
 * Source: digest_oculus_beatsaber_iap
 * Query: Cumulative Sales by Music Pack - Days Since Original Release
 */
import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area
} from "recharts";
import PageHeader from "@/components/PageHeader";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import PackSelector from "@/components/PackSelector";
import { releaseData, MUSIC_PACKS, formatNum, formatUSD, getPackFromSlug } from "@/lib/data";
import { CHART_COLORS, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

function CompareCard({ title, beforeValue, afterValue, prefix = "", suffix = "" }: {
  title: string; beforeValue: string; afterValue: string; prefix?: string; suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-xl p-5"
    >
      <h4 className="text-xs text-muted-foreground mb-3 font-medium">{title}</h4>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase mb-1">Before</p>
          <p className="font-display text-xl font-bold text-muted-foreground">{prefix}{beforeValue}{suffix}</p>
        </div>
        <ArrowRight size={18} className="text-neon-green flex-shrink-0" />
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase mb-1">After</p>
          <p className="font-display text-xl font-bold text-neon-green">{prefix}{afterValue}{suffix}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PackRelease() {
  const params = useParams<{ packName?: string }>();
  const [, setLocation] = useLocation();
  const initialPack = params.packName ? getPackFromSlug(params.packName) : MUSIC_PACKS[0];
  const [selectedPack, setSelectedPack] = useState(
    MUSIC_PACKS.includes(initialPack) ? initialPack : MUSIC_PACKS[0]
  );

  const handlePackChange = (pack: string) => {
    setSelectedPack(pack);
    setLocation(`/release/${encodeURIComponent(pack)}`);
  };

  const d = releaseData[selectedPack];
  if (!d) return null;

  // Daily sales decay — days_from_release vs gross_revenue_usd_1d
  const dailySalesData = useMemo(() =>
    d.salesSinceRelease.days_from_release.map((day, i) => ({
      day: "Day " + day,
      gross_revenue_usd_1d: d.salesSinceRelease.gross_revenue_usd_1d[i],
    })), [d]
  );

  // Cumulative sales — SUM(SUM(gross_revenue_usd_1d)) OVER (ORDER BY ds)
  const cumulativeData = useMemo(() =>
    d.cumulativeSales.days_from_release.map((day, i) => ({
      day: "Day " + day,
      cumulative_sales: d.cumulativeSales.cumulative_sales[i],
    })), [d]
  );

  // Song-level sales since release
  const songTableData = useMemo(() =>
    d.songsSold.map((s, i) => ({
      rank: i + 1,
      levelid: s.levelid,
      sales_7d: s.sales_7d,
      sales_30d: s.sales_30d,
      sales_90d: s.sales_90d,
    })), [d]
  );

  const songColumns = [
    { key: "rank", label: "#", align: "center" as const },
    { key: "levelid", label: "Song (Level ID)" },
    { key: "sales_7d", label: "7d Sales", align: "right" as const, render: (v: unknown) => <span className="font-mono">{formatUSD(v as number)}</span> },
    { key: "sales_30d", label: "30d Sales", align: "right" as const, render: (v: unknown) => <span className="font-mono">{formatUSD(v as number)}</span> },
    { key: "sales_90d", label: "90d Sales", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatUSD(v as number)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Music Pack Release"
        description={`Release impact analysis for ${selectedPack} — sales decay, cumulative traction, and before/after comparisons`}
      />

      {/* Pack Selector */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <PackSelector value={selectedPack} onChange={handlePackChange} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground glass-card px-3 py-2 rounded-lg">
          <Calendar size={14} />
          <span>Release: <span className="text-neon-cyan font-mono">{d.original_release_date}</span></span>
        </div>
      </div>

      {/* Before/After — Day 1 Attach Rate (attach_rate_l1) */}
      <h3 className="font-display text-sm font-semibold text-foreground mb-4">
        New User Day 1 Attach Rate — Before / After Release
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <CompareCard
          title="7-Day Window"
          beforeValue={String(d.beforeAfter.attach_rate_l1_before_7d)}
          afterValue={String(d.beforeAfter.attach_rate_l1_after_7d)}
          suffix="%"
        />
        <CompareCard
          title="28-Day Window"
          beforeValue={String(d.beforeAfter.attach_rate_l1_before_28d)}
          afterValue={String(d.beforeAfter.attach_rate_l1_after_28d)}
          suffix="%"
        />
      </div>

      {/* Before/After — Avg Revenue per New User */}
      <h3 className="font-display text-sm font-semibold text-foreground mb-4">
        New User First Day Avg Revenue — Before / After Release
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <CompareCard
          title="7-Day Window"
          beforeValue={String(d.avgRevenue.avg_rev_before_7d)}
          afterValue={String(d.avgRevenue.avg_rev_after_7d)}
          prefix="$"
        />
        <CompareCard
          title="28-Day Window"
          beforeValue={String(d.avgRevenue.avg_rev_before_28d)}
          afterValue={String(d.avgRevenue.avg_rev_after_28d)}
          prefix="$"
        />
      </div>

      {/* Charts — Days Since Release */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Daily Revenue — Days Since Release">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySalesData}>
              <defs>
                <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.magenta} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.magenta} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="day" tick={AXIS_STYLE} interval={2} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatUSD(value), "Daily Revenue"]} />
              <Area type="monotone" dataKey="gross_revenue_usd_1d" stroke={CHART_COLORS.magenta} strokeWidth={2} fill="url(#dailyGrad)" name="Revenue (1d)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cumulative Sales — Days Since Release">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="day" tick={AXIS_STYLE} interval={2} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatUSD(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatUSD(value), "Cumulative Sales"]} />
              <Area type="monotone" dataKey="cumulative_sales" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#cumGrad)" name="Cumulative" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Songs Sold Table */}
      <DataTable
        title="Song-Level Sales Since Release"
        columns={songColumns}
        data={songTableData}
      />
    </div>
  );
}
