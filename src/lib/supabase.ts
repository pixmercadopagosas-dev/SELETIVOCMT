import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtenção de variáveis de ambiente seguras (prefixadas por VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://seu-projeto.supabase.co' &&
  !supabaseUrl.includes('example.com')
);

// Cliente Supabase Oficial
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface TableCheckResult {
  tableName: string;
  status: 'ok' | 'tabela_nao_encontrada' | 'permissao_negada' | 'pendente';
  latencyMs?: number;
  message?: string;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
  connectionState: 'conectado' | 'pendente_configuracao' | 'erro';
  errorMessage?: string;
  latencyMs?: number;
  testedAt?: string;
  tablesChecked?: TableCheckResult[];
}

export async function testSupabaseConnection(): Promise<SupabaseConfigStatus> {
  const testedAt = new Date().toLocaleTimeString('pt-BR');

  if (!supabase || !isSupabaseConfigured) {
    return {
      isConfigured: false,
      url: supabaseUrl || 'Não informada (.env)',
      hasAnonKey: Boolean(supabaseAnonKey),
      connectionState: 'pendente_configuracao',
      errorMessage: 'Credenciais VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas no ambiente.',
      testedAt,
      tablesChecked: [
        { tableName: 'public.profiles', status: 'pendente', message: 'Aguardando credenciais no .env' },
        { tableName: 'public.access_requests', status: 'pendente', message: 'Aguardando credenciais no .env' },
        { tableName: 'public.lesson_progress', status: 'pendente', message: 'Aguardando credenciais no .env' },
        { tableName: 'public.quiz_attempts', status: 'pendente', message: 'Aguardando credenciais no .env' },
      ],
    };
  }

  const startTime = performance.now();
  const tablesToCheck = ['profiles', 'access_requests', 'lesson_progress', 'quiz_attempts'];
  const tableResults: TableCheckResult[] = [];

  try {
    for (const tbl of tablesToCheck) {
      const tStart = performance.now();
      const { error } = await supabase.from(tbl).select('id').limit(1);
      const tEnd = performance.now();
      const lat = Math.round(tEnd - tStart);

      if (!error || error.code === 'PGRST116') {
        tableResults.push({
          tableName: `public.${tbl}`,
          status: 'ok',
          latencyMs: lat,
          message: 'Tabela comunicando normalmente com RLS ativo',
        });
      } else if (error.code === '42P01') {
        // relation does not exist
        tableResults.push({
          tableName: `public.${tbl}`,
          status: 'tabela_nao_encontrada',
          latencyMs: lat,
          message: 'Tabela ainda não criada (execute o script SQL no Supabase)',
        });
      } else {
        tableResults.push({
          tableName: `public.${tbl}`,
          status: 'permissao_negada',
          latencyMs: lat,
          message: error.message,
        });
      }
    }

    const totalLatency = Math.round(performance.now() - startTime);
    const hasAnyOk = tableResults.some((t) => t.status === 'ok');

    return {
      isConfigured: true,
      url: supabaseUrl,
      hasAnonKey: true,
      connectionState: hasAnyOk ? 'conectado' : 'erro',
      latencyMs: totalLatency,
      testedAt,
      tablesChecked: tableResults,
      errorMessage: hasAnyOk ? undefined : 'Tabelas não encontradas. Execute o script SQL no editor do Supabase.',
    };
  } catch (err: any) {
    const totalLatency = Math.round(performance.now() - startTime);
    return {
      isConfigured: true,
      url: supabaseUrl,
      hasAnonKey: true,
      connectionState: 'erro',
      latencyMs: totalLatency,
      testedAt,
      errorMessage: err.message || 'Falha na requisição de rede com o servidor Supabase.',
      tablesChecked: tableResults,
    };
  }
}

