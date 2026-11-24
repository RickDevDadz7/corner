import { EVIDENCE, EXERCISES, FOODS, MUSCLES, EQUIP, PUNCHES, MEALS, RESTR, RESTR_GROUPS, restrOf } from './data.js';
import { NEAT, GOALS, targets, adaptiveTDEE, buildPlan as plan_, suggest, dayKey, fmt, sessionKcal, movingAvg, equipment, comboPool, comboSpeech, sportsOf, sportDays } from './calc.js';
import { SPORTS, SPORT_IDS, combatSession, runSession } from './sports.js';
import { TECHNIQUES, TIRED, CATS, animate, thumbSVG } from './techniques.js';
import { cloud } from './cloud.js';
import { startScan, lookupBarcode } from './scan.js';
import { pickDay, solveDay, dayTargets, measure, shoppingList, shopQty, swapPick, foodByName, SLOTS } from './menu.js';
import * as sync from './sync.js';
const buildPlan = p => plan_(p, S.prog);

// ---------------- Armazenamento ----------------
const KEY = 'ronin:v1', OLD_KEY = 'corner:v1';
const KEY_API = 'ronin:apikey', OLD_API = 'corner:apikey';
const blank = () => ({
  profile: null,
  logs: { weights: {}, food: {}, water: {}, workouts: [], sessions: [] },
  settings: { adaptive: true, model: 'claude-sonnet-5-5' }, chat: [], weak: [], prog: {},
  boxGen: { minutes: 30, saco: false, partner: false, kind: 'intervalado' },
  timer: { preset: '', rounds: 3, work: 180, rest: 60, voice: true, calls: false, program: null },
  ui: { sport: null }, del: {}, meta: { pt: 0, wt: {} }
});
const newId = sync.newId;
let S = load();
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY); } catch (e) { }
  if (!raw) return blank();
  try {
    const d = Object.assign(blank(), JSON.parse(raw));
    const b = blank();
    d.timer = { ...b.timer, ...d.timer }; d.logs = { ...b.logs, ...d.logs }; d.meta = { ...b.meta, ...d.meta }; d.ui = { ...b.ui, ...d.ui };
    d.boxGen = { ...b.boxGen, ...d.boxGen }; d.del = d.del || {};
    // migrações da versão Corner
    if (d.profile) {
      if (!d.profile.env) Object.assign(d.profile, { env: 'academia', equip: [] });
      if (!d.profile.sports) d.profile.sports = sportsOf(d.profile);
      for (const k of ['boxDays', 'boxMin', 'boxType', 'boxWhere']) delete d.profile[k];
    }
    if (d.logs.boxing) { for (const x of d.logs.boxing) d.logs.sessions.push({ id: newId(), sport: 'boxe', date: x.date, type: x.type in SPORTS.boxe.types ? x.type : 'tecnica', min: x.min, kcal: x.kcal }); delete d.logs.boxing; }
    for (const items of Object.values(d.logs.food)) for (const it of items) {
      it.id ||= newId();
      if (it.fb == null) { const fd = FOODS.find(x => x.n === it.n); it.fb = fd && it.g != null ? fd.fb * it.g / 100 : 0; }
    }
    for (const [day, v] of Object.entries(d.logs.water)) if (typeof v === 'number') d.logs.water[day] = v ? [{ id: newId(), ml: v }] : [];
    for (const w of d.logs.workouts) w.id ||= newId();
    for (const s of d.logs.sessions) s.id ||= newId();
    d.weak = (d.weak || []).map(w => ({ gas: 'gas', power: 'power', guard: 'guard', legs: 'legs', chin: 'chin', weight: 'weight' }[w] || w));
    return d;
  } catch (e) { return blank(); }
}
let syncTimer = null;
function save(prefs = false) {
  if (prefs) S.meta.pt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Não consegui salvar no aparelho.'); }
  if (cloud.user()) { clearTimeout(syncTimer); syncTimer = setTimeout(() => doSync(true), 5000); }
}
function getKey() { try { return localStorage.getItem(KEY_API) || localStorage.getItem(OLD_API) || ''; } catch (e) { return ''; } }
function setKey(v) { try { localStorage.removeItem(OLD_API); v ? localStorage.setItem(KEY_API, v) : localStorage.removeItem(KEY_API); } catch (e) { } }

// ---------------- Sincronização ----------------
let syncState = { busy: false, err: '' };
async function doSync(quiet = false) {
  if (!cloud.user() || syncState.busy) return;
  syncState.busy = true; if (!quiet) paintSync();
  try {
    const info = await sync.syncNow(() => S, ns => { S = ns; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } });
    syncState.err = '';
    if (cloud.user() && S.meta.owner !== cloud.user().id) { S.meta.owner = cloud.user().id; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
    if (info.changed && !isTyping()) render();
    if (!quiet) toast(info.devices > 1 ? `Sincronizado com ${info.devices - 1} outro(s) aparelho(s)` : 'Sincronizado');
    return true;
  } catch (e) {
    syncState.err = e.message;
    if (e.code === 'signed_out') render();
    if (!quiet) toast(e.message);
  } finally { syncState.busy = false; paintSync(); }
}
function isTyping() { const a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }
function paintSync() { const el = $('#syncInfo'); if (el) el.innerHTML = syncLine(); }
function syncLine() {
  if (syncState.busy) return 'Sincronizando…';
  if (syncState.err) return `<span class="warn">${esc(syncState.err)}</span>`;
  const i = sync.lastInfo(); if (!i) return 'Ainda não sincronizou.';
  return `Última sincronização: ${new Date(i.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · ${i.devices} aparelho(s)`;
}

// ---------------- Utilidades ----------------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => dayKey();
let viewDay = null; // null = hoje
const curDay = () => viewDay || today();
function shiftDay(n) { const d = new Date(curDay() + 'T12:00'); d.setDate(d.getDate() + n); const k = dayKey(d); viewDay = k >= today() ? null : k; }
function dayLabel(k) { const d = new Date(k + 'T12:00'); const diff = Math.round((new Date(today() + 'T12:00') - d) / 864e5); return diff === 0 ? 'Hoje' : diff === 1 ? 'Ontem' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }); }
function dayNav() { const k = curDay(); return `<div class="daynav"><button data-act="day" data-d="-1" aria-label="Dia anterior">‹</button><label class="dpick" title="Escolher data"><span>${esc(dayLabel(k))}${viewDay ? ` <small class="muted">${k.split('-').reverse().join('/')}</small>` : ''}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5"/></svg><input type="date" class="dayPick" value="${k}" max="${today()}" aria-label="Escolher data"></label><button data-act="day" data-d="1" ${viewDay ? '' : 'disabled'} aria-label="Próximo dia">›</button>${viewDay ? '<button class="linkbtn" data-act="dayToday">voltar pra hoje</button>' : ''}</div>`; }
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
function toast(msg) {
  const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
function foodTotals() { const out = {}; for (const [d, items] of Object.entries(S.logs.food)) out[d] = items.reduce((a, i) => a + i.k, 0); return out; }
function T() { return targets(S.profile, S.settings.adaptive ? adaptiveTDEE(S.logs.weights, foodTotals()) : null); }
function dayFood(d = curDay()) { return (S.logs.food[d] || []).reduce((a, i) => ({ k: a.k + i.k, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f, fb: a.fb + (i.fb || 0) }), { k: 0, p: 0, c: 0, f: 0, fb: 0 }); }
// restrições alimentares ativas (perfil) e o que cada registro fere
function restrOfProfile(p = S.profile) {
  const r = p?.restr; if (!r) return { perm: [], temp: [], until: '', since: '' };
  if (Array.isArray(r.ids)) return r.until ? { perm: [], temp: r.ids, until: r.until, since: r.since || '' } : { perm: r.ids, temp: [], until: '', since: r.since || '' };
  return { perm: (r.perm || []).filter(k => RESTR[k]), temp: (r.temp || []).filter(k => RESTR[k]), until: r.until || '', since: r.since || '' };
}
const tempOn = r => r.temp.length && (!r.until || today() <= r.until);
function activeRestr() { const r = restrOfProfile(); return [...new Set([...r.perm, ...(tempOn(r) ? r.temp : [])])]; }
const hitsOf = v => { const a = activeRestr(); if (!a.length) return []; const it = typeof v === 'string' ? { n: v } : v || {}; const tags = new Set([...restrOf(it.n || ''), ...(Array.isArray(it.x) ? it.x : [])]); return a.filter(k => tags.has(k)); };
const dayHits = d => (S.logs.food[d] || []).filter(i => hitsOf(i).length);
function cleanStreak() {
  const since = restrOfProfile().since || today(); let n = 0;
  for (let i = 0; i < 400; i++) {
    const d = dayKey(new Date(Date.now() - i * 864e5)); if (d < since) break;
    const items = S.logs.food[d] || [];
    if (!items.length) { if (i === 0) continue; break; }
    if (dayHits(d).length) break; n++;
  }
  return n;
}
const dayWater = (d = curDay()) => (S.logs.water[d] || []).reduce((a, w) => a + (w.ml || 0), 0);
function latestWeight() { const ks = Object.keys(S.logs.weights).sort(); return ks.length ? S.logs.weights[ks[ks.length - 1]] : S.profile?.weight; }
const mySports = () => Object.keys(sportsOf(S.profile || {})).filter(id => SPORTS[id]);
function curSport() { const m = mySports(); return m.includes(S.ui.sport) ? S.ui.sport : (m[0] || 'boxe'); }
const level = () => S.profile.experience === 'avancado' ? 'avancado' : S.profile.experience === 'iniciante' ? 'iniciante' : 'intermediario';
const allWeak = () => SPORT_IDS.flatMap(id => SPORTS[id].weak.map(w => ({ ...w, sport: id })));

// ---------------- Componentes ----------------
function ring(value, max, label, sub, color = 'var(--acc)') {
  const r = 52, c = 2 * Math.PI * r, pct = Math.min(1, max ? value / max : 0);
  return `<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="${r}" class="ring-bg"/>
    <circle cx="60" cy="60" r="${r}" class="ring-fg" style="stroke:${color};stroke-dasharray:${c};stroke-dashoffset:${c * (1 - pct)}"/></svg>
    <div class="ring-txt"><b>${label}</b><span>${sub}</span></div></div>`;
}
function bar(name, v, max, unit = 'g', color = 'var(--acc)') {
  const pct = Math.min(100, max ? v / max * 100 : 0);
  return `<div class="bar"><div class="bar-top"><span>${name}</span><span class="mono">${fmt(v, 0)}<i>/${fmt(max, 0)}${unit}</i></span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div></div>`;
}
// água: sem teto. A escala cresce com o que você bebeu e um traço marca a recomendação
function waterBar(v, goal) {
  const max = Math.max(goal * 1.25, v * 1.08), pct = v / max * 100, mk = goal / max * 100;
  return `<div class="bar wbar"><div class="bar-top"><span>Água</span><span class="mono">${fmt(v / 1000, 2)} L <i>· ideal ${fmt(goal / 1000, 1)} L</i>${v >= goal ? ' <b class="ok">✓</b>' : ''}</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--cyan)"></div><span class="goal" style="left:${mk}%"></span></div></div>`;
}
// peso: só mostra tendência com dados suficientes; filtro de período e comparação com o registro anterior
const W_RANGES = { 7: '7 dias', 30: '30 dias', 365: '1 ano' };
function weightChart() {
  const all = Object.keys(S.logs.weights).sort();
  if (all.length < 3) {
    const n = all.length;
    return `<div class="wempty"><p class="small"><b>Registre seu peso algumas vezes pra acompanhar sua evolução.</b></p>
      <p class="small muted">De manhã, em jejum, depois do banheiro. Com 3 registros o gráfico aparece.</p>
      <div class="wdots" aria-label="${n} de 3 registros">${[0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}<span class="small muted">${n} de 3</span></div></div>`;
  }
  const r = +(S.ui.wRange || 30), from = dayKey(new Date(Date.now() - r * 864e5));
  const ks = all.filter(k => k >= from), ys = ks.map(k => S.logs.weights[k]);
  const last = S.logs.weights[all[all.length - 1]], prev = S.logs.weights[all[all.length - 2]], dPrev = last - prev;
  const segs = `<div class="segs small wseg">${Object.entries(W_RANGES).map(([k, v]) => `<button class="${+k === r ? 'on' : ''}" data-act="wRange" data-r="${k}">${v}</button>`).join('')}</div>`;
  const stats = `<div class="wstats"><div><small class="muted">Atual</small><b class="mono">${fmt(last)} kg</b></div>
    <div><small class="muted">vs anterior</small><b class="mono ${dPrev < 0 ? 'down' : dPrev > 0 ? 'up' : ''}">${dPrev > 0 ? '+' : ''}${fmt(dPrev)} kg</b></div>`;
  if (ks.length < 3) return `${segs}${stats}<div><small class="muted">Tendência</small><b class="mono">—</b></div></div><p class="small muted">Poucos registros nesse período. Tente um período maior.</p>`;
  const avg = movingAvg(ys, 7), lo = Math.min(...ys) - 0.5, hi = Math.max(...ys) + 0.5;
  const W = 320, H = 120, px = i => 8 + i * (W - 16) / (ks.length - 1), py = v => H - 10 - (v - lo) / (hi - lo) * (H - 24);
  const line = avg.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const dots = ys.map((v, i) => `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="2.2" class="dot"/>`).join('');
  const delta = avg[avg.length - 1] - avg[0];
  return `${segs}${stats}<div><small class="muted">Tendência</small><b class="mono ${delta < 0 ? 'down' : delta > 0 ? 'up' : ''}">${delta > 0 ? '+' : ''}${fmt(delta)} kg</b></div></div>
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Gráfico de peso">${dots}<path d="${line}" class="trend"/></svg>
    <div class="row between small muted"><span>${ks[0].slice(8)}/${ks[0].slice(5, 7)}</span><span>${ks.length} registros</span><span>${ks[ks.length - 1].slice(8)}/${ks[ks.length - 1].slice(5, 7)}</span></div>`;
}
// barra da tela Hoje: deixa claro o que já foi e o que falta (a bar() original continua na Nutrição)
function macroBar(name, v, max, color) {
  const pct = Math.min(100, max ? v / max * 100 : 0), left = Math.max(0, max - v);
  return `<div class="bar mbar"><div class="bar-top"><span>${name}</span><span class="mono">${fmt(v, 0)}<i>/${fmt(max, 0)}g</i></span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
    <small class="left">${v >= max && max ? 'meta batida ✓' : `faltam ${fmt(left, 0)} g`}</small></div>`;
}
// garrafa de água: enche até o traço do ideal e continua acima dele (sem teto)
let lastWaterPct = null, wlOpen = false, clearArm = 0, comoOpen = false;
function waterBottle(v, goal) {
  const cap = Math.max(goal * 1.25, v * 1.08), pct = Math.min(100, v / cap * 100), mk = goal / cap * 100;
  const from = lastWaterPct ?? pct; lastWaterPct = pct;
  const top = 26, bot = 150, hTot = bot - top, y = bot - hTot * pct / 100, ym = bot - hTot * mk / 100;
  return `<svg class="bottle" viewBox="0 0 80 160" role="img" aria-label="Garrafa com ${fmt(v / 1000, 2)} litros de ${fmt(goal / 1000, 1)} ideais">
    <defs><clipPath id="btl"><path d="M30 6h20v12c0 4 14 8 14 20v104c0 6-4 10-10 10H26c-6 0-10-4-10-10V38c0-12 14-16 14-20z"/></clipPath></defs>
    <g clip-path="url(#btl)"><rect x="0" y="0" width="80" height="160" class="b-bg"/>
      <g class="b-water" style="--from:${(bot - hTot * from / 100).toFixed(1)}px;--to:${y.toFixed(1)}px"><path class="b-wave" d="M-80 6 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V200 H-80z"/></g></g>
    <line x1="10" x2="70" y1="${ym.toFixed(1)}" y2="${ym.toFixed(1)}" class="b-goal"/>
    <path d="M30 6h20v12c0 4 14 8 14 20v104c0 6-4 10-10 10H26c-6 0-10-4-10-10V38c0-12 14-16 14-20z" class="b-line"/>
    <rect x="28" y="1" width="24" height="7" rx="1" class="b-cap"/></svg>`;
}
// ciência do dia: alterna assuntos (só os esportes que a pessoa pratica)
function scienceOfDay() {
  const sportCats = { boxe: 'Boxe', muaythai: 'Muay thai', jiu: 'Jiu-jitsu', mma: 'MMA', corrida: 'Corrida' };
  const mine = new Set(mySports().map(id => sportCats[id]));
  const cats = [...new Set(EVIDENCE.map(e => e.cat))].filter(c => !Object.values(sportCats).includes(c) || mine.has(c));
  const n = Math.floor(new Date(today() + 'T12:00') / 864e5), cat = cats[n % cats.length];
  const list = EVIDENCE.filter(e => e.cat === cat);
  return list[Math.floor(n / cats.length) % list.length];
}
const readMin = e => Math.max(1, Math.round((e.do + ' ' + e.why).split(/\s+/).length / 180));
function scienceCard(e) {
  if (!e) return '';
  return `<details class="card ev sci" id="h-sci" ${S.ui.sci === today() ? '' : ''}><summary><div><small class="cat">${esc(e.cat)}</small><h3>${esc(e.title)}</h3>
    <p class="small sum">${esc(e.do)}</p><span class="small muted rt">Leitura de ${readMin(e)} min</span><span class="go">Ler →</span></div>${levelBadge(e.level)}</summary>
    <p class="why">${esc(e.why)}</p><ul class="refs">${e.refs.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
    <a class="small" href="#ciencia">Mais ciência →</a></details>`;
}
const ICO = {
  treino: '<svg viewBox="0 0 24 24"><path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/></svg>',
  comida: '<svg viewBox="0 0 24 24"><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 2-2 6 0 8v10"/></svg>',
  agua: '<svg viewBox="0 0 24 24"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></svg>',
  ciencia: '<svg viewBox="0 0 24 24"><path d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3zM21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z"/></svg>'
};
const levelBadge = l => `<span class="lvl lvl-${l}" title="Nível de evidência">${l}</span>`;
function evCard(e, open = false) {
  if (!e) return '';
  return `<details class="card ev" ${open ? 'open' : ''}><summary><div><small class="cat">${esc(e.cat)}</small><h3>${esc(e.title)}</h3></div>${levelBadge(e.level)}</summary>
    <p class="do">${esc(e.do)}</p><p class="why">${esc(e.why)}</p>
    <ul class="refs">${e.refs.map(r => `<li>${esc(r)}</li>`).join('')}</ul></details>`;
}
const ev = id => EVIDENCE.find(e => e.id === id);
const sel = (name, opts, cur, extra = '') => `<select name="${name}" ${extra}>${Object.entries(opts).map(([v, t]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;

// ---------------- Telas ----------------
const views = {};

views.onboarding = () => {
  const p = S.profile || {}, sp = sportsOf(p);
  return `${S.profile ? '<section class="head"><h1>Perfil</h1></section>' : `<section class="hero"><div class="logo-big">RONIN</div><div class="kanji">浪人</div><p class="tag">Sem mestre. Só disciplina.</p><p>Luta, corrida, força e nutrição com base em ciência. Em casa ou na academia.</p></section>
  ${cloud.available() ? (cloud.user() ? `<p class="note small">Conectado como <b>${esc(cloud.user().email || '')}</b>. Seus dados vão pra nuvem assim que você salvar.</p>` : `<div class="card center"><p class="small">Quer salvar na nuvem e usar em outros aparelhos?</p><button class="btn small" data-act="toLogin">Entrar ou criar conta</button></div>`) : ''}`}
  <form id="profileForm" class="card form">
    <h2>${S.profile ? 'Editar perfil' : 'Vamos te conhecer'}</h2>
    <div class="grid2">
      <label>Sexo biológico ${sel('sex', { m: 'Masculino', f: 'Feminino' }, p.sex || 'm')}</label>
      <label>Idade <input name="age" inputmode="numeric" value="${esc(p.age ?? '')}" required placeholder="anos"></label>
      <label>Altura (cm) <input name="height" inputmode="decimal" value="${esc(p.height ?? '')}" required placeholder="178"></label>
      <label>Peso (kg) <input name="weight" inputmode="decimal" value="${esc(p.weight ?? '')}" required placeholder="80"></label>
    </div>
    <label>% de gordura <small>(opcional, melhora a precisão)</small><input name="bf" inputmode="decimal" value="${esc(p.bf ?? '')}" placeholder="ex.: 15"></label>
    <label>Dia a dia fora do treino ${sel('neat', NEAT, p.neat || 1.3)}</label>
    <label>Objetivo ${sel('goal', GOALS, p.goal || 'recomp')}</label>
    <label class="cut-only">Ritmo de perda ${sel('rate', { 0.5: '0,5% do peso/semana (recomendado)', 0.75: '0,75%/semana', 1: '1%/semana (agressivo)' }, p.rate || 0.5)}</label>
    <label>Experiência de treino ${sel('experience', { iniciante: 'Iniciante (< 1 ano)', intermediario: 'Intermediário (1–3 anos)', avancado: 'Avançado (3+ anos)' }, p.experience || 'intermediario')}</label>

    <h3 class="sec">Seus esportes</h3>
    <p class="small muted">Marque quantos quiser. Cada um muda o gasto, os treinos e as dicas.</p>
    ${SPORT_IDS.map(id => {
      const S0 = SPORTS[id], on = !!sp[id], v = sp[id] || {};
      return `<div class="sport ${on ? 'on' : ''}" data-sport="${id}">
        <label class="check big"><input type="checkbox" name="sp_${id}" ${on ? 'checked' : ''}><span><b class="mk">${S0.mark}</b>${esc(S0.n)}</span></label>
        <div class="sport-cfg grid2">
          <label>Dias/semana ${sel('sd_' + id, { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }, v.days || 3)}</label>
          <label>Min. por treino <input name="sm_${id}" inputmode="numeric" value="${esc(v.min || 60)}"></label>
          <label>Tipo mais comum ${sel('st_' + id, Object.fromEntries(Object.entries(S0.types).map(([k, t]) => [k, t.n])), v.type || S0.defaultType)}</label>
          <label>Onde ${sel('sw_' + id, id === 'corrida' ? { rua: 'Rua / parque', esteira: 'Esteira' } : { casa: 'Em casa', academia: 'Academia / equipe' }, v.where || (id === 'corrida' ? 'rua' : 'casa'))}</label>
        </div></div>`;
    }).join('')}

    <h3 class="sec">Força (musculação ou calistenia)</h3>
    <div class="grid2">
      <label>Onde ${sel('env', { casa: 'Em casa / calistenia', academia: 'Academia' }, p.env || 'casa')}</label>
      <label>Dias por semana ${sel('liftDays', { 0: '0 (por enquanto)', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }, p.liftDays ?? 2)}</label>
      <label>Min. por sessão <input name="liftMin" inputmode="numeric" value="${esc(p.liftMin ?? 40)}"></label>
    </div>
    <fieldset class="equip"><legend>O que você tem em casa?</legend>
      ${Object.entries(EQUIP).map(([k, v]) => `<label class="check"><input type="checkbox" name="equip" value="${k}" ${(p.equip || []).includes(k) ? 'checked' : ''}><span>${esc(v)}</span></label>`).join('')}
      <small class="muted">Sem nada marcado = só peso corporal (calistenia). O app escolhe os exercícios pelo que você tem.</small>
    </fieldset>

    ${restrBox(restrOfProfile(p))}
    <button class="btn primary" type="submit">${S.profile ? 'Salvar' : 'Montar meu plano'}</button>
    <p class="muted small">Não substitui nutricionista ou médico se você tem alguma condição de saúde.</p>
  </form>`;
};

views.hoje = () => {
  const t = T(), f = dayFood(), w = dayWater();
  const plan = buildPlan(S.profile);
  const lastW = S.logs.workouts[S.logs.workouts.length - 1];
  const nextIdx = lastW && plan.days.length ? (lastW.idx + 1) % plan.days.length : 0;
  const next = plan.days[nextIdx];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const tip = scienceOfDay();
  const todayS = S.logs.sessions.filter(b => b.date === curDay());
  const todayW = S.logs.workouts.filter(x => x.date === curDay());
  const wl = S.logs.water[curDay()] || [];
  const cs = curSport(), SP = SPORTS[cs], spMin = sportsOf(S.profile)[cs]?.min || 60;
  const items = S.logs.food[curDay()] || [], mealsDone = new Set(items.map(i => i.m || 'extra'));
  const nMeals = MEALS.filter(m => m.id !== 'extra' && mealsDone.has(m.id)).length;
  const doneTrain = todayS.length + todayW.length;
  // treino sugerido: força se ainda não fez força ontem/hoje (ou se não tem esporte); senão o esporte
  const lift = next && (S.profile.liftDays ?? 2) > 0 && next.items.length;
  const yest = dayKey(new Date(Date.now() - 864e5));
  const liftRecent = lastW && (lastW.date === today() || lastW.date === yest);
  const hasSport = mySports().length > 0;
  const primary = lift && (!liftRecent || !hasSport) ? 'forca' : hasSport ? 'esporte' : lift ? 'forca' : null;
  const liftEx = lift ? next.items.filter(i => EXERCISES[i.ex].t !== 'prehab') : [];
  const sportCard = { cat: SP.n, title: SP.combat ? 'Rounds de ' + SP.n.toLowerCase() : 'Corrida do dia', desc: SP.combat ? 'Rounds com tema, combinações faladas e foco nos seus pontos fracos.' : 'Rodagem, intervalado ou tiros, com o timer marcando cada bloco.', meta: `~${spMin} min`, href: '#esporte', cta: SP.combat ? 'Montar e começar' : 'Montar corrida' };
  const liftCard = lift ? { cat: 'Força · ' + plan.split, title: next.name, desc: liftEx.slice(0, 4).map(i => i.name).join(' · ') + (liftEx.length > 4 ? '…' : ''), meta: `${liftEx.length} exercícios · ~${S.profile.liftMin ?? 40} min`, href: '#sessao-' + nextIdx, cta: 'Começar treino' } : null;
  const P = primary === 'forca' ? liftCard : primary === 'esporte' ? sportCard : null;
  const alt = primary === 'forca' && hasSport ? sportCard : primary === 'esporte' && liftCard ? liftCard : null;
  const tiles = [
    { id: 'h-treino', ico: ICO.treino, n: 'Treino', v: doneTrain ? `${doneTrain} feito${doneTrain > 1 ? 's' : ''}` : 'Pendente', ok: doneTrain > 0 },
    { id: 'h-nutri', ico: ICO.comida, n: 'Refeições', v: `${nMeals} de ${MEALS.length - 1}`, ok: f.k >= t.kcal * 0.9 },
    { id: 'h-agua', ico: ICO.agua, n: 'Água', v: `${fmt(w / 1000, 1)} / ${fmt(t.water / 1000, 1)} L`, ok: w >= t.water },
    { id: 'h-sci', ico: ICO.ciencia, n: 'Ciência', v: S.ui.sci === today() ? 'Lida' : '1 nova', ok: S.ui.sci === today() }
  ];
  const okN = tiles.filter(x => x.ok).length;
  return `<section class="head"><div>${viewDay ? '<small class="muted">Editando um dia passado</small><br>' : `<small class="muted">${greet}</small><br>`}<h1>${viewDay ? 'Registro' : 'Hoje'}</h1></div></section>
  ${dayNav()}
  ${viewDay ? '' : `<div class="dayrow" aria-label="Resumo do dia: ${okN} de 4">${tiles.map(x => `<button class="dtile ${x.ok ? 'ok' : ''}" data-act="jump" data-to="${x.id}">${x.ico}<b>${x.n}</b><small>${x.ok ? '✓ ' : ''}${esc(x.v)}</small></button>`).join('')}</div>`}
  <div class="card glow" id="h-nutri">
    <div class="row">
      ${ring(f.k, t.kcal, f.k > t.kcal ? '+' + fmt(f.k - t.kcal, 0) : fmt(Math.max(0, t.kcal - f.k), 0), f.k > t.kcal ? 'kcal acima' : 'kcal restantes')}
      <div class="grow">${macroBar('Proteína', f.p, t.protein, 'var(--acc)')}${macroBar('Carboidrato', f.c, t.carbs, 'var(--cyan)')}${macroBar('Gordura', f.f, t.fat, 'var(--amber)')}</div>
    </div>
    <p class="kcalline small"><b class="mono">${fmt(f.k, 0)}</b> de <b class="mono">${fmt(t.kcal, 0)}</b> kcal consumidas</p>
    <div class="mealrow">${MEALS.map(m => `<a href="#nutri" class="mchip ${mealsDone.has(m.id) ? 'on' : ''}" title="${esc(m.n)}"><span>${m.ico}</span><small>${esc(m.n.split(' ')[0])}</small></a>`).join('')}</div>
    <a class="btn small block" href="#nutri">+ Registrar refeição</a>
  </div>
  <div class="card" id="h-agua">
    <div class="wtop">
      ${waterBottle(w, t.water)}
      <div class="grow">
        <h3>Água</h3>
        <p class="wbig mono">${fmt(w / 1000, 2)} L</p>
        <p class="small muted">ideal ${fmt(t.water / 1000, 1)} L · ${w >= t.water ? `<b class="ok">meta batida ✓${w > t.water ? ` +${fmt((w - t.water) / 1000, 2)} L` : ''}</b>` : `faltam ${fmt((t.water - w) / 1000, 2)} L`}</p>
        <div class="water">
          <button class="btn small" data-act="water" data-v="250">+250</button><button class="btn small" data-act="water" data-v="500">+500</button>
          <button class="btn small ghost" data-act="water" data-v="-250" ${w ? '' : 'disabled'} aria-label="Tirar 250 ml">−250</button>
        </div>
        <form id="waterForm" class="row gap"><input name="ml" inputmode="numeric" placeholder="outra (ml)" aria-label="Outra quantidade em ml"><button class="btn small ghost" type="submit">ok</button></form>
      </div>
    </div>
    ${wl.length ? `<details class="wlist" ${wlOpen ? 'open' : ''}><summary class="small">Histórico ${viewDay ? 'do dia' : 'de hoje'} (${wl.length})</summary><ul class="list">${wl.map(x => `<li><span class="small mono">${x.t ? new Date(x.t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</span><span class="small grow">${x.ml > 0 ? '+' : ''}${x.ml} ml</span><button class="x" data-act="delWater" data-id="${x.id}" aria-label="Apagar">×</button></li>`).join('')}</ul>
      <button class="linkbtn wclear" data-act="clearWater">Apagar todo o histórico</button></details>` : ''}
  </div>
  <div class="card ${viewDay ? '' : 'panel'}" id="h-treino">
    <small class="cat">${viewDay ? 'Treinos do dia' : 'Seu treino de hoje'}</small>
    ${doneTrain ? `<ul class="done">${todayW.map(x => `<li>✓ <b>${esc(x.name)}</b> <span class="muted small">· força</span></li>`).join('')}${todayS.map(b => `<li>✓ <b>${esc(SPORTS[b.sport]?.n || '')}</b> <span class="muted small">· ${esc(SPORTS[b.sport]?.types[b.type]?.n || '')} · ${b.min} min · ~${fmt(b.kcal, 0)} kcal</span></li>`).join('')}</ul>` : viewDay ? `<p class="muted small">Nenhuma sessão registrada nesse dia.</p>` : ''}
    ${viewDay ? '' : P ? `<div class="tmain"><small class="muted tcat">${doneTrain ? 'Quer mais? ' : ''}${esc(P.cat)}</small><h3>${esc(P.title)}</h3>
      <p class="small muted">${esc(P.desc)}</p><p class="small tmeta mono">${esc(P.meta)}</p>
      <a class="btn primary block" href="${P.href}">${P.cta} →</a></div>
      ${alt ? `<a class="talt small" href="${alt.href}">Prefere outro? <b>${esc(alt.cat.split(' · ')[0])}: ${esc(alt.title)}</b> →</a>` : ''}`
    : `<p class="small">Você ainda não tem treino programado.</p><a class="btn primary block" href="#perfil">Montar meu plano →</a>`}
  </div>
  <div class="card" id="h-peso">
    <form id="weighForm" class="row between"><h3>Peso${viewDay ? ' do dia' : ''}</h3><div class="row gap"><input name="kg" inputmode="decimal" placeholder="${S.logs.weights[curDay()] != null ? fmt(S.logs.weights[curDay()]) : fmt(latestWeight())} kg" style="width:96px" aria-label="Peso do dia"><button class="btn small" type="submit">Salvar</button></div></form>
    ${weightChart()}
  </div>
  <small class="cat pad">Ciência do dia</small>
  ${scienceCard(tip)}`;
};

views.nutri = () => {
  const t = T(), f = dayFood(), w = dayWater(), items = S.logs.food[curDay()] || [], p = S.profile;
  const ad = adaptiveTDEE(S.logs.weights, foodTotals());
  const over = f.k > t.kcal, left = Math.max(0, t.kcal - f.k), pct = Math.min(100, t.kcal ? f.k / t.kcal * 100 : 0);
  const lw = latestWeight(), wDiff = lw && p.weight ? Math.round((lw - p.weight) * 10) / 10 : 0;
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), 0);
  const actDays = (p.liftDays || 0) + sportDays(p);
  return `<section class="head"><h1>Nutrição</h1></section>
  ${dayNav()}
  <div class="card glow" id="n-metas">
    <div class="row between"><small class="cat">${esc(dayLabel(curDay()))} · metas do dia</small><small class="mono muted">${items.length} ${items.length === 1 ? 'alimento' : 'alimentos'}</small></div>
    <div class="kcalhead"><b class="big mono">${fmt(f.k, 0)}</b><span class="mono">/ ${fmt(t.kcal, 0)} kcal</span></div>
    <div class="kbar ${over ? 'over' : ''}"><div style="width:${pct}%"></div></div>
    <p class="kleft small"><b class="${over ? 'warn' : ''}">${over ? `${fmt(f.k - t.kcal, 0)} kcal acima da meta` : f.k ? `${fmt(left, 0)} kcal restantes` : `${fmt(t.kcal, 0)} kcal pra hoje`}</b><span class="muted mono">${fmt(pct, 0)}%</span></p>
    <div class="mgrid">${macroBar('Proteína', f.p, t.protein, 'var(--acc)')}${macroBar('Carboidrato', f.c, t.carbs, 'var(--cyan)')}${macroBar('Gordura', f.f, t.fat, 'var(--amber)')}${macroBar('Fibras', f.fb, t.fiber, 'var(--ink2)')}</div>
    ${waterBar(w, t.water)}
  </div>
  ${menuCard()}
  <div class="card" id="n-analise">
    <h3>Análise Nutricional</h3>
    <ul class="alist">
      <li><b>Tendência prevista</b><span class="mono">${t.weekChange > 0 ? '+' : ''}${fmt(t.weekChange, 2)} kg/semana</span>
        <small>Se você bater a meta: (${fmt(t.kcal, 0)} − ${fmt(t.tdee, 0)} kcal de gasto) × 7 dias ÷ 7.700 kcal por kg.</small></li>
      ${ad.ready ? `<li><b>Tendência real</b><span class="mono">${ad.slopeWeek > 0 ? '+' : ''}${fmt(ad.slopeWeek, 2)} kg/semana</span>
        <small>Das suas ${ad.weighIns} pesagens nos últimos 28 dias.</small></li>` : ''}
      <li><b>Fibras</b><span class="mono">${fmt(f.fb, 0)} / ${t.fiber} g</span>
        <small>Meta de 14 g a cada 1.000 kcal (recomendação do IOM/EUA). Vêm de feijão, aveia, frutas, verduras e integrais.</small></li>
      ${activeRestr().length ? (() => { const h = dayHits(curDay()), st = cleanStreak(), r = restrOfProfile(), tOn = tempOn(r), left = tOn && r.until ? Math.round((new Date(r.until) - new Date(today())) / 864e5) : null, nm = l => esc(l.map(k => RESTR[k].n.split(' (')[0]).join(', ')); return `<li class="${h.length ? 'alert' : ''}"><b>Restrições</b><span class="mono">${h.length ? `${h.length} ${h.length === 1 ? 'deslize' : 'deslizes'}` : items.length ? 'limpo ✓' : '—'}</span>
        <small>${r.perm.length ? `Para sempre: ${nm(r.perm)}. ` : ''}${tOn ? `Temporárias: ${nm(r.temp)}.` : ''}${h.length ? ` Hoje: ${esc(h.map(i => i.n).join(', '))}.` : ''}${st ? ` ${st} ${st === 1 ? 'dia' : 'dias seguidos'} sem deslize.` : ''}${left != null ? ` Faltam ${left} ${left === 1 ? 'dia' : 'dias'} (até ${r.until.split('-').reverse().join('/')}).` : ''}</small>
        <small><b>Trocas:</b> ${[...(tOn ? r.temp : []), ...r.perm].filter((k, i, a) => a.indexOf(k) === i).slice(0, 4).map(k => `${esc(RESTR[k].n.split(' (')[0].toLowerCase())} → ${esc(RESTR[k].swap)}`).join('; ')}.</small></li>`; })() : ''}
      ${t.notes.map(n => `<li class="alert"><b>Atenção</b><span></span><p class="small">${esc(n.msg)}</p><small>Base: ${esc(n.base)}</small></li>`).join('')}
    </ul>
    ${t.notes.length || dayHits(curDay()).length ? '' : '<p class="small muted">Nenhum alerta: seus dados não indicam nada fora da faixa.</p>'}
  </div>
  <details class="card" id="n-como" ${comoOpen ? 'open' : ''}><summary><h3>Como cheguei nesse número</h3></summary>
    <small class="cat">Seus dados usados</small>
    <p class="small">${p.sex === 'f' ? 'Mulher' : 'Homem'}, ${esc(p.age)} anos, ${esc(p.height)} cm, <b>${fmt(p.weight)} kg</b>${p.bf ? `, ${fmt(p.bf, 0)}% de gordura` : ''} · ${esc(NEAT[p.neat] || 'fator ' + p.neat)} · ${actDays} treinos/semana · ${esc(GOALS[p.goal] || p.goal)}${p.goal === 'cut' ? ` (${fmt(p.rate || 0.5, 2)}%/semana)` : ''}</p>
    ${Math.abs(wDiff) >= 0.5 ? `<div class="note small">Seu último peso registrado é <b>${fmt(lw)} kg</b>, mas as metas usam ${fmt(p.weight)} kg do perfil.
      <button class="btn small primary block" data-act="syncWeight">Recalcular com ${fmt(lw)} kg</button></div>` : ''}
    <small class="cat">Calorias</small>
    <table class="tbl">
      <tr><td>Metabolismo basal (${t.bmrMethod})</td><td>${fmt(t.bmr, 0)}</td></tr>
      <tr><td>+ dia a dia (fator ${p.neat})</td><td>${fmt(t.neat - t.bmr, 0)}</td></tr>
      <tr><td>+ treinos (média/dia)</td><td>${fmt(t.ex, 0)}</td></tr>
      <tr><td>= Gasto pela fórmula</td><td>${fmt(t.formula, 0)}</td></tr>
      <tr><td>Gasto usado (${t.source})</td><td><b>${fmt(t.tdee, 0)}</b></td></tr>
      <tr><td>${p.goal === 'cut' ? 'Déficit pra secar' : p.goal === 'bulk' ? 'Superávit pra ganhar massa' : 'Ajuste (manter)'}</td><td>${sign(t.adj)}</td></tr>
      ${t.floored ? `<tr><td>Piso mínimo aplicado</td><td>↑</td></tr>` : ''}
      <tr><td><b>= Meta diária</b></td><td><b>${fmt(t.kcal, 0)}</b></td></tr>
    </table>
    <small class="cat">Macros e água</small>
    <table class="tbl">
      <tr><td>Proteína: ${t.proteinRule}${t.lbm ? ` (${fmt(t.lbm)} kg)` : ''}</td><td>${t.protein} g</td></tr>
      <tr><td>Gordura: ${t.fatByFloor ? '0,8 g por kg' : '20% das calorias'}</td><td>${t.fat} g</td></tr>
      <tr><td>Carboidrato: o que sobra das calorias</td><td>${t.carbs} g</td></tr>
      <tr><td>Fibras: 14 g por 1.000 kcal</td><td>${t.fiber} g</td></tr>
      <tr><td>Água: 35 ml/kg + 500 ml por hora de treino</td><td>${fmt(t.water / 1000)} L</td></tr>
    </table>
    <p class="small muted">${ad.ready ? `Pelos seus registros: ingestão média ${fmt(ad.avgIn, 0)} kcal e peso variando ${fmt(ad.slopeWeek, 2)} kg/semana → gasto real ≈ ${fmt(ad.tdee, 0)} kcal.` : `Modo adaptativo: com ≥ 8 pesagens e ≥ 10 dias de comida registrados nos últimos 28 dias, o app calcula seu gasto REAL. Agora: ${ad.weighIns} ${ad.weighIns === 1 ? "pesagem" : "pesagens"}, ${ad.foodDays} ${ad.foodDays === 1 ? "dia" : "dias"}.`}</p>
    <label class="switch"><input type="checkbox" data-act="toggleAdaptive" ${S.settings.adaptive ? 'checked' : ''}> Usar ajuste adaptativo</label>
    <a class="btn small ghost block" href="#perfil">Mudou algo? Editar meus dados</a>
  </details>
  <small class="cat pad">Refeições</small>
  ${MEALS.map(m => mealCard(m, items.filter(it => (it.m || 'extra') === m.id))).join('')}
  <p class="muted small pad">Valores aproximados (base TACO/USDA; besteiras = média de mercado). Confira o rótulo quando tiver.</p>`;
};
// ---------------- Cardápio sugerido ----------------
const MENU_MEALS = ['cafe', 'almoco', 'lanche', 'jantar'];
const trainDaysWeek = () => (S.profile?.liftDays || 0) + sportDays(S.profile || {});
const menuCtx = () => ({ ok: n => !hitsOf(n).length, pantry: S.ui.pantry || {}, strict: !!S.ui.pStrict, big: T().kcal > 2600 });
const shortName = n => n.replace(/\s*\([^)]*(≈|ml|varia|lata, |sem pele)[^)]*\)/g, '').trim();
function menuTrain(d = curDay()) {
  const v = S.ui.mtrain?.[d]; if (typeof v === 'boolean') return v;
  return S.logs.workouts.some(w => w.date === d) || S.logs.sessions.some(x => x.date === d) || trainDaysWeek() >= 4;
}
// lê o cardápio salvo (pode ter vindo da nuvem: só aceita o formato esperado) e troca o que deixou de valer
function menuOf(d = curDay()) {
  const m = S.ui.menu?.[d];
  if (!m || typeof m !== 'object' || !m.meals || typeof m.meals !== 'object') return null;
  if (typeof m.seed !== 'number') m.seed = 1;
  const ctx = menuCtx();
  for (const meal of Object.keys(m.meals)) if (!MENU_MEALS.includes(meal)) delete m.meals[meal];
  for (const meal of MENU_MEALS) { // primeiro arruma o formato de todas as refeições
    const mm = m.meals[meal]; if (!mm || typeof mm !== 'object') { m.meals[meal] = { pick: {}, done: false }; continue; }
    if (!mm.pick || typeof mm.pick !== 'object' || Array.isArray(mm.pick)) mm.pick = {};
    mm.done = mm.done === true;
  }
  for (const meal of MENU_MEALS) { // depois troca o que deixou de valer
    const mm = m.meals[meal];
    for (const [k, n] of Object.entries(mm.pick)) {
      if (!SLOTS[meal].some(x => x.k === k) || typeof n !== 'string' || !foodByName(n) || !ctx.ok(n) || ctx.pantry[n] === 'nao') {
        const alt = !mm.done && swapPick(m.meals, meal, k, ctx, m.seed || 1, 99); if (alt) mm.pick[k] = alt; else delete mm.pick[k];
      }
    }
  }
  return m;
}
function makeMenu(d, avoid = new Set()) {
  S.ui.menu ||= {};
  const seed = Math.floor(Math.random() * 1e9);
  S.ui.menu[d] = { seed, sw: 0, meals: pickDay(menuCtx(), seed, avoid) };
  // guarda só de uma semana atrás até uma semana à frente
  const lo = dayKey(new Date(Date.now() - 8 * 864e5)), hi = dayKey(new Date(Date.now() + 9 * 864e5));
  for (const k of Object.keys(S.ui.menu)) if (k < lo || k > hi) delete S.ui.menu[k];
}
function solvedMenu(d = curDay()) {
  const plan = menuOf(d); if (!plan) return null;
  const dt = dayTargets(T(), menuTrain(d), trainDaysWeek());
  return { plan, dt, sol: solveDay(plan.meals, dt) };
}
function menuCard() {
  const m = solvedMenu();
  return `<a class="card link menucard" href="#cardapio" id="n-menu"><small class="cat">Cardápio do dia</small>
    ${m ? `<h3>${fmt(m.sol.tot.k, 0)} kcal em 4 refeições</h3><p class="small muted">${MENU_MEALS.filter(x => m.plan.meals[x]?.done).length} de 4 registradas · ${menuTrain() ? 'dia de treino' : 'dia de descanso'}</p>`
      : `<h3>Montar meu cardápio</h3><p class="small muted">Sugestão que fecha suas metas, respeita suas restrições e usa o que você tem em casa.</p>`}
    <span class="go">Abrir →</span></a>`;
}
let pantryOpen = false, shopOpen = false;
const PANTRY_ROLES = [['prot', 'Proteínas'], ['carb', 'Arroz, massas e tubérculos'], ['pao', 'Pães e café da manhã'], ['leg', 'Leguminosas'], ['lat', 'Leites, iogurtes e queijos'], ['veg', 'Verduras e legumes'], ['fruta', 'Frutas'], ['gord', 'Castanhas, sementes e pastas'], ['oleo', 'Óleos']];
const P_NEXT = { '': 'tem', tem: 'comprar', comprar: 'nao', nao: '' };
const pst = v => v === 'tem' || v === 'comprar' || v === 'nao' ? v : ''; // valor vindo da nuvem: só os três estados
function pantrySummary() {
  const v = Object.values(S.ui.pantry || {}), c = k => v.filter(x => x === k).length;
  const a = [c('tem') && `${c('tem')} tenho`, c('comprar') && `${c('comprar')} vou comprar`, c('nao') && `${c('nao')} não gosto`].filter(Boolean);
  return a.length ? a.join(' · ') : 'nada marcado';
}
function pantryBox() {
  const P = S.ui.pantry || {};
  return `<details class="card" id="c-desp" ${pantryOpen ? 'open' : ''}><summary><h3>Despensa e gostos</h3><small class="muted" id="pSum">${esc(pantrySummary())}</small></summary>
    <p class="small muted">Toque pra marcar: <b>tenho</b> → <b class="pq">vou comprar</b> → <s>não gosto</s> → limpar. O cardápio prefere o que você tem e nunca usa o que você não gosta.</p>
    <label class="switch"><input type="checkbox" data-act="pStrict" ${S.ui.pStrict ? 'checked' : ''}> Montar só com o que tenho ou vou comprar</label>
    <input id="pSearch" placeholder="Buscar alimento" autocomplete="off">
    ${PANTRY_ROLES.map(([r, lab]) => { const list = FOODS.filter(f => f.r === r && !hitsOf(f.n).length); return list.length ? `<div class="pgrp"><small class="cat">${lab}</small><div class="pchips">${list.map(f => `<button type="button" class="pchip ${pst(P[f.n])}" data-n="${esc(f.n)}">${esc(shortName(f.n))}</button>`).join('')}</div></div>` : ''; }).join('')}
    <button class="btn small block" data-act="menuMake">Refazer o cardápio com a despensa</button>
  </details>`;
}
function shopBox() {
  const sh = S.ui.shop; if (!sh?.from || !/^\d{4}-\d{2}-\d{2}$/.test(sh.from)) return '';
  const days = [...Array(7)].map((_, i) => { const d = new Date(sh.from + 'T12:00'); d.setDate(d.getDate() + i); return dayKey(d); });
  const plans = days.map(d => { const m = solvedMenu(d); if (!m) return null; return { meals: Object.fromEntries(Object.entries(m.sol.meals).filter(([k]) => !m.plan.meals[k]?.done)) }; }).filter(Boolean);
  if (!plans.length) return '';
  const P = S.ui.pantry || {}, done = sh.done || {}, list = shoppingList(plans);
  const have = list.filter(x => x.src.some(n => P[n] === 'tem')), buy = list.filter(x => !have.includes(x));
  const groups = ['Hortifruti', 'Açougue e peixaria', 'Laticínios e ovos', 'Mercearia'];
  const row = x => `<li class="${done[x.n] ? 'got' : ''}"><label class="shoprow"><input type="checkbox" data-shop="${esc(x.n)}" ${done[x.n] ? 'checked' : ''}><span>${esc(x.n)}</span></label><span class="mono small">${esc(shopQty(x))}</span></li>`;
  return `<details class="card" id="c-lista" ${shopOpen ? 'open' : ''}><summary><h3>Lista de compras</h3><small class="muted">${plans.length} ${plans.length === 1 ? 'dia' : 'dias'} a partir de ${sh.from.split('-').reverse().slice(0, 2).join('/')} · ${buy.length} itens</small></summary>
    <p class="small muted">Arroz, feijão, carnes e afins já vêm convertidos pro peso cru.</p>
    ${groups.map(g => { const it = buy.filter(x => x.group === g); return it.length ? `<small class="cat">${g}</small><ul class="list shop">${it.map(row).join('')}</ul>` : ''; }).join('')}
    ${have.length ? `<small class="cat">Você já tem (confira se dá)</small><ul class="list shop">${have.map(row).join('')}</ul>` : ''}
    <button class="btn small block" data-act="shopShare">Copiar / compartilhar lista</button>
  </details>`;
}
views.cardapio = () => {
  const m = solvedMenu(), tr = menuTrain(), dt = m ? m.dt : dayTargets(T(), tr, trainDaysWeek()), td = trainDaysWeek();
  const P = S.ui.pantry || {};
  const mealHTML = meal => {
    const x = m.sol.meals[meal], info = MEALS.find(z => z.id === meal), done = m.plan.meals[meal]?.done;
    return `<div class="card cmeal ${done ? 'done' : ''}" id="cm-${meal}">
      <div class="row between"><h3><span class="mico">${info.ico}</span> ${esc(info.n)}</h3><span class="mono small">${fmt(x.tot.k, 0)} kcal</span></div>
      <ul class="list citems">${x.items.map(i => { const f = foodByName(i.n), h = hitsOf(i.n); return `<li><div class="grow"><b>${esc(shortName(i.n))}</b>${P[i.n] === 'tem' ? ' <em class="ptag">tenho</em>' : ''}${h.length ? ` <em class="rtag">⚠ ${esc(h.map(k => RESTR[k].n.split(' (')[0]).join(', '))}</em>` : ''}<small>${esc(measure(i.n, i.g))}${f?.un ? ` · ${fmt(i.g, 0)} g` : ''} · ${fmt(i.k, 0)} kcal</small></div>
        ${done ? '' : `<button class="swap" data-act="menuSwap" data-m="${meal}" data-s="${esc(i.slot)}" aria-label="Trocar ${esc(shortName(i.n))}">↻</button>`}</li>`; }).join('') || '<li class="muted small">Sem opções pra essa refeição com suas restrições.</li>'}</ul>
      <div class="msum"><span>Total</span><span class="mono">P ${fmt(x.tot.p, 0)}g</span><span class="mono">C ${fmt(x.tot.c, 0)}g</span><span class="mono">G ${fmt(x.tot.f, 0)}g</span><span class="mono">Fibra ${fmt(x.tot.fb, 0)}g</span></div>
      ${done ? `<p class="small okline">✓ Registrado em ${esc(info.n)}</p>` : `<button class="btn small block" data-act="menuEat" data-m="${meal}">✓ Comi isso: registrar</button>`}
    </div>`;
  };
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  return `<section class="head"><div><a href="#nutri" class="backlink">← Nutrição</a><h1>Cardápio</h1></div></section>
  ${dayNav()}
  <div class="card glow" id="c-top">
    ${td > 0 && td < 7 ? `<div class="segs small"><button class="${tr ? 'on' : ''}" data-act="menuTrain" data-v="1">Dia de treino</button><button class="${tr ? '' : 'on'}" data-act="menuTrain" data-v="0">Descanso</button></div>
    <p class="small muted">${tr ? `Dia de treino: +${dt.shiftG} g de carboidrato pra render e recuperar.` : `Descanso: ${dt.shiftG} g de carboidrato. Na semana, a média fica na sua meta.`}</p>` : ''}
    <div class="ctgt">${[['kcal', dt.kcal, m?.sol.tot.k, ''], ['Proteína', dt.p, m?.sol.tot.p, 'g'], ['Carbo', dt.c, m?.sol.tot.c, 'g'], ['Gordura', dt.f, m?.sol.tot.f, 'g']].map(([l, tg, v, u]) => `<div><small>${l}</small><b class="mono">${m ? fmt(v, 0) : '—'}</b><i>/ ${fmt(tg, 0)}${u}${m ? ` · ${pct(v, tg)}%` : ''}</i></div>`).join('')}</div>
    ${m ? '' : `<button class="btn primary block" data-act="menuMake">Montar cardápio${viewDay ? ' desse dia' : ' de hoje'}</button>`}
  </div>
  ${m ? MENU_MEALS.map(mealHTML).join('') + `<div class="row gap cactions"><button class="btn small" data-act="menuMake">↻ Gerar outro</button><button class="btn small" data-act="menuWeek">Planejar 7 dias + lista</button></div>` : ''}
  ${shopBox()}
  ${pantryBox()}
  <p class="muted small pad">Sugestão automática feita com as suas metas, restrições e despensa. Não substitui um nutricionista.</p>`;
};

const FOOD_CATS = { '': 'Todos', proteina: 'Proteínas', base: 'Refeição', verdura: 'Verduras', fruta: 'Frutas', lanche: 'Lanches', besteira: 'Besteiras' };
let addMeal = null, foodCat = '';
const mealShut = new Set(); // refeições que a pessoa recolheu (abertas por padrão)
const defaultMeal = () => { const h = new Date().getHours(); return h >= 4 && h <= 10 ? 'cafe' : h <= 14 ? 'almoco' : h <= 17 ? 'lanche' : h <= 21 ? 'jantar' : 'extra'; };
const amtOf = it => it.g ?? it.q ?? 1;
const unitOf = it => it.u || (it.g != null ? 'g' : 'porção');
const stepOf = it => it.st || (unitOf(it) === 'porção' ? 1 : 10);
// alimentos registrados recentemente (dados do próprio usuário), pra adicionar de novo com um toque
function recentFoods() {
  const seen = new Set(), out = [];
  for (const d of Object.keys(S.logs.food).sort().reverse()) {
    for (const it of [...S.logs.food[d]].reverse()) {
      const k = norm(it.n); if (seen.has(k)) continue; seen.add(k);
      const i = FOODS.findIndex(fd => norm(fd.n) === k);
      out.push({ it, i }); if (out.length >= 8) return out;
    }
  }
  return out;
}
function mealCard(m, list) {
  const tot = list.reduce((a, i) => ({ k: a.k + i.k, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f, fb: a.fb + (i.fb || 0) }), { k: 0, p: 0, c: 0, f: 0, fb: 0 });
  const adding = addMeal === m.id, open = adding || (list.length > 0 && !mealShut.has(m.id));
  const addLabel = m.id === 'extra' ? 'belisco' : 'alimento';
  const head = list.length
    ? `<button class="mhead" data-act="mealToggle" data-m="${m.id}" aria-expanded="${open}"><span class="mico">${m.ico}</span><span class="grow"><b>${esc(m.n)}</b><small>${list.length} ${list.length === 1 ? 'item' : 'itens'}${open ? '' : ' · ' + esc(list.map(i => i.n.split(/[ (,]/)[0]).join(', ')).slice(0, 38)}</small></span><span class="mono mk">${fmt(tot.k, 0)} kcal</span><span class="chev">${open ? '▴' : '▾'}</span></button>`
    : `<div class="mhead"><span class="mico">${m.ico}</span><span class="grow"><b>${esc(m.n)}</b><small>Nada registrado</small></span>${adding ? '' : `<button class="btn small" data-act="addMeal" data-m="${m.id}" aria-label="Adicionar ${addLabel} em ${esc(m.n)}">+ Adicionar</button>`}</div>`;
  return `<div class="card meal ${adding ? 'open' : ''} ${list.length ? '' : 'empty'}" id="meal-${m.id}">
    ${head}
    ${open && list.length ? `<ul class="list items">${list.map(it => `<li class="${hitsOf(it).length ? 'hit' : ''}"><div class="grow"><b>${esc(it.n)}</b>${hitsOf(it).length ? `<em class="rtag">⚠ ${esc(hitsOf(it).map(k => RESTR[k].n.split(' (')[0]).join(', '))}</em>` : ''}<small><b class="mono">${fmt(it.k, 0)} kcal</b> · P ${fmt(it.p, 0)} · C ${fmt(it.c, 0)} · G ${fmt(it.f, 0)}</small></div>
      <div class="qty"><button data-act="qty" data-id="${it.id}" data-d="-1" aria-label="Menos">−</button><input data-qty="${it.id}" inputmode="decimal" value="${fmt(amtOf(it), 1)}" aria-label="Quantidade"><span>${esc(unitOf(it))}</span><button data-act="qty" data-id="${it.id}" data-d="1" aria-label="Mais">+</button></div>
      <button class="x" data-act="delFood" data-id="${it.id}" aria-label="Remover">×</button></li>`).join('')}</ul>
      <div class="msum"><span>Total</span><b class="mono">${fmt(tot.k, 0)} kcal</b><span class="mono">P ${fmt(tot.p, 0)}g</span><span class="mono">C ${fmt(tot.c, 0)}g</span><span class="mono">G ${fmt(tot.f, 0)}g</span><span class="mono">Fibra ${fmt(tot.fb, 0)}g</span></div>` : ''}
    ${adding ? `<div class="addbox">
      <button class="btn small block scanbtn" data-act="scanOpen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M16 8v8"/></svg> Escanear código de barras</button>
      <input id="foodSearch" placeholder="Buscar (ovo, banana, arroz, chocolate…)" autocomplete="off">
      <div class="segs small">${Object.entries(FOOD_CATS).map(([k, v]) => `<button class="${foodCat === k ? 'on' : ''}" data-act="foodCat" data-c="${k}">${v}</button>`).join('')}</div>
      <div id="foodRecent"></div>
      <div id="foodResults" class="chips"></div><div id="foodPick"></div>
      <details><summary class="small">Adicionar manualmente (rótulo, restaurante)</summary>
        <form id="manualFood" class="form"><input name="n" placeholder="Nome" required>
          <div class="grid4 g5"><input name="k" placeholder="kcal" inputmode="decimal" required><input name="p" placeholder="P g" inputmode="decimal"><input name="c" placeholder="C g" inputmode="decimal"><input name="f" placeholder="G g" inputmode="decimal"><input name="fb" placeholder="Fibra g" inputmode="decimal"></div>
          <button class="btn small" type="submit">Adicionar</button></form>
      </details>
      <button class="linkbtn" data-act="addMeal" data-m="">Fechar</button></div>`
    : open ? `<button class="btn small ghost block addbtn" data-act="addMeal" data-m="${m.id}">+ Adicionar ${addLabel}</button>` : ''}
  </div>`;
}
let scanStop = null, scanProd = null;
function closeScan() { try { scanStop?.(); } catch (e) { } scanStop = null; scanProd = null; $('#scanbox')?.remove(); }
function scanMsg(html) { const m = $('#scanMsg'); if (m) m.innerHTML = html; }
function openScan() {
  closeScan();
  const box = document.createElement('div'); box.id = 'scanbox'; box.className = 'scanbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Escanear código de barras');
  box.innerHTML = `<div class="scancard"><div class="row between"><h3>Escanear código</h3><button class="x" data-act="scanClose" aria-label="Fechar">×</button></div>
    <div class="scanview" id="scanView"><video id="scanVid" playsinline muted></video><span class="scanframe"></span></div>
    <p class="small" id="scanMsg">Aponte a câmera pro código de barras do produto.</p>
    <form id="scanCode" class="row gap"><input name="code" inputmode="numeric" maxlength="14" placeholder="ou digite o código" autocomplete="off"><button class="btn small" type="submit">Buscar</button></form>
    <div id="scanRes"></div></div>`;
  document.body.appendChild(box);
  $('#scanCode').addEventListener('submit', e => { e.preventDefault(); const c = e.target.code.value.replace(/\D/g, ''); if (c.length < 8) { scanMsg('O código tem de 8 a 13 números.'); return; } try { scanStop?.(); } catch (er) { } scanStop = null; scanFound(c); });
  scanCam();
}
async function scanCam() {
  const v = $('#scanVid'), view = $('#scanView'); if (!v) return;
  view.hidden = false; $('#scanCode').hidden = false; $('#scanRes').innerHTML = ''; scanMsg('Aponte a câmera pro código de barras do produto.');
  if (!navigator.mediaDevices?.getUserMedia) { view.hidden = true; scanMsg('Este navegador não abre a câmera. Digite os números do código.'); return; }
  try { const stop = await startScan(v, scanFound); if (!$('#scanbox') || !v.isConnected) stop(); else scanStop = stop; }
  catch (e) { view.hidden = true; scanMsg(e && e.name === 'NotAllowedError' ? 'Sem permissão pra câmera. Libere nas configurações do navegador ou digite os números do código.' : 'Não consegui abrir a câmera. Digite os números do código.'); }
}
async function scanFound(code) {
  if (!$('#scanbox')) return;
  $('#scanView').hidden = true; scanMsg(`Buscando <b class="mono">${esc(code)}</b>…`);
  const r = await lookupBarcode(code);
  if (!$('#scanbox')) return;
  if (r.error) { scanMsg(`Não deu pra buscar: ${esc(r.error)}.`); $('#scanRes').innerHTML = `<button class="btn small block" data-act="scanRetry">Tentar de novo</button>`; return; }
  if (r.notFound) {
    scanMsg(`O código <b class="mono">${esc(code)}</b> não está na base de produtos${r.partial ? ' com a tabela nutricional' : ''}.`);
    $('#scanRes').innerHTML = `<div class="row gap"><button class="btn small primary" data-act="scanManual" data-n="${esc(r.partial || '')}">Digitar os valores do rótulo</button><button class="btn small" data-act="scanRetry">Escanear outro</button></div>`;
    return;
  }
  scanProd = r; $('#scanCode').hidden = true;
  const h = hitsOf(r), def = r.serving || 100;
  scanMsg('Achei:');
  $('#scanRes').innerHTML = `<form id="scanPick" class="pick"><b>${esc(r.n)}</b>
    <small class="muted">Por 100 ${r.u}: ${fmt(r.k, 0)} kcal · P ${fmt(r.p)} · C ${fmt(r.c)} · G ${fmt(r.f)} · Fibra ${fmt(r.fb)}</small>
    <div class="row gap"><input name="g" inputmode="decimal" value="${fmt(def, 0)}" aria-label="quantidade"><span>${r.u}</span><button class="btn small primary" type="submit">Adicionar</button></div>
    <small class="muted" id="scanInfo"></small>
    ${h.length ? `<p class="rwarn small">⚠ Tem ${esc(h.map(k => RESTR[k].n.toLowerCase()).join(' e '))}, que você está evitando.</p>` : ''}
    <button class="linkbtn" type="button" data-act="scanRetry">Escanear outro</button></form>`;
  const f = $('#scanPick'), upd = () => { const m = (num(f.g.value) || 0) / 100; $('#scanInfo').textContent = `${fmt(r.k * m, 0)} kcal · P ${fmt(r.p * m)} · C ${fmt(r.c * m)} · G ${fmt(r.f * m)} · Fibra ${fmt(r.fb * m)}`; };
  f.g.addEventListener('input', upd); upd();
  f.addEventListener('submit', e => {
    e.preventDefault(); const g = num(f.g.value) || 0; if (g <= 0 || g > 5000) { toast('Quantidade inválida'); return; }
    const m = g / 100, p = scanProd; closeScan();
    addFood({ n: p.n, g, u: p.u, st: g <= 60 ? g : 10, k: p.k * m, p: p.p * m, c: p.c * m, f: p.f * m, fb: p.fb * m, x: p.x, bc: p.code });
  });
}
// calendário do seletor de dia (Hoje e Nutrição)
document.addEventListener('change', e => {
  if (!e.target.classList?.contains('dayPick')) return;
  const v = e.target.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
  viewDay = v >= today() ? null : v; render();
});
document.addEventListener('click', e => { const i = e.target.closest?.('.dayPick'); if (i && i.showPicker) { try { i.showPicker(); } catch (er) { } } });
document.addEventListener('visibilitychange', () => { if (document.hidden && scanStop) { try { scanStop(); } catch (e) { } scanStop = null; if ($('#scanbox')) { $('#scanView').hidden = true; scanMsg('Câmera pausada.'); $('#scanRes').innerHTML = `<button class="btn small block" data-act="scanRetry">Ligar a câmera de novo</button>`; } } });
window.addEventListener('hashchange', closeScan);

// perfil: restrições compactas. Escolhe o modo (para sempre / temporária) e toca nas que quer
function restrSummary(r) {
  const a = [r.perm.length ? `${r.perm.length} para sempre` : '', r.temp.length ? `${r.temp.length} ${r.temp.length === 1 ? 'temporária' : 'temporárias'}` : ''].filter(Boolean);
  return a.length ? a.join(' · ') : 'nenhuma';
}
function restrBox(r) {
  const st = k => r.perm.includes(k) ? 'perm' : r.temp.includes(k) ? 'temp' : '';
  return `<details class="rbox" id="rbox"><summary><span><b>Restrições e alergias</b><small id="rsum">${esc(restrSummary(r))}</small></span></summary>
    <div class="segs small rmode"><button type="button" class="on" data-m="perm">Para sempre</button><button type="button" data-m="temp">Temporária</button></div>
    <small class="muted">Escolha o tipo e toque no que você evita. Toque de novo pra desmarcar.</small>
    ${Object.entries(RESTR_GROUPS).map(([g, gn]) => `<div class="rgrp"><small class="cat">${gn}</small><div class="rchips">${Object.entries(RESTR).filter(([, x]) => x.g === g).map(([k, x]) => `<button type="button" class="rchip ${st(k)}" data-r="${k}" title="${esc(x.n)}">${esc(x.n.split(' (')[0])}</button>`).join('')}</div></div>`).join('')}
    <label class="runtil" ${r.temp.length ? '' : 'hidden'}>Temporárias até <small>(opcional)</small><input type="date" name="restrUntil" value="${esc(r.until)}"></label>
    <input type="hidden" name="restrData" value="${esc(JSON.stringify({ perm: r.perm, temp: r.temp }))}">
    <small class="muted">Preto = para sempre · tracejado vermelho = temporária. Em alergia, confira sempre o rótulo.</small>
  </details>`;
}
function bindRestrBox(form) {
  const box = form.querySelector('#rbox'); if (!box) return;
  let mode = 'perm';
  const data = () => { try { return JSON.parse(form.restrData.value); } catch (e) { return { perm: [], temp: [] }; } };
  box.addEventListener('click', e => {
    const m = e.target.closest('.rmode button'); if (m) { mode = m.dataset.m; box.querySelectorAll('.rmode button').forEach(b => b.classList.toggle('on', b === m)); return; }
    const c = e.target.closest('.rchip'); if (!c) return;
    const d = data(), k = c.dataset.r, cur = d.perm.includes(k) ? 'perm' : d.temp.includes(k) ? 'temp' : '';
    d.perm = d.perm.filter(x => x !== k); d.temp = d.temp.filter(x => x !== k);
    const next = cur === mode ? '' : mode; if (next) d[next].push(k);
    c.classList.toggle('perm', next === 'perm'); c.classList.toggle('temp', next === 'temp');
    form.restrData.value = JSON.stringify(d);
    box.querySelector('#rsum').textContent = restrSummary(d);
    box.querySelector('.runtil').hidden = !d.temp.length;
  });
}

function foodPickHTML(i) {
  const fd = FOODS[i];
  return `<form id="pickForm" class="pick" data-i="${i}"><b>${esc(fd.n)}</b>
    <div class="row gap"><input name="g" inputmode="decimal" value="${esc(fd.g)}" aria-label="quantidade"><span>${/\(ml\)/.test(fd.n) ? 'ml' : 'g'}</span><button class="btn small primary" type="submit">Adicionar</button></div>
    <small class="muted" id="pickInfo"></small>${hitsOf(fd.n).length ? `<p class="rwarn small">⚠ Tem ${esc(hitsOf(fd.n).map(k => RESTR[k].n.toLowerCase()).join(' e '))}, que você está evitando.</p>` : ''}</form>`;
}

views.treino = () => {
  const plan = buildPlan(S.profile);
  if (plan.none) return `<section class="head"><h1>Força</h1><div class="chip">0 dias</div></section>
  <div class="card panel"><h3>Você marcou 0 dias de força</h3>
    <p class="small">Tudo certo focar no seu esporte. Mas 2 sessões curtas de força por semana (25–40 min, dá pra fazer em casa só com peso corporal) aumentam potência e reduzem lesões.</p>
    <button class="btn primary" data-act="addStrength">Quero 2 sessões de calistenia</button></div>
  <small class="cat pad">Base científica</small>
  ${['forca-lesao', 'calistenia', 'soco', 'concorrente'].map(id => evCard(ev(id))).join('')}`;
  const vols = Object.entries(plan.vol).filter(([m]) => m !== 'pescoco');
  const hist = S.logs.workouts.slice(-5).reverse();
  const extras = mySports().filter(id => SPORTS[id].sc.length).map(id => SPORTS[id].n);
  return `<section class="head"><h1>Força</h1><div class="chip">${esc(plan.split)}${plan.home ? ' · casa' : ''}</div></section>
  ${plan.reduced ? `<p class="note small">Volume ajustado pra baixo (${S.profile.experience === 'iniciante' ? 'iniciante' : 'muitos treinos do esporte na semana'}). Recupere bem antes de subir.</p>` : ''}
  ${extras.length ? `<p class="note small">Inclui exercícios específicos pra ${esc(extras.join(' e '))} (pegada, adutor, panturrilha, pescoço…).</p>` : ''}
  ${plan.days.map((d, i) => `<a class="card link" href="#sessao-${i}">
    <small class="cat">Dia ${i + 1}</small><h3>${esc(d.name)}</h3>
    <p class="muted small">${d.items.filter(i => EXERCISES[i.ex].t !== 'prehab').slice(0, 3).map(i => esc(i.name)).join(' · ')}… · ${d.items.reduce((a, b) => a + b.sets, 0)} séries</p><span class="go">Abrir →</span></a>`).join('')}
  <details class="card"><summary><h3>Volume semanal por músculo</h3></summary>
    <p class="small muted">Séries/semana (indiretas = 0,5). Faixa de referência: 10–20 por músculo.</p>
    ${vols.map(([m, v]) => { const c = v < 6 ? 'var(--muted)' : v < 10 ? 'var(--amber)' : v <= 20 ? 'var(--acc)' : 'var(--red)'; return bar(MUSCLES[m], v, 20, '', c); }).join('')}
    <p class="small muted">Seu esporte também trabalha ombros, core e pernas: acima de 20 séries, avalie se está recuperando. Com 2 dias/semana o volume é de manutenção, bom quando o esporte é a prioridade.</p>
  </details>
  <div class="card"><h3>Histórico</h3>
    <ul class="list">${hist.map(w => `<li><div><b>${esc(w.name)}</b><small>${w.date.split('-').reverse().join('/')} · ${Object.values(w.sets).flat().filter(s => s && s.reps).length} séries</small></div></li>`).join('') || '<li class="muted small">Nenhum treino registrado.</li>'}</ul></div>
  <small class="cat pad">Base científica</small>
  ${EVIDENCE.filter(e => e.cat === 'Musculação').map(e => evCard(e)).join('')}`;
};

let draft = null;
views.sessao = (idx) => {
  const plan = buildPlan(S.profile);
  const day = plan.days[+idx] || plan.days[0];
  if (!day) { location.hash = '#treino'; return ''; }
  if (!draft || draft.idx !== day.idx) draft = { idx: day.idx, key: day.key, name: day.name, date: today(), sets: {} };
  const lastFor = ex => { for (let i = S.logs.workouts.length - 1; i >= 0; i--) { const w = S.logs.workouts[i]; if (w.sets[ex]?.some(s => s && s.reps)) return w.sets[ex]; } return null; };
  return `<section class="head"><a href="#treino" class="back">←</a><h1>${esc(day.name)}</h1></section>
  <p class="note small">Aqueça 5–10 min + 1–2 séries leves no 1º composto. Exercícios de potência primeiro, sempre descansado.</p>
  ${day.items.map(it => {
    const e = EXERCISES[it.ex], sg = suggest(it, lastFor(it.ex));
    const unit = e.u === 's' ? 'seg' : e.u === 'm' ? 'm' : 'reps';
    const rows = Array.from({ length: it.sets }, (_, s) => {
      const v = draft.sets[it.ex]?.[s] || {};
      return `<div class="set ${v.reps ? 'done' : ''}"><span class="mono">${s + 1}</span>
        ${e.inc ? `<input data-set="${esc(it.ex)}|${s}|kg" inputmode="decimal" placeholder="${esc(sg.kg ?? 'kg')}" value="${esc(v.kg ?? '')}">` : `<span class="muted small">${e.band ? 'elástico' : e.t === 'power' ? 'explosivo' : 'peso corporal'}</span>`}
        <input data-set="${esc(it.ex)}|${s}|reps" inputmode="numeric" placeholder="${it.lo === it.hi ? it.lo : it.lo + '–' + it.hi}" value="${esc(v.reps ?? '')}">
        <span class="small muted">${unit}</span></div>`;
    }).join('');
    const lv = e.vars ? `<div class="lvl-row"><button class="lvlbtn" data-act="lvl" data-ex="${it.ex}" data-d="-1" ${it.lvl <= 0 ? 'disabled' : ''} aria-label="Mais fácil">‹</button>
        <span class="small">Nível ${it.lvl + 1}/${e.vars.length}</span><button class="lvlbtn ${sg.up ? 'hot' : ''}" data-act="lvl" data-ex="${it.ex}" data-d="1" ${it.lvl >= e.vars.length - 1 ? 'disabled' : ''} aria-label="Mais difícil">›</button></div>` : '';
    return `<div class="card ex"><div class="row between"><h3>${esc(it.name)}</h3><span class="chip">${it.sets}×${it.lo === it.hi ? it.lo : it.lo + '–' + it.hi}${e.u && e.u !== 's' && e.u !== 'm' ? e.u : ''}</span></div>
      ${lv}<p class="small muted">${esc(e.cue)}${it.rir ? ` · RIR ${it.rir} · descanso ${it.rest}` : ''}</p>
      <p class="small sug">${esc(sg.text)}</p>${rows}</div>`;
  }).join('')}
  <button class="btn primary block" data-act="finishWorkout">Finalizar treino</button>`;
};

// ---------------- Timer ----------------
const TM = { phase: 'idle', round: 0, end: 0, left: 0, paused: false, iv: null, warned: false, combo: '', nextCall: 0 };
let AC = null, wakeLock = null, VOICE = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC?.state === 'suspended') AC.resume(); return AC; }
function bell(times = 1) {
  const ac = audio(); if (!ac) return;
  for (let k = 0; k < times; k++) {
    const t0 = ac.currentTime + k * 0.45;
    [[523, 0.5], [1046, 0.25], [1567, 0.18], [2350, 0.08]].forEach(([fq, g]) => {
      const o = ac.createOscillator(), v = ac.createGain();
      o.type = 'sine'; o.frequency.value = fq; v.gain.setValueAtTime(g, t0); v.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
      o.connect(v).connect(ac.destination); o.start(t0); o.stop(t0 + 1.7);
    });
  }
  try { navigator.vibrate?.(times > 1 ? [300, 150, 300, 150, 300] : 400); } catch (e) { }
}
function clap() {
  const ac = audio(); if (!ac) return;
  for (let k = 0; k < 3; k++) {
    const t0 = ac.currentTime + k * 0.18, len = 0.05;
    const buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const s = ac.createBufferSource(), g = ac.createGain(); g.gain.value = 0.9; s.buffer = buf; s.connect(g).connect(ac.destination); s.start(t0);
  }
}
function say(text) {
  if (!S.timer.voice || !('speechSynthesis' in window)) return;
  try {
    if (!VOICE) VOICE = speechSynthesis.getVoices().find(v => /pt[-_]BR/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^pt/i.test(v.lang)) || null;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-BR'; u.rate = 1.25; if (VOICE) u.voice = VOICE;
    speechSynthesis.speak(u);
  } catch (e) { }
}
async function lockScreen(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { }
}
const prog = () => S.timer.program;
function cfgRound(r) { const P = prog(); return P ? P[Math.max(0, Math.min(P.length - 1, r - 1))] : { work: S.timer.work, rest: S.timer.rest, calls: S.timer.calls && !!SPORTS[curSport()].combos, t: '', sport: curSport() }; }
const totalRounds = () => prog() ? prog().length : S.timer.rounds;
function startPhase(phase, secs) { TM.phase = phase; TM.end = Date.now() + secs * 1000; TM.left = secs; TM.warned = false; TM.combo = ''; TM.nextCall = Date.now() + 2500; }
function callCombo() {
  const c = cfgRound(TM.round);
  if (!c.calls) return;
  const pool = comboPool(level(), c, c.sport || curSport());
  let pick; do { pick = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && pick === TM.combo);
  TM.combo = pick; say(comboSpeech(pick));
  const gap = level() === 'iniciante' ? [5000, 8000] : [3500, 6500];
  TM.nextCall = Date.now() + gap[0] + Math.random() * (gap[1] - gap[0]);
}
function tick() {
  if (TM.paused || TM.phase === 'idle' || TM.phase === 'done') return;
  TM.left = Math.max(0, Math.ceil((TM.end - Date.now()) / 1000));
  const c = cfgRound(TM.round);
  if (TM.phase === 'round') {
    if (TM.left === 10 && !TM.warned && c.work > 20) { TM.warned = true; clap(); if (c.calls) { say('Dez segundos! Solta tudo!'); TM.combo = 'SOLTA TUDO!'; TM.nextCall = Infinity; } }
    else if (TM.left > 10 && Date.now() >= TM.nextCall) callCombo();
  }
  if (TM.left <= 0) {
    if (TM.phase === 'prep') { TM.round = 1; startPhase('round', cfgRound(1).work); bell(1); announce(); }
    else if (TM.phase === 'round') {
      if (TM.round >= totalRounds()) { TM.phase = 'done'; bell(3); clearInterval(TM.iv); lockScreen(false); say('Fim do treino. Bom trabalho.'); finishProgram(); }
      else if (c.rest > 0) { startPhase('rest', c.rest); bell(2); const nx = cfgRound(TM.round + 1); if (nx.t) setTimeout(() => say('Próximo: ' + nx.t), 1800); }
      else { TM.round++; startPhase('round', cfgRound(TM.round).work); bell(1); announce(); }
    } else if (TM.phase === 'rest') { TM.round++; startPhase('round', cfgRound(TM.round).work); bell(1); announce(); }
  }
  paintTimer();
}
function announce() { const c = cfgRound(TM.round); if (c.t) setTimeout(() => say(c.t), 1600); }
function finishProgram() {
  if (!prog()) return;
  const P = prog(), sport = P[0].sport || curSport(), SP = SPORTS[sport];
  const mins = Math.round(P.reduce((a, r) => a + r.work + r.rest, 0) / 60);
  const type = sport === 'corrida' ? (P.some(r => r.rest) ? 'intervalado' : 'leve') : P.some(r => r.saco) ? (SP.types.saco ? 'saco' : SP.defaultType) : (SP.types.solo && !P.some(r => r.id === 'jj_rola') ? 'solo' : SP.defaultType);
  S.logs.sessions.push({ id: newId(), sport, date: today(), type, min: mins, kcal: sessionKcal(SP.types[type].met, latestWeight(), mins) });
  save(); toast(`Sessão registrada: ${mins} min`);
}
function paintTimer() {
  const el = $('#timer'); if (!el) return;
  const c = cfgRound(TM.round || 1), N = totalRounds();
  const total = TM.phase === 'round' ? c.work : TM.phase === 'rest' ? c.rest : TM.phase === 'prep' ? 10 : 1;
  const left = TM.phase === 'idle' ? cfgRound(1).work : TM.left;
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
  const r = 120, circ = 2 * Math.PI * r, pct = TM.phase === 'idle' || TM.phase === 'done' ? 1 : left / total;
  const word = prog() && prog()[0].sport === 'corrida' ? 'Bloco' : 'Round';
  const lab = { idle: 'Pronto', prep: 'Prepare-se', round: `${word} ${TM.round}/${N}`, rest: `Descanso · próximo ${TM.round + 1}/${N}`, done: 'Fim. Queimou tudo.' }[TM.phase];
  el.className = 'timer ph-' + TM.phase + (TM.phase === 'round' && left <= 10 ? ' last10' : '');
  el.querySelector('.t-arc').style.strokeDasharray = circ;
  el.querySelector('.t-arc').style.strokeDashoffset = circ * (1 - pct);
  el.querySelector('.t-time').textContent = `${mm}:${ss}`;
  el.querySelector('.t-lab').textContent = TM.paused ? 'Pausado' : lab;
  const info = $('#tInfo');
  if (info) { const showR = TM.phase === 'rest' ? cfgRound(TM.round + 1) : c; info.innerHTML = prog() && TM.phase !== 'done' ? `<b>${esc(showR.t)}</b><span>${esc(showR.f || '')}</span>` : ''; }
  const cb = $('#tCombo'); if (cb) cb.textContent = TM.phase === 'round' ? TM.combo : '';
  const st = $('#tStart'); if (st) st.textContent = TM.phase === 'idle' || TM.phase === 'done' ? 'Iniciar' : TM.paused ? 'Continuar' : 'Pausar';
}
function timerToggle() {
  audio();
  if (S.timer.voice && 'speechSynthesis' in window) { try { speechSynthesis.getVoices(); if (TM.phase === 'idle') say('Prepare-se'); } catch (e) { } }
  if (TM.phase === 'idle' || TM.phase === 'done') {
    TM.round = 0; TM.paused = false; startPhase('prep', 10);
    clearInterval(TM.iv); TM.iv = setInterval(tick, 200); lockScreen(true);
  } else if (TM.paused) { TM.paused = false; TM.end = Date.now() + TM.left * 1000; TM.nextCall = Date.now() + 2000; lockScreen(true); }
  else { TM.paused = true; try { speechSynthesis.cancel(); } catch (e) { } }
  paintTimer();
}
function timerReset() { clearInterval(TM.iv); Object.assign(TM, { phase: 'idle', round: 0, paused: false, combo: '' }); lockScreen(false); try { speechSynthesis.cancel(); } catch (e) { } paintTimer(); }

// ---------------- Esporte ----------------
let genSession = null, genFor = null;
views.esporte = () => {
  const ms = mySports();
  if (!ms.length) return `<section class="head"><h1>Esporte</h1></section><div class="card"><p>Você ainda não marcou nenhum esporte.</p><a class="btn primary" href="#perfil">Escolher esportes</a></div>`;
  const id = curSport(), SP = SPORTS[id], c = S.timer, r = 120, circ = 2 * Math.PI * r;
  const week = S.logs.sessions.filter(b => b.sport === id && (Date.now() - new Date(b.date + 'T12:00').getTime()) < 7 * 864e5);
  const g = S.boxGen, P = c.program;
  if (genFor !== id) genSession = null;
  const techs = TECHNIQUES.filter(t => t.sport.includes(id));
  const eqp = equipment(S.profile);
  return `<section class="head"><h1>${esc(SP.n)}</h1><div class="chip">${week.length} sessões / 7 dias</div></section>
  ${ms.length > 1 ? `<div class="chips tabs">${ms.map(s => `<button class="chipbtn ${s === id ? 'on' : ''}" data-act="sport" data-id="${s}"><b class="mk">${SPORTS[s].mark}</b> ${esc(SPORTS[s].n)}</button>`).join('')}</div>` : ''}
  <div class="card panel center" id="timerCard">
    <div id="timer" class="timer"><svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="${r}" class="t-bg"/><circle cx="130" cy="130" r="${r}" class="t-arc" style="stroke-dasharray:${circ}"/></svg>
      <div class="t-center"><div class="t-time mono">0:00</div><div class="t-lab">Pronto</div></div></div>
    <div id="tCombo" class="combo" aria-live="polite"></div>
    <div id="tInfo" class="tinfo"></div>
    ${P ? `<p class="small"><b>Treino carregado (${esc(SPORTS[P[0].sport]?.n || '')}):</b> ${P.length} ${P[0].sport === 'corrida' ? 'blocos' : 'rounds'} · ~${Math.round(P.reduce((a, x) => a + x.work + x.rest, 0) / 60)} min <button class="linkbtn" data-act="unloadProg">trocar pra modo livre</button></p>` : `
    <div class="chips">${SP.presets.map(p => `<button class="chipbtn ${c.preset === p.id ? 'on' : ''}" data-act="preset" data-id="${p.id}">${esc(p.n)}</button>`).join('')}</div>
    <div class="grid3 small">
      <label>Rounds<input data-tm="rounds" inputmode="numeric" value="${esc(c.rounds)}"></label>
      <label>Round (s)<input data-tm="work" inputmode="numeric" value="${esc(c.work)}"></label>
      <label>Descanso (s)<input data-tm="rest" inputmode="numeric" value="${esc(c.rest)}"></label>
    </div>
    ${SP.combos ? `<label class="switch"><input type="checkbox" data-act="callsToggle" ${c.calls ? 'checked' : ''}> Chamar combinações no modo livre</label>` : ''}`}
    <label class="switch"><input type="checkbox" data-act="voiceToggle" ${c.voice ? 'checked' : ''}> Voz (fala ${SP.combos ? 'as combinações e ' : ''}os rounds em português)</label>
    <div class="row gap mt"><button id="tStart" class="btn primary grow" data-act="tToggle">Iniciar</button><button class="btn ghost" data-act="tReset">Zerar</button></div>
  </div>

  <div class="card">
    <small class="cat">Gerador</small><h3>Treino de ${esc(SP.n.toLowerCase())} de hoje</h3>
    <form id="genForm" class="form">
      <div class="grid2">
        <label>Duração${sel('minutes', { 20: '20 min', 30: '30 min', 45: '45 min', 60: '60 min' }, g.minutes)}</label>
        ${id === 'corrida' ? `<label>Tipo${sel('kind', { leve: 'Rodagem leve', intervalado: 'Intervalado', tiros: 'Tiros curtos', longo: 'Longão' }, g.kind)}</label>`
      : id === 'jiu' ? `<label>Parceiro${sel('partner', { '': 'Sozinho (drills)', 1: 'Com parceiro' }, g.partner ? 1 : '')}</label>`
        : `<label>Saco de pancada${sel('saco', { 1: 'Tenho', '': 'Só sombra' }, (g.saco ?? eqp.has('saco')) ? 1 : '')}</label>`}
      </div>
      <button class="btn" type="submit">Gerar treino</button>
    </form>
    ${genSession ? `<ol class="rounds">${genSession.map((x, i) => `<li><span class="mono">${id === 'corrida' ? 'B' : 'R'}${i + 1}</span><div><b>${esc(x.t)}</b><small>${esc(x.f)}</small></div><span class="mono small">${x.work / 60 | 0}:${String(x.work % 60).padStart(2, '0')}${x.calls ? ' 🗣' : ''}</span></li>`).join('')}</ol>
      <button class="btn primary block" data-act="loadProg">Carregar no timer ↑</button>` : `<p class="small muted">${SP.combos ? 'Monta os rounds com tema, foco e combinações faladas, usando seus pontos fracos marcados abaixo.' : id === 'corrida' ? 'Monta aquecimento, blocos e volta à calma com o timer marcando cada parte.' : 'Monta os rounds com drills, posições e o foco nos seus pontos fracos.'}</p>`}
  </div>

  ${techs.length ? `<a class="card link panel" href="#tecnicas"><small class="cat">Biblioteca</small><h3>${techs.length} técnicas de ${esc(SP.n.toLowerCase())}</h3>
    <div class="techgrid mini">${techs.slice(0, 3).map(t => `<span class="tech"><span class="tech-thumb">${thumbSVG(t)}</span><b>${esc(t.n)}</b></span>`).join('')}</div>
    <p class="small muted">${[...new Set(techs.map(t => t.cat))].join(' · ')}</p><span class="go">Abrir →</span></a>` : ''}
  ${SP.combat ? `<details class="card tired"><summary><h3>${esc(TIRED.title)}</h3></summary><p class="small muted">${esc(TIRED.sub)}</p>
    <ol class="furos">${TIRED.items.map(([a, b, e]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span>${e ? `<small class="muted">Base: ${esc(ev(e)?.title)}</small>` : ''}</li>`).join('')}</ol></details>` : ''}
  ${SP.legend ? numTable(id) : ''}

  <div class="card"><h3>Onde você quer evoluir?</h3><p class="small muted">Marque seus pontos fracos: o gerador e o coach usam isso.</p>
    <div class="chips">${SP.weak.map(w => `<button class="chipbtn ${S.weak.includes(w.id) ? 'on' : ''}" data-act="weak" data-id="${w.id}">${esc(w.n)}</button>`).join('')}</div>
    ${SP.weak.filter(w => S.weak.includes(w.id)).map(w => `<div class="focus"><h4>${esc(w.n)}</h4><ul>${w.fix.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <p class="small muted">Base: ${w.ev.map(e => esc(ev(e)?.title)).join(' · ')}</p></div>`).join('')}
  </div>

  <form id="sessForm" class="card form"><h3>Registrar sessão manual</h3>
    <div class="grid2"><label>Tipo${sel('type', Object.fromEntries(Object.entries(SP.types).map(([k, v]) => [k, v.n])), sportsOf(S.profile)[id]?.type || SP.defaultType)}</label>
    <label>Minutos<input name="min" inputmode="numeric" value="${sportsOf(S.profile)[id]?.min || 60}"></label></div>
    <button class="btn small" type="submit">Salvar sessão</button></form>

  <div class="card"><h3>Semana modelo</h3>
    <table class="tbl small">${SP.week.map(([d, x]) => `<tr><td>${d}</td><td>${esc(x)}</td></tr>`).join('')}</table>
    <p class="small muted">Treino técnico e intenso nos dias mais descansados; força depois do esporte ou em outro horário (≥ 6 h).</p></div>
  <small class="cat pad">Base científica</small>
  ${SP.ev.map(e => evCard(ev(e))).join('')}`;
};

let anim = null, techCat = '';
const techList = () => TECHNIQUES.filter(t => t.sport.includes(curSport()));
// Tabela de numeração dos socos (o número fica só aqui; as animações usam só o nome)
const KICK_NAMES = { muaythai: ['teep', 'chute', 'chutebaixo', 'chuteesq', 'joelhada', 'cotovelada'], mma: ['chute', 'chutebaixo', 'double', 'sprawl'] };
function numTable(sid) {
  const has = id => TECHNIQUES.some(t => t.id === id);
  const kicks = (KICK_NAMES[sid] || []).map(k => TECHNIQUES.find(t => t.id === k)).filter(Boolean);
  return `<div class="card numcard"><h3>Numeração dos golpes</h3>
    <p class="small muted">É assim que o treinador chama as combinações: "1-2-3" = jab, direto, cruzado. Ímpar = mão da frente, par = mão de trás.</p>
    <table class="tbl numtbl">${PUNCHES.map(p => `<tr><td class="num">${p.n}</td><td><b>${esc(p.name)}</b> <span class="hand ${p.hand === 'trás' ? 'r' : ''}">mão ${p.hand === 'trás' ? 'de trás' : 'da frente'}</span><small>${esc(p.d)}</small></td>
      <td>${p.tech && has(p.tech) ? `<a class="seeanim" href="#tecnica-${p.tech}" aria-label="Ver animação">▶</a>` : p.mirror ? `<a class="seeanim ghost" href="#tecnica-${PUNCHES.find(x => x.n === p.mirror).tech}" aria-label="Ver o ${p.mirror}, espelhado">⇄</a>` : ''}</td></tr>`).join('')}</table>
    ${kicks.length ? `<p class="small"><b>${sid === 'mma' ? 'Chutes e quedas' : 'Chutes, joelhadas e cotoveladas'} não têm número:</b> são chamados pelo nome (${kicks.map(t => `<a href="#tecnica-${t.id}">${esc(t.n.replace(/ \(.*\)/, '').toLowerCase())}</a>`).join(', ')}). Ex.: "1-2, chute de direita".</p>` : ''}
    <p class="small muted">Guarda ortodoxa. Canhoto: tudo espelhado (o 1 sai com a direita). ⇄ = mesmo movimento, com a outra mão.</p>
  </div>`;
}
views.tecnicas = () => {
  const id = curSport(), list = techList(), cats = CATS.filter(c => list.some(t => t.cat === c));
  if (!cats.includes(techCat)) techCat = '';
  const shown = list.filter(t => !techCat || t.cat === techCat);
  return `<section class="head"><a href="#esporte" class="back">←</a><h1>Técnicas</h1><div class="chip">${esc(SPORTS[id].n)}</div></section>
  ${mySports().filter(s => TECHNIQUES.some(t => t.sport.includes(s))).length > 1 ? `<div class="chips tabs">${mySports().filter(s => TECHNIQUES.some(t => t.sport.includes(s))).map(s => `<button class="chipbtn ${s === id ? 'on' : ''}" data-act="sport" data-id="${s}"><b class="mk">${SPORTS[s].mark}</b> ${esc(SPORTS[s].n)}</button>`).join('')}</div>` : ''}
  <div class="segs">${['', ...cats].map(c => `<button class="${c === techCat ? 'on' : ''}" data-act="techCat" data-c="${esc(c)}">${c ? esc(c) : 'Todas'} <small>${c ? list.filter(t => t.cat === c).length : list.length}</small></button>`).join('')}</div>
  ${(techCat ? [techCat] : cats).map(c => `<small class="cat pad">${esc(c)}</small>
    <div class="techgrid">${shown.filter(t => t.cat === c).map(t => `<a class="tech" href="#tecnica-${t.id}"><span class="tech-thumb">${thumbSVG(t)}</span><b>${esc(t.n)}</b></a>`).join('')}</div>`).join('')}
  ${!list.length ? '<div class="card"><p class="small muted">Ainda não temos técnicas animadas pra esse esporte.</p></div>' : ''}
  ${SPORTS[id].legend ? numTable(id) : ''}`;
};
views.tecnica = (tid) => {
  const t = TECHNIQUES.find(x => x.id === tid);
  if (!t) { location.hash = '#tecnicas'; return ''; }
  const list = techList().length && techList().includes(t) ? techList() : TECHNIQUES.filter(x => x.sport.includes(t.sport[0]));
  const i = list.indexOf(t), prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  return `<section class="head"><a href="#tecnicas" class="back">←</a><div><small class="cat">${esc(t.cat)}</small><br><h1>${esc(t.n)}</h1></div></section>
  <div class="card panel techcard">
    <div id="techFig" class="techfig"></div>
    <div class="segs speed"><button data-act="techPause">❚❚ Pausar</button><button class="on" data-act="techSpeed" data-s="1">Normal</button><button data-act="techSpeed" data-s="3">Lento</button><button data-act="techSpeed" data-s="6">Bem lento</button></div>
    <p class="small muted">${esc(t.sub)} <span class="hi-dot"></span> = onde nasce a força.</p>
  </div>
  <div class="card"><h3>Passo a passo</h3><ol class="steps" id="techSteps">${t.steps.map((s, i) => `<li data-i="${i}">${esc(s)}</li>`).join('')}</ol></div>
  <div class="card"><h3>Furos comuns</h3><ul class="furos-x">${t.furos.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>
  <div class="row gap technav"><a class="btn small ghost grow" href="#tecnica-${prev.id}">‹ ${esc(prev.n)}</a><a class="btn small ghost grow" href="#tecnica-${next.id}">${esc(next.n)} ›</a></div>`;
};

// ---------------- Ciência ----------------
views.ciencia = () => {
  const cats = [...new Set(EVIDENCE.map(e => e.cat))];
  return `<section class="head"><h1>Ciência</h1><div class="chip">${EVIDENCE.length} cartas</div></section>
  <p class="small muted pad">Cada recomendação do app vem daqui. Nível <b>A</b>: meta-análises / position stands. <b>B</b>: revisões e ensaios com limitações. <b>C</b>: dados observacionais ou de outra população.</p>
  <input id="evSearch" placeholder="Buscar (proteína, sono, chute, corrida…)" autocomplete="off">
  <div id="evList">${cats.map(c => `<small class="cat pad">${esc(c)}</small>${EVIDENCE.filter(e => e.cat === c).map(e => evCard(e)).join('')}`).join('')}</div>`;
};

// ---------------- Coach ----------------
function coachContext() {
  const p = S.profile, t = T(), plan = buildPlan(p), sp = sportsOf(p);
  const weakAll = allWeak();
  return `Você é o RONIN, um coach de esportes de combate, corrida, força e nutrição esportiva que fala português do Brasil, de forma direta, informal e inteligente.
REGRAS: Baseie-se em evidência científica. Use as cartas de evidência abaixo como base principal e cite-as pelo título e autor/ano. Se algo não estiver bem estabelecido na literatura, diga que a evidência é limitada. Nunca invente estudos. Não faça diagnósticos médicos; para dor persistente, sintomas após pancada na cabeça, condições de saúde ou cortes de peso agressivos, recomende um profissional. Respostas curtas e práticas (leitura no celular).
PERFIL: ${p.sex === 'f' ? 'mulher' : 'homem'}, ${p.age} anos, ${p.height} cm, ${latestWeight()} kg${p.bf ? `, ${p.bf}% gordura` : ''}. Objetivo: ${GOALS[p.goal]}. Experiência: ${p.experience}.${activeRestr().length ? ` RESTRIÇÕES (não sugerir nada com isso): ${(() => { const r = restrOfProfile(); return [r.perm.length ? 'para sempre: ' + r.perm.map(k => RESTR[k].n).join(', ') : '', tempOn(r) ? 'temporárias' + (r.until ? ` até ${r.until}` : '') + ': ' + r.temp.map(k => RESTR[k].n).join(', ') : ''].filter(Boolean).join('; '); })()}.` : ''}
ESPORTES: ${Object.entries(sp).map(([id, s]) => `${SPORTS[id]?.n} ${s.days}x/semana, ${s.min} min, ${SPORTS[id]?.types[s.type]?.n || ''}, ${s.where}`).join('; ') || 'nenhum'}.
FORÇA: ${p.liftDays}x/semana (${p.env === 'casa' ? 'em casa; equipamento: ' + ((p.equip || []).map(k => EQUIP[k]).join(', ') || 'só peso corporal/calistenia') : 'academia'}).
METAS: ${t.kcal} kcal, P ${t.protein} g, C ${t.carbs} g, G ${t.fat} g, água ${t.water} ml. Gasto estimado ${Math.round(t.tdee)} kcal (${t.source}).
HOJE: consumido ${Math.round(dayFood().k)} kcal, P ${Math.round(dayFood().p)} g.
PLANO DE FORÇA: ${plan.split}: ${plan.days.map(d => d.name + ' [' + d.items.map(i => i.name + ' ' + i.sets + 'x' + i.lo + '-' + i.hi).join(', ') + ']').join(' | ')}.
PONTOS FRACOS: ${S.weak.map(id => { const w = weakAll.find(x => x.id === id); return w ? `${SPORTS[w.sport].n}: ${w.n}` : ''; }).filter(Boolean).join(', ') || 'não informados'}.
CARTAS DE EVIDÊNCIA:
${EVIDENCE.map(e => `- [${e.level}] ${e.title}: ${e.do} (${e.refs.join('; ')})`).join('\n')}`;
}
const STOP = new Set(['como', 'que', 'uma', 'para', 'pra', 'com', 'sem', 'mais', 'tem', 'dos', 'das', 'nos', 'nas', 'por', 'qual', 'quanto', 'aumentar', 'posso', 'devo', 'melhor']);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function offlineAnswer(q) {
  const words = norm(q).split(/\W+/).filter(w => w.length > 2 && !STOP.has(w));
  const scored = EVIDENCE.map(e => { const hay = norm(e.tags.join(' ') + ' ' + e.title + ' ' + e.do); return [e, words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0)]; })
    .filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 2);
  if (!scored.length) return { text: 'Sem a IA ligada eu respondo só com as cartas de evidência e não achei nenhuma sobre isso. Tente palavras como proteína, sono, soco, chute, corrida ou creatina, ou ative a IA em Perfil.' };
  return { text: 'Modo offline: o que a base científica diz.', cards: scored.map(([e]) => e.id) };
}
views.coach = () => {
  const hasKey = !!getKey();
  const sugg = { boxe: 'Cansei no 3º round', muaythai: 'Como chutar mais forte?', jiu: 'Minha pegada acaba rápido', mma: 'Como defender queda?', corrida: 'Como melhorar meu ritmo?' };
  return `<section class="head"><h1>Coach</h1><div class="chip ${hasKey ? 'on' : ''}">${hasKey ? 'IA ativa' : 'Offline'}</div></section>
  ${hasKey ? '' : `<p class="note small">Sem chave de API, o coach responde com as cartas de evidência. Pra conversar de verdade, adicione sua chave da API Anthropic em <a href="#perfil">Perfil</a>.</p>`}
  <div id="chat" class="chat">${S.chat.length ? S.chat.map(m => msgHTML(m)).join('') : `<div class="muted small center pad">Pergunte qualquer coisa sobre seu treino, sua luta ou sua alimentação.</div>`}</div>
  <div class="chips">${[...mySports().map(id => sugg[id]), 'O que comer antes do treino?', 'Tô estagnado na força'].slice(0, 4).map(s => `<button class="chipbtn" data-act="ask" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <form id="chatForm" class="chatbar"><textarea name="q" rows="1" placeholder="Fale com seu coach…"></textarea><button class="btn primary" type="submit" aria-label="Enviar">➤</button></form>
  ${S.chat.length ? '<button class="btn ghost small" data-act="clearChat">Limpar conversa</button>' : ''}`;
};
function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^#{1,3} (.+)$/gm, '<b>$1</b>').replace(/^[-•] (.+)$/gm, '• $1').replace(/\n/g, '<br>'); }
function msgHTML(m) {
  const cards = (m.cards || []).map(ev).filter(Boolean).map(e => evCard(e, true)).join('');
  return `<div class="msg ${m.role}"><div class="bubble">${m.pending ? '<span class="dots"><i></i><i></i><i></i></span>' : md(m.text)}</div>${cards}</div>`;
}
async function askCoach(q) {
  q = q.trim(); if (!q) return;
  S.chat.push({ role: 'user', text: q });
  const key = getKey();
  if (!key) { S.chat.push({ role: 'bot', ...offlineAnswer(q) }); save(); render(); scrollChat(); return; }
  const pending = { role: 'bot', text: '', pending: true }; S.chat.push(pending); render(); scrollChat();
  try {
    const history = S.chat.filter(m => !m.pending && m.text).slice(-12).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: S.settings.model || 'claude-sonnet-5-5', max_tokens: 900, system: coachContext(), messages: history })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || ('HTTP ' + res.status));
    pending.text = data.content.map(c => c.text || '').join('').trim();
  } catch (e) {
    pending.text = 'Não consegui falar com a IA: ' + e.message + '. Confira a chave e o modelo em Perfil. Enquanto isso, a base offline:';
    Object.assign(pending, { cards: offlineAnswer(q).cards });
  }
  pending.pending = false; save(); render(); scrollChat();
}
function scrollChat() { requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight)); }

// ---------------- Conta ----------------
// Apaga tudo deste aparelho (ao sair da conta ou ao entrar com outra conta)
function wipeLocal() {
  S = blank();
  try { for (const k of [KEY, OLD_KEY, KEY_API, OLD_API, 'ronin-sync-last']) localStorage.removeItem(k); } catch (e) { }
  draft = null; viewDay = null; genSession = null; techCat = '';
  try { timerReset(); } catch (e) { }
}
const GATE = { tab: 'in', email: '', msg: null, confirm: false, recovery: false, busy: false };
// "Continuar sem conta" vale só até fechar o app: ao abrir de novo, a tela de login aparece outra vez
const skipLogin = { get() { try { return sessionStorage.getItem('ronin-skip-login') === '1'; } catch (e) { return false; } }, set(v) { try { localStorage.removeItem('ronin-skip-login'); v ? sessionStorage.setItem('ronin-skip-login', '1') : sessionStorage.removeItem('ronin-skip-login'); } catch (e) { } } };
const GOOGLE_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>';
const pwField = (name, ph, ac) => `<div class="pw"><input name="${name}" type="password" autocomplete="${ac}" placeholder="${ph}" minlength="8"><button type="button" class="btn small ghost" data-act="showPass" aria-label="Mostrar senha">👁</button></div>`;
const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
function authBlock() {
  const t = GATE.tab;
  return `<div class="card authcard" id="conta">
    ${t === 'rec' ? `<h2>Recuperar senha</h2><p class="small muted">Digite seu e-mail. Chega um link pra criar uma senha nova.</p>`
      : `<div class="segs big"><button class="${t !== 'up' ? 'on' : ''}" data-act="gateTab" data-t="in">ENTRAR</button><button class="${t === 'up' ? 'on' : ''}" data-act="gateTab" data-t="up">CRIAR CONTA</button></div>
    <button class="btn block google" data-act="google" ${GATE.busy ? 'disabled' : ''}>${GOOGLE_SVG}<span>Continuar com Google</span></button>
    <div class="or-sep"><span>OU</span></div>`}
    <form id="authForm" class="form">
      <input name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="E-mail" aria-label="E-mail" value="${esc(GATE.email)}" required>
      ${t === 'rec' ? '' : `<div class="pwin"><input name="pass" type="password" autocomplete="${t === 'up' ? 'new-password' : 'current-password'}" placeholder="${t === 'up' ? 'Senha (mínimo 8)' : 'Senha'}" aria-label="Senha" minlength="8"><button type="button" data-act="showPass" aria-label="Mostrar senha">${EYE}</button></div>`}
      ${GATE.msg ? `<p class="fb ${GATE.msg.ok ? 'ok' : 'bad'}">${GATE.msg.html}</p>` : ''}
      <button class="btn primary block big" type="submit" ${GATE.busy ? 'disabled' : ''}>${GATE.busy ? 'AGUARDE…' : t === 'up' ? 'CRIAR CONTA' : t === 'rec' ? 'ENVIAR LINK' : 'ENTRAR'}</button>
      ${t === 'rec' ? '<button type="button" class="linkbtn center-link" data-act="gateTab" data-t="in">← Voltar</button>' : '<button type="button" class="linkbtn center-link" data-act="gateTab" data-t="rec">Esqueci minha senha</button>'}
      ${GATE.confirm ? '<button type="button" class="linkbtn center-link" data-act="resend">Reenviar e-mail de confirmação</button>' : ''}
    </form>
  </div>`;
}
function accountCard() {
  if (!cloud.available()) return `<div class="card"><h3>Conta</h3><p class="small muted">Nesta prévia a conta não funciona. Use o app instalado (rickdevdadz7.github.io/corner).</p></div>`;
  const u = cloud.user();
  if (u && GATE.recovery) return `<div class="card" id="conta"><small class="cat">Nova senha</small><h2>Crie uma nova senha</h2><p class="small">Conta: <b>${esc(u.email || '')}</b></p>
    <form id="passForm" class="form">${pwField('pass', 'nova senha (mínimo 8)', 'new-password')}<button class="btn primary block" type="submit">Salvar nova senha</button></form></div>`;
  if (u) return `<div class="card" id="conta"><small class="cat">Conta</small><h3>${esc(u.email || 'Conectado')}</h3>
    <p class="small muted" id="syncInfo">${syncLine()}</p>
    <div class="row gap wrap"><button class="btn small primary" data-act="syncNow">Sincronizar agora</button><button class="btn small danger" data-act="signOut">Sair da conta</button></div>
    <details><summary class="small">Definir / trocar senha</summary><p class="tiny muted">Útil se você entrou com o Google e quer entrar também com e-mail e senha.</p><form id="passForm" class="form">${pwField('pass', 'nova senha (mínimo 8)', 'new-password')}<button class="btn small" type="submit">Salvar senha</button></form></details></div>`;
  return `<div class="card" id="conta"><small class="cat">Conta</small><h3>Usando sem conta</h3>
    <p class="small muted">Seus dados estão só neste aparelho. Com uma conta eles ficam salvos na nuvem e aparecem em qualquer aparelho.</p>
    <button class="btn small primary" data-act="toLogin">Entrar ou criar conta</button></div>`;
}
// Primeira tela: login (como no Stempel)
views.login = () => `<div class="gate">
  <div class="gate-logo"><span class="gbadge">浪</span><span class="gname">RONIN</span></div>
  <p class="gate-tag">Sem mestre. Só disciplina.</p>
  ${GATE.recovery && cloud.user() ? accountCard() : authBlock()}
  <button class="linkbtn gate-skip" data-act="skipLogin">Continuar sem conta</button>
  <p class="gate-ver">v3.8</p></div>`;
async function afterLogin() {
  const u = cloud.user();
  // outra conta? os dados deste aparelho são da conta anterior: descarta antes de juntar
  if (u && S.meta.owner && S.meta.owner !== u.id) { wipeLocal(); toast('Dados da conta anterior removidos deste aparelho.'); }
  if (u) { S.meta.owner = u.id; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  GATE.msg = null; GATE.confirm = false; GATE.busy = true; render();
  await doSync(true);
  GATE.busy = false;

  try { history.replaceState(null, '', location.pathname + (S.profile ? '#hoje' : '#perfil')); } catch (e) { }
  rendered = ''; go(); window.scrollTo(0, 0);
}

views.perfil = () => `<section class="head"><h1>Perfil e ajustes</h1></section>
  ${accountCard()}
  ${views.onboarding().replace('<section class="head"><h1>Perfil</h1></section>', '')}
  <div class="card form"><h3>Coach com IA</h3>
    <p class="small muted">Chave da API Anthropic (console.anthropic.com). Cobrança por uso, separada da assinatura do Claude. Fica só neste aparelho e fora dos backups e da sincronização.</p>
    <input id="apiKey" type="password" placeholder="sk-ant-…" value="${getKey() ? '••••••••' : ''}" autocomplete="off">
    <label>Modelo<input id="apiModel" value="${esc(S.settings.model)}"></label>
    <div class="row gap"><button class="btn small" data-act="saveKey">Salvar chave</button>${getKey() ? '<button class="btn small ghost" data-act="delKey">Remover</button>' : ''}</div>
  </div>
  <div class="card"><h3>Seus dados</h3>
    <div class="row gap wrap"><button class="btn small" data-act="export">Exportar backup</button><label class="btn small ghost">Restaurar<input type="file" accept="application/json" id="importFile" hidden></label><button class="btn small danger" data-act="reset">Apagar tudo</button></div>
  </div>
  <p class="small muted center pad">RONIN v3.8 · não substitui acompanhamento profissional.</p>`;

// ---------------- Roteador ----------------
const ICONS = { hoje: 'M3 12l9-8 9 8M5 10v10h14V10', nutri: 'M12 3c4 3 6 6 6 10a6 6 0 0 1-12 0c0-4 2-7 6-10z', treino: 'M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12', esporte: 'M7 4h7a4 4 0 0 1 4 4v4a6 6 0 0 1-6 6H9a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2zM9 18v3h6v-3', coach: 'M4 5h16v11H8l-4 4z' };
const ALIAS = { boxe: 'esporte' };
function render() {
  const keepY = window.scrollY;
  if (anim) { anim.stop(); anim = null; }
  let [route, arg] = (location.hash.replace(/^#\/?/, '') || 'hoje').split(/[\/-]/);
  route = ALIAS[route] || route;
  const app = $('#app');
  // Tela inicial: sem conta conectada, o app sempre abre no login (a menos que a pessoa escolha usar sem conta)
  const needLogin = cloud.available() && ((!cloud.user() && (!skipLogin.get() || route === 'login')) || (GATE.recovery && cloud.user()));
  if (needLogin) { $('#nav').hidden = true; $('#topbar').hidden = true; app.innerHTML = views.login(); bindAfter('login'); return; }
  if (route === 'login') { try { history.replaceState(null, '', location.pathname + '#hoje'); } catch (e) { } route = 'hoje'; }
  if (!S.profile) { $('#nav').hidden = true; $('#topbar').hidden = true; app.innerHTML = views.onboarding(); bindAfter('onboarding'); return; }
  $('#nav').hidden = false; $('#topbar').hidden = false;
  const v = views[route] ? route : 'hoje';
  app.innerHTML = views[v](arg);
  const ms = mySports();
  const spLabel = ms.length === 1 ? SPORTS[ms[0]].n : 'Esporte';
  const tabs = [['hoje', 'Hoje'], ['nutri', 'Nutrição'], ['treino', 'Força'], ['esporte', spLabel], ['coach', 'Coach']];
  $('#nav').innerHTML = tabs.map(([id, label]) => `<a href="#${id}" class="${(v === id || (v === 'sessao' && id === 'treino') || (v === 'cardapio' && id === 'nutri') || ((v === 'tecnica' || v === 'tecnicas') && id === 'esporte')) ? 'on' : ''}"><svg viewBox="0 0 24 24"><path d="${ICONS[id]}"/></svg><span>${esc(label)}</span></a>`).join('');
  bindAfter(v, arg);
  if (window.scrollY !== keepY) window.scrollTo(0, keepY);
  if (v === 'esporte') paintTimer();
  if (v === 'perfil' && arg === 'conta') requestAnimationFrame(() => $('#conta')?.scrollIntoView({ behavior: 'smooth' }));
}
let rendered = '';
// só volta pro topo quando muda de tela; tocar em algo da mesma tela mantém a rolagem
let lastHash = null;
function go(force) {
  const h = location.hash;
  if (!force && rendered === h) return;
  const changed = h !== lastHash; rendered = lastHash = h;
  const y = window.scrollY; render();
  if (changed && !/conta/.test(h)) window.scrollTo(0, 0); else window.scrollTo(0, y);
}
window.addEventListener('hashchange', go);
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault();
  const h = a.getAttribute('href');
  if (location.hash !== h) { try { history.pushState(null, '', h); } catch (err) { location.hash = h; } }
  go(true);
});
window.addEventListener('popstate', () => go(true));

function bindAfter(v, arg) {
  const pf = $('#profileForm');
  if (pf) {
    const cutVis = () => pf.querySelector('.cut-only').style.display = pf.goal.value === 'cut' ? '' : 'none';
    pf.goal.addEventListener('change', cutVis); cutVis();
    const eqVis = () => pf.querySelector('.equip').style.display = pf.env.value === 'casa' ? '' : 'none';
    pf.env.addEventListener('change', eqVis); eqVis();
    pf.querySelectorAll('.sport input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => cb.closest('.sport').classList.toggle('on', cb.checked)));
    bindRestrBox(pf);
    pf.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(pf), g = k => fd.get(k);
      const sports = {};
      for (const id of SPORT_IDS) if (g('sp_' + id)) sports[id] = { days: num(g('sd_' + id)) || 1, min: num(g('sm_' + id)) || 60, type: g('st_' + id), where: g('sw_' + id) };
      const p = {
        sex: g('sex'), age: num(g('age')), height: num(g('height')), weight: num(g('weight')), bf: num(g('bf')), neat: num(g('neat')), goal: g('goal'), rate: num(g('rate')),
        experience: g('experience'), liftDays: num(g('liftDays')) ?? 0, liftMin: num(g('liftMin')) || 40, env: g('env'), equip: fd.getAll('equip'), sports
      };
      let rd = { perm: [], temp: [] }; try { rd = JSON.parse(g('restrData') || '{}'); } catch (e) { }
      const perm = [...new Set((rd.perm || []).filter(k => RESTR[k]))], temp = [...new Set((rd.temp || []).filter(k => RESTR[k] && !perm.includes(k)))];
      const until = temp.length && /^\d{4}-\d{2}-\d{2}$/.test(g('restrUntil') || '') ? g('restrUntil') : '';
      const oldR = restrOfProfile();
      p.restr = perm.length || temp.length ? { perm, temp, until, since: oldR.perm.length || oldR.temp.length ? (oldR.since || today()) : today() } : null;
      if (!p.age || !p.height || !p.weight || p.age < 14 || p.age > 90 || p.height < 120 || p.height > 230 || p.weight < 35 || p.weight > 250) { toast('Confira idade, altura e peso.'); return; }
      if (!Object.keys(sports).length && !p.liftDays) { toast('Marque pelo menos um esporte ou dias de força.'); return; }
      const first = !S.profile;
      S.profile = p;
      if (!S.logs.weights[today()]) { S.logs.weights[today()] = p.weight; S.meta.wt[today()] = Date.now(); }
      save(true); toast(first ? 'Plano pronto. Bora.' : 'Perfil atualizado'); location.hash = '#hoje'; rendered = ''; go();
    });
  }
  if (v === 'hoje') {
    $('#weighForm').addEventListener('submit', e => {
      e.preventDefault(); const kg = num(e.target.kg.value);
      if (!kg || kg < 30 || kg > 300) { toast('Peso inválido'); return; }
      S.logs.weights[curDay()] = kg; S.meta.wt[curDay()] = Date.now(); save(); render(); toast('Peso registrado');
    });
    $('#waterForm').addEventListener('submit', e => { e.preventDefault(); const ml = Math.round(num(e.target.ml.value) || 0); if (!ml) return; addWater(ml); });
    $('.wlist')?.addEventListener('toggle', e => { wlOpen = e.target.open; });
    $('#h-sci')?.addEventListener('toggle', e => { if (e.target.open && S.ui.sci !== today()) { S.ui.sci = today(); save(true); const tl = document.querySelector('[data-to="h-sci"]'); if (tl) { tl.classList.add('ok'); tl.querySelector('small').textContent = '✓ Lida'; } } });
  }
  if (v === 'cardapio') {
    $('#c-desp')?.addEventListener('toggle', e => { pantryOpen = e.target.open; });
    $('#c-lista')?.addEventListener('toggle', e => { shopOpen = e.target.open; });
    $('#c-desp')?.addEventListener('click', e => {
      const c = e.target.closest('.pchip'); if (!c) return;
      const n = c.dataset.n; if (!foodByName(n)) return;
      S.ui.pantry ||= {}; const nx = P_NEXT[S.ui.pantry[n] || ''];
      if (nx) S.ui.pantry[n] = nx; else delete S.ui.pantry[n];
      c.className = `pchip ${nx}`; $('#pSum').textContent = pantrySummary(); save(true);
    });
    $('#pSearch')?.addEventListener('input', e => {
      const q = norm(e.target.value);
      document.querySelectorAll('#c-desp .pchip').forEach(c => { c.hidden = !!q && !norm(c.textContent).includes(q); });
      document.querySelectorAll('#c-desp .pgrp').forEach(g => { g.hidden = ![...g.querySelectorAll('.pchip')].some(c => !c.hidden); });
    });
    document.querySelectorAll('[data-shop]').forEach(i => i.addEventListener('change', () => {
      S.ui.shop.done ||= {}; if (i.checked) S.ui.shop.done[i.dataset.shop] = true; else delete S.ui.shop.done[i.dataset.shop];
      i.closest('li').classList.toggle('got', i.checked); save(true);
    }));
  }
  if (v === 'nutri') {
    $('#n-como')?.addEventListener('toggle', e => { comoOpen = e.target.open; });
    const inp = $('#foodSearch'), res = $('#foodResults');
    const show = () => {
      if (!res) return;
      const q = norm(inp.value);
      const list = FOODS.map((f, i) => [f, i]).filter(([f]) => (!foodCat || (f.cat || 'base') === foodCat) && (!q || norm(f.n).includes(q))).slice(0, q || foodCat ? 20 : 10);
      list.sort((a, b) => (hitsOf(a[0].n).length ? 1 : 0) - (hitsOf(b[0].n).length ? 1 : 0));
      res.innerHTML = list.map(([f, i]) => { const h = hitsOf(f.n).length; return `<button class="chipbtn ${h ? 'bad' : ''}" data-act="pickFood" data-i="${i}">${h ? '⚠ ' : ''}${esc(f.n)}</button>`; }).join('');
      const rc = $('#foodRecent'); if (rc) { const r = q || foodCat ? [] : recentFoods(); rc.innerHTML = r.length ? `<small class="muted">Recentes (toque pra repetir a mesma quantidade)</small><div class="chips">${r.map((x, j) => `<button class="chipbtn rec ${hitsOf(x.it).length ? 'bad' : ''}" data-act="reAdd" data-r="${j}">${hitsOf(x.it).length ? '⚠ ' : ''}${esc(x.it.n)} <i>${fmt(amtOf(x.it), 0)} ${esc(unitOf(x.it))}</i></button>`).join('')}</div><small class="muted">Sugestões</small>` : ''; }
    };
    if (inp) {
      inp.addEventListener('input', show); show();
      $('#manualFood').addEventListener('submit', e => {
        e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target));
        addFood({ n: fd.n, q: 1, u: 'porção', st: 1, k: num(fd.k) || 0, p: num(fd.p) || 0, c: num(fd.c) || 0, f: num(fd.f) || 0, fb: num(fd.fb) || 0 });
      });
    }
    document.querySelectorAll('[data-qty]').forEach(i => i.addEventListener('change', () => setAmount(i.dataset.qty, num(i.value))));
  }
  if (v === 'ciencia') {
    $('#evSearch').addEventListener('input', e => {
      const q = norm(e.target.value);
      $('#evList').innerHTML = EVIDENCE.filter(x => !q || norm(x.title + x.do + x.why + x.tags.join(' ') + x.refs.join(' ') + x.cat).includes(q)).map(x => evCard(x, !!q)).join('') || '<p class="muted small pad">Nada encontrado.</p>';
    });
  }
  if (v === 'esporte' && $('#genForm')) {
    const id = curSport();
    $('#genForm').addEventListener('submit', e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target));
      const eq = equipment(S.profile);
      S.boxGen = { ...S.boxGen, minutes: +fd.minutes, ...(fd.saco !== undefined ? { saco: !!fd.saco } : {}), ...(fd.partner !== undefined ? { partner: !!fd.partner } : {}), ...(fd.kind ? { kind: fd.kind } : {}) };
      save(true);
      genFor = id;
      genSession = id === 'corrida' ? runSession({ minutes: +fd.minutes, kind: fd.kind }).map(r => ({ ...r, sport: 'corrida' }))
        : combatSession(id, { minutes: +fd.minutes, saco: !!S.boxGen.saco, partner: !!S.boxGen.partner, corda: eq.has('corda'), barra: eq.has('barra'), weak: S.weak, level: level() });
      render();
    });
    $('#sessForm').addEventListener('submit', e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); const min = num(fd.min) || 0;
      S.logs.sessions.push({ id: newId(), sport: id, date: today(), type: fd.type, min, kcal: sessionKcal(SPORTS[id].types[fd.type].met, latestWeight(), min) });
      save(); toast('Sessão salva'); render();
    });
    document.querySelectorAll('[data-tm]').forEach(i => i.addEventListener('change', () => {
      const n = Math.max(1, Math.round(num(i.value) || 1)); S.timer[i.dataset.tm] = n; S.timer.preset = 'custom'; save(); if (TM.phase === 'idle') paintTimer();
    }));
  }
  if (v === 'tecnica') {
    const t = TECHNIQUES.find(x => x.id === arg);
    if (t) anim = animate($('#techFig'), t, i => document.querySelectorAll('#techSteps li').forEach(li => li.classList.toggle('on', +li.dataset.i === i)));
  }
  if (v === 'coach') {
    const f = $('#chatForm'), ta = f.q;
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; });
    f.addEventListener('submit', e => { e.preventDefault(); const q = ta.value; ta.value = ''; askCoach(q); });
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); f.requestSubmit(); } });
  }
  if (v === 'login') bindAuth();
  if (v === 'perfil') {
    $('#importFile')?.addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      try { const data = JSON.parse(await file.text()); if (!data.logs) throw 0; localStorage.setItem(KEY, JSON.stringify(data)); S = load(); save(true); toast('Backup restaurado'); render(); }
      catch (err) { toast('Arquivo inválido'); }
    });
    bindAuth();
  }
}

function bindAuth() {
  $('#passForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    try { await cloud.updatePassword(e.target.pass.value); toast('Senha salva.'); const wasRec = GATE.recovery; GATE.recovery = false; e.target.reset(); if (wasRec) afterLogin(); }
    catch (err) { toast(err.message); }
  });
  const af = $('#authForm'); if (!af) return;
  af.email.addEventListener('input', () => GATE.email = af.email.value);
  af.addEventListener('submit', async e => {
    e.preventDefault();
    const email = af.email.value, pass = af.pass ? af.pass.value : '', t = GATE.tab;
    GATE.email = email; GATE.busy = true; GATE.msg = null; render();
    try {
      if (t === 'rec') { await cloud.recover(email); GATE.msg = { ok: true, html: 'Se existir uma conta com esse e-mail, chegou um link pra criar uma senha nova. Abra o link <b>neste aparelho</b>.' }; return; }
      if (t === 'up') {
        const r = await cloud.signUp(email, pass);
        if (r.confirm) { GATE.tab = 'in'; GATE.confirm = true; GATE.msg = { ok: true, html: 'Conta criada! Enviamos uma confirmação pra <b>' + esc(email) + '</b>. Abra o link (veja o spam) e depois toque em <b>Entrar</b>.' }; return; }
      } else await cloud.signIn(email, pass);
      GATE.busy = false; return afterLogin();
    } catch (err) {
      if (err.code === 'email_not_confirmed') GATE.confirm = true;
      GATE.msg = { ok: false, html: esc(err.message) };
    } finally { if (GATE.busy) { GATE.busy = false; render(); } }
  });
}
function addWater(ml) {
  const tot = dayWater();
  if (ml < 0) ml = Math.max(ml, -tot);
  if (!ml) return;
  (S.logs.water[curDay()] ||= []).push({ id: newId(), ml, t: Date.now() }); save(); render();
}
function addFood(item) {
  (S.logs.food[curDay()] ||= []).push({ id: newId(), t: Date.now(), m: addMeal || defaultMeal(), ...item });
  save(); toast(`+${fmt(item.k, 0)} kcal em ${MEALS.find(x => x.id === (addMeal || defaultMeal())).n}`); render();
}
// muda a quantidade de um alimento já registrado (como na água): recalcula kcal e macros na proporção
function setAmount(id, amt) {
  const list = S.logs.food[curDay()] || [], it = list.find(x => x.id === id);
  if (!it || amt == null || amt <= 0) { render(); return; }
  const old = amtOf(it) || 1, r = amt / old;
  for (const k of ['k', 'p', 'c', 'f', 'fb']) it[k] = (it[k] || 0) * r;
  if (it.g != null) it.g = Math.round(amt * 10) / 10; else it.q = Math.round(amt * 10) / 10;
  it.t = Date.now(); save(); render();
}

// ---------------- Ações ----------------
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  if (a === 'water') addWater(+el.dataset.v);
  if (a === 'clearWater') {
    // dois toques: o primeiro arma, o segundo (em até 4 s) apaga
    if (Date.now() - clearArm > 4000) { clearArm = Date.now(); el.textContent = 'Toque de novo pra apagar tudo'; el.classList.add('armed'); setTimeout(() => { if (el.isConnected) { el.textContent = 'Apagar todo o histórico'; el.classList.remove('armed'); } }, 4000); return; }
    clearArm = 0; const list = S.logs.water[curDay()] || []; for (const x of list) S.del[x.id] = Date.now();
    S.logs.water[curDay()] = []; wlOpen = false; save(); render(); toast('Histórico de água apagado');
  }
  if (a === 'wRange') { S.ui.wRange = +el.dataset.r; save(true); render(); }
  if (a === 'jump') { const t = document.getElementById(el.dataset.to); if (t) { if (t.tagName === 'DETAILS') t.open = true; t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
  if (a === 'delWater') { const id = el.dataset.id; S.logs.water[curDay()] = (S.logs.water[curDay()] || []).filter(x => x.id !== id); S.del[id] = Date.now(); save(); render(); }
  if (a === 'day') { shiftDay(+el.dataset.d); render(); }
  if (a === 'dayToday') { viewDay = null; render(); }
  if (a === 'addMeal') { addMeal = el.dataset.m || null; if (addMeal) mealShut.delete(addMeal); foodCat = ''; render(); }
  if (a === 'mealToggle') { const m = el.dataset.m; if (mealShut.has(m)) mealShut.delete(m); else { mealShut.add(m); if (addMeal === m) addMeal = null; } render(); }
  if (a === 'syncWeight') { const lw = latestWeight(); if (lw && lw >= 35 && lw <= 250) { S.profile = { ...S.profile, weight: lw }; save(true); render(); toast(`Metas recalculadas com ${fmt(lw)} kg`); } }
  if (a === 'menuMake') { makeMenu(curDay()); save(true); render(); toast('Cardápio montado'); }
  if (a === 'menuTrain') { S.ui.mtrain ||= {}; S.ui.mtrain[curDay()] = el.dataset.v === '1'; save(true); render(); }
  if (a === 'menuSwap') {
    const plan = menuOf(); if (!plan) return;
    plan.sw = (plan.sw || 0) + 1;
    const n = swapPick(plan.meals, el.dataset.m, el.dataset.s, menuCtx(), plan.seed || 1, plan.sw);
    if (n) { plan.meals[el.dataset.m].pick[el.dataset.s] = n; save(true); render(); } else toast('Sem outra opção pra esse item com suas restrições');
  }
  if (a === 'menuEat') {
    const m = solvedMenu(), meal = el.dataset.m; if (!m || m.plan.meals[meal]?.done) return;
    const list = (S.logs.food[curDay()] ||= []);
    for (const i of m.sol.meals[meal].items) {
      const f = foodByName(i.n); if (!f) continue;
      list.push({ id: newId(), t: Date.now(), m: meal, n: f.n, g: i.g, u: /\(ml\)/.test(f.n) ? 'ml' : 'g', st: f.un ? f.un[0] : f.g <= 60 ? f.g : 10, k: i.k, p: i.p, c: i.c, f: i.f, fb: i.fb });
    }
    m.plan.meals[meal].done = true; save(); save(true); render(); toast(`${MEALS.find(z => z.id === meal).n} registrado`);
  }
  if (a === 'menuWeek') {
    const start = curDay(); let prev = new Set();
    for (let i = 0; i < 7; i++) {
      const d = new Date(start + 'T12:00'); d.setDate(d.getDate() + i); const k = dayKey(d);
      const cur = menuOf(k);
      if (!cur || !MENU_MEALS.some(x => cur.meals[x]?.done)) makeMenu(k, prev);
      prev = new Set(Object.values(S.ui.menu[k].meals).flatMap(x => Object.values(x.pick || {})));
    }
    S.ui.shop = { from: start, done: {} }; shopOpen = true; save(true); render(); toast('7 dias planejados');
    requestAnimationFrame(() => $('#c-lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  if (a === 'pStrict') { S.ui.pStrict = el.checked; save(true); }
  if (a === 'shopShare') {
    const txt = [...document.querySelectorAll('#c-lista li')].filter(li => !li.classList.contains('got')).map(li => `• ${li.querySelector('span').textContent} — ${li.querySelector('.mono').textContent}`).join('\n');
    const body = `Lista de compras (RONIN)\n${txt}`;
    if (navigator.share) navigator.share({ text: body }).catch(() => { });
    else navigator.clipboard?.writeText(body).then(() => toast('Lista copiada'), () => toast('Não deu pra copiar'));
  }
  if (a === 'scanOpen') openScan();
  if (a === 'scanClose') closeScan();
  if (a === 'scanRetry') { try { scanStop?.(); } catch (er) { } scanStop = null; scanCam(); }
  if (a === 'scanManual') { const n = el.dataset.n || ''; closeScan(); const d = $('#manualFood')?.closest('details'); if (d) { d.open = true; if (n) $('#manualFood').n.value = n; $('#manualFood').k.focus({ preventScroll: true }); d.scrollIntoView({ block: 'center' }); } }
  if (a === 'reAdd') { const r = recentFoods()[+el.dataset.r]; if (r) { const { id, t, m, ...rest } = r.it; addFood(rest); } }
  if (a === 'foodCat') { foodCat = el.dataset.c; const q = $('#foodSearch')?.value || ''; render(); const i = $('#foodSearch'); if (i) { i.value = q; i.dispatchEvent(new Event('input')); } }
  if (a === 'qty') { const it = (S.logs.food[curDay()] || []).find(x => x.id === el.dataset.id); if (it) { const st = stepOf(it), cur = amtOf(it); setAmount(it.id, Math.max(st, cur + st * +el.dataset.d)); } }
  if (a === 'pickFood') {
    const i = +el.dataset.i; $('#foodPick').innerHTML = foodPickHTML(i);
    const f = $('#pickForm'), info = $('#pickInfo');
    const upd = () => { const g = num(f.g.value) || 0, fd = FOODS[i], m = g / 100; info.textContent = `${fmt(fd.k * m, 0)} kcal · P ${fmt(fd.p * m)} · C ${fmt(fd.c * m)} · G ${fmt(fd.f * m)} · Fibra ${fmt(fd.fb * m)}`; };
    f.g.addEventListener('input', upd); upd(); f.g.focus({ preventScroll: true }); f.g.select();
    f.addEventListener('submit', ev2 => {
      ev2.preventDefault(); const g = num(f.g.value) || 0, fd = FOODS[i], m = g / 100;
      const st = fd.g <= 60 ? fd.g : Math.max(10, Math.round(fd.g / 3 / 10) * 10);
      addFood({ n: fd.n, g, u: /\(ml\)/.test(fd.n) ? 'ml' : 'g', st, k: fd.k * m, p: fd.p * m, c: fd.c * m, f: fd.f * m, fb: fd.fb * m });
    });
  }
  if (a === 'delFood') { const id = el.dataset.id; S.logs.food[curDay()] = (S.logs.food[curDay()] || []).filter(x => x.id !== id); S.del[id] = Date.now(); save(); render(); }
  if (a === 'toggleAdaptive') { S.settings.adaptive = el.checked; save(true); render(); }
  if (a === 'finishWorkout') {
    const n = Object.values(draft?.sets || {}).flat().filter(s => s && s.reps).length;
    if (!n) { toast('Registre pelo menos uma série.'); return; }
    S.logs.workouts.push({ ...draft, id: newId(), sets: Object.fromEntries(Object.entries(draft.sets).map(([k, v]) => [k, v.filter(Boolean)])) });
    draft = null; save(); toast(`Treino salvo: ${n} séries`); location.hash = '#treino';
  }
  if (a === 'sport') { S.ui.sport = el.dataset.id; save(true); timerReset(); render(); }
  if (a === 'preset') { const p = SPORTS[curSport()].presets.find(x => x.id === el.dataset.id); Object.assign(S.timer, { preset: p.id, rounds: p.rounds, work: p.work, rest: p.rest, program: null }); save(true); timerReset(); render(); }
  if (a === 'tToggle') timerToggle();
  if (a === 'tReset') timerReset();
  if (a === 'loadProg' && genSession) { S.timer.program = genSession; save(); timerReset(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); toast('Treino no timer. Aperta Iniciar.'); }
  if (a === 'unloadProg') { S.timer.program = null; save(); timerReset(); render(); }
  if (a === 'voiceToggle') { S.timer.voice = el.checked; save(true); if (el.checked) say('Voz ligada'); }
  if (a === 'callsToggle') { S.timer.calls = el.checked; save(true); }
  if (a === 'weak') { const id = el.dataset.id; S.weak = S.weak.includes(id) ? S.weak.filter(x => x !== id) : [...S.weak, id]; save(true); render(); }
  if (a === 'lvl') {
    const ex = el.dataset.ex, e2 = EXERCISES[ex]; const cur = buildPlan(S.profile).days.flatMap(d => d.items).find(i => i.ex === ex)?.lvl ?? 0;
    S.prog[ex] = Math.max(0, Math.min(e2.vars.length - 1, cur + +el.dataset.d)); save(); render(); toast(e2.vars[S.prog[ex]]);
  }
  if (a === 'addStrength') { Object.assign(S.profile, { liftDays: 2, env: S.profile.env || 'casa' }); save(true); render(); toast('2 treinos de força adicionados'); }
  if (a === 'techPause' && anim) { el.textContent = anim.toggle() ? '▶ Continuar' : '❚❚ Pausar'; }
  if (a === 'techSpeed' && anim) { anim.setSpeed(+el.dataset.s); el.parentNode.querySelectorAll('[data-act=techSpeed]').forEach(b => b.classList.toggle('on', b === el)); }
  if (a === 'techCat') { techCat = el.dataset.c; render(); }
  if (a === 'ask') askCoach(el.dataset.q);
  if (a === 'clearChat') { S.chat = []; save(); render(); }
  if (a === 'saveKey') {
    const v = $('#apiKey').value.trim(); S.settings.model = $('#apiModel').value.trim() || 'claude-sonnet-5-5'; save(true);
    if (v && !v.startsWith('••')) { setKey(v); toast('Chave salva no aparelho'); } else toast('Modelo salvo');
    render();
  }
  if (a === 'delKey') { setKey(''); toast('Chave removida'); render(); }
  if (a === 'google') { el.disabled = true; el.lastChild.textContent = 'Abrindo o Google…'; save(); cloud.signInWithGoogle(); }
  if (a === 'gateTab') { const f = $('#authForm'); if (f) GATE.email = f.email.value; GATE.tab = el.dataset.t; GATE.msg = null; render(); }
  if (a === 'showPass') { const i = el.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; el.classList.toggle('on', i.type === 'text'); }
  if (a === 'resend') { try { await cloud.resend($('#authForm').email.value); toast('E-mail de confirmação reenviado.'); } catch (err) { toast(err.message); } }
  if (a === 'skipLogin') { skipLogin.set(true); try { history.replaceState(null, '', location.pathname + '#hoje'); } catch (e) { } rendered = ''; go(); window.scrollTo(0, 0); }
  if (a === 'toLogin') { skipLogin.set(false); GATE.tab = 'in'; GATE.msg = null; try { history.replaceState(null, '', location.pathname + '#login'); } catch (e) { } rendered = ''; go(); window.scrollTo(0, 0); }
  if (a === 'syncNow') doSync();
  if (a === 'signOut') {
    if (!el.dataset.armed) {
      el.dataset.armed = '1'; el.textContent = 'Toque de novo pra sair';
      setTimeout(() => { if (el.isConnected && el.dataset.armed === '1') { delete el.dataset.armed; el.textContent = 'Sair da conta'; } }, 4000);
      return;
    }
    if (el.dataset.armed === '1') {
      el.disabled = true; el.textContent = 'Salvando na conta…';
      clearTimeout(syncTimer);
      const ok = await sync.syncNow(() => S, ns => { S = ns; }).then(() => true, () => false);
      if (!ok) { el.disabled = false; el.dataset.armed = '2'; el.textContent = 'Sair mesmo assim'; toast('Sem conexão: o que não foi sincronizado vai se perder. Toque de novo pra sair mesmo assim.'); return; }
    }
    await cloud.signOut();
    wipeLocal(); skipLogin.set(false);
    GATE.tab = 'in'; GATE.msg = null; GATE.email = ''; GATE.confirm = false; GATE.recovery = false;
    try { history.replaceState(null, '', location.pathname + '#login'); } catch (e) { location.hash = '#login'; }
    rendered = ''; go(); window.scrollTo(0, 0);
    toast('Você saiu da conta. Este aparelho foi limpo.');
  }
  if (a === 'export') {
    const blob = new Blob([JSON.stringify({ ...S, chat: [] }, null, 1)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `ronin-backup-${today()}.json`; link.click();
  }
  if (a === 'reset') {
    if (el.dataset.armed) {
      S = blank(); try { localStorage.setItem(KEY, JSON.stringify(S)); localStorage.removeItem(OLD_KEY); } catch (err) { }
      if (cloud.user()) { try { await sync.wipe(); } catch (err) { } }
      location.hash = '#hoje'; rendered = ''; go(); return;
    }
    el.dataset.armed = '1'; el.textContent = 'Toque de novo pra apagar TUDO (inclusive na nuvem)';
    setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = 'Apagar tudo'; } }, 4000);
  }
});
document.addEventListener('input', e => {
  const k = e.target.dataset?.set; if (!k || !draft) return;
  const [ex, i, field] = k.split('|');
  const arr = (draft.sets[ex] ||= []); arr[+i] = { ...(arr[+i] || {}), [field]: num(e.target.value) };
  e.target.closest('.set')?.classList.toggle('done', !!arr[+i].reps);
});

// ---------------- Início ----------------
let pendingLogin = false;
(function start() {
  // volta do login (Google / link do e-mail) com tokens no endereço
  const r = cloud.handleRedirect();
  if (r) {
    if (r.type === 'recovery') GATE.recovery = true;
    try { history.replaceState(null, '', location.pathname + (r.error ? '#login' : r.type === 'recovery' ? '#perfil-conta' : S.profile ? '#hoje' : '#perfil')); } catch (e) { location.hash = '#hoje'; }
    if (r.error) GATE.msg = { ok: false, html: esc(r.error) };
    else if (r.type !== 'recovery') pendingLogin = true;
    if (r.error || r.type === 'recovery') setTimeout(() => toast(r.error ? r.error : 'Crie sua senha nova.'), 300);
  }
  // erro do Google volta como ?error=…
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('error')) {
      const d = (q.get('error_description') || '').replace(/\+/g, ' ');
      const m = /provider is not enabled|Unsupported provider/i.test(d) ? 'Login com Google ainda não está ativado no servidor. Use e-mail e senha.' : q.get('error') === 'access_denied' ? 'Login com Google cancelado.' : (d || 'Não deu pra entrar com o Google.');
      history.replaceState(null, '', location.pathname + '#login');
      GATE.msg = { ok: false, html: esc(m) };
      setTimeout(() => toast(m), 300);
    }
  } catch (e) { }
  rendered = location.hash; render();
  if (cloud.user()) {
    if (pendingLogin) afterLogin(); else doSync(true).then(() => { if (!S.profile) render(); });
    setInterval(() => doSync(true), 10 * 60 * 1000);
    document.addEventListener('visibilitychange', () => doSync(true));
  }
})();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  const hadCtrl = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtrl && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => { });
}
