import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-8xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page doesn't exist in the Beat Saber universe.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
            <Home size={16} />
            Back to Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}
