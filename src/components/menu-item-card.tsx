"use client"

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

type MenuItemCardProps = {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
};

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    /* Card: Pure white bubble that pops on the #d4af37 background */
    <div className="group bg-white rounded-[2.5rem] border-2 border-zinc-900/5 overflow-hidden transition-all active:scale-[0.98] shadow-md hover:shadow-2xl">
      
      {/* Image Container */}
      <div className="relative h-60 w-full overflow-hidden bg-zinc-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-16 w-16 text-zinc-300" />
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Name and Description */}
        <div className="mb-4">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 leading-tight">
            {item.name}
          </h3>
          <p className="text-zinc-500 text-sm font-medium line-clamp-2 mt-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Action Area: Large Price and Button */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-baseline justify-between">
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Price</span>
             <span className="text-4xl font-black text-emerald-600 tracking-tighter tabular-nums">
                {formatCurrency(item.price)}
             </span>
          </div>

          <Button
            onClick={() => onAddToCart(item)}
            className="w-full h-16 rounded-s2xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase italic tracking-widest transition-all shadow-[6px_6px_0px_0px_#d4af37] active:shadow-none active:translate-x-1 active:translate-y-1 text-lg"
          >
            Add to Order
          </Button>
        </div>
      </div>
    </div>
  );
}
