"use client";

import * as React from "react";
import { cn } from "../lib/utils";

interface TooltipProviderProps {
  children: React.ReactNode;
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
}

const Tooltip = ({ children }: TooltipProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="relative inline-block"
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { isOpen } as any)
          : child
      )}
    </div>
  );
};

interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
  isOpen?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ className, asChild, children, isOpen, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        ref,
      } as any);
    }
    return (
      <button ref={ref} className={className} {...props}>
        {children}
      </button>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  isOpen?: boolean;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", isOpen, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 px-3 py-1.5 text-sm text-white shadow-md whitespace-nowrap pointer-events-none transition-opacity duration-200",
        "rounded-md bg-neutral-900",
        side === "top" && "bottom-full mb-2 left-1/2 -translate-x-1/2",
        side === "right" && "left-full ml-2 top-1/2 -translate-y-1/2",
        side === "bottom" && "top-full mt-2 left-1/2 -translate-x-1/2",
        side === "left" && "right-full mr-2 top-1/2 -translate-y-1/2",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      {...props}
    />
  )
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
