export type GradeId = '6_ano' | '7_ano';
export type SubjectId = 'portugues' | 'matematica';
export type AccountStatus = 'pendente' | 'aprovada' | 'suspensa' | 'bloqueada';
export type UserRole = 'estudante' | 'professor' | 'superusuario';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  grade: GradeId;
  avatar_url: string;
  account_status: AccountStatus;
  role: UserRole;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_cpf?: string;
  agreed_terms: boolean;
  total_stars: number;
  total_points: number;
  study_streak_days: number;
  theme_color?: 'militar_azul' | 'vermelho_heroi' | 'verde_aventura' | 'roxo_galactico' | 'dourado_campeao' | 'laranja_fogo';
  cartoon_theme?: 'nenhum' | 'ben10_alien' | 'pokemon_master' | 'minecraft_craft' | 'super_herois' | 'ninja_shonen';
  created_at: string;
  updated_at: string;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  username: string;
  grade: GradeId;
  guardian_name?: string;
  guardian_phone?: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  rejection_reason?: string;
}

export interface StudyPreferences {
  id: string;
  user_id: string;
  daily_goal_minutes: number; // 15, 20, 30, 45, 60
  days_per_week: number;
  priority_subject: 'portugues' | 'matematica' | 'ambas';
  sound_effects_enabled: boolean;
  theme_color?: 'militar_azul' | 'vermelho_heroi' | 'verde_aventura' | 'roxo_galactico' | 'dourado_campeao' | 'laranja_fogo';
  cartoon_theme?: 'nenhum' | 'ben10_alien' | 'pokemon_master' | 'minecraft_craft' | 'super_herois' | 'ninja_shonen';
}

export interface Subject {
  id: SubjectId;
  name: string;
  color_hex: string;
  icon: string;
}

export interface Module {
  id: string;
  grade_id: GradeId;
  subject_id: SubjectId;
  title: string;
  description: string;
  order_index: number;
}

export interface Topic {
  id: string;
  module_id: string;
  title: string;
  summary: string;
  order_index: number;
}

export interface StepExample {
  title: string;
  problem: string;
  steps: string[];
  final_answer: string;
}

export interface QuickReviewQuestion {
  question: string;
  answer: string;
  tip: string;
}

export interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  learning_objective: string;
  simple_explanation: string;
  detailed_development: string;
  step_by_step_examples: StepExample[];
  daily_applications: string;
  summary_keypoints: string[];
  common_pitfalls: string;
  quick_review_questions: QuickReviewQuestion[];
  order_index: number;
  is_active: boolean;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  time_spent_seconds: number;
  last_position_percent: number;
  last_accessed_at: string;
}

export interface EducationalVideo {
  id: string;
  lesson_id?: string;
  topic_id: string;
  youtube_url: string;
  video_id: string;
  title: string;
  channel_name: string;
  duration_label: string;
  is_approved: boolean;
}

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface Question {
  id: string;
  grade_id: GradeId;
  subject_id: SubjectId;
  topic_id?: string;
  lesson_id?: string;
  statement: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  options: QuestionOption[];
  correct_option: 'A' | 'B' | 'C' | 'D' | 'E';
  detailed_explanation: string;
  why_correct: string;
  why_incorrect_notes: Record<string, string>;
  step_by_step_solution: string;
  ai_generated?: boolean;
  is_approved: boolean;
  version: number;
}

export interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | 'E';
  is_correct: boolean;
  explanation_viewed: boolean;
  answered_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  mode: 'treino_imediato' | 'simulado';
  status: 'em_andamento' | 'concluido' | 'abandonado';
  started_at: string;
  finished_at?: string;
  time_spent_seconds: number;
  score_portuguese: number;
  score_math: number;
  total_score: number;
  total_questions: number;
  passed_rule_30percent: boolean;
  answers_data: {
    question_id: string;
    selected_option?: 'A' | 'B' | 'C' | 'D' | 'E';
    is_correct?: boolean;
    flagged_for_review?: boolean;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'estudo' | 'precisao' | 'simulado' | 'constancia';
  stars_reward: number;
  points_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface RewardLedgerEntry {
  id: string;
  user_id: string;
  stars: number;
  points: number;
  reason: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  friend_profile?: UserProfile;
  status: 'pendente' | 'aceita' | 'recusada' | 'bloqueada';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_username?: string;
  sender_avatar?: string;
  content: string;
  sent_at: string;
  read_at?: string;
}

export interface MessageReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  message_id?: string;
  reason: string;
  status: 'aberto' | 'analisado' | 'acao_tomada' | 'rejeitado';
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'aprovacao' | 'amizade' | 'meta' | 'conquista' | 'simulado' | 'aviso';
  is_read: boolean;
  action_link?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_username: string;
  action: string;
  target_entity: string;
  target_id?: string;
  details: Record<string, any>;
  created_at: string;
}
