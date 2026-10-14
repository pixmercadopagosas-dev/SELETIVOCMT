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
  const totalQuestions = is6Ano ? 30 : 40;
  const portugueseCount = is6Ano ? 15 : 20;
  const mathCount = is6Ano ? 15 : 20;
  const minRequiredPerSubject = is6Ano ? 5 : 6; // 30% regra do edital Art. 25

  // Generate question list repeating/cycling official curriculum questions to form the exact 30 or 40 questions of the official exam
  const [examQuestions] = useState<Question[]>(() => {
    const portQuestions = OFFICIAL_QUESTIONS.filter(
      (q) => q.grade_id === currentUser.grade && q.subject_id === 'portugues'
    );
    const mathQuestions = OFFICIAL_QUESTIONS.filter(
      (q) => q.grade_id === currentUser.grade && q.subject_id === 'matematica'
    );

    const list: Question[] = [];
    // Portuguese part
    for (let i = 0; i < portugueseCount; i++) {
      const q = portQuestions[i % portQuestions.length];
      list.push({ ...q, id: `exam-port-${i + 1}` });
    }
    // Math part
    for (let i = 0; i < mathCount; i++) {
      const q = mathQuestions[i % mathQuestions.length];
      list.push({ ...q, id: `exam-mat-${i + 1}` });
    }
    return list;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [flaggedForReview, setFlaggedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(4 * 3600); // 4 horas do edital
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<QuizAttempt | null>(null);

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
              onClick={() => {
                setIsFinished(false);
                setSelectedAnswers({});
                setFlaggedForReview({});
                setSecondsRemaining(4 * 3600);
                setCurrentIndex(0);
              }}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Fazer Outro Simulado
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // TELA DE EXECUÇÃO DO SIMULADO CRONOMETRADO
  // ==============================================================
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Exam Header with Timer & Submit */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            SIMULADO OFICIAL • EDITAL Nº 001/26 CMT XVII
          </span>
          <h2 className="text-base font-extrabold text-white">
            {is6Ano ? 'Simulado 6º Ano (30 Questões)' : 'Simulado 7º Ano (40 Questões)'}
          </h2>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-amber-400 font-mono font-bold text-base shadow-inner">
          <Clock className="w-5 h-5 text-amber-400" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>

        {/* Finish button */}
        <button
          onClick={() => setShowConfirmModal(true)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102"
        >
          Entregar Simulado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Questions Grid & Stats */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Questões</span>
            <span>
              {answeredCount}/{totalQuestions} Respondidas
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 max-h-[360px] overflow-y-auto p-1">
            {examQuestions.map((_, idx) => {
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
                  className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors relative ${style}`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
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
