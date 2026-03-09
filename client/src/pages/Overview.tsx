/*
 * Overview Page — Active users, engagement, demographics
 * Neon Arcade: Space Grotesk display, DM Sans body, neon cyan/magenta accents
 */
import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import { overviewData, formatNum } from "@/lib/data";
import { CHART_COLORS, CHART_PALETTE, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319088936/Xjt8uekCvgUMTbSr3yvdQX/hero-banner-coZ5Ns3PDqGWaeZwK6Fnmg.webp";

export default function Overview() {
  const d = overviewData;

  const activeUsersData = useMemo(() =>
    d.activeUsers.labels.map((label, i) => ({
      month: label,
      DAU: d.activeUsers.dau[i],
      WAU: d.activeUsers.wau[i],
      MAU: d.activeUsers.mau[i],
    })), [d]
  );

  const stickinessData = useMemo(() =>
    d.stickiness.labels.map((label, i) => ({
      month: label,
      value: d.stickiness.values[i],
    })), [d]
  );

  const attachData = useMemo(() =>
    d.attachRate.labels.map((label, i) => ({
      month: label,
      "Quest 2": d.attachRate.quest2[i],
      "Quest 3": d.attachRate.quest3[i],
      "Quest Pro": d.attachRate.questPro[i],
    })), [d]
  );

  const genderData = useMemo(() => [
    { name: "Male", value: d.genderDistribution.male },
    { name: "Female", value: d.genderDistribution.female },
    { name: "Other", value: d.genderDistribution.other },
  ], [d]);

  const ageData = useMemo(() =>
    d.ageDistribution.labels.map((label, i) => ({
      age: label,
      value: d.ageDistribution.values[i],
    })), [d]
  );

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Beat Saber performance at a glance — active users, engagement, and demographics"
        bgImage={HERO_BG}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="Monthly Active Users" value={d.kpis.totalMAU} index={0} />
        <KpiCard label="DAU / MAU Ratio" value={d.kpis.dauMauRatio} index={1} />
        <KpiCard label="Avg Session Length" value={d.kpis.avgSessionMin + " min"} index={2} />
        <KpiCard label="Attach Rate (Quest 3)" value={d.kpis.attachRateQ3} index={3} />
        <KpiCard label="Total Players (All Time)" value={d.kpis.totalPlayers} index={4} />
        <KpiCard label="Avg Songs / Session" value={d.kpis.avgSongsPerSession} index={5} />
      </div>

      {/* Active Users Chart — Full Width */}
      <div className="mb-6">
        <ChartCard title="Active Users" badge="12 months" height="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeUsersData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [formatNum(value), name]}
              />
              <Legend />
              <Line type="monotone" dataKey="DAU" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="WAU" stroke={CHART_COLORS.blue} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="MAU" stroke={CHART_COLORS.magenta} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Stickiness (DAU/MAU %)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stickinessData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%", "DAU/MAU"]} />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS.green} strokeWidth={2} fill={CHART_COLORS.green} fillOpacity={0.1} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attach Rate by Device">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attachData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%"]} />
              <Legend />
              <Line type="monotone" dataKey="Quest 2" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Quest 3" stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Quest Pro" stroke={CHART_COLORS.magenta} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Gender Distribution" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
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

        <ChartCard title="Age Distribution" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="age" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%", "Players"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {ageData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
