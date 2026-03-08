import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import NavBar from "./components/app/NavBar";
import AdminPage from "./pages/AdminPage";
import ComparePage from "./pages/ComparePage";
import ModelDetailPage from "./pages/ModelDetailPage";
import ModelsPage from "./pages/ModelsPage";
import PricingPage from "./pages/PricingPage";

type View =
  | { type: "models" }
  | { type: "modelDetail"; modelId: bigint }
  | { type: "pricing" }
  | { type: "compare" }
  | { type: "admin" };

type NavView = "models" | "pricing" | "compare" | "admin";

const MAX_COMPARE = 4;

export default function App() {
  const [view, setView] = useState<View>({ type: "models" });
  const [selectedTrimIds, setSelectedTrimIds] = useState<bigint[]>([]);

  function navigateTo(v: View) {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNavClick(nav: NavView) {
    switch (nav) {
      case "models":
        navigateTo({ type: "models" });
        break;
      case "pricing":
        navigateTo({ type: "pricing" });
        break;
      case "compare":
        navigateTo({ type: "compare" });
        break;
      case "admin":
        navigateTo({ type: "admin" });
        break;
    }
  }

  const addToCompare = useCallback((trimId: bigint) => {
    setSelectedTrimIds((prev) => {
      if (prev.some((id) => id === trimId)) {
        toast.info("Already in comparison", {
          description: "This trim is already selected for comparison.",
        });
        return prev;
      }
      if (prev.length >= MAX_COMPARE) {
        toast.error("Maximum reached", {
          description: `You can compare up to ${MAX_COMPARE} trims at once.`,
        });
        return prev;
      }
      toast.success("Added to compare", {
        description: "Navigate to the Compare page to see the full comparison.",
      });
      return [...prev, trimId];
    });
  }, []);

  const removeFromCompare = useCallback((trimId: bigint) => {
    setSelectedTrimIds((prev) => prev.filter((id) => id !== trimId));
    toast.info("Removed from compare");
  }, []);

  const clearAll = useCallback(() => {
    setSelectedTrimIds([]);
    toast.info("Comparison cleared");
  }, []);

  // Determine the current top-level nav view for the NavBar
  const currentNavView:
    | "models"
    | "modelDetail"
    | "pricing"
    | "compare"
    | "admin" = view.type;

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />

      <NavBar
        currentView={currentNavView}
        onNavigate={handleNavClick}
        compareCount={selectedTrimIds.length}
      />

      <div className="flex-1">
        {view.type === "models" && (
          <ModelsPage
            onSelectModel={(id) =>
              navigateTo({ type: "modelDetail", modelId: id })
            }
          />
        )}

        {view.type === "modelDetail" && (
          <ModelDetailPage
            modelId={view.modelId}
            onBack={() => navigateTo({ type: "models" })}
            selectedTrimIds={selectedTrimIds}
            onAddToCompare={addToCompare}
            onRemoveFromCompare={removeFromCompare}
          />
        )}

        {view.type === "pricing" && (
          <PricingPage
            selectedTrimIds={selectedTrimIds}
            onAddToCompare={addToCompare}
            onRemoveFromCompare={removeFromCompare}
          />
        )}

        {view.type === "compare" && (
          <ComparePage
            selectedTrimIds={selectedTrimIds}
            onRemoveFromCompare={removeFromCompare}
            onClearAll={clearAll}
            onGoToModels={() => navigateTo({ type: "models" })}
          />
        )}

        {view.type === "admin" && <AdminPage />}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 py-6 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gold transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
