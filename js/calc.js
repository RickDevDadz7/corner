// Motor de cálculo — funções puras, testáveis
import { BOX_TYPES, EXERCISES, TEMPLATES, SPLITS, MUSCLES } from './data.js';

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
  const box = (p.boxDays || 0) * sessionKcal(BOX_TYPES[p.boxType || 'saco'].met, p.weight, p.boxMin || 75);
  return (lift + box) / 7;
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

export function targets(p, adaptive) {
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
  let kcal = tdee;
  const rate = p.rate || 0.5; // % do peso por semana
  if (p.goal === 'cut') {
    let deficit = (rate / 100) * p.weight * KCAL_PER_KG / 7;
    const cap = tdee * 0.25;
    if (deficit > cap) { deficit = cap; notes.push('Déficit limitado a 25% do gasto pra proteger massa magra e rendimento no boxe.'); }
    kcal = tdee - deficit;
  } else if (p.goal === 'bulk') {
    const surplus = p.experience === 'iniciante' ? 0.12 : p.experience === 'avancado' ? 0.06 : 0.09;
    kcal = tdee * (1 + surplus);
  }
  const floor = p.sex === 'f' ? 1300 : 1600;
  if (kcal < floor) { kcal = floor; notes.push('Meta travada num piso mínimo. Abaixo disso, só com acompanhamento profissional.'); }

  const lbm = p.bf ? p.weight * (1 - p.bf / 100) : null;
  let protein;
  if (p.goal === 'cut') protein = lbm ? 2.6 * lbm : 2.2 * p.weight;
  else protein = 1.8 * p.weight;
  const fat = Math.max(0.8 * p.weight, (kcal * 0.2) / 9);
  let carbs = (kcal - protein * 4 - fat * 9) / 4;
  if (carbs < 0) carbs = 0;
  if (carbs / p.weight < 3 && (p.boxDays || 0) >= 3) {
    notes.push('Carboidrato abaixo de 3 g/kg com boxe frequente: espere queda nos rounds finais. Considere um déficit menor.');
  }
  const trainHours = ((p.liftDays || 0) * (p.liftMin || 60) + (p.boxDays || 0) * (p.boxMin || 75)) / 60 / 7;
  const water = 35 * p.weight + 500 * trainHours * 1.0;
  const weekChange = (kcal - tdee) * 7 / KCAL_PER_KG;
  return {
    bmr: b.value, bmrMethod: b.method, neat: b.value * p.neat, ex, formula, tdee, source,
    kcal: Math.round(kcal), protein: Math.round(protein), fat: Math.round(fat), carbs: Math.round(carbs),
    water: Math.round(water / 100) * 100, fiber: Math.round(kcal / 1000 * 14), weekChange, notes
  };
}

export function buildPlan(p) {
  const d = Math.min(6, Math.max(2, p.liftDays || 3));
  const split = SPLITS[d];
  const reduce = p.experience === 'iniciante' || (p.boxDays || 0) >= 4;
  const days = split.days.map((key, i) => {
    const t = TEMPLATES[key];
    return {
      key, idx: i, name: t.name,
      items: t.list.map(([ex, sets, lo, hi]) => {
        const e = EXERCISES[ex];
        let s = sets;
        if (reduce && e.t !== 'power' && s >= 3) s -= 1;
        return { ex, sets: s, lo, hi, rir: e.t === 'power' ? null : (p.experience === 'iniciante' ? '2–3' : '1–2'), rest: e.t === 'comp' ? '2–3 min' : e.t === 'power' ? '1–2 min' : '1–2 min' };
      })
    };
  });
  const vol = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0]));
  for (const day of days) for (const it of day.items) {
    for (const [m, f] of Object.entries(EXERCISES[it.ex].m)) vol[m] += it.sets * f;
  }
  return { split: split.name, days, vol, reduced: reduce };
}

// Sugestão de dupla progressão com base na última sessão
export function suggest(item, lastSets) {
  const e = EXERCISES[item.ex];
  if (!lastSets || !lastSets.length) return { text: e.t === 'power' ? 'Máxima velocidade, sem fadiga.' : 'Primeira vez: escolha uma carga que deixe ' + (item.rir || '2') + ' reps na reserva.' };
  const done = lastSets.filter(s => s.kg != null && s.reps != null);
  if (!done.length) return { text: 'Sem registro completo da última vez.' };
  const kg = Math.max(...done.map(s => +s.kg || 0));
  const allTop = done.length >= item.sets && done.every(s => +s.reps >= item.hi);
  if (e.inc && allTop) return { kg: +(kg + e.inc).toFixed(1), text: `Bateu o topo da faixa: suba pra ${fmt(kg + e.inc)} kg e mire em ${item.lo} reps.` };
  return { kg, text: `Mantenha ${fmt(kg)} kg e tente +1 rep nas séries abaixo de ${item.hi}.` };
}

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
