import { EVIDENCE, EXERCISES, FOODS, MUSCLES, EQUIP, PUNCHES, MEALS } from './data.js';
import { NEAT, GOALS, targets, adaptiveTDEE, buildPlan as plan_, suggest, dayKey, fmt, sessionKcal, movingAvg, equipment, comboPool, comboSpeech, sportsOf, sportDays } from './calc.js';
import { SPORTS, SPORT_IDS, combatSession, runSession } from './sports.js';
import { TECHNIQUES, TIRED, CATS, animate, thumbSVG } from './techniques.js';
import { cloud } from './cloud.js';
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
    for (const items of Object.values(d.logs.food)) for (const it of items) it.id ||= newId();
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
function dayNav() { const k = curDay(); return `<div class="daynav"><button data-act="day" data-d="-1" aria-label="Dia anterior">‹</button><span>${esc(dayLabel(k))}${viewDay ? ` <small class="muted">${k.split('-').reverse().join('/')}</small>` : ''}</span><button data-act="day" data-d="1" ${viewDay ? '' : 'disabled'} aria-label="Próximo dia">›</button>${viewDay ? '<button class="linkbtn" data-act="dayToday">voltar pra hoje</button>' : ''}</div>`; }
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
function toast(msg) {
  const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
function foodTotals() { const out = {}; for (const [d, items] of Object.entries(S.logs.food)) out[d] = items.reduce((a, i) => a + i.k, 0); return out; }
function T() { return targets(S.profile, S.settings.adaptive ? adaptiveTDEE(S.logs.weights, foodTotals()) : null); }
function dayFood(d = curDay()) { return (S.logs.food[d] || []).reduce((a, i) => ({ k: a.k + i.k, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { k: 0, p: 0, c: 0, f: 0 }); }
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
function weightChart() {
  const ks = Object.keys(S.logs.weights).sort().slice(-60);
  if (ks.length < 2) return `<p class="muted small">Registre seu peso por alguns dias pra ver a tendência. Pese de manhã, em jejum, depois do banheiro.</p>`;
  const ys = ks.map(k => S.logs.weights[k]), avg = movingAvg(ys, 7);
  const lo = Math.min(...ys) - 0.5, hi = Math.max(...ys) + 0.5;
  const W = 320, H = 120, px = i => 8 + i * (W - 16) / (ks.length - 1), py = v => H - 10 - (v - lo) / (hi - lo) * (H - 24);
  const line = avg.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const dots = ys.map((v, i) => `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="2.2" class="dot"/>`).join('');
  const delta = avg[avg.length - 1] - avg[0];
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Gráfico de peso">${dots}<path d="${line}" class="trend"/></svg>
    <div class="row between small muted"><span>${ks[0].slice(8)}/${ks[0].slice(5, 7)}</span><span>Tendência: <b class="${delta < 0 ? 'down' : 'up'}">${delta > 0 ? '+' : ''}${fmt(delta)} kg</b></span><span>${ks[ks.length - 1].slice(8)}/${ks[ks.length - 1].slice(5, 7)}</span></div>`;
}
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
      <label>Idade <input name="age" inputmode="numeric" value="${p.age ?? ''}" required placeholder="anos"></label>
      <label>Altura (cm) <input name="height" inputmode="decimal" value="${p.height ?? ''}" required placeholder="178"></label>
      <label>Peso (kg) <input name="weight" inputmode="decimal" value="${p.weight ?? ''}" required placeholder="80"></label>
    </div>
    <label>% de gordura <small>(opcional, melhora a precisão)</small><input name="bf" inputmode="decimal" value="${p.bf ?? ''}" placeholder="ex.: 15"></label>
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
          <label>Min. por treino <input name="sm_${id}" inputmode="numeric" value="${v.min || 60}"></label>
          <label>Tipo mais comum ${sel('st_' + id, Object.fromEntries(Object.entries(S0.types).map(([k, t]) => [k, t.n])), v.type || S0.defaultType)}</label>
          <label>Onde ${sel('sw_' + id, id === 'corrida' ? { rua: 'Rua / parque', esteira: 'Esteira' } : { casa: 'Em casa', academia: 'Academia / equipe' }, v.where || (id === 'corrida' ? 'rua' : 'casa'))}</label>
        </div></div>`;
    }).join('')}

    <h3 class="sec">Força (musculação ou calistenia)</h3>
    <div class="grid2">
      <label>Onde ${sel('env', { casa: 'Em casa / calistenia', academia: 'Academia' }, p.env || 'casa')}</label>
      <label>Dias por semana ${sel('liftDays', { 0: '0 (por enquanto)', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }, p.liftDays ?? 2)}</label>
      <label>Min. por sessão <input name="liftMin" inputmode="numeric" value="${p.liftMin ?? 40}"></label>
    </div>
    <fieldset class="equip"><legend>O que você tem em casa?</legend>
      ${Object.entries(EQUIP).map(([k, v]) => `<label class="check"><input type="checkbox" name="equip" value="${k}" ${(p.equip || []).includes(k) ? 'checked' : ''}><span>${esc(v)}</span></label>`).join('')}
      <small class="muted">Sem nada marcado = só peso corporal (calistenia). O app escolhe os exercícios pelo que você tem.</small>
    </fieldset>
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
  const tip = EVIDENCE[(new Date().getDate() + new Date().getMonth()) % EVIDENCE.length];
  const todayS = S.logs.sessions.filter(b => b.date === curDay());
  const wl = S.logs.water[curDay()] || [];
  const cs = curSport();
  return `<section class="head"><div>${viewDay ? '<small class="muted">Editando um dia passado</small><br>' : `<small class="muted">${greet}</small><br>`}<h1>${viewDay ? 'Registro' : 'Hoje'}</h1></div></section>
  ${dayNav()}
  <div class="card glow">
    <div class="row">
      ${ring(f.k, t.kcal, fmt(Math.max(0, t.kcal - f.k), 0), 'kcal restantes')}
      <div class="grow">${bar('Proteína', f.p, t.protein, 'g', 'var(--acc)')}${bar('Carboidrato', f.c, t.carbs, 'g', 'var(--cyan)')}${bar('Gordura', f.f, t.fat, 'g', 'var(--amber)')}</div>
    </div>
    <div class="row gap mt"><a class="btn small" href="#nutri">+ Comida</a></div>
    ${waterBar(w, t.water)}
    <div class="water">
      <button class="btn small" data-act="water" data-v="250">+250</button><button class="btn small" data-act="water" data-v="500">+500</button>
      <button class="btn small ghost" data-act="water" data-v="-250" ${w ? '' : 'disabled'} aria-label="Tirar 250 ml">−250</button>
      <form id="waterForm" class="row gap"><input name="ml" inputmode="numeric" placeholder="ml" aria-label="Outra quantidade em ml"><button class="btn small ghost" type="submit">ok</button></form>
    </div>
    ${wl.length ? `<details class="wlist"><summary class="small">Ver ${wl.length} registro(s) de água</summary><ul class="list">${wl.map(x => `<li><span class="small">${x.ml > 0 ? '+' : ''}${x.ml} ml</span><button class="x" data-act="delWater" data-id="${x.id}" aria-label="Apagar">×</button></li>`).join('')}</ul></details>` : ''}
  </div>
  ${viewDay ? '' : `<a class="card link panel" href="#esporte"><small class="cat">${esc(SPORTS[cs].n)}</small><h3>${SPORTS[cs].combat ? 'Gerar treino de hoje' : 'Gerar corrida de hoje'}</h3>
    <p class="muted small">${SPORTS[cs].combat ? 'Rounds com tema, combinações faladas e foco nos seus pontos fracos.' : 'Rodagem, intervalado ou tiros, com o timer marcando cada bloco.'}</p><span class="go">Montar →</span></a>`}
  ${next && !viewDay ? `<a class="card link" href="#sessao-${nextIdx}">
    <small class="cat">Próximo treino de força · ${esc(plan.split)}</small><h3>${esc(next.name)}</h3>
    <p class="muted small">${next.items.filter(i => EXERCISES[i.ex].t !== 'prehab').slice(0, 4).map(i => esc(i.name)).join(' · ')}…</p>
    <span class="go">Começar →</span></a>` : ''}
  <div class="card"><h3>Treinos ${viewDay ? 'do dia' : 'de hoje'}</h3>
    ${todayS.length ? todayS.map(b => `<p class="small">${esc(SPORTS[b.sport]?.n || '')} · ${esc(SPORTS[b.sport]?.types[b.type]?.n || '')} · ${b.min} min · ~${fmt(b.kcal, 0)} kcal</p>`).join('') : `<p class="muted small">Nenhuma sessão registrada ${viewDay ? 'nesse dia' : 'hoje'}.</p>`}
  </div>
  <div class="card">
    <form id="weighForm" class="row between"><h3>Peso${viewDay ? ' do dia' : ''}</h3><div class="row gap"><input name="kg" inputmode="decimal" placeholder="${S.logs.weights[curDay()] != null ? fmt(S.logs.weights[curDay()]) : fmt(latestWeight())} kg" style="width:96px" aria-label="Peso do dia"><button class="btn small" type="submit">Salvar</button></div></form>
    ${weightChart()}
  </div>
  <small class="cat pad">Ciência do dia</small>
  ${evCard(tip)}`;
};

views.nutri = () => {
  const t = T(), f = dayFood(), items = S.logs.food[curDay()] || [];
  const ad = adaptiveTDEE(S.logs.weights, foodTotals());
  return `<section class="head"><h1>Nutrição</h1></section>
  ${dayNav()}
  <div class="card glow">
    <small class="cat">Sua meta diária</small>
    <div class="big mono">${fmt(t.kcal, 0)} <i>kcal</i></div>
    <div class="macros"><div><b>${t.protein}g</b><span>proteína</span></div><div><b>${t.carbs}g</b><span>carbo</span></div><div><b>${t.fat}g</b><span>gordura</span></div><div><b>${fmt(t.water / 1000)}L</b><span>água</span></div></div>
    <p class="small muted">Tendência prevista: <b>${t.weekChange > 0 ? '+' : ''}${fmt(t.weekChange, 2)} kg/semana</b> · Fibras ≥ ${t.fiber} g</p>
    ${t.notes.map(n => `<p class="warn small">${esc(n)}</p>`).join('')}
  </div>
  <details class="card"><summary><h3>Como cheguei nesse número</h3></summary>
    <table class="tbl">
      <tr><td>Metabolismo basal (${t.bmrMethod})</td><td>${fmt(t.bmr, 0)}</td></tr>
      <tr><td>+ dia a dia (fator ${S.profile.neat})</td><td>${fmt(t.neat - t.bmr, 0)}</td></tr>
      <tr><td>+ treinos (média/dia)</td><td>${fmt(t.ex, 0)}</td></tr>
      <tr><td>= Gasto pela fórmula</td><td>${fmt(t.formula, 0)}</td></tr>
      <tr><td>Gasto usado (${t.source})</td><td><b>${fmt(t.tdee, 0)}</b></td></tr>
    </table>
    <p class="small muted">${ad.ready ? `Pelos seus registros: ingestão média ${fmt(ad.avgIn, 0)} kcal e peso variando ${fmt(ad.slopeWeek, 2)} kg/semana → gasto real ≈ ${fmt(ad.tdee, 0)} kcal.` : `Modo adaptativo: com ≥ 8 pesagens e ≥ 10 dias de comida registrados nos últimos 28 dias, o app calcula seu gasto REAL. Agora: ${ad.weighIns} pesagens, ${ad.foodDays} dias.`}</p>
    <label class="switch"><input type="checkbox" data-act="toggleAdaptive" ${S.settings.adaptive ? 'checked' : ''}> Usar ajuste adaptativo</label>
  </details>
  <div class="card">
    <div class="row between"><h3>${esc(dayLabel(curDay()))}</h3><span class="mono small">${fmt(f.k, 0)} / ${fmt(t.kcal, 0)} kcal</span></div>
    ${bar('Calorias', f.k, t.kcal, ' kcal')}${bar('Proteína', f.p, t.protein)}
  </div>
  ${MEALS.map(m => mealCard(m, items.filter(it => (it.m || 'extra') === m.id))).join('')}
  <p class="muted small pad">Valores aproximados (base TACO/USDA; besteiras = média de mercado). Confira o rótulo quando tiver.</p>`;
};
const FOOD_CATS = { '': 'Todos', base: 'Refeição', fruta: 'Frutas', lanche: 'Lanches', besteira: 'Besteiras' };
let addMeal = null, foodCat = '';
const defaultMeal = () => { const h = new Date().getHours(); return h >= 4 && h <= 10 ? 'cafe' : h <= 14 ? 'almoco' : h <= 17 ? 'lanche' : h <= 21 ? 'jantar' : 'extra'; };
const amtOf = it => it.g ?? it.q ?? 1;
const unitOf = it => it.u || (it.g != null ? 'g' : 'porção');
const stepOf = it => it.st || (unitOf(it) === 'porção' ? 1 : 10);
function mealCard(m, list) {
  const tot = list.reduce((a, i) => a + i.k, 0), open = addMeal === m.id;
  return `<div class="card meal ${open ? 'open' : ''}" id="meal-${m.id}">
    <div class="row between"><h3><span class="mico">${m.ico}</span> ${esc(m.n)}</h3><span class="mono small">${fmt(tot, 0)} kcal</span></div>
    ${list.length ? `<ul class="list items">${list.map(it => `<li><div class="grow"><b>${esc(it.n)}</b><small>${fmt(it.k, 0)} kcal · P ${fmt(it.p, 0)} · C ${fmt(it.c, 0)} · G ${fmt(it.f, 0)}</small></div>
      <div class="qty"><button data-act="qty" data-id="${it.id}" data-d="-1" aria-label="Menos">−</button><input data-qty="${it.id}" inputmode="decimal" value="${fmt(amtOf(it), 1)}" aria-label="Quantidade"><span>${esc(unitOf(it))}</span><button data-act="qty" data-id="${it.id}" data-d="1" aria-label="Mais">+</button></div>
      <button class="x" data-act="delFood" data-id="${it.id}" aria-label="Remover">×</button></li>`).join('')}</ul>` : ''}
    ${open ? `<div class="addbox">
      <input id="foodSearch" placeholder="Buscar (ovo, banana, arroz, chocolate…)" autocomplete="off">
      <div class="segs small">${Object.entries(FOOD_CATS).map(([k, v]) => `<button class="${foodCat === k ? 'on' : ''}" data-act="foodCat" data-c="${k}">${v}</button>`).join('')}</div>
      <div id="foodResults" class="chips"></div><div id="foodPick"></div>
      <details><summary class="small">Adicionar manualmente (rótulo, restaurante)</summary>
        <form id="manualFood" class="form"><input name="n" placeholder="Nome" required>
          <div class="grid4"><input name="k" placeholder="kcal" inputmode="decimal" required><input name="p" placeholder="P g" inputmode="decimal"><input name="c" placeholder="C g" inputmode="decimal"><input name="f" placeholder="G g" inputmode="decimal"></div>
          <button class="btn small" type="submit">Adicionar</button></form>
      </details>
      <button class="linkbtn" data-act="addMeal" data-m="">Fechar</button></div>`
    : `<button class="btn small ghost block addbtn" data-act="addMeal" data-m="${m.id}">+ Adicionar ${m.id === 'extra' ? 'belisco' : 'alimento'}</button>`}
  </div>`;
}
function foodPickHTML(i) {
  const fd = FOODS[i];
  return `<form id="pickForm" class="pick" data-i="${i}"><b>${esc(fd.n)}</b>
    <div class="row gap"><input name="g" inputmode="decimal" value="${fd.g}" aria-label="quantidade"><span>${/\(ml\)/.test(fd.n) ? 'ml' : 'g'}</span><button class="btn small primary" type="submit">Adicionar</button></div>
    <small class="muted" id="pickInfo"></small></form>`;
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
        ${e.inc ? `<input data-set="${it.ex}|${s}|kg" inputmode="decimal" placeholder="${sg.kg ?? 'kg'}" value="${v.kg ?? ''}">` : `<span class="muted small">${e.band ? 'elástico' : e.t === 'power' ? 'explosivo' : 'peso corporal'}</span>`}
        <input data-set="${it.ex}|${s}|reps" inputmode="numeric" placeholder="${it.lo === it.hi ? it.lo : it.lo + '–' + it.hi}" value="${v.reps ?? ''}">
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
      <label>Rounds<input data-tm="rounds" inputmode="numeric" value="${c.rounds}"></label>
      <label>Round (s)<input data-tm="work" inputmode="numeric" value="${c.work}"></label>
      <label>Descanso (s)<input data-tm="rest" inputmode="numeric" value="${c.rest}"></label>
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
  ${SP.legend ? `<details class="card"><summary><h3>Legenda dos números</h3></summary>
    <table class="tbl small">${Object.entries(PUNCHES).map(([k, v]) => `<tr><td class="mono">${k}</td><td>${v}</td></tr>`).join('')}</table>
    <p class="small muted">Guarda ortodoxa (canhoto: espelhe). Ímpares = mão da frente, pares = mão de trás.</p></details>` : ''}

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
views.tecnicas = () => {
  const id = curSport(), list = techList(), cats = CATS.filter(c => list.some(t => t.cat === c));
  if (!cats.includes(techCat)) techCat = '';
  const shown = list.filter(t => !techCat || t.cat === techCat);
  return `<section class="head"><a href="#esporte" class="back">←</a><h1>Técnicas</h1><div class="chip">${esc(SPORTS[id].n)}</div></section>
  ${mySports().filter(s => TECHNIQUES.some(t => t.sport.includes(s))).length > 1 ? `<div class="chips tabs">${mySports().filter(s => TECHNIQUES.some(t => t.sport.includes(s))).map(s => `<button class="chipbtn ${s === id ? 'on' : ''}" data-act="sport" data-id="${s}"><b class="mk">${SPORTS[s].mark}</b> ${esc(SPORTS[s].n)}</button>`).join('')}</div>` : ''}
  <div class="segs">${['', ...cats].map(c => `<button class="${c === techCat ? 'on' : ''}" data-act="techCat" data-c="${esc(c)}">${c ? esc(c) : 'Todas'} <small>${c ? list.filter(t => t.cat === c).length : list.length}</small></button>`).join('')}</div>
  ${(techCat ? [techCat] : cats).map(c => `<small class="cat pad">${esc(c)}</small>
    <div class="techgrid">${shown.filter(t => t.cat === c).map(t => `<a class="tech" href="#tecnica-${t.id}"><span class="tech-thumb">${thumbSVG(t)}</span><b>${esc(t.n)}</b></a>`).join('')}</div>`).join('')}
  ${!list.length ? '<div class="card"><p class="small muted">Ainda não temos técnicas animadas pra esse esporte.</p></div>' : ''}`;
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
PERFIL: ${p.sex === 'f' ? 'mulher' : 'homem'}, ${p.age} anos, ${p.height} cm, ${latestWeight()} kg${p.bf ? `, ${p.bf}% gordura` : ''}. Objetivo: ${GOALS[p.goal]}. Experiência: ${p.experience}.
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
    <p class="small muted">Sincroniza sozinho ao abrir o app, depois de cada alteração, ao sair do app e a cada 10 minutos. Ao sair da conta, tudo é salvo na nuvem e este aparelho é limpo (dá pra entrar com outra conta sem misturar nada).</p>
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
  <p class="gate-ver">v3.6</p></div>`;
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
  <p class="small muted center pad">RONIN v3.6 · não substitui acompanhamento profissional.</p>`;

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
  $('#nav').innerHTML = tabs.map(([id, label]) => `<a href="#${id}" class="${(v === id || (v === 'sessao' && id === 'treino') || ((v === 'tecnica' || v === 'tecnicas') && id === 'esporte')) ? 'on' : ''}"><svg viewBox="0 0 24 24"><path d="${ICONS[id]}"/></svg><span>${esc(label)}</span></a>`).join('');
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
    pf.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(pf), g = k => fd.get(k);
      const sports = {};
      for (const id of SPORT_IDS) if (g('sp_' + id)) sports[id] = { days: num(g('sd_' + id)) || 1, min: num(g('sm_' + id)) || 60, type: g('st_' + id), where: g('sw_' + id) };
      const p = {
        sex: g('sex'), age: num(g('age')), height: num(g('height')), weight: num(g('weight')), bf: num(g('bf')), neat: num(g('neat')), goal: g('goal'), rate: num(g('rate')),
        experience: g('experience'), liftDays: num(g('liftDays')) ?? 0, liftMin: num(g('liftMin')) || 40, env: g('env'), equip: fd.getAll('equip'), sports
      };
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
  }
  if (v === 'nutri') {
    const inp = $('#foodSearch'), res = $('#foodResults');
    const show = () => {
      if (!res) return;
      const q = norm(inp.value);
      const list = FOODS.map((f, i) => [f, i]).filter(([f]) => (!foodCat || (f.cat || 'base') === foodCat) && (!q || norm(f.n).includes(q))).slice(0, q || foodCat ? 20 : 10);
      res.innerHTML = list.map(([f, i]) => `<button class="chipbtn" data-act="pickFood" data-i="${i}">${esc(f.n)}</button>`).join('');
    };
    if (inp) {
      inp.addEventListener('input', show); show();
      $('#manualFood').addEventListener('submit', e => {
        e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target));
        addFood({ n: fd.n, q: 1, u: 'porção', st: 1, k: num(fd.k) || 0, p: num(fd.p) || 0, c: num(fd.c) || 0, f: num(fd.f) || 0 });
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
  (S.logs.water[curDay()] ||= []).push({ id: newId(), ml }); save(); render();
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
  for (const k of ['k', 'p', 'c', 'f']) it[k] = (it[k] || 0) * r;
  if (it.g != null) it.g = Math.round(amt * 10) / 10; else it.q = Math.round(amt * 10) / 10;
  it.t = Date.now(); save(); render();
}

// ---------------- Ações ----------------
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  if (a === 'water') addWater(+el.dataset.v);
  if (a === 'delWater') { const id = el.dataset.id; S.logs.water[curDay()] = (S.logs.water[curDay()] || []).filter(x => x.id !== id); S.del[id] = Date.now(); save(); render(); }
  if (a === 'day') { shiftDay(+el.dataset.d); render(); }
  if (a === 'dayToday') { viewDay = null; render(); }
  if (a === 'addMeal') { addMeal = el.dataset.m || null; foodCat = ''; render(); }
  if (a === 'foodCat') { foodCat = el.dataset.c; const q = $('#foodSearch')?.value || ''; render(); const i = $('#foodSearch'); if (i) { i.value = q; i.dispatchEvent(new Event('input')); } }
  if (a === 'qty') { const it = (S.logs.food[curDay()] || []).find(x => x.id === el.dataset.id); if (it) { const st = stepOf(it), cur = amtOf(it); setAmount(it.id, Math.max(st, cur + st * +el.dataset.d)); } }
  if (a === 'pickFood') {
    const i = +el.dataset.i; $('#foodPick').innerHTML = foodPickHTML(i);
    const f = $('#pickForm'), info = $('#pickInfo');
    const upd = () => { const g = num(f.g.value) || 0, fd = FOODS[i], m = g / 100; info.textContent = `${fmt(fd.k * m, 0)} kcal · P ${fmt(fd.p * m)} · C ${fmt(fd.c * m)} · G ${fmt(fd.f * m)}`; };
    f.g.addEventListener('input', upd); upd(); f.g.focus({ preventScroll: true }); f.g.select();
    f.addEventListener('submit', ev2 => {
      ev2.preventDefault(); const g = num(f.g.value) || 0, fd = FOODS[i], m = g / 100;
      const st = fd.g <= 60 ? fd.g : Math.max(10, Math.round(fd.g / 3 / 10) * 10);
      addFood({ n: fd.n, g, u: /\(ml\)/.test(fd.n) ? 'ml' : 'g', st, k: fd.k * m, p: fd.p * m, c: fd.c * m, f: fd.f * m });
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
