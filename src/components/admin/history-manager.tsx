"use client"

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Calendar as CalendarIcon, ShoppingBag, Clock, Banknote, Search, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function HistoryManager() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    fetchHistory();
  }, [selectedDate, viewMode]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const start = new Date(selectedDate);
      if (viewMode === 'daily') {
        start.setHours(0, 0, 0, 0);
      } else {
        // Get start of the week (Sunday)
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
      }
      
      const end = new Date(selectedDate);
      if (viewMode === 'daily') {
        end.setHours(23, 59, 59, 999);
      } else {
        // Get end of the week (Saturday)
        end.setDate(end.getDate() + (6 - end.getDay()));
        end.setHours(23, 59, 59, 999);
      }

      const q = query(
        collection(db, "order_history"),
        where("timestamp", ">=", Timestamp.fromDate(start)),
        where("timestamp", "<=", Timestamp.fromDate(end)),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      setPastOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = pastOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* 1. HEADER & CONTROLS */}
      <div className="bg-[#e76876] p-8 rounded-[2.5rem] border-4 border-zinc-900 shadow-[8px_8px_0_0_#000] space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-zinc-900 p-4 rounded-2xl text-white shadow-lg">
              <TrendingUp size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">Grill Analytics</h2>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mt-1">Performance Tracking</p>
            </div>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-xl border-2 border-zinc-900">
            <button 
              onClick={() => setViewMode('daily')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'daily' ? 'bg-[#e76876] text-zinc-900' : 'text-zinc-500'}`}
            >Daily</button>
            <button 
              onClick={() => setViewMode('weekly')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'weekly' ? 'bg-[#e76876] text-zinc-900' : 'text-zinc-500'}`}
            >Weekly</button>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-4 border-zinc-900">
          <CalendarIcon className="ml-4 text-zinc-400" size={20} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent px-2 py-3 font-black uppercase outline-none text-zinc-900 w-full text-lg"
          />
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-8 rounded-[2rem] border-4 border-zinc-900 flex items-center justify-between text-white shadow-[6px_6px_0_0_#e76876]">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Total Revenue</p>
            <p className="text-5xl font-black italic text-[#e76876] tracking-tighter">{formatCurrency(totalRevenue)}</p>
          </div>
          <Banknote size={50} className="opacity-20" />
        </div>
        <div className="bg-white p-8 rounded-[2rem] border-4 border-zinc-900 flex items-center justify-between shadow-[6px_6px_0_0_#000]">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Orders Served</p>
            <p className="text-5xl font-black italic tracking-tighter">{pastOrders.length}</p>
          </div>
          <ShoppingBag size={50} className="opacity-10" />
        </div>
      </div>

      {/* 3. ORDER LOGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ... (Your existing history feed map logic goes here) ... */}
      </div>
    </div>
  );
}
