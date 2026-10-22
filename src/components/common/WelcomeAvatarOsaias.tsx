import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  RotateCcw,
  Star,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface WelcomeAvatarOsaiasProps {
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeAvatarOsaias: React.FC<WelcomeAvatarOsaiasProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(9);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const studentName = currentUser?.full_name?.split(' ')[0] || currentUser?.username || 'Estudante';

  // O texto exato exigido pelo usuário:
  // "ANTES DE DAR BOAS VINDAS, ELE DIRÁ: MEU NOME É OSAIAS, SEU ASSISTENTE VIRTUAL."
  // Dando boas-vindas, desejando bons estudos e dizendo para acreditarem no seu potencial.
  const speechScript = [
    {
      badge: 'Apresentação',
      text: `Meu nome é Osaias, seu assistente virtual.`,
      highlight: true,
    },
    {
      badge: 'Boas-Vindas',
      text: `Olá, ${studentName}! Seja muito bem-vindo(a) à plataforma de preparação do Colégio Militar Tiradentes XVII!`,
      highlight: false,
    },
    {
      badge: 'Motivação & Potencial',
      text: `Desejo a você excelentes estudos hoje. Acredite no seu potencial! Com foco, dedicação e disciplina, a sua aprovação e a sua vaga estão cada dia mais perto.`,
      highlight: false,
    },
  ];

  const fullSpokenText = `Meu nome é Osaias, seu assistente virtual. Olá, ${studentName}! Seja muito bem-vindo à nossa plataforma. Desejo a você excelentes estudos. Acredite sempre no seu potencial! Com dedicação e disciplina, a sua aprovação no Colégio Militar Tiradentes está cada dia mais perto!`;

  // Start speech synthesis
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (isMuted) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      // Try finding a natural pt-BR voice
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(
        (v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR') || v.lang.startsWith('pt')
      );
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(10);
      setCurrentStep(0);

      // Inicia a fala se não estiver silenciado
      const speechTimeout = setTimeout(() => {
        speakText(fullSpokenText);
      }, 400);

      // Passa as mensagens gradualmente
      const step1 = setTimeout(() => setCurrentStep(1), 2600);
      const step2 = setTimeout(() => setCurrentStep(2), 5200);

      // Countdown para auto-fechar
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(speechTimeout);
        clearTimeout(step1);
        clearTimeout(step2);
        if (timerRef.current) clearInterval(timerRef.current);
        stopSpeaking();
      };
    } else {
      stopSpeaking();
    }
  }, [isOpen]);

  const handleDismiss = () => {
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      speakText(fullSpokenText);
    } else {
      setIsMuted(true);
      stopSpeaking();
    }
  };

  const handleReplay = () => {
    setSecondsLeft(10);
    setCurrentStep(0);
    setTimeout(() => setCurrentStep(1), 2600);
    setTimeout(() => setCurrentStep(2), 5200);
    speakText(fullSpokenText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Container Centralizado */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Barra superior de contagem e ações */}
        <div className="relative bg-slate-950/90 px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Instrutor Osaias • CMT XVII
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Botão de voz / mudo */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Ativar voz de Osaias' : 'Silenciar voz'}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
              )}
            </button>

            {/* Repetir fala */}
            <button
              onClick={handleReplay}
              title="Ouvir novamente"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fechar imediatamente */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
              title="Fechar boas-vindas"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de progresso do auto-fechamento */}
        <div className="w-full bg-slate-800 h-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 10) * 100}%` }}
          />
        </div>

        {/* Corpo principal do Avatar e Balão de Fala */}
        <div className="p-6 text-center flex flex-col items-center">
          
          {/* Avatar com moldura militar dourada e pulso */}
          <div className="relative mb-5 group">
            {/* Halo de luz militar */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-full blur-md opacity-60 group-hover:opacity-100 animate-pulse transition duration-1000"></div>
            
            {/* Imagem do Avatar */}
            <div className="relative w-36 h-36 rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl bg-slate-800">
              <img
                src="/assets/aistudio/1792634685275_25b5af36.jpg"
                alt="Osaias - Assistente Virtual CMT XVII"
                className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Selo do Batalhão / Estrela */}
            <div className="absolute -bottom-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full shadow-lg border border-yellow-200 flex items-center gap-1">
              <Star className="w-3 h-3 fill-slate-950" />
              OSAIAS
            </div>
          </div>

          {/* Nome e Patente */}
          <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>Assistente Virtual Osaias</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-amber-400/90 font-medium mb-4 uppercase tracking-wider">
            Colégio Militar Tiradentes XVII • BALSAS - MA
          </p>

          {/* Balão de Fala Interativo */}
          <div className="w-full bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 shadow-inner text-left relative overflow-hidden">
            {/* Indicador de fala animada */}
            {isSpeaking && (
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce"></span>
              </div>
            )}

            {/* Etapa 1: "MEU NOME É OSAIAS, SEU ASSISTENTE VIRTUAL." */}
            <div className="mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1 border border-amber-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Apresentação Oficial
              </div>
              <p className="text-lg font-black text-amber-400 tracking-wide">
                “Meu nome é Osaias, seu assistente virtual.”
              </p>
            </div>

            {/* Etapa 2: Boas-vindas ao CMT */}
            <div className={`transition-opacity duration-500 ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <p className="text-sm text-slate-200 font-medium leading-relaxed mt-2">
                Seja muito bem-vindo(a), <strong className="text-white font-bold">{studentName}</strong>, à plataforma do Colégio Militar Tiradentes XVII!
              </p>
            </div>

            {/* Etapa 3: Desejo de bons estudos e potencial */}
            <div className={`transition-opacity duration-500 ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="mt-3 p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-medium">
                  <strong>Desejo a você excelentes estudos!</strong> Acredite sempre no seu potencial: com dedicação, disciplina e foco, a sua vaga e a sua farda estão cada dia mais perto!
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé interativo com botão de avançar e contagem regressiva */}
          <div className="mt-5 w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Fechando automaticamente em:</span>
              <strong className="text-amber-400 font-mono text-sm px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {secondsLeft}s
              </strong>
            </span>

            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition-all text-sm cursor-pointer"
            >
              <span>Vamos aos Estudos!</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
