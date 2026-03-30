"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Bell, Save, Key, Image as ImageIcon, Loader2 } from "lucide-react";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";

export default function AdminSettingsPage() {
  const { isLoading: authLoading, isAuthenticated, user } = useAdminGuard();
  const [dataLoading, setDataLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Pour les settings on peut simuler l'appel API qui charge les pref. depuis le backend
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data.settings || {});
      } catch (err) {
        console.error(err);
        // Les paramètres peuvent être gérés via localStorage si le backend échoue pour cette démo
      } finally {
        setDataLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated]);

  if (authLoading || (isAuthenticated && dataLoading)) {
    return <div className="p-12 flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="p-12">
      <header className="mb-16">
        <h1 className="text-4xl font-black tracking-tight mb-2">Paramètres du Compte</h1>
        <p className="text-slate-400 text-sm font-medium">Gérez vos informations administrateur et la sécurité de l'interface.</p>
      </header>

      <section className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 col-span-2">
         {/* Photo de profil */}
         <div className="flex items-center gap-8 mb-16 pb-12 border-b border-slate-50">
            <div className="relative group cursor-pointer">
               <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-xl group-hover:border-[#FF6B00]/20 transition-all">
                 <img src="https://i.pravatar.cc/150?u=admin" alt="Profil" className="w-full h-full object-cover" />
               </div>
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]">
                 <ImageIcon className="w-8 h-8 text-white" />
               </div>
            </div>
            <div>
               <h3 className="text-2xl font-black">{user?.fullName || "Administrateur"}</h3>
               <p className="text-sm font-bold text-[#BC9C6C] uppercase tracking-widest mb-4">Super Admin</p>
               <button className="px-5 py-2.5 bg-slate-50 text-slate-400 text-xs font-bold rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  Changer de photo
               </button>
            </div>
         </div>

         {/* Formulaire Informations Personnelles */}
         <h4 className="flex items-center gap-3 text-lg font-black mb-8">
            <User className="w-5 h-5 text-[#FF6B00]" /> Informations Personnelles
         </h4>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-3">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Prénom & Nom</label>
               <input 
                 defaultValue={user?.fullName || "Julian Thorne"}
                 className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/5 hover:border-slate-200 transition-all text-slate-700" 
               />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Adresse Email</label>
               <input 
                 defaultValue={user?.email || "julian@kaskade.com"}
                 className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/5 hover:border-slate-200 transition-all text-slate-700" 
               />
            </div>
         </div>

         {/* Sécurité */}
         <h4 className="flex items-center gap-3 text-lg font-black mb-8 border-t border-slate-50 pt-12">
            <Shield className="w-5 h-5 text-[#FF6B00]" /> Sécurité du Compte
         </h4>
         
         <div className="bg-slate-50 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                 <Key className="w-5 h-5" />
               </div>
               <div>
                 <h5 className="font-bold text-sm">Mot de passe</h5>
                 <p className="text-xs font-medium text-slate-400 mt-1">Dernière modification : il y a 3 mois</p>
               </div>
            </div>
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl shadow-sm hover:shadow-md hover:border-[#FF6B00]/30 transition-all whitespace-nowrap">
               Modifier le mot de passe
            </button>
         </div>

         {/* Bouton de sauvegarde */}
         <div className="flex justify-end pt-8 border-t border-slate-50">
            <button className="bg-[#FF6B00] text-white px-10 py-5 rounded-3xl font-bold flex items-center gap-3 text-sm shadow-2xl shadow-[#FF6B00]/20 hover:shadow-[#FF6B00]/30 transition-all active:scale-95">
               <Save className="w-5 h-5" /> Sauvegarder les modifications
            </button>
         </div>
      </section>
    </div>
  );
}
