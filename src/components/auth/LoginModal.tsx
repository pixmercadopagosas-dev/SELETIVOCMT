import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { CmtLogo } from '../common/CmtLogo';
import {
  Lock,
  User,
  GraduationCap,
  ShieldAlert,
  ArrowRight,
  X,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const user = await db.getProfileByUsername(usernameInput.trim());
    if (!user) {
      setErrorMsg('Nome de usuário não encontrado. Verifique a digitação ou cadastre-se.');
      return;
    }

    onLoginSuccess(user);
    onClose();
  };

  const handleQuickLogin = async (targetUsername: string) => {
    const user = await db.getProfileByUsername(targetUsername);
    if (user) {
      onLoginSuccess(user);
      onClose();
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgot(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <CmtLogo size="md" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {showForgot ? 'Recuperação de Acesso' : 'Entrar na Plataforma'}
          </h2>
          <p className="text-xs text-slate-500">
            Colégio Militar Tiradentes XVII — Balsas / MA
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800">
            {errorMsg}
          </div>
        )}

        {!showForgot ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome de Usuário
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ex: usuario_estudante ou e-mail"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Senha</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[11px] font-bold text-blue-900 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
            >
              Acessar Plataforma
            </button>

            {/* Superusuário Direct Access */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleQuickLogin('diretoria_cmt')}
                className="w-full p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-950 font-bold text-left border border-red-200 flex items-center justify-between transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    🛡️
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight text-red-950">Acesso da Diretoria (Superusuário)</p>
                    <span className="text-[10px] text-red-700 font-semibold">@diretoria_cmt • Liberar e homologar matrículas</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 bg-red-200 text-red-900 rounded-lg">
                  Entrar
                </span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500">
                Ainda não tem cadastro?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRegister();
                  }}
                  className="font-bold text-blue-900 hover:underline"
                >
                  Criar conta de estudante
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Informe o nome de usuário ou e-mail cadastrado pelo responsável para receber as instruções seguras de recuperação.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome de Usuário ou E-mail
              </label>
              <input
                type="text"
                required
                placeholder="Ex: usuario_estudante ou responsavel@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Instruções de redefinição enviadas para o responsável!
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Voltar ao login
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Enviar Instruções
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
