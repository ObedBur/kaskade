"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Lock, 
  Bell, 
  Shield, 
  Trash2, 
  Loader2, 
  Save,
  Key,
  Globe,
  Eye,
  AlertTriangle
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ParametresPage() {
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/update-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      toast.success("Mot de passe mis à jour !");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du changement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* HEADER */}
      <section>
        <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-4">Configuration Système</h2>
        <h1 className="text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
          Paramètres<span className="text-[#BC9C6C]">.</span>
        </h1>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* NAV PARAMETRES */}
        <div className="xl:col-span-4 space-y-4">
          {[
            { id: 'security', label: 'Sécurité & Accès', icon: Shield, active: true },
            { id: 'notifs', label: 'Notifications', icon: Bell, active: false },
            { id: 'language', label: 'Langue & Région', icon: Globe, active: false },
            { id: 'danger', label: 'Zone Critique', icon: Trash2, active: false, color: 'text-red-500' },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-4 px-8 py-5 text-[11px] font-black uppercase tracking-widest transition-all border ${
                item.active 
                  ? 'bg-[#321B13] text-white border-[#321B13]' 
                  : 'bg-white text-[#321B13]/60 border-[#321B13]/5 hover:bg-[#321B13]/5'
              } ${item.color || ''}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="xl:col-span-8 space-y-16">
          
          {/* SECTION SECURITE */}
          <section className="bg-white border border-[#321B13]/5 p-12 space-y-10">
            <div className="flex items-center gap-4 border-b border-[#321B13]/5 pb-6">
              <Lock className="w-6 h-6 text-[#BC9C6C]" />
              <h3 className="text-xl font-black text-[#321B13] uppercase tracking-tighter">Changement de Mot de Passe</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40">Mot de passe actuel</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/20" />
                    <input 
                      type="password" 
                      required
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full bg-[#FCFBF7] border border-[#321B13]/10 py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#BC9C6C] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40">Nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/20" />
                      <input 
                        type="password" 
                        required
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="w-full bg-[#FCFBF7] border border-[#321B13]/10 py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#BC9C6C] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40">Confirmer</label>
                    <div className="relative">
                      <Eye className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/20" />
                      <input 
                        type="password" 
                        required
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full bg-[#FCFBF7] border border-[#321B13]/10 py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#BC9C6C] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-[#321B13] text-[#FCFBF7] px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Mettre à jour la sécurité
                </button>
              </div>
            </form>
          </section>

          {/* SECTION DANGER */}
          <section className="bg-red-50/30 border border-red-100 p-12">
             <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter">Désactivation du Compte</h3>
             </div>
             <p className="text-xs text-red-600/60 leading-relaxed mb-8 font-medium">
               La désactivation de votre compte prestataire entraînera l'annulation de vos missions en cours et votre retrait immédiat du catalogue public. Cette action est réversible par l'administration uniquement.
             </p>
             <button className="bg-red-600 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors">
               Désactiver mon espace prestataire
             </button>
          </section>

        </div>

      </div>
    </div>
  );
}
