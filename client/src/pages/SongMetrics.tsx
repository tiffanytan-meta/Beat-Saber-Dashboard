/*
 * Song Metrics Page — Per-song gameplay data
 * Source: cube_oculus_beatsaber_metrics
 * Query: Song Metrics - All Filters - Distributions
 * Dimensions: difficulty, game_mode, song_mode, interface, u_client_country, u_fb_gender
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
import { MUSIC_PACKS, SONGS, COUNTRY_LABELS, INTERFACE_LABELS, formatNum, getPackFromSlug } from "@/lib/data";
import { useSongMetricsData } from "@/lib/dataService";
import DataSourceBadge from "@/components/DataSourceBadge";
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
  const { data: allSongData, isLoading, isFromApi, lastUpdated, dataDate } = useSongMetricsData();
  const d = allSongData[key];
  if (!d) return null;

  // SUM(event_count_1d) grouped by ds
  const gameplayData = useMemo(() =>
    d.gameplays.ds.map((ds, i) => ({
      ds,
      "Event Count (1d)": d.gameplays.event_count_1d[i],
      "Unique Players": d.gameplays.unique_players[i],
    })), [d]
  );

  // $dimension$ = difficulty
  const difficultyData = useMemo(() =>
    d.difficultyBreakdown.map(item => ({
      difficulty: item.difficulty,
      value: item.event_count_pct,
    })), [d]
  );

  // $dimension$ = game_mode
  const gameModeData = useMemo(() =>
    d.gameModeBreakdown.map(item => ({
      name: item.game_mode,
      value: item.event_count_pct,
    })), [d]
  );

  // $dimension$ = song_mode
  const songModeData = useMemo(() =>
    d.songModeBreakdown.map(item => ({
      name: item.song_mode,
      value: item.event_count_pct,
    })), [d]
  );

  // $dimension$ = interface
  const interfaceData = useMemo(() =>
    d.interfaceBreakdown.map(item => ({
      name: INTERFACE_LABELS[item.interface] || item.interface,
      value: item.event_count_pct,
    })), [d]
  );

  // $dimension$ = u_client_country
  const countryTableData = useMemo(() =>
    d.countryBreakdown.map((c, i) => ({
      rank: i + 1,
      u_client_country: COUNTRY_LABELS[c.u_client_country] || c.u_client_country,
      event_count_1d: c.event_count_1d,
      event_count_pct: c.event_count_pct,
    })), [d]
  );

  const countryColumns = [
    { key: "rank", label: "#", align: "center" as const },
    { key: "u_client_country", label: "Country" },
    { key: "event_count_1d", label: "Play Count", align: "right" as const, render: (v: unknown) => <span className="font-mono text-neon-cyan">{formatNum(v as number)}</span> },
    { key: "event_count_pct", label: "% of Total", align: "right" as const, render: (v: unknown) => <span className="font-mono">{String(v)}%</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Song Metrics"
        description={`Per-song gameplay data for "${selectedSong}" from ${selectedPack}`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <PackSelector value={selectedPack} onChange={handlePackChange} />
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Song / Level ID
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
        <DataSourceBadge isFromApi={isFromApi} lastUpdated={lastUpdated} dataDate={dataDate} isLoading={isLoading} />
      </div>

      {/* Gameplays Chart — event_count_1d over time */}
      <div className="mb-6">
        <ChartCard title="Gameplays Over Time (event_count_1d)" height="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gameplayData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="ds" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => formatNum(v)} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [formatNum(value)]} />
              <Legend />
              <Line type="monotone" dataKey="Event Count (1d)" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Unique Players" stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column: Difficulty Radar + Game Mode Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Difficulty Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={difficultyData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(100, 116, 139, 0.2)" />
              <PolarAngleAxis dataKey="difficulty" tick={AXIS_STYLE} />
              <PolarRadiusAxis tick={AXIS_STYLE} />
              <Radar dataKey="value" stroke={CHART_COLORS.cyan} fill={CHART_COLORS.cyan} fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Game Mode Distribution" height="h-[300px]">
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
                label={({ name, percent, x, y }: { name: string; percent: number; x: number; y: number }) => (
                  <text x={x} y={y} fill="#e2e8f0" fontSize={12} fontFamily="'DM Sans', sans-serif" textAnchor="middle">
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {gameModeData.map((_: unknown, i: number) => (
                  <Cell key={i} fill={CHART_PALETTE[i]} stroke="none" />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two-column: Song Mode + Interface Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Song Mode Distribution (song_mode)" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={songModeData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="name" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%", "Play %"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Play %">
                {songModeData.map((_: unknown, i: number) => (
                  <Cell key={i} fill={CHART_PALETTE[i]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Interface Distribution (attributed_interface)" height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interfaceData}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="name" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => v + "%"} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [value + "%", "Play %"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Play %">
                {interfaceData.map((_: unknown, i: number) => (
                  <Cell key={i} fill={[CHART_COLORS.cyan, CHART_COLORS.magenta, CHART_COLORS.amber][i]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Country Table */}
      <DataTable
        title="Top Countries (u_client_country)"
        columns={countryColumns}
        data={countryTableData}
      />
    </div>
  );
}
