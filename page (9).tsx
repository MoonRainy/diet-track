'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Exercise, ExerciseLog } from '@/types/database';

type Category = 'All' | 'Cardio' | 'Home Workout' | 'Gym' | 'Outdoor' | 'Other';

export default function ExercisePage() {
  const supabase = createBrowserClient();
  const today = new Date().toISOString().slice(0, 10);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [todayLogs, setTodayLogs] = useState<ExerciseLog[]>([]);
  const [cat, setCat] = useState<Category>('All');
  const [showCustom, setShowCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', category: 'Other', calories: '', difficulty: 'Easy', duration: '', notes: '' });
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const [{ data: ex }, { data: logs }] = await Promise.all([
      supabase.from('exercises').select('*').or(`is_default.eq.true,created_by.eq.${user.id}`).order('category').order('name'),
      supabase.from('exercise_logs').select('*').eq('user_id', user.id).eq('logged_at', today),
    ]);
    setExercises(ex || []);
    setTodayLogs(logs || []);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  async function toggleExercise(ex: Exercise) {
    if (!userId) return;
    const done = todayLogs.some(l => l.exercise_id === ex.id);
    if (done) {
      await supabase.from('exercise_logs').delete()
        .eq('user_id', userId).eq('exercise_id', ex.id).eq('logged_at', today);
      toast.success('Unmarked');
    } else {
      await supabase.from('exercise_logs').insert({
        user_id: userId, exercise_id: ex.id, logged_at: today,
        calories: ex.calories, duration: ex.duration, completed: true,
      });
      toast.success(`✓ ${ex.name}!`);
    }
    load();
  }

  async function addCustomExercise() {
    if (!customForm.name || !userId) { toast.error('Enter exercise name'); return; }
    const { data: newEx } = await supabase.from('exercises').insert({
      name: customForm.name,
      category: customForm.category as Exercise['category'],
      calories: parseInt(customForm.calories) || 0,
      difficulty: customForm.difficulty as Exercise['difficulty'],
      duration: customForm.duration || null,
      description: customForm.notes || null,
      is_default: false,
      created_by: userId,
    }).select().single();
    if (newEx) {
      await supabase.from('exercise_logs').insert({
        user_id: userId, exercise_id: newEx.id, logged_at: today,
        calories: newEx.calories, duration: newEx.duration, completed: true,
        custom_name: newEx.name,
      });
      toast.success('Custom exercise added & logged!');
      setShowCustom(false);
      setCustomForm({ name: '', category: 'Other', calories: '', difficulty: 'Easy', duration: '', notes: '' });
      load();
    }
  }

  const CATS: Category[] = ['All', 'Cardio', 'Home Workout', 'Gym', 'Outdoor', 'Other'];
  const filtered = cat === 'All' ? exercises : exercises.filter(e => e.category === cat);
  const totalCalToday = todayLogs.reduce((a, l) => a + (l.calories || 0), 0);
  const doneCount = todayLogs.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-semibold">Exercise</h1>
        <button onClick={() => setShowCustom(s => !s)} className="btn-secondary text-xs px-3 py-1.5">
          + Custom
        </button>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="metric-tile text-center">
          <p className="text-2xl font-semibold text-brand-500">{doneCount}</p>
          <p className="text-xs text-gray-400">Done today</p>
        </div>
        <div className="metric-tile text-center">
          <p className="text-2xl font-semibold text-orange-500">{totalCalToday}</p>
          <p className="text-xs text-gray-400">Cal burned</p>
        </div>
      </div>

      {/* Custom exercise form */}
      {showCustom && (
        <div className="card border-brand-100 animate-fade-up">
          <h3 className="text-sm font-medium mb-3">Add custom exercise</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input className="input" placeholder="e.g. Badminton 30 min"
                  value={customForm.name} onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select className="select" value={customForm.category}
                  onChange={e => setCustomForm(f => ({ ...f, category: e.target.value }))}>
                  <option>Cardio</option><option>Home Workout</option>
                  <option>Gym</option><option>Outdoor</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cal burned</label>
                <input type="number" className="input" placeholder="150"
                  value={customForm.calories} onChange={e => setCustomForm(f => ({ ...f, calories: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Difficulty</label>
                <select className="select" value={customForm.difficulty}
                  onChange={e => setCustomForm(f => ({ ...f, difficulty: e.target.value }))}>
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Duration</label>
                <input className="input" placeholder="30 min"
                  value={customForm.duration} onChange={e => setCustomForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <input className="input" placeholder="Optional notes"
                  value={customForm.notes} onChange={e => setCustomForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addCustomExercise} className="btn-primary flex-1 justify-center text-sm">Add & log</button>
              <button onClick={() => setShowCustom(false)} className="btn-secondary px-4 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="tab-bar">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`tab ${cat === c ? 'active' : ''}`}>{c}</button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="card divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No exercises in this category</p>
        ) : filtered.map(ex => {
          const done = todayLogs.some(l => l.exercise_id === ex.id);
          const diffColor = ex.difficulty === 'Easy' ? 'badge-green' : ex.difficulty === 'Medium' ? 'badge-amber' : 'badge-red';
          return (
            <div key={ex.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <button onClick={() => toggleExercise(ex)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${done ? 'bg-brand-500 border-brand-500' : 'border-gray-300 hover:border-brand-400'}`}>
                {done && <span className="text-white text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : ''}`}>{ex.name}</p>
                <p className="text-xs text-gray-400">{ex.category} · {ex.duration} · {ex.calories} kcal</p>
              </div>
              <span className={`badge ${diffColor} flex-shrink-0`}>{ex.difficulty}</span>
            </div>
          );
        })}
      </div>

      {/* Today's completed */}
      {doneCount > 0 && (
        <div className="card bg-brand-50 border-brand-100">
          <h3 className="text-sm font-medium text-brand-600 mb-2">🎉 Today's completed</h3>
          {todayLogs.map(log => (
            <div key={log.id} className="flex justify-between text-sm text-brand-700 py-1">
              <span>{log.custom_name || exercises.find(e => e.id === log.exercise_id)?.name || 'Exercise'}</span>
              <span className="text-brand-500">{log.calories} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
