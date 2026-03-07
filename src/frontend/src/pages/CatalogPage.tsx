import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, PackageSearch, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import type { Product } from "../backend.d";
import NavBar from "../components/app/NavBar";
import { useAllProducts, useSeedData } from "../hooks/useQueries";

interface CatalogPageProps {
  onSelectProduct: (id: bigint) => void;
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

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ProductCard({
  product,
  index,
  onSelect,
}: {
  product: Product;
  index: number;
  onSelect: () => void;
}) {
  const ocid = `catalog.item.${index + 1}` as const;

  return (
    <motion.article
      data-ocid={ocid}
      variants={itemVariants}
      className="group relative flex flex-col rounded-2xl bg-card border border-border card-hover overflow-hidden cursor-pointer"
    >
      {/* Decorative teal band */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal to-primary/60" />

      <div className="flex flex-1 flex-col p-6 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-700 text-foreground leading-tight mb-1 truncate">
              {product.name}
            </h3>
            <Badge
              className={categoryClass(product.category)}
              variant="secondary"
            >
              {product.category}
            </Badge>
          </div>
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-light">
            <Zap className="h-5 w-5 text-teal" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {product.description}
        </p>

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Button
            className="w-full gap-2 bg-teal text-white hover:bg-primary/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            View Variants
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="h-1.5 w-full bg-muted" />
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function CatalogPage({ onSelectProduct }: CatalogPageProps) {
  const { data: products, isLoading, isError } = useAllProducts();
  const seedMutation = useSeedData();

  const { mutate: triggerSeed, isPending: isSeedPending } = seedMutation;

  // Seed once if no products
  useEffect(() => {
    if (products && products.length === 0 && !isSeedPending) {
      triggerSeed();
    }
  }, [products, isSeedPending, triggerSeed]);

  return (
    <>
      <NavBar />
      <main
        data-ocid="catalog.page"
        className="container mx-auto px-4 sm:px-6 py-10"
      >
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-800 tracking-tight text-foreground mb-3 leading-tight">
            Find the perfect <span className="text-teal">product plan</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Browse our catalog, explore variants, and compare features side by
            side to make the best choice.
          </p>
        </motion.div>

        {/* Loading state */}
        {(isLoading || isSeedPending) && (
          <div data-ocid="catalog.loading_state">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
                <SkeletonCard key={k} />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div
            data-ocid="catalog.error_state"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-4 text-destructive text-5xl">✕</div>
            <h2 className="font-display text-xl font-600 text-foreground mb-2">
              Failed to load products
            </h2>
            <p className="text-muted-foreground text-sm">
              Please refresh the page to try again.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading &&
          !isError &&
          !isSeedPending &&
          products &&
          products.length === 0 && (
            <div
              data-ocid="catalog.empty_state"
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-light">
                <PackageSearch className="h-9 w-9 text-teal" />
              </div>
              <h2 className="font-display text-2xl font-700 text-foreground mb-2">
                No products yet
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                The catalog is empty. Products will appear here once added.
              </p>
            </div>
          )}

        {/* Product grid */}
        {!isLoading &&
          !isError &&
          !isSeedPending &&
          products &&
          products.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product, index) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={index}
                  onSelect={() => onSelectProduct(product.id)}
                />
              ))}
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
    </>
  );
}
