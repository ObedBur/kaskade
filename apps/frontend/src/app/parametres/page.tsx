"use client";

import React, { useState } from "react";
import { KeyRound, Save, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/me", { password: formData.password });
      toast.success("Votre mot de passe a été mis à jour avec succès.");
      setFormData({ password: "", confirmPassword: "" });
    } catch (err) {
      console.error("Erreur màj mot de passe:", err);
      toast.error("Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h3 className="text-xl font-black text-[#321B13] uppercase tracking-tight mb-2">Sécurité du compte</h3>
        <p className="text-sm text-[#321B13]/60 font-medium">
          Mettez à jour votre mot de passe pour sécuriser votre accès.
        </p>
      </div>

      <div className="bg-white border border-[#321B13]/10 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">
              Nouveau Mot de Passe
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/30" />
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Au moins 8 caractères"
                className="w-full bg-[#FCFBF7] border border-[#321B13]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#321B13] font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/30" />
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Répétez le mot de passe"
                className="w-full bg-[#FCFBF7] border border-[#321B13]/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#321B13] font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#321B13]/40 tracking-widest">
              <AlertCircle className="w-3 h-3" />
              <span>Connexion requise après modif.</span>
            </div>
            <button 
              type="submit"
              disabled={loading || !formData.password || !formData.confirmPassword}
              className="bg-[#321B13] text-[#FCFBF7] px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Mettre à jour
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
