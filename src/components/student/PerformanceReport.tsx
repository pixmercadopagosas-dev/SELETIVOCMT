import React, { useState, useEffect } from 'react';
import { UserProfile, QuizAttempt, LessonProgress, QuestionAttempt } from '../../types';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Calculator,
  Calendar,
  Flame,
  Star,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface PerformanceReportProps {
  currentUser: UserProfile;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({ currentUser }) => {
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);

  useEffect(() => {
    loadStats();
  }, [currentUser.id]);

  const loadStats = async () => {
    const qAtt = await db.getUserQuizAttempts(currentUser.id);
    const lProg = await db.getAllUserProgress(currentUser.id);
    const qAttempts = await db.getUserQuestionAttempts(currentUser.id);
    setQuizAttempts(qAtt);
    setLessonProgress(lProg);
    setQuestionAttempts(qAttempts);
  };

  const is6Ano = currentUser.grade === '6_ano';
  const totalQuestionsSimulado = is6Ano ? 30 : 40;

  const completedLessonsCount = lessonProgress.filter((l) => l.completed).length;
  const correctQuestionsCount = questionAttempts.filter((q) => q.is_correct).length;
  const totalExercisesCount = questionAttempts.length;
  const exerciseAccuracy = totalExercisesCount > 0 ? Math.round((correctQuestionsCount / totalExercisesCount) * 100) : 100;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <span>Relatório Pedagógico Individual • CMT XVII</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Meu Desempenho e Evolução
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhamento contínuo de acertos, simulados concluídos e evolução nos conteúdos do edital.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900 text-xs font-bold flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
            <span>{currentUser.total_stars} Estrelas</span>
          </div>
          <div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-900 text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>{currentUser.study_streak_days} Dias Seguidos</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Aulas Concluídas</span>
          <p className="text-2xl font-extrabold text-blue-950 mt-1">
            {completedLessonsCount}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Leituras e teorias completas</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Exercícios Resolvidos</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalExercisesCount}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {correctQuestionsCount} acertos registrados
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Aproveitamento em Questões</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {exerciseAccuracy}%
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Taxa de precisão geral</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Simulados Oficiais</span>
          <p className="text-2xl font-extrabold text-red-700 mt-1">
            {quizAttempts.length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {is6Ano ? '30 questões por prova' : '40 questões por prova'}
          </span>
        </div>
      </div>

      {/* Simulados History List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">
            Histórico de Simulados Realizados
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Critério do Edital: mín. 30% por matéria
          </span>
        </div>

        {quizAttempts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Nenhum simulado registrado ainda. Faça seu primeiro simulado para ver os gráficos de evolução aqui!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {quizAttempts.map((sim, sIdx) => {
              const totalPct = Math.round((sim.total_score / sim.total_questions) * 100);
              return (
                <div key={sim.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Simulado #{quizAttempts.length - sIdx} ({is6Ano ? '6º Ano' : '7º Ano'})
                      </span>
                      <span className="text-xs text-slate-400">
                        • {new Date(sim.started_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-blue-900 font-semibold">
                        <BookOpen className="w-3.5 h-3.5" /> Português: {sim.score_portuguese} pts
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-red-800 font-semibold">
                        <Calculator className="w-3.5 h-3.5" /> Matemática: {sim.score_math} pts
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {sim.total_score} / {sim.total_questions}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        {totalPct}% de acerto
                      </span>
                    </div>

                    {sim.passed_rule_30percent ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Ponto de Corte Superado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Abaixo do Corte (Art. 25)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
