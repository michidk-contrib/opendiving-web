"use client";
import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Circle } from "lucide-react";
import * as Primitive from "./primitives/dropdown-menu";
import type { AppComponentProps } from "./component-props";
import { cn } from "@/lib/utils";
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./primitives/dropdown-menu";
const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Primitive.DropdownMenuTrigger>
>(({ onPointerDown, onPointerCancel, onClick, children, ...props }, ref) => {
  const pressedHere = React.useRef(false);
  return (
    <Primitive.DropdownMenuTrigger
      ref={ref}
      type="button"
      {...props}
      onPointerDown={(event) => {
        pressedHere.current = true;
        onPointerDown?.(event);
      }}
      onPointerCancel={(event) => {
        pressedHere.current = false;
        onPointerCancel?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        // A modal's outside press can dismiss it before its click reaches the trigger.
        if (event.detail > 0 && !pressedHere.current)
          event.preventBaseUIHandler();
        pressedHere.current = false;
      }}
    >
      {children}
    </Primitive.DropdownMenuTrigger>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

function DropdownMenuContent({
  className,
  ...props
}: AppComponentProps<typeof Primitive.DropdownMenuContent>) {
  return (
    <Primitive.DropdownMenuContent
      className={cn(
        "w-auto rounded-md border overscroll-contain ring-0",
        className,
      )}
      render={(props, state) => (
        <div {...props} aria-hidden={!state.open || undefined} />
      )}
      {...props}
    />
  );
}
function DropdownMenuItem({
  className,
  variant,
  ...props
}: AppComponentProps<typeof Primitive.DropdownMenuItem>) {
  return (
    <Primitive.DropdownMenuItem
      variant={variant}
      className={cn(
        "gap-0 rounded-sm px-2 py-1.5 touch:py-3",
        variant !== "destructive" &&
          "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: AppComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      closeOnClick
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 touch:py-3 pl-8 pr-2 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator data-slot="dropdown-menu-radio-item-indicator">
          <Circle className="h-2 w-2 fill-current" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: AppComponentProps<typeof Primitive.DropdownMenuLabel>) {
  return (
    <Primitive.DropdownMenuLabel
      inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-popover-foreground",
        inset && "data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: AppComponentProps<typeof Primitive.DropdownMenuSeparator>) {
  return (
    <Primitive.DropdownMenuSeparator
      className={cn("bg-muted", className)}
      {...props}
    />
  );
}

export {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
