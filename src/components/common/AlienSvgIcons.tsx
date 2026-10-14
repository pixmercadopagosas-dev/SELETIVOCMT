import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

// 🟢 Omnitrix Simbólico Oficial do Ben 10 (Ampulheta Verde Neon + Anéis de Aço)
export const OmnitrixDialIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size, glow = true }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} ${glow ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.85)]' : ''}`}
    style={size ? { width: size, height: size } : {}}
  >
    {/* Base do relógio / Aro de metal escuro */}
    <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#334155" strokeWidth="4" />
    <circle cx="50" cy="50" r="42" fill="#1e293b" stroke="#000000" strokeWidth="3" />
    
    {/* Botões laterais do Omnitrix */}
    <rect x="0" y="44" width="7" height="12" rx="2" fill="#22c55e" />
    <rect x="93" y="44" width="7" height="12" rx="2" fill="#22c55e" />
    <rect x="44" y="0" width="12" height="7" rx="2" fill="#64748b" />
    <rect x="44" y="93" width="12" height="7" rx="2" fill="#64748b" />

    {/* Disco central giratório */}
    <circle cx="50" cy="50" r="34" fill="#022c22" stroke="#22c55e" strokeWidth="2.5" />
    
    {/* Triângulos da ampulheta clássica do Omnitrix */}
    <path
      d="M26 26 L74 26 L50 48 Z"
      fill="#22c55e"
      stroke="#15803d"
      strokeWidth="1.5"
    />
    <path
      d="M26 74 L74 74 L50 52 Z"
      fill="#22c55e"
      stroke="#15803d"
      strokeWidth="1.5"
    />
    <circle cx="50" cy="50" r="4" fill="#86efac" />
    {/* Brilho neon de vidro */}
    <path
      d="M30 30 Q50 20 70 30"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

// 🔴 Quatro Braços (Four Arms)
export const FourArmsIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#7f1d1d" stroke="#ef4444" strokeWidth="3" />
    {/* Cabeça vermelha musculosa */}
    <path d="M30 35 Q50 15 70 35 L68 70 Q50 82 32 70 Z" fill="#dc2626" />
    {/* Listra preta central na cabeça */}
    <rect x="47" y="20" width="6" height="42" fill="#0f172a" rx="2" />
    {/* 4 Olhos dourados característicos */}
    <circle cx="40" cy="42" r="4" fill="#facc15" stroke="#000" strokeWidth="1" />
    <circle cx="60" cy="42" r="4" fill="#facc15" stroke="#000" strokeWidth="1" />
    <circle cx="36" cy="52" r="3" fill="#facc15" stroke="#000" strokeWidth="1" />
    <circle cx="64" cy="52" r="3" fill="#facc15" stroke="#000" strokeWidth="1" />
    {/* Queixo e presas */}
    <path d="M42 66 L44 62 L48 66 L52 66 L56 62 L58 66 Z" fill="#ffffff" />
    {/* Mini emblema Omnitrix no peito/ombro */}
    <circle cx="50" cy="85" r="7" fill="#22c55e" stroke="#000" strokeWidth="1.5" />
    <polygon points="47,82 53,82 50,85" fill="#000" />
    <polygon points="47,88 53,88 50,85" fill="#000" />
  </svg>
);

// 🔥 Chama (Heatblast)
export const HeatblastIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#431407" stroke="#ea580c" strokeWidth="3" />
    {/* Fogo no topo da cabeça */}
    <path
      d="M30 45 Q35 15 50 10 Q65 15 70 45 Q60 30 50 40 Q40 30 30 45 Z"
      fill="#facc15"
      stroke="#ea580c"
      strokeWidth="2"
    />
    {/* Cabeça de rocha de magma */}
    <polygon points="35,42 65,42 60,78 40,78" fill="#c2410c" stroke="#7c2d12" strokeWidth="2" />
    {/* Rosto flamejante amarelo incandescente */}
    <polygon points="40,48 60,48 56,72 44,72" fill="#fef08a" />
    {/* Olhos de fogo ardente */}
    <ellipse cx="45" cy="58" rx="3" ry="5" fill="#ea580c" />
    <ellipse cx="55" cy="58" rx="3" ry="5" fill="#ea580c" />
    {/* Boca de lava */}
    <rect x="46" y="68" width="8" height="2" fill="#9a3412" rx="1" />
    {/* Faíscas laterais */}
    <circle cx="22" cy="35" r="2.5" fill="#fbbf24" />
    <circle cx="78" cy="30" r="3" fill="#fb923c" />
  </svg>
);

// ⚡ XLR8
export const XLR8Icon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#082f49" stroke="#06b6d4" strokeWidth="3" />
    {/* Capacete aerodinâmico alongado para trás */}
    <path d="M25 45 Q50 15 85 25 Q65 55 50 82 Q30 75 25 45 Z" fill="#0284c7" />
    <path d="M28 48 Q50 25 80 32 L70 50 Q45 40 30 55 Z" fill="#0f172a" />
    {/* Visor ciano neon veloz */}
    <path d="M26 48 Q42 42 56 46 L50 62 Q36 64 26 56 Z" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
    <circle cx="40" cy="52" r="3" fill="#ffffff" />
    {/* Esfera de velocidade / Rodas nos pés indicadas */}
    <circle cx="50" cy="88" r="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
    {/* Linhas de rastro de vento supersônico */}
    <path d="M12 35 L22 35 M8 50 L20 50 M14 65 L24 65" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 💎 Diamante (Diamondhead)
export const DiamondheadIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
    {/* Espetos de cristal atrás da cabeça */}
    <polygon points="50,10 40,35 60,35" fill="#34d399" stroke="#059669" strokeWidth="1.5" />
    <polygon points="20,25 35,45 42,32" fill="#6ee7b7" stroke="#059669" strokeWidth="1.5" />
    <polygon points="80,25 65,45 58,32" fill="#6ee7b7" stroke="#059669" strokeWidth="1.5" />
    {/* Cabeça angular de diamante puro */}
    <polygon points="35,38 65,38 58,78 42,78" fill="#10b981" stroke="#047857" strokeWidth="2" />
    <polygon points="42,44 58,44 54,72 46,72" fill="#a7f3d0" />
    {/* Olhos afiados amarelos */}
    <polygon points="43,52 47,54 44,56" fill="#facc15" />
    <polygon points="57,52 53,54 56,56" fill="#facc15" />
    {/* Brilhos facetados */}
    <line x1="42" y1="44" x2="54" y2="72" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
  </svg>
);

// 🧠 Massa Cinzenta (Grey Matter)
export const GreyMatterIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#1e1b4b" stroke="#6366f1" strokeWidth="3" />
    {/* Crânio grande galvaniano de super inteligência */}
    <ellipse cx="50" cy="45" rx="30" ry="24" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
    {/* Olhos esbugalhados verdes brilhantes */}
    <ellipse cx="36" cy="44" rx="10" ry="12" fill="#22c55e" stroke="#0f172a" strokeWidth="1.5" />
    <ellipse cx="64" cy="44" rx="10" ry="12" fill="#22c55e" stroke="#0f172a" strokeWidth="1.5" />
    {/* Pupilas horizontais inteligentes */}
    <rect x="30" y="42" width="12" height="4" rx="1" fill="#0f172a" />
    <rect x="58" y="42" width="12" height="4" rx="1" fill="#0f172a" />
    {/* Boca e miniqueixo */}
    <path d="M42 62 Q50 66 58 62" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="48" y="24" width="4" height="15" fill="#475569" rx="1" />
    {/* Emblema Omnitrix nas costas/topo */}
    <circle cx="50" cy="80" r="6" fill="#22c55e" />
  </svg>
);

// 🌿 Fogo Fátuo (Swampfire - Força Alienígena)
export const SwampfireIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#14532d" stroke="#84cc16" strokeWidth="3" />
    {/* Chifres florais com pontas de fogo */}
    <path d="M30 40 Q25 15 40 20 Q35 32 35 45 Z" fill="#ea580c" />
    <path d="M70 40 Q75 15 60 20 Q65 32 65 45 Z" fill="#ea580c" />
    <path d="M45 35 Q50 10 55 35 Z" fill="#facc15" />
    {/* Cabeça de planta alienígena resistente */}
    <polygon points="32,45 68,45 58,80 42,80" fill="#4d7c0f" stroke="#14532d" strokeWidth="2" />
    {/* Olhos brilhantes alaranjados */}
    <ellipse cx="44" cy="56" rx="4" ry="6" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
    <ellipse cx="56" cy="56" rx="4" ry="6" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
    {/* Cipós de regeneração */}
    <path d="M42 68 Q50 72 58 68" stroke="#365314" strokeWidth="2" fill="none" />
  </svg>
);

// 🔊 Eco Eco (Echo Echo - Força Alienígena)
export const EchoEchoIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#134e4a" stroke="#2dd4bf" strokeWidth="3" />
    {/* Fones auriculares sônicos */}
    <circle cx="24" cy="50" r="8" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" />
    <circle cx="76" cy="50" r="8" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" />
    {/* Cabeça branca de traje de contenção de som */}
    <rect x="30" y="30" width="40" height="42" rx="14" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
    {/* Olhos redondos sonoros */}
    <circle cx="42" cy="46" r="4" fill="#0f172a" />
    <circle cx="58" cy="46" r="4" fill="#0f172a" />
    {/* Alto-falante de boca amplificadora */}
    <circle cx="50" cy="60" r="7" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
    <circle cx="50" cy="60" r="3" fill="#2dd4bf" />
    {/* Ondas sonoras emanando */}
    <path d="M12 40 Q8 50 12 60 M88 40 Q92 50 88 60" stroke="#5eead4" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// ❄️ Friagem (Big Chill - Força Alienígena)
export const BigChillIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="3" />
    {/* Asas dobradas como capa de mariposa fantasma */}
    <path d="M20 25 Q50 40 50 85 Q25 65 20 25 Z" fill="#0369a1" />
    <path d="M80 25 Q50 40 50 85 Q75 65 80 25 Z" fill="#0369a1" />
    {/* Cabeça fantasmagórica gelada */}
    <path d="M38 35 Q50 25 62 35 L58 65 Q50 75 42 65 Z" fill="#0284c7" stroke="#075985" strokeWidth="2" />
    {/* Olhos azuis gélidos e penetrantes */}
    <polygon points="42,46 48,48 44,52" fill="#7dd3fc" />
    <polygon points="58,46 52,48 56,52" fill="#7dd3fc" />
    {/* Névoa de gelo e cristais */}
    <circle cx="50" cy="72" r="2" fill="#e0f2fe" />
    <circle cx="44" cy="76" r="1.5" fill="#bae6fd" />
    <circle cx="56" cy="76" r="1.5" fill="#bae6fd" />
  </svg>
);

// 🎮 Cyber Gamer Pro (Adolescente Meninos)
export const CyberGamerIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#020617" stroke="#06b6d4" strokeWidth="3" />
    {/* Headset Gamer com LED Neon */}
    <path d="M22 50 C22 25, 78 25, 78 50" fill="none" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
    <rect x="18" y="45" width="10" height="20" rx="4" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
    <rect x="72" y="45" width="10" height="20" rx="4" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
    {/* Microfone do headset */}
    <path d="M23 60 Q23 75 40 75" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
    <circle cx="42" cy="75" r="3" fill="#22c55e" />
    {/* Visor Cyberpunk com HUD digital */}
    <rect x="32" y="44" width="36" height="14" rx="3" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
    <rect x="36" y="48" width="10" height="2" fill="#22c55e" />
    <rect x="52" y="48" width="12" height="2" fill="#22d3ee" />
    {/* Rosto estilizado anime/cyber */}
    <polygon points="34,60 66,60 50,78" fill="#1e293b" />
    {/* Glitch lines */}
    <line x1="15" y1="30" x2="30" y2="30" stroke="#06b6d4" strokeWidth="1.5" />
    <line x1="70" y1="70" x2="85" y2="70" stroke="#a855f7" strokeWidth="1.5" />
  </svg>
);

// ✨ Aesthetic Girl & Y2K Pop (Adolescente Meninas)
export const AestheticGirlIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 100 100" className={className} style={size ? { width: size, height: size } : {}}>
    <circle cx="50" cy="50" r="48" fill="#3b0764" stroke="#ec4899" strokeWidth="3" />
    {/* Fones de Ouvido Retrô Y2K Rosa / Lilás */}
    <path d="M24 50 C24 25, 76 25, 76 50" fill="none" stroke="#f472b6" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="24" cy="52" r="8" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2" />
    <circle cx="76" cy="52" r="8" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2" />
    {/* Cabelo e Franja Aesthetic */}
    <path d="M30 45 Q50 25 70 45 L68 70 Q50 78 32 70 Z" fill="#831843" />
    <path d="M34 38 Q50 44 66 38" fill="none" stroke="#db2777" strokeWidth="3" strokeLinecap="round" />
    {/* Rosto delicado */}
    <ellipse cx="50" cy="54" rx="14" ry="12" fill="#fdf2f8" />
    {/* Olhinhos felizes / Piscando */}
    <path d="M42 52 Q45 49 48 52" stroke="#831843" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M52 52 Q55 49 58 52" stroke="#831843" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Blush rosado nas bochechas */}
    <circle cx="41" cy="57" r="3" fill="#f472b6" opacity="0.6" />
    <circle cx="59" cy="57" r="3" fill="#f472b6" opacity="0.6" />
    {/* Sorriso doce */}
    <path d="M47 58 Q50 61 53 58" stroke="#db2777" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Borboletinha e estrelinhas de glitter */}
    <path d="M72 25 Q78 20 80 26 Q76 30 72 25" fill="#f43f5e" />
    <path d="M84 25 Q78 20 80 26 Q82 30 84 25" fill="#a855f7" />
    <polygon points="26,20 28,24 32,26 28,28 26,32 24,28 20,26 24,24" fill="#fef08a" />
    <polygon points="70,72 71,74 74,75 71,76 70,79 69,76 66,75 69,74" fill="#e879f9" />
  </svg>
);

// Mapeador universal para renderizar o ícone de qualquer alienígena ou personagem
export const renderThemeIcon = (iconName: string, className = 'w-6 h-6', size?: number) => {
  switch (iconName) {
    case 'omnitrix':
      return <OmnitrixDialIcon className={className} size={size} />;
    case 'fourarms':
      return <FourArmsIcon className={className} size={size} />;
    case 'heatblast':
      return <HeatblastIcon className={className} size={size} />;
    case 'xlr8':
      return <XLR8Icon className={className} size={size} />;
    case 'diamondhead':
      return <DiamondheadIcon className={className} size={size} />;
    case 'greymatter':
      return <GreyMatterIcon className={className} size={size} />;
    case 'swampfire':
      return <SwampfireIcon className={className} size={size} />;
    case 'echoecho':
      return <EchoEchoIcon className={className} size={size} />;
    case 'bigchill':
      return <BigChillIcon className={className} size={size} />;
    case 'cybersamurai':
    case 'mechapilot':
      return <CyberGamerIcon className={className} size={size} />;
    case 'starrygirl':
    case 'butterflyy2k':
      return <AestheticGirlIcon className={className} size={size} />;
    default:
      return <OmnitrixDialIcon className={className} size={size} />;
  }
};
