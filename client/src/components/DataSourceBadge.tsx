import { Database, FlaskConical } from "lucide-react";

interface DataSourceBadgeProps {
  isFromApi: boolean;
  lastUpdated: string | null;
  dataDate: string | null;
  isLoading: boolean;
}

export default function DataSourceBadge({
  isFromApi,
  lastUpdated,
  dataDate,
  isLoading,
}: DataSourceBadgeProps) {
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground animate-pulse">
        Loading data...
      </div>
    );
  }

  if (isFromApi) {
    const updatedStr = lastUpdated
      ? new Date(lastUpdated).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
        <Database size={12} />
        <span>Live Data</span>
        {updatedStr && (
          <span className="text-emerald-400/60 ml-1">
            Updated {updatedStr}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
      <FlaskConical size={12} />
      <span>Synthetic Data</span>
      <span className="text-amber-400/60 ml-1">(demo mode)</span>
    </div>
  );
}
