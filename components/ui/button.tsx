import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-500 text-white shadow-elevation-1 hover:shadow-elevation-2 active:scale-[0.98]',
        secondary: 'bg-muted text-muted-foreground shadow-elevation-1 hover:shadow-elevation-2 active:scale-[0.98]',
        ghost: 'text-foreground active:scale-[0.98]',
        destructive: 'bg-danger text-white shadow-elevation-1 hover:shadow-elevation-2 active:scale-[0.98]',
        outline: 'border-2 border-border bg-card text-card-foreground shadow-elevation-0 hover:shadow-elevation-1 active:scale-[0.98]',
        link: 'text-brand-500 underline-offset-4 active:text-brand-600',
      },
      size: {
        sm: 'h-10 px-3 text-sm min-h-[2.5rem]',  // 40px - slightly larger for touch
        md: 'h-touch-target px-4 py-2 min-h-touch-target',  // 44px - WCAG 2.2 compliant
        lg: 'h-12 px-6 py-3 text-base min-h-[3rem]',  // 48px - comfortable touch
        icon: 'h-touch-target w-touch-target min-h-touch-target min-w-touch-target',  // 44x44px - WCAG compliant
      },
    },
    compoundVariants: [
      // Hover states only on devices that support hover
      {
        variant: ['primary', 'secondary', 'destructive', 'outline'],
        className: '@media (hover: hover) { hover:bg-opacity-90 }',
      },
      {
        variant: 'ghost',
        className: '@media (hover: hover) { hover:bg-muted }',
      },
      {
        variant: 'link',
        className: '@media (hover: hover) { hover:underline }',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProperties
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProperties>(
  ({ className, variant, size, asChild = false, ...properties }, reference) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={reference} {...properties} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

