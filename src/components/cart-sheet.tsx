"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

type CartSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tableId: string;
};

export function CartSheet({ isOpen, onOpenChange, tableId }: CartSheetProps) {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const { toast } = useToast();

  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: `${tableId}-${Date.now()}`,
      tableId,
      items: cartItems,
      totalPrice: cartTotal,
      status: 'Received',
      timestamp: Date.now(),
    };
    setOrders(prevOrders => [...prevOrders, newOrder]);
    toast({
      title: "Order Placed!",
      description: "Your order has been sent to the kitchen.",
    });
    clearCart();
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col bg-card border-l-4 border-foreground text-foreground w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl text-foreground">Your Order</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground mt-10">Your cart is empty.</p>
          ) : (
            <div className="divide-y-2 divide-foreground/20">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md border-2 border-foreground" data-ai-hint={item.imageHint}/>
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-2 border-foreground" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4"/></Button>
                      <span>{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-2 border-foreground" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4"/></Button>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="h-5 w-5"/></Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <SheetFooter className="border-t-4 border-foreground -mx-6 px-6 pt-4 mt-auto">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                className="w-full h-14 text-lg bg-primary text-primary-foreground border-2 border-foreground shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] active:shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Place Order
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
