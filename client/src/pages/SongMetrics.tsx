/*
 * Song Metrics Page — Per-song gameplay data
 * Plays, difficulty, game modes, completion rates, and geography
 */
import { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadarChart, Radar
} from "recharts";
import PageHeader from "@/components/PageHeader";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import PackSelector from "@/components/PackSelector";
import { songMetricsData, MUSIC_PACKS, SONGS, formatNum, getPackFromSlug } from "@/lib/data";
import { CHART_COLORS, CHART_PALETTE, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SongMetrics() {
  const params = useParams<{ packName?: string; songName?: string }>();
  const [, setLocation] = useLocation();
  const initialPack = params.packName ? getPackFromSlug(params.packName) : MUSIC_PACKS[0];
  const [selectedPack, setSelectedPack] = useState(
    MUSIC_PACKS.includes(initialPack) ? initialPack : MUSIC_PACKS[0]
  );

  const songs = SONGS[selectedPack] || [];
  const initialSong = params.songName ? getPackFromSlug(params.songName) : songs[0];
  const [selectedSong, setSelectedSong] = useState(
    songs.includes(initialSong) ? initialSong : songs[0]
  );

  useEffect(() => {
    const newSongs = SONGS[selectedPack] || [];
    if (!newSongs.includes(selectedSong)) {
      setSelectedSong(newSongs[0] || "");
    }
  }, [selectedPack, selectedSong]);

  const handlePackChange = (pack: string) => {
    setSelectedPack(pack);
    const firstSong = SONGS[pack]?.[0] || "";
    setSelectedSong(firstSong);
    setLocation(`/songs/${encodeURIComponent(pack)}/${encodeURIComponent(firstSong)}`);
  };

  const handleSongChange = (song: string) => {
    setSelectedSong(song);
    setLocation(`/songs/${encodeURIComponent(selectedPack)}/${encodeURIComponent(song)}`);
  };

  const key = `${selectedPack} — ${selectedSong}`;
  const d = songMetricsData[key];
  if (!d) return null;

  const gameplayData = useMemo(() =>
    d.gameplays.labels.map((label, i) => ({
      month: label,
      "Total Gameplays": d.gameplays.total[i],
      "Unique Players": d.gameplays.unique[i],
    })), [d]
  );

  const difficultyData = useMemo(() =>
    d.difficultyBreakdown.labels.map((label, i) => ({
      difficulty: label,
      value: d.difficultyBreakdown.values[i],
    })), [d]
  );

  const gameModeData = useMemo(() =>
    d.gameModeBreakdown.labels.map((label, i) => ({
      name: label,
      value: d.gameModeBreakdown.values[i],
    })), [d]
  );

  const completionData = useMemo(() =>
    d.completionRate.labels.map((label, i) => ({
      difficulty: label,
      rate: d.completionRate.values[i],
    })), [d]
  );

  const countryTableData = useMemo(() =>
    d.countryBreakdown.map((c, i) => ({
      rank: i + 1,
      country: c.country,
      gameplays: c.gameplays,
      pctTotal: c.pctTotal,
    })), [d]
  );

  const countryColumns = [
    { key: "rank", label: "#", align: "center" as const },
    { key: "country", label: "Country" },
    { key: "gameplays", label: "Gameplays", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatNum(v as number)}</span> },
    { key: "pctTotal", label: "% of Total", align: "right" as const, render: (v: unknown) => <span className="font-mono">{String(v)}%</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Song Metrics"
        description={`Per-song gameplay data for "${selectedSong}" from ${selectedPack}`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <PackSelector value={selectedPack} onChange={handlePackChange} />
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Song / Level
          </label>
          <Select value={selectedSong} onValueChange={handleSongChange}>
            <SelectTrigger className="w-[220px] bg-input border-border text-foreground">
              <SelectValue placeholder="Select a song..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {songs.map(song => (
                <SelectItem key={song} value={song} className="text-popover-foreground">
                  {song}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gameplays Chart — Full Width */}
      <div className="mb-6">
        <ChartCard title="Gameplays Over Time" height="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gameplayData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatNum(value)]} />
              <Legend />
              <Line type="monotone" dataKey="Total Gameplays" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Unique Players" stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Difficulty Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={difficultyData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(100, 116, 139, 0.2)" />
              <PolarAngleAxis dataKey="difficulty" tick={AXIS_STYLE} />
              <PolarRadiusAxis tick={AXIS_STYLE} />
              <Radar dataKey="value" stroke={CHART_COLORS.cyan} fill={CHART_COLORS.cyan} fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Game Mode Breakdown" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gameModeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent, x, y }) => (
                  <text x={x} y={y} fill="#e2e8f0" fontSize={12} fontFamily="'DM Sans', sans-serif" textAnchor="middle">
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {gameModeData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i]} stroke="none" />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Completion Rate — Full Width */}
      <div className="mb-6">
        <ChartCard title="Completion Rate by Difficulty" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="difficulty" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} domain={[0, 100]} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value.toFixed(1) + "%", "Completion Rate"]} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                {completionData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.rate >= 80 ? CHART_COLORS.green : entry.rate >= 60 ? CHART_COLORS.amber : CHART_COLORS.red}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Country Table */}
      <DataTable
        title="Top Countries"
        columns={countryColumns}
        data={countryTableData}
      />
    </div>
  );
}
