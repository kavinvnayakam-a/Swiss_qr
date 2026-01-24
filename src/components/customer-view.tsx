"use client"

import { useState, useMemo } from 'react';
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
import SessionTimer from './session-timer';

export default function CustomerView({ tableId }: { tableId: string | null }) {
  const { clearCart, addToCart } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);

  const { timeLeft } = useSessionTimer(clearCart);

  const categorizedMenu = useMemo(() => {
    const categoryOrder = ['Wraps', 'Shawarma', 'Kebabs & Falafel', 'Lebanese Grill', 'Broasted Chicken', 'Broast Platters', 'Platters', 'Salads', 'Burgers', 'Fries', 'Sides', 'Drinks'];
    
    const grouped = menuItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
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
    <>
      <Header tableId={tableId} onCartClick={() => setCartOpen(true)} timeLeft={timeLeft} />
      <main className="container mx-auto px-4 md:px-6 py-12">
        <Accordion type="multiple" className="w-full space-y-8">
          {categorizedMenu.map(({ category, items }) => (
            <AccordionItem value={category} key={category} className="border-b-0">
              <AccordionTrigger className="text-4xl font-extrabold text-foreground border-b-4 border-foreground pb-2 hover:no-underline">
                {category}
              </AccordionTrigger>
              <AccordionContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <CartSheet isOpen={isCartOpen} onOpenChange={setCartOpen} tableId={tableId} />
      
      {/* Floating elements for mobile */}
      <div className="fixed bottom-6 left-6 z-50 md:hidden">
        <div className="p-3 text-center rounded-lg border-2 border-foreground bg-card text-card-foreground shadow-[4px_4px_0px_#000]">
          <SessionTimer timeLeft={timeLeft} />
          <p className="text-xs mt-2 text-muted-foreground max-w-48 mx-auto">
            Order within 10mins as the session will be cleared post 10mins.
          </p>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <CartIcon onOpen={() => setCartOpen(true)} />
      </div>
    </>
  );
}
