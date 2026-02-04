import CustomerView from '@/components/customer-view';
import { Suspense } from 'react';
import Image from 'next/image';

// Next.js 15: searchParams is now a Promise
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the params before accessing properties
  const resolvedParams = await searchParams;
  
  const tableId = typeof resolvedParams.table === 'string' ? resolvedParams.table : null;
  const isTakeAway = resolvedParams.mode === 'takeaway' || (!tableId);

  return (
    <Suspense 
      fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#e76876]">
          <div className="bg-white rounded-full p-4">
            <Image 
              src="https://firebasestorage.googleapis.com/v0/b/grillicious-backend.firebasestorage.app/o/Grillicious-logo.webp?alt=media&token=efbfa1e4-5a67-417f-aff0-bef82099852a" 
              alt="Grillicious Logo" 
              width={300} 
              height={75} 
              className="animate-pulse" 
            />
          </div>
        </div>
      }
    >
      <CustomerView tableId={tableId} mode={isTakeAway ? 'takeaway' : 'dine-in'} />
    </Suspense>
  );
}
