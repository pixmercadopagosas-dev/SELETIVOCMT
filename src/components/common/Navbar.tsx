import React, { useState } from 'react';
import { CmtLogo } from './CmtLogo';
import { UserProfile } from '../../types';
import {
  Bell,
  Star,
  Flame,
  Award,
  Database,
  LogOut,
  Shield,
  User,
  GraduationCap,
  Palette,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAppTheme } from '../../lib/themeContext';
import { OmnitrixDialIcon, renderThemeIcon } from './AlienSvgIcons';

interface NavbarProps {
  currentUser: UserProfile | null;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSupabaseStatus: () => void;
  onOpenProfile: () => void;
  onOpenThemeModal: () => void;
  onLogout: () => void;
  onSwitchUser?: (userId: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSupabaseStatus,
  onOpenProfile,
  onOpenThemeModal,
  onLogout,
  onSwitchUser,
  onToggleMobileMenu,
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const { currentCartoon, activeAlienProfile, activeTeenProfile } = useAppTheme();

  // Deriving the user display name chosen at registration time (PRINT 02 REQUIREMENT)
  const displayName = currentUser?.full_name?.trim() || currentUser?.username || 'Estudante';
  const displayInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || (currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'CM');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-2 lg:hidden text-slate-700 hover:text-blue-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Abrir menu lateral"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <CmtLogo size="sm" showText={true} />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {currentUser && (
            <>
              {/* Grade indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                <span>{currentUser.grade === '6_ano' ? '6º Ano' : '7º Ano'}</span>
              </div>

              {/* Study Streak */}
              <div
                className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold"
                title={`${currentUser.study_streak_days} dias seguidos de dedicação`}
              >
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                <span>{currentUser.study_streak_days}d</span>
              </div>

              {/* Stars */}
              <div
                className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900 text-xs font-bold"
                title={`${currentUser.total_stars} estrelas`}
              >
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                <span>{currentUser.total_stars}</span>
              </div>
            </>
          )}

          {/* Theme & Cartoon Selector Button */}
          <button
            onClick={onOpenThemeModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs border ${
              currentCartoon === 'cyber_gamer_boy'
                ? 'bg-slate-950 text-cyan-300 border-cyan-500 hover:bg-slate-900 shadow-cyan-500/20'
                : currentCartoon === 'aesthetic_y2k_girl'
                ? 'bg-pink-950 text-pink-200 border-pink-400 hover:bg-pink-900 shadow-pink-500/20'
                : currentCartoon === 'ben10_alien'
                ? 'hover:brightness-125'
                : 'text-purple-900 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 border-purple-200'
            }`}
            style={
              currentCartoon === 'ben10_alien'
                ? {
                    backgroundColor: `${activeAlienProfile.powerColor}20`,
                    borderColor: activeAlienProfile.powerColor,
                    color: '#ffffff',
                    boxShadow: `0 0 12px ${activeAlienProfile.powerColor}50`,
                  }
                : {}
            }
            title={`Tema ativo: ${activeAlienProfile.name} (${activeAlienProfile.colorLabel})`}
          >
            {currentCartoon === 'ben10_alien' ? (
              <>
                <OmnitrixDialIcon className="w-4 h-4" />
                <span className="hidden md:inline font-black" style={{ color: activeAlienProfile.powerColor }}>
                  {activeAlienProfile.name} ({activeAlienProfile.colorLabel})
                </span>
                <span className="md:hidden" style={{ color: activeAlienProfile.powerColor }}>
                  {activeAlienProfile.name}
                </span>
              </>
            ) : currentCartoon === 'cyber_gamer_boy' ? (
              <>
                {renderThemeIcon(activeTeenProfile.iconName, 'w-4 h-4')}
                <span className="hidden md:inline text-cyan-300">{activeTeenProfile.name}</span>
                <span className="md:hidden">Gamer</span>
              </>
            ) : currentCartoon === 'aesthetic_y2k_girl' ? (
              <>
                {renderThemeIcon(activeTeenProfile.iconName, 'w-4 h-4')}
                <span className="hidden md:inline text-pink-200">{activeTeenProfile.name}</span>
                <span className="md:hidden">Aesthetic</span>
              </>
            ) : (
              <>
                <Palette className="w-4 h-4 text-purple-600" />
                <span className="hidden md:inline">Cores & Temas</span>
              </>
            )}
          </button>

          {/* Database / Supabase Status Button - VISÍVEL APENAS PARA O SUPERUSUÁRIO */}
          {currentUser?.role === 'superusuario' ? (
            <button
              onClick={onOpenSupabaseStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200 border-2 border-emerald-400 rounded-xl transition-all shadow-xs"
              title="Acesso exclusivo do Superusuário: Abrir Aba de Teste de Conexão com o Banco de Dados"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span>Aba Teste de Banco</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            </button>
          ) : (
            onSwitchUser && (
              <button
                onClick={async () => {
                  await onSwitchUser('super-admin-001');
                  onOpenSupabaseStatus();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black text-red-950 bg-red-100/80 hover:bg-red-200 border-2 border-red-300 rounded-xl transition-all shadow-xs"
                title="Alternar para a conta do Superusuário (Diretoria CMT) para acessar a aba de Teste de Banco de Dados"
              >
                <Database className="w-3.5 h-3.5 text-red-700" />
                <span className="hidden sm:inline">Acessar Teste de Banco</span>
                <span className="sm:hidden">Teste Banco</span>
                <span className="text-[9px] bg-red-700 text-white font-extrabold px-1 rounded">Super</span>
              </button>
            )
          )}

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Central de Notificações"
            aria-label="Central de Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Account / Profile - APRESENTA O NOME ESCOLHIDO NO CADASTRO (PRINT 02) */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-2 p-1.5 pl-2 pr-3 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200 shadow-xs"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-700 text-white font-extrabold flex items-center justify-center text-xs shadow-inner shrink-0">
                  {displayInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left max-w-[140px]">
                  {/* Nome escolhido no cadastro com prioridade */}
                  <span className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-none truncate">
                    @{currentUser.username} • {currentUser.role === 'superusuario' ? 'Superusuário' : 'Estudante'}
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900 leading-snug">{displayName}</p>
                    <p className="text-[11px] text-slate-500">@{currentUser.username}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-700 capitalize">
                        Status: {currentUser.account_status}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        onOpenProfile();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Meu Perfil & Metas
                    </button>

                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        onOpenThemeModal();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-bold"
                    >
                      <Palette className="w-4 h-4 text-purple-600" />
                      Cores & Temas Infantis
                    </button>

                    {/* Quick switch between demo accounts */}
                    {onSwitchUser && (
                      <div className="border-t border-slate-100 my-1 pt-1">
                        <span className="px-4 py-1 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Alternar Conta de Teste
                        </span>
                        <button
                          onClick={() => {
                            setShowSwitchMenu(false);
                            onSwitchUser('student-demo-001');
                          }}
                          className="w-full px-4 py-1.5 text-left text-xs text-slate-700 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                          Marcos Vinícius (6º Ano Aprovado)
                        </button>
                        <button
                          onClick={() => {
                            setShowSwitchMenu(false);
                            onSwitchUser('student-demo-002');
                          }}
                          className="w-full px-4 py-1.5 text-left text-xs text-slate-700 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                          Ana Beatriz (7º Ano Aprovado)
                        </button>
                        <button
                          onClick={() => {
                            setShowSwitchMenu(false);
                            onSwitchUser('student-pending-001');
                          }}
                          className="w-full px-4 py-1.5 text-left text-xs text-slate-700 hover:bg-amber-50 flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                          Gabriel Santos (Conta Pendente)
                        </button>
                        <button
                          onClick={async () => {
                            setShowSwitchMenu(false);
                            await onSwitchUser('super-admin-001');
                            onOpenSupabaseStatus();
                          }}
                          className="w-full px-4 py-2 text-left text-xs bg-red-50 hover:bg-red-100 flex items-center justify-between font-black text-red-950 border-t border-red-200 mt-1"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-red-700" />
                            <span>Diretoria Geral (Superusuário)</span>
                          </div>
                          <span className="text-[10px] bg-emerald-700 text-white font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <Database className="w-2.5 h-2.5" />
                            Aba DB
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowSwitchMenu(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Encerrar Sessão
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
