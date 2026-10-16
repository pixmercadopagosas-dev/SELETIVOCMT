import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { CmtLogo } from '../common/CmtLogo';
import { Clock, ShieldAlert, Phone, MapPin, RefreshCw, LogOut, CheckCircle2, Lock } from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface PendingApprovalViewProps {
  currentUser: UserProfile;
  onStatusUpdated: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onOpenSuperUserLogin?: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  currentUser,
  onStatusUpdated,
  onLogout,
  onOpenSuperUserLogin,
}) => {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Auto-verificação contínua em tempo real da liberação do Superusuário
  useEffect(() => {
    const checkSilent = async () => {
      try {
        const fresh = await db.getProfileById(currentUser.id);
        if (fresh && fresh.account_status === 'aprovada') {
          onStatusUpdated(fresh);
        }
      } catch {}
    };

    const interval = setInterval(checkSilent, 3500);

    const handleDbUpdate = () => {
      checkSilent();
    };
    window.addEventListener('cmt_db_updated', handleDbUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cmt_db_updated', handleDbUpdate);
    };
  }, [currentUser.id]);

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);

    const fresh = await db.getProfileById(currentUser.id);
    setChecking(false);

    if (fresh) {
      if (fresh.account_status === 'aprovada') {
        onStatusUpdated(fresh);
      } else {
        setMessage('Sua conta ainda está com status PENDENTE de homologação pela Diretoria.');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CmtLogo size="lg" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-extrabold uppercase tracking-wide inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            Matrícula Aguardando Homologação
          </span>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Acesso Pendente de Aprovação
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Olá, <strong>{currentUser.full_name}</strong> (@{currentUser.username})! Seu cadastro para o{' '}
            <strong>{currentUser.grade === '6_ano' ? '6º Ano' : '7º Ano'}</strong> foi registrado com sucesso.
          </p>
        </div>

        {/* Security Rule explanation from edital */}
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-left text-xs text-amber-900 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            Regulamento de Segurança da PMMA:
          </p>
          <p className="text-amber-800 leading-relaxed">
            Por normas de proteção a menores e controle do processo seletivo do Colégio Militar Tiradentes XVII,
            novas contas não liberam automaticamente o acesso aos conteúdos. Somente a equipe de coordenação ou
            o superusuário podem autorizar a liberação da conta.
          </p>
        </div>

        {/* School contact info */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left space-y-2">
          <p className="font-bold text-slate-800">Secretaria do Colégio Militar Tiradentes XVII:</p>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Rua 17, s/n, Bairro Santo Amaro, Balsas - MA (CEP 65.800-000)</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Telefone Oficial: (99) 99113-6329</span>
          </div>
        </div>

        {message && (
          <p className="text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            {message}
          </p>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Verificando...' : 'Verificar Status de Aprovação'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>

        {onOpenSuperUserLogin && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onOpenSuperUserLogin}
              className="text-xs text-red-700 hover:text-red-900 font-bold inline-flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span>Sou o Superusuário da Diretoria (Acessar Painel de Aprovação)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
