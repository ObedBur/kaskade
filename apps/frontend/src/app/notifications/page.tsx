"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info,
  Trash2,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function ClientNotificationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const result = res.data;
      setNotifications(Array.isArray(result) ? result : result.data ?? []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, authLoading]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'REQUEST_ACCEPTED':
      case 'PAYMENT_DEPOSIT_CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'SERVICE_CREATED':
      case 'AUTH_WELCOME':
        return <Info className="w-5 h-5 text-ocre" />;
      case 'REQUEST_REJECTED':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <Loader2 className="w-8 h-8 animate-spin text-ocre" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#FCFBF7]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 min-[480px]:px-8 min-[1440px]:p-12 py-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-chocolat">Mes Notifications</h1>
            <p className="text-ocre text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              {unreadCount} message(s) non lu(s)
            </p>
          </div>
          
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-6 py-3 bg-chocolat text-white text-[10px] font-black uppercase tracking-widest hover:bg-ocre hover:text-chocolat transition-all disabled:opacity-30 rounded-[4px]"
          >
            Tout marquer comme lu
          </button>
        </div>

        {/* Notifications list */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`relative flex items-start gap-6 p-6 md:p-8 bg-white border transition-all cursor-pointer rounded-[4px] ${
                  n.isRead 
                    ? "border-gray-50 opacity-60" 
                    : "border-ocre/30 shadow-sm hover:border-ocre"
                }`}
              >
                {/* Unread dot */}
                {!n.isRead && (
                   <span className="absolute top-8 left-3 w-1.5 h-1.5 bg-ocre rounded-full" />
                )}

                <div className={`w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0 ${
                  n.isRead ? "bg-gray-50" : "bg-ocre/10"
                }`}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-1">
                    <h3 className={`text-sm font-bold ${
                      n.isRead ? "text-gray-500" : "text-chocolat"
                    }`}>
                      {n.title}
                    </h3>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    n.isRead ? "text-gray-400" : "text-chocolat/70"
                  }`}>
                    {n.message}
                  </p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 text-gray-200 hover:text-red-400">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-2xl">
               <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Aucune notification pour le moment</p>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
