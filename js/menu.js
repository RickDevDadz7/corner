// Gerador de cardápio: escolhe alimentos por modelo de refeição e calcula os gramas pra fechar as metas.
// Os números saem sempre da base de alimentos (nunca de IA). Funções puras: dá pra testar fora do app.
import { FOODS } from './data.js';

const BY = new Map(FOODS.map(f => [f.n, f]));
export const foodByName = n => BY.get(n);

export const MEAL_SHARE = { cafe: 0.25, almoco: 0.35, lanche: 0.15, jantar: 0.25 };
// s = como o gramas é decidido: P (bate proteína), C (bate carbo), F (bate gordura), fix (porção padrão)
const LUNCH = m => [
  { k: 'veg', roles: ['veg'], m, s: 'fix' },
  { k: 'veg2', roles: ['veg'], m, s: 'fix', opt: true },
  { k: 'leg', roles: ['leg'], m, s: 'fix', opt: true, pAlt: true },
  { k: 'prot', roles: ['prot'], m, s: 'P' },
  { k: 'carb', roles: ['carb'], m, s: 'C' },
  { k: 'oleo', roles: ['oleo'], m, s: 'F', opt: true }
];
export const SLOTS = {
  cafe: [
    { k: 'pao', roles: ['pao'], m: 'c', s: 'C' },
    { k: 'prot', roles: ['prot'], m: 'c', s: 'P' },
    { k: 'lat', roles: ['lat'], m: 'c', s: 'fix', opt: true, pAlt: true },
    { k: 'fruta', roles: ['fruta'], m: 'c', s: 'fix', opt: true },
    { k: 'gord', roles: ['gord'], m: 'c', s: 'F', opt: true }
  ],
  almoco: LUNCH('a'),
  lanche: [
    { k: 'base', roles: ['fruta', 'pao'], m: 'l', s: 'C' },
    { k: 'prot', roles: ['lat', 'prot'], m: 'l', s: 'P' },
    { k: 'pao', roles: ['pao'], m: 'l', s: 'C', opt: true, big: true },
    { k: 'gord', roles: ['gord'], m: 'l', s: 'F', opt: true }
  ],
  jantar: LUNCH('j')
};

// o que é comum no prato brasileiro aparece mais; fígado e afins, de vez em quando
const COMMON = new Set(['Arroz branco cozido', 'Arroz integral cozido', 'Feijão carioca cozido', 'Feijão preto cozido', 'Peito de frango grelhado', 'Patinho grelhado', 'Carne moída (patinho) refogada', 'Tilápia grelhada', 'Ovo cozido (1 un ≈ 50 g)', 'Ovo frito (1 un ≈ 50 g)', 'Omelete simples (2 ovos)', 'Pão francês (1 un ≈ 50 g)', 'Pão integral (fatia ≈ 25 g)', 'Tapioca (1 disco ≈ 50 g de goma)', 'Cuscuz de milho cozido', 'Leite integral (ml)', 'Leite desnatado (ml)', 'Iogurte natural', 'Queijo minas frescal', 'Banana prata', 'Maçã', 'Mamão papaia', 'Laranja', 'Batata-doce cozida', 'Salada (alface e tomate)', 'Brócolis cozido', 'Cenoura crua', 'Tomate', 'Alface', 'Azeite de oliva', 'Aveia em flocos', 'Whey protein (varia por marca)']);
const RARE = new Set(['Fígado bovino grelhado', 'Camarão cozido', 'Clara de ovo cozida', 'Uva passa', 'Linhaça', 'Ricota', 'Quinoa cozida', 'Milho verde (lata, escorrido)', 'Frango desfiado (peito cozido)']);
// sorteio com semente: o mesmo cardápio volta igual ao abrir de novo
function rnd(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }

// dia de treino ganha carbo, descanso perde; a média da semana continua a mesma
export function dayTargets(t, train, trainDays) {
  const d = Math.max(0, Math.min(7, trainDays || 0));
  let shift = 0;
  if (d > 0 && d < 7) shift = train ? Math.min(0.25, 0.15 * (7 - d) / d) : -0.15;
  if (d === 0) shift = 0;
  const c = Math.round(t.carbs * (1 + shift));
  return { kcal: Math.round(t.kcal + (c - t.carbs) * 4), p: t.protein, c, f: t.fat, fb: t.fiber, shiftG: c - t.carbs };
}

function bounds(f, slot, sc = 1) {
  const u = f.un?.[0];
  if (u) {
    const lo = Math.max(1, Math.ceil((f.mn || u) / u)), cap = f.r === 'prot' ? Math.floor((f.mx || 240) / u) : f.r === 'pao' ? Math.min(6, Math.floor(160 * sc / u)) : f.r === 'fruta' ? (slot.s === 'C' ? 2 : 1) : Math.floor((f.mx || 2 * u) / u);
    return { unit: u, lo, hi: Math.max(lo, cap) };
  }
  const R = { prot: [60, 220], carb: [60, Math.round(350 * sc)], pao: [40, Math.round(200 * sc)], leg: [60, 250], veg: [30, 150], fruta: [f.g, 2 * f.g], lat: [100, 300], gord: [10, Math.round(30 * sc)], oleo: [4, Math.round(16 * sc)] }[f.r] || [10, 300];
  return { unit: 0, lo: f.mn ?? R[0], hi: Math.max(f.mx ?? R[1], (f.r === 'gord' || f.r === 'oleo' ? R[1] : 0)) };
}
const roundG = (g, b) => b.unit ? Math.min(b.hi, Math.max(b.lo, Math.round(g / b.unit))) * b.unit : Math.min(b.hi, Math.max(b.lo, Math.round(g / (b.hi <= 60 ? 5 : 10)) * (b.hi <= 60 ? 5 : 10)));
const macro = (f, g) => ({ k: f.k * g / 100, p: f.p * g / 100, c: f.c * g / 100, f: f.f * g / 100, fb: (f.fb || 0) * g / 100 });
const add = (a, b) => ({ k: a.k + b.k, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f, fb: a.fb + b.fb });
const ZERO = { k: 0, p: 0, c: 0, f: 0, fb: 0 };

// candidatos de uma vaga, do melhor pro pior
export function candidates(meal, slot, ctx, used = new Set(), seed = 0, avoid = new Set()) {
  let list = FOODS.filter(f => f.r && slot.roles.includes(f.r) && f.ml?.includes(slot.m) && ctx.ok(f.n) && ctx.pantry?.[f.n] !== 'nao');
  if (ctx.strict) { const mine = list.filter(f => ['tem', 'comprar'].includes(ctx.pantry?.[f.n])); if (mine.length) list = mine; }
  const score = f => rnd(`${seed}|${meal}|${slot.k}|${f.n}`) + (ctx.pantry?.[f.n] === 'tem' ? 0.6 : ctx.pantry?.[f.n] === 'comprar' ? 0.45 : 0) - (used.has(f.n) ? 2 : 0) - (avoid.has(f.n) ? 0.8 : 0)
    + (COMMON.has(f.n) ? 0.35 : 0) - (RARE.has(f.n) ? 0.45 : 0) + (meal === 'lanche' && slot.k === 'base' && f.r === 'fruta' ? 0.3 : 0) - (slot.s === 'P' && f.p > 0 && f.f / f.p > 0.5 ? 0.5 : 0);
  return list.map(f => [f, score(f)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}

// escolhe os alimentos do dia (só nomes; os gramas são calculados à parte, então mudam junto com as metas)
export function pickDay(ctx, seed, avoid = new Set()) {
  const used = new Set(), meals = {};
  for (const meal of Object.keys(SLOTS)) {
    const pick = {};
    for (const slot of SLOTS[meal]) {
      if (slot.big && !ctx.big) continue; // pão extra no lanche só pra quem come muito
      if (slot.k === 'gord' && rnd(`${seed}|opt|${meal}|${slot.k}`) < 0.35) continue; // oleaginosa nem sempre
      const c = candidates(meal, slot, ctx, used, seed, avoid).filter(f => !(slot.k === 'veg2' && f.n === pick.veg));
      if (c.length) { pick[slot.k] = c[0].n; used.add(c[0].n); }
    }
    meals[meal] = { pick, done: false };
  }
  return meals;
}

// troca um item por outro da mesma vaga
export function swapPick(meals, meal, slotK, ctx, seed, n) {
  const slot = SLOTS[meal].find(s => s.k === slotK); if (!slot) return null;
  const used = new Set(Object.values(meals).flatMap(m => Object.values(m?.pick || {})));
  const cur = meals[meal]?.pick?.[slotK];
  const c = candidates(meal, slot, ctx, used, `${seed}|swap${n}`).filter(f => f.n !== cur && !(slotK === 'veg2' && f.n === meals[meal]?.pick?.veg) && !(slotK === 'veg' && f.n === meals[meal]?.pick?.veg2));
  return c[0]?.n || null;
}

// calcula os gramas de uma refeição pra chegar na meta dela
function solveMeal(meal, pick, tgt, sc) {
  const items = [];
  let tot = { ...ZERO };
  const slots = SLOTS[meal].filter(s => pick[s.k] && BY.get(pick[s.k]));
  const hasP = slots.some(s => s.s === 'P');
  // sem proteína na refeição (ex.: vegano sem tofu): a leguminosa ou o laticínio assume a proteína
  const alt = hasP ? null : slots.find(s => s.pAlt);
  const driveOf = s => s === alt ? 'P' : s.s;
  for (const st of ['fix', 'P', 'C', 'F']) {
    for (const slot of slots.filter(s => driveOf(s) === st)) {
      const f = BY.get(pick[slot.k]), b = bounds(f, slot, sc);
      let g;
      if (st === 'fix') g = f.un ? f.un[0] : f.md && ['fruta', 'lat'].includes(f.r) ? f.md[1] : f.g;
      else {
        const key = { P: 'p', C: 'c', F: 'f' }[st], per = f[key] / 100, need = Math.max(0, tgt[key] - tot[key]);
        if (st === 'F' && need < (f.r === 'oleo' ? 3 : 4)) continue; // gordura já fechou
        g = per > 0 ? need / per : b.lo;
      }
      g = roundG(g, b);
      const m = macro(f, g); tot = add(tot, m);
      items.push({ slot: slot.k, n: f.n, g, drive: st, ...m });
    }
  }
  const ord = SLOTS[meal].map(s => s.k);
  items.sort((x, y) => ord.indexOf(x.slot) - ord.indexOf(y.slot));
  return { items, tot };
}

// o dia todo: cada refeição mira no que falta do dia (o que uma refeição não alcança passa pras seguintes)
export function solveDay(meals, dt) {
  const out = {}, keys = Object.keys(SLOTS), sc = Math.min(1.8, Math.max(1, dt.kcal / 2300));
  let eaten = { ...ZERO };
  keys.forEach((meal, i) => {
    const restShare = keys.slice(i).reduce((a, k) => a + MEAL_SHARE[k], 0), r = MEAL_SHARE[meal] / restShare;
    const tgt = { k: (dt.kcal - eaten.k) * r, p: Math.max(0, dt.p - eaten.p) * r, c: Math.max(0, dt.c - eaten.c) * r, f: Math.max(0, dt.f - eaten.f) * r };
    out[meal] = solveMeal(meal, meals[meal]?.pick || {}, tgt, sc);
    eaten = add(eaten, out[meal].tot);
  });
  // ajuste fino: kcal fora por mais de 4% → mexe nos carboidratos (dentro dos limites)
  const total = () => Object.values(out).reduce((a, m) => add(a, m.tot), { ...ZERO });
  for (let pass = 0; pass < 2; pass++) {
    const T = total(), diff = dt.kcal - T.k;
    if (Math.abs(diff) <= dt.kcal * 0.04) break;
    const cs = Object.entries(out).flatMap(([meal, m]) => m.items.filter(i => i.drive === 'C').map(i => [meal, i]));
    const ck = cs.reduce((a, [, i]) => a + i.k, 0); if (!ck) break;
    for (const [meal, i] of cs) {
      const f = BY.get(i.n), b = bounds(f, SLOTS[meal].find(s => s.k === i.slot), sc);
      const g = roundG(i.g * (1 + diff / ck), b);
      Object.assign(i, { g }, macro(f, g));
    }
    for (const m of Object.values(out)) m.tot = m.items.reduce((a, x) => add(a, x), { ...ZERO });
  }
  return { meals: out, tot: total() };
}

const PL = { 'pedaço': 'pedaços', 'médio': 'médios', 'concha': 'conchas', 'filé': 'filés', 'bife': 'bifes', 'fatia': 'fatias', 'copo': 'copos', 'scoop': 'scoops', 'unidade': 'unidades', 'média': 'médias', 'punhado': 'punhados', 'ramo': 'ramos', 'posta': 'postas', 'xícara': 'xícaras', 'prato': 'pratos', 'raso': 'rasos', 'pegador': 'pegadores', 'cacho': 'cachos', 'pequeno': 'pequenos' };
const plural = s => s.split(' ').map(w => PL[w] || w).join(' ').replace(/^meia (papaia|manga)$/, (m, x) => `metades de ${x}`);
// medida caseira pra mostrar ("2 ovos cozidos", "≈ 4 col. sopa")
export function measure(n, g) {
  const f = BY.get(n); if (!f) return `${Math.round(g)} g`;
  const unit = /\(ml\)/.test(f.n) ? 'ml' : 'g';
  if (f.un) { const q = Math.round(g / f.un[0]); return `${q} ${q === 1 ? f.un[1] : f.un[2]}`; }
  if (f.md) { const q = Math.round(g / f.md[1] * 2) / 2; if (q > 12) return `${Math.round(g)} ${unit} (porção grande)`; if (q >= 0.5) return `≈ ${String(q).replace('.', ',')} ${q > 1 ? plural(f.md[0]) : f.md[0]} (${Math.round(g)} ${unit})`; }
  return `${Math.round(g)} ${unit}`;
}

// lista de compras: soma o que falta comer, converte cozido → cru e agrupa por seção do mercado
const GROUP = f => f.r === 'veg' || f.r === 'fruta' || (f.r === 'carb' && /batata|mandioca|inhame|mandioquinha/i.test(f.n)) ? 'Hortifruti'
  : f.r === 'prot' && !/ovo|omelete|clara|tofu|lata/i.test(f.n) ? 'Açougue e peixaria'
  : f.r === 'lat' || /ovo|omelete|clara/i.test(f.n) ? 'Laticínios e ovos' : 'Mercearia';
export function shoppingList(plans) {
  const acc = new Map();
  for (const sol of plans) for (const m of Object.values(sol.meals)) for (const it of m.items) {
    const f = BY.get(it.n); if (!f) continue;
    const isEgg = /^Ovo |Omelete/.test(f.n), key = isEgg ? 'Ovos' : (f.buyN || f.n.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+(cozid[oa]s?|crua?|grelhad[oa]|assad[oa]|refogad[oa])\b/gi, '').trim());
    const cur = acc.get(key) || { n: key, g: 0, units: 0, ml: /\(ml\)/.test(f.n), group: GROUP(f), src: new Set() };
    if (isEgg) cur.units += /Omelete/.test(f.n) ? 2 * it.g / 110 : it.g / 50;
    else if (f.un && !f.cru) cur.units += it.g / f.un[0];
    else cur.g += it.g * (f.cru || 1);
    cur.unitName = isEgg ? ['ovo', 'ovos'] : f.un && !f.cru ? [f.un[1], f.un[2]] : null;
    cur.src.add(f.n); acc.set(key, cur);
  }
  return [...acc.values()].map(x => ({ ...x, src: [...x.src] }));
}
export function shopQty(x) {
  if (x.unitName) { const q = Math.ceil(x.units - 0.05); return `${q} ${q === 1 ? x.unitName[0] : x.unitName[1]}`; }
  const g = Math.ceil(x.g / 50) * 50, u = x.ml ? ['ml', 'L'] : ['g', 'kg'];
  return g >= 1000 ? `≈ ${String(Math.round(g / 100) / 10).replace('.', ',')} ${u[1]}` : `≈ ${g} ${u[0]}`;
}
