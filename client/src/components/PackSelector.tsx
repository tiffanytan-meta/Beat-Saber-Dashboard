/*
 * PackSelector — Dropdown for selecting music packs
 */
import { MUSIC_PACKS } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PackSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function PackSelector({ value, onChange, label = "Music Pack" }: PackSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[220px] bg-input border-border text-foreground">
          <SelectValue placeholder="Select a pack..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {MUSIC_PACKS.map(pack => (
            <SelectItem key={pack} value={pack} className="text-popover-foreground">
              {pack}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
