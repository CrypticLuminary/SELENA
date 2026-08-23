import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapClassName, children, ...props }, ref) => {
    return (
      <div className={cn("relative", wrapClassName)}>
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-line-strong bg-surface px-3.5 pr-10 text-[0.95rem] text-ink",
            "hover:bg-surface-muted focus-visible:border-accent",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
