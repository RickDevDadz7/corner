// ============================================================
// RONIN — motor do cronômetro de rounds (puro, sem DOM).
// Conta pelo relógio (horário em que a fase termina), não por "ticks":
// sair do app, bloquear a tela ou o navegador congelar não atrasa nada.
// Ao voltar, catchUp() avança todas as fases que terminaram enquanto isso.
// O estado é salvo no aparelho e sobrevive ao app fechar.
//
// Ganchos pro app nativo (Android/iPhone): bridge.update(st) é chamado a cada
// mudança de fase/pausa; lá ele vai alimentar a notificação fixa (Android)
// ou a Live Activity (iPhone) e agendar os sinais sonoros com o app em segundo plano.
// ============================================================
const KEY = 'ronin:run';
export const bridge = { update: null };

// fases: [{k: 'prep'|'round'|'rest', d: segundos, r: nº do round}]
export function phasesOf(rounds, cfg, prep = 10) {
  const out = prep ? [{ k: 'prep', d: prep, r: 1 }] : [];
  for (let r = 1; r <= rounds; r++) {
    const c = cfg(r); out.push({ k: 'round', d: Math.max(1, c.work | 0), r });
    if (r < rounds && c.rest > 0) out.push({ k: 'rest', d: c.rest | 0, r: r + 1 });
  }
  return out;
}

export function start(phases, meta = {}, now = Date.now(), key = KEY) {
  const st = { v: 1, key, phases, i: 0, end: now + phases[0].d * 1000, paused: false, left: phases[0].d, startedAt: now, pausedMs: 0, pausedAt: 0, prep: phases[0].k === 'prep' ? phases[0].d : 0, meta, done: false, saved: false };
  persist(st); return st;
}

// segundos que faltam na fase atual
export const leftOf = (st, now = Date.now()) => st.done ? 0 : st.paused ? st.left : Math.max(0, Math.ceil((st.end - now) / 1000));

// avança fases vencidas; devolve as transições que aconteceram (pra tocar som só da última)
export function catchUp(st, now = Date.now()) {
  const ev = [];
  if (st.done || st.paused) return ev;
  while (now >= st.end) {
    if (st.i >= st.phases.length - 1) { st.done = true; st.doneAt = st.end; ev.push({ k: 'done' }); break; }
    st.i++; st.end += st.phases[st.i].d * 1000; ev.push({ ...st.phases[st.i] });
  }
  if (ev.length) persist(st);
  return ev;
}

export function pause(st, now = Date.now()) { if (st.paused || st.done) return; st.left = leftOf(st, now); st.paused = true; st.pausedAt = now; persist(st); }
export function resume(st, now = Date.now()) { if (!st.paused) return; st.paused = false; st.pausedMs = (st.pausedMs || 0) + (now - (st.pausedAt || now)); st.end = now + st.left * 1000; persist(st); }

// pula pra fase j (pular descanso / próximo round / voltar)
export function jump(st, j, now = Date.now()) {
  if (j >= st.phases.length) { st.done = true; st.doneAt = now; persist(st); return; }
  st.i = Math.max(0, j); const d = st.phases[st.i].d;
  if (st.paused) st.left = d; else st.end = now + d * 1000;
  persist(st);
}
export function skipRest(st, now) { if (st.phases[st.i]?.k !== 'round') jump(st, st.i + 1, now); }
export function nextRound(st, now) { let j = st.i + 1; while (j < st.phases.length && st.phases[j].k !== 'round') j++; jump(st, j, now); }

// volta pro começo do exercício/round anterior (ou do atual, se estiver no descanso antes dele)
export function prevRound(st, now) { let j = st.i - 1; while (j > 0 && st.phases[j].k !== 'round') j--; if (st.phases[st.i].k === 'round') { j--; while (j > 0 && st.phases[j].k !== 'round') j--; } jump(st, Math.max(st.phases[0].k === 'prep' ? 1 : 0, j), now); }
export const cur = st => st.phases[Math.min(st.i, st.phases.length - 1)];
export const roundsTotal = st => st.phases.filter(p => p.k === 'round').length;
// tempo total que falta (fase atual + as próximas)
export function totalLeft(st, now = Date.now()) {
  if (st.done) return 0;
  return leftOf(st, now) + st.phases.slice(st.i + 1).reduce((a, p) => a + p.d, 0);
}
// rounds completos (pra salvar o que foi feito quando encerra antes)
export function roundsDone(st) {
  if (st.done) return roundsTotal(st);
  return st.phases.slice(0, st.i).filter(p => p.k === 'round').length;
}
// minutos treinados = tempo de relógio desde o início, sem pausas e sem a contagem inicial (pular descanso não conta tempo que não houve)
export function minutesDone(st, now = Date.now()) {
  const endT = st.done ? (st.doneAt || now) : st.paused ? (st.pausedAt || now) : now;
  return Math.max(0, Math.round((endT - st.startedAt - (st.pausedMs || 0) - (st.prep || 0) * 1000) / 60000));
}

export function persist(st, key = st?.key || KEY) {
  try { if (st) localStorage.setItem(key, JSON.stringify(st)); else localStorage.removeItem(key); } catch (e) { }
  try { bridge.update?.(st); } catch (e) { }
}
// estado salvo: valida antes de usar (pode vir torto)
export function restore(key = KEY) {
  try {
    const st = JSON.parse(localStorage.getItem(key) || 'null');
    if (!st || st.v !== 1 || !Array.isArray(st.phases) || !st.phases.length || st.phases.length > 400) return null;
    if (!st.phases.every(p => p && ['prep', 'round', 'rest'].includes(p.k) && p.d > 0 && p.d < 7200)) return null;
    if (typeof st.end !== 'number' || typeof st.i !== 'number') return null;
    // treino abandonado há mais de 6 h não volta
    if (Date.now() - (st.startedAt || 0) > 6 * 3600e3) { persist(null, key); return null; }
    st.key = key;
    return st;
  } catch (e) { return null; }
}
