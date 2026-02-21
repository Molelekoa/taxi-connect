import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default: Confident Blue - high contrast
        default: "bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-[0.98]",
        
        // Coral CTA - vibrant, action-oriented with white text
        coral: "bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 active:scale-[0.98] shadow-[var(--shadow-primary-glow)]",
        
        // Hero button - prominent blue
        hero: "bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 active:scale-[0.98] shadow-soft",
        
        // Destructive - distinct red
        destructive: "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90",
        
        // Outline - clear border with blue text
        outline: "border border-border bg-transparent text-primary font-semibold rounded-xl hover:bg-secondary hover:border-primary/50",
        
        // Secondary - subtle gray background
        secondary: "bg-secondary text-secondary-foreground rounded-xl hover:bg-muted",
        
        // Ghost - minimal hover effect
        ghost: "rounded-xl text-foreground hover:bg-secondary",
        
        // Link style - blue text
        link: "text-primary underline-offset-4 hover:underline font-semibold",
        
        // Navigation items
        nav: "bg-transparent text-muted-foreground hover:text-foreground transition-colors rounded-lg",
        
        // Success - vibrant green
        success: "bg-success text-success-foreground rounded-xl hover:bg-success/90",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
