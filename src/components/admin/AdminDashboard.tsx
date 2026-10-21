import React, { useState, useEffect } from 'react';
import { UserProfile, AccessRequest, AuditLog, MessageReport, QuizAttempt, QuestionAttempt, LessonProgress } from '../../types';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  BookOpen,
  Video,
  FileText,
  Activity,
  Lock,
  Unlock,
  Sparkles,
  Plus,
  Database,
  Copy,
  Check,
  TrendingUp,
  BarChart3,
  Calendar,
  Phone,
  Flame,
  Star,
  Clock,
  X,
  ExternalLink,
  Download,
  RefreshCw,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';
import { db, deduplicateProfiles, deduplicateRequests, isFictitiousUser } from '../../lib/databaseEngine';
import { testSupabaseConnection, isSupabaseConfigured, SupabaseConfigStatus } from '../../lib/supabase';
import { SUPABASE_MIGRATION_SQL } from '../../lib/supabaseMigrationSql';

interface AdminDashboardProps {
  currentAdmin: UserProfile;
  onRefreshData?: () => void;
  onNavigateToDbTab?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentAdmin,
  onRefreshData,
  onNavigateToDbTab,
}) => {
  const [activeTab, setActiveTab] = useState<'solicitacoes' | 'usuarios' | 'supabase' | 'questoes' | 'denuncias' | 'auditoria'>('solicitacoes');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Estados para Gestão de Solicitações de Acesso
  const [requestFilter, setRequestFilter] = useState<'pendente' | 'aprovado' | 'recusado' | 'todos'>('pendente');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [detailsModalRequest, setDetailsModalRequest] = useState<AccessRequest | null>(null);
  const [rejectModalRequest, setRejectModalRequest] = useState<AccessRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Documentação incompleta ou fora do prazo do edital.');
  const [rejectingLoading, setRejectingLoading] = useState(false);

  // Student detailed dossier inspection
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);
  const [userSimulados, setUserSimulados] = useState<QuizAttempt[]>([]);
  const [userQuestions, setUserQuestions] = useState<QuestionAttempt[]>([]);
  const [userLessons, setUserLessons] = useState<LessonProgress[]>([]);

  // Supabase connection test state
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Gemini AI Question Generation in Admin
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSubject, setAiSubject] = useState<'portugues' | 'matematica'>('matematica');
  const [aiGrade, setAiGrade] = useState<'6_ano' | '7_ano'>('6_ano');
  const [aiTopic, setAiTopic] = useState('MMC e MDC');
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);

  useEffect(() => {
    loadAdminData();

    // Sincronização periódica em tempo real (polling a cada 3 segundos)
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 3000);

    // Ouvinte de eventos entre abas e janelas
    const handleDbUpdate = () => {
      loadAdminData(true);
    };
    window.addEventListener('cmt_db_updated', handleDbUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cmt_db_updated', handleDbUpdate);
    };
  }, [currentAdmin.id]);

  const loadAdminData = async (silent = false) => {
    if (!silent) setLoadingData(true);
    try {
      const users = (await db.getAllProfiles()).filter((u) => !isFictitiousUser(u));
      const reqs = (await db.getAccessRequests()).filter((r) => !isFictitiousUser(r));
      const logs = await db.getAuditLogs();
      const reps = await db.getReports();
      setAllUsers(deduplicateProfiles(users));
      setRequests(deduplicateRequests(reqs));
      setAuditLogs(logs);
      setReports(reps);
    } finally {
      if (!silent) setLoadingData(false);
    }
  };

  const handleApprove = async (userId: string, targetUsername?: string, candidateName?: string) => {
    setActionError(null);
    const cleanTarget = String(userId || '').trim().toLowerCase();
    const cleanWithoutReq = cleanTarget.replace('req-', '').toLowerCase();
    const cleanUsername = String(targetUsername || '').trim().toLowerCase().replace('@', '');
    const cleanName = String(candidateName || '').trim().toLowerCase();
    const isLaura =
      cleanTarget.includes('laura') ||
      cleanUsername.includes('laura') ||
      cleanName.includes('laura');

    // 1. Atualização Otimista Imediata: a solicitação sai da lista no mesmo instante
    setAllUsers((prev) =>
      prev.map((u) => {
        const matches =
          u.id.toLowerCase() === cleanTarget ||
          u.id.toLowerCase() === cleanWithoutReq ||
          u.username.toLowerCase() === cleanTarget ||
          u.username.toLowerCase() === cleanWithoutReq ||
          (cleanUsername && u.username.toLowerCase() === cleanUsername) ||
          (cleanName && u.full_name && u.full_name.toLowerCase().includes(cleanName)) ||
          (isLaura && (u.username.toLowerCase().includes('laura') || (u.full_name && u.full_name.toLowerCase().includes('laura'))));
        if (matches) {
          return { ...u, account_status: 'aprovada' };
        }
        return u;
      })
    );

    setRequests((prev) =>
      prev.map((r) => {
        const matches =
          r.id.toLowerCase() === cleanTarget ||
          r.user_id.toLowerCase() === cleanTarget ||
          r.user_id.toLowerCase() === cleanWithoutReq ||
          r.username.toLowerCase() === cleanTarget ||
          r.username.toLowerCase() === cleanWithoutReq ||
          (cleanUsername && r.username.toLowerCase() === cleanUsername) ||
          (cleanName && r.username.toLowerCase().includes(cleanName)) ||
          (isLaura && r.username.toLowerCase().includes('laura'));
        if (matches) {
          return { ...r, status: 'aprovado' };
        }
        return r;
      })
    );

    try {
      const adminId = currentAdmin?.id || 'super-admin-001';
      await db.updateAccountStatus(
        adminId,
        userId,
        'aprovada',
        'Matrícula conferida e aprovada pela Diretoria',
        targetUsername,
        candidateName
      );
      setActionSuccess(`Conta do estudante ${candidateName || `@${targetUsername}`} aprovada com sucesso! Acesso liberado.`);
      await loadAdminData(true);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      if (targetUsername) {
        try {
          await db.updateAccountStatus('super-admin-001', targetUsername, 'aprovada', 'Matrícula conferida e aprovada pela Diretoria');
          setActionSuccess(`Conta do estudante aprovada com sucesso! Acesso liberado.`);
          await loadAdminData(true);
          if (onRefreshData) onRefreshData();
          setTimeout(() => setActionSuccess(null), 3500);
          return;
        } catch {}
      }
      setActionError(err.message || 'Erro ao aprovar cadastro.');
      setTimeout(() => setActionError(null), 5000);
      await loadAdminData(true);
    }
  };

  const handleOpenRejectModal = (request: AccessRequest) => {
    setRejectModalRequest(request);
    setRejectReason('Documentação incompleta ou fora do prazo do edital.');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalRequest) return;
    const target = rejectModalRequest;
    setRejectingLoading(true);
    setActionError(null);

    const cleanTarget = String(target.user_id || target.id || '').trim().toLowerCase();
    const cleanWithoutReq = cleanTarget.replace('req-', '');
    const cleanUsername = String(target.username || '').trim().toLowerCase();

    // 1. Atualização Otimista Imediata
    setAllUsers((prev) =>
      prev.map((u) => {
        if (
          u.id.toLowerCase() === cleanTarget ||
          u.id.toLowerCase() === cleanWithoutReq ||
          u.username.toLowerCase() === cleanTarget ||
          u.username.toLowerCase() === cleanUsername
        ) {
          return { ...u, account_status: 'bloqueada' };
        }
        return u;
      })
    );

    setRequests((prev) =>
      prev.map((r) => {
        if (
          r.id.toLowerCase() === cleanTarget ||
          r.user_id.toLowerCase() === cleanTarget ||
          r.user_id.toLowerCase() === cleanWithoutReq ||
          r.username.toLowerCase() === cleanTarget ||
          r.username.toLowerCase() === cleanUsername
        ) {
          return { ...r, status: 'recusado', rejection_reason: rejectReason };
        }
        return r;
      })
    );

    try {
      const adminId = currentAdmin?.id || 'super-admin-001';
      await db.updateAccountStatus(adminId, target.user_id || target.id, 'bloqueada', rejectReason, target.username);
      setActionSuccess(`Solicitação do usuário @${target.username} foi rejeitada com sucesso.`);
      setRejectModalRequest(null);
      if (detailsModalRequest && (detailsModalRequest.id === target.id || detailsModalRequest.username === target.username)) {
        setDetailsModalRequest({ ...detailsModalRequest, status: 'recusado', rejection_reason: rejectReason });
      }
      await loadAdminData(true);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao rejeitar cadastro.');
      setTimeout(() => setActionError(null), 5000);
      await loadAdminData(true);
    } finally {
      setRejectingLoading(false);
    }
  };

  const handleDeleteRequest = async (targetId: string, username: string, candidateName?: string) => {
    setActionError(null);
    const cleanTarget = String(targetId || '').trim().toLowerCase();
    const cleanWithoutReq = cleanTarget.replace('req-', '').toLowerCase();
    const cleanUsername = String(username || '').trim().toLowerCase().replace('@', '');
    const cleanName = String(candidateName || '').trim().toLowerCase();

    // Remove imediatamente da visualização sem travar com window.confirm (execução direta e soberana do Superusuário)
    setRequests((prev) =>
      prev.filter(
        (r) =>
          r.id.toLowerCase() !== cleanTarget &&
          r.user_id.toLowerCase() !== cleanTarget &&
          r.user_id.toLowerCase() !== cleanWithoutReq &&
          r.username.toLowerCase() !== cleanTarget &&
          r.username.toLowerCase() !== cleanWithoutReq &&
          (!cleanUsername || r.username.toLowerCase() !== cleanUsername)
      )
    );

    setAllUsers((prev) =>
      prev.filter(
        (u) =>
          u.id.toLowerCase() !== cleanTarget &&
          u.id.toLowerCase() !== cleanWithoutReq &&
          u.username.toLowerCase() !== cleanTarget &&
          u.username.toLowerCase() !== cleanWithoutReq &&
          (!cleanUsername || u.username.toLowerCase() !== cleanUsername) &&
          (!cleanName || !u.full_name || !u.full_name.toLowerCase().includes(cleanName))
      )
    );

    try {
      await db.deleteAccessRequest(targetId, true, username);
      setActionSuccess(`Solicitação de @${username} apagada com sucesso pelo Superusuário!`);
      await loadAdminData(true);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao apagar solicitação.');
      setTimeout(() => setActionError(null), 5000);
      await loadAdminData(true);
    }
  };

  const handleToggleSuspend = async (user: UserProfile) => {
    const newStatus = user.account_status === 'suspensa' ? 'aprovada' : 'suspensa';
    setActionError(null);
    try {
      const adminId = currentAdmin?.id || 'super-admin-001';
      await db.updateAccountStatus(adminId, user.id, newStatus, `Ação manual do superusuário`);
      setActionSuccess(`Status alterado para "${newStatus}".`);
      await loadAdminData();
      if (onRefreshData) onRefreshData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao alterar status.');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleInspectStudent = async (user: UserProfile) => {
    setInspectedUser(user);
    const sims = await db.getUserQuizAttempts(user.id);
    const quests = await db.getUserQuestionAttempts(user.id);
    const progs = await db.getAllUserProgress(user.id);
    setUserSimulados(sims);
    setUserQuestions(quests);
    setUserLessons(progs);
  };

  const handleRunSupabaseTest = async () => {
    setTestingSupabase(true);
    const res = await testSupabaseConnection();
    setSupabaseStatus(res);
    setTestingSupabase(false);
  };

  const handleGenerateAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    setGeneratedQuestion(null);

    try {
      const res = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject,
          grade: aiGrade,
          topic: aiTopic,
        }),
      });

      const data = await res.json();
      if (data.question) {
        setGeneratedQuestion(data.question);
        setActionSuccess('Questão gerada pelo Gemini no formato oficial do Edital!');
      } else {
        alert(data.error || 'Erro gerando questão.');
      }
    } catch (err: any) {
      alert('Falha ao conectar com o serviço do Gemini.');
    } finally {
      setAiGenerating(false);
    }
  };

  const copySqlMigration = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    setActionSuccess('Script SQL oficial completo copiado para a área de transferência!');
    setTimeout(() => {
      setCopiedSql(false);
      setActionSuccess(null);
    }, 2500);
  };

  const downloadSqlFile = () => {
    const blob = new Blob([SUPABASE_MIGRATION_SQL], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cmt_xvii_supabase_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionSuccess('Arquivo cmt_xvii_supabase_schema.sql baixado com sucesso!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filteredUsers = React.useMemo(() => {
    const unique = deduplicateProfiles(allUsers).filter((u) => !isFictitiousUser(u));
    const q = searchQuery.toLowerCase().trim();
    if (!q) return unique;
    return unique.filter((u) => {
      return (
        u.username.toLowerCase().includes(q) ||
        (u.full_name && u.full_name.toLowerCase().includes(q))
      );
    });
  }, [allUsers, searchQuery]);

  // Combina e consolida todas as solicitações de acesso e perfis cadastrados (1 CARD POR ESTUDANTE)
  const allConsolidatedRequests = React.useMemo(() => {
    const list: AccessRequest[] = [];
    const seenUsernames = new Set<string>();

    // 1. Processa solicitações de acesso da base oficial
    for (const r of requests) {
      if (!r || !r.username || isFictitiousUser(r)) continue;
      const cleanUser = r.username.trim().toLowerCase();
      const isLaura = cleanUser === 'lauracristina';
      if (isLaura) continue;

      if (seenUsernames.has(cleanUser)) continue;
      seenUsernames.add(cleanUser);

      const u = allUsers.find(
        (user) =>
          (user.username && user.username.trim().toLowerCase() === cleanUser) ||
          user.id === r.user_id
      );

      let effectiveStatus = r.status || 'pendente';
      if (u) {
        if (u.account_status === 'aprovada') effectiveStatus = 'aprovado';
        else if (u.account_status === 'bloqueada' || u.account_status === 'suspensa') effectiveStatus = 'recusado';
        else if (u.account_status === 'pendente') effectiveStatus = 'pendente';
      }

      list.push({
        ...r,
        username: cleanUser,
        status: effectiveStatus,
        guardian_name: r.guardian_name || u?.guardian_name || 'Responsável Legal',
        guardian_phone: r.guardian_phone || u?.guardian_phone || '',
        guardian_cpf: r.guardian_cpf || u?.guardian_cpf || '',
      });
    }

    // 2. Adiciona estudantes cadastrados que ainda não possuam registro explícito na tabela de solicitações
    for (const u of allUsers) {
      if (!u || !u.username || u.role === 'superusuario' || isFictitiousUser(u)) continue;
      const cleanUser = u.username.trim().toLowerCase();
      const isLaura =
        cleanUser === 'lauracristina' ||
        (u.full_name && u.full_name.toLowerCase().includes('laura cristina'));
      if (isLaura) continue;

      if (seenUsernames.has(cleanUser)) continue;
      seenUsernames.add(cleanUser);

      let st: 'pendente' | 'aprovado' | 'recusado' = 'pendente';
      if (u.account_status === 'aprovada') st = 'aprovado';
      else if (u.account_status === 'bloqueada' || u.account_status === 'suspensa') st = 'recusado';

      list.push({
        id: `req-${u.id}`,
        user_id: u.id,
        username: cleanUser,
        grade: u.grade,
        guardian_name: u.guardian_name || 'Responsável Legal',
        guardian_phone: u.guardian_phone || '',
        guardian_cpf: u.guardian_cpf || '',
        requested_at: u.created_at || new Date().toISOString(),
        status: st,
      });
    }

    return list.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
  }, [requests, allUsers]);

  const pendingRequestsCount = React.useMemo(() => {
    return allConsolidatedRequests.filter((r) => r.status === 'pendente').length;
  }, [allConsolidatedRequests]);

  const approvedRequestsCount = React.useMemo(() => {
    return allConsolidatedRequests.filter((r) => r.status === 'aprovado').length;
  }, [allConsolidatedRequests]);

  const rejectedRequestsCount = React.useMemo(() => {
    return allConsolidatedRequests.filter((r) => r.status === 'recusado').length;
  }, [allConsolidatedRequests]);

  // Lista filtrada para exibição na aba de Solicitações
  const filteredRequests = React.useMemo(() => {
    let result = allConsolidatedRequests;

    if (requestFilter !== 'todos') {
      result = result.filter((r) => r.status === requestFilter);
    }

    if (requestSearchQuery.trim()) {
      const q = requestSearchQuery.trim().toLowerCase();
      result = result.filter((r) => {
        const u = allUsers.find(
          (user) => user.id === r.user_id || (user.username && user.username.toLowerCase() === r.username.toLowerCase())
        );
        return (
          r.username.toLowerCase().includes(q) ||
          (u?.full_name && u.full_name.toLowerCase().includes(q)) ||
          (r.guardian_name && r.guardian_name.toLowerCase().includes(q)) ||
          (r.guardian_phone && r.guardian_phone.includes(q))
        );
      });
    }

    return result;
  }, [allConsolidatedRequests, requestFilter, requestSearchQuery, allUsers]);

  // Compatibilidade com código existente
  const pendingRequests = React.useMemo(() => {
    return allConsolidatedRequests.filter((r) => r.status === 'pendente');
  }, [allConsolidatedRequests]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-red-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-red-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Área Exclusiva do Superusuário • Diretoria CMT XVII</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Painel Geral de Gestão e Desempenho
          </h1>
          <p className="text-xs sm:text-sm text-red-200/80 mt-1">
            Acompanhe o desempenho de cada estudante, aprove matrículas e gerencie a infraestrutura Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-900/60 border border-red-700/60 rounded-xl text-center">
            <span className="text-[10px] font-bold text-red-300 block uppercase">Pendentes</span>
            <span className="text-xl font-extrabold text-white">{pendingRequests.length}</span>
          </div>
          <div className="px-4 py-2 bg-red-900/60 border border-red-700/60 rounded-xl text-center">
            <span className="text-[10px] font-bold text-red-300 block uppercase">Estudantes</span>
            <span className="text-xl font-extrabold text-white">{allUsers.length}</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-700 hover:text-red-900 text-xs font-bold underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('solicitacoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'solicitacoes'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Solicitações de Acesso</span>
          {pendingRequestsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 animate-pulse">
              {pendingRequestsCount} pendente{pendingRequestsCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'usuarios'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Estudantes & Desempenho ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'supabase'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Banco Supabase & Teste de Conexão</span>
        </button>

        <button
          onClick={() => setActiveTab('questoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'questoes'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Gerador de Questões (IA)</span>
        </button>

        <button
          onClick={() => setActiveTab('denuncias')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'denuncias'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Moderação ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'auditoria'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Auditoria
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. SEÇÃO DE SOLICITAÇÕES DE ACESSO (CONFORME EDITAL) */}
      {/* ========================================================= */}
      {activeTab === 'solicitacoes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          {/* Header com Atualização e Informação */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Solicitações de Acesso
                </h2>
                {pendingRequestsCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                    {pendingRequestsCount} pendente{pendingRequestsCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Gerencie, aprove, rejeite e analise os dados cadastrais de todos os candidatos que solicitaram acesso.
              </p>
            </div>
            <button
              onClick={() => loadAdminData(false)}
              disabled={loadingData}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer border border-slate-200 shadow-xs"
              title="Sincronizar fila de aprovações em tempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-red-600' : ''}`} />
              <span>{loadingData ? 'Sincronizando...' : 'Atualizar Fila'}</span>
            </button>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Filtros por status */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setRequestFilter('pendente')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  requestFilter === 'pendente'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pendentes ({pendingRequestsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestFilter('aprovado')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  requestFilter === 'aprovado'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aprovadas ({approvedRequestsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestFilter('recusado')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  requestFilter === 'recusado'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rejeitadas ({rejectedRequestsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestFilter === 'todos'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Todas ({allConsolidatedRequests.length})
              </button>
            </div>

            {/* Input de Busca */}
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                placeholder="Buscar por candidato, @usuário ou telefone..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Listagem das Solicitações */}
          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-slate-800">
                {requestFilter === 'pendente'
                  ? 'Nenhuma solicitação pendente no momento'
                  : 'Nenhuma solicitação encontrada com os filtros selecionados'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {requestFilter === 'pendente'
                  ? 'Todos os novos cadastros foram devidamente revisados e homologados pela Diretoria.'
                  : 'Tente alterar os termos de busca ou selecionar outra categoria de status.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const matchedUser = allUsers.find(
                  (u) =>
                    u.id === req.user_id ||
                    (u.username && req.username && u.username.toLowerCase() === req.username.toLowerCase())
                );
                const candidateFullName = matchedUser?.full_name || req.username;
                const candidateEmail = matchedUser?.email || `${req.username}@estudante.cmt.br`;
                const targetActionId = matchedUser?.id || req.user_id || req.username;
                const isPending = req.status === 'pendente';
                const isApproved = req.status === 'aprovado';
                const isRejected = req.status === 'recusado';

                return (
                  <div
                    key={req.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isPending
                        ? 'bg-amber-50/40 border-amber-200/80 shadow-xs'
                        : isApproved
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-red-50/30 border-red-200'
                    }`}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Linha superior: Nome do Solicitante, @usuário, Série e Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          {candidateFullName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                          @{req.username}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md font-bold text-[10px]">
                          {req.grade === '6_ano' ? 'Candidato ao 6º Ano' : 'Candidato ao 7º Ano'}
                        </span>

                        {isPending && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Pendente de Liberação
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Aprovada
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-900 border border-red-300 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-700" />
                            Rejeitada
                          </span>
                        )}
                      </div>

                      {/* Dados secundários: Email e Responsável */}
                      <p className="text-xs text-slate-600 truncate">
                        E-mail: <strong className="text-slate-800">{candidateEmail}</strong> • Responsável Legal:{' '}
                        <strong className="text-slate-800">{req.guardian_name || matchedUser?.guardian_name || 'Não informado'}</strong>
                      </p>

                      {/* Dados da Solicitação e Telefone */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>
                          Telefone/WhatsApp:{' '}
                          <strong className="text-slate-700">
                            {req.guardian_phone || matchedUser?.guardian_phone || 'Não informado'}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Solicitado em:{' '}
                          <strong className="text-slate-700">
                            {new Date(req.requested_at).toLocaleString('pt-BR')}
                          </strong>
                        </span>
                        {req.rejection_reason && (
                          <>
                            <span>•</span>
                            <span className="text-red-700 font-semibold">
                              Motivo da recusa: {req.rejection_reason}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
                      {/* Botão APROVAR */}
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleApprove(targetActionId, req.username, candidateFullName)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Homologar cadastro e liberar acesso imediato do estudante"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprovar</span>
                        </button>
                      )}

                      {/* Botão REJEITAR */}
                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(req)}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300"
                          title="Rejeitar solicitação de acesso"
                        >
                          <XCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Rejeitar</span>
                        </button>
                      )}

                      {/* Botão VER DETALHES */}
                      <button
                        type="button"
                        onClick={() => setDetailsModalRequest(req)}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-blue-200"
                        title="Visualizar ficha cadastral completa da solicitação"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ver Detalhes</span>
                      </button>

                      {/* Botão APAGAR */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(targetActionId, req.username, candidateFullName)}
                        className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 hover:border-red-300"
                        title="Apagar permanentemente a solicitação da lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TODOS OS ESTUDANTES & VISUALIZAÇÃO DE DESEMPENHO */}
      {/* ========================================================= */}
      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Estudantes Cadastrados e Acompanhamento de Desempenho
              </h2>
              <p className="text-xs text-slate-500">
                Clique em "Ver Desempenho" para analisar o dossiê pedagógico individual de cada aluno.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou @usuario..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Nome do Perfil</th>
                  <th className="py-3 px-3">Série</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Estrelas / Pts</th>
                  <th className="py-3 px-3">Responsável Legal</th>
                  <th className="py-3 px-3 text-right">Ações & Desempenho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <p className="font-extrabold text-slate-900">{user.full_name || user.username}</p>
                      <p className="text-[10px] text-slate-400">@{user.username}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-md font-bold text-[10px]">
                        {user.grade === '6_ano' ? '6º Ano' : '7º Ano'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          user.account_status === 'aprovada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.account_status === 'pendente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.account_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      ⭐ {user.total_stars} • {user.total_points} pts
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800">{user.guardian_name || 'Não cadastrado'}</p>
                      <p className="text-[10px] text-slate-400">{user.guardian_phone || ''}</p>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleInspectStudent(user)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-lg text-[11px] transition-colors inline-flex items-center gap-1"
                        title="Ver relatório de acertos e simulados deste aluno"
                      >
                        <BarChart3 className="w-3 h-3 text-blue-700" />
                        <span>Ver Desempenho</span>
                      </button>

                      {user.account_status === 'pendente' && (
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Aprovar matrícula deste aluno imediatamente"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aprovar</span>
                        </button>
                      )}

                      {user.role !== 'superusuario' && user.account_status !== 'pendente' && (
                        <button
                          onClick={() => handleToggleSuspend(user)}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                            user.account_status === 'suspensa'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {user.account_status === 'suspensa' ? 'Reativar' : 'Suspender'}
                        </button>
                      )}

                      {user.role !== 'superusuario' && (
                        <button
                          onClick={() => handleDeleteRequest(user.id, user.username)}
                          className="px-2 py-1 rounded-lg font-bold text-[11px] transition-colors bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 inline-flex items-center gap-0.5 border border-slate-200 hover:border-red-600 cursor-pointer"
                          title="Apagar este cadastro do sistema permanentemente"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Apagar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BANCO DE DADOS & TESTE DE CONEXÃO (EXCLUSIVO SUPERUSUÁRIO) */}
      {/* ========================================================= */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-red-700" />
                Gerenciamento & Conexão Oficial Supabase
              </h2>
              <p className="text-xs text-slate-500">
                Acesso restrito ao Superusuário para teste de conexão, verificação de credenciais e exportação da migração SQL.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onNavigateToDbTab && (
                <button
                  onClick={onNavigateToDbTab}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  <Database className="w-4 h-4" />
                  <span>Abrir Aba Completa de Teste (Banco)</span>
                </button>
              )}
              <button
                onClick={handleRunSupabaseTest}
                disabled={testingSupabase}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors shrink-0"
              >
                {testingSupabase ? 'Testando Conexão...' : 'Testar Conexão Supabase Agora'}
              </button>
            </div>
          </div>

          {/* Test Result Banner */}
          {supabaseStatus && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
                  supabaseStatus.connectionState === 'conectado'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                {supabaseStatus.connectionState === 'conectado' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-sm">
                      {supabaseStatus.connectionState === 'conectado'
                        ? 'Conexão Supabase Estabelecida com Sucesso!'
                        : 'Aguardando Configuração de Credenciais na Nuvem'}
                    </p>
                    {supabaseStatus.latencyMs !== undefined && (
                      <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Latência: {supabaseStatus.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p>
                    URL do Projeto: <code className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">{supabaseStatus.url}</code>
                  </p>
                  {supabaseStatus.testedAt && (
                    <p className="text-[11px] text-slate-500">Última sondagem realizada às {supabaseStatus.testedAt}</p>
                  )}
                  {supabaseStatus.errorMessage && (
                    <p className="text-amber-800 font-medium">Nota: {supabaseStatus.errorMessage}</p>
                  )}
                </div>
              </div>

              {/* Table diagnostic list */}
              {supabaseStatus.tablesChecked && supabaseStatus.tablesChecked.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <span>Sondagem das Tabelas no Banco de Dados</span>
                    <span className="text-[10px] font-semibold text-slate-500">Sondagem de tabelas & RLS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {supabaseStatus.tablesChecked.map((tbl) => (
                      <div
                        key={tbl.tableName}
                        className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-slate-800 text-[11px] truncate">
                            {tbl.tableName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{tbl.message}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            tbl.status === 'ok'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tbl.status === 'pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tbl.status === 'ok' ? '✓ OK' : tbl.status === 'pendente' ? 'Pendente' : 'Erro'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Migration SQL Script Box */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>Script SQL de Inicialização do Supabase</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded-md">
                    26 Tabelas + RLS + Triggers
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Script completo de inicialização pronto para execução no <strong>SQL Editor</strong> do Supabase.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadSqlFile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-extrabold shadow-xs transition-colors"
                  title="Baixar arquivo cmt_xvii_supabase_schema.sql"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Baixar .SQL</span>
                </button>

                <button
                  onClick={copySqlMigration}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-xs transition-colors"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar Script Completo'}</span>
                </button>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Supabase</span>
                </a>
              </div>
            </div>

            {/* Guia Rápido Passo a Passo */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1">1</span>
                <p className="font-bold text-slate-900">Acesse o Supabase</p>
                <p className="text-slate-500 text-[10px]">Crie seu projeto gratuito em supabase.com.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1">2</span>
                <p className="font-bold text-slate-900">Abra o SQL Editor</p>
                <p className="text-slate-500 text-[10px]">No menu lateral esquerdo, clique em "SQL Editor" e "+ New query".</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1">3</span>
                <p className="font-bold text-slate-900">Cole e Execute</p>
                <p className="text-slate-500 text-[10px]">Cole o script abaixo e clique em <strong>Run</strong> (Ctrl+Enter).</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1">4</span>
                <p className="font-bold text-slate-900">Configure as Chaves</p>
                <p className="text-slate-500 text-[10px]">Em Project Settings {'>'} API, copie a URL e Anon Key para o .env.</p>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 text-[10px] font-mono rounded-t-2xl border-b border-slate-700">
                <span>supabase_schema.sql ({SUPABASE_MIGRATION_SQL.split('\\n').length} linhas)</span>
                <span className="text-emerald-400 font-semibold">● Pronto para produção</span>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-b-2xl text-[11px] font-mono max-h-96 overflow-y-auto leading-relaxed border border-slate-800 select-all">
                {SUPABASE_MIGRATION_SQL}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GERADOR DE QUESTÕES COM IA */}
      {/* ========================================================= */}
      {activeTab === 'questoes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Assistente de Criação de Questões com IA (Gemini 3.8 Flash)
            </h2>
            <p className="text-xs text-slate-500">
              Gera questões 100% alinhadas ao edital do CMT XVII, com 5 alternativas, gabarito e resolução passo a passo.
            </p>
          </div>

          <form onSubmit={handleGenerateAiQuestion} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Série do Concurso</label>
              <select
                value={aiGrade}
                onChange={(e) => setAiGrade(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="6_ano">6º Ano do Fundamental</option>
                <option value="7_ano">7º Ano do Fundamental</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Disciplina</label>
              <select
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="matematica">Matemática</option>
                <option value="portugues">Língua Portuguesa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tópico do Edital</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Ex: MMC, Tonicidade, Porcentagem..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={aiGenerating}
                className="w-full py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{aiGenerating ? 'Gerando...' : 'Gerar Nova Questão'}</span>
              </button>
            </div>
          </form>

          {/* Generated Question Preview */}
          {generatedQuestion && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-blue-900">
                  Questão Gerada para o Banco do CMT XVII
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  Gabarito Oficial: Letra {generatedQuestion.correct_option}
                </span>
              </div>

              <p className="text-sm font-bold text-slate-900">{generatedQuestion.statement}</p>

              <div className="space-y-2">
                {generatedQuestion.options?.map((opt: any) => (
                  <div
                    key={opt.letter}
                    className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
                      opt.letter === generatedQuestion.correct_option
                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold">
                      {opt.letter}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Explicação Pedagógica:</p>
                <p>{generatedQuestion.detailed_explanation}</p>
                {generatedQuestion.step_by_step_solution && (
                  <p className="font-mono text-[11px] text-slate-500 pt-1">
                    {generatedQuestion.step_by_step_solution}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODERAÇÃO E DENÚNCIAS */}
      {/* ========================================================= */}
      {activeTab === 'denuncias' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Denúncias de Comportamento na Comunidade
          </h2>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Nenhuma denúncia aberta. A convivência entre os alunos está saudável e respeitosa.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-700">Denúncia #{rep.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rep.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-slate-800">Motivo: {rep.reason}</p>
                  <p className="text-[11px] text-slate-500">
                    Denunciante: {rep.reporter_id} • Denunciado: {rep.reported_user_id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. AUDITORIA ADMINISTRATIVA */}
      {/* ========================================================= */}
      {activeTab === 'auditoria' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Registro de Auditoria de Ações Administrativas (Imutável)
          </h2>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    [{log.action}] por @{log.admin_username}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-600">
                  Entidade: {log.target_entity} (ID: {log.target_id})
                </p>
                <pre className="p-2 bg-white rounded border border-slate-100 text-[10px] font-mono overflow-x-auto text-slate-500">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DOSSIÊ PEDAGÓGICO E DESEMPENHO INDIVIDUAL DO ALUNO */}
      {/* ========================================================= */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setInspectedUser(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dossier Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                {(inspectedUser.full_name || inspectedUser.username).substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                  Dossiê de Desempenho do Candidato
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {inspectedUser.full_name || inspectedUser.username}
                </h3>
                <p className="text-xs text-slate-500">
                  @{inspectedUser.username} • Candidato ao{' '}
                  <strong className="text-blue-900">{inspectedUser.grade === '6_ano' ? '6º Ano' : '7º Ano'}</strong>
                </p>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Aulas Lidas</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {userLessons.filter((l) => l.completed).length}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Exercícios</span>
                <span className="text-lg font-extrabold text-slate-900">{userQuestions.length}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Taxa de Acerto</span>
                <span className="text-lg font-extrabold text-emerald-800">
                  {userQuestions.length > 0
                    ? Math.round(
                        (userQuestions.filter((q) => q.is_correct).length / userQuestions.length) * 100
                      )
                    : 100}
                  %
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Simulados</span>
                <span className="text-lg font-extrabold text-amber-900">{userSimulados.length}</span>
              </div>
            </div>

            {/* Simulados History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-900" />
                Histórico de Simulados Realizados
              </h4>

              {userSimulados.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl text-center">
                  O estudante ainda não finalizou simulados oficiais.
                </p>
              ) : (
                <div className="space-y-2">
                  {userSimulados.map((sim, idx) => (
                    <div
                      key={sim.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          Simulado #{idx + 1} ({new Date(sim.started_at).toLocaleDateString('pt-BR')})
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Português: {sim.score_portuguese} pts • Matemática: {sim.score_math} pts
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 block">
                          {sim.total_score} / {sim.total_questions} ({Math.round((sim.total_score / sim.total_questions) * 100)}%)
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            sim.passed_rule_30percent ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {sim.passed_rule_30percent ? '✓ Ponto de Corte Atingido' : '✗ Abaixo do Corte (30%)'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guardian & Candidate Registration Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <h4 className="font-bold text-slate-900 mb-1">Dados Legais do Responsável:</h4>
              <p>
                Responsável Legal: <strong>{inspectedUser.guardian_name || 'Não informado'}</strong>
              </p>
              <p>
                Telefone de Contato: <strong>{inspectedUser.guardian_phone || 'Não informado'}</strong>
              </p>
              <p>
                Data do Cadastro: {new Date(inspectedUser.created_at).toLocaleString('pt-BR')}
              </p>
              <p>
                Status Atual da Matrícula: <strong className="capitalize">{inspectedUser.account_status}</strong>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedUser(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Fechar Dossiê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VER DETALHES COMPLETOS DA SOLICITAÇÃO */}
      {/* ========================================================= */}
      {detailsModalRequest && (() => {
        const req = detailsModalRequest;
        const matchedUser = allUsers.find(
          (u) =>
            u.id === req.user_id ||
            (u.username && req.username && u.username.toLowerCase() === req.username.toLowerCase())
        );
        const candidateFullName = matchedUser?.full_name || req.username;
        const candidateEmail = matchedUser?.email || `${req.username}@estudante.cmt.br`;
        const targetActionId = matchedUser?.id || req.user_id || req.username;
        const isPending = req.status === 'pendente';
        const isApproved = req.status === 'aprovado';
        const isRejected = req.status === 'recusado';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-5 relative">
              <button
                type="button"
                onClick={() => setDetailsModalRequest(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                  Ficha Cadastral da Solicitação
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {candidateFullName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  @{req.username} • ID: {req.id}
                </p>
              </div>

              {/* Status do Cadastro */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                  isPending
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : isApproved
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <span>Status da Solicitação:</span>
                <span
                  className={`uppercase text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg ${
                    isPending
                      ? 'bg-amber-200 text-amber-950'
                      : isApproved
                      ? 'bg-emerald-200 text-emerald-950'
                      : 'bg-red-200 text-red-950'
                  }`}
                >
                  {isPending ? 'Pendente de Homologação' : isApproved ? 'Aprovada' : 'Rejeitada'}
                </span>
              </div>

              {/* Informações do Estudante */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-900" />
                  Dados do Candidato
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nome Completo:</span>
                    <strong className="text-slate-900">{candidateFullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Série Pretendida:</span>
                    <strong className="text-slate-900">
                      {req.grade === '6_ano' ? '6º Ano Fundamental' : '7º Ano Fundamental'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">E-mail:</span>
                    <strong className="text-slate-900">{candidateEmail}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Data e Hora da Solicitação:</span>
                    <strong className="text-slate-900">{new Date(req.requested_at).toLocaleString('pt-BR')}</strong>
                  </div>
                </div>
              </div>

              {/* Informações do Responsável Legal */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-900" />
                  Dados do Responsável Legal (Menor de Idade)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nome do Responsável:</span>
                    <strong className="text-slate-900">{req.guardian_name || matchedUser?.guardian_name || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Telefone / WhatsApp:</span>
                    <strong className="text-slate-900">{req.guardian_phone || matchedUser?.guardian_phone || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CPF do Responsável:</span>
                    <strong className="text-slate-900">{req.guardian_cpf || matchedUser?.guardian_cpf || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Termo do Edital 001/26:</span>
                    <span className="text-emerald-700 font-bold">Aceito e Confirmado</span>
                  </div>
                </div>
              </div>

              {/* Informações de Revisão (se houver) */}
              {req.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-1">
                  <span className="font-bold block text-[11px]">Parecer da Diretoria:</span>
                  <p className="text-xs text-red-800">{req.rejection_reason}</p>
                </div>
              )}

              {/* Ações dentro do modal */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDetailsModalRequest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Fechar
                </button>

                <div className="flex items-center gap-2">
                  {!isRejected && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailsModalRequest(null);
                        handleOpenRejectModal(req);
                      }}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Rejeitar</span>
                    </button>
                  )}

                  {!isApproved && (
                    <button
                      type="button"
                      onClick={() => {
                        handleApprove(targetActionId, req.username, candidateFullName);
                        setDetailsModalRequest(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar Acesso</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: CONFIRMAÇÃO DE REJEIÇÃO (SEM PROMPT DO NAVEGADOR) */}
      {/* ========================================================= */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 relative">
            <button
              type="button"
              onClick={() => setRejectModalRequest(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Recusar Solicitação de Acesso
              </h3>
              <p className="text-xs text-slate-600">
                Você está recusando a inscrição de <strong>@{rejectModalRequest.username}</strong> para o Colégio Militar Tiradentes XVII.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Motivo da Recusa (visível para auditoria):
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  'Documentação incompleta ou fora do prazo do edital.',
                  'Inconsistência nos dados do responsável legal.',
                  'Candidato não inscrito no Edital Nº 001/26 do CMT XVII.',
                  'Outro motivo específico (digitar abaixo).',
                ].map((reasonOption) => (
                  <button
                    key={reasonOption}
                    type="button"
                    onClick={() => {
                      if (reasonOption.startsWith('Outro')) {
                        setRejectReason('');
                      } else {
                        setRejectReason(reasonOption);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                      rejectReason === reasonOption
                        ? 'bg-red-50 border-red-300 font-bold text-red-900 ring-1 ring-red-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {reasonOption}
                  </button>
                ))}
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Descreva o motivo detalhado da recusa..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600 mt-2"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalRequest(null)}
                disabled={rejectingLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectingLoading || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
              >
                {rejectingLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirmar Rejeição</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
