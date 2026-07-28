import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { cn } from "@/lib/utils";

export const Menubar = ({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) => (
  <MenubarPrimitive.Root
    className={cn(
      "flex h-7 items-center gap-0.5 border-b border-border bg-card px-1",
      className,
    )}
    {...props}
  />
);

export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarPortal = MenubarPrimitive.Portal;

export const MenubarTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) => (
  <MenubarPrimitive.Trigger
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-0.5 text-xs font-medium outline-none hover:bg-accent data-[state=open]:bg-accent",
      className,
    )}
    {...props}
  />
);

export const MenubarContent = ({
  className,
  align = "start",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      align={align}
      className={cn(
        "z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-0.5 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
);

export const MenubarItem = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean }) => (
  <MenubarPrimitive.Item
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1 text-xs outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent",
      inset && "pl-7",
      className,
    )}
    {...props}
  />
);

export const MenubarSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) => (
  <MenubarPrimitive.Separator
    className={cn("-mx-0.5 my-0.5 h-px bg-border", className)}
    {...props}
  />
);

export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

export const MenubarRadioItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) => (
  <MenubarPrimitive.RadioItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1 pl-7 pr-2 text-xs outline-none data-[highlighted]:bg-accent",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>●</MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
);
