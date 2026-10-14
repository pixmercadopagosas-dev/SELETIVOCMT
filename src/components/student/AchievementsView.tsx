import React, { useState, useEffect } from 'react';
import { UserProfile, Achievement, UserAchievement, RewardLedgerEntry } from '../../types';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import { Award, Star, CheckCircle2, Lock, Medal, Target, Calendar, Sparkles } from 'lucide-react';
import { db } from '../../lib/databaseEngine';

interface AchievementsViewProps {
  currentUser: UserProfile;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ currentUser }) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [rewardLedger, setRewardLedger] = useState<RewardLedgerEntry[]>([]);

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const loadData = async () => {
    const uach = await db.getUserAchievements(currentUser.id);
    const ledger = await db.getRewardLedger(currentUser.id);
    setUserAchievements(uach);
    setRewardLedger(ledger);
  };

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-yellow-500" />
            <span>Sistema Educativo de Recompensas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Minhas Medalhas e Conquistas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Valorizando seu esforço, constância e evolução diária no Colégio Militar Tiradentes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-yellow-50 border border-yellow-300 rounded-2xl text-yellow-900 text-sm font-extrabold flex items-center gap-2 shadow-xs">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
            <span>{currentUser.total_stars} Estrelas</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACHIEVEMENTS_DATA.map((ach) => {
          const isUnlocked = unlockedIds.has(ach.id);

          return (
            <div
              key={ach.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-yellow-300/80 shadow-xs hover:border-yellow-400'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? <Medal className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                    +{ach.stars_reward} ★
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                  {ach.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                {isUnlocked ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conquistada
                  </span>
                ) : (
                  <span className="text-slate-400">Bloqueada</span>
                )}
                <span className="text-slate-400">+{ach.points_reward} pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reward Ledger (Histórico de Recompensas) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Extrato Transparente de Pontos e Estrelas
        </h2>
        <p className="text-xs text-slate-500">
          Registro contra manipulações: cada estrela corresponde a uma atividade pedagógica legítima.
        </p>

        <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
          {rewardLedger.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-800">{item.reason}</p>
                <span className="text-[10px] text-slate-400">
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold text-amber-600 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>+{item.stars} estrelas</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
