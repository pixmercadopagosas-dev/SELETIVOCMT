-- ====================================================================
-- BANCO DE DADOS OFICIAL: PLATAFORMA INTELIGENTE DE ESTUDOS
-- COLÉGIO MILITAR TIRADENTES XVII - BALSAS / MARANHÃO
-- PROCESSO SELETIVO 6º E 7º ANO DO ENSINO FUNDAMENTAL
-- ====================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS
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

-- 2. TABELA DE SOLICITAÇÕES DE ACESSO E APROVAÇÃO
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

-- 3. PREFERÊNCIAS E METAS DE ESTUDO
CREATE TABLE IF NOT EXISTS public.study_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_goal_minutes INTEGER NOT NULL DEFAULT 30 CHECK (daily_goal_minutes IN (15, 20, 30, 45, 60, 90)),
    days_per_week INTEGER NOT NULL DEFAULT 5 CHECK (days_per_week BETWEEN 1 AND 7),
    priority_subject VARCHAR(50) DEFAULT 'ambas' CHECK (priority_subject IN ('portugues', 'matematica', 'ambas')),
    sound_effects_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SÉRIES E DISCIPLINAS
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

-- 5. MÓDULOS DE APRENDIZAGEM
CREATE TABLE IF NOT EXISTS public.modules (
    id VARCHAR(80) PRIMARY KEY,
    grade_id VARCHAR(20) NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TÓPICOS DO EDITAL
CREATE TABLE IF NOT EXISTS public.topics (
    id VARCHAR(100) PRIMARY KEY,
    module_id VARCHAR(80) NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AULAS DIDÁTICAS COMPLETAS
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

-- 8. PROGRESSO DAS AULAS POR ESTUDANTE
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

-- 9. VÍDEOS EDUCATIVOS DO YOUTUBE
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

-- 10. BANCO DE QUESTÕES DO CMT
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id VARCHAR(20) NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id VARCHAR(100) REFERENCES public.topics(id) ON DELETE SET NULL,
    lesson_id VARCHAR(120) REFERENCES public.lessons(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
    options JSONB NOT NULL, -- Array de 5 alternativas com letra (A, B, C, D, E) e texto
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

-- 11. TENTATIVAS DE RESPOSTA INDIVIDUAIS
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(5) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    explanation_viewed BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. SIMULADOS E QUESTIONÁRIOS
CREATE TABLE IF NOT EXISTS public.quizzes (
    id VARCHAR(100) PRIMARY KEY,
    grade_id VARCHAR(20) NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('fixacao', 'revisao_topico', 'simulado_oficial')),
    duration_minutes INTEGER NOT NULL DEFAULT 240, -- 4 horas no padrão do edital
    total_questions INTEGER NOT NULL DEFAULT 30, -- 30 para 6º ano, 40 para 7º ano
    portuguese_questions_count INTEGER NOT NULL DEFAULT 15,
    math_questions_count INTEGER NOT NULL DEFAULT 15,
    min_passing_percent NUMERIC(5,2) DEFAULT 30.00, -- Regra do edital: mínimo 30% por disciplina
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TENTATIVAS DE SIMULADOS
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

-- 14. SESSÕES DE ESTUDO & METAS
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subject_id VARCHAR(50) REFERENCES public.subjects(id),
    activity_type VARCHAR(50) NOT NULL, -- 'aula', 'exercicio', 'simulado', 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. CATÁLOGO DE CONQUISTAS E GAMIFICAÇÃO
CREATE TABLE IF NOT EXISTS public.achievements (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'estudo', 'precisao', 'simulado', 'constancia'
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

-- 16. COMUNIDADE DE ESTUDOS SEGURA: AMIZADES E CHAT AUTORIZADO
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

-- 17. NOTIFICAÇÕES INTERNAS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'aprovacao', 'amizade', 'meta', 'conquista', 'simulado', 'aviso'
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_link VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. AUDITORIA ADMINISTRATIVA
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
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
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

-- Funções auxiliares de permissão
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

-- 1. PROFILES RLS
CREATE POLICY "Public profile lookup for friends" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        public.is_admin(auth.uid()) OR
        (public.is_account_approved(auth.uid()) AND account_status = 'aprovada')
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. ACCESS REQUESTS RLS
CREATE POLICY "Admins can view and edit access requests" ON public.access_requests
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own access request" ON public.access_requests
    FOR SELECT USING (auth.uid() = user_id);

-- 3. CURRÍCULO (Aulas, Módulos, Tópicos) RLS
CREATE POLICY "Approved students can read curriculum" ON public.lessons
    FOR SELECT USING (
        public.is_admin(auth.uid()) OR 
        (public.is_account_approved(auth.uid()) AND is_active = true)
    );

CREATE POLICY "Public can view basic grades and subjects" ON public.grades
    FOR SELECT USING (true);

CREATE POLICY "Public can view basic subjects" ON public.subjects
    FOR SELECT USING (true);

CREATE POLICY "Approved can view modules" ON public.modules
    FOR SELECT USING (public.is_account_approved(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Approved can view topics" ON public.topics
    FOR SELECT USING (public.is_account_approved(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Approved can view videos" ON public.videos
    FOR SELECT USING (public.is_account_approved(auth.uid()) OR public.is_admin(auth.uid()));

-- 4. PROGRESSO DO ESTUDANTE RLS
CREATE POLICY "Students manage own lesson progress" ON public.lesson_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students manage own question attempts" ON public.question_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students manage own quiz attempts" ON public.quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students view own achievements" ON public.user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students manage own study preferences" ON public.study_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students view and update notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 5. COMUNIDADE E MENSAGENS RLS
CREATE POLICY "Users view own friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users manage friendships" ON public.friendships
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Members view conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = conversations.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Members view and send messages" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- 6. AUDITORIA RLS
CREATE POLICY "Admins only audit log" ON public.admin_audit_logs
    FOR ALL USING (public.is_admin(auth.uid()));
