import React, { useState } from 'react';
import { UserProfile, GradeId } from '../../types';
import { CmtLogo } from '../common/CmtLogo';
import {
  User,
  GraduationCap,
  Shield,
  Clock,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: UserProfile) => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onOpenLogin,
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState<GradeId>('6_ano');
  const [dailyGoal, setDailyGoal] = useState<number>(30);
  const [avatar, setAvatar] = useState('cadet_blue');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianCpf, setGuardianCpf] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const avatars = [
    { id: 'cadet_blue', label: 'Cadete Azul', color: 'bg-blue-900' },
    { id: 'cadet_green', label: 'Cadete Verde', color: 'bg-emerald-800' },
    { id: 'cadet_red', label: 'Cadete Vermelho', color: 'bg-red-800' },
    { id: 'cadet_yellow', label: 'Cadete Dourado', color: 'bg-amber-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreedTerms) {
      setErrorMsg('É obrigatório que o responsável legal concorde com as regras de utilização.');
      return;
    }

    if (username.length < 3) {
      setErrorMsg('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres para garantir a segurança da conta.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await db.registerStudent({
        username: username.toLowerCase().trim(),
        fullName: fullName.trim(),
        grade,
        avatarUrl: avatar,
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianCpf: guardianCpf.trim(),
        email: email.trim() || undefined,
        password: password.trim(),
      });

      // Save initial daily goal preference
      await db.saveStudyPreferences(res.user.id, {
        daily_goal_minutes: dailyGoal,
      });

      setSuccessUser(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
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
            Ficha de Inscrição e Cadastro do Estudante
          </h2>
          <p className="text-xs text-slate-500">
            Processo Seletivo do Colégio Militar Tiradentes XVII — Balsas / MA
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800">
            {errorMsg}
          </div>
        )}

        {successUser ? (
          /* CONFIRMAÇÃO DE SUCESSO OFICIAL CONFORME O EDITAL */
          <div className="text-center py-6 space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Solicitação enviada com sucesso!
              </h3>
              <p className="text-sm font-medium text-slate-700 max-w-md mx-auto leading-relaxed">
                Aguarde a aprovação do administrador para acessar o sistema de estudos.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto text-left space-y-2 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">Candidato:</span>
                <strong className="text-slate-900">{successUser.full_name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">Nome de Usuário:</span>
                <strong className="text-slate-900 font-mono">@{successUser.username}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">Série Pretendida:</span>
                <strong className="text-slate-900">{successUser.grade === '6_ano' ? '6º Ano Fundamental' : '7º Ano Fundamental'}</strong>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-500">Status Inicial:</span>
                <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-amber-100 text-amber-900 uppercase">
                  Pendente de Liberação
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onRegisterSuccess(successUser);
                  onClose();
                }}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Acompanhar Fila de Liberação</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grade selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Série Pretendida no Processo Seletivo:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGrade('6_ano')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    grade === '6_ano'
                      ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-xl text-white ${grade === '6_ano' ? 'bg-blue-900' : 'bg-slate-300'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">6º Ano Fundamental</p>
                    <span className="text-[10px] text-slate-500">10 a 11 anos • 30 questões</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGrade('7_ano')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    grade === '7_ano'
                      ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-xl text-white ${grade === '7_ano' ? 'bg-blue-900' : 'bg-slate-300'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">7º Ano Fundamental</p>
                    <span className="text-[10px] text-slate-500">11 a 12 anos • 40 questões</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Student Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nome de Usuário Exclusivo
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Ex: cadete_lucas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Apenas letras minúsculas, números e sublinhado.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Senha Segura
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome do Perfil / Nome Completo do Estudante
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Lucas Henrique Santos Pereira"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
              <span className="text-[10px] text-blue-900 font-semibold mt-1 block">
                Este é o nome que aparecerá no seu cabeçalho, no perfil e nos simulados!
              </span>
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Meta Diária de Estudo Inicial
              </label>
              <div className="grid grid-cols-5 gap-2 text-xs font-bold">
                {[15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoal(mins)}
                    className={`py-2 rounded-xl text-center transition-all ${
                      dailyGoal === mins
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Avatar Educativo
              </label>
              <div className="flex flex-wrap gap-2">
                {avatars.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatar(av.id)}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-xs font-semibold ${
                      avatar === av.id
                        ? 'border-blue-900 bg-blue-50 ring-2 ring-blue-900'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg ${av.color} text-white flex items-center justify-center text-xs font-bold`}>
                      {av.label.substring(0, 1)}
                    </div>
                    <span>{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Legal Guardian Section Required for Minors */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-900" />
                Participação e Autorização do Responsável Legal (Menor de Idade)
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Responsável Legal
                </label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Ex: Maria das Dores Santos"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp do Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="(99) 99123-4567"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF do Responsável
                  </label>
                  <input
                    type="text"
                    value={guardianCpf}
                    onChange={(e) => setGuardianCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail do Responsável ou Candidato (Opcional, para recuperação de senha)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Permite recuperar sua senha caso a perca posteriormente.
                </span>
              </div>

              <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  Declaro que sou responsável legal pelo candidato(a) e concordo com as regras do Edital Nº 001/26 do Colégio Militar Tiradentes XVII e as diretrizes pedagógicas da plataforma.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Enviando solicitação...</span>
                </>
              ) : (
                <span>SOLICITAR ACESSO</span>
              )}
            </button>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Já possui conta cadastrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="font-bold text-blue-900 hover:underline"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
