import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Maximize2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface FloatingAiAssistantProps {
  currentUser: UserProfile;
  currentTab: string;
  onNavigateToAiTab: () => void;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  currentUser,
  currentTab,
  onNavigateToAiTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already in the tutor-ia tab, hide the floating pill to avoid duplicate UI
  if (currentTab === 'tutor-ia') return null;

  const handleAskQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentQuestion: question,
          lessonTopic: `Dúvida rápida durante navegação na aba ${currentTab}`,
          studentGrade: currentUser.grade,
        }),
      });

      const data = await res.json();
      setAnswer(
        data.answer ||
          '🎖️ Lembre-se de ler o enunciado com atenção e conferir cada etapa do seu raciocínio!'
      );
    } catch (err) {
      setAnswer(
        'Dica do Sargento: Revise a matéria com calma e tente decompor o problema em etapas simples!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  Sargento Tiradentes I.A
                </h4>
                <p className="text-[10px] text-blue-200">
                  Ajuda rápida para o {currentUser.grade === '7_ano' ? '7º Ano' : '6º Ano'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToAiTab();
                }}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
                title="Abrir Sala Completa do Tutor"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs text-slate-700 bg-slate-50/50">
            {answer ? (
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <p className="font-bold text-blue-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Resposta do Sargento:
                </p>
                <div className="whitespace-pre-line text-slate-800 leading-relaxed text-xs">
                  {answer}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <button
                    onClick={() => {
                      setAnswer(null);
                      setQuestion('');
                    }}
                    className="text-blue-700 hover:underline font-bold"
                  >
                    Fazer outra pergunta
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateToAiTab();
                    }}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    <span>Ver mais na Sala I.A</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600">
                  Travou em alguma conta ou dúvida de português? Digite abaixo para receber ajuda imediata:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setQuestion('Como saber se a palavra é oxítona?')}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    💡 O que é oxítona?
                  </button>
                  <button
                    onClick={() => setQuestion('Como calcular MMC de 12 e 18?')}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    🔢 Como calcular MMC?
                  </button>
                  <button
                    onClick={() => setQuestion('Qual a diferença entre perímetro e área?')}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    📏 Perímetro vs Área
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Sargento Tiradentes pensando na melhor explicação...</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={handleAskQuick}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="p-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
              title="Perguntar"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-full shadow-2xl border-2 border-amber-400/80 transition-all transform hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
        </span>
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        <span className="text-xs tracking-wide">Tutor I.A Tiradentes</span>
      </button>
    </div>
  );
};
