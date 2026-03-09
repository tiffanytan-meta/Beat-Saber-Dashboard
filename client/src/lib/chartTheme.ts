// Recharts theme colors for Neon Arcade design
export const CHART_COLORS = {
  cyan: "#00e5ff",
  magenta: "#ff0080",
  blue: "#3d5afe",
  green: "#00e676",
  amber: "#ffab00",
  red: "#ff1744",
  purple: "#d500f9",
  teal: "#1de9b6",
  orange: "#ff6d00",
  lime: "#c6ff00",
};

export const CHART_PALETTE = [
  CHART_COLORS.cyan,
  CHART_COLORS.magenta,
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
  CHART_COLORS.orange,
  CHART_COLORS.lime,
];

export const AXIS_STYLE = {
  fontSize: 11,
  fill: "#6b7280",
  fontFamily: "'DM Sans', sans-serif",
};

export const GRID_STYLE = {
  stroke: "rgba(100, 116, 139, 0.12)",
  strokeDasharray: "3 3",
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "rgba(10, 15, 30, 0.95)",
    border: "1px solid rgba(0, 229, 255, 0.2)",
    borderRadius: "10px",
    padding: "12px 16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(12px)",
  },
  labelStyle: {
    color: "#e2e8f0",
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "13px",
    marginBottom: "4px",
  },
  itemStyle: {
    color: "#94a3b8",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px",
    padding: "2px 0",
  },
};
