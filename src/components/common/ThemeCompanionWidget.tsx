import React, { useState } from 'react';
import { useAppTheme } from '../../lib/themeContext';
import { BEN10_ALIENS, TEEN_CHARACTERS } from '../../data/themeCharacters';
import {
  OmnitrixDialIcon,
  renderThemeIcon,
} from './AlienSvgIcons';
import {
  Sparkles,
  Zap,
  Flame,
  Shield,
  ChevronDown,
  ChevronUp,
  RotateCw,
  X,
  Volume2,
  Check,
  Heart,
  Terminal,
  Gamepad2,
  Wand2,
} from 'lucide-react';

export const ThemeCompanionWidget: React.FC = () => {
  const {
    currentCartoon,
    cartoonConfig,
    activeAlienProfile,
    activeTeenProfile,
    isOmnitrixTransforming,
    transformOmnitrix,
    setSelectedTeenId,
  } = useAppTheme();

  const [omnitrixModalOpen, setOmnitrixModalOpen] = useState(false);
  const [teenModalOpen, setTeenModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // If standard official theme is selected, do not show mascot companion
  if (currentCartoon === 'nenhum') return null;

  return (
    <>
      {/* Flash de Transformação do Omnitrix */}
      {isOmnitrixTransforming && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-emerald-500/20 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-slate-950/90 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl space-y-4 max-w-sm mx-4 transform scale-105 animate-pulse">
            <div className="w-20 h-20 mx-auto flex items-center justify-center">
              <OmnitrixDialIcon className="w-20 h-20 animate-spin" glow={true} />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                Omnitrix Sincronizado
              </span>
              <h3 className="text-xl font-black text-white">
                Hora de Virar Herói!
              </h3>
              <p className="text-xs text-emerald-300 font-bold">
                Transformando em: {activeAlienProfile.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Widget Companion Superior */}
      <div className="w-full bg-slate-900 border-b border-slate-800 transition-all shadow-md relative overflow-hidden">
        {/* ============================================================== */}
        {/* TEMA 1: BEN 10 & FORÇA ALIENÍGENA */}
        {/* ============================================================== */}
        {currentCartoon === 'ben10_alien' && (
          <div
            className={`bg-gradient-to-r ${activeAlienProfile.themeGradient} text-white px-3 sm:px-6 py-2.5 relative border-b transition-colors duration-300`}
            style={{ borderColor: `${activeAlienProfile.powerColor}60` }}
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Esquerda: Omnitrix + Alien Ativo */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setOmnitrixModalOpen(true)}
                  className="relative cursor-pointer group shrink-0"
                  title="Clique para girar o Omnitrix e trocar de Alien"
                >
                  <OmnitrixDialIcon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  <span
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 animate-ping"
                    style={{ backgroundColor: activeAlienProfile.powerColor }}
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 text-white shadow-xs"
                      style={{
                        backgroundColor: `${activeAlienProfile.powerColor}35`,
                        borderColor: activeAlienProfile.powerColor,
                      }}
                    >
                      <Zap className="w-3 h-3" style={{ color: activeAlienProfile.powerColor }} />
                      Cor: {activeAlienProfile.colorLabel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {activeAlienProfile.alienSeries}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {renderThemeIcon(activeAlienProfile.iconName, 'w-5 h-5')}
                    </div>
                    <span className="text-sm font-black text-white">
                      Alien Ativo:{' '}
                      <span style={{ color: activeAlienProfile.powerColor }}>{activeAlienProfile.name}</span>
                    </span>
                    <span className="hidden lg:inline text-xs text-slate-200 italic">
                      — "{activeAlienProfile.quote}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Centro: Poder especial de estudo do alien */}
              <div
                className="hidden sm:flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs text-white"
                style={{
                  backgroundColor: `${activeAlienProfile.powerColor}25`,
                  borderColor: `${activeAlienProfile.powerColor}60`,
                }}
              >
                <span className="text-base">⚡</span>
                <span className="font-bold">{activeAlienProfile.studyPower}</span>
              </div>

              {/* Direita: Botão de Girar Omnitrix */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setOmnitrixModalOpen(true)}
                  className="px-3.5 py-1.5 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: activeAlienProfile.powerColor,
                    boxShadow: `0 0 15px ${activeAlienProfile.powerColor}80`,
                  }}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Girar Omnitrix</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TEMA 2: CYBERPUNK GAMER PRO (ADOLESCENTE MENINOS) */}
        {/* ============================================================== */}
        {currentCartoon === 'cyber_gamer_boy' && (
          <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 text-white px-3 sm:px-6 py-2.5 relative border-b border-cyan-800/40">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setTeenModalOpen(true)}
                  className="w-10 h-10 rounded-xl bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  title="Alterar avatar Gamer"
                >
                  {renderThemeIcon(activeTeenProfile.iconName, 'w-7 h-7')}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-900/80 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/50 flex items-center gap-1 font-mono">
                      <Gamepad2 className="w-3 h-3 text-cyan-400" />
                      Modo Gamer Pro • 144 FPS
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Adolescente
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      Player:{' '}
                      <span className="text-cyan-400">{activeTeenProfile.name}</span>
                    </span>
                    <span className="hidden lg:inline text-xs text-slate-300 italic">
                      — "{activeTeenProfile.quote}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Traits Gamer */}
              <div className="hidden sm:flex items-center gap-2">
                {activeTeenProfile.subtraits.map((trait, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 px-2.5 py-1 rounded-lg font-mono"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setTeenModalOpen(true)}
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 font-mono"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Configurar Rig</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TEMA 3: AESTHETIC GIRL & Y2K POP (ADOLESCENTE MENINAS) */}
        {/* ============================================================== */}
        {currentCartoon === 'aesthetic_y2k_girl' && (
          <div className="bg-gradient-to-r from-purple-950 via-pink-950 to-slate-950 text-white px-3 sm:px-6 py-2.5 relative border-b border-pink-700/40">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setTeenModalOpen(true)}
                  className="w-10 h-10 rounded-2xl bg-pink-950/80 border-2 border-pink-400 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition-transform shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                  title="Alterar avatar Aesthetic"
                >
                  {renderThemeIcon(activeTeenProfile.iconName, 'w-7 h-7')}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-pink-900/80 text-pink-200 px-2 py-0.5 rounded-md border border-pink-500/50 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-pink-400" />
                      Aesthetic Study Glow ✨
                    </span>
                    <span className="text-[10px] font-bold text-pink-300">
                      Adolescente
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      Mood:{' '}
                      <span className="text-pink-300">{activeTeenProfile.name}</span>
                    </span>
                    <span className="hidden lg:inline text-xs text-pink-200/90 italic">
                      — "{activeTeenProfile.quote}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtraits Aesthetic */}
              <div className="hidden sm:flex items-center gap-2">
                {activeTeenProfile.subtraits.map((trait, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold bg-pink-950/70 border border-pink-400/30 text-pink-200 px-2.5 py-1 rounded-lg"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setTeenModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Estilo Aesthetic</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* OUTROS TEMAS (POKÉMON, MINECRAFT, NINJA, HEROIS) */}
        {/* ============================================================== */}
        {!['ben10_alien', 'cyber_gamer_boy', 'aesthetic_y2k_girl'].includes(currentCartoon) && (
          <div className={`bg-gradient-to-r ${cartoonConfig.bannerGradient} text-white px-3 sm:px-6 py-2.5`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <span className="text-xl">{cartoonConfig.iconEmoji}</span>
                <span className="font-extrabold text-yellow-300">{cartoonConfig.name}:</span>
                <span className="text-slate-200 hidden sm:inline italic">"{cartoonConfig.motto}"</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-black/40 text-yellow-300 px-2 py-0.5 rounded-md border border-white/10">
                Mascote Ativo
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL OMNITRIX: SELEÇÃO E TRANSFORMAÇÃO DE ALIENÍGENAS */}
      {/* ============================================================== */}
      {omnitrixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-950 rounded-3xl border-2 border-emerald-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-[0_0_30px_rgba(34,197,94,0.4)] text-white">
            <button
              onClick={() => setOmnitrixModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Omnitrix */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-emerald-950 border border-emerald-500 rounded-2xl shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                <OmnitrixDialIcon className="w-10 h-10" glow={true} />
              </div>
              <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <span>Girar Omnitrix: Escolha Seu Alien</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </h2>
              <p className="text-xs text-emerald-300 max-w-md mx-auto">
                Selecione o alienígena que vai te acompanhar na preparação do CMT XVII. Cada alien tem uma habilidade de estudo especial!
              </p>
            </div>

            {/* Grid dos 8 Alienígenas com Ilustrações Reais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BEN10_ALIENS.map((alien) => {
                const isSelected = activeAlienProfile.id === alien.id;

                return (
                  <button
                    key={alien.id}
                    onClick={() => {
                      transformOmnitrix(alien.id);
                      setOmnitrixModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3.5 transition-all group ${
                      isSelected
                        ? `${alien.cardSelectedBorder} ${alien.cardSelectedBg} ring-2 ring-offset-2 ring-offset-slate-950 ${alien.cardGlow}`
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl bg-slate-950 border-2 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs"
                      style={{ borderColor: alien.powerColor }}
                    >
                      {renderThemeIcon(alien.iconName, 'w-9 h-9')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-black text-white">{alien.name}</p>
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded text-white shadow-xs"
                            style={{ backgroundColor: alien.powerColor }}
                          >
                            Cor: {alien.colorLabel}
                          </span>
                        </div>
                        {isSelected && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white shadow-xs"
                            style={{ backgroundColor: alien.powerColor }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p
                        className="text-[10px] font-bold mt-1 line-clamp-1"
                        style={{ color: alien.powerColor }}
                      >
                        {alien.studyPower.split('•')[0]}
                      </p>

                      <p className="text-[10px] text-slate-300 italic mt-0.5 line-clamp-1">
                        "{alien.quote}"
                      </p>

                      {/* Mini barras de stats */}
                      <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-slate-800/80 text-[8px] font-mono text-slate-400">
                        <div>
                          <span>FOC:</span>
                          <span className="text-emerald-400 font-bold ml-0.5">{alien.stats.foco}%</span>
                        </div>
                        <div>
                          <span>VEL:</span>
                          <span className="text-cyan-400 font-bold ml-0.5">{alien.stats.velocidade}%</span>
                        </div>
                        <div>
                          <span>RAC:</span>
                          <span className="text-indigo-400 font-bold ml-0.5">{alien.stats.raciocinio}%</span>
                        </div>
                        <div>
                          <span>RES:</span>
                          <span className="text-amber-400 font-bold ml-0.5">{alien.stats.resistencia}%</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-center text-xs text-slate-500 font-medium">
              💡 Dica: O alien ativo aparecerá no topo, no seu painel de estudos e nos simulados!
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL PERSONAGENS ADOLESCENTES (CYBER GAMER & AESTHETIC GIRL) */}
      {/* ============================================================== */}
      {teenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-950 rounded-3xl border-2 border-cyan-500 max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-white">
            <button
              onClick={() => setTeenModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-cyan-950 border border-cyan-500 rounded-2xl">
                <Gamepad2 className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black text-white">
                Personalização Adolescente
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Escolha o seu avatar e estilo de estudo favorito!
              </p>
            </div>

            <div className="space-y-3">
              {TEEN_CHARACTERS.map((char) => {
                const isSelected = activeTeenProfile.id === char.id;

                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      setSelectedTeenId(char.id);
                      setTeenModalOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/80 ring-2 ring-cyan-400'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                      {renderThemeIcon(char.iconName, 'w-8 h-8')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-white">{char.name}</p>
                        {isSelected && <Check className="w-5 h-5 text-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-cyan-300 font-bold">{char.title}</p>
                      <p className="text-xs text-slate-400 italic mt-0.5">"{char.quote}"</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
