'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import type { WeightLog, ExerciseLog, MealLog, WaterLog } from '@/types/database';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ReportPage() {
  const supabase = createBrowserClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const prefix = `${year}-${String(month).padStart(2, '0')}`;

    const [{ data: wl }, { data: el }, { data: ml }, { data: wtr }] = await Promise.all([
      supabase.from('weight_logs').select('*').eq('user_id', user.id)
        .gte('logged_at', `${prefix}-01`).lte('logged_at', `${prefix}-31`).order('logged_at'),
      supabase.from('exercise_logs').select('*').eq('user_id', user.id)
        .gte('logged_at', `${prefix}-01`).lte('logged_at', `${prefix}-31`).order('logged_at'),
      supabase.from('meal_logs').select('*').eq('user_id', user.id)
        .gte('logged_at', `${prefix}-01`).lte('logged_at', `${prefix}-31`).order('logged_at'),
      supabase.from('water_logs').select('*').eq('user_id', user.id)
        .gte('logged_at', `${prefix}-01`).lte('logged_at', `${prefix}-31`),
    ]);

    setWeightLogs(wl || []);
    setExerciseLogs(el || []);
    setMealLogs(ml || []);
    setWaterLogs(wtr || []);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  // Computed stats
  const startW = weightLogs[0]?.weight_kg;
  const endW = weightLogs[weightLogs.length - 1]?.weight_kg;
  const weightChange = startW && endW ? startW - endW : null;
  const totalCal = exerciseLogs.reduce((a, e) => a + (e.calories || 0), 0);
  const activeDays = new Set(exerciseLogs.map(e => e.logged_at)).size;
  const mealDays = new Set(mealLogs.map(m => m.logged_at)).size;
  const avgWater = waterLogs.length
    ? (waterLogs.reduce((a, w) => a + w.glasses, 0) / waterLogs.length).toFixed(1) : null;

  // Chart data
  const weightChartData = {
    labels: weightLogs.map(l => new Date(l.logged_at).getDate().toString()),
    datasets: [{
      label: 'Weight (kg)',
      data: weightLogs.map(l => l.weight_kg),
      borderColor: '#3B6D11',
      backgroundColor: 'rgba(59,109,17,0.08)',
      tension: 0.35, pointRadius: 4, pointBackgroundColor: '#3B6D11', fill: true,
    }],
  };

  // Daily exercise count for the month
  const daysInMonth = new Date(year, month, 0).getDate();
  const exByDay = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${d}`;
    return exerciseLogs.filter(e => e.logged_at === dateStr).length;
  });

  const exBarData = {
    labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    datasets: [{
      label: 'Exercises',
      data: exByDay,
      backgroundColor: exByDay.map(v => v > 0 ? '#639922' : '#E8F4D4'),
      borderRadius: 4,
    }],
  };

  // Category breakdown
  const catCounts = exerciseLogs.reduce<Record<string, number>>((a, e) => {
    const name = e.custom_name || 'Custom';
    a[name] = (a[name] || 0) + 1; return a;
  }, {});

  // Meal type breakdown
  const mealCounts = mealLogs.reduce<Record<string, number>>((a, m) => {
    a[m.meal_type] = (a[m.meal_type] || 0) + 1; return a;
  }, {});

  const mealDonutData = {
    labels: Object.keys(mealCounts),
    datasets: [{
      data: Object.values(mealCounts),
      backgroundColor: ['#639922', '#1D9E75', '#3B6D11', '#9FE1CB'],
    }],
  };

  // Heatmap
  const mealsByDay: Record<number, number> = {};
  mealLogs.forEach(m => { const d = parseInt(m.logged_at.slice(8)); mealsByDay[d] = (mealsByDay[d] || 0) + 1; });

  const highlights = [
    weightChange !== null && weightChange > 0 && `🏆 Lost ${weightChange.toFixed(1)} kg this month`,
    weightChange !== null && weightChange <= 0 && `📊 Weight changed by ${Math.abs(weightChange).toFixed(1)} kg`,
    exerciseLogs.length > 0 && `💪 Completed ${exerciseLogs.length} exercises across ${activeDays} active days`,
    totalCal > 0 && `🔥 Burned ${totalCal} total calories through exercise`,
    mealLogs.length > 0 && `🥗 Logged ${mealLogs.length} meals over ${mealDays} days`,
    avgWater && `💧 Averaged ${avgWater} glasses of water per day`,
    activeDays >= 20 && `⭐ Super active month — ${activeDays} days with exercise!`,
  ].filter(Boolean) as string[];

  if (highlights.length === 0) highlights.push('No activity recorded yet. Start logging to see your monthly highlights!');

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { ticks: { font: { size: 9 } }, grid: { display: false } } },
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold pt-2">Monthly report</h1>

      {/* Period selector */}
      <div className="card">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select className="select" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Year</label>
            <select className="select" value={year} onChange={e => setYear(parseInt(e.target.value))}>
              {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon="⚖️" label="Weight change"
              value={weightChange !== null ? `${weightChange >= 0 ? '-' : '+'}${Math.abs(weightChange).toFixed(1)} kg` : '—'}
              positive={weightChange !== null && weightChange > 0} />
            <StatCard icon="🏃" label="Active days" value={`${activeDays} days`} />
            <StatCard icon="💪" label="Exercises done" value={`${exerciseLogs.length}`} />
            <StatCard icon="🔥" label="Cal burned" value={`${totalCal} kcal`} />
            <StatCard icon="🥗" label="Meals logged" value={`${mealLogs.length}`} />
            <StatCard icon="💧" label="Avg water" value={avgWater ? `${avgWater} glasses` : '—'} />
          </div>

          {/* Weight chart */}
          {weightLogs.length > 1 && (
            <div className="card">
              <h3 className="text-sm font-medium mb-3">⚖️ Weight this month</h3>
              <div style={{ height: 180 }}>
                <Line data={weightChartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Exercise bar chart */}
          {exerciseLogs.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium mb-3">💪 Daily exercise activity</h3>
              <div style={{ height: 140 }}>
                <Bar data={exBarData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Meal heatmap */}
          <div className="card">
            <h3 className="text-sm font-medium mb-3">🥗 Meal consistency heatmap</h3>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const count = mealsByDay[i + 1] || 0;
                const bg = count === 0 ? '#F3F4F0' : count === 1 ? '#C0DD97' : count === 2 ? '#639922' : '#27500A';
                const fg = count >= 2 ? '#fff' : '#888';
                return (
                  <div key={i} className="rounded aspect-square flex items-center justify-center text-[9px] font-medium"
                    style={{ background: bg, color: fg }} title={`Day ${i+1}: ${count} meal${count !== 1 ? 's' : ''}`}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-2 text-[10px] text-gray-400 items-center">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#F3F4F0] inline-block" />0 meals</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#C0DD97] inline-block" />1 meal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#639922] inline-block" />2 meals</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#27500A] inline-block" />3+</span>
            </div>
          </div>

          {/* Meal breakdown */}
          {mealLogs.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium mb-3">🍽️ Meal breakdown</h3>
              <div style={{ height: 160 }}>
                <Doughnut data={mealDonutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }} />
              </div>
            </div>
          )}

          {/* Highlights */}
          <div className="card">
            <h3 className="text-sm font-medium mb-3">✨ Month highlights</h3>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-brand-50 rounded-lg px-3 py-2">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Weight log detail */}
          {weightLogs.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium mb-3">📋 Weight log detail</h3>
              <div className="space-y-0 divide-y divide-gray-50">
                {weightLogs.map(log => (
                  <div key={log.id} className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-500">{new Date(log.logged_at).toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <div className="flex items-center gap-3">
                      {log.notes && <span className="text-xs text-gray-400 italic">{log.notes}</span>}
                      <span className="font-medium">{log.weight_kg} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom notes this month */}
          {exerciseLogs.filter(e => e.notes).length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium mb-3">📝 Activity notes</h3>
              <div className="space-y-2">
                {exerciseLogs.filter(e => e.notes).map(e => (
                  <div key={e.id} className="text-sm">
                    <span className="text-gray-500 text-xs">{new Date(e.logged_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} · </span>
                    <span className="italic text-gray-600">{e.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, positive }: { icon: string; label: string; value: string; positive?: boolean }) {
  return (
    <div className="metric-tile">
      <p className="text-lg">{icon}</p>
      <p className={`text-lg font-semibold ${positive ? 'text-brand-500' : ''}`}>{value}</p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  );
}
