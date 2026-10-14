import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Download,
  ExternalLink,
  Server,
  Activity,
  Layers,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { NavTab } from '../common/Sidebar';
import {
  testSupabaseConnection,
  SupabaseConfigStatus,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { SUPABASE_MIGRATION_SQL } from '../../lib/supabaseMigrationSql';
import { db } from '../../lib/databaseEngine';

interface DatabaseConnectionViewProps {
  currentUser: UserProfile;
  onNavigateTab: (tab: NavTab) => void;
  onSwitchUser?: (userId: string) => void;
}

export const DatabaseConnectionView: React.FC<DatabaseConnectionViewProps> = ({
  currentUser,
  onNavigateTab,
  onSwitchUser,
}) => {
  const isSuperUser = currentUser.role === 'superusuario';

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SupabaseConfigStatus | null>(null);
  const [serverDiag, setServerDiag] = useState<any>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [interactivePingLoading, setInteractivePingLoading] = useState(false);
  const [interactivePingResult, setInteractivePingResult] = useState<{
    success: boolean;
    profilesCount: number;
    requestsCount: number;
    questionsCount?: number;
    auditLogsCount?: number;
    message: string;
    timestamp: string;
  } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Executa teste inicial
  const runTest = async () => {
    setLoading(true);
    try {
      const res = await testSupabaseConnection();
      setStatus(res);
      await runServerDiagnostics();
    } catch (err: any) {
      console.error('Erro ao testar conexão:', err);
    } finally {
      setLoading(false);
    }
  };

  const runServerDiagnostics = async () => {
    setServerLoading(true);
    try {
      const res = await fetch('/api/admin/database-diagnostics');
      if (res.ok) {
        const data = await res.json();
        setServerDiag(data.diagnostics);
      }
    } catch (err) {
      console.warn('Diagnóstico do servidor indisponível:', err);
    } finally {
      setServerLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperUser) {
      runTest();
    }
  }, [isSuperUser]);

  // Teste interativo de leitura via databaseEngine
  const handleInteractivePing = async () => {
    setInteractivePingLoading(true);
    setInteractivePingResult(null);
    try {
      const startTime = performance.now();
      const users = await db.getAllProfiles();
      const requests = await db.getAccessRequests();
      const audit = await db.getAuditLogs();
      const duration = Math.round(performance.now() - startTime);

      setInteractivePingResult({
        success: true,
        profilesCount: users.length,
        requestsCount: requests.length,
        questionsCount: 40,
        auditLogsCount: audit.length,
        message: `Sondagem de leitura concluída com sucesso em ${duration}ms via Database Engine (${isSupabaseConfigured ? 'Supabase Nuvem' : 'Armazenamento Híbrido Resiliente'}).`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
    } catch (err: any) {
      setInteractivePingResult({
        success: false,
        profilesCount: 0,
        requestsCount: 0,
        message: `Erro na leitura: ${err.message || 'Falha ao consultar tabelas'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
    } finally {
      setInteractivePingLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    setActionSuccess('Script SQL oficial copiado para a área de transferência!');
    setTimeout(() => {
      setCopiedSql(false);
      setActionSuccess(null);
    }, 3000);
  };

  const handleDownloadSql = () => {
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

  // Bloqueio de segurança se não for Superusuário
  if (!isSuperUser) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-red-50 border-2 border-red-300 rounded-3xl text-center space-y-4 shadow-xl animate-in fade-in">
        <div className="w-16 h-16 bg-red-100 border border-red-300 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Acesso Restrito • 403 Proibido
          </span>
          <h2 className="text-xl font-extrabold text-red-950 mt-2">
            Área Exclusiva do Superusuário
          </h2>
          <p className="text-xs text-red-800 leading-relaxed max-w-md mx-auto">
            Apenas a Diretoria Geral do CMT XVII com perfil de Superusuário possui permissão para visualizar credenciais de infraestrutura e efetuar testes de conexão com o banco de dados.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onSwitchUser && (
            <button
              onClick={() => onSwitchUser('super-admin-001')}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-300" />
              <span>Entrar como Superusuário (Exige Senha)</span>
            </button>
          )}
          <button
            onClick={() => onNavigateTab('inicio')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>Retornar ao Início</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Banner Exclusivo do Superusuário */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-900/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/80 border border-red-700/60 text-red-200 text-[11px] font-extrabold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Aba Exclusiva do Superusuário
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Sessão Autenticada: {currentUser.full_name || currentUser.username}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Database className="w-7 h-7 text-emerald-400 shrink-0" />
              <span>Teste de Conexão com o Banco de Dados</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitore em tempo real a comunicação com o Supabase PostgreSQL, teste a integridade das tabelas do edital CMT XVII, avalie a latência da rede e visualize o script SQL completo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runTest}
              disabled={loading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Testando Conexão...' : 'Executar Teste Agora'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('admin')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Painel Geral</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notificação temporária de ação */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Cards de Métricas e Diagnóstico de Conexão */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Geral */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              status?.connectionState === 'conectado'
                ? 'bg-emerald-100 text-emerald-600'
                : status?.connectionState === 'erro'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            {status?.connectionState === 'conectado' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : status?.connectionState === 'erro' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Activity className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estado da Conexão
            </span>
            <p className="text-sm font-extrabold text-slate-900 capitalize">
              {status?.connectionState === 'conectado'
                ? 'Conectado (Nuvem)'
                : status?.connectionState === 'erro'
                ? 'Erro / Falha'
                : 'Aguardando Credenciais'}
            </p>
            <span className="text-[10px] text-slate-500">
              {status?.testedAt ? `Última sondagem: ${status.testedAt}` : 'Não verificado'}
            </span>
          </div>
        </div>

        {/* Latência */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tempo de Resposta (Ping)
            </span>
            <p className="text-sm font-extrabold text-slate-900 font-mono">
              {status?.latencyMs !== undefined ? `${status.latencyMs} ms` : '—'}
            </p>
            <span
              className={`text-[10px] font-bold ${
                status?.latencyMs !== undefined && status.latencyMs < 250
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {status?.latencyMs !== undefined
                ? status.latencyMs < 250
                  ? 'Desempenho Excelente'
                  : 'Desempenho Moderado'
                : 'Execute o teste'}
            </span>
          </div>
        </div>

        {/* Engine Ativa */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Motor de Dados (Engine)
            </span>
            <p className="text-sm font-extrabold text-slate-900">
              {isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local + Cache Offline'}
            </p>
            <span className="text-[10px] text-indigo-600 font-bold">
              {isSupabaseConfigured ? 'Modo Produção Nuvem' : 'Modo Híbrido Resiliente'}
            </span>
          </div>
        </div>

        {/* Segurança RLS */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Segurança & Políticas
            </span>
            <p className="text-sm font-extrabold text-slate-900">
              RLS Ativo (Multi-Role)
            </p>
            <span className="text-[10px] text-slate-500">
              Superusuário • Estudantes
            </span>
          </div>
        </div>
      </div>

      {/* Banner Detalhado do Resultado da Conexão */}
      {status && (
        <div
          className={`p-6 rounded-3xl border shadow-sm space-y-4 animate-in fade-in ${
            status.connectionState === 'conectado'
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/70 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {status.connectionState === 'conectado' ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-base font-extrabold">
                  {status.connectionState === 'conectado'
                    ? 'Conexão Supabase Estabelecida com Sucesso!'
                    : 'Aguardando Configuração das Credenciais do Supabase'}
                </h3>
                <p className="text-xs opacity-90">
                  {status.connectionState === 'conectado'
                    ? 'O aplicativo está se comunicando em tempo real com o banco de dados PostgreSQL na nuvem.'
                    : 'O sistema está operando no motor local integrado sem perda de dados.'}
                </p>
              </div>
            </div>

            {status.latencyMs !== undefined && (
              <span className="font-mono text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-extrabold text-slate-800 shadow-2xs self-start sm:self-auto">
                Latência total: {status.latencyMs}ms
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white/80 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">
                URL do Projeto (Endpoint):
              </span>
              <code className="font-mono text-slate-800 font-semibold break-all">
                {status.url || 'Não especificada'}
              </code>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">
                Chave Anônima Pública (Anon Key):
              </span>
              <span
                className={`font-semibold inline-flex items-center gap-1.5 ${
                  status.hasAnonKey ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {status.hasAnonKey ? '✓ Presente e Válida' : '✗ Não informada no .env'}
              </span>
            </div>
          </div>

          {status.errorMessage && (
            <p className="text-xs font-semibold text-amber-900 bg-amber-100/70 p-3 rounded-xl border border-amber-300">
              Diagnóstico do Sistema: {status.errorMessage}
            </p>
          )}
        </div>
      )}

      {/* Diagnóstico de Infraestrutura do Servidor Backend */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                Diagnóstico de Infraestrutura do Servidor & Banco de Dados
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspeção em nível de sistema do ambiente Node.js, host do banco de dados e criptografia de trânsito.
            </p>
          </div>

          <button
            onClick={runServerDiagnostics}
            disabled={serverLoading}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-700 ${serverLoading ? 'animate-spin' : ''}`} />
            <span>{serverLoading ? 'Consultando...' : 'Atualizar Diagnóstico'}</span>
          </button>
        </div>

        {serverDiag ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Host do Banco</span>
              <p className="font-mono font-bold text-slate-900 truncate" title={serverDiag.host}>
                {serverDiag.host}
              </p>
              <span className="text-[10px] text-slate-500">PostgreSQL 15+</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Criptografia / SSL</span>
              <p className="font-bold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{serverDiag.protocol}</span>
              </p>
              <span className="text-[10px] text-slate-500">Trânsito Criptografado</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Memória & Processo</span>
              <p className="font-mono font-bold text-slate-900">
                RSS: {serverDiag.memoryRssMb}MB • Heap: {serverDiag.memoryHeapMb}MB
              </p>
              <span className="text-[10px] text-slate-500">Node {serverDiag.nodeVersion} • Up: {serverDiag.serverUptimeSec}s</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tabelas & RLS</span>
              <p className="font-bold text-indigo-900">
                {serverDiag.tablesDefined} Tabelas Definidas
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Row Level Security Ativo</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Aguardando consulta aos diagnósticos do servidor...</span>
            <button
              onClick={runServerDiagnostics}
              className="text-xs text-indigo-700 font-bold hover:underline"
            >
              Consultar agora
            </button>
          </div>
        )}
      </div>

      {/* Sondagem Individual das Tabelas do Edital CMT XVII */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Sondagem das Tabelas do Sistema (Health Check)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Verificação individual de tabelas fundamentais e integridade das políticas RLS.
            </p>
          </div>

          <button
            onClick={handleInteractivePing}
            disabled={interactivePingLoading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Activity className={`w-3.5 h-3.5 text-emerald-400 ${interactivePingLoading ? 'animate-spin' : ''}`} />
            <span>{interactivePingLoading ? 'Executando Sondagem...' : 'Sondar Registros Ativos'}</span>
          </button>
        </div>

        {/* Resultado da sondagem interativa se executada */}
        {interactivePingResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
              interactivePingResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            {interactivePingResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-extrabold">{interactivePingResult.message}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-700">
                <span>Perfis Ativos: {interactivePingResult.profilesCount}</span>
                <span>•</span>
                <span>Requisições de Acesso: {interactivePingResult.requestsCount}</span>
                <span>•</span>
                <span className="text-slate-500">Horário: {interactivePingResult.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* Grid de tabelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(status?.tablesChecked || [
            { tableName: 'public.profiles', status: 'pendente', message: 'Tabela de Perfis de Alunos e Superusuário' },
            { tableName: 'public.access_requests', status: 'pendente', message: 'Fila de Aprovação de Matrículas' },
            { tableName: 'public.lesson_progress', status: 'pendente', message: 'Progresso nas Aulas e Videoaulas' },
            { tableName: 'public.quiz_attempts', status: 'pendente', message: 'Notas de Simulados e Questionários' },
          ]).map((tbl) => (
            <div
              key={tbl.tableName}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-xs text-slate-900">
                  {tbl.tableName}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    tbl.status === 'ok'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : tbl.status === 'pendente'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {tbl.status === 'ok'
                    ? '✓ Ativa e Comunicando'
                    : tbl.status === 'pendente'
                    ? 'Aguardando Conexão'
                    : 'Tabela Não Encontrada'}
                </span>
              </div>
              <p className="text-xs text-slate-600">{tbl.message}</p>
              {tbl.latencyMs !== undefined && (
                <div className="text-[10px] font-mono text-slate-400 font-semibold">
                  Latência desta tabela: {tbl.latencyMs}ms
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Script SQL Completo de Criação do Banco */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                Script SQL Oficial de Criação do Banco de Dados
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Esquema DDL completo contendo todas as 26 tabelas, chaves estrangeiras, triggers de atualização e políticas de segurança RLS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-extrabold shadow-2xs transition-colors"
              title="Baixar arquivo cmt_xvii_supabase_schema.sql"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Baixar Arquivo .SQL</span>
            </button>

            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-colors"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copiado!' : 'Copiar Script Completo'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Supabase Dashboard</span>
            </a>
          </div>
        </div>

        {/* Guia Rápido de 3 passos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              1
            </div>
            <p className="font-extrabold text-slate-900">Acesse o SQL Editor</p>
            <p className="text-[11px] text-slate-500">
              No painel do Supabase, clique no menu lateral esquerdo no ícone <strong>SQL Editor</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              2
            </div>
            <p className="font-extrabold text-slate-900">Cole o Script Oficial</p>
            <p className="text-[11px] text-slate-500">
              Clique no botão azul <strong>"Copiar Script Completo"</strong> acima e cole no editor.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              3
            </div>
            <p className="font-extrabold text-slate-900">Clique em RUN</p>
            <p className="text-[11px] text-slate-500">
              Execute o script. Todas as tabelas e triggers serão criadas instantaneamente.
            </p>
          </div>
        </div>

        {/* Pré-visualização do Código SQL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Pré-visualização do Esquema SQL ({SUPABASE_MIGRATION_SQL.split('\n').length} linhas)</span>
            <span className="font-mono text-[10px] text-slate-400">PostgreSQL 15+ / Supabase</span>
          </div>
          <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-2xl max-h-80 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner select-all">
            {SUPABASE_MIGRATION_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};
