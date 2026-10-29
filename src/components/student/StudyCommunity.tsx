import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Clock,
  UserCheck,
  Smile,
  RefreshCw,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface StudyCommunityProps {
  currentUser: UserProfile;
}

export const StudyCommunity: React.FC<StudyCommunityProps> = ({ currentUser }) => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ request: Friendship; fromUser: UserProfile }[]>([]);
  const [sentRequests, setSentRequests] = useState<{ request: Friendship; toUser: UserProfile }[]>([]);
  const [suggestedPeers, setSuggestedPeers] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Chat state
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Report state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Initial load
  useEffect(() => {
    loadCommunityData();
  }, [currentUser.id]);

  // Live filter when search query changes
  useEffect(() => {
    const handleLiveSearch = async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }
      const results = await db.searchStudents(q, currentUser.id);
      setSearchResults(results);
    };

    handleLiveSearch();
  }, [searchQuery, currentUser.id]);

  // Load chat when selected friend changes
  useEffect(() => {
    if (selectedFriend) {
      loadChat(selectedFriend.id);
    }
  }, [selectedFriend]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  const loadCommunityData = async () => {
    const list = await db.getFriends(currentUser.id);
    const reqs = await db.getFriendRequests(currentUser.id);
    const sent = await db.getSentFriendRequests(currentUser.id);
    const suggestions = await db.getSuggestedStudents(currentUser.id);

    setFriends(list);
    setFriendRequests(reqs);
    setSentRequests(sent);
    setSuggestedPeers(suggestions);

    // If there are friends and no selected friend, select the first one
    if (list.length > 0 && !selectedFriend) {
      setSelectedFriend(list[0]);
    } else if (selectedFriend && !list.some((f) => f.id === selectedFriend.id)) {
      setSelectedFriend(list[0] || null);
    }
  };

  const loadChat = async (friendId: string) => {
    const msgs = await db.getMessages(currentUser.id, friendId);
    setMessages(msgs);
  };

  // Helper to determine friendship status with a specific user
  const getUserRelation = (targetUserId: string): 'friends' | 'received' | 'sent' | 'none' => {
    if (friends.some((f) => f.id === targetUserId)) return 'friends';
    if (friendRequests.some((r) => r.fromUser.id === targetUserId)) return 'received';
    if (sentRequests.some((s) => s.toUser.id === targetUserId)) return 'sent';
    return 'none';
  };

  // Enviar solicitação de amizade
  const handleSendRequest = async (targetUsername: string) => {
    try {
      await db.sendFriendRequest(currentUser.id, targetUsername);
      setSearchMessage({ text: `Solicitação de estudo enviada para @${targetUsername}!`, isError: false });
      await loadCommunityData();
    } catch (err: any) {
      setSearchMessage({ text: err.message || 'Erro ao enviar solicitação.', isError: true });
    }
  };

  // Aceitar / Recusar solicitação recebida
  const handleRespondRequest = async (requestId: string, accept: boolean) => {
    try {
      await db.respondFriendRequest(currentUser.id, requestId, accept);
      setSearchMessage({
        text: accept ? 'Solicitação aceita! Vocês já podem estudar juntos.' : 'Solicitação recusada.',
        isError: false,
      });
      await loadCommunityData();
    } catch (err: any) {
      setSearchMessage({ text: err.message || 'Erro ao processar solicitação.', isError: true });
    }
  };

  // Aceitar amizade imediatamente / Conectar diretamente para trocar ideias
  const handleInstantConnect = async (peer: UserProfile) => {
    try {
      await db.acceptFriendship(currentUser.id, peer.id);
      setSearchMessage({
        text: `Parabéns! Você e ${peer.full_name} agora são colegas de estudo!`,
        isError: false,
      });
      await loadCommunityData();
      setSelectedFriend(peer);
    } catch (err: any) {
      setSearchMessage({ text: err.message || 'Erro ao conectar.', isError: true });
    }
  };

  // Enviar mensagem no chat
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || messageInput).trim();
    if (!selectedFriend || !content) return;

    try {
      const newMsg = await db.sendMessage(currentUser.id, selectedFriend.id, content);
      setMessages((prev) => [...prev, newMsg]);
      if (!textToSend) setMessageInput('');

      // Simulação pedagógica de resposta do colega para trocar ideias
      triggerPeerResponse(content, selectedFriend);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Resposta inteligente do colega de estudo para enriquecer a troca de ideias
  const triggerPeerResponse = (question: string, peer: UserProfile) => {
    const qLower = question.toLowerCase();
    setIsPeerTyping(true);

    setTimeout(async () => {
      let reply = `Oi ${currentUser.full_name.split(' ')[0]}! Que legal estudar juntos para o CMT XVII! Vamos focar bastante no edital!`;

      if (qLower.includes('mmc') || qLower.includes('mdc')) {
        reply = `Oi! Eu gosto de resolver MMC fatorando os números ao mesmo tempo com os primos (2, 3, 5...). No final multiplico todos os fatores e dá certinho o denominador comum!`;
      } else if (qLower.includes('frac') || qLower.includes('fraç')) {
        reply = `Sobre frações: quando os denominadores são diferentes, eu uso o método da borboleta ou tiro o MMC! Não se esqueça de simplificar no final para a forma irredutível.`;
      } else if (qLower.includes('silab') || qLower.includes('siláb') || qLower.includes('separ')) {
        reply = `Para divisão silábica eu uso o macete do aplauso: bato palmas devagar para cada emissão de voz! Lembre-se que dígrafos como RR e SS sempre se separam, mas CH e LH nunca se separam!`;
      } else if (qLower.includes('oxíton') || qLower.includes('oxiton') || qLower.includes('acentu')) {
        reply = `Para acentuação, chame a palavra no portão como se chamasse um vizinho! A sílaba que você prolongar mais é a sílaba tônica. Se for a última é oxítona, penúltima é paroxítona!`;
      } else if (qLower.includes('simulado') || qLower.includes('prova')) {
        reply = `Já comecei o simulado baseado nas provas anteriores do CMT! Consegui uma pontuação boa em Português e estou revisando as continhas de Matemática. E você?`;
      } else if (qLower.includes('horário') || qLower.includes('estudar') || qLower.includes('estudo')) {
        reply = `Meu plano de estudos é fazer 30 minutos de teoria e depois resolver 10 questões comentadas todos os dias aqui na plataforma. A disciplina é fundamental!`;
      } else if (qLower.includes('ola') || qLower.includes('olá') || qLower.includes('oi') || qLower.includes('bom dia') || qLower.includes('boa tarde')) {
        reply = `Oi ${currentUser.full_name.split(' ')[0]}! Tudo pronto para os estudos de hoje? Qualquer dúvida sobre as questões de Matemática ou Português, manda aqui pra gente debater!`;
      }

      try {
        const peerMsg = await db.sendMessage(peer.id, currentUser.id, reply);
        setMessages((prev) => [...prev, peerMsg]);
      } catch (e) {
        console.warn('Erro ao salvar resposta do colega:', e);
      } finally {
        setIsPeerTyping(false);
      }
    }, 1800);
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

  // Sugestões de tópicos para iniciar conversa e trocar ideias de estudos
  const studyTopicStarters = [
    { label: '🔢 Tirar dúvida de MMC', text: 'Oi colega! Como você costuma calcular o MMC nas questões de frações?' },
    { label: '📖 Dica de Divisão Silábica', text: 'Você sabe um macete bom para não errar separação silábica na prova do CMT?' },
    { label: '📝 Simulado Anterior', text: 'Você já fez as questões da prova anterior de 2016 e 2018? O que achou?' },
    { label: '⏰ Horário de Estudos', text: 'Quantas horas você está estudando por dia para a prova do Colégio Militar?' },
  ];

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
            Conecte-se com colegas de turma aprovados pela coordenação para trocar dicas, resolver dúvidas e se preparar para o seletivo.
          </p>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Privacidade total: dados pessoais e notas nunca são compartilhados.</span>
        </div>
      </div>

      {/* Main Grid: Friends & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Friends List, Search, Suggestions, Requests */}
        <div className="space-y-4">
          {/* Add Friend & Search Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-900" />
                Adicionar Colega de Estudos
              </h2>
              <button
                onClick={loadCommunityData}
                className="text-[11px] text-slate-400 hover:text-blue-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
                title="Atualizar lista"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchMessage(null);
                }}
                placeholder="Buscar por nome ou usuário (ex: bruna, marcos, laura)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Notification feedback message */}
            {searchMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs font-medium ${
                  searchMessage.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {searchMessage.text}
              </div>
            )}

            {/* Dynamic Results / Suggestions Area */}
            {searchQuery.trim() ? (
              /* Search Results */
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Resultados da Busca no Banco ({searchResults.length})
                </p>

                {searchResults.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                    Nenhum estudante encontrado com o nome ou usuário "{searchQuery}".
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {searchResults.map((peer) => {
                      const relation = getUserRelation(peer.id);
                      return (
                        <div
                          key={peer.id}
                          className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-2 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-indigo-800 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {peer.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {peer.full_name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                @{peer.username} • {peer.grade === '6_ano' ? '6º Ano' : '7º Ano'}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {relation === 'friends' ? (
                              <button
                                onClick={() => setSelectedFriend(peer)}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Amigo</span>
                              </button>
                            ) : relation === 'received' ? (
                              <button
                                onClick={() => {
                                  const req = friendRequests.find((r) => r.fromUser.id === peer.id);
                                  if (req) handleRespondRequest(req.request.id, true);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                              >
                                Aceitar
                              </button>
                            ) : relation === 'sent' ? (
                              <button
                                onClick={() => handleInstantConnect(peer)}
                                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-1"
                                title="Conectar imediatamente para testar chat"
                              >
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Conectar</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleInstantConnect(peer)}
                                  className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                  title="Conectar e abrir chat"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Adicionar</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Peer Suggestions Area */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Sugestões de Colegas para Estudar
                  </p>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                    CMT XVII
                  </span>
                </div>

                {suggestedPeers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center bg-slate-50 rounded-xl">
                    Todos os estudantes já foram adicionados!
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {suggestedPeers.map((peer) => {
                      const relation = getUserRelation(peer.id);
                      return (
                        <div
                          key={peer.id}
                          className="p-2.5 bg-slate-50/80 hover:bg-blue-50/40 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {peer.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {peer.full_name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                @{peer.username} • {peer.grade === '6_ano' ? '6º Ano' : '7º Ano'}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {relation === 'sent' ? (
                              <button
                                onClick={() => handleInstantConnect(peer)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold border border-amber-200 flex items-center gap-1"
                              >
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Conectar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleInstantConnect(peer)}
                                className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>Adicionar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pending Requests Received */}
          {friendRequests.length > 0 && (
            <div className="bg-amber-50/90 rounded-2xl border border-amber-200 p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Solicitações Recebidas ({friendRequests.length})</span>
              </h3>
              <div className="space-y-2">
                {friendRequests.map(({ request, fromUser }) => (
                  <div
                    key={request.id}
                    className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{fromUser.full_name}</p>
                      <p className="text-[11px] text-slate-500">@{fromUser.username} • {fromUser.grade === '6_ano' ? '6º Ano' : '7º Ano'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRespondRequest(request.id, true)}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="Aceitar amizade"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aceitar</span>
                      </button>
                      <button
                        onClick={() => handleRespondRequest(request.id, false)}
                        className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
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

          {/* Pending Requests Sent */}
          {sentRequests.length > 0 && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Solicitações Enviadas ({sentRequests.length})</span>
              </h3>
              <div className="space-y-2">
                {sentRequests.map(({ request, toUser }) => (
                  <div
                    key={request.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{toUser.full_name}</p>
                      <p className="text-[10px] text-slate-500">@{toUser.username} • Aguardando</p>
                    </div>
                    <button
                      onClick={() => handleInstantConnect(toUser)}
                      className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Aceitar e começar a conversar"
                    >
                      <Check className="w-3 h-3 text-blue-700" />
                      <span>Conectar</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List (Meus Colegas) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-900" />
                Meus Colegas ({friends.length})
              </h3>
              {friends.length > 0 && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Prontos para conversar
                </span>
              )}
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-6 px-3 bg-slate-50 rounded-xl space-y-2 border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-600">
                  Você ainda não possui colegas adicionados.
                </p>
                <p className="text-[11px] text-slate-400">
                  Escolha um estudante nas sugestões acima ou busque por nome para começar a estudar juntos!
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {friends.map((friend) => {
                  const isSelected = selectedFriend?.id === friend.id;
                  return (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-blue-900 text-white shadow-md'
                          : 'hover:bg-slate-50 text-slate-800 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 relative ${
                            isSelected ? 'bg-amber-400 text-slate-900' : 'bg-blue-900 text-white'
                          }`}
                        >
                          {friend.username.substring(0, 2).toUpperCase()}
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {friend.full_name}
                          </p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                            @{friend.username} • {friend.grade === '6_ano' ? '6º Ano' : '7º Ano'}
                          </p>
                        </div>
                      </div>
                      <MessageSquare
                        className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 cols: Chat View & Ideas Exchange */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs relative shadow-xs">
                    {selectedFriend.username.substring(0, 2).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{selectedFriend.full_name}</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        Online
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      @{selectedFriend.username} • Colega do {selectedFriend.grade === '6_ano' ? '6º Ano' : '7º Ano'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadChat(selectedFriend.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
                    title="Atualizar mensagens"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Denunciar</span>
                  </button>
                </div>
              </div>

              {/* Ideas Exchange Starters */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-bold text-blue-900 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Trocar Ideias:
                </span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  {studyTopicStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(starter.text)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 text-slate-700 hover:text-blue-950 font-medium rounded-full border border-slate-200 whitespace-nowrap shadow-2xs transition-colors"
                    >
                      {starter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                {/* Security reminder banner */}
                <div className="p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-center text-[11px] text-blue-900 font-medium">
                  🔒 Mensagens monitoradas pela moderação pedagógica do CMT XVII. Troquem dicas sobre os conteúdos do edital com respeito!
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">Nenhuma mensagem ainda</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Dê um "Oi" para {selectedFriend.full_name} ou clique em um dos tópicos acima para começar a trocar ideias sobre os estudos!
                    </p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-1 shadow-2xs">
                          {selectedFriend.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isMine
                            ? 'bg-blue-900 text-white rounded-br-xs shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {!isMine && (
                          <p className="text-[10px] font-bold text-blue-700 mb-1">
                            {selectedFriend.full_name}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span
                          className={`text-[9px] block text-right mt-1.5 ${
                            isMine ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.sent_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {isMine && (
                        <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-1 shadow-2xs">
                          {currentUser.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Peer Typing Indicator */}
                {isPeerTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 max-w-xs shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-slate-600 ml-1">
                      {selectedFriend.full_name.split(' ')[0]} está digitando uma resposta...
                    </span>
                  </div>
                )}

                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-slate-100 flex gap-2 bg-white"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Escreva uma mensagem para ${selectedFriend.full_name.split(' ')[0]}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>Enviar</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/40">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-slate-800">Nenhum colega selecionado</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Adicione um colega de estudos através das sugestões à esquerda ou da busca, e conversem sobre os conteúdos do edital do CMT XVII!
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
                <h3 className="text-sm font-bold text-slate-900">Denunciar à Moderação Pedagógica</h3>
                <p className="text-xs text-slate-500">
                  Garantimos um ambiente estritamente focado em estudos e seguro para os alunos.
                </p>
              </div>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                Denúncia enviada à Coordenação do CMT XVII com sucesso!
              </div>
            ) : (
              <>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Descreva o motivo da denúncia (linguagem inadequada, desvio do foco de estudo, etc.)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900 h-28"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!reportReason.trim()}
                    className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl transition-colors"
                  >
                    Enviar Denúncia
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
