import React, { useState } from 'react';
import { Question, UserProfile } from '../../types';
import { OFFICIAL_QUESTIONS } from '../../data/questionsData';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Star,
  Sparkles,
  BookOpen,
  Calculator,
  ArrowLeft,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/databaseEngine';
import { LESSONS_DATA, EDUCATIONAL_VIDEOS_DATA } from '../../data/curriculumData';
import { useAppTheme } from '../../lib/themeContext';
import { renderThemeIcon } from '../common/AlienSvgIcons';

interface InteractiveQuizProps {
  currentUser: UserProfile;
  topicId?: string;
  subjectFilter?: 'portugues' | 'matematica';
  onBack: () => void;
  onQuestionCompleted?: () => void;
  onOpenLesson?: (lessonId: string) => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  currentUser,
  topicId,
  subjectFilter,
  onBack,
  onQuestionCompleted,
  onOpenLesson,
}) => {
  const { currentCartoon, activeAlienProfile, activeTeenProfile } = useAppTheme();

  // Filter questions for the user's grade and optionally topic or subject
  const availableQuestions = OFFICIAL_QUESTIONS.filter((q) => {
    if (q.grade_id !== currentUser.grade) return false;
    if (topicId && q.topic_id && q.topic_id !== topicId) return false;
    if (subjectFilter && q.subject_id !== subjectFilter) return false;
    return true;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showQuickLesson, setShowQuickLesson] = useState(false);

  const currentQuestion = availableQuestions[currentIndex] || availableQuestions[0];
  const quickLessonData = currentQuestion
    ? LESSONS_DATA.find((l) => l.topic_id === currentQuestion.topic_id) ||
      LESSONS_DATA.find((l) => l.id.includes(currentQuestion.subject_id === 'portugues' ? 'port' : 'mat')) ||
      LESSONS_DATA[0]
    : LESSONS_DATA[0];

  const quickLessonVideo = quickLessonData
    ? EDUCATIONAL_VIDEOS_DATA.find((v) => v.lesson_id === quickLessonData.id || v.topic_id === quickLessonData.topic_id)
    : null;

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto space-y-4">
        <h3 className="text-base font-bold text-slate-800">Nenhuma questão encontrada</h3>
        <p className="text-xs text-slate-500">
          Não há questões cadastradas para este filtro de assunto no momento.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold"
        >
          Voltar
        </button>
      </div>
    );
  }

  const isCorrect = selectedLetter === currentQuestion.correct_option;

  const handleSubmit = async () => {
    if (!selectedLetter || isSubmitted) return;
    setIsSubmitted(true);

    const isAnswerCorrect = selectedLetter === currentQuestion.correct_option;
    if (isAnswerCorrect) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#facc15', '#1e3a8a'],
      });
    }

    // Persist attempt in database
    await db.recordQuestionAttempt(currentUser.id, currentQuestion.id, selectedLetter, isAnswerCorrect);
    if (onQuestionCompleted) onQuestionCompleted();
  };

  const handleNext = () => {
    setSelectedLetter(null);
    setIsSubmitted(false);
    if (currentIndex < availableQuestions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      // Loop or finish
      setCurrentIndex(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">
            Questão {currentIndex + 1} de {availableQuestions.length}
          </span>
          <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold rounded-lg">
            Acertos: {score}
          </span>
        </div>
      </div>

      {/* Theme Booster Banner in Quiz */}
      {currentCartoon === 'ben10_alien' && (
        <div className="bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-emerald-500 flex items-center justify-center shrink-0">
              {renderThemeIcon(activeAlienProfile.iconName, 'w-6 h-6')}
            </div>
            <div>
              <span className="font-black text-emerald-400">{activeAlienProfile.name}:</span>
              <span className="text-slate-200 text-xs ml-1 italic hidden sm:inline">"{activeAlienProfile.quote}"</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-900 border border-emerald-600 px-2 py-0.5 rounded text-emerald-300 shrink-0">
            {activeAlienProfile.studyPower.split('•')[0]}
          </span>
        </div>
      )}

      {currentCartoon === 'cyber_gamer_boy' && (
        <div className="bg-slate-950 border-2 border-cyan-500 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500 flex items-center justify-center shrink-0">
              {renderThemeIcon(activeTeenProfile.iconName, 'w-6 h-6')}
            </div>
            <div>
              <span className="font-black text-cyan-300 font-mono">{activeTeenProfile.name}:</span>
              <span className="text-slate-200 text-xs ml-1 italic hidden sm:inline">"{activeTeenProfile.quote}"</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-600 px-2 py-0.5 rounded text-cyan-300 shrink-0">
            Combo Gamer Ativo
          </span>
        </div>
      )}

      {currentCartoon === 'aesthetic_y2k_girl' && (
        <div className="bg-pink-950/90 border-2 border-pink-400 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-900 border border-pink-400 flex items-center justify-center shrink-0">
              {renderThemeIcon(activeTeenProfile.iconName, 'w-6 h-6')}
            </div>
            <div>
              <span className="font-black text-pink-300">{activeTeenProfile.name}:</span>
              <span className="text-pink-100 text-xs ml-1 italic hidden sm:inline">"{activeTeenProfile.quote}"</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-pink-900 border border-pink-500 px-2 py-0.5 rounded text-pink-200 shrink-0">
            Study Glow ✨
          </span>
        </div>
      )}

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            {currentQuestion.subject_id === 'portugues' ? (
              <span className="inline-flex items-center gap-1.5 text-blue-900 font-extrabold">
                <BookOpen className="w-4 h-4 text-blue-700" /> Língua Portuguesa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-800 font-extrabold">
                <Calculator className="w-4 h-4 text-red-600" /> Matemática
              </span>
            )}
            <span>•</span>
            <span className="capitalize px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
              Dificuldade: {currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickLesson(!showQuickLesson)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-extrabold transition-all border border-amber-300 shadow-xs hover:scale-102"
              title="Ver aula rápida para entender o assunto antes de responder"
            >
              <Lightbulb className="w-4 h-4 text-amber-700 fill-amber-400" />
              <span>{showQuickLesson ? 'Ocultar Aula Rápida' : '📖 Aula Rápida do Assunto'}</span>
            </button>
            <span className="text-xs font-extrabold text-blue-900 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-200">
              {currentUser.grade === '6_ano' ? '6º Ano' : '7º Ano'}
            </span>
          </div>
        </div>

        {/* Aula Rápida / Resumo Pedagógico Antes de Responder */}
        {showQuickLesson && quickLessonData && (
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 space-y-3.5 shadow-sm animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-amber-950">
                    Aula Rápida: {quickLessonData.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-800">
                    Revise os principais pontos do edital antes de marcar sua alternativa!
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQuickLesson(false)}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-white/80 px-2 py-1 rounded-lg border border-amber-200"
              >
                Fechar Aula
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-amber-950">
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80 leading-relaxed">
                <strong className="text-amber-900 block mb-1">💡 Conceito Essencial:</strong>
                {quickLessonData.simple_explanation}
              </div>

              {quickLessonData.step_by_step_examples && quickLessonData.step_by_step_examples.length > 0 && (
                <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80 leading-relaxed">
                  <strong className="text-amber-900 block mb-1">
                    ✏️ Exemplo Resolvido: {quickLessonData.step_by_step_examples[0].title}
                  </strong>
                  <p className="text-xs text-slate-700 mb-1.5">{quickLessonData.step_by_step_examples[0].problem}</p>
                  <p className="text-xs font-bold text-emerald-800">
                    {quickLessonData.step_by_step_examples[0].final_answer}
                  </p>
                </div>
              )}

              {quickLessonData.summary_keypoints && quickLessonData.summary_keypoints.length > 0 && (
                <div className="p-2.5 bg-amber-100/70 rounded-xl text-[11px] sm:text-xs text-amber-900">
                  <strong className="block mb-1">⭐ Dica de Ouro do Tiradentes:</strong>
                  {quickLessonData.summary_keypoints[0]}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
              {onOpenLesson && quickLessonData && (
                <button
                  type="button"
                  onClick={() => onOpenLesson(quickLessonData.id)}
                  className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ver Aula Completa com Vídeo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowQuickLesson(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1 ml-auto"
              >
                <span>Entendi! Quero Responder a Questão Agora ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* Statement */}
        <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          {currentQuestion.statement}
        </div>

        {/* 5 Alternatives A to E */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedLetter === opt.letter;
            const isThisCorrect = opt.letter === currentQuestion.correct_option;

            let borderStyle = 'border-slate-200 hover:border-blue-400 bg-white';
            let circleStyle = 'bg-slate-100 text-slate-700 font-bold';

            if (isSubmitted) {
              if (isThisCorrect) {
                borderStyle = 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500';
                circleStyle = 'bg-emerald-600 text-white font-bold';
              } else if (isSelected && !isThisCorrect) {
                borderStyle = 'border-red-400 bg-red-50/80 ring-2 ring-red-400';
                circleStyle = 'bg-red-600 text-white font-bold';
              } else {
                borderStyle = 'border-slate-200 opacity-60 bg-white';
              }
            } else if (isSelected) {
              borderStyle = 'border-blue-700 bg-blue-50/60 ring-2 ring-blue-700';
              circleStyle = 'bg-blue-900 text-white font-bold';
            }

            return (
              <button
                key={opt.letter}
                disabled={isSubmitted}
                onClick={() => setSelectedLetter(opt.letter)}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer disabled:cursor-default ${borderStyle}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm transition-colors ${circleStyle}`}
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

        {/* Submit Button (before submission) */}
        {!isSubmitted && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedLetter}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-sm transition-all"
            >
              Confirmar Resposta
            </button>
          </div>
        )}

        {/* Pedagogical Correction & Step-by-Step Resolution */}
        {isSubmitted && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-3 duration-200">
            {/* Positive & Warm Message */}
            {isCorrect ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-950">
                    Parabéns! Você acertou! (+2 estrelas)
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                    Você identificou com precisão o raciocínio correto do edital. Excelente dedicação militar aos estudos!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold text-red-950">
                    Quase lá! Você está aprendendo.
                  </h4>
                  <p className="text-xs sm:text-sm text-red-800 mt-1 leading-relaxed">
                    Não se preocupe: errar faz parte do aprendizado. Vamos resolver juntos, passo a passo, para entender onde ocorreu o detalhe!
                  </p>
                </div>
              </div>
            )}

            {/* Why Correct & Distractor explanation */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <p className="font-extrabold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Por que a alternativa correta é a letra {currentQuestion.correct_option}?
                </p>
                <p className="text-slate-700 leading-relaxed">{currentQuestion.why_correct}</p>
              </div>

              {selectedLetter && !isCorrect && currentQuestion.why_incorrect_notes[selectedLetter] && (
                <div className="p-3 bg-red-100/60 rounded-xl border border-red-200 text-red-900 space-y-1">
                  <p className="font-bold">Onde estava o erro na sua opção ({selectedLetter}):</p>
                  <p className="text-xs text-red-800">
                    {currentQuestion.why_incorrect_notes[selectedLetter]}
                  </p>
                </div>
              )}

              {currentQuestion.step_by_step_solution && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <p className="font-extrabold text-slate-800">Resolução Passo a Passo:</p>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-mono text-[11px] sm:text-xs bg-white p-3 rounded-xl border border-slate-200">
                    {currentQuestion.step_by_step_solution}
                  </p>
                </div>
              )}
            </div>

            {/* Action to Next Question */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Resposta gravada com segurança no banco de dados.
              </span>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all"
              >
                <span>Próxima Questão</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
