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
  X,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface NotificationsCenterProps {
  currentUser: UserProfile;
  onRefreshUnreadCount?: () => void;
  onNavigateToCommunity?: () => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  currentUser,
  onRefreshUnreadCount,
  onNavigateToCommunity,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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

  // Responder solicitação de amizade diretamente da notificação (Aceitar ou Recusar)
  const handleRespondFriendship = async (
    notif: AppNotification,
    accept: boolean
  ) => {
    if (!notif.friendship_id) return;
    setProcessingId(notif.id);

    try {
      await db.respondFriendRequest(currentUser.id, notif.friendship_id, accept);
      setActionSuccessMsg(
        accept
          ? `Amizade aceita com sucesso! Você e ${notif.from_full_name || notif.from_username || 'o colega'} já podem conversar na Comunidade Segura.`
          : 'Solicitação de amizade recusada.'
      );

      // Atualiza notificação na UI
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id
            ? {
                ...n,
                is_read: true,
                friendship_status: accept ? 'aceita' : 'recusada',
              }
            : n
        )
      );

      if (onRefreshUnreadCount) onRefreshUnreadCount();
      await loadNotifications();
    } catch (err: any) {
      alert(err.message || 'Erro ao processar solicitação.');
    } finally {
      setProcessingId(null);
    }
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
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-900" />
            Central de Notificações e Avisos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Solicitações de amizade de colegas, avisos oficiais e convites de estudo do CMT XVII.
          </p>
        </div>

        {onNavigateToCommunity && (
          <button
            onClick={onNavigateToCommunity}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <Users className="w-4 h-4 text-blue-700" />
            <span>Comunidade Segura</span>
          </button>
        )}
      </div>

      {/* Global Success Feedback Banner */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          {onNavigateToCommunity && (
            <button
              onClick={onNavigateToCommunity}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shrink-0 ml-3 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Abrir Chat</span>
            </button>
          )}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {notifications.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Nenhuma notificação no momento</p>
            <p className="text-[11px] text-slate-400">
              Quando alguém enviar uma solicitação de estudo ou a coordenação publicar um aviso, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isFriendshipRequest =
              notif.type === 'amizade' && !!notif.friendship_id;
            const isPending =
              notif.friendship_status === 'pendente' ||
              (!notif.friendship_status && isFriendshipRequest && !notif.is_read);

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                  notif.is_read ? 'bg-white' : 'bg-blue-50/40'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                      {isFriendshipRequest && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                          Colega de Estudos
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Interactive Accept / Decline actions for Friendship Request */}
                    {isFriendshipRequest && (
                      <div className="pt-2">
                        {isPending ? (
                          <div className="flex flex-wrap items-center gap-2 bg-white/90 p-3 rounded-xl border border-blue-200/80 shadow-2xs">
                            <span className="text-xs font-bold text-slate-800 w-full sm:w-auto mr-1">
                              Deseja aceitar o convite?
                            </span>
                            <button
                              disabled={processingId === notif.id}
                              onClick={() => handleRespondFriendship(notif, true)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aceitar Amizade</span>
                            </button>
                            <button
                              disabled={processingId === notif.id}
                              onClick={() => handleRespondFriendship(notif, false)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Recusar</span>
                            </button>
                          </div>
                        ) : notif.friendship_status === 'aceita' ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Amizade aceita! Vocês já são colegas de estudo.</span>
                            {onNavigateToCommunity && (
                              <button
                                onClick={onNavigateToCommunity}
                                className="ml-auto text-blue-900 underline text-xs font-bold"
                              >
                                Conversar no Chat
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 bg-slate-100 p-2 rounded-lg font-medium">
                            Solicitação recusada.
                          </div>
                        )}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(notif.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Right action button */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  {!notif.is_read && !isPending && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold shrink-0 transition-colors inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Marcar lida</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
