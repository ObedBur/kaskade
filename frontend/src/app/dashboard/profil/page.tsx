"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  User, 
  Camera, 
  Save, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfilPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    metier: "",
    experience: "",
    quartier: "",
    avatarUrl: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.bio || "",
        metier: user.metier || "",
        experience: user.experience || "",
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
    
    console.log("DEBUG: Envoi des données de profil...", formData);

    try {
      const res = await api.patch("/provider/profile", formData);
      console.log("DEBUG: Réponse du serveur après mise à jour :", res.data);
      
      await refreshUser();
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      console.error("DEBUG: Erreur lors de la mise à jour du profil :", err);
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  const getFullAvatarUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    return `${baseUrl.replace('/api/v1', '')}${url}`;
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* HEADER */}
      <section>
        <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-4">Identité Professionnelle</h2>
        <h1 className="text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
          Mon <span className="text-[#BC9C6C]">Profil.</span>
        </h1>
      </section>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* AVATAR & STATUT */}
        <div className="xl:col-span-4 space-y-12">
          <div className="bg-white border border-[#321B13]/5 p-12 text-center flex flex-col items-center group">
            <div 
              className="relative w-40 h-40 mb-8 cursor-pointer overflow-hidden"
              onClick={handleAvatarClick}
            >
              <div className="w-full h-full bg-[#FCFBF7] border border-[#321B13]/10 flex items-center justify-center relative z-10">
                {formData.avatarUrl ? (
                  <img 
                    src={getFullAvatarUrl(formData.avatarUrl)!} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-[#321B13]/10" />
                )}
              </div>
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
            
            <h3 className="text-2xl font-black text-[#321B13] uppercase tracking-tighter mb-2">{user?.fullName}</h3>
            <div className="flex items-center gap-2 text-[#BC9C6C] mb-8">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Prestataire Certifié</span>
            </div>

            <div className="w-full space-y-4 pt-8 border-t border-[#321B13]/5">
              <div className="flex items-center gap-3 text-[#321B13]/60">
                <Mail className="w-4 h-4 text-[#BC9C6C]" />
                <span className="text-xs font-bold">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#321B13]/60">
                <Phone className="w-4 h-4 text-[#BC9C6C]" />
                <span className="text-xs font-bold">{user?.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-[#321B13]/60">
                <MapPin className="w-4 h-4 text-[#BC9C6C]" />
                <span className="text-xs font-bold">{formData.quartier || "Non renseigné"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#321B13] p-10 text-white space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BC9C6C]">Réviser mon profil</h4>
            <p className="text-xs text-white/50 leading-relaxed font-medium">
              Votre profil est la première image que les clients et l'administration ont de votre expertise. Soyez précis et professionnel dans vos descriptions.
            </p>
          </div>
        </div>

        {/* CHAMPS D'ÉDITION */}
        <div className="xl:col-span-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">Métier Principal</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/20" />
                <input 
                  type="text" 
                  value={formData.metier}
                  onChange={(e) => setFormData({ ...formData, metier: e.target.value })}
                  placeholder="Ex: Plombier Expert"
                  className="w-full bg-white border border-[#321B13]/10 rounded-none py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">Localisation (Quartier)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#321B13]/20" />
                <input 
                  type="text" 
                  value={formData.quartier}
                  onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                  placeholder="Ex: Goma, Centre-ville"
                  className="w-full bg-white border border-[#321B13]/10 rounded-none py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">Résumé de l'Expérience</label>
            <textarea 
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              rows={4}
              placeholder="Décrivez votre parcours, vos années d'expérience..."
              className="w-full bg-white border border-[#321B13]/10 rounded-none p-6 text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#321B13]/40 ml-1">Biographie (Vision & Engagement)</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              placeholder="Ex: Passionné par l'artisanat d'excellence..."
              className="w-full bg-white border border-[#321B13]/10 rounded-none p-6 text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="pt-8 flex justify-end">
             <button 
              type="submit"
              disabled={loading}
              className="bg-[#321B13] text-[#FCFBF7] px-12 py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all disabled:opacity-50"
             >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Enregistrer les modifications
             </button>
          </div>

        </div>

      </form>
    </div>
  );
}
