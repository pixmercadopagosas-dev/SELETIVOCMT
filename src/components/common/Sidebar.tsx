import {
  Home,
  CalendarDays,
  BookOpen,
  Calculator,
  HelpCircle,
  Clock,
  TrendingUp,
  Award,
  Users,
  Bell,
  User,
  ShieldAlert,
  Database,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAppTheme } from '../../lib/themeContext';
import { OmnitrixDialIcon, renderThemeIcon } from './AlienSvgIcons';

export type NavTab =
  | 'inicio'
  | 'tutor-ia'
  | 'plano'
  | 'portugues'
  | 'matematica'
  | 'questionarios'
  | 'simulados'
  | 'desempenho'
  | 'conquistas'
  | 'comunidade'
  | 'notificacoes'
  | 'perfil'
  | 'admin'
  | 'teste-banco';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole?: UserRole;
  pendingRequestsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onSwitchToSuperUser?: () => void | Promise<void>;
  onOpenOsaias?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  pendingRequestsCount = 0,
  isOpenMobile = false,
  onCloseMobile,
  onSwitchToSuperUser,
  onOpenOsaias,
}) => {
  const { currentCartoon, activeAlienProfile, activeTeenProfile } = useAppTheme();

  const navItems = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'tutor-ia', label: 'Tutor I.A Tiradentes', icon: Sparkles, highlight: true },
    { id: 'plano', label: 'Plano de Estudos', icon: CalendarDays },
    { id: 'portugues', label: 'Língua Portuguesa', icon: BookOpen },
    { id: 'matematica', label: 'Matemática', icon: Calculator },
    { id: 'questionarios', label: 'Questionários', icon: HelpCircle },
    { id: 'simulados', label: 'Simulados do CMT', icon: Clock },
    { id: 'desempenho', label: userRole === 'superusuario' ? 'Desempenho dos Alunos' : 'Meu Desempenho', icon: TrendingUp },
    { id: 'conquistas', label: 'Conquistas & Medalhas', icon: Award },
    { id: 'comunidade', label: 'Comunidade Segura', icon: Users },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
  ] as const;

  const handleItemClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] z-50 lg:z-30 h-full lg:h-[calc(100vh-61px)] w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-4 border-r border-slate-800 shrink-0 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              Navegação CMT XVII
            </span>
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation list */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Área de Aprendizagem
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isAi = item.id === 'tutor-ia';

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? isAi
                        ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md font-bold border border-amber-400/50'
                        : 'text-white shadow-md font-bold'
                      : isAi
                      ? 'text-amber-300 hover:bg-slate-800 hover:text-amber-200'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  style={
                    isActive && !isAi
                      ? {
                          backgroundColor:
                            currentCartoon === 'ben10_alien'
                              ? activeAlienProfile.powerColor
                              : currentCartoon === 'cyber_gamer_boy'
                              ? '#06b6d4'
                              : currentCartoon === 'aesthetic_y2k_girl'
                              ? '#ec4899'
                              : undefined,
                          boxShadow: `0 4px 14px ${
                            currentCartoon === 'ben10_alien'
                              ? activeAlienProfile.powerColor
                              : '#2563eb'
                          }50`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? isAi
                            ? 'text-amber-400'
                            : 'text-white'
                          : isAi
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isAi && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      I.A
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Administration Section - EXCLUSIVO PARA O SUPERUSUÁRIO */}
          {userRole === 'superusuario' ? (
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center justify-between">
                <span>Área do Superusuário</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </p>
              
              <button
                onClick={() => handleItemClick('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-red-950/40 text-red-200 border border-red-900/60 hover:bg-red-900/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Painel do Superusuário</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              {/* ABA EXCLUSIVA: TESTE DE CONEXÃO COM O BANCO DE DADOS (APENAS SUPERUSUÁRIO) */}
              <button
                onClick={() => handleItemClick('teste-banco')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'teste-banco'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-emerald-950/50 text-emerald-200 border border-emerald-800/80 hover:bg-emerald-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Teste de Conexão (Banco)</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>
            </div>
          ) : null}

          {/* Cartão de Acesso Rápido ao Instrutor Osaias */}
          {userRole !== 'superusuario' && onOpenOsaias && (
            <button
              onClick={() => {
                onOpenOsaias();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-500/40 text-left flex items-center gap-2.5 shadow-xs hover:border-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer group"
              title="Ouvir mensagem e boas-vindas do Instrutor Osaias"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 shadow-sm">
                <img
                  src="/assets/aistudio/1792634685275_25b5af36.jpg"
                  alt="Osaias"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-black text-amber-300 block truncate group-hover:text-amber-200">
                  Instrutor Osaias
                </span>
                <span className="text-[9px] text-amber-400/90 font-medium block truncate">
                  Voz Masculina Grave • Ouvir
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Active Mascot in Sidebar */}
        {currentCartoon === 'ben10_alien' && (
          <div
            className="mx-1 my-2 p-2.5 rounded-xl text-left flex items-center gap-2.5 shadow-xs border transition-colors"
            style={{
              backgroundColor: `${activeAlienProfile.powerColor}15`,
              borderColor: `${activeAlienProfile.powerColor}50`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg bg-slate-950 border flex items-center justify-center shrink-0"
              style={{ borderColor: activeAlienProfile.powerColor }}
            >
              {renderThemeIcon(activeAlienProfile.iconName, 'w-6 h-6')}
            </div>
            <div className="min-w-0">
              <span
                className="text-[10px] font-black block truncate"
                style={{ color: activeAlienProfile.powerColor }}
              >
                {activeAlienProfile.name}
              </span>
              <span className="text-[9px] text-slate-300 block truncate">
                Cor: {activeAlienProfile.colorLabel}
              </span>
            </div>
          </div>
        )}

        {currentCartoon === 'cyber_gamer_boy' && (
          <div className="mx-1 my-2 p-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-left flex items-center gap-2.5 shadow-xs font-mono">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center shrink-0">
              {renderThemeIcon(activeTeenProfile.iconName, 'w-6 h-6')}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-cyan-300 font-bold block truncate">
                {activeTeenProfile.name}
              </span>
              <span className="text-[9px] text-cyan-400/80 block truncate">
                Gamer Pro • 144 FPS
              </span>
            </div>
          </div>
        )}

        {currentCartoon === 'aesthetic_y2k_girl' && (
          <div className="mx-1 my-2 p-2.5 rounded-xl bg-pink-950/80 border border-pink-400/40 text-left flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-pink-900 border border-pink-400 flex items-center justify-center shrink-0">
              {renderThemeIcon(activeTeenProfile.iconName, 'w-6 h-6')}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-pink-300 font-bold block truncate">
                {activeTeenProfile.name}
              </span>
              <span className="text-[9px] text-pink-200/80 block truncate">
                Study Glow ✨
              </span>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center leading-relaxed">
          <p className="font-semibold text-slate-300">CMT XVII — Unidade Balsas</p>
          <p className="text-[10px] text-slate-400">Edital Nº 001/26 • PMMA</p>
        </div>
      </aside>
    </>
  );
};
