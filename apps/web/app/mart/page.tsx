'use client';

import dynamic from 'next/dynamic';

const MartCanvas = dynamic(() => import('@/components/mart/MartCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center text-brand-muted">
      Loading 3D mart…
    </div>
  ),
});

export default function MartPage() {
  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <MartCanvas />
    </div>
  );
}