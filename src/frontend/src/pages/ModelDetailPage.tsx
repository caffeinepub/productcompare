import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  GitCompareArrows,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Feature, Trim } from "../backend.d";
import { CarCategory } from "../backend.d";
import { useCarModel, useTrimsByCarModel } from "../hooks/useQueries";

interface ModelDetailPageProps {
  modelId: bigint;
  onBack: () => void;
  selectedTrimIds: bigint[];
  onAddToCompare: (trimId: bigint) => void;
  onRemoveFromCompare: (trimId: bigint) => void;
}

const CATEGORY_CONFIG: Record<
  CarCategory,
  { label: string; img: string; accentColor: string }
> = {
  [CarCategory.sedan]: {
    label: "Sedan",
    img: "/assets/generated/car-silhouette-sedan-transparent.dim_400x200.png",
    accentColor: "0.60 0.18 210",
  },
  [CarCategory.suv]: {
    label: "SUV",
    img: "/assets/generated/car-silhouette-suv-transparent.dim_400x200.png",
    accentColor: "0.62 0.16 160",
  },
  [CarCategory.hatchback]: {
    label: "Hatchback",
    img: "/assets/generated/car-silhouette-hatchback-transparent.dim_400x200.png",
    accentColor: "0.72 0.16 65",
  },
  [CarCategory.coupe]: {
    label: "Coupe",
    img: "/assets/generated/car-silhouette-coupe-transparent.dim_400x200.png",
    accentColor: "0.65 0.18 290",
  },
  [CarCategory.mpv]: {
    label: "MPV",
    img: "/assets/generated/car-silhouette-mpv-transparent.dim_400x200.png",
    accentColor: "0.60 0.20 27",
  },
};

function getCfg(cat: CarCategory | string) {
  return (
    CATEGORY_CONFIG[cat as CarCategory] ?? {
      label: String(cat).toUpperCase(),
      img: "/assets/generated/car-silhouette-sedan-transparent.dim_400x200.png",
      accentColor: "0.52 0.014 255",
    }
  );
}

function FeatureRow({ feature }: { feature: Feature }) {
  const isBool = feature.value === "true" || feature.value === "false";

  return (
    <div className="flex items-center justify-between py-2.5 px-4 border-b border-border/40 last:border-0 hover:bg-surface-02/40 transition-colors">
      <span className="text-sm text-muted-foreground">{feature.name}</span>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {feature.included ? (
          <Check
            className="h-4 w-4 feature-included shrink-0"
            strokeWidth={2.5}
          />
        ) : (
          <X className="h-4 w-4 feature-excluded shrink-0" />
        )}
        {!isBool && (
          <span className="text-sm font-medium text-foreground">
            {feature.value}
          </span>
        )}
      </div>
    </div>
  );
}

function TrimCard({
  trim,
  isActive,
  onSelect,
}: {
  trim: Trim;
  isSelected?: boolean;
  isActive: boolean;
  index?: number;
  onSelect: () => void;
  onAddToCompare?: () => void;
}) {
  const includedCount = trim.features.filter((f) => f.included).length;
  const totalCount = trim.features.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`trim-pill text-left flex flex-col gap-1 w-full sm:w-auto ${isActive ? "selected" : ""}`}
    >
      <span className="font-display font-bold text-base leading-none">
        {trim.name}
      </span>
      <span className="text-xs font-mono opacity-70">
        {includedCount}/{totalCount} features
      </span>
    </button>
  );
}

export default function ModelDetailPage({
  modelId,
  onBack,
  selectedTrimIds,
  onAddToCompare,
  onRemoveFromCompare,
}: ModelDetailPageProps) {
  const { data: model, isLoading: modelLoading } = useCarModel(modelId);
  const { data: trims, isLoading: trimsLoading } = useTrimsByCarModel(modelId);
  const [activeTrimId, setActiveTrimId] = useState<bigint | null>(null);

  const isLoading = modelLoading || trimsLoading;

  // Auto-select first trim when trims load
  const effectiveActiveTrimId =
    activeTrimId ?? (trims && trims.length > 0 ? trims[0].id : null);

  const activeTrim = trims?.find((t) => t.id === effectiveActiveTrimId) ?? null;
  const cfg = model ? getCfg(model.category) : getCfg(CarCategory.sedan);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <motion.button
        type="button"
        data-ocid="model_detail.back.button"
        onClick={onBack}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        All Models
      </motion.button>

      {isLoading && (
        <div className="space-y-6">
          <div className="flex gap-6 items-start">
            <Skeleton className="h-40 w-72 rounded-lg bg-surface-02" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64 bg-surface-02" />
              <Skeleton className="h-4 w-40 bg-surface-02" />
              <Skeleton className="h-16 w-full bg-surface-02" />
            </div>
          </div>
          <Skeleton className="h-80 w-full rounded-lg bg-surface-02" />
        </div>
      )}

      {!isLoading && model && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero section */}
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            {/* Car illustration */}
            <div
              className="relative flex items-center justify-center rounded-lg overflow-hidden h-52 lg:h-64 lg:w-96 shrink-0"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 65%, oklch(${cfg.accentColor} / 0.15) 0%, transparent 80%), oklch(var(--surface-02))`,
                border: "1px solid oklch(var(--border))",
              }}
            >
              <img
                src={cfg.img}
                alt={model.name}
                className="h-36 w-auto object-contain"
                style={{
                  filter: `drop-shadow(0 12px 32px oklch(${cfg.accentColor} / 0.4))`,
                }}
              />
              <span className="badge-category absolute top-3 left-3">
                {cfg.label}
              </span>
            </div>

            {/* Model info */}
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">
                {cfg.label} · {trims?.length ?? 0} Trims Available
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground leading-none mb-3">
                {model.name}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg mb-4">
                {model.tagline}
              </p>
              <p className="text-muted-foreground/70 text-sm leading-relaxed max-w-lg">
                {model.description}
              </p>
            </div>
          </div>

          {/* Trims section */}
          {trims && trims.length > 0 && (
            <div>
              <div className="mb-5">
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  Available Trims
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a trim to view its complete specification
                </p>
              </div>

              {/* Trim selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {trims.map((trim, index) => (
                  <TrimCard
                    key={trim.id.toString()}
                    trim={trim}
                    isSelected={selectedTrimIds.includes(trim.id)}
                    isActive={trim.id === effectiveActiveTrimId}
                    index={index}
                    onSelect={() => setActiveTrimId(trim.id)}
                    onAddToCompare={() => onAddToCompare(trim.id)}
                  />
                ))}
              </div>

              {/* Selected trim detail */}
              <AnimatePresence mode="wait">
                {activeTrim && (
                  <motion.div
                    key={activeTrim.id.toString()}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-lg border border-border bg-card overflow-hidden"
                  >
                    {/* Trim header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border bg-surface-02/40">
                      <div>
                        <h3 className="font-display text-2xl font-black text-foreground">
                          {model.name}{" "}
                          <span className="text-gold">{activeTrim.name}</span>
                        </h3>
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="price-display text-3xl">
                            ${activeTrim.price.toLocaleString()}
                          </span>
                          <span className="emi-display">
                            ${activeTrim.monthlyEMI.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>

                      {/* Add to compare */}
                      {selectedTrimIds.includes(activeTrim.id) ? (
                        <Button
                          data-ocid={`model_detail.add_to_compare.button.${trims.findIndex((t) => t.id === activeTrim.id) + 1}`}
                          variant="outline"
                          className="shrink-0 border-gold/50 text-gold hover:bg-gold-subtle gap-2"
                          onClick={() => onRemoveFromCompare(activeTrim.id)}
                        >
                          <GitCompareArrows className="h-4 w-4" />
                          Remove from Compare
                        </Button>
                      ) : (
                        <Button
                          data-ocid={`model_detail.add_to_compare.button.${trims.findIndex((t) => t.id === activeTrim.id) + 1}`}
                          className="shrink-0 bg-gold text-black hover:bg-gold-bright gap-2 font-semibold"
                          onClick={() => onAddToCompare(activeTrim.id)}
                        >
                          <GitCompareArrows className="h-4 w-4" />
                          Add to Compare
                        </Button>
                      )}
                    </div>

                    {/* Features list */}
                    <div className="divide-y-0">
                      {/* Feature category header */}
                      <div className="px-4 py-3 bg-surface-01/60">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Full Specifications ·{" "}
                          {activeTrim.features.filter((f) => f.included).length}{" "}
                          included
                        </span>
                      </div>

                      {activeTrim.features.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground text-sm">
                          No features listed for this trim.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2">
                          {activeTrim.features.map((feature) => (
                            <FeatureRow key={feature.name} feature={feature} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {trims && trims.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-lg bg-surface-02/30">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                No trims configured
              </h3>
              <p className="text-sm text-muted-foreground">
                This model has no trims set up yet.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </main>
  );
}
