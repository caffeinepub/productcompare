import { Layers } from "lucide-react";

interface NavBarProps {
  onLogoClick?: () => void;
}

export default function NavBar({ onLogoClick }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          data-ocid="nav.link"
          onClick={onLogoClick}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          aria-label="Go to catalog"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-xl font-700 tracking-tight text-foreground">
            Product<span className="text-teal">Compare</span>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:block">
            Compare products & variants side by side
          </span>
        </div>
      </div>
    </header>
  );
}
