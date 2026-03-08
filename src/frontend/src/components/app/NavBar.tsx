import { Car, GitCompareArrows, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

type NavView = "models" | "pricing" | "compare" | "admin";
type CurrentView = "models" | "modelDetail" | "pricing" | "compare" | "admin";

interface NavBarProps {
  currentView: CurrentView;
  onNavigate: (view: NavView) => void;
  compareCount: number;
}

export default function NavBar({
  currentView,
  onNavigate,
  compareCount,
}: NavBarProps) {
  const navItems: { label: string; view: NavView; ocid: string }[] = [
    { label: "Models", view: "models", ocid: "nav.models.link" },
    { label: "Pricing", view: "pricing", ocid: "nav.pricing.link" },
    { label: "Compare", view: "compare", ocid: "nav.compare.link" },
    { label: "Admin", view: "admin", ocid: "nav.admin_link" },
  ];

  const effectiveView = currentView === "modelDetail" ? "models" : currentView;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("models")}
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gold">
            <Car className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-black text-foreground tracking-tight">
            Auto<span className="text-gold">Showroom</span>
          </span>
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-1 ml-4">
          {navItems.map((item) =>
            item.view === "admin" ? (
              <button
                key={item.view}
                type="button"
                data-ocid={item.ocid}
                onClick={() => onNavigate(item.view)}
                className={`nav-link rounded-sm flex items-center gap-1.5 ${effectiveView === item.view ? "active" : ""}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ) : (
              <button
                key={item.view}
                type="button"
                data-ocid={item.ocid}
                onClick={() => onNavigate(item.view)}
                className={`nav-link rounded-sm ${effectiveView === item.view ? "active" : ""}`}
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        {/* Right side: compare count */}
        <div className="ml-auto flex items-center gap-3">
          {compareCount > 0 && (
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => onNavigate("compare")}
              data-ocid="nav.compare.link"
              className="flex items-center gap-2 rounded-sm bg-gold-subtle border border-gold px-3 py-1.5 text-sm font-semibold text-gold-bright hover:bg-gold-dim transition-colors"
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              <span>{compareCount} selected</span>
            </motion.button>
          )}
          <span className="hidden lg:block text-xs text-muted-foreground tracking-widest uppercase font-semibold">
            Sales Executive Dashboard
          </span>
        </div>
      </div>
    </header>
  );
}
