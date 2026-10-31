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
  const [secondsLeft, setSecondsLeft] = useState(14);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const studentName = currentUser?.full_name?.split(' ')[0] || currentUser?.username || 'Estudante';

  // O texto exato exigido pelo usuário:
  // "ANTES DE DAR BOAS VINDAS, ELE DIRÁ: MEU NOME É OSAIAS, SEU ASSISTENTE VIRTUAL."
  // Dando boas-vindas, desejando bons estudos e dizendo para acreditarem no seu potencial.
  // E informando aos alunos que o sistema possui mais questões para serem resolvidas.
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
    {
      badge: 'Simulado de 60 Questões',
      text: `Atenção: o Simulado do CMT agora possui 60 questões completas (30 de Português e 30 de Matemática)! Se errar, explicamos exatamente o porquê para você aprender.`,
      highlight: true,
    },
  ];

  const fullSpokenText = `Meu nome é Osaias, seu assistente virtual. Olá, ${studentName}! Seja muito bem-vindo à nossa plataforma. Desejo a você excelentes estudos e acredite sempre no seu potencial! Atenção: o simulado do Colégio Militar agora possui sessenta questões comentadas com trinta de Português e trinta de Matemática, com explicação detalhada para cada erro. Bons estudos rumo à aprovação!`;

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Carrega e atualiza vozes em tempo real (essencial para dispositivos móveis Android e iOS)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const vList = window.speechSynthesis.getVoices();
        if (vList && vList.length > 0) {
          setAvailableVoices(vList);
        }
      } catch (err) {
        console.warn('Erro ao listar vozes:', err);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Seleciona com rigor a melhor voz masculina em português do dispositivo
  const findDeepMasculineVoice = (voiceList: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voiceList || voiceList.length === 0) return null;

    const ptVoices = voiceList.filter((v) => {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith('pt') || l.includes('por') || l.includes('brazil');
    });

    const pool = ptVoices.length > 0 ? ptVoices : voiceList;

    // Palavras-chave masculinas reconhecidas em Android, Windows, iOS, Mac e Linux
    const maleKeywords = [
      'daniel',       // Microsoft Daniel (Windows pt-BR masculino)
      'felipe',       // Apple Felipe (iOS / macOS pt-BR masculino)
      'antonio',      // Microsoft Antonio (Windows pt-BR masculino)
      'jorge',        // Android / Apple Jorge
      'ricardo',      // Ricardo masculino
      'arthur',       // Apple Arthur
      'pt-br-x-jab',  // Google TTS Android Masculino 1
      'pt-br-x-yab',  // Google TTS Android Masculino 2
      'pt-br-x-afb',  // Google TTS Android Masculino 3
      'pt-br-x-jbb',  // Google TTS Android Masculino 4
      'male',         // Palavra-chave Male
      'homem',        // Palavra-chave Homem
      'masculin',     // Palavra-chave Masculino
    ];

    // Nomes femininos expressamente evitados
    const femaleKeywords = [
      'maria',
      'luciana',
      'fernanda',
      'francisca',
      'helena',
      'yara',
      'leticia',
      'thalita',
      'vitoria',
      'female',
      'mulher',
      'feminina',
      'woman',
      'zira',
      'pt-br-x-afs',
      'pt-br-x-yda',
      'pt-br-x-afc',
    ];

    // 1ª Tentativa: Encontrar voz masculina por palavra-chave conhecida
    for (const kw of maleKeywords) {
      const match = pool.find((v) => {
        const full = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
        const isFem = femaleKeywords.some((fk) => full.includes(fk));
        return full.includes(kw) && !isFem;
      });
      if (match) return match;
    }

    // 2ª Tentativa: Qualquer voz em português que não contenha palavras femininas
    const nonFemalePt = ptVoices.find((v) => {
      const full = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
      return !femaleKeywords.some((fk) => full.includes(fk));
    });
    if (nonFemalePt) return nonFemalePt;

    // 3ª Tentativa: Primeira voz brasileira
    const ptBr = ptVoices.find((v) => (v.lang || '').toLowerCase().includes('br'));
    if (ptBr) return ptBr;

    return ptVoices[0] || voiceList[0] || null;
  };

  // Inicia fala com voz masculina grave em todos os dispositivos
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (isMuted) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      
      // PARÂMETROS DE VOZ MASCULINA GRAVE (Mobile Android/iOS e Computador)
      // pitch = 0.72 reduz a frequência fundamental criando o tom barítono/grave viril
      utterance.pitch = 0.72;
      // rate = 0.94 confere autoridade militar firme, cadenciada e pausada
      utterance.rate = 0.94;
      utterance.volume = 1.0;

      const currentVoices = window.speechSynthesis.getVoices();
      const voiceToUse = findDeepMasculineVoice(currentVoices.length > 0 ? currentVoices : availableVoices);
      if (voiceToUse) {
        utterance.voice = voiceToUse;
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
      setSecondsLeft(14);
      setCurrentStep(0);

      // Inicia a fala se não estiver silenciado
      const speechTimeout = setTimeout(() => {
        speakText(fullSpokenText);
      }, 400);

      // Passa as mensagens gradualmente
      const step1 = setTimeout(() => setCurrentStep(1), 2200);
      const step2 = setTimeout(() => setCurrentStep(2), 4600);
      const step3 = setTimeout(() => setCurrentStep(3), 7200);

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
        clearTimeout(step3);
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

  const handleGoToSimulados = () => {
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    if (onGoToSimulados) {
      onGoToSimulados();
    } else {
      onClose();
    }
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
    setSecondsLeft(14);
    setCurrentStep(0);
    setTimeout(() => setCurrentStep(1), 2200);
    setTimeout(() => setCurrentStep(2), 4600);
    setTimeout(() => setCurrentStep(3), 7200);
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
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Voz Masculina Grave
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Botão de voz / mudo */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Ativar voz masculina grave de Osaias' : 'Silenciar voz'}
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
              title="Ouvir novamente com voz masculina grave"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
            style={{ width: `${(secondsLeft / 14) * 100}%` }}
          />
        </div>

        {/* Corpo principal do Avatar e Balão de Fala */}
        <div className="p-6 text-center flex flex-col items-center">
          
          {/* Avatar com moldura militar dourada e pulso */}
          <div className="relative mb-3 group cursor-pointer" onClick={handleReplay} title="Clique para ouvir o Instrutor Osaias">
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
          <button
            onClick={handleReplay}
            className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Clique para reproduzir o áudio com a voz masculina grave"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
            <span>{isSpeaking ? 'Instrutor Osaias Falando...' : '🔊 Ouvir Voz do Instrutor Osaias'}</span>
          </button>

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

            {/* Etapa 4: Informação sobre novas questões no sistema */}
            <div className={`transition-opacity duration-500 ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/20 via-blue-900/30 to-amber-500/10 rounded-xl border-2 border-amber-400/60 flex items-start gap-2.5 shadow-md">
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
