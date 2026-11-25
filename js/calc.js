// Motor de cálculo — funções puras, testáveis
import { EXERCISES, TEMPLATES, SPLITS, MUSCLES, SLOTS, EQUIP, COMBOS } from './data.js';
import { SPORTS, typesOf, metOf } from './sports.js';

// Esportes do perfil (migra o formato antigo, que só tinha boxe)
export function sportsOf(p) {
  if (p.sports && typeof p.sports === 'object') return p.sports;
  if (p.boxDays) return { boxe: { days: p.boxDays, min: p.boxMin || 60, type: p.boxType && SPORTS.boxe.types[p.boxType] ? p.boxType : 'tecnica', where: p.boxWhere || 'casa' } };
  return {};
}
export const sportDays = p => Object.values(sportsOf(p)).reduce((a, s) => a + (+s.days || 0), 0);

// ---------- Minha semana: o que a pessoa faz em cada dia (0 = segunda … 6 = domingo) ----------
export const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const wdOk = a => Array.isArray(a) ? [...new Set(a.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 6))].sort((x, y) => x - y) : null;
export const hOk = h => typeof h === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(h) ? h : '';
// perfil antigo (só "N dias por semana"): espalha os dias e foge dos já ocupados
const PAT = { 0: [], 1: [2], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };
export function spreadDays(n, taken = []) {
  const base = PAT[Math.max(0, Math.min(7, Math.round(+n || 0)))]; let best = base, bs = 1e9;
  for (let k = 0; k < 7; k++) { const c = base.map(d => (d + k) % 7).sort((a, b) => a - b), sc = c.filter(d => taken.includes(d)).length * 10 + c.filter(d => d >= 5).length; if (sc < bs) { bs = sc; best = c; } }
  return best;
}
// semana completa: [{a: 'forca'|esporte, h}] por dia; explicit = a pessoa já marcou os dias
export function weekOf(p) {
  const days = Array.from({ length: 7 }, () => []), sp = sportsOf(p || {}), taken = [];
  let explicit = false;
  for (const [id, s] of Object.entries(sp)) {
    if (!SPORTS[id] || !s) continue;
    const wd = wdOk(s.wd); if (wd) explicit = true;
    for (const d of wd || spreadDays(s.days, taken)) { days[d].push({ a: id, h: hOk(s.h) }); taken.push(d); }
  }
  const lift = Math.max(0, Math.min(6, Math.round(+p?.liftDays || 0))), lw = wdOk(p?.liftWd);
  if (lw) explicit = true;
  for (const d of lw || spreadDays(lift, taken)) days[d].push({ a: 'forca', h: hOk(p?.liftH) });
  for (const l of days) l.sort((x, y) => (x.h || '99') < (y.h || '99') ? -1 : 1);
  return { days, explicit };
}
export const weekdayOf = k => (new Date(k + 'T12:00').getDay() + 6) % 7;

export const NEAT = {
  1.2: 'Sedentário (escritório, < 5 mil passos)',
  1.3: 'Pouco ativo (5–8 mil passos)',
  1.45: 'Ativo (8–12 mil passos ou trabalho em pé)',
  1.6: 'Muito ativo (trabalho físico pesado)'
};

export const GOALS = {
  cut: 'Secar (perder gordura)',
  recomp: 'Manter peso / recomposição',
  bulk: 'Ganhar massa (bulking limpo)'
};

const LIFT_MET = 5.0; // musculação, esforço moderado-vigoroso (Ainsworth 2011: 3,5–6,0)
const KCAL_PER_KG = 7700;

export function bmr(p) {
  if (p.bf && p.bf > 3 && p.bf < 60) {
    const lbm = p.weight * (1 - p.bf / 100);
    return { value: 370 + 21.6 * lbm, method: 'Katch-McArdle' };
  }
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return { value: base + (p.sex === 'f' ? -161 : 5), method: 'Mifflin-St Jeor' };
}

// Gasto líquido (acima do repouso) de uma sessão
export function sessionKcal(met, kg, minutes) {
  return Math.max(0, (met - 1)) * kg * (minutes / 60);
}

export function exerciseKcalPerDay(p) {
  const lift = (p.liftDays || 0) * sessionKcal(LIFT_MET, p.weight, p.liftMin || 60);
  let sp = 0;
  for (const [id, s] of Object.entries(sportsOf(p))) {
    const S = SPORTS[id]; if (!S) continue;
    const met = metOf(id, typesOf(id, s)); // várias escolhas: média dos METs
    sp += (+s.days || 0) * sessionKcal(met, p.weight, +s.min || 60);
  }
  return (lift + sp) / 7;
}

// TDEE observado a partir de peso e ingestão registrados
export function adaptiveTDEE(weights, foodTotals, today = new Date()) {
  const DAYS = 28;
  const pts = [];
  const intakes = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const k = dayKey(d);
    if (weights[k] != null) pts.push([DAYS - 1 - i, weights[k]]);
    if (foodTotals[k] && foodTotals[k] > 600) intakes.push(foodTotals[k]);
  }
  if (pts.length < 8 || intakes.length < 10) {
    return { ready: false, weighIns: pts.length, foodDays: intakes.length };
  }
  const n = pts.length;
  const mx = pts.reduce((s, q) => s + q[0], 0) / n;
  const my = pts.reduce((s, q) => s + q[1], 0) / n;
  let num = 0, den = 0;
  for (const [x, y] of pts) { num += (x - mx) * (y - my); den += (x - mx) ** 2; }
  const slope = den ? num / den : 0; // kg/dia
  const avgIn = intakes.reduce((a, b) => a + b, 0) / intakes.length;
  return { ready: true, tdee: avgIn - slope * KCAL_PER_KG, slopeWeek: slope * 7, avgIn };
}

export function targets(p0, adaptive) {
  // condições de saúde mexem na meta: gestação não emagrece; rim limita proteína
  const cond = Array.isArray(p0.cond) ? p0.cond : [], preg = cond.includes('gestacao') && p0.goal === 'cut';
  const p = preg ? { ...p0, goal: 'recomp' } : p0;
  const b = bmr(p);
  const ex = exerciseKcalPerDay(p);
  const formula = b.value * p.neat + ex;
  let tdee = formula;
  let source = 'fórmula';
  if (adaptive && adaptive.ready) {
    // mistura: dados reais pesam mais conforme se acumulam
    tdee = 0.3 * formula + 0.7 * adaptive.tdee;
    source = 'ajustado pelos seus dados';
  }
  const notes = [];
  if (preg) notes.push({ msg: 'Gestação marcada no perfil: a meta de secar foi trocada por manter. Ganho de peso na gestação se acompanha com o obstetra.', base: 'Dieta restritiva na gestação não é recomendada (ACOG, OMS).' });
  let kcal = tdee, adj = 0;
  const rate = p.rate || 0.5; // % do peso por semana
  if (p.goal === 'cut') {
    let deficit = (rate / 100) * p.weight * KCAL_PER_KG / 7;
    const cap = tdee * 0.25;
    if (deficit > cap) { deficit = cap; notes.push({ msg: 'Déficit limitado a 25% do gasto pra proteger massa magra e rendimento.', base: `O ritmo que você escolheu (${rate}% do peso/semana) pediria ${Math.round((rate / 100) * p.weight * KCAL_PER_KG / 7)} kcal de déficit; o teto é 25% de ${Math.round(tdee)} kcal.` }); }
    kcal = tdee - deficit; adj = -deficit;
  } else if (p.goal === 'bulk') {
    const surplus = p.experience === 'iniciante' ? 0.12 : p.experience === 'avancado' ? 0.06 : 0.09;
    kcal = tdee * (1 + surplus); adj = tdee * surplus;
  }
  const floor = p.sex === 'f' ? 1300 : 1600;
  if (kcal < floor) { kcal = floor; notes.push({ msg: 'Meta travada num piso mínimo. Abaixo disso, só com acompanhamento profissional.', base: `Piso usado: ${floor} kcal (${p.sex === 'f' ? 'mulheres' : 'homens'}).` }); }

  const lbm = p.bf ? p.weight * (1 - p.bf / 100) : null;
  let protein;
  if (p.goal === 'cut') protein = lbm ? 2.6 * lbm : 2.2 * p.weight;
  else protein = 1.8 * p.weight;
  let proteinRule = null;
  if (cond.includes('renal')) { protein = 0.8 * p.weight; proteinRule = '0,8 g por kg (doença renal)'; notes.push({ msg: 'Doença renal marcada: proteína limitada a 0,8 g por kg. Confirme o valor com seu nefrologista ou nutricionista.', base: 'KDIGO 2024: 0,8 g/kg/dia para doença renal crônica sem diálise.' }); }
  const fat = Math.max(0.8 * p.weight, (kcal * 0.2) / 9);
  let carbs = (kcal - protein * 4 - fat * 9) / 4;
  if (carbs < 0) carbs = 0;
  if (carbs / p.weight < 3 && sportDays(p) >= 3) {
    notes.push({ msg: 'Carboidrato abaixo de 3 g/kg com treino frequente: espere queda de rendimento no fim das sessões. Considere um déficit menor.', base: `Sua meta dá ${(carbs / p.weight).toFixed(1).replace('.', ',')} g/kg de carbo e seu perfil tem ${sportDays(p)} treinos do esporte por semana.` });
  }
  const trainHours = ((p.liftDays || 0) * (p.liftMin || 60) + Object.values(sportsOf(p)).reduce((a, s) => a + (+s.days || 0) * (+s.min || 60), 0)) / 60 / 7;
  const water = 35 * p.weight + 500 * trainHours * 1.0;
  const weekChange = (kcal - tdee) * 7 / KCAL_PER_KG;
  return {
    bmr: b.value, bmrMethod: b.method, neat: b.value * p.neat, ex, formula, tdee, source,
    kcal: Math.round(kcal), protein: Math.round(protein), fat: Math.round(fat), carbs: Math.round(carbs),
    water: Math.round(water / 100) * 100, fiber: Math.round(kcal / 1000 * 14), weekChange, notes,
    adj, floored: notes.some(n => n.msg.startsWith('Meta travada')), lbm, trainHours, proteinRule: proteinRule || (p.goal === 'cut' ? (lbm ? '2,6 g por kg de massa magra' : '2,2 g por kg') : '1,8 g por kg'), fatByFloor: 0.8 * p.weight >= (kcal * 0.2) / 9
  };
}

// Equipamento disponível a partir do perfil
export function equipment(p) {
  if (p.env === 'academia' || !p.env) return new Set(['gym', ...Object.keys(EQUIP)]);
  return new Set(p.equip || []);
}
export function canDo(exId, eq) { return EXERCISES[exId].req.every(r => eq.has(r)); }

export function buildPlan(p, prog = {}) {
  const d = Math.min(6, Math.max(0, p.liftDays ?? 3));
  if (!d) return { split: 'Sem dias de força', days: [], vol: Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0])), reduced: false, none: true };
  const split = SPLITS[d];
  const eq = equipment(p);
  const reduce = p.experience === 'iniciante' || sportDays(p) >= 4;
  const extra = [];
  for (const id of Object.keys(sportsOf(p))) for (const x of (SPORTS[id]?.sc || [])) if (!extra.some(e => e[0] === x[0])) extra.push(x);
  const startLvl = p.experience === 'iniciante' ? 0 : 1;
  const days = split.days.map((key, i) => {
    const t = TEMPLATES[key], used = new Set();
    const items = [];
    for (const [slot, sets, lo, hi] of [...t.list, ...extra]) {
      const ex = SLOTS[slot].find(id => canDo(id, eq) && !used.has(id));
      if (!ex) continue;
      used.add(ex);
      const e = EXERCISES[ex];
      let s = sets;
      if (reduce && e.t !== 'power' && s >= 3) s -= 1;
      const [rlo, rhi] = e.r || [lo, hi];
      const lvl = e.vars ? Math.min(e.vars.length - 1, prog[ex] ?? startLvl) : null;
      items.push({ ex, sets: s, lo: rlo, hi: rhi, lvl, name: e.vars ? e.vars[lvl] : e.n,
        rir: e.t === 'power' ? null : (p.experience === 'iniciante' ? '2–3' : '1–2'),
        rest: e.t === 'comp' ? '2–3 min' : '1–2 min' });
    }
    return { key, idx: i, name: t.name, items };
  });
  const vol = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0]));
  for (const day of days) for (const it of day.items) {
    for (const [m, f] of Object.entries(EXERCISES[it.ex].m)) vol[m] += it.sets * f;
  }
  return { split: split.name, days, vol, reduced: reduce, home: p.env === 'casa' };
}

// Sugestão de progressão com base na última sessão
export function suggest(item, lastSets) {
  const e = EXERCISES[item.ex];
  if (e.t === 'power') return { text: 'Máxima velocidade, sem fadiga. Pare antes de ficar lento.' };
  if (!lastSets || !lastSets.length) {
    if (e.vars) return { text: `Comece aqui. Se passar de ${item.hi} reps fácil, avance a variação.` };
    if (e.band) return { text: 'Escolha um elástico que deixe ' + (item.rir || '2') + ' reps na reserva.' };
    return { text: 'Primeira vez: escolha uma carga que deixe ' + (item.rir || '2') + ' reps na reserva.' };
  }
  const done = lastSets.filter(s => s && s.reps != null);
  if (!done.length) return { text: 'Sem registro completo da última vez.' };
  const allTop = done.length >= item.sets && done.every(s => +s.reps >= item.hi);
  // série registrada com 0 = não saiu: segura a progressão e, se foi metade ou mais, sugere aliviar
  const fails = done.filter(s => +s.reps === 0).length;
  if (fails) {
    const kg0 = Math.max(0, ...done.map(s => +s.kg || 0)), many = fails * 2 >= done.length;
    const lighter = e.inc && kg0 ? Math.max(e.inc, Math.round(kg0 * 0.9 / e.inc) * e.inc) : 0;
    const base = `Da última vez ${fails === 1 ? '1 série não saiu' : fails + ' séries não saíram'}.`;
    if (e.vars) return { text: `${base} Fique na mesma variação e tente completar todas.` };
    if (many && lighter) return { kg: lighter, text: `${base} Baixe pra ${fmt(lighter)} kg e complete todas as séries antes de subir.` };
    return { kg: kg0 || undefined, text: `${base} ${kg0 ? `Mantenha ${fmt(kg0)} kg` : 'Mantenha a dificuldade'} e tente completar todas antes de subir.` };
  }
  if (e.vars) {
    if (allTop && item.lvl < e.vars.length - 1) return { up: true, text: `Bateu ${item.hi}+ em todas: hora de avançar pra "${e.vars[item.lvl + 1]}".` };
    if (allTop) return { text: 'Última variação dominada: adicione mochila com peso ou desça mais devagar (4 s).' };
    return { text: `Mesma variação: tente +1 rep nas séries abaixo de ${item.hi}.` };
  }
  if (e.band) return { text: allTop ? 'Topo da faixa: use um elástico mais forte ou afaste-se da ancoragem.' : `Tente +1 rep nas séries abaixo de ${item.hi}.` };
  const kg = Math.max(...done.map(s => +s.kg || 0));
  if (e.inc && allTop) return { kg: +(kg + e.inc).toFixed(1), text: `Bateu o topo da faixa: suba pra ${fmt(kg + e.inc)} kg e mire em ${item.lo} reps.` };
  return { kg, text: `Mantenha ${fmt(kg)} kg e tente +1 rep nas séries abaixo de ${item.hi}.` };
}

// ---------- Combinações ----------
export function comboPool(level, theme, sportId = 'boxe') {
  const C = SPORTS[sportId]?.combos || COMBOS;
  const lv = ['iniciante', 'intermediario', 'avancado'];
  const upto = lv.slice(0, lv.indexOf(level) + 1).flatMap(l => C[l] || []);
  return theme?.pool ? [...theme.pool, ...C.iniciante.slice(0, 3)] : upto;
}

// "1-2, esquiva" → "um, dois... esquiva" (fala em pt-BR)
const NUM = { 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis' };
export function comboSpeech(c) { return c.replace(/\d/g, d => NUM[d]).replace(/-/g, ', '); }

export function dayKey(d = new Date()) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function fmt(n, dec = 1) {
  if (n == null || isNaN(n)) return '–';
  const r = Math.round(n * 10 ** dec) / 10 ** dec;
  return r.toLocaleString('pt-BR', { maximumFractionDigits: dec });
}

export function movingAvg(series, win = 7) {
  return series.map((_, i) => {
    const s = series.slice(Math.max(0, i - win + 1), i + 1);
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
}
