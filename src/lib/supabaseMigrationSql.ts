// SCRIPT SQL OFICIAL COMPLETO PARA SUPABASE
// Colégio Militar Tiradentes XVII - Balsas / MA
// Compatível com PostgreSQL 15+ e Supabase Auth

export const SUPABASE_MIGRATION_SQL = `-- ====================================================================
-- BANCO DE DADOS OFICIAL: PLATAFORMA INTELIGENTE DE ESTUDOS
-- COLÉGIO MILITAR TIRADENTES XVII - BALSAS / MARANHÃO
-- PROCESSO SELETIVO 6º E 7º ANO DO ENSINO FUNDAMENTAL
-- ====================================================================
-- Como executar:
-- 1. Acesse https://supabase.com e entre no painel do seu projeto
-- 2. No menu lateral esquerdo, clique no ícone "SQL Editor"
-- 3. Clique em "+ New query"
-- 4. Cole este script completo e clique no botão verde "Run" (ou aperte Ctrl + Enter)
-- ====================================================================

-- Habilitar extensões necessárias do Postgres
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. TABELA DE PERFIS DE USUÁRIOS (PROFILES)
-- ====================================================================
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
    guardian_cpf VARCHAR(20),
    agreed_terms BOOLEAN NOT NULL DEFAULT true,
    total_stars INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    study_streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 2. SOLICITAÇÕES DE ACESSO E MATRÍCULA
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(30),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
    rejection_reason TEXT
);

-- ====================================================================
-- 3. PREFERÊNCIAS E METAS DE ESTUDO DO ALUNO
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.study_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_goal_minutes INTEGER NOT NULL DEFAULT 30 CHECK (daily_goal_minutes IN (15, 20, 30, 45, 60, 90)),
    days_per_week INTEGER NOT NULL DEFAULT 5 CHECK (days_per_week BETWEEN 1 AND 7),
    priority_subject VARCHAR(50) DEFAULT 'ambas' CHECK (priority_subject IN ('portugues', 'matematica', 'ambas')),
    sound_effects_enabled BOOLEAN DEFAULT true,
    theme_color VARCHAR(30) DEFAULT 'militar',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 4. SÉRIES E DISCIPLINAS DO EDITAL
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.grades (
    id VARCHAR(20) PRIMARY KEY, -- '6_ano', '7_ano'
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id VARCHAR(50) PRIMARY KEY, -- 'portugues', 'matematica'
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) NOT NULL DEFAULT '#1e3a8a',
    icon VARCHAR(50) DEFAULT 'book'
);

-- Inserção de dados básicos obrigatórios do concurso
INSERT INTO public.grades (id, name, description)
VALUES 
    ('6_ano', '6º Ano do Ensino Fundamental', 'Concurso de Admissão - Faixa etária 10-11 anos'),
    ('7_ano', '7º Ano do Ensino Fundamental', 'Concurso de Admissão - Faixa etária 11-12 anos')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subjects (id, name, color_hex, icon)
VALUES 
    ('portugues', 'Língua Portuguesa', '#1e3a8a', 'book-open'),
    ('matematica', 'Matemática', '#dc2626', 'calculator')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 5. MÓDULOS PEDAGÓGICOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.modules (
    id VARCHAR(80) PRIMARY KEY,
    grade_id VARCHAR(20) NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 6. TÓPICOS DO EDITAL
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.topics (
    id VARCHAR(100) PRIMARY KEY,
    module_id VARCHAR(80) NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 7. AULAS DIDÁTICAS COMPLETAS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id VARCHAR(120) PRIMARY KEY,
    topic_id VARCHAR(100) NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    learning_objective TEXT NOT NULL,
    simple_explanation TEXT NOT NULL,
    detailed_development TEXT NOT NULL,
    step_by_step_examples JSONB NOT NULL DEFAULT '[]'::jsonb,
    daily_applications TEXT,
    visual_aids JSONB DEFAULT '[]'::jsonb,
    summary_keypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
    common_pitfalls TEXT,
    quick_review_questions JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 8. PROGRESSO DAS AULAS POR ESTUDANTE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id VARCHAR(120) NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    last_position_percent NUMERIC(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- ====================================================================
-- 9. VÍDEOS EDUCATIVOS DO YOUTUBE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id VARCHAR(120) REFERENCES public.lessons(id) ON DELETE SET NULL,
    topic_id VARCHAR(100) REFERENCES public.topics(id) ON DELETE CASCADE,
    youtube_url TEXT NOT NULL,
    video_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    channel_name VARCHAR(150),
    duration_label VARCHAR(30),
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 10. BANCO DE QUESTÕES NO PADRÃO CMT (A, B, C, D, E)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id VARCHAR(20) NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id VARCHAR(100) REFERENCES public.topics(id) ON DELETE SET NULL,
    lesson_id VARCHAR(120) REFERENCES public.lessons(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
    options JSONB NOT NULL,
    correct_option VARCHAR(5) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D', 'E')),
    detailed_explanation TEXT NOT NULL,
    why_correct TEXT NOT NULL,
    why_incorrect_notes JSONB DEFAULT '{}'::jsonb,
    step_by_step_solution TEXT,
    ai_generated BOOLEAN NOT NULL DEFAULT false,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 11. TENTATIVAS DE RESPOSTA INDIVIDUAIS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(5) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    explanation_viewed BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 12. SIMULADOS E PROVAS OFICIAIS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id VARCHAR(100) PRIMARY KEY,
    grade_id VARCHAR(20) NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('fixacao', 'revisao_topico', 'simulado_oficial')),
    duration_minutes INTEGER NOT NULL DEFAULT 240, -- 4 horas regra edital
    total_questions INTEGER NOT NULL DEFAULT 30, -- 30 para 6º ano, 40 para 7º ano
    portuguese_questions_count INTEGER NOT NULL DEFAULT 15,
    math_questions_count INTEGER NOT NULL DEFAULT 15,
    min_passing_percent NUMERIC(5,2) DEFAULT 30.00, -- Regra oficial 30% em cada disciplina
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 13. TENTATIVAS DE SIMULADOS POR ESTUDANTE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id VARCHAR(100) NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL DEFAULT 'simulado' CHECK (mode IN ('treino_imediato', 'simulado')),
    status VARCHAR(20) NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'abandonado')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    score_portuguese INTEGER NOT NULL DEFAULT 0,
    score_math INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    passed_rule_30percent BOOLEAN NOT NULL DEFAULT false,
    answers_data JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ====================================================================
-- 14. SESSÕES DE ESTUDO & TEMPO DEDICADO
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subject_id VARCHAR(50) REFERENCES public.subjects(id),
    activity_type VARCHAR(50) NOT NULL, -- 'aula', 'exercicio', 'simulado', 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 15. GAMIFICAÇÃO: CONQUISTAS, MEDALHAS E EXTRATO DE PONTOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    stars_reward INTEGER NOT NULL DEFAULT 10,
    points_reward INTEGER NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id VARCHAR(80) NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.reward_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    reason VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 16. COMUNIDADE SEGURA: AMIZADES, GRUPOS E MENSAGENS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceita', 'recusada', 'bloqueada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.message_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'analisado', 'acao_tomada', 'rejeitado')),
    action_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- ====================================================================
-- 17. NOTIFICAÇÕES INTERNAS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_link VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 18. LOGS DE AUDITORIA DO SUPERUSUÁRIO
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 19. TRIGGER AUTOMÁTICO: NOVO USUÁRIO SUPABASE AUTH -> PERFIL
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    email,
    grade,
    role,
    account_status,
    guardian_name,
    guardian_phone
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Cadete Estudante'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'grade', '6_ano'),
    COALESCE(new.raw_user_meta_data->>'role', 'estudante'),
    'aprovada', -- Contas criadas são aprovadas ou pendentes conforme preferência da escola
    COALESCE(new.raw_user_meta_data->>'guardian_name', ''),
    COALESCE(new.raw_user_meta_data->>'guardian_phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 20. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Funções de verificação de permissões
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'superusuario'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_account_approved(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND account_status = 'aprovada'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de Acesso
CREATE POLICY "Public profile lookup" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Public grades" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Public subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Public topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Public videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Public questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Public achievements" ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Students manage own lesson progress" ON public.lesson_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students manage own question attempts" ON public.question_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students manage own quiz attempts" ON public.quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students manage own study preferences" ON public.study_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students view and update notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins full access to audit" ON public.admin_audit_logs
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins full access to access_requests" ON public.access_requests
    FOR ALL USING (public.is_admin(auth.uid()));
`;
