/*
 * DataTable — Styled data table with neon accents
 */
import { motion } from "framer-motion";

interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: Record<string, unknown>, index: number) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  title?: string;
  badge?: string;
}

export default function DataTable({ columns, data, title, badge }: DataTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-xl p-5"
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
          {badge && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan font-medium">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`
                    text-${col.align || "left"} py-3 px-4 border-b-2 border-border
                    text-[11px] uppercase tracking-wider text-muted-foreground font-semibold
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-secondary/50 transition-colors">
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`text-${col.align || "left"} py-2.5 px-4 border-b border-border/50 text-foreground`}
                  >
                    {col.render ? col.render(row[col.key], row, i) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
