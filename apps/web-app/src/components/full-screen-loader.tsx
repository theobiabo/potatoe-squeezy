function FullScreenLoader() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[100] grid min-h-dvh place-items-center bg-canvas p-4 text-content-primary"
    >
      <div className="w-full max-w-sm border-2 border-black bg-surface-raised p-6 shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center border-2 border-black bg-action-primary font-head text-sm text-action-primary-foreground shadow-sm">
            PS
          </span>
          <div>
            <p className="font-head text-lg">Potatoe Squeezy</p>
            <p className="mt-1 text-sm text-content-secondary">
              Preparing your workspace
            </p>
          </div>
        </div>

        <div className="mt-8 border-2 border-black bg-surface p-1 shadow-sm">
          <div className="h-3 w-2/3 bg-action-primary animate-pulse" />
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-content-tertiary">
          Loading
        </p>
      </div>
    </main>
  );
}

export default FullScreenLoader;
