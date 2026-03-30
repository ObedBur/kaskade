"use client";

import React, { useEffect, useState } from "react";
import { Search, Shield, Award, UserPlus, MoreVertical, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  tasks: number;
  rating: number;
};

export default function AdminUsersPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [dataLoading, setDataLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("TOUS");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les utilisateurs. L'API Backend est-elle prête ?");
      } finally {
        setDataLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated]);

  const filteredUsers = users.filter(u => {
    const roleMatch = filter === "TOUS" || u.role === filter;
    const searchMatch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                      u.email.toLowerCase().includes(search.toLowerCase());
    return roleMatch && searchMatch;
  });

  if (authLoading || (isAuthenticated && dataLoading)) {
    return <div className="p-12 flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-16 gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Gestion des Utilisateurs</h1>
          <p className="text-slate-400 text-sm font-medium">Données réelles (Prestataires et Clients) récupérées via API.</p>
        </div>
        
        <div className="flex-1 max-w-lg group relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-full py-5 px-14 text-sm focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/5 transition-all"
          />
        </div>
      </header>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-3xl text-center font-bold">
          {error}
        </div>
      ) : (
      <section className="space-y-12">
        <div className="flex justify-between items-end">
           <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
             {["TOUS", "PROVIDER", "CLIENT"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    filter === tab ? "bg-white text-[#FF6B00] shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab === "TOUS" ? "Tous" : tab === "PROVIDER" ? "Prestataires" : "Clients"}
                </button>
             ))}
           </div>
           <button className="bg-[#FF6B00] text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3 text-sm shadow-xl shadow-[#FF6B00]/10 hover:shadow-[#FF6B00]/20 transition-all active:scale-95">
              <UserPlus className="w-5 h-5" /> Ajouter manuellement
           </button>
        </div>

        {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {filteredUsers.map((user, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
             >
                <div className="absolute top-6 right-6">
                   <MoreVertical className="w-4 h-4 text-slate-300 cursor-pointer" />
                </div>
                <div className="flex flex-col items-center text-center">
                   <div className="w-20 h-20 rounded-3xl overflow-hidden mb-6 border-4 border-slate-50 shadow-sm relative group-hover:border-[#FF6B00]/20 transition-colors bg-slate-100 flex items-center justify-center font-black text-slate-400">
                      {user.name.split(' ').map(n=>n[0]).join('')}
                      {user.role === "PROVIDER" && (
                         <div className="absolute top-1 right-1 bg-[#BC9C6C] p-1 rounded-full text-white shadow-xl">
                            <Shield className="w-2.5 h-2.5 fill-white" />
                         </div>
                      )}
                   </div>
                   <h5 className="text-lg font-black tracking-tight mb-1 truncate w-full">{user.name}</h5>
                   <p className="text-[10px] text-[#BC9C6C] uppercase font-black tracking-widest mb-6">{user.role}</p>
                   
                   <div className="grid grid-cols-3 gap-4 w-full border-t border-slate-50 pt-6">
                      <div className="col-span-2 text-left">
                         <span className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Inscrit le</span>
                         <span className="text-xs font-black truncate block">{user.joined}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Tâches</span>
                         <span className="text-xs font-black">{user.tasks}</span>
                      </div>
                   </div>
                   
                   <div className="mt-8 flex gap-3 w-full">
                      <button className={`flex-1 py-3.5 rounded-2xl font-bold text-[10px] transition-all ${
                        user.status === "ACTIF" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                      }`}>
                         {user.status}
                      </button>
                      <button className="px-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                        <Award className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
        ) : (
          <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">
             Aucun utilisateur trouvé
          </div>
        )}
      </section>
      )}
    </div>
  );
}
