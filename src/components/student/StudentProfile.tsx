import React, { useState } from 'react';
import { UserProfile, StudyPreferences } from '../../types';
import {
  User,
  Shield,
  Save,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface StudentProfileProps {
  currentUser: UserProfile;
  studyPreferences: StudyPreferences;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onUpdatePreferences: (updatedPref: StudyPreferences) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  currentUser,
  studyPreferences,
  onUpdateUser,
  onUpdatePreferences,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [avatar, setAvatar] = useState(currentUser.avatar_url || 'cadet_blue');
  const [guardianName, setGuardianName] = useState(currentUser.guardian_name || '');
  const [guardianPhone, setGuardianPhone] = useState(currentUser.guardian_phone || '');
  const [soundEnabled, setSoundEnabled] = useState(studyPreferences.sound_effects_enabled);
  const [saved, setSaved] = useState(false);

  const avatars = [
    { id: 'cadet_blue', label: 'Cadete Azul', color: 'bg-blue-900' },
    { id: 'cadet_green', label: 'Cadete Verde', color: 'bg-emerald-800' },
    { id: 'cadet_red', label: 'Cadete Vermelho', color: 'bg-red-800' },
    { id: 'cadet_yellow', label: 'Cadete Dourado', color: 'bg-amber-600' },
    { id: 'military_officer', label: 'Oficial Instrutor', color: 'bg-slate-900' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: UserProfile = {
      ...currentUser,
      full_name: fullName.trim(),
      avatar_url: avatar,
      guardian_name: guardianName.trim(),
      guardian_phone: guardianPhone.trim(),
    };

    onUpdateUser(updatedUser);

    const updatedPref = await db.saveStudyPreferences(currentUser.id, {
      sound_effects_enabled: soundEnabled,
    });
    onUpdatePreferences(updatedPref);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-900" />
            Meu Perfil de Estudante
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Informações cadastrais e dados do responsável legal pelo menor.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold capitalize flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Status: {currentUser.account_status}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Avatar Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Escolha seu Avatar Educativo
          </label>
          <div className="flex flex-wrap gap-3">
            {avatars.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setAvatar(av.id)}
                className={`flex items-center gap-2.5 p-2 pr-3.5 rounded-xl border text-xs font-bold transition-all ${
                  avatar === av.id
                    ? 'border-blue-900 bg-blue-50/60 ring-2 ring-blue-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg ${av.color} text-white flex items-center justify-center text-xs font-extrabold shadow-inner`}>
                  {av.label.substring(0, 1)}
                </div>
                <span>{av.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Student details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nome de Usuário Exclusivo
            </label>
            <input
              type="text"
              disabled
              value={currentUser.username}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 font-mono cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              O nome de usuário identifica o estudante no sistema.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Série do Concurso Selecionada
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <GraduationCap className="w-4 h-4 text-blue-900" />
              <span>{currentUser.grade === '6_ano' ? '6º Ano Fundamental' : '7º Ano Fundamental'}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Apenas o superusuário pode alterar a série no banco.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nome do Perfil / Nome Completo do Aluno(a)
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome que aparece no cabeçalho e nos simulados"
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Este é o nome exibido no topo da página e na sua identificação.
          </span>
        </div>

        {/* Legal Guardian Protection for Minors */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-900" />
            Dados do Responsável Legal (Obrigatório para Menores de 18 Anos)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome do Pai / Mãe ou Responsável Legal
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Telefone de Contato do Responsável
              </label>
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>
        </div>

        {/* Sound preferences */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Efeitos Sonoros de Recompensa
            </span>
            <span className="text-[11px] text-slate-500">
              Sons de parabéns ao acertar questões e completar aulas
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Dados atualizados com sucesso!
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
