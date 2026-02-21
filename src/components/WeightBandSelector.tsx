import { Feather, Package, Dumbbell, Weight } from "lucide-react";
import { WEIGHT_BANDS, type WeightBand } from "@/config/pricingCalculator";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Feather,
  Package,
  Dumbbell,
  Weight,
};

interface WeightBandSelectorProps {
  value: string;
  onChange: (bandId: string) => void;
  error?: string;
}

const WeightBandSelector = ({ value, onChange, error }: WeightBandSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {WEIGHT_BANDS.map((band) => {
          const Icon = iconMap[band.icon] || Package;
          const isSelected = value === band.id;

          return (
            <button
              key={band.id}
              type="button"
              onClick={() => onChange(band.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card"
              )}
            >
              <Icon className={cn(
                "w-6 h-6",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-center">
                <p className={cn(
                  "font-semibold text-sm",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {band.label}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {band.range[0]}–{band.range[1]} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">
                  {band.reference}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default WeightBandSelector;
