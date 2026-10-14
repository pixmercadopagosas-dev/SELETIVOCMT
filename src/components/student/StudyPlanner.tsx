import React, { useState } from 'react';
import { UserProfile, StudyPreferences, GradeId } from '../../types';
import {
  CalendarDays,
  Clock,
  BookOpen,
  Calculator,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface StudyPlannerProps {
  currentUser: UserProfile;
  currentPreferences: StudyPreferences;
  onUpdatePreferences: (updated: StudyPreferences) => void;
  onOpenLesson: (lessonId: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  currentUser,
  currentPreferences,
  onUpdatePreferences,
  onOpenLesson,
}) => {
  const [dailyMinutes, setDailyMinutes] = useState<number>(currentPreferences.daily_goal_minutes);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(currentPreferences.days_per_week);
  const [prioritySubject, setPrioritySubject] = useState<'portugues' | 'matematica' | 'ambas'>(
    currentPreferences.priority_subject
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const goalOptions = [15, 20, 30, 45, 60, 90];

  const handleSave = async () => {
    const updated = await db.saveStudyPreferences(currentUser.id, {
      daily_goal_minutes: dailyMinutes,
      days_per_week: daysPerWeek,
      priority_subject: prioritySubject,
    });
    onUpdatePreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const is6Ano = currentUser.grade === '6_ano';

  // Schedule days
  const daysOfWeek = [
    {
      name: 'Segunda-feira',
      subject: prioritySubject === 'matematica' ? 'Matemática' : 'Língua Portuguesa',
      topic: is6Ano ? 'Tonicidade & Sílaba Tônica (Oxítonas e Paroxítonas)' : 'Linguagem Verbal, Não-Verbal & Variação Linguística',
      lessonId: is6Ano ? 'les-6-port-tonicidade' : 'les-7-port-linguagem',
      duration: `${dailyMinutes} min`,
      tag: 'Leitura & Teoria',
    },
    {
      name: 'Terça-feira',
      subject: 'Matemática',
      topic: is6Ano ? 'Sistema Decimal e Valor Posicional até Bilhões' : 'Critérios de Divisibilidade (2 a 10) & Primos',
      lessonId: is6Ano ? 'les-6-mat-posicional' : 'les-7-mat-divisibilidade',
      duration: `${dailyMinutes} min`,
      tag: 'Exercícios Práticos',
    },
    {
      name: 'Quarta-feira',
      subject: 'Língua Portuguesa',
      topic: is6Ano ? 'Classes de Palavras: Substantivos e Adjetivos' : 'Advérbios, Locuções e Efeitos de Sentido',
      lessonId: is6Ano ? 'les-6-port-classes' : 'les-7-port-adverbio',
      duration: `${dailyMinutes} min`,
      tag: 'Fixação & Vídeo',
    },
    {
      name: 'Quinta-feira',
      subject: 'Matemática',
      topic: is6Ano ? 'Mínimo Múltiplo Comum (MMC) e MDC' : 'Porcentagem, Descontos Comerciais & Dinheiro',
      lessonId: is6Ano ? 'les-6-mat-mmc-mdc' : 'les-7-mat-porcentagem',
      duration: `${dailyMinutes} min`,
      tag: 'Resolução de Problemas',
    },
    {
      name: 'Sexta-feira',
      subject: 'Língua Portuguesa & Matemática',
      topic: is6Ano ? 'Ortografia (X/CH, S/Z) & Quatro Operações' : 'Os 4 Porquês & Geometria Espacial',
      lessonId: is6Ano ? 'les-6-port-ortografia' : 'les-7-port-ortografia',
      duration: `${dailyMinutes} min`,
      tag: 'Revisão Ativa',
    },
    {
      name: 'Sábado',
      subject: 'Simulado do Edital',
      topic: is6Ano ? 'Treino Cronometrado: 30 Questões Oficiais' : 'Treino Cronometrado: 40 Questões Oficiais',
      lessonId: 'simulado',
      duration: '45 - 90 min',
      tag: 'Simulado Oficial',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4 text-blue-700" />
            <span>Cronograma Personalizado — {is6Ano ? '6º Ano' : '7º Ano'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Meu Plano de Estudos Semanal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento inteligente alternando disciplinas, com pausas adequadas e revisões periódicas.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Metas atualizadas com sucesso!
          </div>
        )}
      </div>

      {/* Preferences Configuration Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Configurar Minha Rotina de Estudos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily study goal minutes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Quantos minutos por dia você deseja estudar?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {goalOptions.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDailyMinutes(mins)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    dailyMinutes === mins
                      ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Recomendado para 10-12 anos: 30 a 45 minutos diários.
            </p>
          </div>

          {/* Days per week */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Quantos dias na semana pretende estudar?
            </label>
            <div className="flex items-center gap-2">
              {[3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysPerWeek(days)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    daysPerWeek === days
                      ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {days} dias
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Dias de descanso são fundamentais para fixar a memória.
            </p>
          </div>

          {/* Priority Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Qual disciplina deseja focar primeiro?
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrioritySubject('ambas')}
                className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                  prioritySubject === 'ambas'
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Equilibrado
              </button>
              <button
                onClick={() => setPrioritySubject('portugues')}
                className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                  prioritySubject === 'portugues'
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Português
              </button>
              <button
                onClick={() => setPrioritySubject('matematica')}
                className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                  prioritySubject === 'matematica'
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Matemática
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Alterna as matérias para evitar cansaço mental.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Minhas Metas
          </button>
        </div>
      </div>

      {/* Weekly Schedule Visualizer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">
            Roteiro de Estudos Sugerido para a Semana
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {daysPerWeek} dias de estudo • Sem penalidade por pausas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daysOfWeek.slice(0, daysPerWeek).map((day, idx) => {
            const isPort = day.subject.includes('Português');
            const Icon = isPort ? BookOpen : Calculator;
            return (
              <div
                key={day.name}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-900">{day.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {day.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                        isPort ? 'bg-blue-900' : 'bg-red-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{day.subject}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {day.topic}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {day.duration}
                  </span>
                  {day.lessonId !== 'simulado' ? (
                    <button
                      onClick={() => onOpenLesson(day.lessonId)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold transition-colors"
                    >
                      Iniciar
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-red-700">Simulado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
