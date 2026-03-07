import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Check,
  GitCompare,
  Loader2,
  Package,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Variant } from "../backend.d";
import ComparisonDialog from "../components/app/ComparisonDialog";
import NavBar from "../components/app/NavBar";
import { useProduct, useVariantsByProduct } from "../hooks/useQueries";

interface ProductDetailPageProps {
  productId: bigint;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Software: "bg-teal-light text-teal border-0",
  Hardware: "bg-amber-light text-amber border-0",
  SaaS: "bg-teal-light text-teal border-0",
  Electronics: "bg-amber-light text-amber border-0",
  Services: "bg-success-light text-success border-0",
};

function categoryClass(cat: string) {
  return (
    CATEGORY_COLORS[cat] ?? "bg-secondary text-secondary-foreground border-0"
  );
}

function VariantCard({
  variant,
  index,
  isSelected,
  onToggle,
}: {
  variant: Variant;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const ocid = `variant.item.${index + 1}` as const;
  const checkOcid = `variant.checkbox.${index + 1}` as const;

  return (
    <motion.article
      data-ocid={ocid}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
        isSelected
          ? "border-teal bg-teal-light/20 shadow-lg shadow-teal/10"
          : "border-border bg-card hover:border-teal/40"
      }`}
    >
      {/* Selection indicator bar */}
      {isSelected && <div className="h-1 w-full bg-teal" />}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-700 text-foreground truncate">
              {variant.name}
            </h3>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-display text-2xl font-800 text-amber">
                ${variant.price.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
          </div>

          {/* Compare checkbox */}
          <div className="flex items-center gap-2 shrink-0">
            <Label
              htmlFor={checkOcid}
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Compare
            </Label>
            <Checkbox
              id={checkOcid}
              data-ocid={checkOcid}
              checked={isSelected}
              onCheckedChange={onToggle}
              className="h-5 w-5 border-2 data-[state=checked]:bg-teal data-[state=checked]:border-teal"
            />
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {variant.features.map((feature) => {
            const isIncluded = feature.included;
            const isBoolean =
              feature.value === "true" || feature.value === "false";

            return (
              <li
                key={feature.name}
                className={`flex items-center justify-between gap-3 text-sm py-1 border-b border-border/40 last:border-0 ${
                  !isIncluded ? "opacity-50" : ""
                }`}
              >
                <span className="text-foreground/80 truncate">
                  {feature.name}
                </span>
                <span className="shrink-0 flex items-center gap-1">
                  {isBoolean ? (
                    isIncluded ? (
                      <Check className="h-4 w-4 feature-check" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50" />
                    )
                  ) : (
                    <span className="font-medium text-foreground text-xs bg-muted px-2 py-0.5 rounded-full">
                      {feature.value}
                    </span>
                  )}
                </span>
              </li>
            );
          })}

          {variant.features.length === 0 && (
            <li className="text-xs text-muted-foreground italic py-2">
              No features listed
            </li>
          )}
        </ul>
      </div>
    </motion.article>
  );
}

function VariantSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-8 w-1/3" />
        </div>
        <Skeleton className="h-5 w-5 rounded shrink-0" />
      </div>
      <div className="space-y-2">
        {["f1", "f2", "f3", "f4"].map((k) => (
          <Skeleton key={k} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailPage({
  productId,
  onBack,
}: ProductDetailPageProps) {
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(
    new Set(),
  );
  const [compareOpen, setCompareOpen] = useState(false);

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: variants, isLoading: variantsLoading } =
    useVariantsByProduct(productId);

  const isLoading = productLoading || variantsLoading;

  function toggleVariant(id: bigint) {
    const key = id.toString();
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function openComparison() {
    if (selectedVariantIds.size < 2) {
      toast.error("Select at least 2 variants to compare");
      return;
    }
    setCompareOpen(true);
  }

  const selectedVariants: Variant[] =
    variants?.filter((v) => selectedVariantIds.has(v.id.toString())) ?? [];

  return (
    <>
      <NavBar onLogoClick={onBack} />

      <main
        data-ocid="product.page"
        className="container mx-auto px-4 sm:px-6 py-10"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button
            data-ocid="product.back_button"
            variant="ghost"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>
        </motion.div>

        {/* Product info */}
        {isLoading ? (
          <div className="mb-10 space-y-3">
            <Skeleton className="h-10 w-2/3 max-w-md" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-5 w-full max-w-lg" />
            <Skeleton className="h-5 w-5/6 max-w-md" />
          </div>
        ) : product ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-light shrink-0">
                <Package className="h-7 w-7 text-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="font-display text-3xl sm:text-4xl font-800 tracking-tight text-foreground">
                    {product.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={categoryClass(product.category)}
                  >
                    {product.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {product.description}
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Variants section */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl font-700 text-foreground">
              Available Variants
            </h2>
            {!isLoading && variants && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {variants.length} variant{variants.length !== 1 ? "s" : ""}{" "}
                available
                {selectedVariantIds.size > 0 && (
                  <>
                    {" "}
                    &middot;{" "}
                    <span className="text-teal font-medium">
                      {selectedVariantIds.size} selected for comparison
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          <Button
            data-ocid="compare.open_modal_button"
            onClick={openComparison}
            disabled={selectedVariantIds.size < 2 || isLoading}
            className="gap-2 bg-teal text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <GitCompare className="h-4 w-4" />
            Compare Variants
            {selectedVariantIds.size >= 2 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {selectedVariantIds.size}
              </span>
            )}
          </Button>
        </div>

        {/* Variant cards grid */}
        {isLoading && (
          <div
            data-ocid="catalog.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {["v1", "v2", "v3"].map((k) => (
              <VariantSkeleton key={k} />
            ))}
          </div>
        )}

        {!isLoading && variants && variants.length === 0 && (
          <div
            data-ocid="catalog.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-600 text-foreground mb-2">
              No variants yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              This product doesn't have any variants configured.
            </p>
          </div>
        )}

        {!isLoading && variants && variants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {variants.map((variant, index) => (
                <VariantCard
                  key={variant.id.toString()}
                  variant={variant}
                  index={index}
                  isSelected={selectedVariantIds.has(variant.id.toString())}
                  onToggle={() => toggleVariant(variant.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Compare hint */}
        {!isLoading &&
          variants &&
          variants.length >= 2 &&
          selectedVariantIds.size < 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 rounded-xl border border-teal/20 bg-teal-light/30 text-sm text-teal flex items-center gap-2"
            >
              <GitCompare className="h-4 w-4 shrink-0" />
              <span>
                Tip: Check the boxes on variant cards to select them for
                comparison. Select 2 or more to compare side by side.
              </span>
            </motion.div>
          )}
      </main>

      <footer className="mt-20 border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:underline"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Comparison Dialog */}
      <ComparisonDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        variants={selectedVariants}
      />
    </>
  );
}
