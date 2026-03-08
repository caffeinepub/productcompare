import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, GitCompareArrows, Minus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Feature, Trim } from "../backend.d";
import { useTrimsByIds } from "../hooks/useQueries";

interface ComparePageProps {
  selectedTrimIds: bigint[];
  onRemoveFromCompare: (trimId: bigint) => void;
  onClearAll: () => void;
  onGoToModels: () => void;
}

function getAllFeatureNames(trims: Trim[]): string[] {
  const names = new Set<string>();
  for (const t of trims) {
    for (const f of t.features) {
      names.add(f.name);
    }
  }
  return Array.from(names);
}

function getFeature(trim: Trim, name: string): Feature | null {
  return trim.features.find((f) => f.name === name) ?? null;
}

function isBoolValue(value: string) {
  return value === "true" || value === "false";
}

function tryParseNumber(value: string): number | null {
  const n = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) ? null : n;
}

function FeatureCell({
  trim,
  featureName,
  isHighlighted,
}: {
  trim: Trim;
  featureName: string;
  isHighlighted: boolean;
}) {
  const feature = getFeature(trim, featureName);

  if (!feature) {
    return (
      <td className="px-4 py-3 text-center border-b border-border/30 bg-card/30">
        <Minus className="h-4 w-4 mx-auto text-muted-foreground/30" />
      </td>
    );
  }

  if (!feature.included) {
    return (
      <td className="px-4 py-3 text-center border-b border-border/30">
        <X className="h-4 w-4 mx-auto text-muted-foreground/40" />
      </td>
    );
  }

  if (isBoolValue(feature.value)) {
    return (
      <td
        className={`px-4 py-3 text-center border-b border-border/30 ${isHighlighted ? "bg-success/5" : ""}`}
      >
        <Check className="h-4 w-4 mx-auto feature-included" strokeWidth={2.5} />
      </td>
    );
  }

  // String/numeric value
  return (
    <td
      className={`px-4 py-3 text-center border-b border-border/30 text-sm font-medium text-foreground ${isHighlighted ? "bg-gold-subtle text-gold-bright font-semibold" : ""}`}
    >
      {feature.value}
    </td>
  );
}

// Determine which trim has the "best" value for a given feature row
function getBestTrimIndexForFeature(
  trims: Trim[],
  featureName: string,
): number | null {
  const values = trims.map((t) => {
    const f = getFeature(t, featureName);
    if (!f || !f.included) return null;
    return f.value;
  });

  // All booleans: highlight all included
  const included = values.filter((v) => v !== null);
  if (included.length <= 1) return null;

  // Numeric comparison: highlight the highest
  const nums = values.map((v) => (v ? tryParseNumber(v) : null));
  const hasNumbers = nums.some((n) => n !== null);
  if (hasNumbers) {
    const maxNum = Math.max(...(nums.filter((n) => n !== null) as number[]));
    const idx = nums.findIndex((n) => n === maxNum);
    // Only highlight if not all values are equal
    if (nums.filter((n) => n === maxNum).length < trims.length) {
      return idx;
    }
  }

  return null;
}

function EmptyState({ onGoToModels }: { onGoToModels: () => void }) {
  return (
    <div
      data-ocid="compare.empty_state"
      className="flex flex-col items-center justify-center py-32 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-surface-02 mb-6">
        <GitCompareArrows className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h2 className="font-display text-2xl font-black text-foreground mb-2">
        Nothing to compare yet
      </h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
        Add trims from the Models or Pricing pages to compare them side by side.
        You can select up to 4 trims.
      </p>
      <Button
        onClick={onGoToModels}
        className="bg-gold text-black hover:bg-gold-bright font-semibold gap-2"
      >
        Browse Models
      </Button>
    </div>
  );
}

export default function ComparePage({
  selectedTrimIds,
  onRemoveFromCompare,
  onClearAll,
  onGoToModels,
}: ComparePageProps) {
  const { data: trims, isLoading } = useTrimsByIds(selectedTrimIds);

  const featureNames = trims ? getAllFeatureNames(trims) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">
          Side-by-Side Analysis
        </p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground leading-none">
            Compare Trims
          </h1>
          {selectedTrimIds.length > 0 && (
            <Button
              data-ocid="compare.clear_all.button"
              variant="outline"
              className="shrink-0 border-border text-muted-foreground hover:text-destructive hover:border-destructive gap-2 text-sm"
              onClick={onClearAll}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
        </div>
        <div className="divider-gold mt-6 max-w-xs" />
      </motion.div>

      {/* Empty state */}
      {selectedTrimIds.length === 0 && (
        <EmptyState onGoToModels={onGoToModels} />
      )}

      {/* Loading */}
      {selectedTrimIds.length > 0 && isLoading && (
        <div className="space-y-4">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `200px repeat(${selectedTrimIds.length}, 1fr)`,
            }}
          >
            <Skeleton className="h-24 rounded-lg bg-surface-02" />
            {selectedTrimIds.map((id) => (
              <Skeleton
                key={id.toString()}
                className="h-24 rounded-lg bg-surface-02"
              />
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
            <Skeleton key={k} className="h-10 rounded-sm bg-surface-02" />
          ))}
        </div>
      )}

      {/* Comparison table */}
      {!isLoading && trims && trims.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ScrollArea className="w-full">
              <div className="min-w-max overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm border-collapse">
                  {/* Header: trim columns */}
                  <thead>
                    <tr className="border-b border-border bg-surface-02">
                      {/* Feature label column */}
                      <th className="sticky left-0 z-10 bg-surface-01 px-5 py-4 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground min-w-[180px] border-r border-border">
                        Feature
                      </th>

                      {/* Trim columns */}
                      {trims.map((trim, idx) => (
                        <th
                          key={trim.id.toString()}
                          className="px-4 py-4 min-w-[180px] border-r border-border/50 last:border-r-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-left">
                              <div className="font-display font-black text-base text-foreground leading-tight">
                                {trim.name}
                              </div>
                              <div className="price-display text-xl mt-0.5">
                                ${trim.price.toLocaleString()}
                              </div>
                              <div className="emi-display mt-0.5">
                                ${trim.monthlyEMI.toLocaleString()}/mo
                              </div>
                            </div>
                            <button
                              type="button"
                              data-ocid={`compare.remove_trim.button.${idx + 1}`}
                              onClick={() => onRemoveFromCompare(trim.id)}
                              className="shrink-0 h-6 w-6 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-03 transition-colors"
                              aria-label={`Remove ${trim.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {featureNames.map((featureName, rowIdx) => {
                      const bestIdx = getBestTrimIndexForFeature(
                        trims,
                        featureName,
                      );

                      return (
                        <tr
                          key={featureName}
                          className={
                            rowIdx % 2 === 0 ? "bg-card" : "bg-surface-01/40"
                          }
                        >
                          {/* Feature name */}
                          <td className="sticky left-0 z-10 bg-inherit px-5 py-3 text-sm text-muted-foreground border-r border-border border-b border-border/30 font-medium">
                            {featureName}
                          </td>

                          {/* Values per trim */}
                          {trims.map((trim, trimIdx) => (
                            <FeatureCell
                              key={trim.id.toString()}
                              trim={trim}
                              featureName={featureName}
                              isHighlighted={bestIdx === trimIdx}
                            />
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ScrollArea>

            {/* Footer note */}
            <p className="text-xs text-muted-foreground/50 mt-4 text-center">
              Highlighted cells indicate the best value in each row ·{" "}
              {featureNames.length} features compared
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  );
}
