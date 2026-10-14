import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { CmtLogo } from '../common/CmtLogo';
import {
  Lock,
  User,
  Shield,
  ShieldAlert,
  ArrowRight,
  X,
  KeyRound,
  CheckCircle2,
  Mail,
  Phone,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenRegister: () => void;
  initialIdentifier?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
  initialIdentifier = '',
}) => {
  const [identifierInput, setIdentifierInput] = useState(initialIdentifier);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados da Recuperação de Senha
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'telefone'>('email');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');
  const [recoveryTarget, setRecoveryTarget] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryUserId, setRecoveryUserId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialIdentifier) {
      setIdentifierInput(initialIdentifier);
    }
  }, [initialIdentifier, isOpen]);

  if (!isOpen) return null;

  // Submissão de Login com validação direta de credenciais no banco de dados
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await db.authenticate(identifierInput.trim(), passwordInput);
      setLoading(false);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Falha ao autenticar. Verifique usuário e senha.');
    }
  };

  // Solicitar envio de código de recuperação
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRecoveryLoading(true);

    try {
      const res = await db.requestPasswordRecovery(recoveryInput.trim(), recoveryMethod);
      setRecoveryLoading(false);
      setRecoveryTarget(res.maskedTarget);
      setRecoveryCode(res.code);
      setRecoveryUserId(res.userId);
      setRecoveryStep('verify');
    } catch (err: any) {
      setRecoveryLoading(false);
      setErrorMsg(err.message || 'Erro ao processar recuperação.');
    }
  };

  // Validar código e redefinir senha no banco de dados
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem. Verifique a confirmação.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('A nova senha deve possuir pelo menos 4 caracteres.');
      return;
    }

    setRecoveryLoading(true);

    try {
      const res = await db.resetPassword(recoveryUserId, inputCode.trim(), newPassword);
      setRecoveryLoading(false);
      setResetSuccessMsg(res.message);

      // Preenche o campo de login com a nova senha e volta para o formulário de login
      setPasswordInput(newPassword);
      if (recoveryInput) {
        setIdentifierInput(recoveryInput);
      }

      setTimeout(() => {
        setResetSuccessMsg(null);
        setShowForgot(false);
        setRecoveryStep('request');
        setInputCode('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2500);
    } catch (err: any) {
      setRecoveryLoading(false);
      setErrorMsg(err.message || 'Código de verificação inválido ou expirado.');
    }
  };

  const handleResetRecoveryState = () => {
    setShowForgot(false);
    setRecoveryStep('request');
    setErrorMsg(null);
    setResetSuccessMsg(null);
    setInputCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative max-h-[95vh] overflow-y-auto">
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
            {showForgot
              ? recoveryStep === 'request'
                ? 'Recuperação de Senha'
                : 'Redefinição de Senha'
              : 'Acesso à Plataforma'}
          </h2>
          <p className="text-xs text-slate-500">
            Colégio Militar Tiradentes XVII — Balsas / MA
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {resetSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{resetSuccessMsg}</span>
          </div>
        )}

        {!showForgot ? (
          /* FORMULÁRIO DE LOGIN OFICIAL */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Usuário, E-mail ou Telefone
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  placeholder="Ex: pixmercadopagosas@gmail.com ou usuario"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Senha de Acesso</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setShowForgot(true);
                    setRecoveryInput(identifierInput);
                  }}
                  className="text-[11px] font-bold text-blue-900 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite sua senha cadastrada"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Autenticando no Banco de Dados...</span>
                </>
              ) : (
                <>
                  <span>Entrar com Usuário e Senha</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Atalho informativo para Superusuário */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Acesso Superusuário:</span>
              <button
                type="button"
                onClick={() => {
                  setIdentifierInput('pixmercadopagosas@gmail.com');
                  setErrorMsg(null);
                }}
                className="font-bold text-red-700 hover:text-red-900 hover:underline flex items-center gap-1"
                title="Preencher campo com o e-mail oficial do Superusuário"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Preencher e-mail do Superusuário</span>
              </button>
            </div>

            <div className="pt-1 text-center">
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
        ) : recoveryStep === 'request' ? (
          /* PASSO 1 DE RECUPERAÇÃO: ESCOLHA ENTRE EMAIL OU TELEFONE */
          <form onSubmit={handleRequestRecovery} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              O Superusuário e estudantes podem recuperar sua senha através do <strong>E-mail</strong> ou <strong>Telefone</strong> cadastrado no banco de dados.
            </p>

            {/* Seletor de canal de recuperação */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecoveryMethod('email')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  recoveryMethod === 'email'
                    ? 'border-blue-900 bg-blue-50 text-blue-950 ring-2 ring-blue-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-700" />
                <span>Via E-mail</span>
              </button>

              <button
                type="button"
                onClick={() => setRecoveryMethod('telefone')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  recoveryMethod === 'telefone'
                    ? 'border-blue-900 bg-blue-50 text-blue-950 ring-2 ring-blue-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-blue-700" />
                <span>Via Telefone</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {recoveryMethod === 'email'
                  ? 'E-mail ou Usuário Cadastrado'
                  : 'Telefone / WhatsApp ou Usuário Cadastrado'}
              </label>
              <input
                type="text"
                required
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value)}
                placeholder={
                  recoveryMethod === 'email'
                    ? 'Ex: pixmercadopagosas@gmail.com ou usuario'
                    : 'Ex: (99) 99113-6329 ou usuario'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {recoveryMethod === 'email'
                  ? 'O Superusuário pode usar pixmercadopagosas@gmail.com.'
                  : 'Digite o telefone cadastrado no banco de dados.'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetRecoveryState}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Voltar ao login
              </button>
              <button
                type="submit"
                disabled={recoveryLoading}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
              >
                {recoveryLoading ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Gerando código...</span>
                  </>
                ) : (
                  <span>Solicitar Código</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* PASSO 2 DE RECUPERAÇÃO: DIGITAR CÓDIGO E DEFINIR NOVA SENHA */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Banner oficial com o código de recuperação simulado/despachado */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-black text-blue-950">
                <KeyRound className="w-4 h-4 text-blue-800" />
                <span>Código de Segurança Enviado para: {recoveryTarget}</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-tight">
                Código gerado pelo sistema:
              </p>
              <div className="pt-1 flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs">
                <span className="font-mono text-base font-black tracking-widest text-blue-950">
                  {recoveryCode}
                </span>
                <button
                  type="button"
                  onClick={() => setInputCode(recoveryCode)}
                  className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200"
                >
                  Inserir código
                </button>
              </div>
              <p className="text-[10px] text-blue-600">Válido por 15 minutos.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Código de Verificação de 6 Dígitos
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nova Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setRecoveryStep('request')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={recoveryLoading}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2"
              >
                {recoveryLoading ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Salvando no Banco...</span>
                  </>
                ) : (
                  <span>Redefinir Senha no Banco</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
