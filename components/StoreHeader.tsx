export function StoreHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <div className="leading-tight">
          <h1 className="text-base font-semibold md:text-lg">
            <span>Al-Madina General Store</span>
            <span className="mx-2 text-muted-foreground">-</span>
            <span className="font-(family-name:--font-urdu) text-primary">
                سلیم خان
            </span>
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Gulberg, Lahore
          </p>
        </div>
      </div>
    </header>
  );
}
