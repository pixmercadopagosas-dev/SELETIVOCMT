import {
  UserProfile,
  AccessRequest,
  StudyPreferences,
  LessonProgress,
  QuestionAttempt,
  QuizAttempt,
  UserAchievement,
  RewardLedgerEntry,
  Friendship,
  ChatMessage,
  MessageReport,
  AppNotification,
  AuditLog,
  GradeId,
  SubjectId,
  AccountStatus,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { ACHIEVEMENTS_DATA } from '../data/achievementsData';

// Chaves de persistência no navegador (Netlify e AI Studio)
const STORAGE_KEYS = {
  PROFILES: 'cmt_db_profiles_v3',
  ACCESS_REQUESTS: 'cmt_db_access_requests_v3',
  STUDY_PREFERENCES: 'cmt_db_study_preferences_v3',
  LESSON_PROGRESS: 'cmt_db_lesson_progress_v3',
  QUESTION_ATTEMPTS: 'cmt_db_question_attempts_v3',
  QUIZ_ATTEMPTS: 'cmt_db_quiz_attempts_v3',
  USER_ACHIEVEMENTS: 'cmt_db_user_achievements_v3',
  REWARD_LEDGER: 'cmt_db_reward_ledger_v3',
  FRIENDSHIPS: 'cmt_db_friendships_v3',
  MESSAGES: 'cmt_db_messages_v3',
  NOTIFICATIONS: 'cmt_db_notifications_v3',
  AUDIT_LOGS: 'cmt_db_audit_logs_v3',
};

// Conta Mestra Oficial do Superusuário (Diretoria Geral CMT XVII)
export const ROOT_SUPERADMIN: UserProfile = {
  id: 'super-admin-001',
  username: 'diretoria_cmt',
  full_name: 'Diretoria Geral CMT XVII',
  email: 'diretoria@cmtxvii.com.br',
  grade: '6_ano',
  avatar_url: 'military_officer',
  account_status: 'aprovada',
  role: 'superusuario',
  guardian_name: 'Diretoria de Ensino Regular PMMA',
  guardian_phone: '(99) 99113-6329',
  agreed_terms: true,
  total_stars: 0,
  total_points: 0,
  study_streak_days: 0,
  created_at: '2026-10-01T08:00:00Z',
  updated_at: new Date().toISOString(),
};

function safeStorageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeStorageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Erro ao persistir ${key}:`, err);
  }
}

class DatabaseEngine {
  private profiles: UserProfile[] = [];
  private accessRequests: AccessRequest[] = [];
  private studyPreferences: Map<string, StudyPreferences> = new Map();
  private lessonProgress: LessonProgress[] = [];
  private questionAttempts: QuestionAttempt[] = [];
  private quizAttempts: QuizAttempt[] = [];
  private userAchievements: UserAchievement[] = [];
  private rewardLedger: RewardLedgerEntry[] = [];
  private friendships: Friendship[] = [];
  private messages: ChatMessage[] = [];
  private notifications: AppNotification[] = [];
  private messageReports: MessageReport[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    // Carrega dados reais persistidos localmente (sem alunos fictícios)
    const storedProfiles = safeStorageGet<UserProfile[]>(STORAGE_KEYS.PROFILES, []);
    
    // Garante que o Superusuário sempre existe e filtra qualquer resquício de dados demo
    const cleanProfiles = storedProfiles.filter(
      (p) => !p.id.startsWith('student-demo') && p.username !== 'cadete_marcos' && p.username !== 'anabeatriz_balsas'
    );

    if (!cleanProfiles.some((p) => p.id === ROOT_SUPERADMIN.id)) {
      cleanProfiles.unshift(ROOT_SUPERADMIN);
    }
    this.profiles = cleanProfiles;

    this.accessRequests = safeStorageGet<AccessRequest[]>(STORAGE_KEYS.ACCESS_REQUESTS, []).filter(
      (r) => !r.id.startsWith('demo-') && r.username !== 'gabriel_novato'
    );

    this.lessonProgress = safeStorageGet<LessonProgress[]>(STORAGE_KEYS.LESSON_PROGRESS, []);
    this.questionAttempts = safeStorageGet<QuestionAttempt[]>(STORAGE_KEYS.QUESTION_ATTEMPTS, []);
    this.quizAttempts = safeStorageGet<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    this.userAchievements = safeStorageGet<UserAchievement[]>(STORAGE_KEYS.USER_ACHIEVEMENTS, []);
    this.rewardLedger = safeStorageGet<RewardLedgerEntry[]>(STORAGE_KEYS.REWARD_LEDGER, []);
    this.friendships = safeStorageGet<Friendship[]>(STORAGE_KEYS.FRIENDSHIPS, []);
    this.messages = safeStorageGet<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    this.notifications = safeStorageGet<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    this.auditLogs = safeStorageGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'aud-init',
        admin_id: ROOT_SUPERADMIN.id,
        admin_username: ROOT_SUPERADMIN.username,
        action: 'SISTEMA_PRODUCAO_INICIADO',
        target_entity: 'PLATAFORMA',
        target_id: 'cmt-xvii-balsas',
        details: { edital: 'Edital Nº 001/26 - CMT XVII', modo: 'producao_real' },
        created_at: new Date().toISOString(),
      },
    ]);

    const rawPrefs = safeStorageGet<Record<string, StudyPreferences>>(STORAGE_KEYS.STUDY_PREFERENCES, {});
    this.studyPreferences = new Map(Object.entries(rawPrefs));

    // Salva o estado limpo inicial
    this.persistAll();

    // Sincroniza em segundo plano com o Supabase se as credenciais existirem
    this.syncFromSupabase();
  }

  private persistAll() {
    safeStorageSet(STORAGE_KEYS.PROFILES, this.profiles);
    safeStorageSet(STORAGE_KEYS.ACCESS_REQUESTS, this.accessRequests);
    safeStorageSet(STORAGE_KEYS.LESSON_PROGRESS, this.lessonProgress);
    safeStorageSet(STORAGE_KEYS.QUESTION_ATTEMPTS, this.questionAttempts);
    safeStorageSet(STORAGE_KEYS.QUIZ_ATTEMPTS, this.quizAttempts);
    safeStorageSet(STORAGE_KEYS.USER_ACHIEVEMENTS, this.userAchievements);
    safeStorageSet(STORAGE_KEYS.REWARD_LEDGER, this.rewardLedger);
    safeStorageSet(STORAGE_KEYS.FRIENDSHIPS, this.friendships);
    safeStorageSet(STORAGE_KEYS.MESSAGES, this.messages);
    safeStorageSet(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    safeStorageSet(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);

    const prefsObj: Record<string, StudyPreferences> = {};
    this.studyPreferences.forEach((val, key) => {
      prefsObj[key] = val;
    });
    safeStorageSet(STORAGE_KEYS.STUDY_PREFERENCES, prefsObj);
  }

  // Sincronização automática com Supabase se configurado em produção
  private async syncFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: remoteProfiles } = await supabase.from('profiles').select('*');
      if (remoteProfiles && remoteProfiles.length > 0) {
        for (const rp of remoteProfiles) {
          const idx = this.profiles.findIndex((p) => p.id === rp.id);
          if (idx >= 0) {
            this.profiles[idx] = { ...this.profiles[idx], ...rp };
          } else {
            this.profiles.push(rp);
          }
        }
        safeStorageSet(STORAGE_KEYS.PROFILES, this.profiles);
      }

      const { data: remoteRequests } = await supabase.from('access_requests').select('*');
      if (remoteRequests && remoteRequests.length > 0) {
        this.accessRequests = remoteRequests;
        safeStorageSet(STORAGE_KEYS.ACCESS_REQUESTS, this.accessRequests);
      }
    } catch (e) {
      console.warn('Sync from Supabase em segundo plano:', e);
    }
  }

  // -------------------------------------------------------------
  // AUTENTICAÇÃO E PERFIS REAIS
  // -------------------------------------------------------------
  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const clean = username.trim().toLowerCase();
    
    // Tenta primeiro no cache local
    let found = this.profiles.find(
      (p) => p.username.toLowerCase() === clean || (p.email && p.email.toLowerCase() === clean)
    );

    // Se não encontrou e Supabase está conectado, busca no banco de dados na nuvem
    if (!found && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${clean},email.ilike.${clean}`)
          .maybeSingle();

        if (data && !error) {
          found = data as UserProfile;
          if (!this.profiles.some((p) => p.id === found!.id)) {
            this.profiles.push(found);
            safeStorageSet(STORAGE_KEYS.PROFILES, this.profiles);
          }
        }
      } catch (e) {
        console.warn('Busca no Supabase falhou:', e);
      }
    }

    return found ? { ...found } : null;
  }

  async getProfileById(userId: string): Promise<UserProfile | null> {
    let found = this.profiles.find((p) => p.id === userId);

    if (!found && isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (data) {
          found = data as UserProfile;
          this.profiles.push(found);
          safeStorageSet(STORAGE_KEYS.PROFILES, this.profiles);
        }
      } catch (e) {
        console.warn('Busca de perfil por ID no Supabase:', e);
      }
    }

    return found ? { ...found } : null;
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('profiles').select('*');
        if (data && data.length > 0) {
          this.profiles = data as UserProfile[];
          if (!this.profiles.some((p) => p.id === ROOT_SUPERADMIN.id)) {
            this.profiles.unshift(ROOT_SUPERADMIN);
          }
          safeStorageSet(STORAGE_KEYS.PROFILES, this.profiles);
        }
      } catch (e) {
        console.warn('Erro ao listar perfis do Supabase:', e);
      }
    }
    return [...this.profiles];
  }

  // -------------------------------------------------------------
  // CADASTRO DE ESTUDANTE: REGRA DO EDITAL (STATUS OBRIGATORIAMENTE PENDENTE)
  // -------------------------------------------------------------
  async registerStudent(data: {
    username: string;
    fullName: string;
    grade: GradeId;
    avatarUrl: string;
    guardianName: string;
    guardianPhone: string;
    guardianCpf?: string;
    email?: string;
  }): Promise<{ user: UserProfile; request: AccessRequest }> {
    const existing = await this.getProfileByUsername(data.username);
    if (existing) {
      throw new Error(`O nome de usuário "${data.username}" já está em uso. Por favor, escolha outro.`);
    }

    const newUserId = `std-${Date.now()}`;
    const newProfile: UserProfile = {
      id: newUserId,
      username: data.username.toLowerCase().trim(),
      full_name: data.fullName.trim(),
      email: data.email || `${data.username.toLowerCase()}@estudante.cmt.br`,
      grade: data.grade,
      avatar_url: data.avatarUrl || 'cadet_blue',
      account_status: 'pendente', // REGRA: OBRIGATORIAMENTE PENDENTE DE LIBERAÇÃO
      role: 'estudante',
      guardian_name: data.guardianName,
      guardian_phone: data.guardianPhone,
      guardian_cpf: data.guardianCpf,
      agreed_terms: true,
      total_stars: 0,
      total_points: 0,
      study_streak_days: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      user_id: newUserId,
      username: newProfile.username,
      grade: newProfile.grade,
      guardian_name: data.guardianName,
      guardian_phone: data.guardianPhone,
      requested_at: new Date().toISOString(),
      status: 'pendente',
    };

    this.profiles.push(newProfile);
    this.accessRequests.push(newRequest);

    // Notificação para o Superusuário
    this.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: ROOT_SUPERADMIN.id,
      title: 'Nova Solicitação de Matrícula',
      message: `Estudante ${newProfile.full_name} (@${newProfile.username}) para o ${
        newProfile.grade === '6_ano' ? '6º Ano' : '7º Ano'
      } aguarda liberação de acesso.`,
      type: 'aviso',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.persistAll();

    // Sincroniza com Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').insert([newProfile]);
        await supabase.from('access_requests').insert([newRequest]);
      } catch (e) {
        console.warn('Erro ao inserir no Supabase:', e);
      }
    }

    return { user: newProfile, request: newRequest };
  }

  // -------------------------------------------------------------
  // ADMINISTRAÇÃO: LIBERAÇÃO / APROVAÇÃO EXCLUSIVA DO SUPERUSUÁRIO
  // -------------------------------------------------------------
  async updateAccountStatus(
    adminId: string,
    targetUserId: string,
    newStatus: AccountStatus,
    reason?: string
  ): Promise<UserProfile> {
    const admin = await this.getProfileById(adminId);
    if (!admin || admin.role !== 'superusuario') {
      throw new Error('Acesso negado: Somente o Superusuário possui permissão para liberar ou alterar contas.');
    }

    const targetIndex = this.profiles.findIndex((p) => p.id === targetUserId);
    if (targetIndex === -1) {
      throw new Error('Estudante não encontrado no banco de dados.');
    }

    const previousStatus = this.profiles[targetIndex].account_status;
    this.profiles[targetIndex].account_status = newStatus;
    this.profiles[targetIndex].updated_at = new Date().toISOString();

    // Atualiza solicitação de acesso correspondente
    const req = this.accessRequests.find((r) => r.user_id === targetUserId);
    if (req) {
      req.status = newStatus === 'aprovada' ? 'aprovado' : 'recusado';
      req.reviewed_at = new Date().toISOString();
      req.reviewed_by = adminId;
      req.rejection_reason = reason;
    }

    // Registra log de auditoria oficial
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      admin_id: adminId,
      admin_username: admin.username,
      action: 'ALTERACAO_STATUS_CONTA',
      target_entity: 'USER_PROFILE',
      target_id: targetUserId,
      details: {
        username: this.profiles[targetIndex].username,
        de: previousStatus,
        para: newStatus,
        motivo: reason || 'Liberação pelo Superusuário',
      },
      created_at: new Date().toISOString(),
    });

    // Notificação enviada para o estudante
    if (newStatus === 'aprovada') {
      this.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: targetUserId,
        title: 'Acesso Liberado!',
        message: 'Parabéns! Sua matrícula foi liberada pela Diretoria Geral. Você já pode estudar todo o conteúdo.',
        type: 'aprovacao',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    this.persistAll();

    // Sincroniza atualização no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ account_status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', targetUserId);

        if (req) {
          await supabase
            .from('access_requests')
            .update({
              status: req.status,
              reviewed_at: req.reviewed_at,
              reviewed_by: adminId,
              rejection_reason: reason,
            })
            .eq('user_id', targetUserId);
        }
      } catch (e) {
        console.warn('Erro ao atualizar status no Supabase:', e);
      }
    }

    return { ...this.profiles[targetIndex] };
  }

  async getAccessRequests(): Promise<AccessRequest[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('access_requests').select('*');
        if (data && data.length > 0) {
          this.accessRequests = data as AccessRequest[];
          safeStorageSet(STORAGE_KEYS.ACCESS_REQUESTS, this.accessRequests);
        }
      } catch (e) {
        console.warn('Erro ao buscar solicitações do Supabase:', e);
      }
    }
    return [...this.accessRequests];
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...this.auditLogs];
  }

  // -------------------------------------------------------------
  // PREFERÊNCIAS E METAS DE ESTUDO
  // -------------------------------------------------------------
  async getStudyPreferences(userId: string): Promise<StudyPreferences> {
    const existing = this.studyPreferences.get(userId);
    if (existing) return { ...existing };

    const def: StudyPreferences = {
      id: `pref-${Date.now()}`,
      user_id: userId,
      daily_goal_minutes: 30,
      days_per_week: 5,
      priority_subject: 'ambas',
      sound_effects_enabled: true,
    };
    this.studyPreferences.set(userId, def);
    this.persistAll();
    return def;
  }

  async saveStudyPreferences(userId: string, data: Partial<StudyPreferences>): Promise<StudyPreferences> {
    const current = await this.getStudyPreferences(userId);
    const updated = { ...current, ...data };
    this.studyPreferences.set(userId, updated);
    this.persistAll();
    return updated;
  }

  // -------------------------------------------------------------
  // PROGRESSO DAS AULAS
  // -------------------------------------------------------------
  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const prog = this.lessonProgress.find((p) => p.user_id === userId && p.lesson_id === lessonId);
    return prog ? { ...prog } : null;
  }

  async getAllUserProgress(userId: string): Promise<LessonProgress[]> {
    return this.lessonProgress.filter((p) => p.user_id === userId);
  }

  async markLessonCompleted(
    userId: string,
    lessonId: string,
    timeSpentSeconds: number = 600
  ): Promise<{ progress: LessonProgress; starsEarned: number }> {
    let prog = this.lessonProgress.find((p) => p.user_id === userId && p.lesson_id === lessonId);
    let isFirstTime = false;

    if (!prog) {
      isFirstTime = true;
      prog = {
        id: `prog-${Date.now()}`,
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpentSeconds,
        last_position_percent: 100,
        last_accessed_at: new Date().toISOString(),
      };
      this.lessonProgress.push(prog);
    } else {
      if (!prog.completed) isFirstTime = true;
      prog.completed = true;
      prog.completed_at = new Date().toISOString();
      prog.time_spent_seconds += timeSpentSeconds;
      prog.last_position_percent = 100;
      prog.last_accessed_at = new Date().toISOString();
    }

    let starsEarned = 0;
    if (isFirstTime) {
      starsEarned = 10;
      await this.awardStars(userId, starsEarned, 50, `Conclusão da aula: ${lessonId}`);
      await this.checkAndAwardAchievements(userId, 'ach-primeira-aula');
    }

    this.persistAll();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lesson_progress').upsert([prog]);
      } catch (e) {
        console.warn('Erro ao sincronizar progresso com Supabase:', e);
      }
    }

    return { progress: { ...prog }, starsEarned };
  }

  async updateLessonPosition(
    userId: string,
    lessonId: string,
    percent: number,
    timeSpentDelta: number
  ): Promise<void> {
    let prog = this.lessonProgress.find((p) => p.user_id === userId && p.lesson_id === lessonId);
    if (!prog) {
      prog = {
        id: `prog-${Date.now()}`,
        user_id: userId,
        lesson_id: lessonId,
        completed: false,
        time_spent_seconds: timeSpentDelta,
        last_position_percent: Math.min(100, Math.max(0, percent)),
        last_accessed_at: new Date().toISOString(),
      };
      this.lessonProgress.push(prog);
    } else {
      prog.last_position_percent = Math.min(100, Math.max(prog.last_position_percent, percent));
      prog.time_spent_seconds += timeSpentDelta;
      prog.last_accessed_at = new Date().toISOString();
    }
    this.persistAll();
  }

  async getLastStudiedLesson(userId: string): Promise<LessonProgress | null> {
    const list = this.lessonProgress
      .filter((p) => p.user_id === userId)
      .sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime());
    return list[0] || null;
  }

  // -------------------------------------------------------------
  // BANCO DE QUESTÕES E TENTATIVAS REAIS
  // -------------------------------------------------------------
  async recordQuestionAttempt(
    userId: string,
    questionId: string,
    selectedOption: 'A' | 'B' | 'C' | 'D' | 'E',
    isCorrect: boolean
  ): Promise<QuestionAttempt> {
    const attempt: QuestionAttempt = {
      id: `att-${Date.now()}`,
      user_id: userId,
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      explanation_viewed: true,
      answered_at: new Date().toISOString(),
    };
    this.questionAttempts.push(attempt);

    if (isCorrect) {
      await this.awardStars(userId, 2, 10, 'Acerto de questão de fixação');
    }

    const userAttempts = this.questionAttempts.filter((a) => a.user_id === userId);
    const correctCount = userAttempts.filter((a) => a.is_correct).length;
    if (correctCount >= 5) {
      await this.checkAndAwardAchievements(userId, 'ach-5-acertos');
    }

    this.persistAll();
    return attempt;
  }

  async getUserQuestionAttempts(userId: string): Promise<QuestionAttempt[]> {
    return this.questionAttempts.filter((a) => a.user_id === userId);
  }

  // -------------------------------------------------------------
  // SIMULADOS OFICIAIS E QUESTIONÁRIOS
  // -------------------------------------------------------------
  async recordQuizAttempt(
    userId: string,
    quizId: string,
    mode: 'treino_imediato' | 'simulado',
    scorePortuguese: number,
    scoreMath: number,
    totalQuestions: number,
    answersData: any[],
    timeSpentSeconds: number
  ): Promise<QuizAttempt> {
    const totalScore = scorePortuguese + scoreMath;
    const gradePortugueseRequired = quizId.includes('6ano') ? 5 : 6;
    const gradeMathRequired = quizId.includes('6ano') ? 5 : 6;
    const passed30Percent = scorePortuguese >= gradePortugueseRequired && scoreMath >= gradeMathRequired;

    const attempt: QuizAttempt = {
      id: `quiz-att-${Date.now()}`,
      user_id: userId,
      quiz_id: quizId,
      mode,
      status: 'concluido',
      started_at: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
      finished_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
      score_portuguese: scorePortuguese,
      score_math: scoreMath,
      total_score: totalScore,
      total_questions: totalQuestions,
      passed_rule_30percent: passed30Percent,
      answers_data: answersData,
    };

    this.quizAttempts.unshift(attempt);

    const starsReward = 20 + Math.floor((totalScore / totalQuestions) * 30);
    await this.awardStars(userId, starsReward, totalScore * 10, `Simulado concluído (${totalScore}/${totalQuestions} acertos)`);
    await this.checkAndAwardAchievements(userId, 'ach-simulado-cmt');
    if (passed30Percent) {
      await this.checkAndAwardAchievements(userId, 'ach-regra-corte');
    }

    this.persistAll();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('quiz_attempts').insert([attempt]);
      } catch (e) {
        console.warn('Erro ao inserir simulado no Supabase:', e);
      }
    }

    return attempt;
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return this.quizAttempts.filter((q) => q.user_id === userId);
  }

  // -------------------------------------------------------------
  // RECOMPENSAS, ESTRELAS E CONQUISTAS
  // -------------------------------------------------------------
  async awardStars(userId: string, stars: number, points: number, reason: string): Promise<void> {
    const profile = this.profiles.find((p) => p.id === userId);
    if (!profile) return;

    profile.total_stars += stars;
    profile.total_points += points;

    this.rewardLedger.unshift({
      id: `rew-${Date.now()}`,
      user_id: userId,
      stars,
      points,
      reason,
      created_at: new Date().toISOString(),
    });

    this.persistAll();
  }

  async checkAndAwardAchievements(userId: string, achievementId: string): Promise<void> {
    const exists = this.userAchievements.some((ua) => ua.user_id === userId && ua.achievement_id === achievementId);
    if (exists) return;

    const meta = ACHIEVEMENTS_DATA.find((a) => a.id === achievementId);
    if (!meta) return;

    this.userAchievements.push({
      id: `uach-${Date.now()}`,
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    });

    await this.awardStars(userId, meta.stars_reward, meta.points_reward, `Conquista: ${meta.title}`);

    this.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title: 'Nova Conquista Desbloqueada!',
      message: `Você conquistou a medalha "${meta.title}". +${meta.stars_reward} estrelas adicionadas!`,
      type: 'conquista',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.persistAll();
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievements.filter((ua) => ua.user_id === userId);
  }

  async getRewardLedger(userId: string): Promise<RewardLedgerEntry[]> {
    return this.rewardLedger.filter((r) => r.user_id === userId);
  }

  // -------------------------------------------------------------
  // AMIZADES E MENSAGENS REAIS
  // -------------------------------------------------------------
  async getFriends(userId: string): Promise<UserProfile[]> {
    const friendRelations = this.friendships.filter(
      (f) => (f.user_id === userId || f.friend_id === userId) && f.status === 'aceita'
    );
    const friendIds = friendRelations.map((f) => (f.user_id === userId ? f.friend_id : f.user_id));
    return this.profiles.filter((p) => friendIds.includes(p.id) && p.account_status === 'aprovada');
  }

  async getFriendRequests(userId: string): Promise<{ request: Friendship; fromUser: UserProfile }[]> {
    const requests = this.friendships.filter((f) => f.friend_id === userId && f.status === 'pendente');
    return requests
      .map((r) => {
        const fromUser = this.profiles.find((p) => p.id === r.user_id);
        return fromUser ? { request: r, fromUser } : null;
      })
      .filter(Boolean) as { request: Friendship; fromUser: UserProfile }[];
  }

  async sendFriendRequest(userId: string, targetUsername: string): Promise<Friendship> {
    const target = await this.getProfileByUsername(targetUsername);
    if (!target) throw new Error(`Estudante @${targetUsername} não encontrado.`);
    if (target.id === userId) throw new Error('Não é possível adicionar a si mesmo.');
    if (target.account_status !== 'aprovada') throw new Error('O estudante não está com a conta aprovada.');

    const existing = this.friendships.find(
      (f) => (f.user_id === userId && f.friend_id === target.id) || (f.user_id === target.id && f.friend_id === userId)
    );
    if (existing) {
      if (existing.status === 'aceita') throw new Error('Vocês já são amigos.');
      if (existing.status === 'pendente') throw new Error('Já existe uma solicitação pendente entre vocês.');
      if (existing.status === 'bloqueada') throw new Error('Comunicação indisponível.');
    }

    const rel: Friendship = {
      id: `fr-${Date.now()}`,
      user_id: userId,
      friend_id: target.id,
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.friendships.push(rel);

    const sender = await this.getProfileById(userId);
    this.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: target.id,
      title: 'Nova Solicitação de Amizade',
      message: `@${sender?.username || 'Um estudante'} enviou uma solicitação para estudar com você.`,
      type: 'amizade',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.persistAll();
    return rel;
  }

  async respondFriendRequest(userId: string, requestId: string, accept: boolean): Promise<void> {
    const req = this.friendships.find((f) => f.id === requestId && f.friend_id === userId);
    if (!req) throw new Error('Solicitação não encontrada.');

    req.status = accept ? 'aceita' : 'recusada';
    req.updated_at = new Date().toISOString();

    if (accept) {
      await this.checkAndAwardAchievements(userId, 'ach-amizade');
      await this.checkAndAwardAchievements(req.user_id, 'ach-amizade');

      const responder = await this.getProfileById(userId);
      this.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: req.user_id,
        title: 'Amizade Aceita!',
        message: `@${responder?.username || 'Seu amigo'} aceitou seu pedido. Agora vocês podem estudar juntos!`,
        type: 'amizade',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    this.persistAll();
  }

  async getMessages(userA: string, userB: string): Promise<ChatMessage[]> {
    const areFriends = this.friendships.some(
      (f) =>
        ((f.user_id === userA && f.friend_id === userB) || (f.user_id === userB && f.friend_id === userA)) &&
        f.status === 'aceita'
    );
    if (!areFriends) return [];

    return this.messages
      .filter(
        (m) =>
          (m.sender_id === userA && m.conversation_id.includes(userB)) ||
          (m.sender_id === userB && m.conversation_id.includes(userA))
      )
      .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
  }

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<ChatMessage> {
    if (!content.trim()) throw new Error('Mensagem vazia.');
    const sender = await this.getProfileById(senderId);
    if (!sender) throw new Error('Remetente inválido.');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: `conv-${[senderId, recipientId].sort().join('-')}`,
      sender_id: senderId,
      sender_username: sender.username,
      sender_avatar: sender.avatar_url,
      content: content.trim(),
      sent_at: new Date().toISOString(),
    };
    this.messages.push(newMsg);
    this.persistAll();
    return newMsg;
  }

  async reportUserOrMessage(reporterId: string, reportedUserId: string, reason: string, messageId?: string): Promise<void> {
    this.messageReports.push({
      id: `rep-${Date.now()}`,
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      message_id: messageId,
      reason,
      status: 'aberto',
      created_at: new Date().toISOString(),
    });

    this.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: ROOT_SUPERADMIN.id,
      title: 'Nova Denúncia Recebida',
      message: `Uma mensagem ou usuário foi denunciado por: "${reason}". Verifique no Painel de Moderação.`,
      type: 'aviso',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.persistAll();
  }

  async getReports(): Promise<MessageReport[]> {
    return [...this.messageReports];
  }

  // -------------------------------------------------------------
  // NOTIFICAÇÕES
  // -------------------------------------------------------------
  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    return this.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === notificationId && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      this.persistAll();
    }
  }
}

export const db = new DatabaseEngine();
