/*
 * ChartCard — Glassmorphism chart container with neon accents
 */
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
  height?: string;
}

export default function ChartCard({ title, badge, children, className = "", height = "h-[300px]" }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        glass-card rounded-xl p-5
        hover:glow-cyan transition-shadow duration-300
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
        {badge && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className={height}>
        {children}
      </div>
    </motion.div>
  );
}
