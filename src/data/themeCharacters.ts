export interface AlienProfile {
  id: string;
  name: string;
  colorLabel: string;
  systemColorKey: string;
  alienSeries: 'Clássico' | 'Força Alienígena';
  species: string;
  powerColor: string;
  badgeBg: string;
  badgeText: string;
  borderGlow: string;
  cardSelectedBorder: string;
  cardSelectedBg: string;
  cardGlow: string;
  themeGradient: string;
  studyPower: string;
  quote: string;
  iconName: string;
  stats: {
    foco: number;
    velocidade: number;
    raciocinio: number;
    resistencia: number;
  };
}

export const BEN10_ALIENS: AlienProfile[] = [
  // 1. QUATRO BRAÇOS -> VERMELHO
  {
    id: 'quatro_bracos',
    name: 'Quatro Braços',
    colorLabel: 'Vermelho',
    systemColorKey: 'vermelho_heroi',
    alienSeries: 'Clássico',
    species: 'Tetramando de Khoros',
    powerColor: '#dc2626',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    borderGlow: 'border-red-500 ring-red-400',
    cardSelectedBorder: 'border-red-500',
    cardSelectedBg: 'bg-red-950/80',
    cardGlow: 'shadow-[0_0_20px_rgba(220,38,38,0.5)]',
    themeGradient: 'from-red-950 via-slate-950 to-red-950',
    studyPower: 'Super Força nos Simulados • Esmaga Questões Difíceis',
    quote: 'Quatro braços para gabaritar 4x mais rápido!',
    iconName: 'fourarms',
    stats: { foco: 95, velocidade: 75, raciocinio: 85, resistencia: 100 },
  },

  // 2. CHAMA -> LARANJA
  {
    id: 'chama',
    name: 'Chama',
    colorLabel: 'Laranja',
    systemColorKey: 'laranja_fogo',
    alienSeries: 'Clássico',
    species: 'Pyronita da Estrela Pyros',
    powerColor: '#ea580c',
    badgeBg: 'bg-orange-600',
    badgeText: 'text-white',
    borderGlow: 'border-orange-500 ring-orange-400',
    cardSelectedBorder: 'border-orange-500',
    cardSelectedBg: 'bg-orange-950/80',
    cardGlow: 'shadow-[0_0_20px_rgba(234,88,12,0.5)]',
    themeGradient: 'from-orange-950 via-slate-950 to-orange-950',
    studyPower: 'Fogo nos Estudos • Ritmo Acelerado de Revisão',
    quote: 'Minha concentração está pegando fogo total!',
    iconName: 'heatblast',
    stats: { foco: 90, velocidade: 85, raciocinio: 90, resistencia: 80 },
  },

  // 3. XLR8 -> AZUL
  {
    id: 'xlr8',
    name: 'XLR8',
    colorLabel: 'Azul',
    systemColorKey: 'militar_azul',
    alienSeries: 'Clássico',
    species: 'Kinecelerano de Kinet',
    powerColor: '#2563eb',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    borderGlow: 'border-blue-500 ring-blue-400',
    cardSelectedBorder: 'border-blue-500',
    cardSelectedBg: 'bg-blue-950/80',
    cardGlow: 'shadow-[0_0_20px_rgba(37,99,235,0.5)]',
    themeGradient: 'from-blue-950 via-slate-950 to-blue-950',
    studyPower: 'Super Velocidade • Bate Recordes de Tempo nas Provas',
    quote: 'Resolvendo frações na velocidade do som!',
    iconName: 'xlr8',
    stats: { foco: 85, velocidade: 100, raciocinio: 90, resistencia: 75 },
  },

  // 4. DIAMANTE -> VERDE
  {
    id: 'diamante',
    name: 'Diamante',
    colorLabel: 'Verde',
    systemColorKey: 'verde_aventura',
    alienSeries: 'Clássico',
    species: 'Petrosapien de Petropia',
    powerColor: '#16a34a',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    borderGlow: 'border-emerald-500 ring-emerald-400',
    cardSelectedBorder: 'border-emerald-500',
    cardSelectedBg: 'bg-emerald-950/80',
    cardGlow: 'shadow-[0_0_20px_rgba(22,163,74,0.5)]',
    themeGradient: 'from-emerald-950 via-slate-950 to-emerald-950',
    studyPower: 'Foco de Cristal • Defesa Total Contra Pegadinhas',
    quote: 'Nenhum erro de interpretação quebra meu foco!',
    iconName: 'diamondhead',
    stats: { foco: 100, velocidade: 70, raciocinio: 90, resistencia: 95 },
  },

  // 5. MASSA CINZENTA -> CINZA
  {
    id: 'massa_cinzenta',
    name: 'Massa Cinzenta',
    colorLabel: 'Cinza',
    systemColorKey: 'cinza_galvan',
    alienSeries: 'Clássico',
    species: 'Galvaniano de Galvan Prime',
    powerColor: '#64748b',
    badgeBg: 'bg-slate-600',
    badgeText: 'text-white',
    borderGlow: 'border-slate-400 ring-slate-400',
    cardSelectedBorder: 'border-slate-400',
    cardSelectedBg: 'bg-slate-900/90',
    cardGlow: 'shadow-[0_0_20px_rgba(100,116,139,0.5)]',
    themeGradient: 'from-slate-900 via-zinc-950 to-slate-900',
    studyPower: 'QI Galáctico • Domínio de Gramática & Lógica',
    quote: 'Inteligência galáctica aplicada ao edital CMT XVII!',
    iconName: 'greymatter',
    stats: { foco: 90, velocidade: 80, raciocinio: 100, resistencia: 70 },
  },

  // 6. FOGO FÁTUO -> VERMELHO ESCURO
  {
    id: 'fogo_fatuo',
    name: 'Fogo Fátuo',
    colorLabel: 'Vermelho Escuro',
    systemColorKey: 'vermelho_escuro',
    alienSeries: 'Força Alienígena',
    species: 'Metanosiano de Methanos',
    powerColor: '#991b1b',
    badgeBg: 'bg-rose-900',
    badgeText: 'text-white',
    borderGlow: 'border-rose-700 ring-rose-600',
    cardSelectedBorder: 'border-rose-600',
    cardSelectedBg: 'bg-rose-950/80',
    cardGlow: 'shadow-[0_0_20px_rgba(153,27,27,0.5)]',
    themeGradient: 'from-rose-950 via-red-950 to-rose-950',
    studyPower: 'Regeneração Contínua • Energia para Maratonas de Estudo',
    quote: 'Força alienígena renovada a cada exercício concluído!',
    iconName: 'swampfire',
    stats: { foco: 90, velocidade: 80, raciocinio: 85, resistencia: 95 },
  },

  // 7. ECO ECO -> VERDE CLARO
  {
    id: 'eco_eco',
    name: 'Eco Eco',
    colorLabel: 'Verde Claro',
    systemColorKey: 'verde_claro',
    alienSeries: 'Força Alienígena',
    species: 'Sonorosiano de Sonorosia',
    powerColor: '#84cc16',
    badgeBg: 'bg-lime-500',
    badgeText: 'text-slate-950',
    borderGlow: 'border-lime-400 ring-lime-400',
    cardSelectedBorder: 'border-lime-400',
    cardSelectedBg: 'bg-lime-950/80',
    cardGlow: 'shadow-[0_0_20px_rgba(132,204,22,0.5)]',
    themeGradient: 'from-lime-950 via-emerald-950 to-lime-950',
    studyPower: 'Multiplicação Sonora • Fixação Mnemônica de Conteúdo',
    quote: 'Multiplicando o conhecimento até a aprovação!',
    iconName: 'echoecho',
    stats: { foco: 85, velocidade: 85, raciocinio: 95, resistencia: 85 },
  },

  // 8. FRIAGEM -> AZUL CLARO
  {
    id: 'friagem',
    name: 'Friagem',
    colorLabel: 'Azul Claro',
    systemColorKey: 'azul_claro',
    alienSeries: 'Força Alienígena',
    species: 'Necrofriggiano de Kylmyys',
    powerColor: '#0284c7',
    badgeBg: 'bg-sky-500',
    badgeText: 'text-slate-950',
    borderGlow: 'border-sky-400 ring-sky-300',
    cardSelectedBorder: 'border-sky-400',
    cardSelectedBg: 'bg-sky-950/80',
    cardGlow: 'shadow-[0_0_20px_rgba(2,132,199,0.5)]',
    themeGradient: 'from-sky-950 via-cyan-950 to-sky-950',
    studyPower: 'Cabeça Fria & Intangibilidade • Calma Absoluta na Prova',
    quote: 'Frieza cirúrgica para marcar apenas as alternativas certas.',
    iconName: 'bigchill',
    stats: { foco: 95, velocidade: 90, raciocinio: 90, resistencia: 90 },
  },
];

export interface TeenCharacterProfile {
  id: string;
  name: string;
  title: string;
  category: 'boy_gamer' | 'girl_aesthetic';
  systemColorKey: string;
  powerColor: string;
  badgeBg: string;
  badgeText: string;
  borderGlow: string;
  quote: string;
  iconName: string;
  subtraits: string[];
}

export const TEEN_CHARACTERS: TeenCharacterProfile[] = [
  // Adolescente Meninos (Cyber Gamer Pro)
  {
    id: 'cyber_samurai',
    name: 'Cyber Samurai',
    title: 'Gamer Pro & Foco Tático',
    category: 'boy_gamer',
    systemColorKey: 'ciano_neon',
    powerColor: '#06b6d4',
    badgeBg: 'bg-cyan-500',
    badgeText: 'text-slate-950',
    borderGlow: 'border-cyan-400 ring-cyan-500/50',
    quote: 'Mira calibrada, foco tático: 100% no Edital CMT XVII!',
    iconName: 'cybersamurai',
    subtraits: ['144 FPS nos Estudos', 'Combo de Acertos', 'Headset RGB Ativo'],
  },
  {
    id: 'mecha_pilot',
    name: 'Piloto Mecha Titan',
    title: 'Estrategista Futurista',
    category: 'boy_gamer',
    systemColorKey: 'verde_aventura',
    powerColor: '#10b981',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-slate-950',
    borderGlow: 'border-emerald-400 ring-emerald-500/50',
    quote: 'Sistemas armados com fórmulas de matemática e gramática!',
    iconName: 'mechapilot',
    subtraits: ['Blindagem Anti-Erro', 'Overclock Cognitivo', 'Rank Mestre'],
  },
  // Adolescente Meninas (Aesthetic Girl & Y2K Pop)
  {
    id: 'starry_dreamer',
    name: 'Starry Dreamer',
    title: 'Aesthetic Girl & Fone Lilás',
    category: 'girl_aesthetic',
    systemColorKey: 'rosa_pastel',
    powerColor: '#ec4899',
    badgeBg: 'bg-gradient-to-r from-pink-500 to-purple-500',
    badgeText: 'text-white',
    borderGlow: 'border-pink-300 ring-purple-300/60',
    quote: 'Caderno impecável, playlist relax e notas nas estrelas ✨',
    iconName: 'starrygirl',
    subtraits: ['Study Glow ✨', 'Playlist Lo-Fi', 'Lettering Perfeito'],
  },
  {
    id: 'butterfly_pop',
    name: 'Borboleta Y2K',
    title: 'Pop Star & Criatividade',
    category: 'girl_aesthetic',
    systemColorKey: 'roxo_galactico',
    powerColor: '#a855f7',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    borderGlow: 'border-purple-300 ring-pink-300/60',
    quote: 'Estudar com estilo e brilhar na lista de aprovados do CMT XVII!',
    iconName: 'butterflyy2k',
    subtraits: ['Vibe Holográfica', 'Metas Coloridas', 'Brilho Supremo'],
  },
];
