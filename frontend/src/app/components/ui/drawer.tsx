import * as React from "react";
import * as DrawerPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../../../src/lib/utils";
import { X } from "lucide-react";

// Root component
export const Drawer = DrawerPrimitive.Root;

// Trigger button
export const DrawerTrigger = DrawerPrimitive.Trigger;

// Close button
export const DrawerClose = DrawerPrimitive.Close;

// Title component (required for accessibility)
export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

// Content area (body of drawer)
export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Overlay className="fixed inset-0 bg-black/40 z-50" />
    <DrawerPrimitive.Content
      ref={ref}    
      className={cn(
        "fixed top-0 right-0 h-full w-[90%] max-w-sm z-50 flex flex-col border-l bg-white p-4",
        className
      )}
      {...props}
    >
      {children}
      <DrawerClose className="absolute top-2 right-2">
        <X className="h-5 w-5" />
      </DrawerClose>
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
));
DrawerContent.displayName = "DrawerContent";
