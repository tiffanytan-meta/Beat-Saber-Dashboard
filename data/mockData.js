// ============================================================
// Beat Saber Analytics Dashboard — Mock Data
// Mirrors 5 Unidash tabs: Overview, Sales Overall, Individual
// Music Pack, Music Pack Release, Song Metrics
// ============================================================

const MUSIC_PACKS = [
  "Imagine Dragons", "Panic! At The Disco", "Green Day", "BTS",
  "Linkin Park", "The Weeknd", "Lady Gaga", "Fall Out Boy",
  "Billie Eilish", "Skrillex", "Timbaland", "Interscope Mixtape",
  "Monstercat Vol.1", "Rocket League"
];

const COUNTRIES = [
  "United States", "Germany", "United Kingdom", "Japan", "France",
  "Canada", "Australia", "South Korea", "Brazil", "Netherlands"
];

const SONGS = {
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

const DIFFICULTIES = ["Easy", "Normal", "Hard", "Expert", "Expert+"];
const GAME_MODES = ["Solo", "Party", "Multiplayer"];

// ---- Helper functions ----
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dec = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }
function generateMonths(startYear, startMonth, count) {
  const months = [];
  let y = startYear, m = startMonth;
  for (let i = 0; i < count; i++) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

const MONTHS_24 = generateMonths(2024, 1, 24);
const MONTHS_12 = MONTHS_24.slice(12);

// ============================================================
// 1. OVERVIEW DATA
// ============================================================
const overviewData = {
  // Active users (DAU, WAU, MAU) over 12 months
  activeUsers: {
    labels: MONTHS_12,
    dau: MONTHS_12.map(() => rand(180000, 320000)),
    wau: MONTHS_12.map(() => rand(600000, 1100000)),
    mau: MONTHS_12.map(() => rand(1800000, 3200000)),
  },
  // Stickiness (DAU/MAU)
  stickiness: {
    labels: MONTHS_12,
    values: MONTHS_12.map(() => randFloat(8, 18)),
  },
  // Attach rate over time
  attachRate: {
    labels: MONTHS_12,
    quest2: MONTHS_12.map(() => randFloat(22, 35)),
    quest3: MONTHS_12.map(() => randFloat(28, 42)),
    questPro: MONTHS_12.map(() => randFloat(15, 25)),
  },
  // Demographics
  genderDistribution: { male: 72, female: 22, other: 6 },
  ageDistribution: {
    labels: ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
    values: [12, 28, 32, 18, 7, 3],
  },
  // Summary KPIs
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
// 2. MUSIC PACK SALES OVERALL
// ============================================================
const salesOverallData = {
  // Overall sales trend (24 months)
  overallSales: {
    labels: MONTHS_24,
    revenue: MONTHS_24.map(() => rand(800000, 2200000)),
    units: MONTHS_24.map(() => rand(45000, 130000)),
  },
  // YoY cumulative
  yoyCumulative: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    year2024: [1.2, 2.5, 4.1, 5.8, 7.2, 9.0, 10.8, 12.9, 14.5, 16.8, 19.2, 21.5],
    year2025: [1.5, 3.1, 5.0, 7.1, 8.9, 11.2, 13.5, 15.8, 17.9, 20.1, 22.8, 25.2],
  },
  // Cumulative by music pack (all time, in thousands of units)
  cumulativeByPack: MUSIC_PACKS.map(p => ({
    name: p,
    units: rand(50, 680),
    revenue: rand(200, 2800),
  })).sort((a, b) => b.revenue - a.revenue),
  // Purchase rate by music pack
  purchaseRateByPack: MUSIC_PACKS.map(p => ({
    name: p,
    day1: randFloat(0.5, 3.5),
    week1: randFloat(2, 8),
    month1: randFloat(5, 15),
    overall: randFloat(8, 25),
  })),
  // Individual song sales (top 20)
  individualSongSales: (() => {
    const songs = [];
    for (const [pack, titles] of Object.entries(SONGS)) {
      for (const title of titles) {
        songs.push({ song: title, pack, units: rand(5000, 95000), revenue: rand(3000, 60000) });
      }
    }
    return songs.sort((a, b) => b.units - a.units).slice(0, 20);
  })(),
  // Revenue breakdown
  revenue1d: {
    labels: MONTHS_12,
    values: MONTHS_12.map(() => rand(25000, 85000)),
  },
  // Users with first IAP
  firstIAP: {
    labels: MONTHS_12,
    values: MONTHS_12.map(() => rand(8000, 32000)),
  },
  // KPIs
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
// 3. INDIVIDUAL MUSIC PACK
// ============================================================
const individualPackData = {};
MUSIC_PACKS.forEach(pack => {
  const releaseDate = `2023-${String(rand(1, 12)).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`;
  individualPackData[pack] = {
    releaseDate,
    // Sales over time
    sales: {
      labels: MONTHS_12,
      units: MONTHS_12.map(() => rand(2000, 18000)),
      revenue: MONTHS_12.map(() => rand(8000, 72000)),
    },
    // Purchasers
    purchasers: {
      labels: MONTHS_12,
      newPurchasers: MONTHS_12.map(() => rand(800, 8000)),
      repeatPurchasers: MONTHS_12.map(() => rand(100, 2000)),
    },
    // Gameplay %
    gameplayPct: randFloat(3, 18),
    // Purchase rates
    purchaseRate: {
      day1: randFloat(0.5, 4),
      week1: randFloat(2, 10),
      month1: randFloat(5, 18),
      overall: randFloat(8, 28),
    },
    // Gender breakdown
    genderBreakdown: {
      labels: ["Male", "Female", "Other"],
      values: [rand(60, 80), rand(15, 30), rand(3, 10)],
    },
    // Week 1 & 2 sales
    week1_2: { week1: rand(15000, 60000), week2: rand(8000, 35000) },
    // Single song purchases
    songPurchases: (SONGS[pack] || []).map(s => ({
      name: s,
      units: rand(1000, 25000),
      revenue: rand(500, 15000),
    })),
  };
});

// ============================================================
// 4. MUSIC PACK RELEASE
// ============================================================
const releaseData = {};
MUSIC_PACKS.forEach(pack => {
  const daysSinceRelease = Array.from({ length: 90 }, (_, i) => i + 1);
  releaseData[pack] = {
    // Sales N days since release
    salesSinceRelease: {
      labels: daysSinceRelease.filter((_, i) => i % 5 === 0),
      daily: daysSinceRelease.filter((_, i) => i % 5 === 0).map((d) =>
        Math.max(500, Math.floor(25000 * Math.exp(-d / 20) + rand(-1000, 1000)))
      ),
    },
    // Cumulative sales since release
    cumulativeSales: (() => {
      let cum = 0;
      return {
        labels: daysSinceRelease.filter((_, i) => i % 5 === 0),
        values: daysSinceRelease.filter((_, i) => i % 5 === 0).map((d) => {
          cum += Math.max(500, Math.floor(25000 * Math.exp(-d / 20)));
          return cum;
        }),
      };
    })(),
    // Before/After purchase rate (7D & 28D)
    beforeAfter: {
      day1_before7D: randFloat(1, 3),
      day1_after7D: randFloat(2, 5),
      day1_before28D: randFloat(1, 3),
      day1_after28D: randFloat(1.5, 4.5),
    },
    // New user first day avg revenue
    avgRevenue: {
      before7D: randFloat(0.15, 0.45),
      after7D: randFloat(0.25, 0.65),
      before28D: randFloat(0.15, 0.45),
      after28D: randFloat(0.20, 0.55),
    },
    // Songs sold since release
    songsSold: (SONGS[pack] || []).map(s => ({
      name: s,
      day7: rand(2000, 15000),
      day30: rand(8000, 45000),
      day90: rand(15000, 80000),
    })),
  };
});

// ============================================================
// 5. SONG METRICS
// ============================================================
const songMetricsData = {};
for (const [pack, songs] of Object.entries(SONGS)) {
  songs.forEach(song => {
    songMetricsData[`${pack} — ${song}`] = {
      pack,
      song,
      // Gameplay counts over 12 months
      gameplays: {
        labels: MONTHS_12,
        total: MONTHS_12.map(() => rand(50000, 500000)),
        unique: MONTHS_12.map(() => rand(20000, 200000)),
      },
      // Difficulty breakdown
      difficultyBreakdown: {
        labels: DIFFICULTIES,
        values: [rand(5, 15), rand(15, 25), rand(25, 35), rand(20, 30), rand(5, 15)],
      },
      // Game mode breakdown
      gameModeBreakdown: {
        labels: GAME_MODES,
        values: [rand(55, 75), rand(10, 25), rand(8, 20)],
      },
      // Completion rate by difficulty
      completionRate: {
        labels: DIFFICULTIES,
        values: [randFloat(92, 99), randFloat(85, 95), randFloat(70, 88), randFloat(50, 75), randFloat(25, 55)],
      },
      // Avg score by difficulty
      avgScore: {
        labels: DIFFICULTIES,
        values: DIFFICULTIES.map(() => rand(350000, 950000)),
      },
      // Country breakdown (top 5)
      countryBreakdown: COUNTRIES.slice(0, 5).map(c => ({
        country: c,
        gameplays: rand(10000, 120000),
        pctTotal: randFloat(5, 30),
      })),
    };
  });
}

// Export all data
window.BEAT_SABER_DATA = {
  MUSIC_PACKS,
  COUNTRIES,
  SONGS,
  DIFFICULTIES,
  GAME_MODES,
  overviewData,
  salesOverallData,
  individualPackData,
  releaseData,
  songMetricsData,
};
