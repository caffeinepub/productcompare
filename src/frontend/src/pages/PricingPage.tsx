import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, GitCompareArrows, Tag, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { CarModel, Trim } from "../backend.d";
import { CarCategory } from "../backend.d";
import { useAllCarModels, useTrimsByCarModel } from "../hooks/useQueries";

interface PricingPageProps {
  selectedTrimIds: bigint[];
  onAddToCompare: (trimId: bigint) => void;
  onRemoveFromCompare: (trimId: bigint) => void;
}

const CATEGORY_CONFIG: Record<CarCategory, { label: string; color: string }> = {
  [CarCategory.sedan]: { label: "Sedan", color: "0.60 0.18 210" },
  [CarCategory.suv]: { label: "SUV", color: "0.62 0.16 160" },
  [CarCategory.hatchback]: { label: "Hatchback", color: "0.72 0.16 65" },
  [CarCategory.coupe]: { label: "Coupe", color: "0.65 0.18 290" },
  [CarCategory.mpv]: { label: "MPV", color: "0.60 0.20 27" },
};

function getCategoryConfig(cat: CarCategory | string) {
  return (
    CATEGORY_CONFIG[cat as CarCategory] ?? {
      label: String(cat).toUpperCase(),
      color: "0.52 0.014 255",
    }
  );
}

// Separate component that fetches trims for a single model
function ModelPricingSection({
  model,
  globalIndex,
  selectedTrimIds,
  onAddToCompare,
  onRemoveFromCompare,
}: {
  model: CarModel;
  globalIndex: number;
  selectedTrimIds: bigint[];
  onAddToCompare: (trimId: bigint) => void;
  onRemoveFromCompare: (trimId: bigint) => void;
}) {
  const { data: trims, isLoading } = useTrimsByCarModel(model.id);
  const cfg = getCategoryConfig(model.category);

  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-6 w-40 bg-surface-02" />
          <Skeleton className="h-5 w-16 rounded-full bg-surface-02" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-64 rounded-lg bg-surface-02" />
          ))}
        </div>
      </div>
    );
  }

  if (!trims || trims.length === 0) return null;

  // Sort trims by price ascending
  const sortedTrims = [...trims].sort((a, b) => a.price - b.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: globalIndex * 0.05 }}
      className="mb-12"
    >
      {/* Model header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-2xl font-black text-foreground">
          {model.name}
        </h2>
        <span className="badge-category">{cfg.label}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {trims.length} trim{trims.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Trim pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedTrims.map((trim, trimIndex) => (
          <TrimPricingCard
            key={trim.id.toString()}
            trim={trim}
            model={model}
            absoluteIndex={globalIndex * 10 + trimIndex + 1}
            isSelected={selectedTrimIds.includes(trim.id)}
            onAddToCompare={() => onAddToCompare(trim.id)}
            onRemoveFromCompare={() => onRemoveFromCompare(trim.id)}
            accentColor={cfg.color}
          />
        ))}
      </div>

      <div className="divider-gold mt-8 opacity-50" />
    </motion.div>
  );
}

function TrimPricingCard({
  trim,
  model,
  absoluteIndex,
  isSelected,
  onAddToCompare,
  onRemoveFromCompare,
  accentColor,
}: {
  trim: Trim;
  model: CarModel;
  absoluteIndex: number;
  isSelected: boolean;
  onAddToCompare: () => void;
  onRemoveFromCompare: () => void;
  accentColor: string;
}) {
  const topFeatures = trim.features.filter((f) => f.included).slice(0, 4);

  return (
    <div
      className="card-auto rounded-lg flex flex-col overflow-hidden"
      style={
        isSelected
          ? {
              borderColor: "oklch(var(--gold) / 0.6)",
              boxShadow:
                "0 0 0 1px oklch(var(--gold) / 0.2), 0 8px 24px oklch(0 0 0 / 0.3)",
            }
          : {}
      }
    >
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, oklch(${accentColor}), transparent)`,
        }}
      />

      <div className="p-4 flex flex-col flex-1 gap-4">
        {/* Trim header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-display text-base font-black text-foreground leading-tight">
              {trim.name}
            </span>
            {isSelected && (
              <span className="shrink-0 text-xs font-semibold text-gold bg-gold-subtle border border-gold/30 rounded-sm px-1.5 py-0.5">
                Selected
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70">{model.name}</p>
        </div>

        {/* Pricing */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="price-display text-2xl">
              ${trim.price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp className="h-3 w-3 text-gold/70" />
            <span className="emi-display">
              ${trim.monthlyEMI.toLocaleString()}/mo
            </span>
          </div>
        </div>

        {/* Top features */}
        {topFeatures.length > 0 && (
          <div className="flex flex-col gap-1.5 flex-1">
            {topFeatures.map((feature) => (
              <div
                key={feature.name}
                className="flex items-center gap-2 text-xs"
              >
                <Check
                  className="h-3 w-3 text-success shrink-0"
                  strokeWidth={2.5}
                />
                <span className="text-muted-foreground leading-tight">
                  {feature.name}
                  {feature.value !== "true" && feature.value !== "false" && (
                    <span className="text-foreground/70 ml-1">
                      · {feature.value}
                    </span>
                  )}
                </span>
              </div>
            ))}
            {trim.features.filter((f) => f.included).length > 4 && (
              <span className="text-xs text-muted-foreground/50 mt-0.5">
                +{trim.features.filter((f) => f.included).length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Compare button */}
        <div className="mt-auto pt-2">
          {isSelected ? (
            <Button
              data-ocid={`pricing.add_compare.button.${absoluteIndex}`}
              variant="outline"
              className="w-full text-xs border-gold/50 text-gold hover:bg-gold-subtle gap-1.5 h-8"
              onClick={onRemoveFromCompare}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              Remove
            </Button>
          ) : (
            <Button
              data-ocid={`pricing.add_compare.button.${absoluteIndex}`}
              variant="ghost"
              className="w-full text-xs border border-border hover:border-gold/40 hover:text-gold hover:bg-gold-subtle gap-1.5 h-8"
              onClick={onAddToCompare}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              Add to Compare
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div data-ocid="pricing.loading_state" className="space-y-10">
      {[1, 2].map((section) => (
        <div key={section}>
          <Skeleton className="h-7 w-48 mb-4 bg-surface-02" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((card) => (
              <Skeleton key={card} className="h-64 rounded-lg bg-surface-02" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PricingPage({
  selectedTrimIds,
  onAddToCompare,
  onRemoveFromCompare,
}: PricingPageProps) {
  const { data: models, isLoading } = useAllCarModels();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">
          Pricing & Trims
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground leading-none">
          All Models & Trims
        </h1>
        <p className="text-muted-foreground mt-3 max-w-lg">
          Compare pricing across all models and trim levels. Add trims to your
          comparison to evaluate them side by side.
        </p>
        <div className="divider-gold mt-6 max-w-xs" />
      </motion.div>

      {/* Summary bar */}
      {selectedTrimIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 px-4 py-3 rounded-lg border border-gold/30 bg-gold-subtle"
        >
          <Tag className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-gold-bright">
            {selectedTrimIds.length} trim
            {selectedTrimIds.length !== 1 ? "s" : ""} selected for comparison
          </span>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && <LoadingSkeleton />}

      {/* Models with trims */}
      {!isLoading && models && (
        <div>
          {models.map((model, index) => (
            <ModelPricingSection
              key={model.id.toString()}
              model={model}
              globalIndex={index}
              selectedTrimIds={selectedTrimIds}
              onAddToCompare={onAddToCompare}
              onRemoveFromCompare={onRemoveFromCompare}
            />
          ))}
        </div>
      )}
    </main>
  );
}
