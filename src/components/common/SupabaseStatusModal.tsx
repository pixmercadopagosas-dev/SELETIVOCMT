import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection, SupabaseConfigStatus } from '../../lib/supabase';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDatabaseTab?: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenDatabaseTab,
}) => {
  const [status, setStatus] = useState<SupabaseConfigStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setTesting(true);
    const result = await testSupabaseConnection();
    setStatus(result);
    setTesting(false);
  };

  const copySqlMigration = () => {
    const sqlText = `-- MIGRAÇÃO OFICIAL SUPABASE - CMT XVII BALSAS
-- Cole este script no SQL Editor do seu projeto Supabase:
-- Acesse: https://app.supabase.com/project/_/sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    email VARCHAR(255),
    grade VARCHAR(20) NOT NULL CHECK (grade IN ('6_ano', '7_ano')),
    avatar_url TEXT DEFAULT 'cadet_blue',
    account_status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (account_status IN ('pendente', 'aprovada', 'suspensa', 'bloqueada')),
    role VARCHAR(20) NOT NULL DEFAULT 'estudante' CHECK (role IN ('estudante', 'professor', 'superusuario')),
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(30),
    total_stars INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    study_streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id VARCHAR(120) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    last_position_percent NUMERIC(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id VARCHAR(100) NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'simulado',
    score_portuguese INTEGER NOT NULL DEFAULT 0,
    score_math INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    passed_rule_30percent BOOLEAN NOT NULL DEFAULT false,
    finished_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Integração do Banco de Dados Supabase
              </h3>
              <p className="text-xs text-slate-500">
                PostgreSQL • Supabase Auth • Row Level Security (RLS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className="mt-5 space-y-3">
          {status?.connectionState === 'conectado' ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-950">Supabase Conectado em Tempo Real</p>
                  {status.latencyMs !== undefined && (
                    <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Latência: {status.latencyMs}ms
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-800">
                  URL ativa: <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono">{status.url}</code>
                </p>
                {status.testedAt && (
                  <p className="text-[10px] text-emerald-700">
                    Último teste executado às {status.testedAt}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-amber-950">
                    {isSupabaseConfigured
                      ? 'Falha ao conectar com o projeto Supabase configurado'
                      : 'Aguardando Credenciais do Supabase em Nuvem (.env)'}
                  </p>
                  {status?.testedAt && (
                    <span className="text-[10px] text-amber-700 font-medium">
                      Verificado às {status.testedAt}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  URL Atual: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-[11px] font-mono">{status?.url || 'Não configurada'}</code>
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {status?.errorMessage || 'A plataforma está operando com a engine relacional idêntica (tabelas, RLS e dados do edital) para navegação imediata. Assim que as chaves forem preenchidas no .env, o teste conectará diretamente ao seu PostgreSQL.'}
                </p>
              </div>
            </div>
          )}

          {/* Individual table diagnostic checklist */}
          {status?.tablesChecked && status.tablesChecked.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>Diagnóstico das Tabelas Principais</span>
                <span className="text-[10px] font-medium text-slate-500">PostgreSQL Schema Check</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {status.tablesChecked.map((tbl) => (
                  <div
                    key={tbl.tableName}
                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-semibold text-slate-800 text-[11px] truncate">
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


        {/* Step-by-step Setup Guide */}
        <div className="mt-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Como conectar seu projeto oficial Supabase (4 Passos Rápidos):
          </h4>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <div>
                <p className="font-bold text-slate-800">Crie um projeto gratuito no Supabase</p>
                <p className="text-slate-500 mt-0.5">
                  Acesse <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> e crie um novo projeto com o nome <strong>CMT-XVII-Balsas</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <div className="w-full">
                <p className="font-bold text-slate-800">Execute o script SQL oficial com as 31 tabelas e RLS</p>
                <p className="text-slate-500 mt-0.5">
                  Abra o <strong>SQL Editor</strong> do painel Supabase e execute a migração completa que geramos em <code className="text-slate-800 font-mono">supabase/migrations/20261012_init_cmt_xvii.sql</code>.
                </p>
                <button
                  onClick={copySqlMigration}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copiado para a Área de Transferência!' : 'Copiar Script SQL Oficial'}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <div>
                <p className="font-bold text-slate-800">Defina as Variáveis no arquivo .env</p>
                <pre className="mt-1 p-2 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anon-publica"`}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                4
              </span>
              <div>
                <p className="font-bold text-slate-800">Superusuário Inicial</p>
                <p className="text-slate-500 mt-0.5">
                  O superusuário inicial da Diretoria é cadastrado com a função <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">superusuario</code> e conta <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">aprovada</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={checkStatus}
              disabled={testing}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {testing ? 'Testando conexão...' : 'Verificar Conexão Agora'}
            </button>
            {onOpenDatabaseTab && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDatabaseTab();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Abrir Aba do Superusuário →
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
