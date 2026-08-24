'use client';

// interfaces

interface Placeholder {
  token: string;
  label: string;
}

interface PlaceholderPickerProps {
  placeholders: Placeholder[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
}

export function PlaceholderPicker({ placeholders, textareaRef, value, onChange }: PlaceholderPickerProps) {
  const insert = (token: string) => {
    const insertText = `{${token}}`;
    const el = textareaRef.current;

    if (!el) {
      onChange(value + insertText);
      return;
    }

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + insertText + value.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + insertText.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {placeholders.map((placeholder) => (
        <button
          key={placeholder.token}
          type="button"
          onClick={() => insert(placeholder.token)}
          className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          + {placeholder.label}
        </button>
      ))}
    </div>
  );
}
