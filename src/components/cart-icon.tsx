"use client"

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function CartIcon() {
  const { totalItems } = useCart();

  return (
    <div className="relative">
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-foreground text-sm">
          {totalItems}
        </span>
      )}
    </div>
  );
}
