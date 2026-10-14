import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BEN10_ALIENS,
  TEEN_CHARACTERS,
  AlienProfile,
  TeenCharacterProfile,
} from '../data/themeCharacters';

export type SystemColor =
  | 'militar_azul'      // Azul (XLR8 e Oficial)
  | 'vermelho_heroi'    // Vermelho (Quatro Braços)
  | 'laranja_fogo'      // Laranja (Chama)
  | 'verde_aventura'    // Verde (Diamante)
  | 'cinza_galvan'      // Cinza (Massa Cinzenta)
  | 'vermelho_escuro'   // Vermelho Escuro (Fogo Fátuo)
  | 'verde_claro'       // Verde Claro (Eco Eco)
  | 'azul_claro'        // Azul Claro (Friagem)
  | 'ciano_neon'        // Ciano (Cyber Gamer)
  | 'rosa_pastel'       // Rosa (Aesthetic Girl)
  | 'roxo_galactico'
  | 'dourado_campeao';

export type CartoonTheme =
  | 'nenhum'
  | 'ben10_alien'
  | 'cyber_gamer_boy'
  | 'aesthetic_y2k_girl'
  | 'pokemon_master'
  | 'minecraft_craft'
  | 'super_herois'
  | 'ninja_shonen';

export type ThemeCategory = 'official' | 'cartoon' | 'teen';

export interface ThemeConfig {
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  accentBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
  ringColor: string;
  hex: string;
}

export const COLOR_PRESETS: Record<SystemColor, { label: string; previewHex: string; config: ThemeConfig }> = {
  // XLR8 e Padrão Militar
  militar_azul: {
    label: 'Azul (XLR8 / Militar)',
    previewHex: '#2563eb',
    config: {
      primaryBg: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      primaryText: 'text-blue-600',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-300',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-950',
      glowColor: 'shadow-blue-500/25',
      ringColor: 'ring-blue-400',
      hex: '#2563eb',
    },
  },
  // Quatro Braços
  vermelho_heroi: {
    label: 'Vermelho (Quatro Braços)',
    previewHex: '#dc2626',
    config: {
      primaryBg: 'bg-red-600',
      primaryHover: 'hover:bg-red-700',
      primaryText: 'text-red-600',
      accentBg: 'bg-red-50',
      accentBorder: 'border-red-300',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-950',
      glowColor: 'shadow-red-500/25',
      ringColor: 'ring-red-400',
      hex: '#dc2626',
    },
  },
  // Chama
  laranja_fogo: {
    label: 'Laranja (Chama)',
    previewHex: '#ea580c',
    config: {
      primaryBg: 'bg-orange-600',
      primaryHover: 'hover:bg-orange-700',
      primaryText: 'text-orange-600',
      accentBg: 'bg-orange-50',
      accentBorder: 'border-orange-300',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-950',
      glowColor: 'shadow-orange-500/25',
      ringColor: 'ring-orange-400',
      hex: '#ea580c',
    },
  },
  // Diamante
  verde_aventura: {
    label: 'Verde (Diamante)',
    previewHex: '#16a34a',
    config: {
      primaryBg: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      primaryText: 'text-emerald-600',
      accentBg: 'bg-emerald-50',
      accentBorder: 'border-emerald-300',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-950',
      glowColor: 'shadow-emerald-500/25',
      ringColor: 'ring-emerald-400',
      hex: '#16a34a',
    },
  },
  // Massa Cinzenta
  cinza_galvan: {
    label: 'Cinza (Massa Cinzenta)',
    previewHex: '#64748b',
    config: {
      primaryBg: 'bg-slate-700',
      primaryHover: 'hover:bg-slate-800',
      primaryText: 'text-slate-700',
      accentBg: 'bg-slate-100',
      accentBorder: 'border-slate-300',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-900',
      glowColor: 'shadow-slate-500/25',
      ringColor: 'ring-slate-400',
      hex: '#64748b',
    },
  },
  // Fogo Fátuo
  vermelho_escuro: {
    label: 'Vermelho Escuro (Fogo Fátuo)',
    previewHex: '#881337',
    config: {
      primaryBg: 'bg-rose-900',
      primaryHover: 'hover:bg-rose-950',
      primaryText: 'text-rose-900',
      accentBg: 'bg-rose-50',
      accentBorder: 'border-rose-300',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-950',
      glowColor: 'shadow-rose-900/30',
      ringColor: 'ring-rose-500',
      hex: '#881337',
    },
  },
  // Eco Eco
  verde_claro: {
    label: 'Verde Claro (Eco Eco)',
    previewHex: '#84cc16',
    config: {
      primaryBg: 'bg-lime-600',
      primaryHover: 'hover:bg-lime-700',
      primaryText: 'text-lime-700',
      accentBg: 'bg-lime-50',
      accentBorder: 'border-lime-300',
      badgeBg: 'bg-lime-100',
      badgeText: 'text-lime-950',
      glowColor: 'shadow-lime-500/25',
      ringColor: 'ring-lime-400',
      hex: '#84cc16',
    },
  },
  // Friagem
  azul_claro: {
    label: 'Azul Claro (Friagem)',
    previewHex: '#0284c7',
    config: {
      primaryBg: 'bg-sky-500',
      primaryHover: 'hover:bg-sky-600',
      primaryText: 'text-sky-600',
      accentBg: 'bg-sky-50',
      accentBorder: 'border-sky-300',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-950',
      glowColor: 'shadow-sky-400/25',
      ringColor: 'ring-sky-300',
      hex: '#0284c7',
    },
  },
  // Cyber Gamer
  ciano_neon: {
    label: 'Ciano Cyber Gamer',
    previewHex: '#06b6d4',
    config: {
      primaryBg: 'bg-cyan-600',
      primaryHover: 'hover:bg-cyan-500',
      primaryText: 'text-cyan-600',
      accentBg: 'bg-cyan-50',
      accentBorder: 'border-cyan-300',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-950',
      glowColor: 'shadow-cyan-500/25',
      ringColor: 'ring-cyan-400',
      hex: '#06b6d4',
    },
  },
  // Aesthetic Girl
  rosa_pastel: {
    label: 'Rosa Aesthetic & Y2K',
    previewHex: '#ec4899',
    config: {
      primaryBg: 'bg-pink-600',
      primaryHover: 'hover:bg-pink-500',
      primaryText: 'text-pink-600',
      accentBg: 'bg-pink-50',
      accentBorder: 'border-pink-300',
      badgeBg: 'bg-pink-100',
      badgeText: 'text-pink-950',
      glowColor: 'shadow-pink-500/25',
      ringColor: 'ring-pink-400',
      hex: '#ec4899',
    },
  },
  roxo_galactico: {
    label: 'Roxo Galáctico',
    previewHex: '#7c3aed',
    config: {
      primaryBg: 'bg-purple-700',
      primaryHover: 'hover:bg-purple-600',
      primaryText: 'text-purple-700',
      accentBg: 'bg-purple-50',
      accentBorder: 'border-purple-300',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-950',
      glowColor: 'shadow-purple-500/20',
      ringColor: 'ring-purple-400',
      hex: '#7c3aed',
    },
  },
  dourado_campeao: {
    label: 'Dourado Campeão de Ouro',
    previewHex: '#d97706',
    config: {
      primaryBg: 'bg-amber-500',
      primaryHover: 'hover:bg-amber-400',
      primaryText: 'text-amber-800',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-300',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-950',
      glowColor: 'shadow-amber-500/20',
      ringColor: 'ring-amber-400',
      hex: '#d97706',
    },
  },
};

export interface CartoonThemeDetails {
  name: string;
  category: ThemeCategory;
  targetAudience?: string;
  iconEmoji: string;
  iconName: string;
  description: string;
  motto: string;
  cardStyle: string;
  badgeStyle: string;
  bannerGradient: string;
  accentColor: string;
}

export const CARTOON_THEMES: Record<CartoonTheme, CartoonThemeDetails> = {
  nenhum: {
    name: 'Padrão Oficial CMT XVII',
    category: 'official',
    targetAudience: 'Todos os Alunos',
    iconEmoji: '🎖️',
    iconName: 'official',
    description: 'Visual oficial, equilibrado e elegante do Colégio Militar Tiradentes.',
    motto: 'Honra, Disciplina e Excelência!',
    cardStyle: 'border-slate-200 bg-white',
    badgeStyle: 'bg-blue-100 text-blue-900',
    bannerGradient: 'from-blue-950 via-blue-900 to-slate-900',
    accentColor: '#1e3a8a',
  },
  ben10_alien: {
    name: 'Ben 10 & Força Alienígena',
    category: 'cartoon',
    targetAudience: 'Infantil & Aventura',
    iconEmoji: '👽',
    iconName: 'omnitrix',
    description: 'Omnitrix ativo: 8 alienígenas com poderes e cores dinâmicas no sistema todo!',
    motto: 'Hora de Virar Herói nos Estudos!',
    cardStyle: 'border-emerald-400 bg-emerald-950/5 ring-1 ring-emerald-400/50',
    badgeStyle: 'bg-emerald-500 text-black font-black shadow-emerald-500/30 shadow-md',
    bannerGradient: 'from-emerald-950 via-slate-950 to-emerald-950',
    accentColor: '#22c55e',
  },
  cyber_gamer_boy: {
    name: 'Cyberpunk Gamer Pro',
    category: 'teen',
    targetAudience: 'Adolescente (Meninos)',
    iconEmoji: '🎮',
    iconName: 'cybersamurai',
    description: 'Inspirado em Esports & Cyberpunk: HUD neon ciano, 144 FPS nos estudos e modo pro gamer.',
    motto: 'Foco Nível Lendário • Vitória no Edital!',
    cardStyle: 'border-cyan-500/80 bg-slate-950/10 ring-1 ring-cyan-400/50',
    badgeStyle: 'bg-cyan-500 text-slate-950 font-black shadow-cyan-500/30 shadow-md',
    bannerGradient: 'from-slate-950 via-cyan-950 to-slate-950',
    accentColor: '#06b6d4',
  },
  aesthetic_y2k_girl: {
    name: 'Aesthetic Girl & Y2K Pop',
    category: 'teen',
    targetAudience: 'Adolescente (Meninas)',
    iconEmoji: '✨',
    iconName: 'starrygirl',
    description: 'Vibe Pinterest & Y2K: paleta lavanda & rosa, borboletas holográficas e estudos com estilo.',
    motto: 'Estudo com Brilho • Sucesso com Estilo!',
    cardStyle: 'border-pink-300 bg-pink-50/20 ring-1 ring-purple-300/50',
    badgeStyle: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-pink-500/30 shadow-md',
    bannerGradient: 'from-purple-950 via-pink-950 to-slate-950',
    accentColor: '#ec4899',
  },
  pokemon_master: {
    name: 'Mestre Pokémon',
    category: 'cartoon',
    targetAudience: 'Infantil & Jogos',
    iconEmoji: '⚡',
    iconName: 'pokemon',
    description: 'Inspirado em Pikachu & Ash: amarelo elétrico, insígnias de aprovação e pokébolas!',
    motto: 'Temos que Aprender Todos!',
    cardStyle: 'border-yellow-400 bg-yellow-50/20 ring-1 ring-yellow-400/50',
    badgeStyle: 'bg-amber-400 text-amber-950 font-black shadow-amber-400/30 shadow-md',
    bannerGradient: 'from-amber-950 via-red-950 to-slate-900',
    accentColor: '#f59e0b',
  },
  minecraft_craft: {
    name: 'Minecraft & Explorador de Blocos',
    category: 'cartoon',
    targetAudience: 'Infantil & Criativo',
    iconEmoji: '⛏️',
    iconName: 'minecraft',
    description: 'Inspirado no universo dos blocos: esmeraldas de sabedoria, diamantes e aventura!',
    motto: 'Construindo o Saber Bloco a Bloco!',
    cardStyle: 'border-emerald-600 bg-stone-50 ring-2 ring-emerald-700/20',
    badgeStyle: 'bg-emerald-700 text-white font-black shadow-emerald-700/30 shadow-md',
    bannerGradient: 'from-emerald-950 via-stone-900 to-green-950',
    accentColor: '#059669',
  },
  super_herois: {
    name: 'Liga dos Super-Heróis',
    category: 'cartoon',
    targetAudience: 'Infantil & Quadrinhos',
    iconEmoji: '🛡️',
    iconName: 'hero',
    description: 'Inspirado em quadrinhos: capas, escudos, raios e heroísmo militar!',
    motto: 'Com Grandes Estudos Vêm Grandes Notas!',
    cardStyle: 'border-red-400 bg-blue-50/20 ring-1 ring-red-500/30',
    badgeStyle: 'bg-red-600 text-white font-black shadow-red-600/30 shadow-md',
    bannerGradient: 'from-blue-950 via-red-950 to-slate-950',
    accentColor: '#dc2626',
  },
  ninja_shonen: {
    name: 'Guerreiro Ninja Shonen',
    category: 'cartoon',
    targetAudience: 'Ação & Anime',
    iconEmoji: '🥷',
    iconName: 'ninja',
    description: 'Inspirado em mangás e animes de ação: chama, perseverança e jutsus da sabedoria.',
    motto: 'Nunca Desista do Seu Caminho de Estudos!',
    cardStyle: 'border-orange-400 bg-orange-50/15 ring-1 ring-orange-500/30',
    badgeStyle: 'bg-orange-600 text-white font-black shadow-orange-600/30 shadow-md',
    bannerGradient: 'from-orange-950 via-zinc-950 to-slate-950',
    accentColor: '#ea580c',
  },
};

interface ThemeContextType {
  currentColor: SystemColor;
  currentCartoon: CartoonTheme;
  colorConfig: ThemeConfig;
  cartoonConfig: CartoonThemeDetails;
  selectedAlienId: string;
  activeAlienProfile: AlienProfile;
  selectedTeenId: string;
  activeTeenProfile: TeenCharacterProfile;
  isOmnitrixTransforming: boolean;
  setColor: (color: SystemColor) => void;
  setCartoon: (cartoon: CartoonTheme) => void;
  setSelectedAlienId: (alienId: string) => void;
  setSelectedTeenId: (id: string) => void;
  transformOmnitrix: (alienId: string) => void;
}

const defaultAlien = BEN10_ALIENS[2]; // XLR8 como padrão
const defaultTeen = TEEN_CHARACTERS[0]; // Cyber Samurai

const ThemeContext = createContext<ThemeContextType>({
  currentColor: 'militar_azul',
  currentCartoon: 'ben10_alien',
  colorConfig: COLOR_PRESETS.militar_azul.config,
  cartoonConfig: CARTOON_THEMES.ben10_alien,
  selectedAlienId: defaultAlien.id,
  activeAlienProfile: defaultAlien,
  selectedTeenId: defaultTeen.id,
  activeTeenProfile: defaultTeen,
  isOmnitrixTransforming: false,
  setColor: () => {},
  setCartoon: () => {},
  setSelectedAlienId: () => {},
  setSelectedTeenId: () => {},
  transformOmnitrix: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAlienId, setSelectedAlienIdState] = useState<string>(() => {
    return localStorage.getItem('cmt_theme_alien') || 'xlr8';
  });

  const [currentCartoon, setCurrentCartoon] = useState<CartoonTheme>(() => {
    return (localStorage.getItem('cmt_theme_cartoon') as CartoonTheme) || 'ben10_alien';
  });

  const [selectedTeenId, setSelectedTeenIdState] = useState<string>(() => {
    return localStorage.getItem('cmt_theme_teen') || 'cyber_samurai';
  });

  const activeAlienProfile =
    BEN10_ALIENS.find((a) => a.id === selectedAlienId) || BEN10_ALIENS[2];

  const activeTeenProfile =
    TEEN_CHARACTERS.find((t) => t.id === selectedTeenId) || TEEN_CHARACTERS[0];

  // Determina a cor inicial com base no alienígena selecionado se estiver em Ben 10
  const [currentColor, setCurrentColor] = useState<SystemColor>(() => {
    const saved = localStorage.getItem('cmt_theme_color') as SystemColor;
    if (saved && COLOR_PRESETS[saved]) return saved;
    return (activeAlienProfile.systemColorKey as SystemColor) || 'militar_azul';
  });

  const [isOmnitrixTransforming, setIsOmnitrixTransforming] = useState(false);

  const colorConfig = COLOR_PRESETS[currentColor]?.config || COLOR_PRESETS.militar_azul.config;
  const cartoonConfig = CARTOON_THEMES[currentCartoon] || CARTOON_THEMES.ben10_alien;

  // Atualiza variáveis CSS nativas no :root para que toda a interface reaja à cor do alien
  useEffect(() => {
    const root = document.documentElement;
    const activeColorHex =
      currentCartoon === 'ben10_alien'
        ? activeAlienProfile.powerColor
        : currentCartoon === 'cyber_gamer_boy'
        ? '#06b6d4'
        : currentCartoon === 'aesthetic_y2k_girl'
        ? '#ec4899'
        : colorConfig.hex;

    root.style.setProperty('--cmt-primary-color', activeColorHex);
    root.style.setProperty('--cmt-glow-color', `${activeColorHex}40`);
  }, [currentColor, currentCartoon, activeAlienProfile, colorConfig]);

  const handleSetColor = (color: SystemColor) => {
    setCurrentColor(color);
    localStorage.setItem('cmt_theme_color', color);
  };

  const handleSetCartoon = (cartoon: CartoonTheme) => {
    setCurrentCartoon(cartoon);
    localStorage.setItem('cmt_theme_cartoon', cartoon);

    // Se mudou para Ben 10, sincroniza imediatamente com a cor do alien ativo
    if (cartoon === 'ben10_alien') {
      handleSetColor(activeAlienProfile.systemColorKey as SystemColor);
    } else if (cartoon === 'cyber_gamer_boy') {
      handleSetColor('ciano_neon');
    } else if (cartoon === 'aesthetic_y2k_girl') {
      handleSetColor('rosa_pastel');
    }
  };

  const handleSetAlien = (alienId: string) => {
    setSelectedAlienIdState(alienId);
    localStorage.setItem('cmt_theme_alien', alienId);

    // MUDANÇA AUTOMÁTICA DA COR DO SISTEMA DE ACORDO COM O ALIEN ESCOLHIDO
    const alien = BEN10_ALIENS.find((a) => a.id === alienId);
    if (alien && alien.systemColorKey && COLOR_PRESETS[alien.systemColorKey as SystemColor]) {
      handleSetColor(alien.systemColorKey as SystemColor);
    }
  };

  const handleSetTeen = (teenId: string) => {
    setSelectedTeenIdState(teenId);
    localStorage.setItem('cmt_theme_teen', teenId);

    const teen = TEEN_CHARACTERS.find((t) => t.id === teenId);
    if (teen && teen.systemColorKey && COLOR_PRESETS[teen.systemColorKey as SystemColor]) {
      handleSetColor(teen.systemColorKey as SystemColor);
    }
  };

  const transformOmnitrix = (alienId: string) => {
    setIsOmnitrixTransforming(true);
    handleSetAlien(alienId);
    setTimeout(() => {
      setIsOmnitrixTransforming(false);
    }, 1200);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentColor,
        currentCartoon,
        colorConfig,
        cartoonConfig,
        selectedAlienId,
        activeAlienProfile,
        selectedTeenId,
        activeTeenProfile,
        isOmnitrixTransforming,
        setColor: handleSetColor,
        setCartoon: handleSetCartoon,
        setSelectedAlienId: handleSetAlien,
        setSelectedTeenId: handleSetTeen,
        transformOmnitrix,
      }}
    >
      <div
        className={`theme-${currentColor} cartoon-${currentCartoon} transition-all duration-300 min-h-screen`}
        style={{
          ['--alien-accent' as any]: activeAlienProfile.powerColor,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
