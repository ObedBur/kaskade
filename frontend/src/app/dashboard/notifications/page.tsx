"use client";

import React, { useEffect, useState } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Loader2, 
  Circle,
  Clock,
  Info,
  AlertTriangle,
  Briefcase
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  serviceId?: string;
  requestId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      // Si la réponse est paginée, extraire l'array
      setNotifications(res.data.data || res.data);
    } catch (err) {
      toast.error("Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    
    if (notif.type === 'SERVICE_CREATED' || notif.type === 'SERVICE_UPDATED') {
      router.push('/services');
    } else if (notif.type.includes('REQUEST')) {
      router.push('/dashboard/missions');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification supprimée");
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("Toutes les notifications marquées comme lues");
    } catch (err) {
      toast.error("Erreur lors de l'opération.");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-12 pb-20">
      
      {/* HEADER */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-[#321B13]/40 text-xs font-bold uppercase tracking-[0.3em] mb-4">Alertes Système</h2>
          <h1 className="text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
            Notifications<span className="text-[#BC9C6C]">.</span>
          </h1>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#BC9C6C] border-b border-[#BC9C6C]/20 hover:border-[#BC9C6C] pb-1 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Tout marquer comme lu
          </button>
        )}
      </section>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white border border-[#321B13]/5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {notifications.length > 0 ? (
            notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleNotificationClick(notif)}
                className={`group p-8 border-b border-[#321B13]/5 flex items-start gap-8 hover:bg-[#FCFBF7] transition-all relative cursor-pointer ${!notif.isRead ? 'bg-[#BC9C6C]/5' : ''}`}
              >
                {!notif.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#BC9C6C]"></div>
                )}

                <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${
                  notif.type.includes('REQUEST') ? 'bg-blue-50 text-blue-600' : 
                  notif.type.includes('AUTH') ? 'bg-green-50 text-green-600' :
                  notif.type.includes('PROVIDER') ? 'bg-ocre/10 text-ocre' : 'bg-gray-50 text-gray-400'
                }`}>
                  {notif.type.includes('REQUEST') ? <Briefcase className="w-5 h-5" /> : 
                   notif.type.includes('AUTH') ? <Check className="w-5 h-5" /> :
                   notif.type.includes('PROVIDER') ? <Info className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-sm font-black uppercase tracking-tight ${!notif.isRead ? 'text-[#321B13]' : 'text-[#321B13]/60'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[9px] font-bold text-[#321B13]/30 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed mb-4 ${!notif.isRead ? 'text-[#321B13]/70' : 'text-[#321B13]/40'}`}>
                    {notif.message}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                        className="text-[9px] font-black uppercase tracking-widest text-[#BC9C6C] hover:text-[#321B13] transition-colors"
                      >
                        Marquer comme lu
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="text-[9px] font-black uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-[#FCFBF7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 text-[#321B13]/5" />
              </div>
              <h4 className="text-sm font-black text-[#321B13]/40 uppercase tracking-[0.2em] mb-2">
                Tout est calme
              </h4>
              <p className="text-xs text-[#321B13]/30 max-w-xs mx-auto">
                Vous n'avez aucune notification pour le moment.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
