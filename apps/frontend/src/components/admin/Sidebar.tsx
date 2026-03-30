"use client";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "../Logo";

const menuItems = [
  { name: "Tableau de bord", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Demandes de service", icon: MessageSquare, href: "/admin/requests" },
  { name: "Prestataires vérifiés", icon: Users, href: "/admin/users" },
  { name: "Analyse du marché", icon: BarChart3, href: "/admin/analytics" },
  { name: "Finances", icon: CreditCard, href: "/admin/financials" },
  { name: "Paramètres", icon: Settings, href: "/admin/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#321B13] h-screen fixed left-0 top-0 text-white flex flex-col z-50">
      <div className="p-8 pb-12">
        <div className="flex flex-col gap-1 items-start">
          <Logo className="h-8 fill-white" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#BC9C6C] font-bold mt-2">
            Admin Console
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative ${
                isActive 
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-white"}`} />
              <span className="font-semibold text-sm tracking-tight">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-white/5">
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#BC9C6C] flex items-center justify-center font-bold text-xs">
            JT
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">Julian Thorne</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">Super Admin</p>
          </div>
          <LogOut className="w-4 h-4 text-white/40 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}
