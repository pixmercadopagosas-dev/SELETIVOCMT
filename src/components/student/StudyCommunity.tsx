import React, { useState, useEffect } from 'react';
import { UserProfile, ChatMessage, Friendship } from '../../types';
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Send,
  ShieldAlert,
  AlertTriangle,
  Lock,
  HeartHandshake,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface StudyCommunityProps {
  currentUser: UserProfile;
}

export const StudyCommunity: React.FC<StudyCommunityProps> = ({ currentUser }) => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ request: Friendship; fromUser: UserProfile }[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchMessage, setSearchMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Chat state
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // Report state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    loadCommunityData();
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedFriend) {
      loadChat(selectedFriend.id);
    }
  }, [selectedFriend]);

  const loadCommunityData = async () => {
    const list = await db.getFriends(currentUser.id);
    const reqs = await db.getFriendRequests(currentUser.id);
    setFriends(list);
    setFriendRequests(reqs);

    if (list.length > 0 && !selectedFriend) {
      setSelectedFriend(list[0]);
    }
  };

  const loadChat = async (friendId: string) => {
    const msgs = await db.getMessages(currentUser.id, friendId);
    setMessages(msgs);
  };

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    try {
      await db.sendFriendRequest(currentUser.id, searchUsername.trim());
      setSearchMessage({ text: `Solicitação enviada para @${searchUsername.trim()}!`, isError: false });
      setSearchUsername('');
    } catch (err: any) {
      setSearchMessage({ text: err.message || 'Erro ao enviar solicitação.', isError: true });
    }
  };

  const handleRespondRequest = async (requestId: string, accept: boolean) => {
    await db.respondFriendRequest(currentUser.id, requestId, accept);
    await loadCommunityData();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend || !messageInput.trim()) return;

    try {
      const newMsg = await db.sendMessage(currentUser.id, selectedFriend.id, messageInput.trim());
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReport = async () => {
    if (!selectedFriend || !reportReason.trim()) return;
    await db.reportUserOrMessage(currentUser.id, selectedFriend.id, reportReason.trim());
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalOpen(false);
      setReportReason('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Community Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Ambiente Seguro & Protegido para Crianças</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Comunidade de Estudos Segura CMT XVII
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conecte-se exclusivamente com estudantes aprovados pela coordenação para trocar dicas e esclarecer dúvidas.
          </p>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Privacidade total: dados pessoais e notas nunca são compartilhados.</span>
        </div>
      </div>

      {/* Main Grid: Friends & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Friends List & Search */}
        <div className="space-y-4">
          {/* Add Friend Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-900" />
              Adicionar Colega de Estudos
            </h2>

            <form onSubmit={handleSendFriendRequest} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder="Nome de usuário (ex: anabeatriz)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                Enviar
              </button>
            </form>

            {searchMessage && (
              <p
                className={`text-[11px] font-bold ${
                  searchMessage.isError ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {searchMessage.text}
              </p>
            )}
          </div>

          {/* Pending Requests */}
          {friendRequests.length > 0 && (
            <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-4 space-y-3">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Solicitações Recebidas ({friendRequests.length})
              </h3>
              <div className="space-y-2">
                {friendRequests.map(({ request, fromUser }) => (
                  <div
                    key={request.id}
                    className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{fromUser.full_name}</p>
                      <p className="text-[11px] text-slate-500">@{fromUser.username}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRespondRequest(request.id, true)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                        title="Aceitar"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRespondRequest(request.id, false)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500"
                        title="Recusar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Meus Colegas ({friends.length})
            </h3>

            {friends.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Você ainda não adicionou nenhum colega. Digite o nome de usuário acima para começar!
              </p>
            ) : (
              <div className="space-y-1">
                {friends.map((friend) => {
                  const isSelected = selectedFriend?.id === friend.id;
                  return (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                          {friend.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{friend.full_name}</p>
                          <p className="text-[10px] text-slate-500">
                            @{friend.username} • {friend.grade === '6_ano' ? '6º Ano' : '7º Ano'}
                          </p>
                        </div>
                      </div>
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 cols: Chat View with Minor Security Controls */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    {selectedFriend.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {selectedFriend.full_name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      @{selectedFriend.username} • Estudante {selectedFriend.grade === '6_ano' ? '6º Ano' : '7º Ano'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Denunciar</span>
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {/* Security reminder banner */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center text-[11px] text-blue-900 font-medium">
                  Mensagens monitoradas pela moderação pedagógica do CMT XVII. Seja sempre respeitoso e foque nas matérias!
                </div>

                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl p-3.5 text-xs ${
                          isMine
                            ? 'bg-blue-900 text-white rounded-br-none shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                        }`}
                      >
                        {!isMine && (
                          <p className="text-[10px] font-bold text-blue-700 mb-1">
                            @{msg.sender_username}
                          </p>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            isMine ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.sent_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Escreva uma mensagem sobre os estudos..."
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Users className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Nenhum colega selecionado</p>
              <p className="text-xs text-slate-400 mt-1">
                Escolha um amigo na lista à esquerda para conversar sobre os conteúdos do edital.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Safety Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Denunciar Comportamento</h3>
                <p className="text-xs text-slate-500">
                  Denúncia enviada diretamente à Diretoria Geral do CMT XVII
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Qual foi o motivo da denúncia?
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Descreva o que aconteceu de forma clara..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>

            {reportSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                Denúncia registrada com sucesso. A coordenação avaliará o caso.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Enviar Denúncia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
