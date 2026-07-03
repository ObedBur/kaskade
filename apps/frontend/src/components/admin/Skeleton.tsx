import React from "react";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-[#321B13]/5 rounded-xl ${className}`}
      {...props}
    />
  );
}

// 1. Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 font-sans">
      {/* 5 Stats Cards - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white p-6 border border-gray-100 rounded-none shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <Skeleton className="w-9 h-9 !rounded-none" />
              <Skeleton className="w-12 h-3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-20 h-6" />
              <Skeleton className="w-16 h-3" />
            </div>
            <div className="pt-4 border-t border-gray-50">
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Requests (40%) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <Skeleton className="w-36 h-4" />
            <Skeleton className="w-12 h-3" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border-b border-gray-50 last:border-0">
                <Skeleton className="w-10 h-10 !rounded-none" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-28 h-4" />
                    <Skeleton className="w-14 h-4" />
                  </div>
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users (40%) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-12 h-3" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
                <Skeleton className="w-10 h-10 !rounded-none" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-32 h-3" />
                </div>
                <Skeleton className="w-12 h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Summary Breakdown (20%) */}
        <div className="lg:col-span-1 bg-white border border-gray-100 shadow-sm p-8 flex flex-col">
          <Skeleton className="w-20 h-4 mb-8 pb-4 border-b border-gray-50 w-full" />
          <div className="space-y-10 w-full flex-1 flex flex-col justify-start pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <Skeleton className="w-14 h-3" />
                  <Skeleton className="w-8 h-5" />
                </div>
                <Skeleton className="w-full h-[3px] !rounded-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Full Width */}
      <div className="w-full bg-[#321B13] p-16 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="max-w-2xl space-y-4 w-full">
            <Skeleton className="w-28 h-3 bg-white/10" />
            <Skeleton className="w-72 h-8 bg-white/10" />
            <Skeleton className="w-96 h-6 bg-white/10" />
            <Skeleton className="w-full h-10 bg-white/5" />
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="p-10 border border-white/10 bg-white/5 text-center min-w-[160px] space-y-3">
              <Skeleton className="w-12 h-8 bg-white/10 mx-auto" />
              <Skeleton className="w-16 h-3 bg-white/15 mx-auto" />
            </div>
            <div className="p-10 border border-white/10 bg-white/5 text-center min-w-[160px] space-y-3">
              <Skeleton className="w-12 h-8 bg-white/10 mx-auto" />
              <Skeleton className="w-16 h-3 bg-white/15 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Clients Skeleton
export function ClientsSkeleton() {
  return (
    <div className="font-sans relative space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="w-64 h-12" />
          <Skeleton className="w-48 h-3" />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
          <Skeleton className="w-full md:w-72 h-12" />
          <Skeleton className="w-36 h-12" />
        </div>
      </div>

      {/* Primary KPI Grid (Bento) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#321B13]/5 p-5 md:p-6 rounded-3xl flex flex-col justify-between min-h-[140px]">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <div className="space-y-2 mt-4">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-32 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Layout: Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Main Repertoire (2/3) */}
        <div className="lg:col-span-2 bg-white border border-[#321B13]/5 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10 border-b border-[#321B13]/5 pb-8">
            <div className="space-y-2">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-3" />
            </div>
          </div>

          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-6 border-b border-[#321B13]/5 last:border-0 gap-4">
                <div className="flex items-center gap-6 flex-1">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="w-32 h-4" />
                    <div className="flex gap-4">
                      <Skeleton className="w-20 h-3" />
                      <Skeleton className="w-36 h-3" />
                    </div>
                  </div>
                </div>
                <div className="w-32 space-y-1">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
                <div className="w-14 flex flex-col items-center gap-1">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="w-8 h-3" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-10 h-10 rounded-2xl" />
                  <Skeleton className="w-10 h-10 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Column (1/3) */}
        <div className="lg:col-span-1 bg-white border border-[#321B13]/5 rounded-3xl p-10 shadow-sm flex flex-col min-h-[460px]">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-2">
              <Skeleton className="w-36 h-5" />
              <Skeleton className="w-44 h-3" />
            </div>
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <div className="flex-1 w-full flex items-end justify-between gap-2 px-2 py-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-lg bg-[#BC9C6C]/10"
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>
          <div className="mt-10 pt-10 border-t border-[#321B13]/5 flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="w-12 h-8" />
              <Skeleton className="w-24 h-3" />
            </div>
            <div className="space-y-2 text-right flex flex-col items-end">
              <Skeleton className="w-16 h-5 rounded-md" />
              <Skeleton className="w-8 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Prestataires Skeleton
export function PrestatairesSkeleton() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 flex-1">
          <Skeleton className="w-72 h-10" />
          <Skeleton className="w-96 h-3" />
        </div>
        <Skeleton className="w-full md:w-96 h-12 rounded-2xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-50 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-2">
            <Skeleton className="w-12 h-8" />
            <Skeleton className="w-16 h-3" />
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 w-full md:w-fit">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-24 h-9 rounded-xl bg-white" />
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="w-36 h-4" />
              <Skeleton className="w-48 h-3" />
            </div>
            <div className="hidden md:block w-36 space-y-1.5">
              <Skeleton className="w-8 h-3 ml-auto" />
              <Skeleton className="w-20 h-4 ml-auto" />
            </div>
            <div className="hidden lg:block w-28 space-y-1.5">
              <Skeleton className="w-10 h-3 ml-auto" />
              <Skeleton className="w-24 h-4 ml-auto" />
            </div>
            <Skeleton className="w-24 h-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Services Skeleton
export function ServicesSkeleton() {
  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="w-72 h-12" />
          <Skeleton className="w-56 h-3" />
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <Skeleton className="w-full md:w-72 h-12" />
          <Skeleton className="w-44 h-12" />
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-4 md:p-6 border border-gray-50 rounded-2xl flex items-center gap-4 min-h-[110px]">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="w-10 h-6" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-start">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="w-36 h-6" />
              <Skeleton className="w-full h-10" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-5" />
              <Skeleton className="w-10 h-4 rounded-full" />
            </div>
            <Skeleton className="w-full h-11 rounded-xl" />
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Requests Skeleton
export function RequestsSkeleton() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <Skeleton className="w-80 h-12" />
          <Skeleton className="w-64 h-3" />
        </div>
        <Skeleton className="w-full md:w-96 h-14 rounded-full" />
      </div>

      {/* Main Box */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl">
        <div className="flex justify-between items-center mb-12">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-32 h-10 rounded-2xl" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl border border-slate-50 gap-6">
              <div className="flex items-center gap-6 flex-1">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="w-1/2 h-5" />
                  <Skeleton className="w-1/3 h-3" />
                </div>
              </div>
              <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto">
                <Skeleton className="w-20 h-5" />
                <div className="flex gap-2">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <Skeleton className="w-9 h-9 rounded-xl" />
                </div>
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 6. Revenus Skeleton
export function RevenusSkeleton() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <Skeleton className="w-64 h-12" />
          <Skeleton className="w-44 h-3" />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Skeleton className="w-full md:w-72 h-12" />
          <Skeleton className="w-36 h-12 rounded-3xl shrink-0" />
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <Skeleton className="w-12 h-12 rounded-2xl animate-pulse" />
              <Skeleton className="w-16 h-3" />
            </div>
            <div className="space-y-2 mt-6">
              <Skeleton className="w-24 h-8" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl">
        <div className="flex justify-between items-center mb-12">
          <Skeleton className="w-56 h-7" />
          <div className="flex gap-4">
            <Skeleton className="w-20 h-9 rounded-2xl" />
            <Skeleton className="w-20 h-9 rounded-2xl" />
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-[2rem] border border-slate-50 gap-4">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="w-44 h-4" />
                  <Skeleton className="w-28 h-3" />
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-8">
                <Skeleton className="w-20 h-5" />
                <Skeleton className="w-20 h-8 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 7. Notifications Skeleton
export function NotificationsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-gray-100">
        <div className="space-y-3">
          <Skeleton className="w-48 h-10" />
          <Skeleton className="w-36 h-3" />
        </div>
        <Skeleton className="w-44 h-12" />
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 sm:gap-6 p-4 md:p-8 bg-white border border-gray-100 rounded-none relative">
            <Skeleton className="w-12 h-12" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-24 h-3" />
              </div>
              <Skeleton className="w-11/12 h-10" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full self-center sm:self-auto hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
