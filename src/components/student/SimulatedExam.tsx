import React, { useState, useEffect } from 'react';
import { UserProfile, Question, QuizAttempt } from '../../types';
import { OFFICIAL_QUESTIONS } from '../../data/questionsData';
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  BookOpen,
  Calculator,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldAlert,
  XCircle,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/databaseEngine';

interface SimulatedExamProps {
  currentUser: UserProfile;
  onBack: () => void;
  onFinishExam?: (attempt: QuizAttempt) => void;
}

export const SimulatedExam: React.FC<SimulatedExamProps> = ({
  currentUser,
  onBack,
  onFinishExam,
}) => {
  const is6Ano = currentUser.grade === '6_ano';
  const totalQuestions = 60; // Total oficial exigido: 60 questões (30 Português + 30 Matemática)
  const portugueseCount = 30;
  const mathCount = 30;
  const minRequiredPerSubject = 9; // 30% de 30 questões conforme Art. 25 do Edital CMT XVII

  // Função geradora de todas as 60 questões oficiais do edital
  const buildExamQuestions = (): Question[] => {
    const portQuestions = OFFICIAL_QUESTIONS.filter(
      (q) => (q.grade_id === currentUser.grade || q.grade_id === '6_ano') && q.subject_id === 'portugues'
    );
    const mathQuestions = OFFICIAL_QUESTIONS.filter(
      (q) => (q.grade_id === currentUser.grade || q.grade_id === '6_ano') && q.subject_id === 'matematica'
    );

    const list: Question[] = [];
    // 30 questões de Língua Portuguesa (1 a 30)
    for (let i = 0; i < portugueseCount; i++) {
      const q = portQuestions[i % portQuestions.length];
      list.push({ ...q, id: q.id });
    }
    // 30 questões de Matemática (31 a 60)
    for (let i = 0; i < mathCount; i++) {
      const q = mathQuestions[i % mathQuestions.length];
      list.push({ ...q, id: q.id });
    }
    return list;
  };

  const [examQuestions, setExamQuestions] = useState<Question[]>(buildExamQuestions);

  const handleRestartExam = () => {
    setExamQuestions(buildExamQuestions());
    setCurrentIndex(0);
    setSelectedAnswers({});
    setFlaggedForReview({});
    setSecondsRemaining(4 * 3600);
    setIsFinished(false);
    setResultAttempt(null);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [flaggedForReview, setFlaggedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(4 * 3600); // 4 horas do edital
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<QuizAttempt | null>(null);

  // Estados da revisão comentada e explicações pedagógicas
  const [reviewFilter, setReviewFilter] = useState<'todos' | 'erros' | 'acertos'>('todos');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<number, boolean>>({});

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isFinished) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: letter }));
  };

  const toggleFlag = (index: number) => {
    setFlaggedForReview((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  const handleFinishExam = async () => {
    setShowConfirmModal(false);
    setIsFinished(true);

    let scorePort = 0;
    let scoreMath = 0;

    examQuestions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const isCorrect = selected === q.correct_option;
      if (isCorrect) {
        if (idx < portugueseCount) scorePort++;
        else scoreMath++;
      }
    });

    const totalScore = scorePort + scoreMath;
    const timeSpent = 4 * 3600 - secondsRemaining;

    const answersData = examQuestions.map((q, idx) => ({
      question_id: q.id,
      selected_option: selectedAnswers[idx],
      is_correct: selectedAnswers[idx] === q.correct_option,
      flagged_for_review: flaggedForReview[idx] || false,
    }));

    const attempt = await db.recordQuizAttempt(
      currentUser.id,
      `simulado-oficial-${currentUser.grade}`,
      'simulado',
      scorePort,
      scoreMath,
      totalQuestions,
      answersData,
      timeSpent
    );

    setResultAttempt(attempt);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#1e3a8a', '#dc2626'],
    });

    if (onFinishExam) onFinishExam(attempt);
  };

  const currentQ = examQuestions[currentIndex];

  // ==============================================================
  // TELA DE RESULTADO DO SIMULADO
  // ==============================================================
  if (isFinished && resultAttempt) {
    const portPercent = Math.round((resultAttempt.score_portuguese / portugueseCount) * 100);
    const mathPercent = Math.round((resultAttempt.score_math / mathCount) * 100);
    const totalPercent = Math.round((resultAttempt.total_score / totalQuestions) * 100);

    const passedPort30 = resultAttempt.score_portuguese >= minRequiredPerSubject;
    const passedMath30 = resultAttempt.score_math >= minRequiredPerSubject;
    const isApprovedRule = passedPort30 && passedMath30;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-extrabold rounded-full">
              Simulado Oficial Concluído — {is6Ano ? '6º Ano' : '7º Ano'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Desempenho Geral no Simulado
            </h1>
            <p className="text-xs text-slate-500">
              Tempo utilizado: {Math.floor(resultAttempt.time_spent_seconds / 60)} minutos
            </p>
          </div>

          {/* Scores banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Pontuação Total</span>
              <p className="text-3xl font-extrabold text-blue-950 mt-1">
                {resultAttempt.total_score} <span className="text-sm text-slate-400">/ {totalQuestions}</span>
              </p>
              <span className="text-xs font-bold text-blue-700 mt-1 block">
                {totalPercent}% de aproveitamento
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-900 uppercase">Língua Portuguesa</span>
              <p className="text-3xl font-extrabold text-blue-900 mt-1">
                {resultAttempt.score_portuguese} <span className="text-sm text-blue-400">/ {portugueseCount}</span>
              </p>
              <span className="text-xs font-bold text-blue-700 mt-1 block">
                {portPercent}% de acerto
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-center">
              <span className="text-xs font-bold text-red-900 uppercase">Matemática</span>
              <p className="text-3xl font-extrabold text-red-900 mt-1">
                {resultAttempt.score_math} <span className="text-sm text-red-400">/ {mathCount}</span>
              </p>
              <span className="text-xs font-bold text-red-700 mt-1 block">
                {mathPercent}% de acerto
              </span>
            </div>
          </div>

          {/* 30% Cutoff Rule Analysis (Art. 25 do Edital) */}
          <div
            className={`p-5 rounded-2xl border ${
              isApprovedRule ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {isApprovedRule ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {isApprovedRule
                    ? 'Excelente! Você superou o Ponto de Corte do Edital (Art. 25)'
                    : 'Atenção aos Pontos de Corte do Edital (Art. 25)'}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Conforme o Artigo 25 do Edital nº 001/26, o candidato que não acertar pelo menos 30% de cada componente
                  curricular (mínimo de {minRequiredPerSubject} acertos em Português e {minRequiredPerSubject} em Matemática)
                  é considerado desclassificado.
                </p>
                <div className="pt-1 flex flex-wrap gap-3 text-xs font-bold">
                  <span className={passedPort30 ? 'text-emerald-700' : 'text-red-700'}>
                    Português: {resultAttempt.score_portuguese}/{minRequiredPerSubject} ({passedPort30 ? 'Apto' : 'Abaixo do corte'})
                  </span>
                  <span>•</span>
                  <span className={passedMath30 ? 'text-emerald-700' : 'text-red-700'}>
                    Matemática: {resultAttempt.score_math}/{minRequiredPerSubject} ({passedMath30 ? 'Apto' : 'Abaixo do corte'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* GABARITO COMENTADO & CORREÇÃO PEDAGÓGICA QUESTÃO POR QUESTÃO  */}
          {/* ============================================================== */}
          <div className="space-y-6 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Gabarito Comentado & Correção Pedagógica
                </h3>
                <p className="text-xs text-slate-600">
                  Veja a explicação detalhada de cada questão. Se errou, entenda o motivo do erro para aprender e fixar o conteúdo do Edital!
                </p>
              </div>

              {/* Filtro: Todas / Erros / Acertos */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
                <button
                  type="button"
                  onClick={() => setReviewFilter('todos')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    reviewFilter === 'todos'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({totalQuestions})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('erros')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    reviewFilter === 'erros'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  <span>Erros</span>
                  <span className="px-1.5 py-0.2 bg-red-100 text-red-900 rounded-full text-[10px]">
                    {totalQuestions - resultAttempt.total_score}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('acertos')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    reviewFilter === 'acertos'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span>Acertos</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded-full text-[10px]">
                    {resultAttempt.total_score}
                  </span>
                </button>
              </div>
            </div>

            {/* Lista das questões com gabarito e explicação */}
            <div className="space-y-4">
              {examQuestions.map((q, idx) => {
                const userSelected = selectedAnswers[idx];
                const isCorrect = userSelected === q.correct_option;
                const isSkipped = !userSelected;

                if (reviewFilter === 'erros' && isCorrect) return null;
                if (reviewFilter === 'acertos' && (!isCorrect || isSkipped)) return null;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                      isCorrect
                        ? 'bg-white border-emerald-300 shadow-xs'
                        : isSkipped
                        ? 'bg-amber-50/50 border-amber-300'
                        : 'bg-white border-red-300 shadow-xs'
                    }`}
                  >
                    {/* Header da questão */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px]">
                          Questão {idx + 1}
                        </span>
                        <span className="text-slate-500">•</span>
                        {idx < portugueseCount ? (
                          <span className="text-blue-900 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" /> Língua Portuguesa
                          </span>
                        ) : (
                          <span className="text-red-900 flex items-center gap-1">
                            <Calculator className="w-3.5 h-3.5" /> Matemática
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Você Acertou!
                          </span>
                        ) : isSkipped ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Em Branco
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-900 rounded-full text-xs font-black border border-red-300">
                            <XCircle className="w-4 h-4 text-red-600" />
                            Você Errou
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Enunciado */}
                    <p className="text-sm sm:text-base font-bold text-slate-900 mb-4 leading-relaxed">
                      {q.statement}
                    </p>

                    {/* Alternativas */}
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt) => {
                        const isCorrectOpt = opt.letter === q.correct_option;
                        const isChosen = userSelected === opt.letter;

                        let optBg = 'bg-slate-50/70 border-slate-200 text-slate-700';
                        if (isCorrectOpt) {
                          optBg = 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400 font-semibold';
                        } else if (isChosen && !isCorrectOpt) {
                          optBg = 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-400 font-semibold';
                        }

                        return (
                          <div
                            key={opt.letter}
                            className={`p-3 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${optBg}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                                isCorrectOpt
                                  ? 'bg-emerald-600 text-white'
                                  : isChosen
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {opt.letter}
                            </span>
                            <span className="flex-1 pt-0.5">{opt.text}</span>
                            {isCorrectOpt && (
                              <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                Gabarito Oficial
                              </span>
                            )}
                            {isChosen && !isCorrectOpt && (
                              <span className="text-[11px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                                Sua Resposta
                              </span>
                            )}
                            {isChosen && isCorrectOpt && (
                              <span className="text-[11px] font-black text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                                Sua Resposta Correta
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explicação Pedagógica para o aluno aprender */}
                    <div className="space-y-3 pt-2">
                      {!isCorrect && userSelected && q.why_incorrect_notes && q.why_incorrect_notes[userSelected] && (
                        <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-950 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-red-900">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Por que a alternativa {userSelected} que você marcou está incorreta:</span>
                          </p>
                          <p className="leading-relaxed pl-5 text-red-800">
                            {q.why_incorrect_notes[userSelected]}
                          </p>
                        </div>
                      )}

                      {/* Por que o gabarito é o correto */}
                      <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5 text-blue-900">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Explicação da resposta correta (Alternativa {q.correct_option}):</span>
                        </p>
                        <p className="leading-relaxed pl-5 text-slate-800">
                          {q.why_correct || q.detailed_explanation}
                        </p>
                      </div>

                      {/* Resolução Passo a Passo */}
                      {q.step_by_step_solution && (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                          <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-blue-700" />
                            <span>Resolução Passo a Passo:</span>
                          </p>
                          <p className="leading-relaxed pl-5 text-slate-600 font-mono text-[11px]">
                            {q.step_by_step_solution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal Institutional Disclaimer Required by Prompt */}
          <div className="p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-500 border border-slate-200">
            <strong>Aviso Institucional Obrigatório:</strong> Esta simulação é uma ferramenta pedagógica de apoio aos
            estudos da plataforma preparatória e não substitui ou assegura classificação no Processo Seletivo Oficial do
            Colégio Militar Tiradentes XVII — Unidade Balsas / PMMA.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Voltar ao Início
            </button>
            <button
              onClick={handleRestartExam}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Fazer Outro Simulado (60 Questões)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // TELA DE EXECUÇÃO DO SIMULADO CRONOMETRADO (60 QUESTÕES)
  // ==============================================================
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Exam Header with Timer & Submit */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            SIMULADO OFICIAL • EDITAL Nº 001/26 CMT XVII
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <span>Simulado 6º Ano (60 Questões)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/40">
              30 Port + 30 Mat
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer display */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-amber-400 font-mono font-bold text-base shadow-inner">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Finish button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102 cursor-pointer"
          >
            Entregar Simulado
          </button>
        </div>
      </div>

      {/* Banner Informativo do Simulado de 60 Questões */}
      <div className="bg-gradient-to-r from-amber-500/10 via-blue-900/10 to-amber-500/10 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-800 bg-white shadow-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span>
            <strong>Simulado Completo de 60 Questões:</strong> 30 de Língua Portuguesa (1 a 30) e 30 de Matemática (31 a 60). Regra do Edital (Art. 25): mínimo de 30% em cada disciplina (9 acertos em Português e 9 em Matemática). Ao entregar, veja a explicação detalhada de cada erro para aprender!
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
          60 Questões Comentadas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Questions Grid & Stats (Dividido em Português e Matemática) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
            <span>Todas as Questões</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px]">
              {answeredCount}/{totalQuestions}
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1 space-y-4">
            {/* Bloco 1: Língua Portuguesa (1 a 30) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-black text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Português (1 a 30)</span>
                </span>
                <span className="text-[10px] text-blue-700 font-bold">
                  {Object.keys(selectedAnswers).filter((k) => Number(k) < 30).length}/30
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 p-1">
                {examQuestions.slice(0, 30).map((_, idx) => {
                  const isAnswered = Boolean(selectedAnswers[idx]);
                  const isFlagged = Boolean(flaggedForReview[idx]);
                  const isCurrent = currentIndex === idx;

                  let style = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                  if (isCurrent) {
                    style = 'bg-blue-900 text-white font-extrabold ring-2 ring-blue-500';
                  } else if (isFlagged) {
                    style = 'bg-amber-100 text-amber-900 border border-amber-400 font-bold';
                  } else if (isAnswered) {
                    style = 'bg-emerald-100 text-emerald-900 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors relative cursor-pointer ${style}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco 2: Matemática (31 a 60) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-black text-red-900 bg-red-50/80 px-2.5 py-1 rounded-lg border border-red-200">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Matemática (31 a 60)</span>
                </span>
                <span className="text-[10px] text-red-700 font-bold">
                  {Object.keys(selectedAnswers).filter((k) => Number(k) >= 30).length}/30
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 p-1">
                {examQuestions.slice(30, 60).map((_, i) => {
                  const idx = i + 30;
                  const isAnswered = Boolean(selectedAnswers[idx]);
                  const isFlagged = Boolean(flaggedForReview[idx]);
                  const isCurrent = currentIndex === idx;

                  let style = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                  if (isCurrent) {
                    style = 'bg-blue-900 text-white font-extrabold ring-2 ring-blue-500';
                  } else if (isFlagged) {
                    style = 'bg-amber-100 text-amber-900 border border-amber-400 font-bold';
                  } else if (isAnswered) {
                    style = 'bg-emerald-100 text-emerald-900 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors relative cursor-pointer ${style}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" />
              <span>Respondida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400" />
              <span>Marcar para Revisar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-900" />
              <span>Questão Atual</span>
            </div>
          </div>
        </div>

        {/* Right Column: Question Statement and Options */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-800">
                  Questão {currentIndex + 1} de {totalQuestions}
                </span>
                <span>•</span>
                {currentIndex < portugueseCount ? (
                  <span className="text-blue-900 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Língua Portuguesa
                  </span>
                ) : (
                  <span className="text-red-800 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" /> Matemática
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleFlag(currentIndex)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  flaggedForReview[currentIndex]
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedForReview[currentIndex] ? 'Marcada p/ Revisar' : 'Revisar depois'}</span>
              </button>
            </div>

            {/* Statement */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.statement}
            </div>

            {/* 5 Alternatives A to E */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswers[currentIndex] === opt.letter;
                return (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelectOption(opt.letter)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold ${
                        isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.letter}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-slate-800 pt-1 leading-snug">
                      {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <span>Próxima</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <span>Finalizar Simulado</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before Final Delivery */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Entregar Folha de Respostas?</h3>
                <p className="text-xs text-slate-500">
                  Você respondeu {answeredCount} de {totalQuestions} questões.
                </p>
              </div>
            </div>

            {answeredCount < totalQuestions && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Atenção: restam <strong>{totalQuestions - answeredCount} questões em branco</strong>. No
                edital oficial do CMT XVII, questões em branco não pontuam.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Continuar Fazendo
              </button>
              <button
                onClick={handleFinishExam}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Sim, Entregar Prova
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
