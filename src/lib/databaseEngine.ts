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
import { OFFICIAL_QUESTIONS } from '../data/questionsData';

// Estado em memória estruturado exatamente como as tabelas do PostgreSQL Supabase
class DatabaseEngine {
  private profiles: UserProfile[] = [
    {
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
      total_stars: 999,
      total_points: 5000,
      study_streak_days: 30,
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'student-demo-001',
      username: 'cadete_marcos',
      full_name: 'Marcos Vinícius Oliveira',
      email: 'marcos.estudante@email.com',
      grade: '6_ano',
      avatar_url: 'cadet_blue',
      account_status: 'aprovada',
      role: 'estudante',
      guardian_name: 'Sgt. Roberto Carlos Oliveira',
      guardian_phone: '(99) 98844-1234',
      guardian_cpf: '876.543.210-99',
      agreed_terms: true,
      total_stars: 45,
      total_points: 380,
      study_streak_days: 5,
      created_at: new Date('2026-10-05T10:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'student-demo-002',
      username: 'anabeatriz_balsas',
      full_name: 'Ana Beatriz Ferreira',
      email: 'anabeatriz@email.com',
      grade: '7_ano',
      avatar_url: 'cadet_green',
      account_status: 'aprovada',
      role: 'estudante',
      guardian_name: 'Maria Antônia Ferreira',
      guardian_phone: '(99) 98123-4567',
      guardian_cpf: '123.456.789-00',
      agreed_terms: true,
      total_stars: 70,
      total_points: 620,
      study_streak_days: 8,
      created_at: new Date('2026-10-06T14:30:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'student-pending-001',
      username: 'gabriel_novato',
      full_name: 'Gabriel Santos Lima',
      email: 'gabriel@email.com',
      grade: '6_ano',
      avatar_url: 'cadet_yellow',
      account_status: 'pendente',
      role: 'estudante',
      guardian_name: 'Francisca Santos Lima',
      guardian_phone: '(99) 99201-9988',
      guardian_cpf: '555.666.777-88',
      agreed_terms: true,
      total_stars: 0,
      total_points: 0,
      study_streak_days: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  private accessRequests: AccessRequest[] = [
    {
      id: 'req-001',
      user_id: 'student-pending-001',
      username: 'gabriel_novato',
      grade: '6_ano',
      guardian_name: 'Francisca Santos Lima',
      guardian_phone: '(99) 99201-9988',
      requested_at: new Date().toISOString(),
      status: 'pendente',
    },
  ];

  private studyPreferences: Map<string, StudyPreferences> = new Map([
    [
      'student-demo-001',
      {
        id: 'pref-001',
        user_id: 'student-demo-001',
        daily_goal_minutes: 30,
        days_per_week: 5,
        priority_subject: 'ambas',
        sound_effects_enabled: true,
      },
    ],
    [
      'student-demo-002',
      {
        id: 'pref-002',
        user_id: 'student-demo-002',
        daily_goal_minutes: 45,
        days_per_week: 6,
        priority_subject: 'matematica',
        sound_effects_enabled: true,
      },
    ],
  ]);

  private lessonProgress: LessonProgress[] = [
    {
      id: 'prog-001',
      user_id: 'student-demo-001',
      lesson_id: 'les-6-port-tonicidade',
      completed: true,
      completed_at: new Date(Date.now() - 86400000).toISOString(),
      time_spent_seconds: 900,
      last_position_percent: 100,
      last_accessed_at: new Date().toISOString(),
    },
    {
      id: 'prog-002',
      user_id: 'student-demo-001',
      lesson_id: 'les-6-mat-posicional',
      completed: false,
      time_spent_seconds: 650,
      last_position_percent: 60,
      last_accessed_at: new Date().toISOString(),
    },
  ];

  private questionAttempts: QuestionAttempt[] = [
    {
      id: 'att-001',
      user_id: 'student-demo-001',
      question_id: 'q-6-port-01',
      selected_option: 'A',
      is_correct: true,
      explanation_viewed: true,
      answered_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'att-002',
      user_id: 'student-demo-001',
      question_id: 'q-6-mat-01',
      selected_option: 'A',
      is_correct: true,
      explanation_viewed: true,
      answered_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  private quizAttempts: QuizAttempt[] = [
    {
      id: 'quiz-att-001',
      user_id: 'student-demo-001',
      quiz_id: 'simulado-oficial-6ano',
      mode: 'simulado',
      status: 'concluido',
      started_at: new Date(Date.now() - 14400000).toISOString(),
      finished_at: new Date(Date.now() - 7200000).toISOString(),
      time_spent_seconds: 7200,
      score_portuguese: 12,
      score_math: 11,
      total_score: 23,
      total_questions: 30,
      passed_rule_30percent: true,
      answers_data: [],
    },
  ];

  private userAchievements: UserAchievement[] = [
    {
      id: 'uach-001',
      user_id: 'student-demo-001',
      achievement_id: 'ach-primeira-aula',
      unlocked_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'uach-002',
      user_id: 'student-demo-001',
      achievement_id: 'ach-primeiro-quiz',
      unlocked_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  private rewardLedger: RewardLedgerEntry[] = [
    {
      id: 'rew-001',
      user_id: 'student-demo-001',
      stars: 10,
      points: 50,
      reason: 'Conclusão da primeira aula didática: Tonicidade',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'rew-002',
      user_id: 'student-demo-001',
      stars: 35,
      points: 330,
      reason: 'Conclusão do Simulado Oficial 6º Ano (23/30 acertos)',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  private friendships: Friendship[] = [
    {
      id: 'fr-001',
      user_id: 'student-demo-001',
      friend_id: 'student-demo-002',
      status: 'aceita',
      created_at: new Date('2026-10-08T10:00:00Z').toISOString(),
      updated_at: new Date('2026-10-08T10:30:00Z').toISOString(),
    },
  ];

  private messages: ChatMessage[] = [
    {
      id: 'msg-001',
      conversation_id: 'conv-001',
      sender_id: 'student-demo-002',
      sender_username: 'anabeatriz_balsas',
      content: 'Olá Marcos! Você conseguiu resolver aquela questão de MMC dos semáforos?',
      sent_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-002',
      conversation_id: 'conv-001',
      sender_id: 'student-demo-001',
      sender_username: 'cadete_marcos',
      content: 'Oi Ana! Consegui sim, fiz pela fatoração simultânea dividindo por números primos. Deu 36 segundos certinho!',
      sent_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  private notifications: AppNotification[] = [
    {
      id: 'notif-001',
      user_id: 'student-demo-001',
      title: 'Meta Diária Concluída!',
      message: 'Excelente disciplina! Você atingiu sua meta de estudo com sucesso.',
      type: 'meta',
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'notif-002',
      user_id: 'student-demo-001',
      title: 'Aviso da Coordenação CMT XVII',
      message: 'Lembre-se: no dia da prova traga caneta esferográfica de tinta preta transparente e documento com foto.',
      type: 'aviso',
      is_read: true,
      created_at: new Date('2026-10-10T08:00:00Z').toISOString(),
    },
    {
      id: 'notif-003',
      user_id: 'super-admin-001',
      title: 'Novo Cadastro Pendente',
      message: 'O estudante Gabriel Santos Lima (gabriel_novato) aguarda aprovação de acesso.',
      type: 'aviso',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];

  private messageReports: MessageReport[] = [];

  private auditLogs: AuditLog[] = [
    {
      id: 'aud-001',
      admin_id: 'super-admin-001',
      admin_username: 'diretoria_cmt',
      action: 'SISTEMA_INICIALIZADO',
      target_entity: 'PLATAFORMA',
      target_id: 'cmt-xvii-balsas',
      details: { edital: 'Edital Nº 001/26 - CMT XVII', vagas: 120 },
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
    },
  ];

  // -------------------------------------------------------------
  // AUTENTICAÇÃO E PERFIS
  // -------------------------------------------------------------
  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const clean = username.trim().toLowerCase();
    const found = this.profiles.find((p) => p.username.toLowerCase() === clean);
    return found ? { ...found } : null;
  }

  async getProfileById(userId: string): Promise<UserProfile | null> {
    const found = this.profiles.find((p) => p.id === userId);
    return found ? { ...found } : null;
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    return [...this.profiles];
  }

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
      account_status: 'pendente', // REGRA DE OURO: OBRIGATORIAMENTE PENDENTE
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

    // Notificar administração
    this.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: 'super-admin-001',
      title: 'Nova Solicitação de Matrícula',
      message: `Estudante ${newProfile.full_name} (@${newProfile.username}) para o ${newProfile.grade === '6_ano' ? '6º Ano' : '7º Ano'} aguarda aprovação.`,
      type: 'aviso',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Se Supabase estiver conectado, grava também lá
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').insert([newProfile]);
        await supabase.from('access_requests').insert([newRequest]);
      } catch (e) {
        console.warn('Sync to Supabase:', e);
      }
    }

    return { user: newProfile, request: newRequest };
  }

  // -------------------------------------------------------------
  // ADMINISTRAÇÃO E APROVAÇÃO DE ACESSO
  // -------------------------------------------------------------
  async updateAccountStatus(
    adminId: string,
    targetUserId: string,
    newStatus: AccountStatus,
    reason?: string
  ): Promise<UserProfile> {
    const admin = await this.getProfileById(adminId);
    if (!admin || admin.role !== 'superusuario') {
      throw new Error('Acesso negado: Somente o superusuário possui permissão para alterar estados de conta.');
    }

    const targetIndex = this.profiles.findIndex((p) => p.id === targetUserId);
    if (targetIndex === -1) {
      throw new Error('Estudante não encontrado.');
    }

    const previousStatus = this.profiles[targetIndex].account_status;
    this.profiles[targetIndex].account_status = newStatus;
    this.profiles[targetIndex].updated_at = new Date().toISOString();

    // Atualiza solicitação se houver
    const req = this.accessRequests.find((r) => r.user_id === targetUserId);
    if (req) {
      req.status = newStatus === 'aprovada' ? 'aprovado' : 'recusado';
      req.reviewed_at = new Date().toISOString();
      req.reviewed_by = adminId;
      req.rejection_reason = reason;
    }

    // Registra log de auditoria
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
        motivo: reason || 'Ação administrativa',
      },
      created_at: new Date().toISOString(),
    });

    // Notificação para o estudante se aprovado
    if (newStatus === 'aprovada') {
      this.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: targetUserId,
        title: 'Acesso Aprovado!',
        message: 'Parabéns! Sua matrícula e acesso à Plataforma CMT XVII foram aprovados pela Diretoria.',
        type: 'aprovacao',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return { ...this.profiles[targetIndex] };
  }

  async getAccessRequests(): Promise<AccessRequest[]> {
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
    return def;
  }

  async saveStudyPreferences(userId: string, data: Partial<StudyPreferences>): Promise<StudyPreferences> {
    const current = await this.getStudyPreferences(userId);
    const updated = { ...current, ...data };
    this.studyPreferences.set(userId, updated);
    return updated;
  }

  // -------------------------------------------------------------
  // PROGRESSO DAS AULAS E SALVAMENTO
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
      await this.awardStars(userId, starsEarned, 50, `Conclusão com louvor da aula: ${lessonId}`);
      await this.checkAndAwardAchievements(userId, 'ach-primeira-aula');
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
  }

  // Obter última aula para o botão "Continuar estudando"
  async getLastStudiedLesson(userId: string): Promise<LessonProgress | null> {
    const list = this.lessonProgress
      .filter((p) => p.user_id === userId)
      .sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime());
    return list[0] || null;
  }

  // -------------------------------------------------------------
  // BANCO DE QUESTÕES E TENTATIVAS
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

    // Verificar histórico de acertos
    const userAttempts = this.questionAttempts.filter((a) => a.user_id === userId);
    const correctCount = userAttempts.filter((a) => a.is_correct).length;
    if (correctCount >= 5) {
      await this.checkAndAwardAchievements(userId, 'ach-5-acertos');
    }

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
    const gradePortugueseRequired = quizId.includes('6ano') ? 5 : 6; // ~30% do total da disciplina
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

    // Recompensas
    const starsReward = 20 + Math.floor((totalScore / totalQuestions) * 30);
    await this.awardStars(userId, starsReward, totalScore * 10, `Simulado concluído (${totalScore}/${totalQuestions} acertos)`);
    await this.checkAndAwardAchievements(userId, 'ach-simulado-cmt');
    if (passed30Percent) {
      await this.checkAndAwardAchievements(userId, 'ach-regra-corte');
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

    await this.awardStars(userId, meta.stars_reward, meta.points_reward, `Conquista desbloqueada: ${meta.title}`);

    this.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title: 'Nova Conquista Desbloqueada!',
      message: `Você conquistou a medalha "${meta.title}". +${meta.stars_reward} estrelas adicionadas!`,
      type: 'conquista',
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievements.filter((ua) => ua.user_id === userId);
  }

  async getRewardLedger(userId: string): Promise<RewardLedgerEntry[]> {
    return this.rewardLedger.filter((r) => r.user_id === userId);
  }

  // -------------------------------------------------------------
  // COMUNIDADE SEGURA: AMIZADES E CHAT
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
  }

  async getMessages(userA: string, userB: string): Promise<ChatMessage[]> {
    // Apenas amigos podem trocar mensagens
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
          (m.sender_id === userB && m.conversation_id.includes(userA)) ||
          m.conversation_id === 'conv-001'
      )
      .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
  }

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<ChatMessage> {
    if (!content.trim()) throw new Error('Mensagem vazia.');
    const sender = await this.getProfileById(senderId);
    if (!sender) throw new Error('Remetente inválido.');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: 'conv-001',
      sender_id: senderId,
      sender_username: sender.username,
      sender_avatar: sender.avatar_url,
      content: content.trim(),
      sent_at: new Date().toISOString(),
    };
    this.messages.push(newMsg);
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
      user_id: 'super-admin-001',
      title: 'Nova Denúncia Recebida',
      message: `Uma mensagem ou usuário foi denunciado por: "${reason}". Verifique no Painel de Moderação.`,
      type: 'aviso',
      is_read: false,
      created_at: new Date().toISOString(),
    });
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
    if (notif) notif.is_read = true;
  }
}

export const db = new DatabaseEngine();
