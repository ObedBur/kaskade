"use client";

import React, { useState } from "react";
import { Bell, Mail, Smartphone, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState({
    emailMissions: true,
    emailMarketing: false,
    pushAlerts: true,
  });

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Mock save since we don't have notification fields in DB yet
    setTimeout(() => {
      setLoading(false);
      toast.success("Préférences de notifications mises à jour.");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h3 className="text-xl font-black text-[#321B13] uppercase tracking-tight mb-2">Centre de Notifications</h3>
        <p className="text-sm text-[#321B13]/60 font-medium">
          Choisissez comment vous souhaitez être informé des activités sur Kaskade.
        </p>
      </div>

      <div className="bg-white border border-[#321B13]/10 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Section E-mail */}
        <div className="p-6 md:p-8 border-b border-[#321B13]/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FCFBF7] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#BC9C6C]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#321B13] uppercase">Notifications par E-mail</h4>
              <p className="text-xs text-[#321B13]/50 font-bold tracking-tight">Recevez les mises à jour importantes dans votre boîte.</p>
            </div>
          </div>

          <div className="space-y-4">
            <NotificationToggle 
              title="Nouvelles Missions & Demandes" 
              description="Soyez alerté dès qu'un nouveau service est demandé ou accepté."
              active={notifs.emailMissions}
              onToggle={() => toggleNotif('emailMissions')}
            />
            <NotificationToggle 
              title="Actualités & Offres" 
              description="Restez au courant des nouveautés et promotions Kaskade."
              active={notifs.emailMarketing}
              onToggle={() => toggleNotif('emailMarketing')}
            />
          </div>
        </div>

        {/* Section Push (Mobile) */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FCFBF7] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#BC9C6C]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#321B13] uppercase">Alertes Push</h4>
              <p className="text-xs text-[#321B13]/50 font-bold tracking-tight">Notifications en temps réel sur votre navigateur ou mobile.</p>
            </div>
          </div>

          <NotificationToggle 
            title="Alertes de navigation" 
            description="Activer les popups de notification lors de l'utilisation du site."
            active={notifs.pushAlerts}
            onToggle={() => toggleNotif('pushAlerts')}
          />
        </div>

        <div className="bg-[#FCFBF7] p-6 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-[#321B13] text-[#FCFBF7] px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#BC9C6C] hover:text-[#321B13] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer les préférences
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({ title, description, active, onToggle }: { title: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-6 p-4 rounded-xl border border-[#321B13]/5 hover:bg-[#FCFBF7] transition-colors">
      <div className="flex-1">
        <h5 className="text-xs font-black text-[#321B13] uppercase mb-1">{title}</h5>
        <p className="text-[10px] text-[#321B13]/60 font-medium leading-relaxed">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${active ? 'bg-[#BC9C6C]' : 'bg-[#321B13]/10'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'} shadow-sm`} />
      </button>
    </div>
  );
}
