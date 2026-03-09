// ============================================================
// Data Service Layer
// Fetches dashboard data from the backend API.
// Falls back to synthetic data (from data.ts) when API has no data.
// ============================================================

import { trpc } from "./trpc";
import type { DashboardKey } from "@shared/dashboardTypes";
import type {
  OverviewData,
  SalesOverallData,
  IndividualPackItem,
  ReleaseItem,
  SongMetricItem,
} from "./data";
import {
  overviewData as syntheticOverview,
  salesOverallData as syntheticSales,
  individualPackData as syntheticPack,
  releaseData as syntheticRelease,
  songMetricsData as syntheticSongMetrics,
} from "./data";

/** Hook to get overview data — tries API first, falls back to synthetic */
export function useOverviewData() {
  const query = trpc.dashboard.getData.useQuery({ dashboardKey: "overview" });

  const data: OverviewData =
    query.data?.hasData && query.data.payload
      ? (query.data.payload as OverviewData)
      : syntheticOverview;

  return {
    data,
    isLoading: query.isLoading,
    isFromApi: query.data?.hasData ?? false,
    lastUpdated: query.data?.lastUpdated ?? null,
    dataDate: query.data?.dataDate ?? null,
  };
}

/** Hook to get sales overall data */
export function useSalesOverallData() {
  const query = trpc.dashboard.getData.useQuery({ dashboardKey: "sales_overall" });

  const data: SalesOverallData =
    query.data?.hasData && query.data.payload
      ? (query.data.payload as SalesOverallData)
      : syntheticSales;

  return {
    data,
    isLoading: query.isLoading,
    isFromApi: query.data?.hasData ?? false,
    lastUpdated: query.data?.lastUpdated ?? null,
    dataDate: query.data?.dataDate ?? null,
  };
}

/** Hook to get individual pack data */
export function useIndividualPackData() {
  const query = trpc.dashboard.getData.useQuery({ dashboardKey: "individual_pack" });

  const data: Record<string, IndividualPackItem> =
    query.data?.hasData && query.data.payload
      ? (query.data.payload as Record<string, IndividualPackItem>)
      : syntheticPack;

  return {
    data,
    isLoading: query.isLoading,
    isFromApi: query.data?.hasData ?? false,
    lastUpdated: query.data?.lastUpdated ?? null,
    dataDate: query.data?.dataDate ?? null,
  };
}

/** Hook to get pack release data */
export function usePackReleaseData() {
  const query = trpc.dashboard.getData.useQuery({ dashboardKey: "pack_release" });

  const data: Record<string, ReleaseItem> =
    query.data?.hasData && query.data.payload
      ? (query.data.payload as Record<string, ReleaseItem>)
      : syntheticRelease;

  return {
    data,
    isLoading: query.isLoading,
    isFromApi: query.data?.hasData ?? false,
    lastUpdated: query.data?.lastUpdated ?? null,
    dataDate: query.data?.dataDate ?? null,
  };
}

/** Hook to get song metrics data */
export function useSongMetricsData() {
  const query = trpc.dashboard.getData.useQuery({ dashboardKey: "song_metrics" });

  const data: Record<string, SongMetricItem> =
    query.data?.hasData && query.data.payload
      ? (query.data.payload as Record<string, SongMetricItem>)
      : syntheticSongMetrics;

  return {
    data,
    isLoading: query.isLoading,
    isFromApi: query.data?.hasData ?? false,
    lastUpdated: query.data?.lastUpdated ?? null,
    dataDate: query.data?.dataDate ?? null,
  };
}

/** Hook to get status of all dashboards */
export function useDashboardStatus() {
  return trpc.dashboard.getStatus.useQuery();
}
