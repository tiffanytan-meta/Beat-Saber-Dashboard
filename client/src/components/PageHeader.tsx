/*
 * PageHeader — Page title with description and optional background image
 */
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  bgImage?: string;
}

export default function PageHeader({ title, description, bgImage }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative mb-8 overflow-hidden rounded-xl"
    >
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
      )}
      <div className="relative z-10 py-2">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
