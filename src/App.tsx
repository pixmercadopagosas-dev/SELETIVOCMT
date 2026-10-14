import React, { useState, useEffect } from 'react';
import { UserProfile, LessonProgress, StudyPreferences, QuizAttempt } from './types';
import { db } from './lib/databaseEngine';
import { ThemeProvider, useAppTheme } from './lib/themeContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { CmtLogo } from './components/common/CmtLogo';
import { Dashboard } from './components/student/Dashboard';
import { StudyPlanner } from './components/student/StudyPlanner';
import { SubjectView } from './components/student/SubjectView';
import { LessonView } from './components/student/LessonView';
import { InteractiveQuiz } from './components/student/InteractiveQuiz';
import { SimulatedExam } from './components/student/SimulatedExam';
import { PerformanceReport } from './components/student/PerformanceReport';
import { AchievementsView } from './components/student/AchievementsView';
import { StudyCommunity } from './components/student/StudyCommunity';
import { NotificationsCenter } from './components/student/NotificationsCenter';
import { StudentProfile } from './components/student/StudentProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DatabaseConnectionView } from './components/admin/DatabaseConnectionView';
import { AiStudyTutorView } from './components/student/AiStudyTutorView';
import { FloatingAiAssistant } from './components/student/FloatingAiAssistant';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { PendingApprovalView } from './components/auth/PendingApprovalView';
import { SupabaseStatusModal } from './components/common/SupabaseStatusModal';
import { ThemeSelectorModal } from './components/common/ThemeSelectorModal';
import { ThemeCompanionWidget } from './components/common/ThemeCompanionWidget';
import { LESSONS_DATA } from './data/curriculumData';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Wand2,
} from 'lucide-react';

function MainApp() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('inicio');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [quizTopicFilter, setQuizTopicFilter] = useState<string | undefined>(undefined);
  const [studyPreferences, setStudyPreferences] = useState<StudyPreferences>({
    id: 'default',
    user_id: 'default',
    daily_goal_minutes: 30,
    days_per_week: 5,
    priority_subject: 'ambas',
    sound_effects_enabled: true,
  });
  const [lastStudiedProgress, setLastStudiedProgress] = useState<LessonProgress | null>(null);
  const [userProgressList, setUserProgressList] = useState<LessonProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Responsive mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const { cartoonConfig } = useAppTheme();

  // Auto-load demo initial student for instant UX
  useEffect(() => {
    initUser('student-demo-001');
  }, []);

  const initUser = async (userId: string) => {
    const user = await db.getProfileById(userId);
    if (user) {
      setCurrentUser(user);
      loadUserData(user.id);
    }
  };

  const loadUserData = async (userId: string) => {
    const prefs = await db.getStudyPreferences(userId);
    const last = await db.getLastStudiedLesson(userId);
    const allProg = await db.getAllUserProgress(userId);
    const qAtt = await db.getUserQuizAttempts(userId);
    const notifs = await db.getUserNotifications(userId);

    setStudyPreferences(prefs);
    setLastStudiedProgress(last);
    setUserProgressList(allProg);
    setQuizAttempts(qAtt);
    setUnreadNotificationsCount(notifs.filter((n) => !n.is_read).length);
  };

  const handleSwitchUser = async (userId: string) => {
    setActiveLessonId(null);
    setCurrentTab('inicio');
    await initUser(userId);
  };

  const handleOpenLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  const handleLessonBack = () => {
    setActiveLessonId(null);
    if (currentUser) loadUserData(currentUser.id);
  };

  const handleStartQuizFromTopic = (topicId?: string) => {
    setQuizTopicFilter(topicId);
    setActiveLessonId(null);
    setCurrentTab('questionarios');
  };

  // -------------------------------------------------------------
  // CONDITIONAL RENDERING: PENDING OR SUSPENDED ACCOUNTS
  // -------------------------------------------------------------
  if (currentUser && currentUser.account_status === 'pendente') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar
          currentUser={currentUser}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => {}}
          onOpenSupabaseStatus={() => {}}
          onOpenProfile={() => {}}
          onOpenThemeModal={() => setThemeModalOpen(true)}
          onLogout={() => setCurrentUser(null)}
          onSwitchUser={handleSwitchUser}
        />
        <PendingApprovalView
          currentUser={currentUser}
          onStatusUpdated={(updated) => setCurrentUser(updated)}
          onLogout={() => setCurrentUser(null)}
        />
        <ThemeSelectorModal
          isOpen={themeModalOpen}
          onClose={() => setThemeModalOpen(false)}
        />
      </div>
    );
  }

  if (currentUser && (currentUser.account_status === 'suspensa' || currentUser.account_status === 'bloqueada')) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar
          currentUser={currentUser}
          unreadNotificationsCount={0}
          onOpenNotifications={() => {}}
          onOpenSupabaseStatus={() => {}}
          onOpenProfile={() => {}}
          onOpenThemeModal={() => setThemeModalOpen(true)}
          onLogout={() => setCurrentUser(null)}
          onSwitchUser={handleSwitchUser}
        />
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-red-200 p-8 max-w-md text-center space-y-4 shadow-xl">
            <div className="p-3 bg-red-100 text-red-700 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Acesso Temporariamente Suspenso</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sua conta foi suspensa pela coordenação. Entre em contato com a secretaria do Colégio Militar Tiradentes XVII pelo telefone (99) 99113-6329.
            </p>
            <button
              onClick={() => setCurrentUser(null)}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // INSTITUTIONAL LANDING PAGE IF NO USER LOGGED IN
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Institutional Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <CmtLogo size="sm" showText={true} />
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setThemeModalOpen(true)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-xl border border-purple-200"
              >
                🎨 Cores & Temas
              </button>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors"
              >
                Fazer Login
              </button>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-12 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-100 text-red-900 rounded-full text-xs font-extrabold uppercase tracking-wide">
              <span>Edital Nº 001/26 — Processo Seletivo Oficial</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Plataforma Inteligente de Estudos <br />
              <span className="text-blue-900">Colégio Militar Tiradentes XVII</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Preparatório pedagógico completo para ingresso no <strong>6º e 7º ano do Ensino Fundamental</strong> da Unidade Balsas / Maranhão. Aulas detalhadas, vídeos educativos, banco de questões com correção passo a passo e simulados cronometrados.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Acessar Área do Estudante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-sm transition-colors"
              >
                Cadastrar Novo Estudante
              </button>
            </div>
          </div>

          {/* Edital Official Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Quadro de Vagas Oficiais</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Total de <strong>120 vagas</strong>: 90 vagas no 6º Ano e 30 vagas no 7º Ano. Distribuídas em 50% Dependentes Militares, 45% Comunidade Geral e 5% PCD.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-900 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Estrutura das Provas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                6º Ano: 30 questões (15 Português + 15 Matemática). 7º Ano: 40 questões (20 Português + 20 Matemática). 4 horas de duração e corte mínimo de 30% por disciplina.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Aprendizagem com Gamificação</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Estrelas de honra, medalhas por marcos alcançados, tutor inteligente para tirar dúvidas e temas personalizáveis para animar os estudos!
              </p>
            </div>
          </div>
        </main>

        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            loadUserData(u.id);
          }}
          onOpenRegister={() => setRegisterModalOpen(true)}
        />

        <RegisterModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onRegisterSuccess={(u) => {
            setCurrentUser(u);
          }}
          onOpenLogin={() => setLoginModalOpen(true)}
        />

        <ThemeSelectorModal
          isOpen={themeModalOpen}
          onClose={() => setThemeModalOpen(false)}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE LESSON VIEW OR PRIMARY LOGGED IN INTERFACE
  // -------------------------------------------------------------
  const activeLesson = activeLessonId ? LESSONS_DATA.find((l) => l.id === activeLessonId) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setCurrentTab('notificacoes')}
        onOpenSupabaseStatus={() => setCurrentTab('teste-banco')}
        onOpenProfile={() => setCurrentTab('perfil')}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
        onSwitchUser={handleSwitchUser}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Interactive Theme Companion Banner (Ben 10 Omnitrix & Aliens, Teen Themes, etc.) */}
      <ThemeCompanionWidget />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setActiveLessonId(null);
            setCurrentTab(tab);
          }}
          userRole={currentUser.role}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onSwitchToSuperUser={() => handleSwitchUser('super-admin-001')}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {activeLesson ? (
            <LessonView
              lesson={activeLesson}
              currentUser={currentUser}
              progress={userProgressList.find((p) => p.lesson_id === activeLesson.id) || null}
              onBack={handleLessonBack}
              onStartQuiz={(topicId) => handleStartQuizFromTopic(topicId)}
              onLessonCompleted={() => {
                loadUserData(currentUser.id);
              }}
            />
          ) : (
            <>
              {currentTab === 'inicio' && (
                <Dashboard
                  currentUser={currentUser}
                  lastStudiedProgress={lastStudiedProgress}
                  studyPreferences={studyPreferences}
                  quizAttempts={quizAttempts}
                  onOpenLesson={handleOpenLesson}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {/* ABA EXCLUSIVA DO TUTOR I.A PEDAGÓGICO */}
              {currentTab === 'tutor-ia' && (
                <AiStudyTutorView
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'plano' && (
                <StudyPlanner
                  currentUser={currentUser}
                  currentPreferences={studyPreferences}
                  onUpdatePreferences={(up) => setStudyPreferences(up)}
                  onOpenLesson={handleOpenLesson}
                />
              )}

              {currentTab === 'portugues' && (
                <SubjectView
                  subjectId="portugues"
                  gradeId={currentUser.grade}
                  userProgress={userProgressList}
                  onOpenLesson={handleOpenLesson}
                  onOpenQuiz={(topId) => handleStartQuizFromTopic(topId)}
                />
              )}

              {currentTab === 'matematica' && (
                <SubjectView
                  subjectId="matematica"
                  gradeId={currentUser.grade}
                  userProgress={userProgressList}
                  onOpenLesson={handleOpenLesson}
                  onOpenQuiz={(topId) => handleStartQuizFromTopic(topId)}
                />
              )}

              {currentTab === 'questionarios' && (
                <InteractiveQuiz
                  currentUser={currentUser}
                  topicId={quizTopicFilter}
                  onBack={() => setCurrentTab('inicio')}
                  onQuestionCompleted={() => loadUserData(currentUser.id)}
                  onOpenLesson={handleOpenLesson}
                />
              )}

              {currentTab === 'simulados' && (
                <SimulatedExam
                  currentUser={currentUser}
                  onBack={() => setCurrentTab('inicio')}
                  onFinishExam={() => loadUserData(currentUser.id)}
                />
              )}

              {currentTab === 'desempenho' && (
                <PerformanceReport currentUser={currentUser} />
              )}

              {currentTab === 'conquistas' && (
                <AchievementsView currentUser={currentUser} />
              )}

              {currentTab === 'comunidade' && (
                <StudyCommunity currentUser={currentUser} />
              )}

              {currentTab === 'notificacoes' && (
                <NotificationsCenter
                  currentUser={currentUser}
                  onRefreshUnreadCount={() => loadUserData(currentUser.id)}
                />
              )}

              {currentTab === 'perfil' && (
                <StudentProfile
                  currentUser={currentUser}
                  studyPreferences={studyPreferences}
                  onUpdateUser={(u) => setCurrentUser(u)}
                  onUpdatePreferences={(p) => setStudyPreferences(p)}
                />
              )}

              {currentTab === 'admin' && (
                <AdminDashboard
                  currentAdmin={currentUser}
                  onRefreshData={() => loadUserData(currentUser.id)}
                  onNavigateToDbTab={() => setCurrentTab('teste-banco')}
                />
              )}

              {/* ABA EXCLUSIVA DO SUPERUSUÁRIO: TESTE DE CONEXÃO COM O BANCO */}
              {currentTab === 'teste-banco' && (
                <DatabaseConnectionView
                  currentUser={currentUser}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onSwitchUser={handleSwitchUser}
                />
              )}
            </>
          )}
        </main>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          loadUserData(u.id);
        }}
        onOpenRegister={() => setRegisterModalOpen(true)}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onRegisterSuccess={(u) => {
          setCurrentUser(u);
        }}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Supabase Status Modal (Acesso restrito ao Superusuário) */}
      <SupabaseStatusModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onOpenDatabaseTab={() => setCurrentTab('teste-banco')}
      />

      {/* Theme and Cartoon Selector Modal */}
      <ThemeSelectorModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      {/* Floating AI Study Assistant Widget */}
      <FloatingAiAssistant
        currentUser={currentUser}
        currentTab={currentTab}
        onNavigateToAiTab={() => setCurrentTab('tutor-ia')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
