/*
 * KpiCard — Neon-accented KPI display with animated count-up
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const GRADIENT_CLASSES = [
  "from-neon-cyan to-neon-blue",
  "from-neon-magenta to-neon-blue",
  "from-neon-cyan to-neon-green",
  "from-neon-green to-neon-cyan",
  "from-neon-amber to-neon-red",
  "from-neon-magenta to-neon-amber",
];

interface KpiCardProps {
  label: string;
  value: string;
  index?: number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
}

export default function KpiCard({ label, value, index = 0, change, changeType, subtitle }: KpiCardProps) {
  const gradientClass = GRADIENT_CLASSES[index % GRADIENT_CLASSES.length];
  const [displayValue, setDisplayValue] = useState("—");
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const timer = setTimeout(() => setDisplayValue(value), 100 + index * 80);
      return () => clearTimeout(timer);
    }
    setDisplayValue(value);
  }, [value, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="glass-card rounded-xl p-5 relative overflow-hidden group hover:glow-cyan transition-all duration-300"
    >
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradientClass}`} />

      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
        {label}
      </p>
      <p className="font-display text-2xl font-bold text-foreground transition-all duration-300">
        {displayValue}
      </p>
      {change && (
        <p className={`text-xs mt-1 font-medium ${
          changeType === "positive" ? "text-neon-green" :
          changeType === "negative" ? "text-neon-red" :
          "text-muted-foreground"
        }`}>
          {change}
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}
