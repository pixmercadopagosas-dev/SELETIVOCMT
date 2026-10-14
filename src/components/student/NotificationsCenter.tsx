import React, { useState, useEffect } from 'react';
import { UserProfile, AppNotification } from '../../types';
import {
  Bell,
  CheckCircle2,
  Users,
  Award,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface NotificationsCenterProps {
  currentUser: UserProfile;
  onRefreshUnreadCount?: () => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  currentUser,
  onRefreshUnreadCount,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [currentUser.id]);

  const loadNotifications = async () => {
    const list = await db.getUserNotifications(currentUser.id);
    setNotifications(list);
  };

  const handleMarkAsRead = async (notifId: string) => {
    await db.markNotificationAsRead(currentUser.id, notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    if (onRefreshUnreadCount) onRefreshUnreadCount();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'aprovacao':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'amizade':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'conquista':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'simulado':
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-900" />
            Central de Notificações e Avisos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Informações oficiais, convites de estudos e avisos da coordenação do CMT XVII.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 py-10 text-center">
            Nenhuma notificação no momento.
          </p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                notif.is_read ? 'bg-white' : 'bg-blue-50/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{notif.title}</h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(notif.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold shrink-0 transition-colors inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Marcar lida</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
