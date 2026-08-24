import { cn } from '@/lib/utils';

// interfaces

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[9px] bg-primary font-extrabold text-primary-foreground',
        className,
      )}
      aria-hidden="true"
    >
      U
    </span>
  );
}
