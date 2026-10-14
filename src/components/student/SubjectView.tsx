import React, { useState } from 'react';
import { SubjectId, GradeId, LessonProgress } from '../../types';
import { MODULES_DATA, TOPICS_DATA, LESSONS_DATA, EDUCATIONAL_VIDEOS_DATA } from '../../data/curriculumData';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  Circle,
  ArrowRight,
  PlayCircle,
  Video,
  Star,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SubjectViewProps {
  subjectId: SubjectId;
  gradeId: GradeId;
  userProgress: LessonProgress[];
  onOpenLesson: (lessonId: string) => void;
  onOpenQuiz: (topicId?: string) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subjectId,
  gradeId,
  userProgress,
  onOpenLesson,
  onOpenQuiz,
}) => {
  const isPort = subjectId === 'portugues';
  const subjectName = isPort ? 'Língua Portuguesa' : 'Matemática';
  const Icon = isPort ? BookOpen : Calculator;
  const gradeLabel = gradeId === '6_ano' ? '6º Ano' : '7º Ano';

  // Active video modal state for instant in-page watching
  const [activeVideoModal, setActiveVideoModal] = useState<{
    id: string;
    title: string;
    videoId: string;
    channelName: string;
    lessonId?: string;
  } | null>(null);

  // Filter modules for this subject and grade
  const modules = MODULES_DATA.filter(
    (m) => m.grade_id === gradeId && m.subject_id === subjectId
  ).sort((a, b) => a.order_index - b.order_index);

  // Calculate overall subject completion stats
  const totalSubjectLessons = modules.reduce((acc, mod) => {
    const topics = TOPICS_DATA.filter((t) => t.module_id === mod.id);
    return acc + topics.length;
  }, 0);

  const completedSubjectLessons = modules.reduce((acc, mod) => {
    const topics = TOPICS_DATA.filter((t) => t.module_id === mod.id);
    const completedTopics = topics.filter((top) => {
      const lessons = LESSONS_DATA.filter((l) => l.topic_id === top.id);
      return lessons.some((l) => userProgress.some((p) => p.lesson_id === l.id && p.completed));
    });
    return acc + completedTopics.length;
  }, 0);

  const completionPct = totalSubjectLessons > 0 ? Math.round((completedSubjectLessons / totalSubjectLessons) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Subject Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none ${isPort ? 'bg-blue-600' : 'bg-red-600'}`} />

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
              isPort ? 'bg-gradient-to-br from-blue-900 to-indigo-800' : 'bg-gradient-to-br from-red-800 to-rose-700'
            }`}
          >
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{gradeLabel} Fundamental</span>
              <span>•</span>
              <span className="text-blue-900 font-extrabold">Edital Nº 001/26 CMT XVII</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{subjectName}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Todos os módulos pedagógicos, aulas escritas, videoaulas e exercícios práticos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative z-10">
          {/* Progress summary widget */}
          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Progresso da Matéria</span>
              <p className="text-sm font-black text-slate-800">{completedSubjectLessons} de {totalSubjectLessons} aulas</p>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center font-black text-xs text-blue-900 bg-white rounded-xl shadow-xs border border-slate-200">
              {completionPct}%
            </div>
          </div>

          <button
            onClick={() => onOpenQuiz()}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-2xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-yellow-300" />
            <span>Fazer Simulado Desta Matéria</span>
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-5">
        {modules.map((mod, modIdx) => {
          const topics = TOPICS_DATA.filter((t) => t.module_id === mod.id).sort((a, b) => a.order_index - b.order_index);
          const completedInModule = topics.filter((t) => {
            const lessons = LESSONS_DATA.filter((l) => l.topic_id === t.id);
            return lessons.some((l) => userProgress.some((p) => p.lesson_id === l.id && p.completed));
          }).length;

          const modulePct = topics.length > 0 ? Math.round((completedInModule / topics.length) * 100) : 0;

          return (
            <div
              key={mod.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Module Header Bar */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-slate-50/70 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                    modulePct === 100
                      ? 'bg-emerald-600 text-white'
                      : isPort
                      ? 'bg-blue-900 text-white'
                      : 'bg-red-800 text-white'
                  }`}>
                    {modIdx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-900">
                        Módulo {modIdx + 1}
                      </span>
                      {modulePct === 100 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Concluído
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{mod.title}</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">{mod.description}</p>
                  </div>
                </div>

                {/* Progress in module */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        modulePct === 100 ? 'bg-emerald-500' : isPort ? 'bg-blue-900' : 'bg-red-700'
                      }`}
                      style={{ width: `${modulePct}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-600">
                    {completedInModule}/{topics.length} Aulas
                  </span>
                </div>
              </div>

              {/* Topics inside this module */}
              <div className="p-4 sm:p-5 divide-y divide-slate-100">
                {topics.map((topic) => {
                  const lessons = LESSONS_DATA.filter((l) => l.topic_id === topic.id);
                  const topicLesson = lessons[0];
                  const video = EDUCATIONAL_VIDEOS_DATA.find(
                    (v) => v.topic_id === topic.id || (topicLesson && v.lesson_id === topicLesson.id)
                  );
                  const isCompleted = topicLesson && userProgress.some((p) => p.lesson_id === topicLesson.id && p.completed);

                  return (
                    <div
                      key={topic.id}
                      className="py-4 first:pt-2 last:pb-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-slate-900">{topic.title}</h3>
                            {video && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md">
                                <Video className="w-3 h-3 text-red-600" />
                                {video.duration_label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {topic.summary}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start lg:self-center shrink-0 w-full sm:w-auto">
                        {topicLesson ? (
                          <button
                            onClick={() => onOpenLesson(topicLesson.id)}
                            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-1.5 ${
                              isCompleted
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                : 'bg-blue-900 hover:bg-blue-800 text-white'
                            }`}
                          >
                            <span>{isCompleted ? 'Rever Aula' : 'Estudar Aula'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        {video && (
                          <button
                            onClick={() =>
                              setActiveVideoModal({
                                id: video.id,
                                title: video.title,
                                videoId: video.video_id,
                                channelName: video.channel_name,
                                lessonId: topicLesson?.id,
                              })
                            }
                            className="flex-1 sm:flex-none px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black transition-colors inline-flex items-center justify-center gap-1.5"
                            title="Assistir Videoaula do YouTube"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Vídeo</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenQuiz(topic.id)}
                          className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Exercícios</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* In-Page Interactive Video Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl space-y-4 p-5 text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600 rounded-lg text-white">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white line-clamp-1">{activeVideoModal.title}</h3>
                  <p className="text-xs text-slate-400">Canal: {activeVideoModal.channelName} • YouTube Oficial</p>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>

            {/* Embedded YouTube Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
              <iframe
                className="w-full h-full border-0"
                src={`https://www.youtube.com/embed/${activeVideoModal.videoId}?rel=0&modestbranding=1&autoplay=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <a
                href={`https://www.youtube.com/watch?v=${activeVideoModal.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-red-400 hover:text-red-300 font-bold inline-flex items-center gap-1.5"
              >
                <span>Assistir no YouTube oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {activeVideoModal.lessonId && (
                <button
                  onClick={() => {
                    const lId = activeVideoModal.lessonId!;
                    setActiveVideoModal(null);
                    onOpenLesson(lId);
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5"
                >
                  <span>Abrir Aula de Texto Completa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
