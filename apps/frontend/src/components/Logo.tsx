import React from 'react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`text-2xl font-black tracking-tighter text-[#F97415] uppercase ${className}`}>
      KASKADE
    </div>
  );
}
