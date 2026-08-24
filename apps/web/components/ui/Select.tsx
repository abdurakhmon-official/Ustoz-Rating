'use client';

import { Check, ChevronDown } from 'lucide-react';
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// interfaces

interface OptionData {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({ value, onChange, children, id, disabled, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo<OptionData[]>(() => {
    return Children.toArray(children).flatMap((child) => {
      if (!isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) return [];

      return [
        {
          value: String(child.props.value ?? ''),
          label: String(child.props.children ?? ''),
          disabled: child.props.disabled,
        },
      ];
    });
  }, [children]);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-start text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute inset-x-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-card py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
                option.value === value && 'bg-accent font-medium',
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <Check className="size-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
