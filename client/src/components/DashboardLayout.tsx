/*
 * DashboardLayout — Neon Arcade Design
 * Persistent sidebar with icon-based nav, glassmorphism cards, neon accents
 * Space Grotesk for display, DM Sans for body, JetBrains Mono for data
 */
import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, DollarSign, Music, Rocket, AudioWaveform,
  Menu, X, ChevronRight
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319088936/Xjt8uekCvgUMTbSr3yvdQX/sidebar-logo-RG2Thb2U5DoW3vsabgM9ZT.webp";

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
  section: string;
}

const navItems: NavItem[] = [
  { label: "Overview", icon: <BarChart3 size={18} />, path: "/", section: "Main" },
  { label: "Sales Overall", icon: <DollarSign size={18} />, path: "/sales", section: "Main" },
  { label: "Individual Pack", icon: <Music size={18} />, path: "/pack", section: "Music Packs" },
  { label: "Pack Release", icon: <Rocket size={18} />, path: "/release", section: "Music Packs" },
  { label: "Song Metrics", icon: <AudioWaveform size={18} />, path: "/songs", section: "Songs" },
];

function isActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === "/") return currentPath === "/";
  return currentPath.startsWith(itemPath);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = Array.from(new Set(navItems.map(n => n.section)));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[260px] z-50
          bg-sidebar border-r border-sidebar-border
          flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Beat Saber" className="w-9 h-9 rounded-lg" />
            <div>
              <h1 className="font-display text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                Beat Saber
              </h1>
              <p className="text-[11px] text-muted-foreground tracking-wider uppercase">
                Analytics Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map(section => (
            <div key={section} className="mb-4">
              <p className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground px-3 mb-2 font-medium">
                {section}
              </p>
              {navItems.filter(n => n.section === section).map(item => {
                const active = isActive(location, item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
                        text-sm font-medium transition-all duration-200 group
                        ${active
                          ? "bg-neon-cyan/10 text-neon-cyan"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className={`transition-colors ${active ? "text-neon-cyan" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {active && (
                        <ChevronRight size={14} className="ml-auto text-neon-cyan/60" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-[11px] text-muted-foreground">
            Data refreshed Mar 2026
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-[260px] min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="w-6 h-6 rounded" />
            <span className="font-display font-bold text-sm bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
              Beat Saber Analytics
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
