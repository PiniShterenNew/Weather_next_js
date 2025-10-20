'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...properties }, reference) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-transparent px-4 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-50 tabular-nums',
          className,
        )}
        ref={reference}
        {...properties}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
