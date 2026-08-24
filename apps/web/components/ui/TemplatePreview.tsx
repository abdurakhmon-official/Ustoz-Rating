// interfaces

interface TemplatePreviewProps {
  text: string;
  values: Record<string, string | number>;
  label: string;
}

const TOKEN_PATTERN = /(\{[a-zA-Z]+\})/g;

export function TemplatePreview({ text, values, label }: TemplatePreviewProps) {
  const parts = text.split(TOKEN_PATTERN);

  return (
    <div className="rounded-md border border-border bg-accent/40 px-3 py-2.5">
      <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">{label}</p>
      <p className="text-sm leading-relaxed">
        {parts.map((part, index) => {
          const match = /^\{([a-zA-Z]+)\}$/.exec(part);
          if (!match) return <span key={index}>{part}</span>;

          const token = match[1] as string;
          const value = values[token];

          return (
            <span key={index} className="font-semibold text-primary">
              {value !== undefined ? value : part}
            </span>
          );
        })}
      </p>
    </div>
  );
}
