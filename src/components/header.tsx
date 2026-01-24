"use client"

import SessionTimer from "@/components/session-timer";

type HeaderProps = {
  tableId: string | null;
  onCartClick: () => void;
  timeLeft: number;
};

export function Header({ tableId, timeLeft }: HeaderProps) {
  return (
    // Z-index 50 ensures it stays above the menu
    <header className="sticky top-0 z-50 w-full bg-zinc-900 border-b-2 border-[#d4af37]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Branding */}
        <div className="flex flex-col">
          <span className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">
            Grillicious
          </span>
          <span className="text-[8px] font-bold text-[#d4af37] uppercase tracking-widest mt-0.5">
            Street Food
          </span>
        </div>

        <div className="flex items-center gap-3">
          {tableId && (
            <>
              {/* Compact Timer Pill */}
              <div className="flex items-center bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                <SessionTimer timeLeft={timeLeft} />
              </div>
              
              {/* PROJECTED TABLE ID BADGE */}
              <div className="relative">
                <div className="
                  /* Positioning: Moves it slightly down to hang off the header */
                  translate-y-4
                  flex flex-col items-center justify-center
                  min-w-[60px] h-[60px] 
                  rounded-2xl border-4 border-zinc-900 
                  bg-[#d4af37] text-zinc-900 
                  shadow-[4px_4px_0_0_#ffffff]
                ">
                  <span className="text-[9px] uppercase font-black leading-none mb-0.5">
                    Table
                  </span>
                  <span className="text-2xl font-black leading-none tracking-tighter">
                    {tableId}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}