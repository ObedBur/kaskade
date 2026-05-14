"use client";

import React, { useEffect, useState, useRef } from "react";
import { User, Save, Mail, Phone, MapPin, Loader2, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function ClientProfilPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    quartier: "",
    avatarUrl: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        quartier: user.quartier || "",
        avatarUrl: user.avatarUrl || ""
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/uploads/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatarUrl: res.data.url }));
      toast.success("Photo de profil mise à jour localement. N'oubliez pas d'enregistrer.");
    } catch (err) {
      toast.error("Erreur lors de l'upload de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.patch("/auth/me", formData);
      await refreshUser();
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur mise à jour profil client :", err);
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-ocre" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col">
      <Navbar />
      
      <div className="flex-grow max-w-[1000px] mx-auto pt-32 pb-20 px-6 font-sans w-full">
      
      {/* HEADER */}
      <section className="mb-12">
        <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-4">Informations Personnelles</h2>
        <h1 className="text-4xl md:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
          Mon <span className="text-[#BC9C6C]">Profil.</span>
        </h1>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
        
        {/* COLONNE GAUCHE - INFOS FIXES */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-white border border-[#321B13]/10 rounded-2xl p-8 text-center flex flex-col items-center shadow-sm group">
            
            <div className="flex flex-col items-center">
              <div 
                className="relative w-32 h-32 mb-3 cursor-pointer overflow-hidden rounded-full border border-[#321B13]/10 flex items-center justify-center bg-[#FCFBF7] shadow-sm"
                onClick={handleAvatarClick}
              >
                {formData.avatarUrl ? (
                  <img 
                    src={getMediaUrl(formData.avatarUrl)} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-[#321B13]/20" />
                )}
                
                {/* Overlay au survol (plutôt pour desktop) */}
                <div className="absolute inset-0 bg-[#321B13]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-30">
                    <Loader2 className="w-8 h-8 animate-spin text-[#BC9C6C]" />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>

              {/* Bouton explicite très utile sur mobile */}
              <button 
                type="button" 
                onClick={handleAvatarClick}
                className="text-[10px] font-bold uppercase tracking-widest text-[#BC9C6C] hover:text-[#321B13] transition-colors mb-6 flex items-center gap-1.5 bg-[#BC9C6C]/10 px-3 py-1.5 rounded-full"
              >
                <Camera className="w-3 h-3" />
                Modifier la photo
              </button>
            </div>
            
            <h3 className="text-xl font-black text-[#321B13] uppercase tracking-tight mb-1">
              {user?.fullName}
            </h3>
            <p className="text-[10px] text-[#321B13]/50 uppercase tracking-[0.2em] font-bold mb-6">
              Client
            </p>

            <div className="w-full space-y-4 pt-6 border-t border-[#321B13]/10 text-left">
              <div className="flex items-center gap-3 text-[#321B13]/70">
                <Mail className="w-4 h-4 text-[#BC9C6C]" />
                <span className="text-xs font-medium truncate">{user?.email}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#321B13] p-8 rounded-2xl text-white space-y-4 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BC9C6C]">Espace Client</h4>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              Maintenez vos informations à jour pour faciliter le contact avec nos prestataires lors de vos demandes de service.
            </p>
          </div>
        </div>

        {/* COLONNE DROITE - FORMULAIRE */}
        <div className="md:col-span-8">
          <div className="bg-white border border-[#321B13]/10 rounded-2xl p-8 md:p-10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">
                  Nom Complet
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/30" />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#FCFBF7] border border-[#321B13]/10 rounded-xl py-4 pl-12 pr-4 text-sm text-[#321B13] font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/30" />
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: +243..."
                      className="w-full bg-[#FCFBF7] border border-[#321B13]/10 rounded-xl py-4 pl-12 pr-4 text-sm text-[#321B13] font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">
                    Localisation (Quartier)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/30" />
                    <input 
                      type="text" 
                      value={formData.quartier}
                      onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                      placeholder="Ex: Goma, Centre-ville"
                      className="w-full bg-[#FCFBF7] border border-[#321B13]/10 rounded-xl py-4 pl-12 pr-4 text-sm text-[#321B13] font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                 <button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-[#321B13] text-[#FCFBF7] px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   Enregistrer les modifications
                 </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
    <Footer />
  </div>
  );
}
