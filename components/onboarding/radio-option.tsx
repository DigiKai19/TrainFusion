type RadioOptionProps = {
  name: string;
  value: string;
  title: string;
  description?: string;
  defaultChecked?: boolean;
};

export function RadioOption({
  name,
  value,
  title,
  description,
  defaultChecked
}: RadioOptionProps) {
  return (
    <label className="flex min-h-20 items-start gap-3 rounded-md border border-border bg-card p-4 text-sm transition-colors hover:border-primary/50">
      <input
        className="mt-1 h-4 w-4 accent-[#B7FF00]"
        defaultChecked={defaultChecked}
        name={name}
        required
        type="radio"
        value={value}
      />
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        {description ? (
          <span className="mt-1 block leading-5 text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
