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
  Users,
  UserCheck,
  Search,
  Filter,
  Phone,
  Shield,
  RefreshCw,
  Printer,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface PerformanceReportProps {
  currentUser: UserProfile;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({ currentUser }) => {
  const isSuperUser = currentUser.role === 'superusuario';

  // Lista de estudantes cadastrados (para o Superusuário)
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Dados do aluno selecionado
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);

  // Dados agregados de todos os alunos (para visão de turma)
  const [allQuizzes, setAllQuizzes] = useState<QuizAttempt[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionAttempt[]>([]);
  const [allLessons, setAllLessons] = useState<LessonProgress[]>([]);

  useEffect(() => {
    loadInitialData();
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedStudentId === 'all') {
      loadClassOverview();
    } else {
      loadStudentStats(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (isSuperUser) {
        const profiles = await db.getAllProfiles();
        const studentProfiles = profiles.filter(
          (p) => p.role !== 'superusuario' && p.username?.toLowerCase() !== 'diretoria_cmt'
        );
        setStudents(studentProfiles);

        const quizzes = await db.getAllQuizAttempts();
        const questions = await db.getAllQuestionAttempts();
        const lessons = await db.getAllLessonsProgress();
        setAllQuizzes(quizzes);
        setAllQuestions(questions);
        setAllLessons(lessons);

        // Se o superusuário estiver visualizando a turma, mantemos 'all'
        // Se houver alunos e ele preferir o primeiro, pode selecionar
      } else {
        await loadStudentStats(currentUser.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadClassOverview = async () => {
    const quizzes = await db.getAllQuizAttempts();
    const questions = await db.getAllQuestionAttempts();
    const lessons = await db.getAllLessonsProgress();
    setAllQuizzes(quizzes);
    setAllQuestions(questions);
    setAllLessons(lessons);
  };

  const loadStudentStats = async (studentId: string) => {
    const targetId = studentId || currentUser.id;
    const qAtt = await db.getUserQuizAttempts(targetId);
    const lProg = await db.getAllUserProgress(targetId);
    const qAttempts = await db.getUserQuestionAttempts(targetId);
    setQuizAttempts(qAtt);
    setLessonProgress(lProg);
    setQuestionAttempts(qAttempts);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadInitialData();
    if (selectedStudentId !== 'all') {
      await loadStudentStats(selectedStudentId);
    } else {
      await loadClassOverview();
    }
    setLoading(false);
  };

  // Identifica o aluno ativo selecionado
  const activeStudentProfile = isSuperUser
    ? students.find((s) => s.id === selectedStudentId || s.username === selectedStudentId) ||
      students.find((s) => selectedStudentId.toLowerCase().includes('laura') && s.username?.toLowerCase().includes('laura')) ||
      students.find((s) => selectedStudentId.toLowerCase().includes('bruna') && s.username?.toLowerCase().includes('bruna')) ||
      (students.length > 0 && selectedStudentId !== 'all' ? students[0] : null)
    : currentUser;

  const currentGrade = activeStudentProfile?.grade || currentUser.grade || '6_ano';
  const is6Ano = currentGrade === '6_ano';

  // Estatísticas individuais
  const completedLessonsCount = lessonProgress.filter((l) => l.completed).length;
  const correctQuestionsCount = questionAttempts.filter((q) => q.is_correct).length;
  const totalExercisesCount = questionAttempts.length;
  const exerciseAccuracy =
    totalExercisesCount > 0 ? Math.round((correctQuestionsCount / totalExercisesCount) * 100) : 100;

  // Estatísticas por disciplina (do aluno ativo)
  const portugueseQuizzes = quizAttempts.map((q) => q.score_portuguese);
  const mathQuizzes = quizAttempts.map((q) => q.score_math);
  const avgPort =
    portugueseQuizzes.length > 0
      ? (portugueseQuizzes.reduce((a, b) => a + b, 0) / portugueseQuizzes.length).toFixed(1)
      : '0.0';
  const avgMath =
    mathQuizzes.length > 0
      ? (mathQuizzes.reduce((a, b) => a + b, 0) / mathQuizzes.length).toFixed(1)
      : '0.0';

  // Estatísticas agregadas da Turma (para o Superusuário)
  const totalStudentsCount = students.length;
  const totalClassQuizzesCount = allQuizzes.length;
  const passedCutoffClassCount = allQuizzes.filter((q) => q.passed_rule_30percent).length;
  const classCutoffPassRate =
    totalClassQuizzesCount > 0
      ? Math.round((passedCutoffClassCount / totalClassQuizzesCount) * 100)
      : 100;

  const totalClassExercises = allQuestions.length;
  const totalClassCorrectExercises = allQuestions.filter((q) => q.is_correct).length;
  const classExerciseAccuracy =
    totalClassExercises > 0
      ? Math.round((totalClassCorrectExercises / totalClassExercises) * 100)
      : 100;

  // Filtragem da lista de alunos
  const filteredStudents = students.filter((s) => {
    const q = searchStudentTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      s.guardian_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Barra de Título Superior */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <span>
              {isSuperUser ? 'Coordenação Geral Pedagógica • CMT XVII Balsas' : 'Relatório Pedagógico Individual • CMT XVII'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {isSuperUser ? 'Desempenho e Rendimento dos Alunos' : 'Meu Desempenho e Evolução'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperUser
              ? 'Acompanhe as notas nos simulados oficiais, corte de 30% por disciplina (Art. 25) e progresso de cada candidato.'
              : 'Acompanhamento contínuo de acertos, simulados concluídos e evolução nos conteúdos do edital.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Recarregar dados do banco"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Imprimir relatório"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          {!isSuperUser && (
            <>
              <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900 text-xs font-bold flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                <span>{currentUser.total_stars} Estrelas</span>
              </div>
              <div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-900 text-xs font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>{currentUser.study_streak_days} Dias Seguidos</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SELETOR DE ESTUDANTES EXCLUSIVO DO SUPERUSUÁRIO */}
      {isSuperUser && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400 text-slate-900 rounded-xl font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                  Filtro Pedagógico do Superusuário
                </span>
                <p className="text-sm font-bold text-white">
                  Selecione o estudante para visualizar o relatório detalhado
                </p>
              </div>
            </div>

            {/* Quick Switch Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedStudentId('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedStudentId === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                📊 Visão Geral da Turma ({students.length})
              </button>

              {students.map((std) => (
                <button
                  key={std.id}
                  onClick={() => setSelectedStudentId(std.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStudentId === std.id || selectedStudentId === std.username
                      ? 'bg-blue-600 text-white shadow-md border border-blue-400 scale-102'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{std.full_name || std.username}</span>
                  <span className="text-[10px] opacity-75">(@{std.username})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CASO 1: VISÃO GERAL DA TURMA (SUPERUSUÁRIO - "all") */}
      {isSuperUser && selectedStudentId === 'all' && (
        <div className="space-y-6">
          {/* KPI Cards da Turma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">Estudantes Matriculados</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-blue-950 mt-1">
                {totalStudentsCount}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Candidatos reais no sistema
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">Simulados Realizados</span>
                <Clock className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalClassQuizzesCount}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Provas oficiais computadas
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">Aproveitamento em Questões</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {classExerciseAccuracy}%
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                {totalClassCorrectExercises} acertos de {totalClassExercises} questões
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">Superação do Ponto de Corte</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {classCutoffPassRate}%
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                {passedCutoffClassCount} de {totalClassQuizzesCount} provas acima de 30%
              </span>
            </div>
          </div>

          {/* TABELA COMPARATIVA DOS ESTUDANTES */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Quadro Geral de Rendimento dos Alunos
                </h2>
                <p className="text-xs text-slate-500">
                  Clique em &quot;Ver Dossiê&quot; para inspecionar os acertos detalhados de cada candidato
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchStudentTerm}
                  onChange={(e) => setSearchStudentTerm(e.target.value)}
                  placeholder="Buscar estudante..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum estudante encontrado com o termo pesquisado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4">Estudante</th>
                      <th className="py-3 px-3">Série</th>
                      <th className="py-3 px-3">Simulados</th>
                      <th className="py-3 px-3">Melhor Nota</th>
                      <th className="py-3 px-3">Regra de Corte (Art. 25)</th>
                      <th className="py-3 px-3">Estrelas / Pts</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.map((std) => {
                      const studentQuizzes = allQuizzes.filter(
                        (q) =>
                          q.user_id === std.id ||
                          (std.username && q.user_id?.toLowerCase() === std.username.toLowerCase())
                      );

                      const bestQuiz = studentQuizzes.reduce(
                        (best, current) => (current.total_score > (best?.total_score || 0) ? current : best),
                        null as QuizAttempt | null
                      );

                      const allPassed =
                        studentQuizzes.length > 0 &&
                        studentQuizzes.every((q) => q.passed_rule_30percent);

                      return (
                        <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 text-blue-900 font-bold flex items-center justify-center text-sm shrink-0">
                                {std.full_name ? std.full_name.charAt(0).toUpperCase() : 'E'}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">
                                  {std.full_name || std.username}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  @{std.username} • {std.guardian_phone || 'Sem fone'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]">
                              {std.grade === '7_ano' ? '7º Ano' : '6º Ano'}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-slate-900">
                            {studentQuizzes.length} realizados
                          </td>

                          <td className="py-3.5 px-3">
                            {bestQuiz ? (
                              <div>
                                <span className="font-extrabold text-blue-950">
                                  {bestQuiz.total_score} / {bestQuiz.total_questions}
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  {Math.round((bestQuiz.total_score / bestQuiz.total_questions) * 100)}% acertos
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Pendente</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            {studentQuizzes.length === 0 ? (
                              <span className="text-slate-400 text-[11px]">Sem simulado</span>
                            ) : allPassed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Aprovado no Corte
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                Abaixo de 30%
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{std.total_stars}</span>
                              <span className="text-slate-400 text-[10px]">({std.total_points} pts)</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedStudentId(std.id)}
                              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                            >
                              <span>Ver Dossiê</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CASO 2: RELATÓRIO INDIVIDUAL DO ESTUDANTE SELECIONADO (OU ESTUDANTE LOGADO) */}
      {(!isSuperUser || selectedStudentId !== 'all') && (
        <div className="space-y-6">
          {/* Card de Identificação do Candidato Selecionado */}
          {activeStudentProfile && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
                    {activeStudentProfile.full_name
                      ? activeStudentProfile.full_name.charAt(0).toUpperCase()
                      : 'E'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-extrabold uppercase">
                        {is6Ano ? 'Candidato 6º Ano' : 'Candidato 7º Ano'}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold">
                        Matrícula Aprovada
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {activeStudentProfile.full_name}
                    </h2>
                    <p className="text-xs text-blue-200">
                      Usuário: <strong>@{activeStudentProfile.username}</strong> • E-mail:{' '}
                      {activeStudentProfile.email || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">
                      Responsável Legal
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {activeStudentProfile.guardian_name || 'Responsável'}
                    </span>
                  </div>

                  {activeStudentProfile.guardian_phone && (
                    <a
                      href={`tel:${activeStudentProfile.guardian_phone.replace(/\D/g, '')}`}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{activeStudentProfile.guardian_phone}</span>
                    </a>
                  )}

                  {isSuperUser && (
                    <button
                      onClick={() => setSelectedStudentId('all')}
                      className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Voltar à Turma
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards Individuais */}
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

          {/* Gráfico / Barras de Rendimento por Disciplina */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  <span>Língua Portuguesa (Edital CMT)</span>
                </div>
                <span className="text-xs font-bold text-slate-700">Média: {avgPort} pts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-700 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((Number(avgPort) / (is6Ano ? 15 : 20)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Corte Mínimo: {is6Ano ? '5 acertos (30%)' : '6 acertos (30%)'}</span>
                <span className="font-bold text-blue-900">
                  {Math.round((Number(avgPort) / (is6Ano ? 15 : 20)) * 100)}% de aproveitamento
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-900 font-extrabold text-sm">
                  <Calculator className="w-4 h-4 text-red-700" />
                  <span>Matemática (Edital CMT)</span>
                </div>
                <span className="text-xs font-bold text-slate-700">Média: {avgMath} pts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-red-700 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((Number(avgMath) / (is6Ano ? 15 : 20)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Corte Mínimo: {is6Ano ? '5 acertos (30%)' : '6 acertos (30%)'}</span>
                <span className="font-bold text-red-900">
                  {Math.round((Number(avgMath) / (is6Ano ? 15 : 20)) * 100)}% de aproveitamento
                </span>
              </div>
            </div>
          </div>

          {/* Histórico de Simulados Realizados */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Histórico de Simulados Realizados
                </h2>
                <p className="text-xs text-slate-500">
                  Critério de eliminação oficial: Rendimento inferior a 30% em qualquer uma das disciplinas (Art. 25 do Edital)
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold">
                {quizAttempts.length} prova(s)
              </span>
            </div>

            {quizAttempts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Nenhum simulado registrado para este candidato ainda.
                </p>
                <p className="text-[11px] text-slate-400">
                  Quando o aluno realizar os simulados cronometrados, suas notas e gráficos aparecerão aqui de imediato.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {quizAttempts.map((sim, sIdx) => {
                  const totalPct = Math.round((sim.total_score / sim.total_questions) * 100);
                  const minutesSpent = Math.round(sim.time_spent_seconds / 60);

                  return (
                    <div
                      key={sim.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Simulado #{quizAttempts.length - sIdx} ({is6Ano ? '6º Ano' : '7º Ano'})
                          </span>
                          <span className="text-xs text-slate-400">
                            • {new Date(sim.started_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(sim.started_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold">
                            {minutesSpent} min de prova
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 text-blue-900 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                            Português: {sim.score_portuguese} / {is6Ano ? 15 : 20} pts
                          </span>
                          <span className="flex items-center gap-1.5 text-red-900 font-bold bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                            <Calculator className="w-3.5 h-3.5 text-red-700" />
                            Matemática: {sim.score_math} / {is6Ano ? 15 : 20} pts
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-base font-extrabold text-slate-900">
                            {sim.total_score} / {sim.total_questions}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {totalPct}% de acerto geral
                          </span>
                        </div>

                        {sim.passed_rule_30percent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ponto de Corte Superado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold shadow-2xs">
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
      )}
    </div>
  );
};
