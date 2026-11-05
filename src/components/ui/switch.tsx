"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { AppComponentProps } from "./component-props";

import { cn } from "@/lib/utils";

// Boolean settings use a button so toggling one never submits its surrounding form.
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  AppComponentProps<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    data-slot="switch"
    render={<button type="button" />}
    nativeButton
    ref={ref}
    className={cn(
      "peer relative inline-flex h-5 w-9 shrink-0 cursor-pointer touch:tap-target items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-teal data-[unchecked]:bg-muted-foreground",
      className,
    )}
    {...props}
  >
    {/* Keep the off state visible in both themes; teal identifies enabled settings. */}
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[checked]:translate-x-4 data-[unchecked]:translate-x-0"
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
