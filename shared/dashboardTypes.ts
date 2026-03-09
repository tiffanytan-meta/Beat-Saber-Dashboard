// ============================================================
// Shared types for dashboard data payloads
// Used by both server (upload validation) and client (display)
// ============================================================

/** Valid dashboard keys for data upload/retrieval */
export const DASHBOARD_KEYS = [
  "overview",
  "sales_overall",
  "individual_pack",
  "pack_release",
  "song_metrics",
] as const;

export type DashboardKey = (typeof DASHBOARD_KEYS)[number];

// ============================================================
// 1. OVERVIEW
// ============================================================
export interface OverviewPayload {
  activeUsers: {
    ds: string[];
    dap_cnt: number[];
    wap_cnt: number[];
    map_cnt: number[];
  };
  stickiness: {
    ds: string[];
    daily_stickiness: number[];
    weekly_stickiness: number[];
    monthly_stickiness: number[];
  };
  attachRate: {
    ds: string[];
    attach_rate_1d: number[];
    attach_rate_lifetime: number[];
  };
  genderDistribution: {
    u_fb_gender: string;
    bs_pct: number;
    quest_pct: number;
    delta: number;
  }[];
  ageDistribution: {
    u_fb_age_bucket: string;
    bs_pct: number;
    quest_pct: number;
    delta: number;
  }[];
  kpis: {
    map_cnt: string;
    dap_per_map: string;
    daily_stickiness: string;
    attach_rate_lifetime: string;
    lap_cnt: string;
    weekly_stickiness: string;
  };
}

// ============================================================
// 2. SALES OVERALL
// ============================================================
export interface SalesOverallPayload {
  salesTimeline: { ds: string[]; gross_revenue_usd_1d: number[] };
  yoyCumulative: {
    labels: string[];
    year2024: number[];
    year2025: number[];
  };
  cumulativeByPack: { music_pack_id: string; sales: number }[];
  purchaseRateByPack: {
    music_pack_id: string;
    attach_rate_l1: number;
    attach_rate_l7: number;
    attach_rate_l28: number;
    attach_rate_overall: number;
  }[];
  topSongSales: {
    levelid: string;
    music_pack_id: string;
    gross_revenue_usd_lifetime: number;
    distinct_rev_users_hyperlog_lifetime: number;
  }[];
  newIapUsers: {
    ds: string[];
    mass_entitled: number[];
    non_mass_entitled: number[];
  };
  kpis: {
    gross_revenue_usd_lifetime: string;
    distinct_rev_users_lifetime: string;
    avg_revenue_per_user: string;
    attach_rate_overall: string;
    top_music_pack: string;
    wow_growth: string;
  };
}

// ============================================================
// 3. INDIVIDUAL PACK (keyed by pack name)
// ============================================================
export interface IndividualPackItemPayload {
  release_date: string;
  sales: {
    ds: string[];
    gross_revenue_usd_1d: number[];
    distinct_rev_users_1d: number[];
  };
  purchasers: {
    ds: string[];
    new_iap_buyers: number[];
    mass_entitled_buyers: number[];
  };
  gameplay_pct: number;
  attach_rates: {
    attach_rate_l1: number;
    attach_rate_l7: number;
    attach_rate_l28: number;
    attach_rate_overall: number;
  };
  genderBreakdown: { u_fb_gender: string; event_count_pct: number }[];
  sales_windows: {
    sales_7d: number;
    sales_28d: number;
    sales_overall: number;
    bundles_overall: number;
  };
  songPurchases: {
    levelid: string;
    distinct_rev_users: number;
    gross_revenue_usd: number;
  }[];
}

export type IndividualPackPayload = Record<string, IndividualPackItemPayload>;

// ============================================================
// 4. PACK RELEASE (keyed by pack name)
// ============================================================
export interface ReleaseItemPayload {
  original_release_date: string;
  salesSinceRelease: {
    days_from_release: number[];
    gross_revenue_usd_1d: number[];
  };
  cumulativeSales: {
    days_from_release: number[];
    cumulative_sales: number[];
  };
  beforeAfter: {
    attach_rate_l1_before_7d: number;
    attach_rate_l1_after_7d: number;
    attach_rate_l1_before_28d: number;
    attach_rate_l1_after_28d: number;
  };
  avgRevenue: {
    avg_rev_before_7d: number;
    avg_rev_after_7d: number;
    avg_rev_before_28d: number;
    avg_rev_after_28d: number;
  };
  songsSold: {
    levelid: string;
    sales_7d: number;
    sales_30d: number;
    sales_90d: number;
  }[];
}

export type PackReleasePayload = Record<string, ReleaseItemPayload>;

// ============================================================
// 5. SONG METRICS (keyed by "Pack — Song")
// ============================================================
export interface SongMetricItemPayload {
  music_pack_id: string;
  levelid: string;
  gameplays: {
    ds: string[];
    event_count_1d: number[];
    unique_players: number[];
  };
  difficultyBreakdown: { difficulty: string; event_count_pct: number }[];
  gameModeBreakdown: { game_mode: string; event_count_pct: number }[];
  songModeBreakdown: { song_mode: string; event_count_pct: number }[];
  interfaceBreakdown: { interface: string; event_count_pct: number }[];
  countryBreakdown: {
    u_client_country: string;
    event_count_1d: number;
    event_count_pct: number;
  }[];
  genderBreakdown: { u_fb_gender: string; event_count_pct: number }[];
}

export type SongMetricsPayload = Record<string, SongMetricItemPayload>;

// ============================================================
// Upload request / response types
// ============================================================
export interface DataUploadRequest {
  dashboardKey: DashboardKey;
  payload: unknown;
  dataDate?: string;
}

export interface DataUploadResponse {
  success: boolean;
  dashboardKey: DashboardKey;
  message: string;
  uploadedAt: string;
}

export interface DataStatusResponse {
  dashboardKey: DashboardKey;
  hasData: boolean;
  lastUpdated: string | null;
  dataDate: string | null;
}
