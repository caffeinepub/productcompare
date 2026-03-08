import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight, Car } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { CarModel } from "../backend.d";
import { CarCategory } from "../backend.d";
import { useAllCarModels, useSeedData } from "../hooks/useQueries";

interface ModelsPageProps {
  onSelectModel: (id: bigint) => void;
}

const CATEGORY_CONFIG: Record<
  CarCategory,
  { label: string; img: string; color: string }
> = {
  [CarCategory.sedan]: {
    label: "Sedan",
    img: "/assets/generated/car-silhouette-sedan-transparent.dim_400x200.png",
    color: "0.60 0.18 210",
  },
  [CarCategory.suv]: {
    label: "SUV",
    img: "/assets/generated/car-silhouette-suv-transparent.dim_400x200.png",
    color: "0.62 0.16 160",
  },
  [CarCategory.hatchback]: {
    label: "Hatchback",
    img: "/assets/generated/car-silhouette-hatchback-transparent.dim_400x200.png",
    color: "0.72 0.16 65",
  },
  [CarCategory.coupe]: {
    label: "Coupe",
    img: "/assets/generated/car-silhouette-coupe-transparent.dim_400x200.png",
    color: "0.65 0.18 290",
  },
  [CarCategory.mpv]: {
    label: "MPV",
    img: "/assets/generated/car-silhouette-mpv-transparent.dim_400x200.png",
    color: "0.60 0.20 27",
  },
};

function getCategoryConfig(cat: CarCategory | string) {
  return (
    CATEGORY_CONFIG[cat as CarCategory] ?? {
      label: String(cat).toUpperCase(),
      img: "/assets/generated/car-silhouette-sedan-transparent.dim_400x200.png",
      color: "0.52 0.014 255",
    }
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

function CarModelCard({
  model,
  index,
  onSelect,
}: {
  model: CarModel;
  index: number;
  onSelect: () => void;
}) {
  const cfg = getCategoryConfig(model.category);

  return (
    <motion.article
      variants={itemVariants}
      className="card-auto rounded-lg overflow-hidden flex flex-col group"
    >
      {/* Car image area */}
      <div
        className="relative flex items-end justify-center h-44 overflow-hidden px-4 pt-4"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 70%, oklch(${cfg.color} / 0.12) 0%, transparent 80%), oklch(var(--surface-02))`,
        }}
      >
        {/* Category badge top-left */}
        <span className="badge-category absolute top-3 left-3 z-10">
          {cfg.label}
        </span>

        {/* Car image */}
        <img
          src={cfg.img}
          alt={`${model.name} silhouette`}
          className="h-28 w-auto object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
          style={{
            filter: `drop-shadow(0 8px 24px oklch(${cfg.color} / 0.3))`,
          }}
        />

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{
            background:
              "linear-gradient(to top, oklch(var(--card)) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="font-display text-xl font-black text-foreground leading-tight">
            {model.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {model.tagline}
          </p>
        </div>

        <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3 flex-1">
          {model.description}
        </p>

        <Button
          data-ocid={`models.view_detail.button.${index + 1}`}
          onClick={onSelect}
          className="mt-auto w-full bg-surface-02 text-foreground border border-border hover:border-gold/50 hover:bg-gold-subtle hover:text-gold-bright transition-all duration-200 gap-2 font-semibold"
          variant="ghost"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <div className="h-44 bg-surface-02" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-2/3 bg-surface-03" />
        <Skeleton className="h-4 w-full bg-surface-03" />
        <Skeleton className="h-4 w-4/5 bg-surface-03" />
        <Skeleton className="h-10 w-full rounded-sm bg-surface-03 mt-2" />
      </div>
    </div>
  );
}

export default function ModelsPage({ onSelectModel }: ModelsPageProps) {
  const { data: models, isLoading, isError } = useAllCarModels();
  const { mutate: triggerSeed, isPending: isSeedPending } = useSeedData();

  useEffect(() => {
    if (models && models.length === 0 && !isSeedPending) {
      triggerSeed();
    }
  }, [models, isSeedPending, triggerSeed]);

  const isLoadingState = isLoading || isSeedPending;
  const hasModels = !isLoadingState && !isError && models && models.length > 0;
  const isEmpty = !isLoadingState && !isError && models && models.length === 0;

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
          Vehicle Lineup
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground leading-none">
          Our Models
        </h1>
        <p className="text-muted-foreground mt-3 max-w-lg">
          Explore our complete range of vehicles. Select a model to see
          available trims and full specifications.
        </p>
        <div className="divider-gold mt-6 max-w-xs" />
      </motion.div>

      {/* Loading skeleton */}
      {isLoadingState && (
        <div
          data-ocid="models.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoadingState && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4 opacity-80" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Failed to load models
          </h2>
          <p className="text-muted-foreground text-sm">
            Please refresh the page and try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div
          data-ocid="models.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-surface-02 border border-border mb-4">
            <Car className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            No models available
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            The showroom catalog is empty. Models will appear here once added.
          </p>
        </div>
      )}

      {/* Models grid */}
      <AnimatePresence>
        {hasModels && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {models!.map((model, index) => (
              <CarModelCard
                key={model.id.toString()}
                model={model}
                index={index}
                onSelect={() => onSelectModel(model.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
