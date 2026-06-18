@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

/* ── Design tokens ── */
:root {
  --brand-50:  #EAF3DE;
  --brand-100: #C0DD97;
  --brand-400: #639922;
  --brand-500: #3B6D11;
  --brand-600: #27500A;
  --teal-400:  #1D9E75;
  --teal-50:   #E1F5EE;
  --radius-sm: 6px;
  --radius:    10px;
  --radius-lg: 14px;
}

/* ── Base ── */
* { box-sizing: border-box; }

html, body {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #F7F9F4;
  color: #1A2A0E;
}

/* ── Cards ── */
.card {
  @apply bg-white rounded-xl border border-gray-100 shadow-sm p-4;
}

.card-sm {
  @apply bg-white rounded-lg border border-gray-100 p-3;
}

/* ── Metric tiles ── */
.metric-tile {
  @apply bg-gray-50 rounded-lg p-3;
}

/* ── Buttons ── */
.btn-primary {
  @apply bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-medium
         rounded-lg px-4 py-2.5 text-sm transition-all inline-flex items-center gap-2;
}

.btn-secondary {
  @apply bg-white hover:bg-gray-50 active:scale-95 text-gray-700 font-medium
         border border-gray-200 rounded-lg px-4 py-2.5 text-sm transition-all
         inline-flex items-center gap-2;
}

.btn-ghost {
  @apply text-gray-600 hover:bg-gray-100 active:scale-95 rounded-lg px-3 py-2
         text-sm transition-all inline-flex items-center gap-2;
}

/* ── Form elements ── */
.input {
  @apply w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm
         placeholder-gray-400 focus:border-brand-400 focus:ring-2
         focus:ring-brand-400/20 focus:outline-none transition-all;
}

.select {
  @apply w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm
         focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20
         focus:outline-none transition-all appearance-none cursor-pointer;
}

/* ── Badges ── */
.badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium;
}

.badge-green  { @apply bg-brand-50 text-brand-600; }
.badge-teal   { @apply bg-teal-50 text-teal-600; }
.badge-amber  { @apply bg-amber-50 text-amber-700; }
.badge-red    { @apply bg-red-50 text-red-700; }
.badge-blue   { @apply bg-blue-50 text-blue-700; }
.badge-gray   { @apply bg-gray-100 text-gray-600; }

/* ── Progress bar ── */
.progress-track {
  @apply h-2.5 bg-gray-100 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-brand-400 to-teal-400 rounded-full transition-all duration-700;
}

/* ── Bottom nav ── */
.bottom-nav {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100
         grid grid-cols-5 z-50 safe-bottom;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.nav-item {
  @apply flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium
         text-gray-400 transition-colors cursor-pointer select-none;
}

.nav-item.active { @apply text-brand-500; }
.nav-item svg    { @apply w-5 h-5; }

/* ── Header ── */
.top-header {
  @apply sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100
         px-4 py-3 flex items-center justify-between;
}

/* ── Page container ── */
.page-container {
  @apply px-4 pb-28 pt-4 min-h-screen;
}

/* ── Skeleton loading ── */
.skeleton {
  @apply bg-gray-100 animate-pulse rounded;
}

/* ── Water dots ── */
.water-dot {
  @apply w-8 h-8 rounded-full border-2 border-teal-200 flex items-center justify-center
         cursor-pointer transition-all duration-200 text-teal-400;
}
.water-dot.filled {
  @apply bg-teal-400 border-teal-400 text-white;
}

/* ── Heatmap cell ── */
.heatmap-cell {
  @apply rounded aspect-square flex items-center justify-center text-[9px];
}

/* ── Tabs ── */
.tab-bar {
  @apply flex gap-2 overflow-x-auto pb-1 scrollbar-hide;
}

.tab {
  @apply px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
         border border-gray-200 text-gray-500 transition-all cursor-pointer;
}
.tab.active { @apply bg-brand-500 text-white border-brand-500; }

/* ── Scrollbar hide ── */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* ── Animations ── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-up { animation: fade-up 0.3s ease-out both; }

/* ── Dark mode ── */
@media (prefers-color-scheme: dark) {
  html, body { background: #0F1A09; color: #E8F4D4; }
  .card  { @apply bg-gray-900 border-gray-800; }
  .card-sm { @apply bg-gray-900 border-gray-800; }
  .metric-tile { @apply bg-gray-800; }
  .input { @apply bg-gray-900 border-gray-700 text-white placeholder-gray-500; }
  .select { @apply bg-gray-900 border-gray-700 text-white; }
  .btn-secondary { @apply bg-gray-800 border-gray-700 text-gray-200; }
  .top-header { @apply bg-gray-950/95 border-gray-800; }
  .bottom-nav { @apply bg-gray-950 border-gray-800; }
  .tab { @apply border-gray-700 text-gray-400; }
}
