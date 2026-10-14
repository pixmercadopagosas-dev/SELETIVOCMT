import React, { useState, useEffect } from 'react';
import { Lesson, LessonProgress, UserProfile } from '../../types';
import { EDUCATIONAL_VIDEOS_DATA } from '../../data/curriculumData';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Play,
  Star,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Send,
  Video,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/databaseEngine';

interface LessonViewProps {
  lesson: Lesson;
  currentUser: UserProfile;
  progress: LessonProgress | null;
  onBack: () => void;
  onStartQuiz: (topicId: string) => void;
  onLessonCompleted: (stars: number) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  currentUser,
  progress,
  onBack,
  onStartQuiz,
  onLessonCompleted,
}) => {
  const [isCompleted, setIsCompleted] = useState(progress?.completed || false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [completing, setCompleting] = useState(false);

  // AI Tutor chat drawer/state
  const [showTutor, setShowTutor] = useState(false);
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [loadingTutor, setLoadingTutor] = useState(false);

  useEffect(() => {
    // Scroll to top upon lesson open
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update last accessed position
    db.updateLessonPosition(currentUser.id, lesson.id, 25, 60);
  }, [lesson.id]);

  const toggleReviewAnswer = (index: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleMarkCompleted = async () => {
    if (isCompleted) return;
    setCompleting(true);

    try {
      const res = await db.markLessonCompleted(currentUser.id, lesson.id, 900);
      setIsCompleted(true);

      // Fireworks / Stars Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#1e3a8a', '#dc2626', '#10b981'],
      });

      onLessonCompleted(res.starsEarned);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim()) return;

    setLoadingTutor(true);
    setTutorResponse('');

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentQuestion: tutorQuery,
          lessonTopic: lesson.title,
          studentGrade: currentUser.grade,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setTutorResponse(data.answer);
      } else {
        setTutorResponse('Continue estudando com dedicação! Lembre-se de praticar os exercícios da aula.');
      }
    } catch (err) {
      setTutorResponse(
        'Dica do Professor: Leia a explicação simples do início da aula e tente fazer os exemplos passo a passo!'
      );
    } finally {
      setLoadingTutor(false);
    }
  };

  // Associated educational video
  const video = EDUCATIONAL_VIDEOS_DATA.find(
    (v) => v.lesson_id === lesson.id || v.topic_id === lesson.topic_id
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top back & actions bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para as Aulas</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTutor(!showTutor)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tirar Dúvida com o Tutor</span>
          </button>

          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Aula Concluída
            </span>
          ) : (
            <button
              onClick={handleMarkCompleted}
              disabled={completing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all hover:scale-102"
            >
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span>{completing ? 'Salvando...' : 'Concluir Aula (+10 estrelas)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tutor AI Assistant Drawer if open */}
      {showTutor && (
        <div className="bg-indigo-950 text-indigo-50 rounded-2xl p-5 border border-indigo-800 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-800/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Sargento Pedagogo Virtual</h4>
                <p className="text-[10px] text-indigo-300">
                  Explicação acolhedora e passo a passo para crianças de 10 a 12 anos
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTutor(false)}
              className="text-xs text-indigo-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <form onSubmit={handleAskTutor} className="flex gap-2">
            <input
              type="text"
              value={tutorQuery}
              onChange={(e) => setTutorQuery(e.target.value)}
              placeholder="Ex: Como eu sei se a palavra tem acento? Me dê outro exemplo de MMC..."
              className="flex-1 bg-indigo-900/60 border border-indigo-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              disabled={loadingTutor || !tutorQuery.trim()}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loadingTutor ? 'Explicando...' : 'Perguntar'}</span>
            </button>
          </form>

          {tutorResponse && (
            <div className="mt-3 p-3.5 bg-indigo-900/80 rounded-xl border border-indigo-700 text-xs text-indigo-100 whitespace-pre-line leading-relaxed">
              <p className="font-bold text-yellow-300 mb-1">Explicação do Tutor:</p>
              {tutorResponse}
            </div>
          )}
        </div>
      )}

      {/* Main Lesson Content Card */}
      <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
        {/* Lesson Header */}
        <header className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-900">
            <BookOpen className="w-4 h-4 text-blue-700" />
            <span>Conteúdo Oficial do Edital Nº 001/26 — CMT XVII</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {lesson.title}
          </h1>

          {/* Learning Objective Box */}
          <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Objetivo de Aprendizagem
              </p>
              <p className="text-xs sm:text-sm text-blue-950 mt-0.5 leading-relaxed font-medium">
                {lesson.learning_objective}
              </p>
            </div>
          </div>
        </header>

        {/* 1. Explicação Inicial Simples */}
        <section className="space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            1. Ideia Principal Descomplicada
          </h2>
          <div className="p-5 bg-amber-50/60 border border-amber-200/70 rounded-2xl text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
            {lesson.simple_explanation}
          </div>
        </section>

        {/* 2. Desenvolvimento Detalhado */}
        <section className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            2. Desenvolvimento Pedagógico Passo a Passo
          </h2>
          <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed">
            {lesson.detailed_development}
          </div>
        </section>

        {/* 3. Exemplos Resolvidos Passo a Passo */}
        {lesson.step_by_step_examples && lesson.step_by_step_examples.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              3. Exemplos Resolvidos Passo a Passo
            </h2>
            <div className="space-y-4">
              {lesson.step_by_step_examples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3"
                >
                  <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {exIdx + 1}
                    </span>
                    {ex.title}
                  </h3>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                    {ex.problem}
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-slate-600 pl-2 border-l-2 border-blue-400">
                    {ex.steps.map((st, sIdx) => (
                      <p key={sIdx}>{st}</p>
                    ))}
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Conclusão: {ex.final_answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Situações Práticas do Cotidiano */}
        {lesson.daily_applications && (
          <section className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              4. Onde Encontramos Isso na Vida Real?
            </h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {lesson.daily_applications}
            </div>
          </section>
        )}

        {/* 5. Resumo dos Pontos Principais */}
        <section className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            5. Resumo do que Você Não Pode Esquecer
          </h2>
          <div className="p-5 bg-blue-950 text-blue-50 rounded-2xl space-y-2.5">
            {lesson.summary_keypoints.map((pt, pIdx) => (
              <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{pt}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Erros Comuns e Como Evitá-los */}
        {lesson.common_pitfalls && (
          <section className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500">
              6. Pegadinha! Erros Comuns no Concurso
            </h2>
            <div className="p-4 bg-red-50 border border-red-200/90 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-900">Como não cair na pegadinha da banca:</p>
                <p className="text-xs sm:text-sm text-red-800 mt-1 leading-relaxed">
                  {lesson.common_pitfalls}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 7. Perguntas Rápidas de Revisão */}
        {lesson.quick_review_questions && lesson.quick_review_questions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              7. Perguntas Rápidas de Revisão
            </h2>
            <div className="space-y-3">
              {lesson.quick_review_questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {qIdx + 1}. {q.question}
                  </p>
                  {revealedAnswers[qIdx] ? (
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1 animate-in fade-in">
                      <p className="text-xs sm:text-sm font-bold text-emerald-800">
                        Resposta: {q.answer}
                      </p>
                      <p className="text-xs text-slate-500">Dica: {q.tip}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleReviewAnswer(qIdx)}
                      className="text-xs font-bold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Ver Resposta e Dica</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Aprenda Também com Vídeo (YouTube) */}
        {video && (
          <section className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0">
                  <Video className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Videoaula Recomendada no YouTube
                  </h2>
                  <p className="text-xs text-slate-500">
                    Canal: <strong className="text-slate-700">{video.channel_name}</strong> • Duração: {video.duration_label}
                  </p>
                </div>
              </div>

              <a
                href={video.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-black transition-colors self-start sm:self-auto border border-red-200"
              >
                <span>Assistir no YouTube Oficial ↗</span>
              </a>
            </div>

            {/* Embedded Responsive YouTube Player */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-md">
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${video.video_id}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="text-slate-600">
                Caso o vídeo não reproduza no navegador escolar, você pode assistir diretamente no canal oficial:
              </span>
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shrink-0 transition-colors shadow-xs"
              >
                <span>Assistir no YouTube Oficial ↗</span>
              </a>
            </div>
          </section>
        )}

        {/* Lesson Footer Navigation and Next Actions */}
        <footer className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Voltar ao Sumário
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isCompleted && (
              <button
                onClick={handleMarkCompleted}
                disabled={completing}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
              >
                Concluir Aula (+10 estrelas)
              </button>
            )}

            <button
              onClick={() => onStartQuiz(lesson.topic_id)}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all hover:shadow-lg inline-flex items-center justify-center gap-2"
            >
              <span>Fazer Exercícios Deste Assunto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
};
