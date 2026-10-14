import React from 'react';
import {
  useAppTheme,
  COLOR_PRESETS,
  CARTOON_THEMES,
  SystemColor,
  CartoonTheme,
} from '../../lib/themeContext';
import { Palette, Sparkles, Check, X, Wand2, Gamepad2, Heart, Zap } from 'lucide-react';
import { renderThemeIcon, OmnitrixDialIcon } from './AlienSvgIcons';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    currentColor,
    currentCartoon,
    activeAlienProfile,
    activeTeenProfile,
    setColor,
    setCartoon,
  } = useAppTheme();

  if (!isOpen) return null;

  const teenThemes: CartoonTheme[] = ['cyber_gamer_boy', 'aesthetic_y2k_girl'];
  const cartoonThemes: CartoonTheme[] = [
    'ben10_alien',
    'nenhum',
    'pokemon_master',
    'minecraft_craft',
    'super_herois',
    'ninja_shonen',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 rounded-2xl shadow-md">
            <Palette className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Personalize as Cores e Temas do Sistema
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Escolha temas reais inspirados em Ben 10, universos adolescentes e jogos para deixar seus estudos mais divertidos e imersivos!
          </p>
        </div>

        {/* ========================================================= */}
        {/* SEÇÃO 1: TEMAS ADOLESCENTES (NOVIDADE) */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-cyan-600" />
              Temas Adolescentes (Novo!)
            </h3>
            <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
              Para Meninos & Meninas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teenThemes.map((themeKey) => {
              const theme = CARTOON_THEMES[themeKey];
              const isSelected = currentCartoon === themeKey;
              const isBoy = themeKey === 'cyber_gamer_boy';

              return (
                <button
                  key={themeKey}
                  onClick={() => setCartoon(themeKey)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all relative overflow-hidden group ${
                    isSelected
                      ? isBoy
                        ? 'border-cyan-500 bg-cyan-950 text-white ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'border-pink-500 bg-pink-950 text-white ring-2 ring-pink-400 shadow-lg shadow-pink-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? isBoy
                          ? 'bg-cyan-900/60 border-cyan-400'
                          : 'bg-pink-900/60 border-pink-400'
                        : 'bg-slate-100 border-slate-200 group-hover:scale-105'
                    } transition-transform`}
                  >
                    {renderThemeIcon(theme.iconName, 'w-8 h-8')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-black truncate ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {theme.name}
                      </p>
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 shrink-0 ${
                            isBoy ? 'text-cyan-400' : 'text-pink-300'
                          }`}
                        />
                      )}
                    </div>

                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                        isSelected
                          ? isBoy
                            ? 'bg-cyan-500/30 text-cyan-200'
                            : 'bg-pink-500/30 text-pink-200'
                          : isBoy
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {theme.targetAudience}
                    </span>

                    <p
                      className={`text-[11px] line-clamp-1 mt-1 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {theme.description}
                    </p>

                    <span
                      className={`text-[10px] font-bold mt-1 block italic ${
                        isSelected
                          ? isBoy
                            ? 'text-cyan-300'
                            : 'text-pink-200'
                          : isBoy
                          ? 'text-cyan-700'
                          : 'text-pink-700'
                      }`}
                    >
                      "{theme.motto}"
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SEÇÃO 2: TEMAS INFANTIS, BEN 10 & JOGOS */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-emerald-600" />
              Temas Infantis & Desenhos (Com Ben 10 Real)
            </h3>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Aliens & Mascotes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {cartoonThemes.map((themeKey) => {
              const theme = CARTOON_THEMES[themeKey];
              const isSelected = currentCartoon === themeKey;
              const isBen10 = themeKey === 'ben10_alien';

              return (
                <button
                  key={themeKey}
                  onClick={() => setCartoon(themeKey)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all group ${
                    isSelected
                      ? isBen10
                        ? 'border-emerald-500 bg-slate-950 text-white ring-2 ring-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected && isBen10
                        ? 'bg-emerald-950 border-emerald-400'
                        : 'bg-slate-100 border-slate-200 group-hover:scale-105'
                    } transition-transform`}
                  >
                    {isBen10 ? (
                      <OmnitrixDialIcon className="w-7 h-7" glow={isSelected} />
                    ) : (
                      <span className="text-2xl select-none">{theme.iconEmoji}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-black truncate ${
                          isSelected && isBen10 ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {theme.name}
                      </p>
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 shrink-0 ${
                            isBen10 ? 'text-emerald-400' : 'text-purple-700'
                          }`}
                        />
                      )}
                    </div>

                    {isBen10 && isSelected && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-300 font-extrabold">
                          Alien ativo: {activeAlienProfile.name}
                        </span>
                      </div>
                    )}

                    <p
                      className={`text-[11px] line-clamp-1 mt-0.5 ${
                        isSelected && isBen10 ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {theme.description}
                    </p>

                    <span
                      className={`text-[10px] font-bold mt-1 block italic ${
                        isSelected && isBen10 ? 'text-emerald-300' : 'text-purple-800'
                      }`}
                    >
                      "{theme.motto}"
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SEÇÃO 3: COR PRINCIPAL DO SISTEMA */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Cor Principal do Sistema
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(Object.keys(COLOR_PRESETS) as SystemColor[]).map((colorKey) => {
              const preset = COLOR_PRESETS[colorKey];
              const isSelected = currentColor === colorKey;

              return (
                <button
                  key={colorKey}
                  onClick={() => setColor(colorKey)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'border-blue-900 bg-slate-50 ring-2 ring-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: preset.previewHex }}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {preset.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all hover:scale-102"
          >
            Pronto! Salvar Meu Tema
          </button>
        </div>
      </div>
    </div>
  );
};
