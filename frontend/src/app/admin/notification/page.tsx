"use client";

import React, { useEffect, useState } from 'react';
import { useAdminGuard } from '@/lib/use-admin-guard';
import api from '@/lib/api';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info,
  Trash2,
  MoreVertical,
  Loader2
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      // Handle both paginated response { data: [] } and direct array
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

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
      case 'REQUEST_CREATED':
      case 'PROVIDER_APPLY_SUBMITTED':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'PAYMENT_DEPOSIT_CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'REQUEST_REJECTED':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#321B13]">
            Notifications
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BC9C6C] mt-2">
            Système Central <span className="text-gray-300">/</span> {unreadCount} non lues
          </p>
        </div>
        
        <button 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="px-6 py-3 bg-[#321B13] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#BC9C6C] transition-colors disabled:opacity-30"
        >
          Tout marquer comme lu
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`group relative flex items-start gap-6 p-8 border transition-all cursor-pointer ${
                n.isRead 
                  ? "bg-white border-gray-100 opacity-60" 
                  : "bg-white border-[#BC9C6C]/30 shadow-sm hover:border-[#BC9C6C]"
              }`}
            >
              {/* Status Indicator */}
              {!n.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#BC9C6C]" />
              )}

              {/* Icon Container */}
              <div className={`w-12 h-12 flex items-center justify-center rounded-none flex-shrink-0 ${
                n.isRead ? "bg-gray-100" : "bg-[#BC9C6C]/10"
              }`}>
                {getIcon(n.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-sm font-black uppercase tracking-tight ${
                    n.isRead ? "text-gray-500" : "text-[#321B13]"
                  }`}>
                    {n.title}
                  </h3>
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${
                  n.isRead ? "text-gray-400" : "text-gray-600 font-medium"
                }`}>
                  {n.message}
                </p>
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
             <Bell className="w-12 h-12 text-gray-100" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Aucune notification pour le moment</p>
          </div>
        )}
      </div>

    </div>
  );
}
