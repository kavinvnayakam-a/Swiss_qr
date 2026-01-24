"use client"

import { useState, useMemo, useEffect } from 'react';
import { useSessionTimer } from '@/hooks/use-session-timer';
import { useCart } from '@/hooks/use-cart';
import { menuItems } from '@/lib/menu-data';
import { Header } from '@/components/header';
import { MenuItemCard } from '@/components/menu-item-card';
import { CartSheet } from '@/components/cart-sheet';
import { CartIcon } from '@/components/cart-icon';
import TableSelection from './table-selection';
import type { MenuItem } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';

export default function CustomerView({ tableId }: { tableId: string | null }) {
  const { clearCart, addToCart } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  const { timeLeft } = useSessionTimer(clearCart);

  // Trigger themed toast on mobile session start
  useEffect(() => {
    if (tableId && typeof window !== 'undefined' && window.innerWidth < 768) {
      toast({
        title: "Session Active",
        description: "Order within 10mins to keep your table session.",
        className: "bg-zinc-900 text-white border-b-4 border-amber-500",
        duration: 5000,
      });
    }
  }, [tableId, toast]);

  const categorizedMenu = useMemo(() => {
    const categoryOrder = [
      'Wraps', 'Shawarma', 'Kebabs & Falafel', 'Lebanese Grill', 
      'Broasted Chicken', 'Broast Platters', 'Platters', 'Salads', 
      'Burgers', 'Fries', 'Sides', 'Drinks'
    ];
    
    const grouped = menuItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    return categoryOrder.map(category => ({
      category,
      items: grouped[category] || []
    })).filter(group => group.items.length > 0);
  }, []);

  if (!tableId) {
    return <TableSelection />;
  }

  return (
    // Background color set to your specific mustard yellow #d4af37
    <div className="min-h-screen bg-[#d4af37] font-sans selection:bg-zinc-900 selection:text-white">
      <Header tableId={tableId} onCartClick={() => setCartOpen(true)} timeLeft={timeLeft} />
      
      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Mobile-First Branding Header */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Menu
          </h1>
          <p className="text-zinc-900 font-bold mt-2 opacity-80 uppercase tracking-widest text-xs">
            Authentic Grill & Broast
          </p>
        </header>

        <Accordion type="multiple" defaultValue={[]} className="w-full space-y-4">
          {categorizedMenu.map(({ category, items }) => (
            <AccordionItem 
              value={category} 
              key={category} 
              className="border-none"
            >
              {/* Category Bar: Solid Black with white text for high contrast */}
              <AccordionTrigger className="flex px-6 py-4 bg-zinc-900 text-white rounded-xl shadow-[4px_4px_0_0_#00000040] hover:no-underline transition-transform active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black uppercase italic tracking-tight">
                    {category}
                  </span>
                  <span className="text-[10px] bg-white text-zinc-900 px-2 py-0.5 rounded font-bold">
                    {items.length}
                  </span>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pt-6 px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    /* White Card Container to pop against the yellow bg */
                    <div 
                      key={item.id} 
                      className="bg-white rounded-3xl p-2 shadow-xl border-2 border-zinc-900/5"
                    >
                      <MenuItemCard 
                        item={item} 
                        onAddToCart={addToCart} 
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      {/* Cart Logic Components */}
      <CartSheet isOpen={isCartOpen} onOpenChange={setCartOpen} tableId={tableId} />
      
      {/* Floating Mobile Cart Button: Centered for thumb-friendly UI */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden">
          <button 
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-4 border-[#d4af37] active:scale-90 transition-transform"
          >
            <CartIcon />
            <span className="font-bold uppercase tracking-wider text-sm">View Cart</span>
          </button>
      </div>
    </div>
  );
}
