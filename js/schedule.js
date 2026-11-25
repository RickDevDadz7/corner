// ============================================================
// RONIN — horários: aprende quando a pessoa come, bebe água e treina (pelos registros) e sugere o dia.
// Funções puras. Base: refeição completa 2–4 h antes do treino ou lanche leve 30–60 min antes (ISSN 2017,
// nutrient timing); proteína ~0,3–0,4 g/kg a cada 3–5 h e depois do treino (ISSN 2017, Schoenfeld 2013);
// 5–7 ml/kg de água ~2–4 h antes do treino (ACSM 2007); treino intenso perto da hora de dormir pode atrasar o
// sono, mas até ~1 h antes costuma não atrapalhar (Stutz 2019).
// ============================================================
const MEAL_DEF = { cafe: 7.5 * 60, almoco: 12.5 * 60, lanche: 16 * 60, jantar: 20 * 60, ceia: 22 * 60 };
const pad = n => String(n).padStart(2, '0');
export const hm = m => `${pad(Math.floor(((m % 1440) + 1440) % 1440 / 60))}:${pad(Math.round(m % 60 + 60) % 60)}`;
export const toMin = h => { const m = /^(\d{1,2}):(\d{2})$/.exec(h || ''); return m ? +m[1] * 60 + +m[2] : null; };
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), i = s.length >> 1; return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2; };
// minuto do dia de um registro, só se o registro foi feito no próprio dia (registro atrasado não ensina horário)
function minOf(t, key) { if (typeof t !== 'number' || !Number.isFinite(t)) return null; const d = new Date(t); return dkey(d) === key ? d.getHours() * 60 + d.getMinutes() : null; }

// hábitos dos últimos 28 dias: precisa de 3+ registros pra valer
export function habits(logs, todayKey, days = 28) {
  const end = new Date(todayKey + 'T12:00'), keys = Array.from({ length: days }, (_, i) => { const d = new Date(end); d.setDate(d.getDate() - i - 1); return dkey(d); });
  const meal = {}, water = { first: [], last: [] }, lift = [];
  for (const k of keys) {
    const firstOf = {};
    for (const it of logs?.food?.[k] || []) { const m = minOf(it?.t, k); if (m == null || typeof it.m !== 'string') continue; if (firstOf[it.m] == null || m < firstOf[it.m]) firstOf[it.m] = m; }
    for (const [id, m] of Object.entries(firstOf)) (meal[id] ||= []).push(m);
    const ws = (logs?.water?.[k] || []).map(x => minOf(x?.t, k)).filter(m => m != null);
    if (ws.length) { water.first.push(Math.min(...ws)); water.last.push(Math.max(...ws)); }
  }
  for (const w of logs?.workouts || []) if (typeof w?.date === 'string' && keys.includes(w.date)) { const m = minOf(w.start, w.date); if (m != null) lift.push(m); }
  const ok = a => a && a.length >= 3 ? Math.round(median(a) / 5) * 5 : null;
  const out = { meals: {}, waterFirst: ok(water.first), waterLast: ok(water.last), lift: ok(lift), n: 0 };
  for (const [id, a] of Object.entries(meal)) { const v = ok(a); if (v != null) { out.meals[id] = v; out.n++; } }
  return out;
}

// sugestão do dia: linha do tempo [{m, k: 'meal'|'train'|'water'|'tip', t}]
// plan = atividades do dia na Minha semana [{a, n, h}]; meals = ids das refeições do dia; o = {weight, water, proteinPerMeal}
export function daySchedule(plan, meals, hab, o = {}) {
  const usual = id => hab?.meals?.[id] ?? MEAL_DEF[id];
  const items = [], meal = {};
  for (const id of meals) meal[id] = usual(id);
  const trains = (plan || []).map(x => ({ ...x, m: toMin(x.h) ?? (x.a === 'forca' && hab?.lift != null ? hab.lift : null) })).filter(x => x.m != null).sort((a, b) => a.m - b.m);
  // refeição que cai em cima do treino (ou menos de 1 h antes) vai pra depois dele
  const moved = {};
  for (const tr of trains) for (const id of meals) { const end = tr.m + (tr.min || 60); if (meal[id] > tr.m - 60 && meal[id] < end) { meal[id] = end + 20; moved[id] = 1; } }
  const pg = Math.round((o.weight || 70) * 0.3 / 5) * 5, pg2 = Math.round((o.weight || 70) * 0.4 / 5) * 5;
  for (const tr of trains) {
    const before = meals.filter(id => meal[id] <= tr.m - 30).sort((a, b) => meal[b] - meal[a])[0], gap = before ? tr.m - meal[before] : 999;
    if (tr.m < 9 * 60 && gap > 240) items.push({ m: tr.m - 45, k: 'meal', t: `Lanche leve antes do treino (banana, pão com mel ou iogurte). Treinar em jejum também vale se você se sente bem.` });
    else if (gap > 240) items.push({ m: tr.m - 75, k: 'meal', t: `Lanche 1 h antes do treino: carboidrato fácil + um pouco de proteína (fruta e iogurte, pão com ovo).` });
    else if (gap < 75 && before) items.push({ m: meal[before], k: 'tip', t: `Comer muito perto do treino pesa. Se der, ${before === 'almoco' || before === 'jantar' ? 'faça essa refeição mais leve ou ' : ''}deixe 2 h entre a refeição completa e o treino.` });
    items.push(tr.m < 8 * 60 ? { m: tr.m - 50, k: 'water', t: '300–500 ml de água ao acordar, antes do treino.' } : { m: tr.m - 120, k: 'water', t: '400–600 ml de água nas 2 h antes do treino.' });
    items.push({ m: tr.m, k: 'train', t: `${tr.n}${tr.min ? ` (~${tr.min} min)` : ''}. Durante: goles de água; passou de 1 h, 150–250 ml a cada 15–20 min.` });
    const after = meals.filter(id => meal[id] >= tr.m && meal[id] <= tr.m + (tr.min || 60) + 120)[0];
    items.push({ m: after ? meal[after] + 1 : tr.m + (tr.min || 60) + 30, k: after ? 'tip' : 'meal', t: after ? `Pós-treino: a próxima refeição já cai na janela. Garanta ${pg}–${pg2} g de proteína nela.` : `Pós-treino: ${pg}–${pg2} g de proteína em até 2 h (refeição ou lanche).` });
    if (tr.m >= 21 * 60) items.push({ m: tr.m + (tr.min || 60), k: 'tip', t: 'Treino tarde: tente terminar 1 h antes de dormir. Banho morno e luz baixa depois ajudam o sono.' });
  }
  const NM = { cafe: 'Café da manhã', almoco: 'Almoço', lanche: 'Lanche da tarde', jantar: 'Jantar', ceia: 'Ceia (proteína de digestão lenta: iogurte, leite, cottage)' };
  for (const id of meals) items.push({ m: meal[id], k: 'meal', t: (NM[id] || id) + (moved[id] ? ' (depois do treino)' : ''), usual: !moved[id] && hab?.meals?.[id] != null });
  // água espalhada no dia acordado
  const wake = Math.min(hab?.waterFirst ?? 1e9, meal[meals[0]] ?? 1e9, 7 * 60, (trains[0]?.m ?? 1e9) - 50), last = Math.min(22 * 60, Math.max(meal[meals[meals.length - 1]] ?? 0, hab?.waterLast ?? 0, 20 * 60));
  if (o.water) { const hrs = Math.max(8, (last - wake) / 60), per = Math.round(o.water / hrs / 50) * 50; items.push({ m: wake, k: 'water', t: `Água: ~${per} ml por hora até ${hm(last)} (${(o.water / 1000).toFixed(1).replace('.', ',')} L no dia). Volume grande 1 h antes de dormir atrapalha o sono.` }); }
  return items.sort((a, b) => a.m - b.m || (a.k === 'train' ? 1 : 0) - (b.k === 'train' ? 1 : 0));
}
