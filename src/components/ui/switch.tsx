import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 min-h-[24px] shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-inner transition-colors duration-200 ease-in-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-muted",
      "hover:data-[state=checked]:bg-green-700 hover:data-[state=unchecked]:bg-muted/80",
      "active:scale-95 transition-transform",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0",
        "transition-all duration-200 ease-in-out",
        "data-[state=checked]:translate-x-[1.2rem] data-[state=unchecked]:translate-x-0.5",
        "data-[state=checked]:shadow-green-900/20",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
