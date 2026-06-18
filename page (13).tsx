'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Group, GroupMember, Challenge, ChallengeProgress, Profile } from '@/types/database';

interface MemberWithProfile extends GroupMember {
  profiles: Profile;
}

interface ChallengeWithProgress extends Challenge {
  challenge_progress: ChallengeProgress[];
}

export default function GroupPage() {
  const supabase = createBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [challengeForm, setChallengeForm] = useState({ title: '', description: '', type: 'weight_loss', target_value: '', ends_at: '' });

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: gm } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('user_id', user.id);

    const userGroups = (gm || []).map((m: { groups: Group }) => m.groups).filter(Boolean) as Group[];
    setGroups(userGroups);

    if (userGroups.length > 0 && !activeGroup) {
      setActiveGroup(userGroups[0]);
    }
  }, [activeGroup]);

  const loadGroupData = useCallback(async (group: Group) => {
    const [{ data: mems }, { data: chal }] = await Promise.all([
      supabase.from('group_members').select('*, profiles(*)').eq('group_id', group.id),
      supabase.from('challenges').select('*, challenge_progress(*)').eq('group_id', group.id).order('created_at', { ascending: false }),
    ]);
    setMembers((mems as unknown as MemberWithProfile[]) || []);
    setChallenges((chal as unknown as ChallengeWithProgress[]) || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (activeGroup) loadGroupData(activeGroup); }, [activeGroup, loadGroupData]);

  async function createGroup() {
    if (!groupForm.name || !userId) return;
    const { data: g } = await supabase.from('groups').insert({
      name: groupForm.name, description: groupForm.description || null, created_by: userId,
    }).select().single();
    if (g) {
      await supabase.from('group_members').insert({ group_id: g.id, user_id: userId, role: 'admin' });
      toast.success('Group created!');
      setShowCreate(false);
      setGroupForm({ name: '', description: '' });
      load();
      setActiveGroup(g);
    }
  }

  async function joinGroup() {
    if (!inviteCode.trim() || !userId) return;
    const { data: g } = await supabase.from('groups').select('*').eq('invite_code', inviteCode.toUpperCase()).single();
    if (!g) { toast.error('Invalid invite code'); return; }
    const { error } = await supabase.from('group_members').insert({ group_id: g.id, user_id: userId, role: 'member' });
    if (error) { toast.error('Already in this group'); return; }
    toast.success(`Joined ${g.name}!`);
    setInviteCode('');
    load();
    setActiveGroup(g);
  }

  async function createChallenge() {
    if (!challengeForm.title || !userId || !activeGroup) return;
    const { error } = await supabase.from('challenges').insert({
      group_id: activeGroup.id,
      title: challengeForm.title,
      description: challengeForm.description || null,
      type: challengeForm.type as Challenge['type'],
      target_value: challengeForm.target_value ? parseFloat(challengeForm.target_value) : null,
      ends_at: challengeForm.ends_at || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      created_by: userId,
    });
    if (!error) {
      toast.success('Challenge created!');
      setShowChallenge(false);
      loadGroupData(activeGroup);
    }
  }

  // Leaderboard: sort members by weight lost
  const leaderboard = [...members].sort((a, b) => {
    const lostA = (a.profiles.start_weight || 0) - (a.profiles.current_weight || 0);
    const lostB = (b.profiles.start_weight || 0) - (b.profiles.current_weight || 0);
    return lostB - lostA;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold pt-2">Group</h1>

      {/* No groups state */}
      {groups.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm font-medium">Join or create a group</p>
          <p className="text-xs text-gray-400 mt-1">Track progress together with your friends</p>
        </div>
      )}

      {/* Group switcher */}
      {groups.length > 0 && (
        <div className="tab-bar">
          {groups.map(g => (
            <button key={g.id} onClick={() => setActiveGroup(g)}
              className={`tab ${activeGroup?.id === g.id ? 'active' : ''}`}>{g.name}</button>
          ))}
        </div>
      )}

      {/* Create / Join */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowCreate(s => !s)} className="btn-secondary justify-center text-sm">
          + Create group
        </button>
        <div className="flex gap-1">
          <input className="input text-xs" placeholder="Invite code" value={inviteCode}
            onChange={e => setInviteCode(e.target.value)} />
          <button onClick={joinGroup} className="btn-primary text-xs px-3 flex-shrink-0">Join</button>
        </div>
      </div>

      {showCreate && (
        <div className="card animate-fade-up">
          <h3 className="text-sm font-medium mb-3">Create a group</h3>
          <div className="space-y-2">
            <input className="input" placeholder="Group name" value={groupForm.name}
              onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} />
            <input className="input" placeholder="Description (optional)" value={groupForm.description}
              onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))} />
            <div className="flex gap-2">
              <button onClick={createGroup} className="btn-primary flex-1 justify-center text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary px-4 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite code display */}
      {activeGroup && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-brand-600 font-medium">Invite friends</p>
            <p className="text-lg font-bold text-brand-700 tracking-widest">{activeGroup.invite_code}</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(activeGroup.invite_code); toast.success('Code copied!'); }}
            className="text-xs text-brand-500 border border-brand-200 px-3 py-1.5 rounded-lg">
            Copy
          </button>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium mb-3">🏆 Leaderboard</h3>
          <div className="space-y-0 divide-y divide-gray-50">
            {leaderboard.map((m, i) => {
              const lost = Math.max(0, (m.profiles.start_weight || 0) - (m.profiles.current_weight || 0));
              const total = (m.profiles.start_weight || 0) - (m.profiles.target_weight || 0);
              const pct = total > 0 ? Math.min(100, Math.round((lost / total) * 100)) : 0;
              const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
              return (
                <div key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-lg w-8 text-center">{rankEmoji}</span>
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-medium flex-shrink-0">
                    {(m.profiles.full_name || m.profiles.username || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.profiles.full_name || m.profiles.username}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="progress-track flex-1" style={{ height: 5 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{pct}%</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-brand-500 flex-shrink-0">-{lost.toFixed(1)} kg</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Challenges */}
      {activeGroup && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold">🏁 Challenges</h2>
            <button onClick={() => setShowChallenge(s => !s)} className="btn-secondary text-xs px-3 py-1.5">
              + New
            </button>
          </div>

          {showChallenge && (
            <div className="card animate-fade-up">
              <h3 className="text-sm font-medium mb-3">Create challenge</h3>
              <div className="space-y-3">
                <input className="input" placeholder="Challenge title" value={challengeForm.title}
                  onChange={e => setChallengeForm(f => ({ ...f, title: e.target.value }))} />
                <input className="input" placeholder="Goal description" value={challengeForm.description}
                  onChange={e => setChallengeForm(f => ({ ...f, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="select" value={challengeForm.type}
                    onChange={e => setChallengeForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="weight_loss">Weight loss</option>
                    <option value="exercise_streak">Exercise streak</option>
                    <option value="step_count">Step count</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input type="date" className="input" value={challengeForm.ends_at}
                    onChange={e => setChallengeForm(f => ({ ...f, ends_at: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={createChallenge} className="btn-primary flex-1 justify-center text-sm">Create</button>
                  <button onClick={() => setShowChallenge(false)} className="btn-secondary px-4 text-sm">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {challenges.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-sm text-gray-400">No challenges yet. Create one to compete!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map(ch => {
                const typeLabel: Record<string, string> = { weight_loss: 'Weight loss', exercise_streak: 'Exercise streak', step_count: 'Step count', custom: 'Custom' };
                const daysLeft = Math.max(0, Math.ceil((new Date(ch.ends_at).getTime() - Date.now()) / 86400000));
                return (
                  <div key={ch.id} className="card">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">{ch.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ch.description}</p>
                      </div>
                      <span className="badge badge-amber flex-shrink-0 ml-2">{typeLabel[ch.type]}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
                      <span>Ends {new Date(ch.ends_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {/* Participant scores */}
                    <div className="mt-3 space-y-1">
                      {ch.challenge_progress.sort((a, b) => b.score - a.score).map(cp => {
                        const mem = members.find(m => m.user_id === cp.user_id);
                        return (
                          <div key={cp.id} className="flex items-center gap-2 text-xs">
                            <span className="w-20 truncate text-gray-600">
                              {mem?.profiles?.full_name || mem?.profiles?.username || 'User'}
                            </span>
                            <div className="progress-track flex-1" style={{ height: 5 }}>
                              <div className="progress-fill" style={{ width: `${cp.score}%` }} />
                            </div>
                            <span className="text-gray-500 w-8 text-right">{cp.score}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
