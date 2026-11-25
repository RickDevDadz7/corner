// ============================================================
// RONIN — motor do treino de força: objetivo, lesões, prioridades,
// volume que sobe em ciclos (com semana leve), troca de exercícios e estagnação.
// Funções puras: recebem perfil + registros, devolvem plano e explicação.
// Base: Schoenfeld 2017 e Pelland 2024 (dose-resposta de volume), Israetel/RP (MEV→MRV e deload),
// Grgic 2018 (descanso), Helms 2016 (RIR). Valores são pontos de partida, não verdade absoluta.
// ============================================================
import { EXERCISES, SLOTS, TEMPLATES, SPLITS, MUSCLES } from './data.js';
import { equipment, canDo, sportDays, sportsOf } from './calc.js';
import { SPORTS } from './sports.js';
import { CONDITIONS, condsOf, condFlag, bodyOk, caps } from './health.js';

export const TGOALS = {
  luta: { n: 'Render na luta', d: 'Força e potência sem pesar: volume moderado, qualidade alta. O esporte já cansa.' },
  forca: { n: 'Ficar mais forte', d: 'Cargas altas, poucas repetições, descanso longo nos exercícios principais.' },
  hipertrofia: { n: 'Ganhar músculo', d: 'Mais séries por músculo, faixa de 6–15 repetições, perto da falha.' },
  emagrecer: { n: 'Perder gordura sem perder músculo', d: 'Manter a força com descanso mais curto; quem queima gordura é a dieta.' },
  saude: { n: 'Saúde e disposição', d: 'O mínimo que funciona: corpo forte, articulações protegidas, sem exagero.' },
  corrida: { n: 'Render na corrida', d: 'Força pesada e pliometria em pouco volume: melhora a economia de corrida sem pesar as pernas.' }
};
// lesões/dores: exercícios evitados (trocados automaticamente) e os que pedem cuidado
export const INJURIES = {
  ombro: { n: 'Ombro', avoid: ['mbo', 'bandohp', 'ohp', 'dbohp', 'arnold', 'dip', 'chairdip', 'pike', 'plyopush', 'pullover', 'dbpullover', 'skull'], care: ['bp', 'incbp', 'dbi', 'dbfp', 'fly', 'lat', 'pullup', 'shadowx', 'mbc'] },
  cotovelo: { n: 'Cotovelo', avoid: ['skull', 'ohtri', 'dip', 'chairdip', 'diamond', 'preacher'], care: ['chin', 'tri', 'bbcurl', 'pullup'] },
  punho: { n: 'Punho', avoid: ['pushup', 'plyopush', 'diamond', 'pike', 'plankrot', 'abwheel', 'chairdip'], care: ['bp', 'incbp', 'bbcurl', 'skull'] },
  lombar: { n: 'Lombar', avoid: ['dl', 'gm', 'row', 'tbar', 'kbswing', 'russian', 'superman', 'medslam'], care: ['rdl', 'dbrdl', 'sq', 'ohp', 'hipext', 'singlerdl'] },
  joelho: { n: 'Joelho', avoid: ['jump', 'broad', 'skater', 'pogo', 'afundo', 'walklunge', 'bul', 'ext', 'sled'], care: ['sq', 'hack', 'lp', 'stepup', 'sumo', 'bwsq'] },
  quadril: { n: 'Quadril / virilha', avoid: ['sumo', 'skater', 'copen', 'bul'], care: ['sq', 'afundo', 'walklunge', 'abd'] },
  tornozelo: { n: 'Tornozelo', avoid: ['jump', 'broad', 'skater', 'pogo'], care: ['calf', 'calfbw', 'afundo', 'stepup'] },
  pescoco: { n: 'Pescoço', avoid: ['neck', 'shrug'], care: ['ohp', 'hlr'] }
};
export const FOCUS_MUSCLES = ['peito', 'costas', 'ombros', 'biceps', 'triceps', 'quad', 'post', 'glut', 'pant'];
const SMALL = new Set(['biceps', 'triceps', 'pant']);
// exercícios de iniciante/sem carga que não fazem sentido na rotação de quem treina em academia
const GYM_SKIP = new Set(['pike', 'bwsq', 'pushup', 'chairdip', 'diamond', 'calfbw', 'invrow', 'bandrow', 'bandpd', 'bandcurl', 'bandtri', 'bandlat', 'sgb', 'slide', 'towelgrip']);
const MAIN_SLOTS = new Set(['squat', 'hinge', 'hpush', 'vpull', 'vpush', 'hpull', 'glute']);

const COMBAT = new Set(['boxe', 'muaythai', 'mma', 'jiu']);
// automático: cautela de saúde → saúde; luta → render na luta (ganhando massa → músculo); secar → emagrecer;
// ganhar massa → músculo; só corrida → render na corrida; recomposição → músculo (precisa de estímulo pra trocar gordura por músculo)
export function tgoalOf(p) {
  if (p?.tgoal && TGOALS[p.tgoal]) return p.tgoal;
  const sp = Object.keys(sportsOf(p || {}));
  if (condFlag(p || {}, 'conservative') || (p?.age || 0) >= 65) return 'saude';
  if (sp.some(s => COMBAT.has(s))) return p?.goal === 'bulk' ? 'hipertrofia' : 'luta';
  if (p?.goal === 'cut') return 'emagrecer';
  if (p?.goal === 'bulk') return 'hipertrofia';
  if (sp.includes('corrida')) return 'corrida';
  return 'hipertrofia';
}
export const injuriesOf = p => (Array.isArray(p?.inj) ? p.inj : []).filter(k => INJURIES[k]);
export const focusOf = p => (Array.isArray(p?.focus) ? p.focus : []).filter(m => FOCUS_MUSCLES.includes(m)).slice(0, 3);
export function avoidSet(p) {
  const s = new Set();
  for (const k of injuriesOf(p)) for (const x of INJURIES[k].avoid) s.add(x);
  for (const k of condsOf(p)) for (const x of CONDITIONS[k].avoid || []) s.add(x);
  if (condFlag(p, 'noPower')) for (const [id, e] of Object.entries(EXERCISES)) if (e.t === 'power') s.add(id);
  return s;
}
// dá pra fazer: equipamento + corpo + sem lesão/condição que tire o exercício
export const usable = (ex, p, eq = equipment(p), av = avoidSet(p), c = caps(p)) => canDo(ex, eq) && !av.has(ex) && bodyOk(ex, p, c);
// regiões/condições que pedem cuidado nesse exercício (nomes prontos pra mostrar)
export function careOf(p, ex) {
  return [...injuriesOf(p).filter(k => INJURIES[k].care.includes(ex) || INJURIES[k].avoid.includes(ex)).map(k => INJURIES[k].n.toLowerCase()),
    ...condsOf(p).filter(k => (CONDITIONS[k].care || []).includes(ex) || (CONDITIONS[k].avoid || []).includes(ex)).map(k => CONDITIONS[k].n.split(' (')[0].split(' /')[0].toLowerCase())];
}
const lvlOf = p => p?.experience === 'avancado' ? 'avancado' : p?.experience === 'iniciante' ? 'iniciante' : 'intermediario';

// ---------- parâmetros por objetivo ----------
export function goalParams(p) {
  const g = tgoalOf(p), lv = lvlOf(p);
  const R = {
    forca: { comp: [3, 6], iso: [8, 12], rc: 180, ri: 90, rirC: '1–3', start: 8, cap: 16 },
    hipertrofia: { comp: [6, 12], iso: [10, 15], rc: 120, ri: 75, rirC: '1–2', start: 10, cap: 20 },
    emagrecer: { comp: [8, 12], iso: [12, 15], rc: 90, ri: 60, rirC: '1–2', start: 8, cap: 14 },
    saude: { comp: [8, 12], iso: [10, 15], rc: 90, ri: 60, rirC: '2–3', start: 6, cap: 12 },
    luta: { comp: [4, 8], iso: [10, 15], rc: 150, ri: 75, rirC: '1–3', start: 6, cap: 14 },
    corrida: { comp: [4, 8], iso: [10, 15], rc: 150, ri: 60, rirC: '2–3', start: 6, cap: 12 }
  }[g];
  const capLv = { iniciante: 12, intermediario: 16, avancado: 22 }[lv];
  let start = R.start - (lv === 'iniciante' ? 2 : 0), cap = Math.min(R.cap, capLv);
  const cons = condFlag(p, 'conservative'); // condição que pede cautela: começa mais baixo e sobe menos
  if (cons) { start -= 1; cap -= 3; }
  const sd = sportDays(p || {});
  if (sd >= 4) { start -= 1; cap -= 2; }
  if ((p?.age || 0) >= 50) cap -= 2;
  const acc = g === 'luta' || g === 'corrida' || lv === 'iniciante' ? 3 : 4; // semanas subindo antes da semana leve
  const RIR_ORDER = ['1–2', '1–3', '2–3', '3–4'], condRir = condsOf(p).map(k => CONDITIONS[k].rir).filter(Boolean);
  const rir = [lv === 'iniciante' ? '2–3' : R.rirC, ...condRir].sort((a, b) => RIR_ORDER.indexOf(b) - RIR_ORDER.indexOf(a))[0];
  return { g, lv, ...R, start: Math.max(4, start), cap: Math.max(start + 2, cap), acc, rir, cons };
}
// repetições e descanso do exercício conforme o objetivo (só muda exercício com carga ajustável)
export function repsFor(e, base, gp) {
  if (!e.inc || e.t === 'power') return base;
  const [lo, hi] = e.t === 'comp' ? gp.comp : gp.iso;
  return [lo, hi];
}
export function restFor(e, gp) {
  if (e.t === 'power') return 120;
  if (e.t === 'comp') return e.inc ? gp.rc : Math.min(gp.rc, 120);
  if (e.t === 'iso') return gp.ri;
  return 60;
}
// minutos que uma série ocupa (execução + descanso)
// core e prevenção entram no descanso dos principais (séries "de recheio"), então quase não somam tempo
const setMin = (e, restS) => e.t === 'core' || e.t === 'prehab' ? 0.75 : ((restS ?? 90) + (e.t === 'power' ? 15 : e.t === 'comp' ? 40 : 30)) / 60;
export const sessionMin = items => Math.round(8 + items.reduce((a, it) => a + it.sets * setMin(EXERCISES[it.ex], it.rest), 0)); // 8 min de aquecimento

// ---------- ciclo: semanas treinadas, não semanas do calendário ----------
const wkStart = k => { const d = new Date(k + 'T12:00'); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.toISOString().slice(0, 10); };
const dDays = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
export function cycleInfo(p, workouts, todayK, since = '') {
  const gp = goalParams(p), total = gp.acc + 1, cur = wkStart(todayK);
  const weeks = [...new Set((workouts || []).filter(w => typeof w?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(w.date) && w.date <= todayK && w.date >= since).map(w => wkStart(w.date)))].sort();
  const past = weeks.filter(w => w < cur);
  let idx = 0, last = null, reset = false;
  for (const w of past) { if (last && dDays(last, w) > 21) { idx = 0; reset = true; } idx++; last = w; }
  if (last && dDays(last, cur) > 21) { idx = 0; reset = true; }
  const week = idx % total + 1;
  return { week, acc: gp.acc, total, deload: week > gp.acc, cycle: Math.floor(idx / total) + 1, rot: Math.floor(past.length / total), resumed: reset && idx === 0, weeksLeft: total - week };
}
// ---------- bloco: quanto tempo o treino vale antes de trocar ----------
// Bloco = 2–3 ciclos. Tempo pra aprender o movimento e progredir carga; depois disso, trocar o estímulo ajuda.
// Iniciante fica mais (adaptação neural). Variar de forma planejada ajuda; trocar demais atrapalha (Fonseca 2014; Kassiano 2022).
export function blockLen(p) {
  const gp = goalParams(p), total = gp.acc + 1;
  const cycles = gp.lv === 'iniciante' || ['forca', 'luta', 'saude'].includes(gp.g) ? 3 : 2;
  return total * cycles;
}
export function blockInfo(p, workouts, todayK, block) {
  const len = blockLen(p), first = (workouts || []).map(w => w?.date).filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()[0];
  const start = block?.start && /^\d{4}-\d{2}-\d{2}$/.test(block.start) ? block.start : (first ? wkStart(first) : wkStart(todayK));
  const cur = wkStart(todayK);
  const weeks = new Set((workouts || []).filter(w => typeof w?.date === 'string' && w.date >= start && w.date < cur).map(w => wkStart(w.date)));
  const done = Math.min(len, weeks.size), left = Math.max(0, len - done);
  const until = new Date(cur + 'T12:00'); until.setDate(until.getDate() + left * 7 - 1);
  const snoozed = typeof block?.snooze === 'string' && block.snooze > todayK;
  return { n: Math.max(1, Math.round(+block?.n) || 1), start, len, done, week: Math.min(len, done + 1), left, until: until.toISOString().slice(0, 10), over: done >= len && !snoozed, snoozed };
}

// autorregulação: séries que não saíram ou dor anotada na última semana seguram o aumento
export function readiness(workouts, todayK) {
  const from = new Date(todayK + 'T12:00'); from.setDate(from.getDate() - 7); const fk = from.toISOString().slice(0, 10);
  let sets = 0, fails = 0, pain = false;
  const PAIN = /\b(dor|doeu|d[oó]i|les[aã]o|machuc|inflama|tor[cç])/i;
  for (const w of workouts || []) {
    if (!(w?.date >= fk && w.date <= todayK)) continue;
    if (typeof w.note === 'string' && PAIN.test(w.note)) pain = true;
    for (const arr of Object.values(w.sets && typeof w.sets === 'object' ? w.sets : {})) for (const x of Array.isArray(arr) ? arr : []) {
      if (!x || typeof x !== 'object') continue;
      if (+x.reps > 0) sets++; else if (x.done && +x.reps === 0) { sets++; fails++; }
      if (typeof x.note === 'string' && PAIN.test(x.note)) pain = true;
    }
  }
  const failRate = sets ? fails / sets : 0;
  return { sets, fails, failRate, pain, hold: pain || (sets >= 6 && failRate >= 0.2) };
}
// alvo de séries por músculo nesta semana (teto e incremento guardados em símbolos, fora da conta dos músculos)
export const CAP = Symbol('cap'), INC = Symbol('inc');
export function weeklyTargets(p, ci, rd) {
  const gp = goalParams(p), focus = new Set(focusOf(p)), out = {}, capM = {}, inc = {};
  const wk = ci.deload ? 1 : Math.max(1, ci.week - (rd?.hold ? 1 : 0));
  for (const m of FOCUS_MUSCLES) {
    const f = focus.has(m);
    const start = gp.start - (SMALL.has(m) ? 2 : 0) + (f ? 3 : 0), cap = gp.cap - (SMALL.has(m) ? 4 : 0) + (f ? 4 : 0);
    const step = f ? 2 : 1;
    out[m] = ci.deload ? Math.round(start * 0.5) : Math.min(cap, start + step * (wk - 1));
    capM[m] = cap; inc[m] = ci.deload ? 0 : step * (wk - 1);
  }
  return Object.assign(out, { [CAP]: capM, [INC]: inc });
}

// ---------- escolha dos exercícios (rotina recomendada) ----------
function pick(slot, ctx, j, used) {
  const list = SLOTS[slot] || [];
  let ok = list.filter(id => !used.has(id) && usable(id, ctx.p, ctx.eq, ctx.avoid, ctx.caps));
  const na = ok.filter(id => !EXERCISES[id].adapt); if (na.length) ok = na; // adaptados só quando não sobra outro
  if (ctx.gym) { const g = ok.filter(id => !GYM_SKIP.has(id)); if (g.length) ok = g; }
  if (!ok.length) return null;
  const main = MAIN_SLOTS.has(slot); // principais ficam o ciclo todo (progressão de carga); acessórios trocam
  // bloco 1 começa no padrão de cada vaga; principal alterna entre as 2 melhores opções a cada bloco; complementar gira a cada ciclo
  let ex = main ? ok[(ctx.block - 1) % Math.min(2, ok.length)] : ok[(ctx.rot + (ctx.block - 1) * 2) % ok.length];
  // troca feita pela pessoa (estagnação) vale enquanto o exercício novo for possível
  const sw = ctx.swap[ex]; if (sw && EXERCISES[sw] && !used.has(sw) && usable(sw, ctx.p, ctx.eq, ctx.avoid, ctx.caps)) ex = sw;
  return ex;
}
// ---------- divisão escolhida pelo perfil (dias, nível, objetivo, esporte e tempo) ----------
// Base: frequência 2x/semana por músculo rende mais que 1x com o mesmo volume (Schoenfeld 2016); com esporte,
// Full Body espalha a fadiga e combina melhor (menos perna destruída antes do treino técnico).
export function chooseSplit(p) {
  const d = Math.min(6, Math.max(0, Math.round(+p?.liftDays || 0))), g = tgoalOf(p), lv = lvlOf(p), sd = sportDays(p || {}), min = Math.round(+p?.liftMin) || 45;
  const light = ['luta', 'corrida', 'saude', 'emagrecer'].includes(g) || lv === 'iniciante' || sd >= 3;
  const S = (key, tpl, why) => ({ key, tpl, freq: d, why, name: { fb: 'Full Body', ul: 'Superior / Inferior', mix: 'Sup/Inf + Empurrar/Puxar/Pernas', ppl: 'Empurrar / Puxar / Pernas' }[key] + (tpl.length < d ? ' (alternando)' : '') });
  if (!d) return null;
  if (d === 1) return S('fb', ['A'], 'Com 1 dia, Full Body é o único jeito de treinar o corpo todo.');
  if (d === 2) return S('fb', ['A', 'B'], 'Com 2 dias, Full Body A e B treina cada músculo 2 vezes por semana.');
  if (d === 3) return S('fb', ['A', 'B', 'C'], 'Com 3 dias, Full Body treina cada músculo 3 vezes por semana com pouco volume por sessão: rende mais que dividir.');
  if (d === 4) return light && !(min <= 35 && lv !== 'iniciante')
    ? S('fb', ['A', 'B'], `Com 4 dias${sd >= 3 ? ` e ${sd} treinos de esporte` : ''}, Full Body alternando A e B espalha o cansaço: nenhum dia acaba com as pernas ou os braços${lv === 'iniciante' ? ', e repetir os mesmos movimentos acelera o aprendizado' : ''}.`)
    : S('ul', ['U1', 'L1', 'U2', 'L2'], `Com 4 dias${min <= 35 ? ' e sessões curtas' : ''}, Superior/Inferior dá 2 treinos por músculo na semana com sessões mais focadas.`);
  if (d === 5) return light
    ? S('fb', ['A', 'B', 'C'], 'Com 5 dias, Full Body A/B/C alternando mantém cada sessão leve e cada músculo treinando 3 a 4 vezes.')
    : S('mix', ['U1', 'L1', 'PU', 'PL', 'LG'], 'Com 5 dias, Superior/Inferior + Empurrar/Puxar/Pernas mantém cada músculo perto de 2 vezes por semana.');
  return light
    ? S('ul', ['U1', 'L1', 'U2', 'L2'], 'Com 6 dias, Superior/Inferior alternando: cada músculo 3 vezes por semana sem sessões pesadas demais.')
    : S('ppl', ['PU', 'PL', 'LG'], 'Com 6 dias, Empurrar/Puxar/Pernas 2x treina cada músculo 2 vezes por semana com bastante volume.');
}
export function planFor(p, prog = {}, opt = {}) {
  const cs = chooseSplit(p);
  if (!cs) return { split: 'Sem dias de força', days: [], none: true, swapped: [] };
  const split = { name: cs.name, days: cs.tpl }, gp = goalParams(p), eq = equipment(p), avoid = avoidSet(p);
  const ctx = { p, eq, avoid, caps: caps(p), gym: p.env === 'academia' || !p.env, rot: opt.rot || 0, swap: opt.swap || {}, block: opt.block || 1 };
  const extra = [];
  for (const id of Object.keys(sportsOf(p))) for (const x of (SPORTS[id]?.sc || [])) if (!extra.some(e => e[0] === x[0])) extra.push(x);
  const startLvl = p.experience === 'iniciante' ? 0 : 1, swapped = [];
  const days = split.days.map((key, i) => {
    const t = TEMPLATES[key], used = new Set(), items = [];
    let j = 0;
    for (const [slot, sets, lo, hi] of [...t.list, ...(i % 2 === 0 ? extra : [])]) {
      // lesão tirou o exercício padrão? registra pra explicar
      const first = (SLOTS[slot] || []).find(id => canDo(id, eq) && !used.has(id) && !EXERCISES[id].adapt);
      const ex = pick(slot, ctx, j, used); j++;
      if (!ex) continue;
      if (first && first !== ex && (avoid.has(first) || !bodyOk(first, p, ctx.caps))) swapped.push([first, ex]);
      used.add(ex);
      const e = EXERCISES[ex], [rlo, rhi] = repsFor(e, e.r || [lo, hi], gp);
      const lvl = e.vars ? Math.min(e.vars.length - 1, prog[ex] ?? startLvl) : null;
      items.push({ ex, slot, sets, lo: rlo, hi: rhi, lvl, rest: restFor(e, gp) });
    }
    return { key, idx: i, name: t.name, items };
  });
  return { split: split.name, days, none: false, swapped, freq: cs.freq, splitKey: cs.key, why: cs.why };
}

// ---------- ajuste de volume: chega no alvo da semana dentro do tempo disponível ----------
export function fitVolume(days, p, tgIn, ci, opt = {}) {
  const budget = Math.max(20, Math.min(180, Math.round(+p.liftMin) || 45)) * 1.1, out = days.map(d => ({ ...d, items: d.items.map(it => ({ ...it })) }));
  const adj = it => ['comp', 'iso'].includes(EXERCISES[it.ex].t);
  const isMain = it => MAIN_SLOTS.has(it.slot) || (!it.slot && EXERCISES[it.ex].t === 'comp' && !!EXERCISES[it.ex].inc);
  const maxS = it => EXERCISES[it.ex].t === 'comp' ? 5 : 4;
  const mult = opt.mult || 1; // sessões repetidas na semana (A/B em 4 dias = cada uma 2x)
  const vol = () => { const v = Object.fromEntries(FOCUS_MUSCLES.map(m => [m, 0])); for (const d of out) for (const it of d.items) for (const [m, f] of Object.entries(EXERCISES[it.ex].m)) if (m in v) v[m] += it.sets * f * mult; return v; };
  const direct = m => out.some(d => d.items.some(it => adj(it) && (EXERCISES[it.ex].m[m] || 0) >= 1));
  if (ci.deload) {
    for (const d of out) for (const it of d.items) { const t = EXERCISES[it.ex].t; it.sets = t === 'power' ? Math.min(it.sets, 2) : Math.max(1, Math.round(it.sets * 0.5)); }
    return { days: out, vol: vol(), limited: [], uncovered: [], dropped: [] };
  }
  // rotina própria: parte do que a pessoa montou e só soma o incremento da semana
  const v0 = vol(), tg = {};
  for (const m of FOCUS_MUSCLES) tg[m] = opt.custom ? Math.min(tgIn[CAP]?.[m] ?? 99, v0[m] + (tgIn[INC]?.[m] || 0)) : tgIn[m];
  const dropped = [];
  if (!opt.custom) {
    // 1) cabe no tempo? corta acessório (até 2 séries) → tira acessório repetido → corta principal (até 2)
    for (const d of out) {
      let guard = 80;
      while (sessionMin(d.items) > budget && guard--) {
        const v = vol(), over = it => Math.max(-99, ...Object.entries(EXERCISES[it.ex].m).filter(([m, f]) => f >= 1 && m in tg).map(([m]) => v[m] - tg[m]));
        const acc = d.items.filter(it => adj(it) && !isMain(it) && it.sets > 2).sort((a, b) => over(b) - over(a))[0];
        if (acc) { acc.sets--; continue; }
        const keepT = opt.goal === 'luta' ? ['power', 'core', 'prehab'] : ['power'];
        const drop = d.items.length > 5 && ([...d.items].reverse().find(it => !isMain(it) && EXERCISES[it.ex].t === 'iso') || [...d.items].reverse().find(it => !isMain(it) && !keepT.includes(EXERCISES[it.ex].t)));
        if (drop) { d.items.splice(d.items.indexOf(drop), 1); dropped.push(drop.ex); continue; }
        const mainIt = d.items.filter(it => adj(it) && it.sets > 2).sort((a, b) => b.sets - a.sets)[0];
        if (mainIt) { mainIt.sets--; continue; }
        break;
      }
    }
    // 2) passou do alvo (+2)? tira de onde não faz falta pros outros músculos
    let guard = 120;
    while (guard--) {
      const v = vol();
      const m = FOCUS_MUSCLES.filter(m => v[m] > tg[m] + 2).sort((a, b) => (v[b] - tg[b]) - (v[a] - tg[a]))[0]; if (!m) break;
      const c = out.flatMap(d => d.items).filter(it => adj(it) && it.sets > 2 && (EXERCISES[it.ex].m[m] || 0) >= 1 && Object.entries(EXERCISES[it.ex].m).every(([k, f]) => !(k in tg) || k === m || v[k] - f >= tg[k]))
        .sort((a, b) => (isMain(a) ? 1 : 0) - (isMain(b) ? 1 : 0) || b.sets - a.sets);
      if (!c.length) break; c[0].sets--;
    }
  }
  // 3) falta? soma 1 série por vez onde cabe no tempo, primeiro nos principais, espalhando
  const limited = new Set(), uncovered = FOCUS_MUSCLES.filter(m => !direct(m));
  let guard = 200;
  while (guard--) {
    const v = vol();
    const m = FOCUS_MUSCLES.filter(m => !limited.has(m) && !uncovered.includes(m) && v[m] < tg[m] - 0.5).sort((a, b) => (tg[b] - v[b]) - (tg[a] - v[a]))[0]; if (!m) break;
    let best = null;
    for (const d of out) for (const it of d.items) {
      const f = EXERCISES[it.ex].m[m] || 0;
      if (!adj(it) || f < 1 || it.sets >= maxS(it)) continue;
      if (sessionMin(d.items) + setMin(EXERCISES[it.ex], it.rest) > budget) continue;
      if (!best || it.sets < best.sets || (it.sets === best.sets && isMain(it) && !isMain(best))) best = it;
    }
    if (!best) { limited.add(m); continue; }
    best.sets++;
  }
  return { days: out, vol: vol(), tg, limited: [...limited], uncovered, dropped };
}

// ---------- estagnação ----------
// histórico: [{best}] em ordem; estagnou = 3 últimos treinos sem superar o melhor de antes
export function stagnant(hist) {
  if (!hist || hist.length < 4) return false;
  const prev = Math.max(...hist.slice(0, -3).map(h => h.best.sc)), last3 = Math.max(...hist.slice(-3).map(h => h.best.sc));
  return last3 <= prev;
}
export function swapOptions(p, ex, slot, exclude = []) {
  const eq = equipment(p), avoid = avoidSet(p), e = EXERCISES[ex], c = caps(p), ok = id => usable(id, p, eq, avoid, c);
  const main = Object.entries(e.m).filter(([, f]) => f >= 1).map(([m]) => m);
  const pool = slot && SLOTS[slot] ? SLOTS[slot] : Object.values(SLOTS).filter(l => l.includes(ex)).flat();
  const same = [...new Set(pool)].filter(id => id !== ex && !exclude.includes(id) && ok(id) && EXERCISES[id].t === e.t);
  const alt = Object.keys(EXERCISES).filter(id => id !== ex && !same.includes(id) && !exclude.includes(id) && ok(id) && !EXERCISES[id].adapt && EXERCISES[id].t === e.t && main.some(m => (EXERCISES[id].m[m] || 0) >= 1));
  return [...same, ...alt].slice(0, 3);
}
export const MUSCLE_N = MUSCLES;
