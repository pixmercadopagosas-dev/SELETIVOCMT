import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Maximize2,
  ChevronDown,
  ExternalLink,
  Globe,
  Youtube,
  BookOpen,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface WebSource {
  title: string;
  link: string;
  snippet?: string;
  source?: string;
}

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
  const [sources, setSources] = useState<WebSource[]>([]);
  const [youtubeSearchUrl, setYoutubeSearchUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already in the tutor-ia tab, hide the floating pill to avoid duplicate UI
  if (currentTab === 'tutor-ia') return null;

  const handleAskQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = question.trim();
    if (!query || loading) return;

    setLoading(true);
    setAnswer(null);
    setSources([]);
    setYoutubeSearchUrl(null);

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentQuestion: query,
          lessonTopic: `Dúvida rápida durante navegação na aba ${currentTab}`,
          studentGrade: currentUser.grade,
        }),
      });

      const data = await res.json();
      setAnswer(
        data.answer ||
          '🎖️ Lembre-se de ler o enunciado com atenção e conferir cada etapa do seu raciocínio!'
      );
      if (data.sources && Array.isArray(data.sources)) {
        setSources(data.sources);
      }
      if (data.youtubeSearchUrl) {
        setYoutubeSearchUrl(data.youtubeSearchUrl);
      }
    } catch (err) {
      setAnswer(
        `🎖️ **Dica de Estudo:** Para "${query}", revise a definição básica e realize exercícios passo a passo. Acesse a aba Tutor I.A para uma explicação completa!`
      );
      setYoutubeSearchUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' aula 6 ano')}`);
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
                <div className="flex items-center justify-between">
                  <p className="font-bold text-blue-950 flex items-center gap-1 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Resposta do Sargento:
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <Globe className="w-2.5 h-2.5" />
                    Web Integrada
                  </span>
                </div>
                <div className="whitespace-pre-line text-slate-800 leading-relaxed text-xs">
                  {answer}
                </div>

                {/* Sources list */}
                {sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-600" />
                      Fontes na Internet:
                    </p>
                    <div className="flex flex-col gap-1">
                      {sources.slice(0, 3).map((s, i) => (
                        <a
                          key={i}
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50/60 hover:bg-blue-100/70 p-1.5 rounded border border-blue-100"
                        >
                          <span className="truncate pr-1 font-medium">{s.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-blue-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* YouTube Link */}
                {youtubeSearchUrl && (
                  <div className="pt-1.5">
                    <a
                      href={youtubeSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition-colors"
                    >
                      <Youtube className="w-3 h-3 text-red-600" />
                      <span>Ver aula no YouTube</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <button
                    onClick={() => {
                      setAnswer(null);
                      setQuestion('');
                      setSources([]);
                      setYoutubeSearchUrl(null);
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
                    <span>Ver na Sala I.A</span>
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
