import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";

type View = { type: "catalog" } | { type: "product"; productId: bigint };

export default function App() {
  const [view, setView] = useState<View>({ type: "catalog" });

  function navigateTo(v: View) {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen gradient-mesh font-body">
      <Toaster position="top-right" />
      {view.type === "catalog" && (
        <CatalogPage
          onSelectProduct={(id) =>
            navigateTo({ type: "product", productId: id })
          }
        />
      )}
      {view.type === "product" && (
        <ProductDetailPage
          productId={view.productId}
          onBack={() => navigateTo({ type: "catalog" })}
        />
      )}
    </div>
  );
}
