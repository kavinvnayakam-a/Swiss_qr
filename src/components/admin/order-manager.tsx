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
  serverTimestamp
} from 'firebase/firestore';
import { Order } from '@/lib/types';
import { 
  Clock, 
  ChefHat, 
  Play, 
  Check, 
  Hash, 
  CheckCircle2,
  UtensilsCrossed,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const { toast } = useToast();

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

  const updateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: nextStatus });
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const archiveOrder = async (order: Order) => {
    const batch = writeBatch(db);
    try {
      const historyRef = doc(collection(db, "order_history"));
      const archiveData = {
        ...order,
        status: "Served",
        archivedAt: serverTimestamp(),
        totalPrice: Number(order.totalPrice) || 0
      };
      batch.set(historyRef, archiveData);
      batch.delete(doc(db, "orders", order.id));
      await batch.commit();
      toast({ title: "Order Served & Archived" });
    } catch (err) {
      toast({ title: "Archive Failed", variant: "destructive" });
    }
  };

  const archiveAndClearTable = async (tableId: string) => {
    const items = tableMap[tableId];
    if (!items || items.length === 0) return;
    const batch = writeBatch(db);
    try {
      for (const order of items) {
        const historyRef = doc(collection(db, "order_history"));
        batch.set(historyRef, { ...order, archivedAt: serverTimestamp(), status: "Served" });
        batch.delete(doc(db, "orders", order.id));
      }
      await batch.commit();
      setSelectedTable(null);
      toast({ title: "Table Cleared Successfully" });
    } catch (err) {
      toast({ title: "Bulk Archive Failed", variant: "destructive" });
    }
  };

  const allTables = ["Takeaway", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* LEFT: TABLE SELECTION GRID WITH COLOR LOGIC */}
      <div className="lg:col-span-1 grid grid-cols-2 gap-4 h-fit">
        {allTables.map((tId) => {
          const tableOrders = tableMap[tId] || [];
          const isOccupied = tableOrders.length > 0;
          const hasPending = tableOrders.some(o => o.status === 'Pending');

          return (
            <button
              key={tId}
              onClick={() => setSelectedTable(tId)}
              className={`relative p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center justify-center gap-1 ${
                selectedTable === tId 
                  ? "bg-zinc-900 border-zinc-900 text-white scale-105 shadow-[6px_6px_0_0_#d4af37]" 
                  : isOccupied
                    ? "bg-rose-500 border-zinc-900 text-white shadow-[4px_4px_0_0_#000]" // RED FOR OCCUPIED
                    : "bg-emerald-500 border-zinc-900 text-white shadow-[4px_4px_0_0_#000]" // GREEN FOR AVAILABLE
              }`}
            >
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                {tId === 'Takeaway' ? 'Collection' : 'Table'}
              </span>
              <span className="text-2xl font-black italic leading-none">{tId}</span>
              
              {/* Alert for Pending Orders (White Pulse to stand out on Red/Green) */}
              {hasPending && (
                <div className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-zinc-900"></span>
                </div>
              )}
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
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                    {selectedTable === 'Takeaway' ? 'Collection' : `Table ${selectedTable}`}
                </h3>
                <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">Live Tickets: {tableMap[selectedTable]?.length || 0}</p>
              </div>
              <button 
                onClick={() => archiveAndClearTable(selectedTable)}
                className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-black uppercase italic text-sm hover:scale-105 transition-all shadow-[4px_4px_0_0_#000]"
              >
                <CheckCircle2 size={18} /> Finish & Clear Table
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tableMap[selectedTable]?.map((order) => (
                <div key={order.id} className="bg-white border-4 border-zinc-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col">
                  
                  <div className="absolute top-0 right-0 bg-zinc-900 text-[#d4af37] px-6 py-1.5 font-black italic border-b-2 border-l-2 border-zinc-900 rounded-bl-2xl">
                    #{order.orderNumber}
                  </div>

                  <div className="flex-1 space-y-3 mb-8 pt-6">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border-2 border-zinc-100 font-black uppercase italic text-xs">
                        <span><span className="text-[#d4af37] mr-2">{item.quantity}x</span> {item.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'Received')}
                        className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl border-b-4 border-emerald-700 flex items-center justify-center gap-2"
                      >
                        <Play size={18} fill="white" /> 1. APPROVE ORDER
                      </button>
                    )}

                    {order.status === 'Received' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'Ready')}
                        className="w-full bg-[#d4af37] text-zinc-900 font-black py-4 rounded-xl border-b-4 border-zinc-700 flex items-center justify-center gap-2"
                      >
                        <ChefHat size={18} /> 2. READY TO SERVE
                      </button>
                    )}

                    {order.status === 'Ready' && (
                      <button 
                        onClick={() => archiveOrder(order)}
                        className="w-full bg-rose-500 text-white font-black py-4 rounded-xl border-b-4 border-rose-700 flex items-center justify-center gap-2"
                      >
                        <UtensilsCrossed size={18} /> 3. MARK AS SERVED
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white border-4 border-dashed border-zinc-200 rounded-[4rem] text-zinc-300 font-black uppercase italic p-12 text-center">
            <UtensilsCrossed size={48} className="mb-4 opacity-20" />
            Select a table to manage live tickets
          </div>
        )}
      </div>
    </div>
  );
}