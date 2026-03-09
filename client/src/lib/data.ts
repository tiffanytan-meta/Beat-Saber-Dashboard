// ============================================================
// Beat Saber Analytics Dashboard — Data Layer
// Deterministic mock data (seeded) for consistent rendering
// ============================================================

// Seeded random for deterministic data
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

export const MUSIC_PACKS = [
  "Imagine Dragons", "Panic! At The Disco", "Green Day", "BTS",
  "Linkin Park", "The Weeknd", "Lady Gaga", "Fall Out Boy",
  "Billie Eilish", "Skrillex", "Timbaland", "Interscope Mixtape",
  "Monstercat Vol.1", "Rocket League"
];

export const COUNTRIES = [
  "United States", "Germany", "United Kingdom", "Japan", "France",
  "Canada", "Australia", "South Korea", "Brazil", "Netherlands"
];

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

export const DIFFICULTIES = ["Easy", "Normal", "Hard", "Expert", "Expert+"];
export const GAME_MODES = ["Solo", "Party", "Multiplayer"];

const MONTHS_24 = generateMonths(2024, 1, 24);
const MONTHS_12 = MONTHS_24.slice(12);

// ============================================================
// 1. OVERVIEW DATA
// ============================================================
export interface OverviewData {
  activeUsers: { labels: string[]; dau: number[]; wau: number[]; mau: number[] };
  stickiness: { labels: string[]; values: number[] };
  attachRate: { labels: string[]; quest2: number[]; quest3: number[]; questPro: number[] };
  genderDistribution: { male: number; female: number; other: number };
  ageDistribution: { labels: string[]; values: number[] };
  kpis: {
    totalMAU: string; dauMauRatio: string; avgSessionMin: string;
    attachRateQ3: string; totalPlayers: string; avgSongsPerSession: string;
  };
}

export const overviewData: OverviewData = {
  activeUsers: {
    labels: MONTHS_12,
    dau: MONTHS_12.map(() => rand(180000, 320000)),
    wau: MONTHS_12.map(() => rand(600000, 1100000)),
    mau: MONTHS_12.map(() => rand(1800000, 3200000)),
  },
  stickiness: {
    labels: MONTHS_12,
    values: MONTHS_12.map(() => randFloat(8, 18)),
  },
  attachRate: {
    labels: MONTHS_12,
    quest2: MONTHS_12.map(() => randFloat(22, 35)),
    quest3: MONTHS_12.map(() => randFloat(28, 42)),
    questPro: MONTHS_12.map(() => randFloat(15, 25)),
  },
  genderDistribution: { male: 72, female: 22, other: 6 },
  ageDistribution: {
    labels: ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
    values: [12, 28, 32, 18, 7, 3],
  },
  kpis: {
    totalMAU: "2.8M",
    dauMauRatio: "14.2%",
    avgSessionMin: "32",
    attachRateQ3: "36.1%",
    totalPlayers: "15.4M",
    avgSongsPerSession: "6.3"
  }
};

// ============================================================
// 2. SALES OVERALL DATA
// ============================================================
export interface SalesOverallData {
  overallSales: { labels: string[]; revenue: number[]; units: number[] };
  yoyCumulative: { labels: string[]; year2024: number[]; year2025: number[] };
  cumulativeByPack: { name: string; units: number; revenue: number }[];
  purchaseRateByPack: { name: string; day1: number; week1: number; month1: number; overall: number }[];
  individualSongSales: { song: string; pack: string; units: number; revenue: number }[];
  revenue1d: { labels: string[]; values: number[] };
  kpis: {
    totalRevenue: string; totalUnitsSold: string; avgRevenuePerUser: string;
    purchaseRate: string; topPack: string; weekOverWeekGrowth: string;
  };
}

export const salesOverallData: SalesOverallData = {
  overallSales: {
    labels: MONTHS_24,
    revenue: MONTHS_24.map(() => rand(800000, 2200000)),
    units: MONTHS_24.map(() => rand(45000, 130000)),
  },
  yoyCumulative: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    year2024: [1.2, 2.5, 4.1, 5.8, 7.2, 9.0, 10.8, 12.9, 14.5, 16.8, 19.2, 21.5],
    year2025: [1.5, 3.1, 5.0, 7.1, 8.9, 11.2, 13.5, 15.8, 17.9, 20.1, 22.8, 25.2],
  },
  cumulativeByPack: MUSIC_PACKS.map(p => ({
    name: p,
    units: rand(50, 680),
    revenue: rand(200, 2800),
  })).sort((a, b) => b.revenue - a.revenue),
  purchaseRateByPack: MUSIC_PACKS.map(p => ({
    name: p,
    day1: randFloat(0.5, 3.5),
    week1: randFloat(2, 8),
    month1: randFloat(5, 15),
    overall: randFloat(8, 25),
  })),
  individualSongSales: (() => {
    const songs: { song: string; pack: string; units: number; revenue: number }[] = [];
    for (const [pack, titles] of Object.entries(SONGS)) {
      for (const title of titles) {
        songs.push({ song: title, pack, units: rand(5000, 95000), revenue: rand(3000, 60000) });
      }
    }
    return songs.sort((a, b) => b.units - a.units).slice(0, 20);
  })(),
  revenue1d: {
    labels: MONTHS_12,
    values: MONTHS_12.map(() => rand(25000, 85000)),
  },
  kpis: {
    totalRevenue: "$23.8M",
    totalUnitsSold: "1.42M",
    avgRevenuePerUser: "$8.45",
    purchaseRate: "12.6%",
    topPack: "Imagine Dragons",
    weekOverWeekGrowth: "+3.2%"
  }
};

// ============================================================
// 3. INDIVIDUAL MUSIC PACK DATA
// ============================================================
export interface IndividualPackItem {
  releaseDate: string;
  sales: { labels: string[]; units: number[]; revenue: number[] };
  purchasers: { labels: string[]; newPurchasers: number[]; repeatPurchasers: number[] };
  gameplayPct: number;
  purchaseRate: { day1: number; week1: number; month1: number; overall: number };
  genderBreakdown: { labels: string[]; values: number[] };
  week1_2: { week1: number; week2: number };
  songPurchases: { name: string; units: number; revenue: number }[];
}

export const individualPackData: Record<string, IndividualPackItem> = {};
MUSIC_PACKS.forEach(pack => {
  const releaseDate = `2023-${String(rand(1, 12)).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`;
  individualPackData[pack] = {
    releaseDate,
    sales: {
      labels: MONTHS_12,
      units: MONTHS_12.map(() => rand(2000, 18000)),
      revenue: MONTHS_12.map(() => rand(8000, 72000)),
    },
    purchasers: {
      labels: MONTHS_12,
      newPurchasers: MONTHS_12.map(() => rand(800, 8000)),
      repeatPurchasers: MONTHS_12.map(() => rand(100, 2000)),
    },
    gameplayPct: randFloat(3, 18),
    purchaseRate: {
      day1: randFloat(0.5, 4),
      week1: randFloat(2, 10),
      month1: randFloat(5, 18),
      overall: randFloat(8, 28),
    },
    genderBreakdown: {
      labels: ["Male", "Female", "Other"],
      values: [rand(60, 80), rand(15, 30), rand(3, 10)],
    },
    week1_2: { week1: rand(15000, 60000), week2: rand(8000, 35000) },
    songPurchases: (SONGS[pack] || []).map(s => ({
      name: s,
      units: rand(1000, 25000),
      revenue: rand(500, 15000),
    })),
  };
});

// ============================================================
// 4. MUSIC PACK RELEASE DATA
// ============================================================
export interface ReleaseItem {
  salesSinceRelease: { labels: number[]; daily: number[] };
  cumulativeSales: { labels: number[]; values: number[] };
  beforeAfter: {
    day1_before7D: number; day1_after7D: number;
    day1_before28D: number; day1_after28D: number;
  };
  avgRevenue: {
    before7D: number; after7D: number;
    before28D: number; after28D: number;
  };
  songsSold: { name: string; day7: number; day30: number; day90: number }[];
}

export const releaseData: Record<string, ReleaseItem> = {};
MUSIC_PACKS.forEach(pack => {
  const daysSinceRelease = Array.from({ length: 90 }, (_, i) => i + 1);
  const filteredDays = daysSinceRelease.filter((_, i) => i % 5 === 0);
  releaseData[pack] = {
    salesSinceRelease: {
      labels: filteredDays,
      daily: filteredDays.map((d) =>
        Math.max(500, Math.floor(25000 * Math.exp(-d / 20) + (rng() * 2000 - 1000)))
      ),
    },
    cumulativeSales: (() => {
      let cum = 0;
      return {
        labels: filteredDays,
        values: filteredDays.map((d) => {
          cum += Math.max(500, Math.floor(25000 * Math.exp(-d / 20)));
          return cum;
        }),
      };
    })(),
    beforeAfter: {
      day1_before7D: randFloat(1, 3),
      day1_after7D: randFloat(2, 5),
      day1_before28D: randFloat(1, 3),
      day1_after28D: randFloat(1.5, 4.5),
    },
    avgRevenue: {
      before7D: randFloat(0.15, 0.45),
      after7D: randFloat(0.25, 0.65),
      before28D: randFloat(0.15, 0.45),
      after28D: randFloat(0.20, 0.55),
    },
    songsSold: (SONGS[pack] || []).map(s => ({
      name: s,
      day7: rand(2000, 15000),
      day30: rand(8000, 45000),
      day90: rand(15000, 80000),
    })),
  };
});

// ============================================================
// 5. SONG METRICS DATA
// ============================================================
export interface SongMetricItem {
  pack: string;
  song: string;
  gameplays: { labels: string[]; total: number[]; unique: number[] };
  difficultyBreakdown: { labels: string[]; values: number[] };
  gameModeBreakdown: { labels: string[]; values: number[] };
  completionRate: { labels: string[]; values: number[] };
  countryBreakdown: { country: string; gameplays: number; pctTotal: number }[];
}

export const songMetricsData: Record<string, SongMetricItem> = {};
for (const [pack, songs] of Object.entries(SONGS)) {
  songs.forEach(song => {
    songMetricsData[`${pack} — ${song}`] = {
      pack,
      song,
      gameplays: {
        labels: MONTHS_12,
        total: MONTHS_12.map(() => rand(50000, 500000)),
        unique: MONTHS_12.map(() => rand(20000, 200000)),
      },
      difficultyBreakdown: {
        labels: DIFFICULTIES,
        values: [rand(5, 15), rand(15, 25), rand(25, 35), rand(20, 30), rand(5, 15)],
      },
      gameModeBreakdown: {
        labels: GAME_MODES,
        values: [rand(55, 75), rand(10, 25), rand(8, 20)],
      },
      completionRate: {
        labels: DIFFICULTIES,
        values: [randFloat(92, 99), randFloat(85, 95), randFloat(70, 88), randFloat(50, 75), randFloat(25, 55)],
      },
      countryBreakdown: COUNTRIES.slice(0, 5).map(c => ({
        country: c,
        gameplays: rand(10000, 120000),
        pctTotal: randFloat(5, 30),
      })),
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
