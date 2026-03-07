import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Minus, X } from "lucide-react";
import type { Variant } from "../../backend.d";

interface ComparisonDialogProps {
  open: boolean;
  onClose: () => void;
  variants: Variant[];
}

function getAllFeatureNames(variants: Variant[]): string[] {
  const names = new Set<string>();
  for (const v of variants) {
    for (const f of v.features) {
      names.add(f.name);
    }
  }
  return Array.from(names);
}

function getFeatureForVariant(variant: Variant, featureName: string) {
  return variant.features.find((f) => f.name === featureName) ?? null;
}

function FeatureCell({
  variant,
  featureName,
}: { variant: Variant; featureName: string }) {
  const feature = getFeatureForVariant(variant, featureName);

  if (!feature) {
    return (
      <td className="px-4 py-3 text-center">
        <Minus className="h-4 w-4 mx-auto text-muted-foreground/40" />
      </td>
    );
  }

  if (feature.included && feature.value === "true") {
    return (
      <td className="px-4 py-3 text-center">
        <Check className="h-5 w-5 mx-auto feature-check font-bold" />
      </td>
    );
  }

  if (!feature.included && feature.value === "false") {
    return (
      <td className="px-4 py-3 text-center">
        <X className="h-4 w-4 mx-auto text-muted-foreground/50" />
      </td>
    );
  }

  // String value
  return (
    <td className="px-4 py-3 text-center text-sm font-medium text-foreground">
      {feature.value}
    </td>
  );
}

export default function ComparisonDialog({
  open,
  onClose,
  variants,
}: ComparisonDialogProps) {
  const featureNames = getAllFeatureNames(variants);

  if (variants.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="compare.dialog"
        className="max-w-5xl w-[95vw] p-0 overflow-hidden rounded-2xl"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="font-display text-2xl font-700 text-foreground">
              Compare Variants
            </DialogTitle>
            <Button
              data-ocid="compare.close_button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 rounded-full h-8 w-8"
              aria-label="Close comparison"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Comparing {variants.length} variant
            {variants.length !== 1 ? "s" : ""} side by side
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm border-collapse">
              {/* Header row: variant names */}
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="sticky left-0 bg-muted/40 px-6 py-4 text-left font-display font-700 text-base text-foreground min-w-[160px] border-r border-border">
                    Feature
                  </th>
                  {variants.map((v, idx) => (
                    <th
                      key={v.id.toString()}
                      className={`px-4 py-4 text-center min-w-[160px] ${idx === 0 ? "compare-column-highlight" : ""}`}
                    >
                      <div className="font-display font-700 text-base text-foreground">
                        {v.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Price row */}
                <tr className="border-b border-border bg-teal-light/30">
                  <td className="sticky left-0 bg-teal-light/50 px-6 py-4 font-600 text-foreground border-r border-border">
                    Price
                  </td>
                  {variants.map((v, idx) => (
                    <td
                      key={v.id.toString()}
                      className={`px-4 py-4 text-center ${idx === 0 ? "compare-column-highlight" : ""}`}
                    >
                      <span className="font-display font-800 text-lg text-amber">
                        ${v.price.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Feature rows */}
                {featureNames.map((name, i) => (
                  <tr
                    key={name}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${
                      i % 2 === 0 ? "" : "bg-surface"
                    }`}
                  >
                    <td className="sticky left-0 bg-background px-6 py-3 text-muted-foreground text-sm border-r border-border">
                      {name}
                    </td>
                    {variants.map((v) => (
                      <FeatureCell
                        key={v.id.toString()}
                        variant={v}
                        featureName={name}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button
            data-ocid="compare.close_button"
            variant="outline"
            onClick={onClose}
          >
            Close Comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
