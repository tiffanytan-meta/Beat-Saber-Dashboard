/*
 * Pack Release Page — Release impact analysis
 * Sales decay, cumulative traction, before/after comparisons
 */
import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area
} from "recharts";
import PageHeader from "@/components/PageHeader";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import PackSelector from "@/components/PackSelector";
import { releaseData, MUSIC_PACKS, formatNum, getPackFromSlug } from "@/lib/data";
import { CHART_COLORS, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

  const dailySalesData = useMemo(() =>
    d.salesSinceRelease.labels.map((label, i) => ({
      day: "Day " + label,
      sales: d.salesSinceRelease.daily[i],
    })), [d]
  );

  const cumulativeData = useMemo(() =>
    d.cumulativeSales.labels.map((label, i) => ({
      day: "Day " + label,
      sales: d.cumulativeSales.values[i],
    })), [d]
  );

  const songTableData = useMemo(() =>
    d.songsSold.map((s, i) => ({
      rank: i + 1,
      song: s.name,
      day7: s.day7,
      day30: s.day30,
      day90: s.day90,
    })), [d]
  );

  const songColumns = [
    { key: "rank", label: "#", align: "center" as const },
    { key: "song", label: "Song" },
    { key: "day7", label: "Day 7", align: "right" as const, render: (v: unknown) => <span className="font-mono">{formatNum(v as number)}</span> },
    { key: "day30", label: "Day 30", align: "right" as const, render: (v: unknown) => <span className="font-mono">{formatNum(v as number)}</span> },
    { key: "day90", label: "Day 90", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatNum(v as number)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Music Pack Release"
        description={`Release impact analysis for ${selectedPack} — sales decay, cumulative traction, and before/after comparisons`}
      />

      {/* Pack Selector */}
      <div className="mb-6">
        <PackSelector value={selectedPack} onChange={handlePackChange} />
      </div>

      {/* Before/After — Day 1 Purchase Rate */}
      <h3 className="font-display text-sm font-semibold text-foreground mb-4">
        New User Day 1 Purchase Rate — Before / After Release
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <CompareCard
          title="7-Day Window"
          beforeValue={String(d.beforeAfter.day1_before7D)}
          afterValue={String(d.beforeAfter.day1_after7D)}
          suffix="%"
        />
        <CompareCard
          title="28-Day Window"
          beforeValue={String(d.beforeAfter.day1_before28D)}
          afterValue={String(d.beforeAfter.day1_after28D)}
          suffix="%"
        />
      </div>

      {/* Before/After — Avg Revenue */}
      <h3 className="font-display text-sm font-semibold text-foreground mb-4">
        New User First Day Avg Revenue — Before / After Release
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <CompareCard
          title="7-Day Window"
          beforeValue={String(d.avgRevenue.before7D)}
          afterValue={String(d.avgRevenue.after7D)}
          prefix="$"
        />
        <CompareCard
          title="28-Day Window"
          beforeValue={String(d.avgRevenue.before28D)}
          afterValue={String(d.avgRevenue.after28D)}
          prefix="$"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Daily Sales — Days Since Release">
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
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatNum(value), "Daily Sales"]} />
              <Area type="monotone" dataKey="sales" stroke={CHART_COLORS.magenta} strokeWidth={2} fill="url(#dailyGrad)" />
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
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatNum(value), "Cumulative Sales"]} />
              <Area type="monotone" dataKey="sales" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#cumGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Songs Sold Table */}
      <DataTable
        title="Songs Sold Since Release"
        columns={songColumns}
        data={songTableData}
      />
    </div>
  );
}
