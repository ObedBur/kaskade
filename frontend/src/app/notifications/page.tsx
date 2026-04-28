"use client";

import { useState, useEffect } from "react";
import { 
  Bell, CheckCircle2, AlertCircle, Info, XCircle, 
  Trash2, Check, ArrowLeft, Loader2, Calendar
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { toast } from "sonner";

// Utilitaire pour le temps relatif sans dépendance externe
function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des notifications", err);
      toast.error("Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Toutes les notifications sont lues");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification supprimée");
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'WARNING': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connectez-vous</h2>
          <p className="text-gray-500 mb-8">Vous devez être connecté pour voir vos notifications.</p>
          <Link href="/login" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Retour
              </Link>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
              <p className="text-gray-500 font-medium">{notifications.length} message(s) au total</p>
            </div>
            
            {notifications.some(n => !n.isRead) && (
              <button 
                onClick={markAllRead}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Check className="w-4 h-4" /> Tout marquer comme lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`group relative bg-white border ${notif.isRead ? 'border-gray-100 opacity-80' : 'border-blue-100 shadow-md ring-1 ring-blue-50'} rounded-3xl p-6 transition-all hover:shadow-lg`}
                  >
                    <div className="flex gap-4">
                      {/* Icon Container */}
                      <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                        notif.type === 'SUCCESS' ? 'bg-green-50' : 
                        notif.type === 'WARNING' ? 'bg-amber-50' : 
                        notif.type === 'ERROR' ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        {getIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900 text-lg'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatRelativeTime(new Date(notif.createdAt))}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed mb-4 ${notif.isRead ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>
                          {notif.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                          {notif.link && (
                            <Link 
                              href={notif.link}
                              onClick={() => !notif.isRead && markAsRead(notif.id)}
                              className="text-xs font-black text-blue-600 hover:underline uppercase tracking-tighter"
                            >
                              Voir les détails
                            </Link>
                          )}
                          {!notif.isRead && (
                            <button 
                              onClick={() => markAsRead(notif.id)}
                              className="text-xs font-bold text-gray-400 hover:text-green-600 uppercase tracking-tighter"
                            >
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Delete Action */}
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {!notif.isRead && (
                      <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 scale-110 shadow-inner">
                    <Bell className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tout est calme ici</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">Vous n'avez pas de nouvelles notifications pour le moment.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
