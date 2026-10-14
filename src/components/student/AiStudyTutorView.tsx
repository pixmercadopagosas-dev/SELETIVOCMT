import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  BookOpen,
  Calculator,
  PenTool,
  BrainCircuit,
  Award,
  ChevronRight,
  Copy,
  Check,
  Flame,
  Star,
  Compass,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../../types';

interface AiStudyTutorViewProps {
  currentUser: UserProfile;
  initialTopic?: string;
}

interface ChatMessage {
  id: string;
  sender: 'student' | 'tutor';
  text: string;
  time: string;
  topic?: string;
}

interface ChallengeQuestion {
  statement: string;
  options: { letter: string; text: string }[];
  correct_option: string;
  hint: string;
  detailed_explanation: string;
  why_correct: string;
  step_by_step?: string;
}

interface TextFeedback {
  scoreEstimate: string;
  praises: string[];
  tips: string[];
  grammarPoints?: string[];
  improvedVersion: string;
  pedagogicalNote: string;
}

export const AiStudyTutorView: React.FC<AiStudyTutorViewProps> = ({
  currentUser,
  initialTopic,
}) => {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'desafio' | 'redacao' | 'macetes'
  >('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `🎖️ **Saudações, ${currentUser.full_name || currentUser.username}! Sou o Sargento Pedagogo Tiradentes!**\n\nEstou aqui como seu tutor de inteligência artificial para te preparar rumo à aprovação no **${currentUser.grade === '7_ano' ? '7º Ano' : '6º Ano'} do Colégio Militar Tiradentes XVII** em Balsas/MA.\n\nVocê pode me fazer perguntas de **Matemática** ou **Língua Portuguesa**, pedir resolução de continhas passo a passo, gerar desafios inéditos ou pedir dicas para não esquecer as regras da prova. Como posso te ajudar agora?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<'todos' | 'matematica' | 'portugues'>('todos');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Desafio State
  const [challengeSubject, setChallengeSubject] = useState<'matematica' | 'portugues'>('matematica');
  const [challengeTopic, setChallengeTopic] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [challengeScore, setChallengeScore] = useState({ correct: 0, total: 0 });

  // Redação State
  const [studentText, setStudentText] = useState('');
  const [essayTheme, setEssayTheme] = useState('Por que o respeito e a dedicação aos estudos são importantes no Colégio Militar?');
  const [analyzingText, setAnalyzingText] = useState(false);
  const [textFeedback, setTextFeedback] = useState<TextFeedback | null>(null);

  // Copy state helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick prompt questions
  const quickPrompts = [
    {
      subject: 'matematica',
      label: 'Como calcular MMC passo a passo?',
      prompt: 'Explique como calcular o MMC entre 12 e 18 de forma passo a passo e didática para uma criança de 10-12 anos.',
    },
    {
      subject: 'portugues',
      label: 'Diferença entre Oxítona e Paroxítona',
      prompt: 'Explique a diferença entre oxítona, paroxítona e proparoxítona com o truque do portão e exemplos práticos para o CMT XVII.',
    },
    {
      subject: 'matematica',
      label: 'Como somar frações diferentes?',
      prompt: 'Como somar frações com denominadores diferentes, por exemplo 2/3 + 1/4? Explique com desenho ou analogia de pizza.',
    },
    {
      subject: 'portugues',
      label: 'Quando usar os 4 tipos de "Porquê"?',
      prompt: 'Explique quando usar "por que", "por quê", "porque" e "porquê" de um jeito que nunca mais vou esquecer.',
    },
    {
      subject: 'matematica',
      label: 'Diferença de Perímetro e Área',
      prompt: 'Qual a diferença entre perímetro e área? Dê exemplos práticos com a cerca e a grama de um campo de futebol.',
    },
  ];

  // Send message to Tutor
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery.trim();
    if (!textToSend || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'student',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputQuery('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentQuestion: textToSend,
          lessonTopic: initialTopic || (selectedSubjectFilter === 'todos' ? 'Preparatório Geral' : selectedSubjectFilter),
          studentGrade: currentUser.grade,
          mode: 'estudo_direcionado',
        }),
      });

      const data = await res.json();
      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: data.answer || 'Excelente pergunta! Continue praticando os exercícios e videoaulas do CMT XVII.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      const errorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: '🎖️ **Dica de Ouro:** Revise com calma o enunciado e faça um rascunho. Continue firme nos seus estudos!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate Challenge Question
  const handleGenerateChallenge = async () => {
    setLoadingChallenge(true);
    setCurrentChallenge(null);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);

    try {
      const res = await fetch('/api/gemini/challenge-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: challengeSubject,
          grade: currentUser.grade,
          topic: challengeTopic.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.question) {
        setCurrentChallenge(data.question);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChallenge(false);
    }
  };

  // Submit Answer to Challenge
  const handleAnswerChallenge = () => {
    if (!selectedAnswer || !currentChallenge || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedAnswer === currentChallenge.correct_option;

    setChallengeScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#facc15'],
      });
    }
  };

  // Analyze Student's text / redação
  const handleAnalyzeText = async () => {
    if (!studentText.trim() || analyzingText) return;

    setAnalyzingText(true);
    setTextFeedback(null);

    try {
      const res = await fetch('/api/gemini/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentText,
          grade: currentUser.grade,
          theme: essayTheme,
        }),
      });

      const data = await res.json();
      if (data.feedback) {
        setTextFeedback(data.feedback);
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingText(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Inteligência Artificial Pedagógica • CMT XVII</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Sargento Pedagogo Tiradentes
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tutor particular com I.A treinado com as diretrizes do Edital de Ingresso do Colégio Militar Tiradentes XVII de Balsas/MA. Tire dúvidas, gere desafios rápidos e treine sua redação passo a passo!
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 bg-slate-800/80 text-blue-300 rounded-lg font-bold border border-blue-500/30">
                🎯 {currentUser.grade === '7_ano' ? 'Foco: 7º Ano' : 'Foco: 6º Ano'}
              </span>
              <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 rounded-lg font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                I.A Pronta para Respostas Imediatas
              </span>
            </div>
          </div>

          {/* Quick stats badge */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 p-4 rounded-xl shrink-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-900 shadow-md">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Acertos em Desafios I.A</p>
              <p className="text-xl font-black text-amber-400">
                {challengeScore.correct} / {challengeScore.total}
              </p>
              <p className="text-[10px] text-slate-400">Desafios resolvidos hoje</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-indigo-900/60">
          <button
            onClick={() => setActiveTab('chat')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Tirar Dúvidas (Chat Pedagógico)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('desafio');
              if (!currentChallenge) handleGenerateChallenge();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'desafio'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Desafio I.A (Questão Inédita)</span>
          </button>

          <button
            onClick={() => setActiveTab('redacao')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'redacao'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Treinador de Redação & Escrita</span>
          </button>

          <button
            onClick={() => setActiveTab('macetes')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'macetes'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span>Macetes do Edital CMT XVII</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CHAT PEDAGÓGICO COM O SARGENTO TIRADENTES
         ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[650px] overflow-hidden">
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-black shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Diálogo com o Sargento Tiradentes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Respostas passo a passo e didáticas para 10 a 12 anos
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'tutor',
                      text: `🎖️ **Chat reiniciado!** Em qual assunto de Matemática ou Português posso te ajudar agora, ${currentUser.full_name || currentUser.username}?`,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
                title="Limpar conversa"
              >
                Limpar
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === 'student' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'tutor' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-sm leading-relaxed ${
                      msg.sender === 'student'
                        ? 'bg-blue-900 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">
                      {msg.text}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100/30 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{msg.time}</span>
                      {msg.sender === 'tutor' && (
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar resposta</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'student' && (
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 mt-1 font-bold shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-3.5 shadow-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      Sargento Tiradentes formulando explicação didática...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Digite sua dúvida de Matemática ou Português (Ex: Como resolver fração?)"
                  disabled={isTyping}
                  className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-hidden rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="px-5 py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <span>Enviar</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Prompts & Study Guide */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Perguntas Frequentes do Edital</span>
              </div>
              <p className="text-xs text-slate-500">
                Clique em qualquer tópico para pedir uma explicação passo a passo ao Sargento Tiradentes:
              </p>

              <div className="space-y-2">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/70 hover:bg-indigo-50/40 text-xs text-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      {item.subject === 'matematica' ? (
                        <Calculator className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 group-hover:text-blue-900">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-900 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Practical Advice Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Mandamentos do CMT XVII</span>
              </div>
              <ul className="text-xs text-amber-950/80 space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-700">1.</span>
                  <span>Nunca chute sem eliminar pelo menos duas alternativas incorretas.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-700">2.</span>
                  <span>Na Matemática, faça o rascunho sem pressa e confira a operação inversa.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-700">3.</span>
                  <span>No Português, releia o texto procurando a ideia central antes de responder.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DESAFIO INTERATIVO COM I.A (QUESTÃO INÉDITA)
         ========================================================================= */}
      {activeTab === 'desafio' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Disciplina
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setChallengeSubject('matematica')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      challengeSubject === 'matematica'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Matemática
                  </button>
                  <button
                    onClick={() => setChallengeSubject('portugues')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      challengeSubject === 'portugues'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Língua Portuguesa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tópico do Edital (Opcional)
                </label>
                <input
                  type="text"
                  value={challengeTopic}
                  onChange={(e) => setChallengeTopic(e.target.value)}
                  placeholder="Ex: Frações, Acentuação, MMC, Área..."
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 w-48 sm:w-60"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateChallenge}
              disabled={loadingChallenge}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loadingChallenge ? 'animate-spin' : ''}`} />
              <span>{loadingChallenge ? 'Gerando Desafio...' : 'Gerar Nova Questão com I.A'}</span>
            </button>
          </div>

          {/* Question Card */}
          {loadingChallenge ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                Sargento Tiradentes elaborando questão inédita no estilo do CMT XVII...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Adaptada para o {currentUser.grade === '7_ano' ? '7º Ano' : '6º Ano'} com 5 alternativas, dicas e explicação detalhada.
              </p>
            </div>
          ) : currentChallenge ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold uppercase tracking-wide">
                    {challengeSubject === 'matematica' ? 'Matemática' : 'Língua Portuguesa'}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    {currentUser.grade === '7_ano' ? '7º Ano' : '6º Ano'}
                  </span>
                </div>

                {!isAnswerSubmitted && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>{showHint ? 'Ocultar Dica' : 'Pedir Dica da I.A'}</span>
                  </button>
                )}
              </div>

              {/* Hint Box */}
              {showHint && !isAnswerSubmitted && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed animate-in fade-in">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Dica do Sargento Tiradentes:
                  </p>
                  <p>{currentChallenge.hint}</p>
                </div>
              )}

              {/* Statement */}
              <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                {currentChallenge.statement}
              </div>

              {/* 5 Alternatives */}
              <div className="space-y-3">
                {currentChallenge.options.map((opt) => {
                  const isSelected = selectedAnswer === opt.letter;
                  const isCorrect = opt.letter === currentChallenge.correct_option;

                  let cardStyle =
                    'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      cardStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      cardStyle =
                        'border-rose-400 bg-rose-50 text-rose-950 line-through';
                    }
                  } else if (isSelected) {
                    cardStyle =
                      'border-blue-700 bg-blue-50/70 text-blue-950 font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={opt.letter}
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedAnswer(opt.letter)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected || (isAnswerSubmitted && isCorrect)
                              ? 'bg-blue-900 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {opt.letter}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit or Result Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={!selectedAnswer}
                    onClick={handleAnswerChallenge}
                    className="px-6 py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Confirmar Resposta</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateChallenge}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Próximo Desafio I.A</span>
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Detailed Resolution Card */}
              {isAnswerSubmitted && (
                <div
                  className={`p-6 rounded-2xl border space-y-4 animate-in fade-in ${
                    selectedAnswer === currentChallenge.correct_option
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm">
                    {selectedAnswer === currentChallenge.correct_option ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Excelente, Recruta! Você acertou em cheio! 🎖️</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-indigo-700" />
                        <span>
                          Quase lá! A alternativa correta é a letra {currentChallenge.correct_option}. Veja a explicação passo a passo:
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 text-sm leading-relaxed">
                    <p className="font-semibold">{currentChallenge.detailed_explanation}</p>
                    {currentChallenge.step_by_step && (
                      <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 font-mono text-xs whitespace-pre-line text-slate-800">
                        {currentChallenge.step_by_step}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* =========================================================================
          TAB 3: TREINADOR DE REDAÇÃO & ESCRITA
         ========================================================================= */}
      {activeTab === 'redacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input side */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-900" />
                <span>Laboratório de Escrita do CMT XVII</span>
              </h3>
              <p className="text-xs text-slate-500">
                Escreva seu parágrafo ou resposta para que o Sargento Tiradentes avalie com carinho e aponte melhorias gramaticais.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tema / Proposta de Redação
              </label>
              <input
                type="text"
                value={essayTheme}
                onChange={(e) => setEssayTheme(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seu Texto (Escreva aqui com suas próprias palavras)
              </label>
              <textarea
                rows={8}
                value={studentText}
                onChange={(e) => setStudentText(e.target.value)}
                placeholder="Exemplo: No Colégio Militar agente aprende a ter disciplina e respeitar os colegas. Eu quero estudar la porque sei que vou ter um futuro melhor e orgulhar minha familia..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {studentText.length} caracteres digitados
              </p>
            </div>

            <button
              onClick={handleAnalyzeText}
              disabled={studentText.trim().length < 5 || analyzingText}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className={`w-4 h-4 text-amber-400 ${analyzingText ? 'animate-spin' : ''}`} />
              <span>{analyzingText ? 'Sargento Tiradentes analisando...' : 'Avaliar Meu Texto com I.A'}</span>
            </button>
          </div>

          {/* Feedback side */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Diagnóstico Pedagógico do Sargento</span>
            </h3>

            {analyzingText ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">
                  Verificando ortografia, pontuação, vocabulário e concordância...
                </p>
              </div>
            ) : textFeedback ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Score badge */}
                <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-200">Nota Estimada no Critério</p>
                    <p className="text-2xl font-black text-amber-300">
                      {textFeedback.scoreEstimate}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                </div>

                {/* Praises */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    O que você fez muito bem:
                  </p>
                  <ul className="text-xs text-emerald-900/90 list-disc list-inside space-y-1">
                    {textFeedback.praises.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Dicas de ouro para aprimorar:
                  </p>
                  <ul className="text-xs text-amber-900/90 list-disc list-inside space-y-1">
                    {textFeedback.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* Improved Version */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">
                    Versão Lapidada pelo Sargento:
                  </p>
                  <p className="text-xs text-slate-700 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    "{textFeedback.improvedVersion}"
                  </p>
                </div>

                {/* Pedagogical Note */}
                <p className="text-xs text-slate-600 font-medium italic">
                  💬 {textFeedback.pedagogicalNote}
                </p>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <PenTool className="w-10 h-10 mx-auto stroke-1" />
                <p className="text-xs">
                  Digite seu texto ao lado e clique em "Avaliar Meu Texto" para receber a análise completa.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MACETES DO EDITAL CMT XVII
         ========================================================================= */}
      {activeTab === 'macetes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Português */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Macetes de Língua Portuguesa</span>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <p className="font-bold text-emerald-950 mb-1">
                  1. O Truque dos "Porquês":
                </p>
                <p>• <strong>Por que</strong> (separado sem acento): Perguntas no início ("Por que você estuda?").</p>
                <p>• <strong>Por quê</strong> (separado com acento): Fim de frase ("Você desistiu? Por quê?").</p>
                <p>• <strong>Porque</strong> (junto sem acento): Explicações e respostas ("Porque quero passar!").</p>
                <p>• <strong>Porquê</strong> (junto com acento): Substantivo com sentido de 'motivo' ("Não entendi o porquê.").</p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <p className="font-bold text-emerald-950 mb-1">
                  2. A Regra do Troca-Troca da Crase:
                </p>
                <p>Troque a palavra feminina seguinte por uma masculina equivalente. Se virar <strong>"ao"</strong>, tem crase!</p>
                <p><em>Exemplo:</em> "Fui à escola" → "Fui <strong>ao</strong> colégio" (Tem crase!).</p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <p className="font-bold text-emerald-950 mb-1">
                  3. Todas as Proparoxítonas são Acentuadas:
                </p>
                <p>Se a terceira sílaba de trás pra frente for a forte, coloque acento sem medo: <em>Mé-di-co, lâm-pa-da, ár-vo-re, mú-si-ca</em>.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Matemática */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Calculator className="w-5 h-5 text-blue-700" />
              <span>Macetes de Matemática</span>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-950 mb-1">
                  1. Perímetro vs. Área:
                </p>
                <p>• <strong>Perímetro:</strong> O contorno! Some todos os lados (como a cerca de um lote).</p>
                <p>• <strong>Área:</strong> O espaço interno! Multiplique base × altura (como o piso de cerâmica).</p>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-950 mb-1">
                  2. Fração de uma Quantidade:
                </p>
                <p>Para achar <strong>3/5 de 40 alunos</strong>:</p>
                <p>1º: Divida pelo de baixo (40 ÷ 5 = 8).</p>
                <p>2º: Multiplique pelo de cima (8 × 3 = <strong>24 alunos</strong>!).</p>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-950 mb-1">
                  3. Divisibilidade por 3:
                </p>
                <p>Some todos os algarismos do número. Se a soma estiver na tabuada do 3, o número é divisível!</p>
                <p><em>Exemplo:</em> 1.452 → 1 + 4 + 5 + 2 = 12 (12 dá por 3, logo 1.452 dá por 3!).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
