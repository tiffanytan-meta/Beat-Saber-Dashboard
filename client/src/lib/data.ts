// ============================================================
// Beat Saber Analytics Dashboard — Data Layer
// Realistic synthetic data modeled on UniDash SQL schema:
//   - digest_oculus_beatsaber_iap (IAP revenue, purchase rates)
//   - cube_oculus_beatsaber_metrics (gameplay events)
//   - digest_oculus_ipauai_v2_view (DAU/WAU/MAU, stickiness)
//   - cube_oculus_ipauai_v2_lite (attach rates)
//   - dim_oculus_beatsaber_me_users (mass-entitled users)
// ============================================================

// Seeded PRNG for deterministic data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);
function rand(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, dec = 2): number {
  return parseFloat((rng() * (max - min) + min).toFixed(dec));
}

function generateDates(startDate: string, count: number): string[] {
  const dates: string[] = [];
  const d = new Date(startDate);
  for (let i = 0; i < count; i++) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function generateMonths(startYear: number, startMonth: number, count: number): string[] {
  const months: string[] = [];
  let y = startYear, m = startMonth;
  for (let i = 0; i < count; i++) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

// ============================================================
// MUSIC PACKS — Real Beat Saber DLC packs
// Maps to: digest_oculus_beatsaber_iap.music_pack_id
// ============================================================
export const MUSIC_PACKS = [
  "Imagine Dragons", "Panic! At The Disco", "Green Day", "BTS",
  "Linkin Park", "The Weeknd", "Lady Gaga", "Fall Out Boy",
  "Billie Eilish", "Skrillex", "Timbaland", "Interscope Mixtape",
  "Monstercat Vol.1", "Rocket League"
];

// Release dates per music pack
// Maps to: digest_oculus_beatsaber_iap.release_date
export const PACK_RELEASE_DATES: Record<string, string> = {
  "Imagine Dragons": "2019-06-10",
  "Panic! At The Disco": "2019-06-13",
  "Monstercat Vol.1": "2019-10-01",
  "Timbaland": "2019-03-14",
  "Green Day": "2020-02-20",
  "BTS": "2020-11-30",
  "Linkin Park": "2020-08-13",
  "The Weeknd": "2021-09-16",
  "Fall Out Boy": "2021-03-08",
  "Billie Eilish": "2021-09-22",
  "Skrillex": "2022-02-17",
  "Interscope Mixtape": "2021-12-01",
  "Lady Gaga": "2022-05-02",
  "Rocket League": "2022-07-14",
};

// Songs per pack
// Maps to: cube_oculus_beatsaber_metrics.levelid
export const SONGS: Record<string, string[]> = {
  "Imagine Dragons": ["Believer", "Thunder", "Natural", "Radioactive", "Whatever It Takes"],
  "Panic! At The Disco": ["High Hopes", "Victorious", "The Greatest Show", "Emperor's New Clothes"],
  "Green Day": ["American Idiot", "Boulevard of Broken Dreams", "Holiday", "Basket Case"],
  "BTS": ["Dynamite", "Butter", "Boy With Luv", "DNA", "IDOL"],
  "Linkin Park": ["Numb", "In The End", "Bleed It Out", "One Step Closer", "New Divide"],
  "The Weeknd": ["Blinding Lights", "Save Your Tears", "Starboy", "Can't Feel My Face"],
  "Lady Gaga": ["Bad Romance", "Poker Face", "Born This Way", "Alejandro"],
  "Fall Out Boy": ["Centuries", "My Songs Know What You Did", "Uma Thurman"],
  "Billie Eilish": ["Bad Guy", "Happier Than Ever", "Therefore I Am", "Lovely"],
  "Skrillex": ["Bangarang", "Scary Monsters", "First of the Year", "Cinema"],
  "Timbaland": ["Throw It On Me", "Give It To Me", "The Way I Are"],
  "Interscope Mixtape": ["Track 1", "Track 2", "Track 3", "Track 4"],
  "Monstercat Vol.1": ["Overkill", "Emoji", "Boundless", "Rattlesnake"],
  "Rocket League": ["Breathing Underwater", "Solar Eclipses", "Luv U Need U"]
};

// Maps to: cube_oculus_beatsaber_metrics.difficulty
export const DIFFICULTIES = ["Easy", "Normal", "Hard", "Expert", "Expert+"];

// Maps to: cube_oculus_beatsaber_metrics.game_mode
export const GAME_MODES = ["Standard", "One Saber", "No Arrows", "90 Degree", "360 Degree"];

// Maps to: cube_oculus_beatsaber_metrics.song_mode
export const SONG_MODES = ["Solo", "Party", "Multiplayer"];

// Maps to: cube_oculus_beatsaber_metrics.interface / attributed_interface_grouping
export const INTERFACES = ["oculus_mobile_6dof", "oculus_pc", "oculus_mobile_3dof"];
export const INTERFACE_LABELS: Record<string, string> = {
  "oculus_mobile_6dof": "Quest (6DoF)",
  "oculus_pc": "PC VR (Link)",
  "oculus_mobile_3dof": "Go (3DoF)",
};

// Maps to: cube_oculus_beatsaber_metrics.u_client_country
export const COUNTRIES = [
  "US", "DE", "GB", "JP", "FR",
  "CA", "AU", "KR", "BR", "NL"
];

export const COUNTRY_LABELS: Record<string, string> = {
  "US": "United States", "DE": "Germany", "GB": "United Kingdom",
  "JP": "Japan", "FR": "France", "CA": "Canada",
  "AU": "Australia", "KR": "South Korea", "BR": "Brazil", "NL": "Netherlands"
};

// Maps to: digest_oculus_ipauai_v2_view.u_fb_gender
export const GENDERS = ["male", "female", "unknown"];

// Maps to: digest_oculus_ipauai_v2_view.u_fb_age_bucket
export const AGE_BUCKETS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

// Maps to: digest_oculus_beatsaber_iap.payment_feature_type
export const PAYMENT_TYPES = ["bundle", "single_song"];

const MONTHS_24 = generateMonths(2024, 1, 24);
const MONTHS_12 = MONTHS_24.slice(12);

// ============================================================
// 1. OVERVIEW DATA
// Source tables: digest_oculus_ipauai_v2_view, cube_oculus_ipauai_v2_lite
// Queries: Stickiness/Active Users, Gender/Age Distribution, Attach Rate
// ============================================================
export interface OverviewData {
  // From: CARDINALITY(MERGE(dau_cnt_hyperlog)), wau_cnt_hyperlog, mau_cnt_hyperlog
  activeUsers: { ds: string[]; dap_cnt: number[]; wap_cnt: number[]; map_cnt: number[] };
  // From: daily_stickiness, weekly_stickiness, monthly_stickiness
  stickiness: { ds: string[]; daily_stickiness: number[]; weekly_stickiness: number[]; monthly_stickiness: number[] };
  // From: cube_oculus_ipauai_v2_lite — attach_rate_1d, attach_rate_lifetime
  attachRate: {
    ds: string[];
    attach_rate_1d: number[];
    attach_rate_lifetime: number[];
  };
  // From: Gender/Age Distribution query — bs_pct, quest_pct, delta
  genderDistribution: { u_fb_gender: string; bs_pct: number; quest_pct: number; delta: number }[];
  ageDistribution: { u_fb_age_bucket: string; bs_pct: number; quest_pct: number; delta: number }[];
  kpis: {
    map_cnt: string;
    dap_per_map: string;
    daily_stickiness: string;
    attach_rate_lifetime: string;
    lap_cnt: string;
    weekly_stickiness: string;
  };
}

export const overviewData: OverviewData = (() => {
  // Simulate DAU/WAU/MAU growth with Quest 3 launch bump mid-2024
  const dau: number[] = [];
  const wau: number[] = [];
  const mau: number[] = [];
  let baseDau = 145000;
  for (let i = 0; i < 12; i++) {
    baseDau = Math.floor(baseDau * (1 + randFloat(-0.02, 0.04)));
    dau.push(baseDau);
    wau.push(Math.floor(baseDau * randFloat(3.8, 4.5)));
    mau.push(Math.floor(baseDau * randFloat(7.5, 9.2)));
  }

  // Stickiness: active_people_yesterday_and_today / active_people_yesterday
  const dailyStick = MONTHS_12.map(() => randFloat(28, 38));
  const weeklyStick = MONTHS_12.map(() => randFloat(42, 55));
  const monthlyStick = MONTHS_12.map(() => randFloat(55, 68));

  // Attach rate from cube_oculus_ipauai_v2_lite
  const attachRate1d = MONTHS_12.map(() => randFloat(2.5, 5.5));
  const attachRateLifetime = MONTHS_12.map(() => randFloat(18, 28));

  // Gender distribution: Beat Saber vs Quest comparison
  const genderDist = [
    { u_fb_gender: "male", bs_pct: 78.4, quest_pct: 65.2, delta: 13.2 },
    { u_fb_gender: "female", bs_pct: 17.8, quest_pct: 30.1, delta: -12.3 },
    { u_fb_gender: "unknown", bs_pct: 3.8, quest_pct: 4.7, delta: -0.9 },
  ];

  // Age distribution: Beat Saber vs Quest comparison
  const ageDist = [
    { u_fb_age_bucket: "13-17", bs_pct: 11.2, quest_pct: 8.4, delta: 2.8 },
    { u_fb_age_bucket: "18-24", bs_pct: 29.5, quest_pct: 22.1, delta: 7.4 },
    { u_fb_age_bucket: "25-34", bs_pct: 31.8, quest_pct: 28.6, delta: 3.2 },
    { u_fb_age_bucket: "35-44", bs_pct: 17.3, quest_pct: 23.8, delta: -6.5 },
    { u_fb_age_bucket: "45-54", bs_pct: 7.1, quest_pct: 11.9, delta: -4.8 },
    { u_fb_age_bucket: "55+", bs_pct: 3.1, quest_pct: 5.2, delta: -2.1 },
  ];

  const latestMau = mau[mau.length - 1];
  const latestDau = dau[dau.length - 1];

  return {
    activeUsers: { ds: MONTHS_12, dap_cnt: dau, wap_cnt: wau, map_cnt: mau },
    stickiness: { ds: MONTHS_12, daily_stickiness: dailyStick, weekly_stickiness: weeklyStick, monthly_stickiness: monthlyStick },
    attachRate: { ds: MONTHS_12, attach_rate_1d: attachRate1d, attach_rate_lifetime: attachRateLifetime },
    genderDistribution: genderDist,
    ageDistribution: ageDist,
    kpis: {
      map_cnt: formatNum(latestMau),
      dap_per_map: (latestDau / latestMau * 100).toFixed(1) + "%",
      daily_stickiness: dailyStick[dailyStick.length - 1] + "%",
      attach_rate_lifetime: attachRateLifetime[attachRateLifetime.length - 1] + "%",
      lap_cnt: formatNum(Math.floor(latestMau * 12.5)),
      weekly_stickiness: weeklyStick[weeklyStick.length - 1] + "%",
    }
  };
})();

// ============================================================
// 2. SALES OVERALL DATA
// Source tables: digest_oculus_beatsaber_iap, digest_oculus_beatsaber_iap_view
// Queries: Sales - Overall, Cumulative Sales By Music Pack,
//          Attach Rate - Overall, New IAP Users
// ============================================================
export interface SalesOverallData {
  // From: SUM(gross_revenue_usd_1d) grouped by ds
  salesTimeline: { ds: string[]; gross_revenue_usd_1d: number[] };
  // From: YoY cumulative SUM(gross_revenue_usd_1d) OVER (ORDER BY ds)
  yoyCumulative: { labels: string[]; year2024: number[]; year2025: number[] };
  // From: Cumulative Sales By Music Pack - All Time query
  cumulativeByPack: { music_pack_id: string; sales: number }[];
  // From: Attach Rate - Overall query (purchase rates per pack)
  purchaseRateByPack: {
    music_pack_id: string;
    attach_rate_l1: number;
    attach_rate_l7: number;
    attach_rate_l28: number;
    attach_rate_overall: number;
  }[];
  // From: individual song sales from digest_oculus_beatsaber_iap
  topSongSales: { levelid: string; music_pack_id: string; gross_revenue_usd_lifetime: number; distinct_rev_users_hyperlog_lifetime: number }[];
  // From: New IAP Users query
  newIapUsers: { ds: string[]; mass_entitled: number[]; non_mass_entitled: number[] };
  kpis: {
    gross_revenue_usd_lifetime: string;
    distinct_rev_users_lifetime: string;
    avg_revenue_per_user: string;
    attach_rate_overall: string;
    top_music_pack: string;
    wow_growth: string;
  };
}

export const salesOverallData: SalesOverallData = (() => {
  // Daily revenue (aggregated to monthly for display)
  const revenue1d: number[] = [];
  let baseRev = 680000;
  for (let i = 0; i < 24; i++) {
    baseRev = Math.floor(baseRev * (1 + randFloat(-0.05, 0.08)));
    revenue1d.push(baseRev);
  }

  // YoY cumulative
  const y2024: number[] = [];
  const y2025: number[] = [];
  let cum2024 = 0, cum2025 = 0;
  for (let i = 0; i < 12; i++) {
    cum2024 += revenue1d[i] / 1e6;
    y2024.push(parseFloat(cum2024.toFixed(1)));
    cum2025 += revenue1d[i + 12] / 1e6;
    y2025.push(parseFloat(cum2025.toFixed(1)));
  }

  // Cumulative revenue by pack (from Cumulative Sales By Music Pack query)
  const packRevenues: { music_pack_id: string; sales: number }[] = MUSIC_PACKS.map(p => ({
    music_pack_id: p,
    sales: rand(420000, 2800000),
  })).sort((a, b) => b.sales - a.sales);

  // Attach rates per pack (from Attach Rate - Overall query)
  const packAttachRates = MUSIC_PACKS.map(p => ({
    music_pack_id: p,
    attach_rate_l1: randFloat(0.3, 2.8),
    attach_rate_l7: randFloat(1.5, 6.5),
    attach_rate_l28: randFloat(3.5, 12.0),
    attach_rate_overall: randFloat(6.0, 22.0),
  }));

  // Top song sales (from digest_oculus_beatsaber_iap per levelid)
  const topSongs: { levelid: string; music_pack_id: string; gross_revenue_usd_lifetime: number; distinct_rev_users_hyperlog_lifetime: number }[] = [];
  for (const [pack, titles] of Object.entries(SONGS)) {
    for (const title of titles) {
      topSongs.push({
        levelid: title,
        music_pack_id: pack,
        gross_revenue_usd_lifetime: rand(8000, 185000),
        distinct_rev_users_hyperlog_lifetime: rand(3000, 95000),
      });
    }
  }
  topSongs.sort((a, b) => b.distinct_rev_users_hyperlog_lifetime - a.distinct_rev_users_hyperlog_lifetime);

  // New IAP users (from New IAP Users with First Beat IAP query)
  const newME = MONTHS_12.map(() => rand(800, 3500));
  const newNonME = MONTHS_12.map(() => rand(4000, 12000));

  const totalRev = packRevenues.reduce((s, p) => s + p.sales, 0);
  const totalUsers = topSongs.reduce((s, p) => s + p.distinct_rev_users_hyperlog_lifetime, 0);
  const topPack = packRevenues[0].music_pack_id;

  return {
    salesTimeline: { ds: MONTHS_24, gross_revenue_usd_1d: revenue1d },
    yoyCumulative: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      year2024: y2024,
      year2025: y2025,
    },
    cumulativeByPack: packRevenues,
    purchaseRateByPack: packAttachRates,
    topSongSales: topSongs.slice(0, 20),
    newIapUsers: { ds: MONTHS_12, mass_entitled: newME, non_mass_entitled: newNonME },
    kpis: {
      gross_revenue_usd_lifetime: formatUSD(totalRev),
      distinct_rev_users_lifetime: formatNum(totalUsers),
      avg_revenue_per_user: "$" + (totalRev / totalUsers).toFixed(2),
      attach_rate_overall: packAttachRates.reduce((s, p) => s + p.attach_rate_overall, 0 / MUSIC_PACKS.length).toFixed(1) + "%",
      top_music_pack: topPack,
      wow_growth: "+" + randFloat(1.5, 5.5) + "%",
    }
  };
})();

// ============================================================
// 3. INDIVIDUAL MUSIC PACK DATA
// Source tables: digest_oculus_beatsaber_iap, digest_oculus_beatsaber_iap_view,
//               cube_oculus_beatsaber_metrics
// Queries: % of Gameplays, Individual Music Pack - Sales in Period
// ============================================================
export interface IndividualPackItem {
  // From: digest_oculus_beatsaber_iap.release_date
  release_date: string;
  // From: SUM(gross_revenue_usd_1d), CARDINALITY(MERGE(distinct_rev_users_hyperlog_1d))
  sales: { ds: string[]; gross_revenue_usd_1d: number[]; distinct_rev_users_1d: number[] };
  // From: New IAP Users query — mass_entitled vs non_mass_entitled
  purchasers: { ds: string[]; new_iap_buyers: number[]; mass_entitled_buyers: number[] };
  // From: % of Gameplays query — SUM(event_count_1d) / SUM(SUM(event_count_1d)) OVER ()
  gameplay_pct: number;
  // From: Attach Rate - Overall query per pack
  attach_rates: {
    attach_rate_l1: number;
    attach_rate_l7: number;
    attach_rate_l28: number;
    attach_rate_overall: number;
  };
  // From: cube_oculus_beatsaber_metrics.u_fb_gender
  genderBreakdown: { u_fb_gender: string; event_count_pct: number }[];
  // From: Sales in Period query — sales_7d, sales_28d
  sales_windows: { sales_7d: number; sales_28d: number; sales_overall: number; bundles_overall: number };
  // From: digest_oculus_beatsaber_iap per levelid within pack
  songPurchases: { levelid: string; distinct_rev_users: number; gross_revenue_usd: number }[];
}

export const individualPackData: Record<string, IndividualPackItem> = {};
MUSIC_PACKS.forEach(pack => {
  const releaseDate = PACK_RELEASE_DATES[pack] || "2021-01-01";

  const rev1d: number[] = [];
  const users1d: number[] = [];
  let basePackRev = rand(25000, 85000);
  for (let i = 0; i < 12; i++) {
    basePackRev = Math.floor(basePackRev * (1 + randFloat(-0.08, 0.06)));
    rev1d.push(basePackRev);
    users1d.push(Math.floor(basePackRev / randFloat(3.5, 7.5)));
  }

  const newBuyers = MONTHS_12.map(() => rand(1200, 8500));
  const meBuyers = MONTHS_12.map(() => rand(200, 2200));

  const totalSalesOverall = rev1d.reduce((s, v) => s + v, 0) * randFloat(3.5, 6.0);

  individualPackData[pack] = {
    release_date: releaseDate,
    sales: { ds: MONTHS_12, gross_revenue_usd_1d: rev1d, distinct_rev_users_1d: users1d },
    purchasers: { ds: MONTHS_12, new_iap_buyers: newBuyers, mass_entitled_buyers: meBuyers },
    gameplay_pct: randFloat(3.5, 16.5),
    attach_rates: {
      attach_rate_l1: randFloat(0.4, 3.2),
      attach_rate_l7: randFloat(1.8, 7.5),
      attach_rate_l28: randFloat(4.0, 14.0),
      attach_rate_overall: randFloat(7.0, 24.0),
    },
    genderBreakdown: [
      { u_fb_gender: "male", event_count_pct: randFloat(72, 82) },
      { u_fb_gender: "female", event_count_pct: randFloat(14, 22) },
      { u_fb_gender: "unknown", event_count_pct: randFloat(2, 8) },
    ],
    sales_windows: {
      sales_7d: rand(35000, 180000),
      sales_28d: rand(120000, 650000),
      sales_overall: Math.floor(totalSalesOverall),
      bundles_overall: rand(15000, 120000),
    },
    songPurchases: (SONGS[pack] || []).map(s => ({
      levelid: s,
      distinct_rev_users: rand(2500, 45000),
      gross_revenue_usd: rand(1500, 28000),
    })),
  };
});

// ============================================================
// 4. MUSIC PACK RELEASE DATA
// Source tables: digest_oculus_beatsaber_iap
// Queries: Cumulative Sales by Music Pack - Days Since Original Release
// ============================================================
export interface ReleaseItem {
  // From: original_release_date via MIN(release_date)
  original_release_date: string;
  // From: days_from_release = DATE_DIFF('day', release_date, ds)
  // Daily sales decaying from release
  salesSinceRelease: { days_from_release: number[]; gross_revenue_usd_1d: number[] };
  // From: SUM(SUM(gross_revenue_usd_1d)) OVER (PARTITION BY music_pack_id ORDER BY ds)
  cumulativeSales: { days_from_release: number[]; cumulative_sales: number[] };
  // Before/After release comparison (attach rate)
  beforeAfter: {
    attach_rate_l1_before_7d: number; attach_rate_l1_after_7d: number;
    attach_rate_l1_before_28d: number; attach_rate_l1_after_28d: number;
  };
  // Before/After average revenue per new user
  avgRevenue: {
    avg_rev_before_7d: number; avg_rev_after_7d: number;
    avg_rev_before_28d: number; avg_rev_after_28d: number;
  };
  // Song-level sales since release
  songsSold: { levelid: string; sales_7d: number; sales_30d: number; sales_90d: number }[];
}

export const releaseData: Record<string, ReleaseItem> = {};
MUSIC_PACKS.forEach(pack => {
  const releaseDate = PACK_RELEASE_DATES[pack] || "2021-01-01";
  const daysSinceRelease = Array.from({ length: 90 }, (_, i) => i + 1);
  const filteredDays = daysSinceRelease.filter((_, i) => i % 3 === 0);

  const peakRevenue = rand(18000, 55000);
  const decayRate = randFloat(15, 30);

  releaseData[pack] = {
    original_release_date: releaseDate,
    salesSinceRelease: {
      days_from_release: filteredDays,
      gross_revenue_usd_1d: filteredDays.map((d) =>
        Math.max(800, Math.floor(peakRevenue * Math.exp(-d / decayRate) + (rng() * 3000 - 1500)))
      ),
    },
    cumulativeSales: (() => {
      let cum = 0;
      return {
        days_from_release: filteredDays,
        cumulative_sales: filteredDays.map((d) => {
          cum += Math.max(800, Math.floor(peakRevenue * Math.exp(-d / decayRate)));
          return cum;
        }),
      };
    })(),
    beforeAfter: {
      attach_rate_l1_before_7d: randFloat(1.2, 3.5),
      attach_rate_l1_after_7d: randFloat(2.5, 6.8),
      attach_rate_l1_before_28d: randFloat(1.0, 3.0),
      attach_rate_l1_after_28d: randFloat(2.0, 5.5),
    },
    avgRevenue: {
      avg_rev_before_7d: randFloat(0.12, 0.38),
      avg_rev_after_7d: randFloat(0.28, 0.72),
      avg_rev_before_28d: randFloat(0.10, 0.35),
      avg_rev_after_28d: randFloat(0.22, 0.58),
    },
    songsSold: (SONGS[pack] || []).map(s => ({
      levelid: s,
      sales_7d: rand(3000, 22000),
      sales_30d: rand(12000, 65000),
      sales_90d: rand(25000, 120000),
    })),
  };
});

// ============================================================
// 5. SONG METRICS DATA
// Source tables: cube_oculus_beatsaber_metrics
// Queries: Song Metrics - All Filters - Distributions
// $dimension$ = difficulty, game_mode, interface, u_client_country, u_fb_gender
// ============================================================
export interface SongMetricItem {
  music_pack_id: string;
  levelid: string;
  // From: SUM(event_count_1d) grouped by ds
  gameplays: { ds: string[]; event_count_1d: number[]; unique_players: number[] };
  // From: $dimension$ = difficulty
  difficultyBreakdown: { difficulty: string; event_count_pct: number }[];
  // From: $dimension$ = game_mode
  gameModeBreakdown: { game_mode: string; event_count_pct: number }[];
  // From: $dimension$ = song_mode
  songModeBreakdown: { song_mode: string; event_count_pct: number }[];
  // From: $dimension$ = interface
  interfaceBreakdown: { interface: string; event_count_pct: number }[];
  // From: $dimension$ = u_client_country
  countryBreakdown: { u_client_country: string; event_count_1d: number; event_count_pct: number }[];
  // From: $dimension$ = u_fb_gender
  genderBreakdown: { u_fb_gender: string; event_count_pct: number }[];
}

export const songMetricsData: Record<string, SongMetricItem> = {};
for (const [pack, songs] of Object.entries(SONGS)) {
  songs.forEach(song => {
    const basePlayCount = rand(80000, 450000);
    songMetricsData[`${pack} — ${song}`] = {
      music_pack_id: pack,
      levelid: song,
      gameplays: {
        ds: MONTHS_12,
        event_count_1d: MONTHS_12.map(() => rand(Math.floor(basePlayCount * 0.6), Math.floor(basePlayCount * 1.4))),
        unique_players: MONTHS_12.map(() => rand(Math.floor(basePlayCount * 0.25), Math.floor(basePlayCount * 0.55))),
      },
      difficultyBreakdown: (() => {
        const vals = [rand(5, 12), rand(18, 28), rand(28, 38), rand(18, 28), rand(5, 12)];
        const total = vals.reduce((s, v) => s + v, 0);
        return DIFFICULTIES.map((d, i) => ({
          difficulty: d,
          event_count_pct: parseFloat((vals[i] / total * 100).toFixed(1)),
        }));
      })(),
      gameModeBreakdown: (() => {
        const vals = [rand(60, 78), rand(8, 18), rand(3, 10), rand(3, 8), rand(2, 6)];
        const total = vals.reduce((s, v) => s + v, 0);
        return GAME_MODES.map((m, i) => ({
          game_mode: m,
          event_count_pct: parseFloat((vals[i] / total * 100).toFixed(1)),
        }));
      })(),
      songModeBreakdown: (() => {
        const vals = [rand(65, 82), rand(10, 22), rand(5, 15)];
        const total = vals.reduce((s, v) => s + v, 0);
        return SONG_MODES.map((m, i) => ({
          song_mode: m,
          event_count_pct: parseFloat((vals[i] / total * 100).toFixed(1)),
        }));
      })(),
      interfaceBreakdown: (() => {
        const vals = [rand(70, 88), rand(10, 25), rand(1, 5)];
        const total = vals.reduce((s, v) => s + v, 0);
        return INTERFACES.map((iface, i) => ({
          interface: iface,
          event_count_pct: parseFloat((vals[i] / total * 100).toFixed(1)),
        }));
      })(),
      countryBreakdown: (() => {
        const vals = COUNTRIES.map(() => rand(5000, 120000));
        const total = vals.reduce((s, v) => s + v, 0);
        return COUNTRIES.map((c, i) => ({
          u_client_country: c,
          event_count_1d: vals[i],
          event_count_pct: parseFloat((vals[i] / total * 100).toFixed(1)),
        })).sort((a, b) => b.event_count_1d - a.event_count_1d);
      })(),
      genderBreakdown: [
        { u_fb_gender: "male", event_count_pct: randFloat(72, 82) },
        { u_fb_gender: "female", event_count_pct: randFloat(14, 22) },
        { u_fb_gender: "unknown", event_count_pct: randFloat(2, 8) },
      ],
    };
  });
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
export function formatNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

export function formatUSD(n: number): string {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toLocaleString();
}

export function getPackSlug(pack: string): string {
  return encodeURIComponent(pack);
}

export function getPackFromSlug(slug: string): string {
  return decodeURIComponent(slug);
}

// Suppress unused import warnings
void generateDates;
