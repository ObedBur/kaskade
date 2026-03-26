"use client";

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50">
      <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <a className="text-2xl font-extrabold tracking-tighter text-[#0F172A]" href="#">
          Kaskade.com
        </a>
        <div className="hidden md:flex items-center gap-10">
          <a className="text-[#1A73E8] font-semibold text-sm" href="#">Marketplace</a>
          <a className="text-[#475569] hover:text-[#1A73E8] transition-colors font-semibold text-sm" href="#">Services</a>
          <a className="text-[#475569] hover:text-[#1A73E8] transition-colors font-semibold text-sm" href="#">Process</a>
          <a className="text-[#475569] hover:text-[#1A73E8] transition-colors font-semibold text-sm" href="#">About</a>
        </div>
        <button className="bg-[#1A73E8] text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#1A73E8]/20 hover:shadow-[#1A73E8]/30 transition-all duration-200 active:scale-[0.97]">
          Get Started
        </button>
      </nav>
    </header>
  );
}
