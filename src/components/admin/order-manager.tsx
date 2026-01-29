"use client"

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  writeBatch,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { Order } from '@/lib/types';
import { 
  Clock, 
  ChefHat, 
  CheckCircle2,
  Printer,
  ArrowRightLeft,
  Square,
  CheckSquare,
  BellRing,
  MessageCircleQuestion,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedForBill, setSelectedForBill] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 1. Live Listener for Orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  const tableMap = orders.reduce((acc, order) => {
    const key = order.tableId || 'Takeaway';
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // 2. Resolve Help Logic
  const resolveHelp = async (orderId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { helpRequested: false });
      toast({ title: "Help Request Resolved" });
    } catch (err) {
      toast({ title: "Failed to resolve help", variant: "destructive" });
    }
  };

  // 3. Item Level Serving (Updates main status to 'Served' when last item is done)
  const markItemServed = async (orderId: string, itemIndex: number) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;

      const currentItems = [...orderSnap.data().items];
      currentItems[itemIndex].status = "Served";

      // If all items are served, the whole order becomes 'Served'
      // This triggers the 3-minute persistent timer on the Customer side
      const allServed = currentItems.every((i: any) => i.status === "Served");

      await updateDoc(orderRef, {
        items: currentItems,
        status: allServed ? "Served" : "Received" 
      });

      toast({ title: allServed ? "Order fully served!" : "Item served!" });
    } catch (err) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  // 4. Archive Logic (The Fix)
  // We move Served orders to history and remove them from the live list
  const archiveAndClearTable = async (tableId: string) => {
    const tableOrders = tableMap[tableId] || [];
    const ordersToArchive = tableOrders.filter(o => o.status === 'Served');
    
    if (ordersToArchive.length === 0) {
      toast({ 
        title: "Nothing to Archive", 
        description: "Items must be marked as 'Served' before archiving.", 
        variant: "destructive" 
      });
      return;
    }

    const batch = writeBatch(db);
    try {
      for (const order of ordersToArchive) {
        const historyRef = doc(collection(db, "order_history"));
        // Move to history
        batch.set(historyRef, { 
          ...order, 
          archivedAt: serverTimestamp(), 
          finalStatus: "Completed"
        });
        // Delete from live
        batch.delete(doc(db, "orders", order.id));
      }
      await batch.commit();
      setSelectedForBill([]);
      toast({ title: "Table Cleared Successfully" });
    } catch (err) { 
      toast({ title: "Archive Failed", variant: "destructive" }); 
    }
  };

  const toggleBillSelection = (id: string) => {
    setSelectedForBill(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const allTables = ["Takeaway", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* LEFT: TABLE GRID */}
      <div className="lg:col-span-1 grid grid-cols-2 gap-4 h-fit">
        {allTables.map((tId) => {
          const tableOrders = tableMap[tId] || [];
          const isOccupied = tableOrders.length > 0;
          const needsHelp = tableOrders.some(o => o.helpRequested);

          return (
            <button
              key={tId}
              onClick={() => { setSelectedTable(tId); setSelectedForBill([]); }}
              className={`relative p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center justify-center gap-1 ${
                selectedTable === tId 
                  ? "bg-zinc-900 border-zinc-900 text-white scale-105 shadow-[6px_6px_0_0_#d4af37]" 
                  : needsHelp
                    ? "bg-rose-500 border-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    : isOccupied
                      ? "bg-rose-500 border-zinc-900 text-white shadow-[4px_4px_0_0_#000]" 
                      : "bg-emerald-500 border-zinc-900 text-white shadow-[4px_4px_0_0_#000]"
              }`}
            >
              <span className="text-[8px] font-black uppercase tracking-widest">{tId === 'Takeaway' ? 'Collection' : 'Table'}</span>
              <span className="text-2xl font-black italic">{tId}</span>
              {needsHelp && <BellRing className="absolute top-2 right-2 text-white" size={16} />}
            </button>
          );
        })}
      </div>

      {/* RIGHT: TICKET AREA */}
      <div className="lg:col-span-3">
        {selectedTable ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-[2.5rem] text-white border-b-4 border-[#d4af37]">
              <div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">{selectedTable}</h3>
                <p className="text-[10px] font-bold text-[#d4af37] uppercase">{tableMap[selectedTable]?.length || 0} active tickets</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => archiveAndClearTable(selectedTable)}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black uppercase italic text-sm shadow-[4px_4px_0_0_#000]"
                >
                  <CheckCircle2 size={18} /> Finish Served
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tableMap[selectedTable]?.map((order) => (
                <div key={order.id} className={`bg-white border-4 border-zinc-900 p-6 rounded-[2.5rem] shadow-xl relative flex flex-col ${order.helpRequested ? 'ring-8 ring-rose-500 ring-inset' : ''}`}>
                  
                  {/* HELP NOTIFICATION */}
                  {order.helpRequested && (
                    <div className="mb-4 bg-rose-500 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <MessageCircleQuestion className="animate-bounce" size={20} />
                        <span className="font-black uppercase italic text-xs">Help Requested!</span>
                      </div>
                      <button 
                        onClick={() => resolveHelp(order.id)}
                        className="bg-white text-rose-500 px-4 py-1.5 rounded-xl font-black uppercase text-[10px]"
                      >
                        Resolved
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => toggleBillSelection(order.id)} className="text-zinc-300">
                      {selectedForBill.includes(order.id) ? <CheckSquare size={24} className="text-[#d4af37]" /> : <Square size={24} />}
                    </button>
                    <div className="bg-zinc-900 text-[#d4af37] px-4 py-1.5 font-black italic rounded-xl text-xs">
                      #{order.orderNumber}
                    </div>
                  </div>

                  {/* ITEM LIST */}
                  <div className="flex-1 space-y-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-3 rounded-xl border-2 transition-all ${
                          item.status === 'Served' 
                            ? 'bg-emerald-50 border-emerald-100 opacity-60' 
                            : 'bg-zinc-50 border-zinc-100'
                        }`}
                      >
                        <span className={`font-black uppercase italic text-xs ${item.status === 'Served' ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                          {item.quantity}x {item.name}
                        </span>
                        {item.status !== 'Served' && (
                          <button 
                            onClick={() => markItemServed(order.id, idx)}
                            className="bg-zinc-900 text-[#d4af37] px-3 py-1 rounded-lg text-[9px] font-black uppercase italic"
                          >
                            Serve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[500px] flex items-center justify-center bg-white border-4 border-dashed border-zinc-200 rounded-[4rem] text-zinc-300 font-black uppercase italic p-12 text-center">
            Select a table to manage tickets
          </div>
        )}
      </div>
    </div>
  );
}