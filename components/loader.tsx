export function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="relative">
        {/* Outer ring */}
        <div className="h-32 w-32 rounded-full border-4 border-muted" />
        {/* Spinning arc */}
        <div className="absolute inset-0 h-32 w-32 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
    </div>
  );
}

