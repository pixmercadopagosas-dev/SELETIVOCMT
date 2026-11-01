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
  Play,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface WelcomeAvatarOsaiasProps {
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onGoToSimulados?: () => void;
}

export const WelcomeAvatarOsaias: React.FC<WelcomeAvatarOsaiasProps> = ({
  currentUser,
  isOpen,
  onClose,
  onGoToSimulados,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(40);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const studentName = currentUser?.full_name?.split(' ')[0] || currentUser?.username || 'Estudante';

  // Parar qualquer áudio ativo
  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        console.warn('Erro ao pausar áudio:', e);
      }
    }
    setIsSpeaking(false);
  };

  // Reproduzir áudio com voz masculina grave
  const playAudio = async () => {
    try {
      if (!audioRef.current) {
        const audio = new Audio('/audio/osaias-welcome.wav');
        audio.preload = 'auto';

        audio.onplay = () => {
          setIsSpeaking(true);
          setAutoplayBlocked(false);
        };

        audio.onpause = () => {
          setIsSpeaking(false);
        };

        audio.onended = () => {
          setIsSpeaking(false);
        };

        // Sincroniza os passos da fala em tempo real com o áudio
        audio.ontimeupdate = () => {
          const t = audio.currentTime;
          if (t < 4.2) {
            setCurrentStep(0);
          } else if (t < 10.8) {
            setCurrentStep(1);
          } else if (t < 21.0) {
            setCurrentStep(2);
          } else {
            setCurrentStep(3);
          }
        };

        // Fallback para rota de API se o estático falhar
        audio.onerror = async () => {
          console.warn('Tentando rota alternativa de áudio /api/tts/osaias-audio.wav');
          try {
            audio.src = '/api/tts/osaias-audio.wav';
            await audio.play();
          } catch (err) {
            console.warn('Erro ao reproduzir via API alternativa:', err);
          }
        };

        audioRef.current = audio;
      }

      audioRef.current.muted = isMuted;
      audioRef.current.volume = isMuted ? 0 : 1;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        setAutoplayBlocked(false);
      }
    } catch (err: any) {
      console.log('Autoplay bloqueado pelo navegador do dispositivo (requer toque do usuário):', err);
      setAutoplayBlocked(true);
      setIsSpeaking(false);
    }
  };

  // Ciclo de vida ao abrir/fechar o modal
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(40);
      setCurrentStep(0);
      setAutoplayBlocked(false);

      // Inicia áudio com a voz masculina grave (Fenrir)
      const startTimer = setTimeout(() => {
        playAudio();
      }, 350);

      // Timer regressivo para auto-fechamento
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
        clearTimeout(startTimer);
        if (timerRef.current) clearInterval(timerRef.current);
        stopAudio();
      };
    } else {
      stopAudio();
    }
  }, [isOpen]);

  const handleDismiss = () => {
    stopAudio();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const handleGoToSimulados = () => {
    stopAudio();
    if (timerRef.current) clearInterval(timerRef.current);
    if (onGoToSimulados) {
      onGoToSimulados();
    } else {
      onClose();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
        audioRef.current.volume = 1;
        if (audioRef.current.paused) {
          playAudio();
        }
      } else {
        setIsMuted(true);
        audioRef.current.muted = true;
        audioRef.current.volume = 0;
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = () => {
    setSecondsLeft(40);
    setCurrentStep(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      playAudio();
    } else {
      playAudio();
    }
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
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Voz Masculina Grave (Fenrir)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Botão de voz / mudo */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Ativar voz masculina grave de Osaias' : 'Silenciar voz'}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
              title="Ouvir novamente com a voz masculina grave"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fechar imediatamente */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
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
            style={{ width: `${(secondsLeft / 40) * 100}%` }}
          />
        </div>

        {/* Corpo principal do Avatar e Balão de Fala */}
        <div className="p-6 text-center flex flex-col items-center">
          
          {/* Avatar com moldura militar dourada e pulso */}
          <div
            className="relative mb-3 group cursor-pointer"
            onClick={handleReplay}
            title="Clique para ouvir a voz masculina do Instrutor Osaias"
          >
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
            <div className="absolute -bottom-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full shadow-lg border border-yellow-200 flex items-center gap-1 left-1/2 -translate-x-1/2">
              <Star className="w-3 h-3 fill-slate-950" />
              OSAIAS
            </div>
          </div>

          {/* Botão de acionamento de áudio para dispositivos móveis e desktop */}
          {autoplayBlocked ? (
            <button
              onClick={handleReplay}
              className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-full text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/30 animate-pulse active:scale-95"
              title="Toque para ouvir a voz masculina grave"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>🔊 Toque para Ouvir a Voz Masculina Grave</span>
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Clique para reproduzir o áudio com a voz masculina grave"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
              <span>{isSpeaking ? 'Instrutor Osaias Falando...' : '🔊 Ouvir Voz do Instrutor Osaias'}</span>
            </button>
          )}

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
            <div className={`transition-opacity duration-300 ${currentStep === 0 ? 'opacity-100 ring-1 ring-amber-500/40 rounded-xl p-2 bg-amber-500/10' : 'opacity-90'}`}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1 border border-amber-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Apresentação Oficial
              </div>
              <p className="text-lg font-black text-amber-400 tracking-wide">
                “Meu nome é Osaias, seu assistente virtual.”
              </p>
            </div>

            {/* Etapa 2: Boas-vindas ao CMT */}
            <div className={`mt-2 transition-all duration-300 ${currentStep === 1 ? 'ring-1 ring-amber-500/40 rounded-xl p-2 bg-amber-500/10 opacity-100' : currentStep > 1 ? 'opacity-90' : 'opacity-40'}`}>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                Seja muito bem-vindo(a), <strong className="text-white font-bold">{studentName}</strong>, à plataforma do Colégio Militar Tiradentes XVII!
              </p>
            </div>

            {/* Etapa 3: Desejo de bons estudos e potencial */}
            <div className={`mt-2 transition-all duration-300 ${currentStep === 2 ? 'ring-1 ring-emerald-500/40 rounded-xl p-2 bg-emerald-500/10 opacity-100' : currentStep > 2 ? 'opacity-90' : 'opacity-40'}`}>
              <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-medium">
                  <strong>Desejo a você excelentes estudos!</strong> Acredite sempre no seu potencial: com dedicação, disciplina e foco, a sua vaga e a sua farda estão cada dia mais perto!
                </p>
              </div>
            </div>

            {/* Etapa 4: Informação sobre novas questões no sistema */}
            <div className={`mt-2 transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-amber-400 rounded-xl p-2 bg-amber-500/15 opacity-100' : 'opacity-40'}`}>
              <div className="p-3 bg-gradient-to-r from-amber-500/20 via-blue-900/30 to-amber-500/10 rounded-xl border-2 border-amber-400/60 flex items-start gap-2.5 shadow-md">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                    📢 Simulado Oficial Completo (60 Questões)
                  </span>
                  <p className="text-xs sm:text-sm text-white leading-snug font-semibold">
                    O Simulado Oficial do CMT agora possui <strong className="text-yellow-300 underline font-black">60 questões completas</strong> (30 de Língua Portuguesa e 30 de Matemática)!
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Se errar alguma opção, o sistema explica o motivo exato do erro para você aprender com excelência.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé interativo com botões de ação e contagem regressiva */}
          <div className="mt-5 w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 order-2 sm:order-1">
              <span>Fechando em:</span>
              <strong className="text-amber-400 font-mono text-sm px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {secondsLeft}s
              </strong>
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={handleGoToSimulados}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transform active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Ver Simulado Completo (60Q)</span>
              </button>

              <button
                onClick={handleDismiss}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors text-xs sm:text-sm cursor-pointer"
                title="Fechar e ir ao painel"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
