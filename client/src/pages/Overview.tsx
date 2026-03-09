/*
 * Overview Page — Active users, engagement, demographics
 * Source: digest_oculus_ipauai_v2_view, cube_oculus_ipauai_v2_lite
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

  // CARDINALITY(MERGE(dau_cnt_hyperlog)), wau_cnt_hyperlog, mau_cnt_hyperlog
  const activeUsersData = useMemo(() =>
    d.activeUsers.ds.map((ds, i) => ({
      ds,
      DAP: d.activeUsers.dap_cnt[i],
      WAP: d.activeUsers.wap_cnt[i],
      MAP: d.activeUsers.map_cnt[i],
    })), [d]
  );

  // daily_stickiness, weekly_stickiness, monthly_stickiness
  const stickinessData = useMemo(() =>
    d.stickiness.ds.map((ds, i) => ({
      ds,
      "Daily": d.stickiness.daily_stickiness[i],
      "Weekly": d.stickiness.weekly_stickiness[i],
      "Monthly": d.stickiness.monthly_stickiness[i],
    })), [d]
  );

  // attach_rate_1d, attach_rate_lifetime from cube_oculus_ipauai_v2_lite
  const attachData = useMemo(() =>
    d.attachRate.ds.map((ds, i) => ({
      ds,
      "Daily Attach Rate": d.attachRate.attach_rate_1d[i],
      "Lifetime Attach Rate": d.attachRate.attach_rate_lifetime[i],
    })), [d]
  );

  // Gender distribution: Beat Saber vs Quest comparison
  const genderData = useMemo(() =>
    d.genderDistribution.map(g => ({
      name: g.u_fb_gender === "male" ? "Male" : g.u_fb_gender === "female" ? "Female" : "Unknown",
      bs_pct: g.bs_pct,
      quest_pct: g.quest_pct,
    })), [d]
  );

  // Age distribution: Beat Saber vs Quest comparison
  const ageData = useMemo(() =>
    d.ageDistribution.map(a => ({
      age: a.u_fb_age_bucket,
      "Beat Saber": a.bs_pct,
      "Quest Overall": a.quest_pct,
    })), [d]
  );

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Beat Saber performance at a glance — active users, engagement, and demographics"
        bgImage={HERO_BG}
      />

      {/* KPIs — from digest_oculus_ipauai_v2_view */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard label="Monthly Active People" value={d.kpis.map_cnt} index={0} />
        <KpiCard label="DAP / MAP Ratio" value={d.kpis.dap_per_map} index={1} />
        <KpiCard label="Daily Stickiness" value={d.kpis.daily_stickiness} index={2} />
        <KpiCard label="Attach Rate (Lifetime)" value={d.kpis.attach_rate_lifetime} index={3} />
        <KpiCard label="Lifetime Active People" value={d.kpis.lap_cnt} index={4} />
        <KpiCard label="Weekly Stickiness" value={d.kpis.weekly_stickiness} index={5} />
      </div>

      {/* Active Users Chart — dap_cnt, wap_cnt, map_cnt */}
      <div className="mb-6">
        <ChartCard title="Active People" badge="12 months" height="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeUsersData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [formatNum(value), name]}
              />
              <Legend />
              <Line type="monotone" dataKey="DAP" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="DAP (Daily)" />
              <Line type="monotone" dataKey="WAP" stroke={CHART_COLORS.blue} strokeWidth={2} dot={{ r: 3 }} name="WAP (Weekly)" />
              <Line type="monotone" dataKey="MAP" stroke={CHART_COLORS.magenta} strokeWidth={2} dot={{ r: 3 }} name="MAP (Monthly)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Stickiness (Retention Rates)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stickinessData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%"]} />
              <Legend />
              <Line type="monotone" dataKey="Daily" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Weekly" stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Monthly" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attach Rate (DAP & Lifetime)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attachData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%"]} />
              <Legend />
              <Line type="monotone" dataKey="Daily Attach Rate" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Lifetime Attach Rate" stroke={CHART_COLORS.magenta} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Demographics — Beat Saber vs Quest comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Gender Distribution (BS vs Quest)" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genderData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="name" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%"]} />
              <Legend />
              <Bar dataKey="bs_pct" name="Beat Saber" fill={CHART_COLORS.cyan} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="quest_pct" name="Quest Overall" fill={CHART_COLORS.magenta} fillOpacity={0.5} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Distribution (BS vs Quest)" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="age" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%"]} />
              <Legend />
              <Bar dataKey="Beat Saber" fill={CHART_COLORS.cyan} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Quest Overall" fill={CHART_COLORS.magenta} fillOpacity={0.5} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
