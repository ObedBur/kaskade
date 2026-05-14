"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function DangerZonePage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await api.delete("/auth/me");
      toast.success("Votre compte a été désactivé. Nous espérons vous revoir bientôt !");
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Erreur désactivation compte:", err);
      toast.error("Une erreur est survenue lors de la désactivation du compte.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h3 className="text-xl font-black text-red-600 uppercase tracking-tight mb-2">Zone de Danger</h3>
        <p className="text-sm text-[#321B13]/60 font-medium">
          Actions irréversibles concernant votre compte Kaskade. Soyez prudent.
        </p>
      </div>

      <div className="bg-white border border-red-600/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-red-50/30">
          <div className="max-w-xl">
            <h4 className="text-sm font-black text-red-600 uppercase mb-2">Désactiver mon compte</h4>
            <p className="text-xs text-[#321B13]/70 font-medium leading-relaxed">
              En désactivant votre compte, vous ne pourrez plus vous connecter et vos services ne seront plus visibles. 
              Vos données seront conservées de manière anonyme conformément à notre politique de confidentialité, 
              mais vous pourrez demander une réactivation via notre support.
            </p>
          </div>
          <button 
            onClick={() => setShowConfirm(true)}
            className="bg-red-600 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Désactiver le compte
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-[#321B13]/80 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => !loading && setShowConfirm(false)}
          />
          
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowConfirm(false)}
              className="absolute top-6 right-6 text-[#321B13]/30 hover:text-[#321B13] transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-2xl font-black text-[#321B13] uppercase tracking-tighter mb-4 leading-tight">
              Êtes-vous <span className="text-red-600">absolument sûr ?</span>
            </h3>
            
            <p className="text-sm text-[#321B13]/60 font-medium leading-relaxed mb-8">
              Cette action désactivera immédiatement votre accès à la plateforme Kaskade. Toutes vos missions en cours seront suspendues.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeactivate}
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Oui, désactiver mon compte
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="w-full bg-[#FCFBF7] text-[#321B13]/60 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#321B13] transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
