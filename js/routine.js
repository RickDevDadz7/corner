// Rotinas de força: divisões (Full Body, Sup/Inf, PPL, ABC, ABCDEF, personalizada), geração pelo equipamento,
// validação do que vem da nuvem e o "plano" que o resto do app usa (mesmo formato do antigo buildPlan).
import { EXERCISES, TEMPLATES, SLOTS, MUSCLES } from './data.js';
import { equipment, canDo, sportDays, sportsOf } from './calc.js';
import { SPORTS } from './sports.js';

export const SPLIT_DEFS = {
  fb: { n: 'Full Body', d: 'Corpo inteiro em toda sessão. Cada músculo 2 a 3 vezes por semana com poucos dias. Combina bem com esporte.', opts: { 1: ['A'], 2: ['A', 'B'], 3: ['A', 'B', 'C'] } },
  ul: { n: 'Superior / Inferior', d: 'Alterna parte de cima e parte de baixo. Com 4 sessões, cada músculo treina 2 vezes por semana.', opts: { 2: ['U1', 'L1'], 4: ['U1', 'L1', 'U2', 'L2'] } },
  mix: { n: 'Sup/Inf + PPL', d: 'Superior, Inferior, Empurrar, Puxar e Pernas: 5 sessões, cada músculo cerca de 2 vezes.', opts: { 5: ['U1', 'L1', 'PU', 'PL', 'LG'] } },
  ppl: { n: 'Empurrar / Puxar / Pernas', d: 'Empurrar = peito, ombros e tríceps. Puxar = costas e bíceps. Pernas. Com 3 dias cada músculo treina 1 vez; com 6, 2 vezes.', opts: { 3: ['PU', 'PL', 'LG'], 6: ['PU', 'PL', 'LG', 'PU', 'PL', 'LG'] } },
  abc: { n: 'ABC', d: 'Clássico de academia: A peito e tríceps, B costas e bíceps, C pernas e ombros. 3 dias (1 vez por músculo) ou 6 (repete o ciclo).', opts: { 3: ['AA', 'BB', 'CC'], 6: ['AA', 'BB', 'CC', 'AA', 'BB', 'CC'] } },
  abcdef: { n: 'ABCDEF', d: 'Um grupo por dia em 6 dias. Muito volume por sessão e cada músculo só 1 vez por semana: exige boa recuperação.', opts: { 6: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'] } },
  custom: { n: 'Personalizada', d: 'Você monta do zero: quantas sessões quiser, com os exercícios que escolher.', opts: { 1: [] } }
};

const sid = () => 's' + Math.random().toString(36).slice(2, 9);
export const restOf = e => e.t === 'comp' ? 150 : e.t === 'power' ? 120 : e.t === 'iso' ? 90 : 60;
export const fmtRest = s => s >= 60 ? `${Math.floor(s / 60)}${s % 60 ? ':' + String(s % 60).padStart(2, '0') : ''} min` : `${s} s`;
export const repsOf = (it) => it.lo === it.hi ? `${it.lo}` : `${it.lo}–${it.hi}`;

// monta uma sessão a partir de um modelo, escolhendo o exercício possível com o equipamento da pessoa
function fromTemplate(p, key, extra = []) {
  const t = TEMPLATES[key], eq = equipment(p), used = new Set(), items = [];
  const reduce = p.experience === 'iniciante' || sportDays(p) >= 4;
  for (const [slot, sets, lo, hi] of [...t.list, ...extra]) {
    const ex = (SLOTS[slot] || []).find(id => canDo(id, eq) && !used.has(id)); if (!ex) continue;
    used.add(ex); const e = EXERCISES[ex];
    const [rlo, rhi] = e.r || [lo, hi];
    items.push({ ex, slot, sets: reduce && e.t !== 'power' && sets >= 3 ? sets - 1 : sets, lo: rlo, hi: rhi, rest: restOf(e) });
  }
  return { id: sid(), name: t.name, key, items };
}
function sportExtras(p) {
  const out = [];
  for (const id of Object.keys(sportsOf(p))) for (const x of (SPORTS[id]?.sc || [])) if (!out.some(e => e[0] === x[0])) out.push(x);
  return out;
}
export function genRoutine(p, split, days, name) {
  const def = SPLIT_DEFS[split]; const keys = def.opts[days] || Object.values(def.opts)[0];
  const ex = sportExtras(p), seen = {};
  const sessions = split === 'custom' ? [{ id: sid(), name: 'Treino 1', items: [] }] : keys.map((k, i) => {
    // extras do esporte (pegada, pescoço, adutor…) a cada duas sessões, pra não lotar a semana
    const s = fromTemplate(p, k, i % 2 === 0 ? ex : []);
    seen[k] = (seen[k] || 0) + 1; if (keys.filter(x => x === k).length > 1) s.name += ` ${seen[k]}`;
    return s;
  });
  return { id: 'r' + Math.random().toString(36).slice(2, 9), name: name || `${def.n}${keys.length > 1 ? ` ${keys.length}x` : ''}`, split, t: Date.now(), sessions };
}

// recomendação explicável a partir do perfil
export function recommend(p) {
  const d = Math.max(0, Math.min(6, p.liftDays ?? 2)), sd = sportDays(p);
  if (!d) return { split: 'fb', days: 2, why: 'Você marcou 0 dias de força. Se quiser começar, 2 sessões de Full Body por semana já trazem potência e proteção contra lesão.' };
  if (d <= 3) return { split: 'fb', days: Math.max(1, d), why: `Com ${d} ${d === 1 ? 'dia' : 'dias'} de força, Full Body faz cada músculo treinar ${d === 1 ? '1 vez' : `${d} vezes`} por semana, o que costuma render mais que treinar cada grupo 1 vez só.` };
  if (d === 4) return { split: 'ul', days: 4, why: 'Com 4 dias, Superior/Inferior dá 2 sessões por músculo na semana com volume bem distribuído.' };
  if (sd >= 3) return { split: 'ul', days: 4, why: `Você tem ${d} dias de força e ${sd} sessões de esporte. Pra recuperar, a recomendação é ficar em 4 sessões de Superior/Inferior; dá pra mudar se você se sentir bem.` };
  if (d === 5) return { split: 'mix', days: 5, why: 'Com 5 dias, Superior/Inferior + Empurrar/Puxar/Pernas mantém cada músculo perto de 2 vezes por semana.' };
  return { split: 'ppl', days: 6, why: 'Com 6 dias, Empurrar/Puxar/Pernas 2x treina cada músculo 2 vezes por semana.' };
}

// tudo que vem da nuvem passa por aqui antes de virar tela
const INT = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
const ID = /^[A-Za-z0-9_-]{1,40}$/;
export function cleanRoutine(r) {
  if (!r || typeof r !== 'object' || !ID.test(String(r.id))) return null;
  const sessions = (Array.isArray(r.sessions) ? r.sessions : []).slice(0, 14).filter(s => s && typeof s === 'object').map(s => ({
    id: ID.test(String(s.id)) ? s.id : sid(), name: String(s.name || 'Treino').slice(0, 40), key: typeof s.key === 'string' ? s.key.slice(0, 8) : undefined,
    items: (Array.isArray(s.items) ? s.items : []).slice(0, 20).filter(it => it && EXERCISES[it.ex]).map(it => {
      const lo = INT(it.lo, 1, 120, 8), hi = INT(it.hi, lo, 120, Math.max(lo, 12));
      return { ex: it.ex, slot: typeof it.slot === 'string' ? it.slot.slice(0, 20) : undefined, sets: INT(it.sets, 1, 10, 3), lo, hi, rest: INT(it.rest, 0, 600, restOf(EXERCISES[it.ex])) };
    })
  }));
  return { id: r.id, name: String(r.name || 'Minha rotina').slice(0, 40), split: SPLIT_DEFS[r.split] ? r.split : 'custom', t: Number(r.t) || 0, sessions };
}

// alternativas compatíveis: mesma vaga primeiro, depois mesmo músculo principal; marca o que precisa de equipamento que a pessoa não tem
export function alternatives(p, it) {
  const eq = equipment(p), e = EXERCISES[it.ex];
  const main = Object.entries(e.m).filter(([, f]) => f >= 1).map(([m]) => m);
  const same = new Set(it.slot && SLOTS[it.slot] ? SLOTS[it.slot] : Object.entries(SLOTS).filter(([, l]) => l.includes(it.ex)).flatMap(([, l]) => l));
  const list = Object.keys(EXERCISES).filter(id => id !== it.ex && (same.has(id) || (main.length && main.some(m => (EXERCISES[id].m[m] || 0) >= 1) && EXERCISES[id].t === e.t)));
  return list.map(id => ({ id, ok: canDo(id, eq), same: same.has(id) })).sort((a, b) => (b.ok - a.ok) || (b.same - a.same));
}
// biblioteca agrupada pelo músculo principal (pra adicionar exercício)
export function library(p) {
  const eq = equipment(p), g = {};
  for (const [id, e] of Object.entries(EXERCISES)) {
    const main = Object.entries(e.m).sort((a, b) => b[1] - a[1])[0];
    const k = e.t === 'power' ? 'Potência' : e.t === 'prehab' ? 'Prevenção' : main ? MUSCLES[main[0]] : 'Outros';
    (g[k] ||= []).push({ id, ok: canDo(id, eq) });
  }
  return g;
}
export const musclesOf = items => {
  const c = {};
  for (const it of items) for (const [m, f] of Object.entries(EXERCISES[it.ex]?.m || {})) if (f >= 1) c[m] = (c[m] || 0) + it.sets;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([m]) => MUSCLES[m]);
};
