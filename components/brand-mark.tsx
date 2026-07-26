export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary text-sm font-black text-primary-foreground">
        TF
      </div>
      <div>
        <p className="text-sm font-semibold tracking-wide text-foreground">
          TrainFusion
        </p>
        <p className="text-xs text-muted-foreground">Compatibility first</p>
      </div>
    </div>
  );
}
