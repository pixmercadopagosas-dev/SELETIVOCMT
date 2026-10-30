import React from 'react';
import {
  UserProfile,
  LessonProgress,
  StudyPreferences,
  QuizAttempt,
} from '../../types';
import {
  BookOpen,
  Calculator,
  PlayCircle,
  Clock,
  ArrowRight,
  Flame,
  Star,
  CheckCircle2,
  CalendarCheck,
  Award,
  Users,
  Zap,
  Sparkles,
} from 'lucide-react';
import { LESSONS_DATA, SUBJECTS_INFO } from '../../data/curriculumData';
import { useAppTheme } from '../../lib/themeContext';
import { OmnitrixDialIcon, renderThemeIcon } from '../common/AlienSvgIcons';

interface DashboardProps {
  currentUser: UserProfile;
  lastStudiedProgress: LessonProgress | null;
  studyPreferences: StudyPreferences;
  quizAttempts: QuizAttempt[];
  onOpenLesson: (lessonId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  lastStudiedProgress,
  studyPreferences,
  quizAttempts,
  onOpenLesson,
  onNavigateTab,
}) => {
  const is6Ano = currentUser.grade === '6_ano';
  const gradeLabel = is6Ano ? '6º Ano' : '7º Ano';

  const { currentCartoon, activeAlienProfile, activeTeenProfile } = useAppTheme();

  // Last studied lesson details
  const lastLesson = lastStudiedProgress
    ? LESSONS_DATA.find((l) => l.id === lastStudiedProgress.lesson_id)
    : LESSONS_DATA[0];

  // Recommended lessons for the student's grade
  const recommendedLessons = LESSONS_DATA.filter((l) =>
    is6Ano ? l.id.includes('6-') : l.id.includes('7-')
  ).slice(0, 3);

  // Stats
  const lastExam = quizAttempts[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div
        className={`relative overflow-hidden text-white rounded-2xl p-6 sm:p-8 shadow-lg border transition-all duration-300 ${
          currentCartoon === 'ben10_alien'
            ? `bg-gradient-to-r ${activeAlienProfile.themeGradient}`
            : currentCartoon === 'cyber_gamer_boy'
            ? 'bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 border-cyan-500/50 shadow-cyan-500/20'
            : currentCartoon === 'aesthetic_y2k_girl'
            ? 'bg-gradient-to-r from-purple-950 via-pink-950 to-slate-950 border-pink-400/50 shadow-pink-500/20'
            : 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 border-blue-800/50'
        }`}
        style={
          currentCartoon === 'ben10_alien'
            ? {
                borderColor: `${activeAlienProfile.powerColor}80`,
                boxShadow: `0 0 25px ${activeAlienProfile.powerColor}35`,
              }
            : {}
        }
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Colégio Militar Tiradentes XVII — Preparatório {gradeLabel}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Que bom ter você de volta, <span className="text-yellow-400">{currentUser.full_name || currentUser.username}</span>!
            </h1>

            <p className="text-sm text-blue-100/90 leading-relaxed">
              Preparando-se com foco e disciplina para o processo seletivo oficial de Balsas.
              Vamos continuar seus estudos com excelência hoje?
            </p>

            {/* Quick Continue Studying Button */}
            {lastLesson && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenLesson(lastLesson.id)}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-102"
                  style={{
                    backgroundColor:
                      currentCartoon === 'ben10_alien'
                        ? activeAlienProfile.powerColor
                        : '#facc15',
                    color: currentCartoon === 'ben10_alien' ? '#ffffff' : '#0a1931',
                  }}
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Continuar Estudando: {lastLesson.title.split(':')[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateTab('simulados')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/40 hover:bg-black/60 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/20 transition-colors"
                >
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>Simulado Cronometrado</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Alien / Mascot Card - DESTAQUE VISUAL DOS TEMAS */}
          {currentCartoon === 'ben10_alien' && (
            <div
              className="w-full md:w-auto shrink-0 bg-slate-950/90 border-2 rounded-2xl p-4 text-center flex flex-col items-center transition-all"
              style={{
                borderColor: activeAlienProfile.powerColor,
                boxShadow: `0 0 25px ${activeAlienProfile.powerColor}45`,
              }}
            >
              <div className="relative">
                {renderThemeIcon(activeAlienProfile.iconName, 'w-16 h-16')}
                <span className="absolute -bottom-1 -right-1">
                  <OmnitrixDialIcon className="w-6 h-6" />
                </span>
              </div>
              <span
                className="text-xs font-black mt-2"
                style={{ color: activeAlienProfile.powerColor }}
              >
                {activeAlienProfile.name}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                {activeAlienProfile.species}
              </span>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full mt-1 text-white shadow-xs"
                style={{ backgroundColor: activeAlienProfile.powerColor }}
              >
                Cor: {activeAlienProfile.colorLabel}
              </span>
              <p className="text-[10px] text-slate-300 italic mt-1.5 max-w-[200px]">
                "{activeAlienProfile.quote}"
              </p>
            </div>
          )}

          {currentCartoon === 'cyber_gamer_boy' && (
            <div className="w-full md:w-auto shrink-0 bg-slate-950/90 border-2 border-cyan-400 rounded-2xl p-4 text-center shadow-[0_0_20px_rgba(6,182,212,0.35)] flex flex-col items-center">
              {renderThemeIcon(activeTeenProfile.iconName, 'w-16 h-16')}
              <span className="text-xs font-black text-cyan-300 mt-2 font-mono">
                {activeTeenProfile.name}
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">
                {activeTeenProfile.title}
              </span>
              <span className="text-[9px] bg-cyan-950 border border-cyan-600/60 text-cyan-300 font-bold px-2 py-0.5 rounded-full mt-1 font-mono">
                Modo 144 FPS
              </span>
              <p className="text-[10px] text-slate-300 italic mt-1.5 max-w-[200px]">
                "{activeTeenProfile.quote}"
              </p>
            </div>
          )}

          {currentCartoon === 'aesthetic_y2k_girl' && (
            <div className="w-full md:w-auto shrink-0 bg-pink-950/90 border-2 border-pink-400 rounded-2xl p-4 text-center shadow-[0_0_20px_rgba(236,72,153,0.35)] flex flex-col items-center">
              {renderThemeIcon(activeTeenProfile.iconName, 'w-16 h-16')}
              <span className="text-xs font-black text-pink-300 mt-2">
                {activeTeenProfile.name}
              </span>
              <span className="text-[10px] text-pink-200 font-bold">
                {activeTeenProfile.title}
              </span>
              <span className="text-[9px] bg-pink-900 border border-pink-500/60 text-pink-200 font-bold px-2 py-0.5 rounded-full mt-1">
                Study Glow ✨
              </span>
              <p className="text-[10px] text-pink-200/90 italic mt-1.5 max-w-[200px]">
                "{activeTeenProfile.quote}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Goal & Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Meta Diária */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CalendarCheck className="w-4 h-4 text-blue-700" />
                Meta Diária de Estudos
              </span>
              <button
                onClick={() => onNavigateTab('plano')}
                className="text-blue-700 hover:underline text-[11px]"
              >
                Ajustar
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {studyPreferences.daily_goal_minutes}
              </span>
              <span className="text-xs font-semibold text-slate-500">minutos por dia</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Plano ativo: {studyPreferences.days_per_week} dias por semana
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1 text-orange-600 font-bold">
              <Flame className="w-4 h-4 fill-orange-500" />
              {currentUser.study_streak_days} dias seguidos
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px]">
              Meta em dia
            </span>
          </div>
        </div>

        {/* Estrelas e Recompensas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                Estrelas de Honra
              </span>
              <button
                onClick={() => onNavigateTab('conquistas')}
                className="text-blue-700 hover:underline text-[11px]"
              >
                Conquistas
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-yellow-600">
                {currentUser.total_stars}
              </span>
              <span className="text-xs font-semibold text-slate-500">estrelas acumuladas</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser.total_points} pontos de experiência pedagógica
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Nível: Cadete Estudioso</span>
            <Award className="w-4 h-4 text-yellow-600" />
          </div>
        </div>

        {/* Desempenho no Simulado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Clock className="w-4 h-4 text-red-700" />
                Último Simulado do Edital
              </span>
              <button
                onClick={() => onNavigateTab('simulados')}
                className="text-blue-700 hover:underline text-[11px]"
              >
                Histórico
              </button>
            </div>
            {lastExam ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {lastExam.total_score} / {lastExam.total_questions}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    ({Math.round((lastExam.total_score / lastExam.total_questions) * 100)}% de acerto)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Português: {lastExam.score_portuguese} • Matemática: {lastExam.score_math}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-700">Nenhum simulado ainda</p>
                <p className="text-xs text-slate-500 mt-1">
                  Faça um simulado cronometrado de {is6Ano ? '30' : '40'} questões para avaliar seu ritmo.
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            {lastExam?.passed_rule_30percent ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Aprovado no Ponto de Corte
              </span>
            ) : (
              <span className="text-blue-900 font-bold">Critério: mín. 30% por matéria</span>
            )}
          </div>
        </div>
      </div>

      {/* Subject Cards (Língua Portuguesa & Matemática) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBJECTS_INFO.map((subject) => {
          const isPort = subject.id === 'portugues';
          const Icon = isPort ? BookOpen : Calculator;
          return (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isPort ? 'bg-blue-900 text-white' : 'bg-red-800 text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">{subject.name}</h2>
                      <span className="text-xs text-slate-500">Programa do Edital Oficial</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {gradeLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {isPort
                    ? 'Interpretação textual, gêneros, acentuação gráfica, classes gramaticais, conjugações e ortografia oficial.'
                    : 'Sistema decimal até bilhões, cálculo mental, algarismos romanos, geometria, medidas, frações, MMC e MDC.'}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Progresso dos Módulos</span>
                    <span>{isPort ? '65%' : '50%'}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPort ? 'bg-blue-900' : 'bg-red-700'}`}
                      style={{ width: isPort ? '65%' : '50%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigateTab(subject.id)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-700"
                >
                  <span>Explorar Módulos e Aulas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateTab('questionarios')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Exercícios
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Lessons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Aulas Didáticas em Destaque</h2>
            <p className="text-xs text-slate-500">
              Aulas escritas com exemplos passo a passo, erros comuns e vídeos
            </p>
          </div>
          <span className="text-xs font-bold text-blue-900">Edital CMT XVII</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                    {lesson.id.includes('port') ? 'Língua Portuguesa' : 'Matemática'}
                  </span>
                  {currentCartoon === 'ben10_alien' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md">
                      <Zap className="w-2.5 h-2.5 text-emerald-600" />
                      Boost {activeAlienProfile.name.split(' ')[0]}
                    </span>
                  )}
                  {currentCartoon === 'cyber_gamer_boy' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-cyan-900 bg-cyan-100 border border-cyan-300 px-1.5 py-0.5 rounded-md font-mono">
                      XP 2x Pro
                    </span>
                  )}
                  {currentCartoon === 'aesthetic_y2k_girl' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-pink-900 bg-pink-100 border border-pink-300 px-1.5 py-0.5 rounded-md">
                      ✨ Study Glow
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {lesson.simple_explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> +10 estrelas
                </span>
                <button
                  onClick={() => onOpenLesson(lesson.id)}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Estudar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Community / Peer Support Notice */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900 text-white rounded-xl shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-950">
              Comunidade de Estudos Segura CMT XVII
            </h3>
            <p className="text-xs text-blue-800 mt-0.5">
              Tire dúvidas pedagógicas, compartilhe dicas e estude com amigos aprovados em um ambiente moderado e protegido.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('comunidade')}
          className="whitespace-nowrap px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Acessar Comunidade
        </button>
      </div>
    </div>
  );
};
