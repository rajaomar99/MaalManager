import { Store } from "lucide-react";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2.5">
          <Store className="h-6 w-6 shrink-0 text-primary md:hidden" />
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight md:text-xl">
              Al-Madina General Store
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Gulberg, Lahore
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
