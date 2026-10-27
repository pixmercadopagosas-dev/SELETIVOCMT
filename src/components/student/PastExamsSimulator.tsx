import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../../types';
import { PAST_EXAMS_QUESTIONS, PastExamQuestion } from '../../data/pastExamsData';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Youtube,
  ExternalLink,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Download,
  BookOpen,
  Calculator,
  ShieldCheck,
  Clock,
  Filter,
  Check,
  Maximize2,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/databaseEngine';

interface PastExamsSimulatorProps {
  currentUser: UserProfile;
  onNavigateHome?: () => void;
}

type FilterYear = 'all' | 2016 | 2018;
type FilterSubject = 'all' | 'portugues' | 'matematica';

export const PastExamsSimulator: React.FC<PastExamsSimulatorProps> = ({
  currentUser,
  onNavigateHome,
}) => {
  // Filtros
  const [selectedYear, setSelectedYear] = useState<FilterYear>('all');
  const [selectedSubject, setSelectedSubject] = useState<FilterSubject>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estados de resposta
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>(() => {
    try {
      const saved = localStorage.getItem(`cmt_past_exam_answers_${currentUser.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`cmt_past_exam_revealed_${currentUser.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showTip, setShowTip] = useState(false);
  const [showVideoEmbed, setShowVideoEmbed] = useState(false);
  const [activeTabMode, setActiveTabMode] = useState<'study' | 'summary'>('study');

  // Filtragem das questões
  const filteredQuestions = useMemo(() => {
    return PAST_EXAMS_QUESTIONS.filter((q) => {
      const matchYear = selectedYear === 'all' || q.examYear === selectedYear;
      const matchSubject = selectedSubject === 'all' || q.subject === selectedSubject;
      return matchYear && matchSubject;
    });
  }, [selectedYear, selectedSubject]);

  // Garante que o índice não estoure se os filtros mudarem
  useEffect(() => {
    setCurrentIndex(0);
    setShowTip(false);
    setShowVideoEmbed(false);
  }, [selectedYear, selectedSubject]);

  const currentQuestion: PastExamQuestion | undefined = filteredQuestions[currentIndex];

  // Estatísticas do Estudante
  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    let wrong = 0;

    PAST_EXAMS_QUESTIONS.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans) {
        answered++;
        if (ans === q.correctAnswer) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return { answered, correct, wrong, accuracy, total: PAST_EXAMS_QUESTIONS.length };
  }, [userAnswers]);

  // Salvar no localStorage
  const saveAnswersToStorage = (updatedAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>, updatedRevealed: Record<string, boolean>) => {
    try {
      localStorage.setItem(`cmt_past_exam_answers_${currentUser.id}`, JSON.stringify(updatedAnswers));
      localStorage.setItem(`cmt_past_exam_revealed_${currentUser.id}`, JSON.stringify(updatedRevealed));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  };

  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!currentQuestion) return;
    if (revealedExplanations[currentQuestion.id]) return; // Já confirmou

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: letter,
    }));
  };

  const handleConfirmAnswer = async () => {
    if (!currentQuestion) return;
    const selected = userAnswers[currentQuestion.id];
    if (!selected) return;

    const isCorrect = selected === currentQuestion.correctAnswer;

    // Atualiza estado revelado
    const updatedRevealed = {
      ...revealedExplanations,
      [currentQuestion.id]: true,
    };
    setRevealedExplanations(updatedRevealed);
    saveAnswersToStorage(userAnswers, updatedRevealed);

    if (isCorrect) {
      // Disparar confetes festivos
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });

      // Grava a tentativa e pontuação no banco de dados
      try {
        await db.recordQuestionAttempt(currentUser.id, currentQuestion.id, selected, isCorrect);
      } catch {}
    } else {
      // Abre automaticamente a videoaula do YouTube para apoiar o estudante
      setShowVideoEmbed(true);
    }
  };

  const handleResetQuestion = () => {
    if (!currentQuestion) return;
    const newAnswers = { ...userAnswers };
    delete newAnswers[currentQuestion.id];
    const newRevealed = { ...revealedExplanations };
    delete newRevealed[currentQuestion.id];

    setUserAnswers(newAnswers);
    setRevealedExplanations(newRevealed);
    setShowTip(false);
    setShowVideoEmbed(false);
    saveAnswersToStorage(newAnswers, newRevealed);
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowTip(false);
      setShowVideoEmbed(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowTip(false);
      setShowVideoEmbed(false);
    }
  };

  const isCurrentRevealed = currentQuestion ? !!revealedExplanations[currentQuestion.id] : false;
  const currentSelectedAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;
  const isCurrentCorrect = currentQuestion && currentSelectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* BANNER INSTITUCIONAL DE APRESENTAÇÃO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border-2 border-amber-500/40 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black tracking-wider uppercase border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Provas Reais Anteriores • Seletivo CMT XVII
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Simulado Baseado em Provas Anteriores</span>
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pratique com questões 100% autênticas das provas e gabaritos oficiais do Colégio Militar Tiradentes.
              Receba <strong>dicas estratégicas</strong>, <strong>parabéns imediato</strong> nos acertos, <strong>explicação pedagógica</strong> nos erros e <strong>videoaulas completas do YouTube</strong> para fixar o assunto na sua cabeça!
            </p>
          </div>

          {/* Avatar Instrutor Osaias Card */}
          <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3.5 flex items-center gap-3 shrink-0 shadow-lg">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 shadow-md">
              <img
                src="/assets/aistudio/1792634685275_25b5af36.jpg"
                alt="Instrutor Osaias"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Tutor das Provas
              </span>
              <p className="text-xs font-black text-white">Instrutor Osaias</p>
              <span className="text-[10px] text-slate-300 block">
                60 Questões Reais Cadastradas
              </span>
            </div>
          </div>
        </div>

        {/* Links para Cadernos Originais e Gabaritos em PDF */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            PDFs Originais Anexados:
          </span>
          <a
            href="/assets/aistudio/PROVA_CMT_2016_fe80ff7f.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Prova 2016 (PDF)</span>
          </a>
          <a
            href="/assets/aistudio/GABARITO_CMT_2016_c565131a.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gabarito 2016</span>
          </a>
          <a
            href="/assets/aistudio/PROVA_CMT_2018_633c2755.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Prova 2018 (PDF)</span>
          </a>
          <a
            href="/assets/aistudio/GABARITO_CMT_2018_999a2c98.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gabarito 2018</span>
          </a>
        </div>
      </div>

      {/* PAINEL DE ESTATÍSTICAS E SELETORES DE FILTRO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Respondidas</span>
            <p className="text-lg font-black text-slate-900">{stats.answered} / {stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Acertos</span>
            <p className="text-lg font-black text-emerald-700">{stats.correct}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Erros para Revisar</span>
            <p className="text-lg font-black text-rose-700">{stats.wrong}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Aproveitamento</span>
            <p className="text-lg font-black text-amber-800">{stats.accuracy}%</p>
          </div>
        </div>
      </div>

      {/* BARRA DE CONTROLES: SELEÇÃO DE ANO, DISCIPLINA E NAVEGAÇÃO RÁPIDA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Filtro por Ano */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Edição:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas (60)
            </button>
            <button
              onClick={() => setSelectedYear(2016)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === 2016
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prova 2016 (30)
            </button>
            <button
              onClick={() => setSelectedYear(2018)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === 2018
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prova 2018 (30)
            </button>
          </div>
        </div>

        {/* Filtro por Disciplina */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matéria:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSubject === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedSubject('portugues')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedSubject === 'portugues'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Português</span>
            </button>
            <button
              onClick={() => setSelectedSubject('matematica')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedSubject === 'matematica'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Matemática</span>
            </button>
          </div>
        </div>

        {/* Botão de Resumo/Gabarito Completo */}
        <button
          onClick={() => setActiveTabMode(activeTabMode === 'study' ? 'summary' : 'study')}
          className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{activeTabMode === 'study' ? 'Ver Grade de Questões' : 'Voltar ao Simulado'}</span>
        </button>
      </div>

      {/* GRADE DE QUESTÕES (MODO RESUMO/NAVEGADOR) */}
      {activeTabMode === 'summary' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              Grade de Questões do Seletivo
            </h3>
            <span className="text-xs text-slate-500">
              Clique em qualquer questão para abrir
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2">
            {filteredQuestions.map((q, idx) => {
              const ans = userAnswers[q.id];
              const isRev = revealedExplanations[q.id];
              const isCor = ans === q.correctAnswer;

              let btnClass = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
              if (isRev) {
                btnClass = isCor
                  ? 'bg-emerald-500 text-white border-emerald-600 font-black'
                  : 'bg-rose-500 text-white border-rose-600 font-black';
              } else if (ans) {
                btnClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
              }

              if (idx === currentIndex) {
                btnClass += ' ring-2 ring-blue-900 ring-offset-2';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setActiveTabMode('study');
                  }}
                  className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center border transition-all cursor-pointer ${btnClass}`}
                  title={`${q.examTitle} - Q${q.questionNumber}: ${q.topic}`}
                >
                  <span className="text-[10px] opacity-75">{q.examYear}</span>
                  <span className="text-sm font-bold">Q{q.questionNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ÁREA DA QUESTÃO ATUAL */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all">
          
          {/* Header da Questão */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-900 text-white font-black text-xs">
                Questão {currentQuestion.questionNumber} de {filteredQuestions.length}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs">
                {currentQuestion.examTitle}
              </span>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                currentQuestion.subject === 'portugues'
                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                  : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
              }`}>
                {currentQuestion.subjectLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
                Tópico: {currentQuestion.topic}
              </span>
            </div>
          </div>

          {/* Conteúdo da Questão */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Texto de Apoio / Contexto */}
            {currentQuestion.contextText && (
              <div className="p-4 sm:p-5 bg-slate-50 border-l-4 border-blue-800 rounded-r-2xl text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-serif italic shadow-inner">
                {currentQuestion.contextText}
              </div>
            )}

            {/* Enunciado */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </div>

            {/* DICA DE ESTUDO DO INSTRUTOR OSAIAS (Se expandida) */}
            <div className="space-y-2">
              <button
                onClick={() => setShowTip(!showTip)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400" />
                <span>{showTip ? 'Ocultar Dica de Estudo' : 'Ver Dica Estratégica do Instrutor Osaias'}</span>
              </button>

              {showTip && (
                <div className="p-4 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400 shrink-0">
                    <img
                      src="/assets/aistudio/1792634685275_25b5af36.jpg"
                      alt="Instrutor Osaias"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <strong className="block font-black text-amber-900 mb-0.5">Dica do Instrutor Osaias:</strong>
                    {currentQuestion.tip}
                  </div>
                </div>
              )}
            </div>

            {/* Alternativas de Resposta */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentSelectedAnswer === opt.letter;
                const isCorrectOption = opt.letter === currentQuestion.correctAnswer;

                let optStyle = 'border-slate-200 hover:border-blue-400 bg-white text-slate-800 hover:bg-blue-50/40';
                let circleStyle = 'border-slate-300 bg-slate-50 text-slate-700';

                if (isCurrentRevealed) {
                  if (isCorrectOption) {
                    optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-2 ring-emerald-500/30';
                    circleStyle = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (isSelected && !isCorrectOption) {
                    optStyle = 'border-rose-500 bg-rose-50 text-rose-950 line-through ring-2 ring-rose-500/30';
                    circleStyle = 'bg-rose-600 text-white border-rose-600';
                  } else {
                    optStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  optStyle = 'border-blue-700 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-700/20';
                  circleStyle = 'bg-blue-900 text-white border-blue-900';
                }

                return (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelectOption(opt.letter)}
                    disabled={isCurrentRevealed}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 flex items-start gap-3.5 transition-all cursor-pointer ${optStyle}`}
                  >
                    <span className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-sm shrink-0 transition-colors ${circleStyle}`}>
                      {opt.letter}
                    </span>
                    <span className="text-xs sm:text-sm pt-1 leading-relaxed flex-1">
                      {opt.text}
                    </span>
                    {isCurrentRevealed && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                    )}
                    {isCurrentRevealed && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* BOTÃO DE CONFIRMAR RESPOSTA OU RECOMEÇAR */}
            {!isCurrentRevealed ? (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleConfirmAnswer}
                  disabled={!currentSelectedAnswer}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Resposta</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={handleResetQuestion}
                  className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tentar responder novamente</span>
                </button>
              </div>
            )}

            {/* SEÇÃO DE FEEDBACK IMEDIATO: PARABÉNS OU EXPLICAÇÃO DO ERRO */}
            {isCurrentRevealed && (
              <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {/* 1. SE ACERTOU: PARABÉNS */}
                {isCurrentCorrect ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-emerald-950 flex items-center gap-2">
                        <span>Parabéns, Guerreiro(a)! Resposta Correta!</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
                        Excelente raciocínio! Você gabaritou esta questão da prova oficial do Colégio Militar Tiradentes. Ganhou +2 estrelas!
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 2. SE ERROU: DIZER QUE ESTÁ ERRADO E EXPLICAR O MOTIVO */
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-400 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-rose-950">
                        Resposta Incorreta! Mas não desanime, faz parte do aprendizado!
                      </h4>
                      <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
                        Você assinalou a alternativa <strong>{currentSelectedAnswer}</strong>, mas a resposta correta homologada no gabarito oficial é a letra <strong>{currentQuestion.correctAnswer}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* EXPLICAÇÃO PEDAGÓGICA DETALHADA PARA O ALUNO APRENDER */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Explicação Pedagógica e Resolução Passo a Passo
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>

                {/* VIDEOAULA DO YOUTUBE VINCULADA PARA FIXAR O ASSUNTO NA CABEÇA DO ESTUDANTE */}
                <div className="rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-50/50 via-white to-slate-50 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                        <Youtube className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                          Videoaula Recomendada no YouTube
                        </span>
                        <h6 className="text-xs sm:text-sm font-bold text-slate-900">
                          {currentQuestion.youtubeLesson.title} • {currentQuestion.youtubeLesson.channel}
                        </h6>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowVideoEmbed(!showVideoEmbed)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>{showVideoEmbed ? 'Recolher Aula' : 'Assistir Aula Aqui'}</span>
                      </button>

                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentQuestion.youtubeLesson.searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                        title="Buscar esta aula no YouTube"
                      >
                        <span>Abrir YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Player de Vídeo do YouTube Embutido */}
                  {showVideoEmbed && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-red-200 shadow-md aspect-video bg-black animate-in fade-in duration-200">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${currentQuestion.youtubeLesson.videoId}?rel=0`}
                        title={currentQuestion.youtubeLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Rodapé de Navegação (Anterior / Próxima) */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-white disabled:opacity-30 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Questão Anterior</span>
            </button>

            <span className="text-xs font-bold text-slate-500">
              {currentIndex + 1} de {filteredQuestions.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-30 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Próxima Questão</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
