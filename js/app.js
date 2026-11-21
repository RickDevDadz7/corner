import { EVIDENCE, EXERCISES, FOODS, BOX_TYPES, TIMER_PRESETS, WEAKNESSES, MUSCLES, MAJOR } from './data.js';
import { NEAT, GOALS, targets, adaptiveTDEE, buildPlan, suggest, dayKey, fmt, sessionKcal, movingAvg } from './calc.js';

// ---------------- Armazenamento ----------------
const KEY = 'corner:v1';
const KEY_API = 'corner:apikey';
const blank = () => ({ profile: null, logs: { weights: {}, food: {}, water: {}, workouts: [], boxing: [] }, settings: { adaptive: true, model: 'claude-sonnet-5-5' }, chat: [], weak: [], timer: { preset: 'amador', rounds: 3, work: 180, rest: 60 } });
let S = load();
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(blank(), JSON.parse(raw)); } catch (e) { }
  return blank();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Não consegui salvar no aparelho.'); } }
function getKey() { try { return localStorage.getItem(KEY_API) || ''; } catch (e) { return ''; } }
function setKey(v) { try { v ? localStorage.setItem(KEY_API, v) : localStorage.removeItem(KEY_API); } catch (e) { } }

// ---------------- Utilidades ----------------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => dayKey();
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
function foodTotals() {
  const out = {};
  for (const [d, items] of Object.entries(S.logs.food)) out[d] = items.reduce((a, i) => a + i.k, 0);
  return out;
}
function T() { return targets(S.profile, S.settings.adaptive ? adaptiveTDEE(S.logs.weights, foodTotals()) : null); }
function dayFood(d = today()) {
  const items = S.logs.food[d] || [];
  return items.reduce((a, i) => ({ k: a.k + i.k, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { k: 0, p: 0, c: 0, f: 0 });
}
function latestWeight() {
  const ks = Object.keys(S.logs.weights).sort();
  return ks.length ? S.logs.weights[ks[ks.length - 1]] : S.profile?.weight;
}

// ---------------- Componentes ----------------
function ring(value, max, label, sub, color = 'var(--acc)') {
  const r = 52, c = 2 * Math.PI * r, pct = Math.min(1, max ? value / max : 0);
  return `<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="${r}" class="ring-bg"/>
    <circle cx="60" cy="60" r="${r}" class="ring-fg" style="stroke:${color};stroke-dasharray:${c};stroke-dashoffset:${c * (1 - pct)}"/></svg>
    <div class="ring-txt"><b>${label}</b><span>${sub}</span></div></div>`;
}
function bar(name, v, max, unit = 'g', color = 'var(--acc)') {
  const pct = Math.min(100, max ? v / max * 100 : 0);
  return `<div class="bar"><div class="bar-top"><span>${name}</span><span class="mono">${fmt(v, 0)}<i>/${fmt(max, 0)}${unit}</i></span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div></div>`;
}
function weightChart() {
  const ks = Object.keys(S.logs.weights).sort().slice(-60);
  if (ks.length < 2) return `<p class="muted small">Registre seu peso por alguns dias para ver a tendência. Pese de manhã, em jejum, depois do banheiro.</p>`;
  const ys = ks.map(k => S.logs.weights[k]);
  const avg = movingAvg(ys, 7);
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
  return `<details class="card ev" ${open ? 'open' : ''}><summary><div><small class="cat">${esc(e.cat)}</small><h3>${esc(e.title)}</h3></div>${levelBadge(e.level)}</summary>
    <p class="do">${esc(e.do)}</p><p class="why">${esc(e.why)}</p>
    <ul class="refs">${e.refs.map(r => `<li>${esc(r)}</li>`).join('')}</ul></details>`;
}

// ---------------- Telas ----------------
const views = {};

views.onboarding = () => {
  const p = S.profile || {};
  const sel = (name, opts, cur) => `<select name="${name}">${Object.entries(opts).map(([v, t]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  return `${S.profile ? '<section class="head"><h1>Perfil</h1></section>' : '<section class="hero"><div class="logo-big">CORNER</div><p>Seu córner de bolso: nutrição, musculação e boxe com base em ciência.</p></section>'}
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
    <label>Experiência na musculação ${sel('experience', { iniciante: 'Iniciante (< 1 ano)', intermediario: 'Intermediário (1–3 anos)', avancado: 'Avançado (3+ anos)' }, p.experience || 'intermediario')}</label>
    <div class="grid2">
      <label>Dias de musculação ${sel('liftDays', { 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }, p.liftDays || 3)}</label>
      <label>Min. por sessão <input name="liftMin" inputmode="numeric" value="${p.liftMin ?? 60}"></label>
      <label>Dias de boxe ${sel('boxDays', { 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }, p.boxDays ?? 3)}</label>
      <label>Min. por treino <input name="boxMin" inputmode="numeric" value="${p.boxMin ?? 75}"></label>
    </div>
    <label>Tipo de treino de boxe mais comum ${sel('boxType', Object.fromEntries(Object.entries(BOX_TYPES).map(([k, v]) => [k, v.n])), p.boxType || 'saco')}</label>
    <button class="btn primary" type="submit">${S.profile ? 'Salvar' : 'Calcular meu plano'}</button>
    <p class="muted small">Tudo fica salvo só neste aparelho. Não substitui nutricionista ou médico se você tem alguma condição de saúde.</p>
  </form>`;
};

views.hoje = () => {
  const t = T(), f = dayFood(), w = S.logs.water[today()] || 0;
  const plan = buildPlan(S.profile);
  const lastW = S.logs.workouts[S.logs.workouts.length - 1];
  const nextIdx = lastW ? (lastW.idx + 1) % plan.days.length : 0;
  const next = plan.days[nextIdx];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const tip = EVIDENCE[(new Date().getDate() + new Date().getMonth()) % EVIDENCE.length];
  const boxToday = S.logs.boxing.filter(b => b.date === today());
  return `<section class="head"><div><small class="muted">${greet}</small><h1>Hoje</h1></div><div class="chip">${new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</div></section>
  <div class="card glow">
    <div class="row">
      ${ring(f.k, t.kcal, fmt(Math.max(0, t.kcal - f.k), 0), 'kcal restantes')}
      <div class="grow">${bar('Proteína', f.p, t.protein, 'g', 'var(--acc)')}${bar('Carboidrato', f.c, t.carbs, 'g', 'var(--cyan)')}${bar('Gordura', f.f, t.fat, 'g', 'var(--amber)')}</div>
    </div>
    <div class="row gap mt"><a class="btn small" href="#nutri">+ Comida</a><button class="btn small ghost" data-act="water" data-v="250">+ 250 ml água</button></div>
    ${bar('Água', w, t.water, ' ml', 'var(--cyan)')}
  </div>
  <a class="card link" href="#sessao-${nextIdx}">
    <small class="cat">Próximo treino · ${esc(plan.split)}</small>
    <h3>${esc(next.name)}</h3>
    <p class="muted small">${next.items.filter(i => EXERCISES[i.ex].t !== 'prehab').slice(0, 4).map(i => esc(EXERCISES[i.ex].n)).join(' · ')}…</p>
    <span class="go">Começar →</span>
  </a>
  <div class="card">
    <div class="row between"><h3>Boxe hoje</h3><a href="#boxe" class="small">Timer →</a></div>
    ${boxToday.length ? boxToday.map(b => `<p class="small">${esc(BOX_TYPES[b.type].n)} · ${b.min} min · ~${fmt(b.kcal, 0)} kcal</p>`).join('') : '<p class="muted small">Nenhuma sessão registrada hoje.</p>'}
  </div>
  <div class="card">
    <form id="weighForm" class="row between"><h3>Peso</h3><div class="row gap"><input name="kg" inputmode="decimal" placeholder="${fmt(latestWeight())} kg" style="width:96px" aria-label="Peso de hoje"><button class="btn small" type="submit">Salvar</button></div></form>
    ${weightChart()}
  </div>
  <small class="cat pad">Ciência do dia</small>
  ${evCard(tip)}`;
};

views.nutri = () => {
  const t = T(), f = dayFood(), items = S.logs.food[today()] || [];
  const ad = adaptiveTDEE(S.logs.weights, foodTotals());
  return `<section class="head"><h1>Nutrição</h1></section>
  <div class="card glow">
    <small class="cat">Sua meta diária</small>
    <div class="big mono">${fmt(t.kcal, 0)} <i>kcal</i></div>
    <div class="macros">
      <div><b>${t.protein}g</b><span>proteína</span></div><div><b>${t.carbs}g</b><span>carbo</span></div><div><b>${t.fat}g</b><span>gordura</span></div><div><b>${fmt(t.water / 1000)}L</b><span>água</span></div>
    </div>
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
    <div class="row between"><h3>Hoje</h3><span class="mono small">${fmt(f.k, 0)} / ${fmt(t.kcal, 0)} kcal</span></div>
    ${bar('Proteína', f.p, t.protein)}
    <ul class="list">${items.map((it, i) => `<li><div><b>${esc(it.n)}</b><small>${it.g ? it.g + ' g · ' : ''}${fmt(it.k, 0)} kcal · P ${fmt(it.p, 0)} · C ${fmt(it.c, 0)} · G ${fmt(it.f, 0)}</small></div><button class="x" data-act="delFood" data-i="${i}" aria-label="Remover">×</button></li>`).join('') || '<li class="muted small">Nada registrado ainda.</li>'}</ul>
  </div>
  <div class="card">
    <h3>Adicionar</h3>
    <input id="foodSearch" placeholder="Buscar alimento (arroz, frango, ovo…)" autocomplete="off">
    <div id="foodResults" class="chips"></div>
    <div id="foodPick"></div>
    <details><summary class="small">Adicionar manualmente (rótulo, restaurante)</summary>
      <form id="manualFood" class="form">
        <input name="n" placeholder="Nome" required>
        <div class="grid4"><input name="k" placeholder="kcal" inputmode="decimal" required><input name="p" placeholder="P g" inputmode="decimal"><input name="c" placeholder="C g" inputmode="decimal"><input name="f" placeholder="G g" inputmode="decimal"></div>
        <button class="btn small" type="submit">Adicionar</button>
      </form>
    </details>
    <p class="muted small">Valores aproximados (base TACO/USDA). Confira o rótulo.</p>
  </div>`;
};

function foodPickHTML(i) {
  const fd = FOODS[i];
  return `<form id="pickForm" class="pick" data-i="${i}"><b>${esc(fd.n)}</b>
    <div class="row gap"><input name="g" inputmode="decimal" value="${fd.g}" aria-label="gramas"><span>g</span><button class="btn small primary" type="submit">Adicionar</button></div>
    <small class="muted" id="pickInfo"></small></form>`;
}

views.treino = () => {
  const plan = buildPlan(S.profile);
  const vols = Object.entries(plan.vol).filter(([m]) => m !== 'pescoco');
  const hist = S.logs.workouts.slice(-5).reverse();
  return `<section class="head"><h1>Treino</h1><div class="chip">${esc(plan.split)}</div></section>
  ${plan.reduced ? `<p class="note small">Volume ajustado pra baixo (${S.profile.experience === 'iniciante' ? 'iniciante' : 'muito boxe na semana'}). Recupere bem antes de subir.</p>` : ''}
  ${plan.days.map((d, i) => `<a class="card link" href="#sessao-${i}">
    <small class="cat">Dia ${i + 1}</small><h3>${esc(d.name)}</h3>
    <p class="muted small">${d.items.length} exercícios · ~${d.items.reduce((a, b) => a + b.sets, 0)} séries</p><span class="go">Abrir →</span></a>`).join('')}
  <details class="card"><summary><h3>Volume semanal por músculo</h3></summary>
    <p class="small muted">Séries/semana (indiretas = 0,5). Faixa de referência: 10–20 por músculo.</p>
    ${vols.map(([m, v]) => { const c = v < 6 ? 'var(--muted)' : v < 10 ? 'var(--amber)' : v <= 20 ? 'var(--acc)' : 'var(--red)'; return bar(MUSCLES[m], v, 20, '', c); }).join('')}
    <p class="small muted">Ombros e core também trabalham muito no boxe: acima de 20 séries, avalie se está recuperando. Com 2 dias/semana o volume é de manutenção, bom quando o boxe é a prioridade.</p>
  </details>
  <div class="card"><h3>Histórico</h3>
    <ul class="list">${hist.map(w => `<li><div><b>${esc(w.name)}</b><small>${w.date.split('-').reverse().join('/')} · ${Object.values(w.sets).flat().filter(s => s.reps).length} séries</small></div></li>`).join('') || '<li class="muted small">Nenhum treino registrado.</li>'}</ul></div>
  <small class="cat pad">Base científica</small>
  ${EVIDENCE.filter(e => e.cat === 'Musculação').map(e => evCard(e)).join('')}`;
};

let draft = null; // treino em andamento
views.sessao = (idx) => {
  const plan = buildPlan(S.profile);
  const day = plan.days[+idx] || plan.days[0];
  if (!draft || draft.idx !== day.idx) draft = { idx: day.idx, key: day.key, name: day.name, date: today(), sets: {} };
  const lastFor = ex => { for (let i = S.logs.workouts.length - 1; i >= 0; i--) { const w = S.logs.workouts[i]; if (w.sets[ex]?.some(s => s.reps)) return w.sets[ex]; } return null; };
  return `<section class="head"><a href="#treino" class="back">←</a><h1>${esc(day.name)}</h1></section>
  <p class="note small">Aqueça 5–10 min + 1–2 séries leves no 1º composto. Exercícios de potência primeiro, sempre descansado.</p>
  ${day.items.map(it => {
    const e = EXERCISES[it.ex], last = lastFor(it.ex), sg = suggest(it, last);
    const unit = e.u === 's' ? 'seg' : e.u === 'm' ? 'm' : 'reps';
    const rows = Array.from({ length: it.sets }, (_, s) => {
      const v = draft.sets[it.ex]?.[s] || {};
      return `<div class="set ${v.reps ? 'done' : ''}"><span class="mono">${s + 1}</span>
        ${e.inc ? `<input data-set="${it.ex}|${s}|kg" inputmode="decimal" placeholder="${sg.kg ?? 'kg'}" value="${v.kg ?? ''}">` : '<span class="muted small">peso corporal</span>'}
        <input data-set="${it.ex}|${s}|reps" inputmode="numeric" placeholder="${it.lo === it.hi ? it.lo : it.lo + '–' + it.hi}" value="${v.reps ?? ''}">
        <span class="small muted">${unit}</span></div>`;
    }).join('');
    return `<div class="card ex"><div class="row between"><h3>${esc(e.n)}</h3><span class="chip">${it.sets}×${it.lo === it.hi ? it.lo : it.lo + '–' + it.hi}${e.u === '/lado' ? '/lado' : ''}</span></div>
      <p class="small muted">${esc(e.cue)}${it.rir ? ` · RIR ${it.rir} · descanso ${it.rest}` : ''}</p>
      <p class="small sug">${esc(sg.text)}</p>${rows}</div>`;
  }).join('')}
  <button class="btn primary block" data-act="finishWorkout">Finalizar treino</button>`;
};

// ---------------- Boxe + Timer ----------------
const TM = { phase: 'idle', round: 0, end: 0, left: 0, paused: false, iv: null, warned: false };
let AC = null, wakeLock = null;
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
async function lockScreen(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { }
}
function startPhase(phase, secs) { TM.phase = phase; TM.end = Date.now() + secs * 1000; TM.left = secs; TM.warned = false; }
function tick() {
  if (TM.paused || TM.phase === 'idle' || TM.phase === 'done') return;
  TM.left = Math.max(0, Math.ceil((TM.end - Date.now()) / 1000));
  const cfg = S.timer;
  if (TM.phase === 'round' && TM.left === 10 && !TM.warned && cfg.work > 20) { TM.warned = true; clap(); }
  if (TM.left <= 0) {
    if (TM.phase === 'prep') { startPhase('round', cfg.work); TM.round = 1; bell(1); }
    else if (TM.phase === 'round') {
      if (TM.round >= cfg.rounds) { TM.phase = 'done'; bell(3); clearInterval(TM.iv); lockScreen(false); }
      else { startPhase('rest', cfg.rest); bell(2); }
    } else if (TM.phase === 'rest') { TM.round++; startPhase('round', cfg.work); bell(1); }
  }
  paintTimer();
}
function paintTimer() {
  const el = $('#timer'); if (!el) return;
  const cfg = S.timer;
  const total = TM.phase === 'round' ? cfg.work : TM.phase === 'rest' ? cfg.rest : TM.phase === 'prep' ? 10 : 1;
  const left = TM.phase === 'idle' ? cfg.work : TM.left;
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
  const r = 120, c = 2 * Math.PI * r, pct = TM.phase === 'idle' || TM.phase === 'done' ? 1 : left / total;
  const lab = { idle: 'Pronto', prep: 'Prepare-se', round: `Round ${TM.round}/${cfg.rounds}`, rest: `Descanso · próximo ${TM.round + 1}/${cfg.rounds}`, done: 'Fim! Bom trabalho' }[TM.phase];
  el.className = 'timer ph-' + TM.phase + (TM.phase === 'round' && left <= 10 ? ' last10' : '');
  el.querySelector('.t-arc').style.strokeDasharray = c;
  el.querySelector('.t-arc').style.strokeDashoffset = c * (1 - pct);
  el.querySelector('.t-time').textContent = `${mm}:${ss}`;
  el.querySelector('.t-lab').textContent = TM.paused ? 'Pausado' : lab;
  $('#tStart').textContent = TM.phase === 'idle' || TM.phase === 'done' ? 'Iniciar' : TM.paused ? 'Continuar' : 'Pausar';
}
function timerToggle() {
  audio();
  if (TM.phase === 'idle' || TM.phase === 'done') {
    TM.round = 0; TM.paused = false; startPhase('prep', 10);
    clearInterval(TM.iv); TM.iv = setInterval(tick, 200); lockScreen(true);
  } else if (TM.paused) { TM.paused = false; TM.end = Date.now() + TM.left * 1000; lockScreen(true); }
  else { TM.paused = true; }
  paintTimer();
}
function timerReset() { clearInterval(TM.iv); Object.assign(TM, { phase: 'idle', round: 0, paused: false }); lockScreen(false); paintTimer(); }

views.boxe = () => {
  const c = S.timer, r = 120, circ = 2 * Math.PI * r;
  const week = S.logs.boxing.filter(b => (Date.now() - new Date(b.date + 'T12:00').getTime()) < 7 * 864e5);
  const sel = S.weak;
  return `<section class="head"><h1>Boxe</h1><div class="chip">${week.length} sessões / 7 dias</div></section>
  <div class="card glow center">
    <div id="timer" class="timer"><svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="${r}" class="t-bg"/><circle cx="130" cy="130" r="${r}" class="t-arc" style="stroke-dasharray:${circ}"/></svg>
      <div class="t-center"><div class="t-time mono">0:00</div><div class="t-lab">Pronto</div></div></div>
    <div class="chips">${TIMER_PRESETS.map(p => `<button class="chipbtn ${c.preset === p.id ? 'on' : ''}" data-act="preset" data-id="${p.id}">${esc(p.n)}</button>`).join('')}</div>
    <div class="grid3 small">
      <label>Rounds<input data-tm="rounds" inputmode="numeric" value="${c.rounds}"></label>
      <label>Round (s)<input data-tm="work" inputmode="numeric" value="${c.work}"></label>
      <label>Descanso (s)<input data-tm="rest" inputmode="numeric" value="${c.rest}"></label>
    </div>
    <div class="row gap mt"><button id="tStart" class="btn primary grow" data-act="tToggle">Iniciar</button><button class="btn ghost" data-act="tReset">Zerar</button></div>
    <p class="small muted">Gongo no início e no fim, batida de aviso aos 10 s finais. Tela fica acesa enquanto roda.</p>
  </div>
  <form id="boxForm" class="card form"><h3>Registrar sessão</h3>
    <div class="grid2"><label>Tipo<select name="type">${Object.entries(BOX_TYPES).map(([k, v]) => `<option value="${k}" ${k === S.profile.boxType ? 'selected' : ''}>${esc(v.n)}</option>`).join('')}</select></label>
    <label>Minutos<input name="min" inputmode="numeric" value="${S.profile.boxMin || 60}"></label></div>
    <button class="btn small" type="submit">Salvar sessão</button></form>
  <div class="card"><h3>Onde você quer evoluir?</h3><p class="small muted">Marque seus pontos fracos e o app monta o foco.</p>
    <div class="chips">${WEAKNESSES.map(w => `<button class="chipbtn ${sel.includes(w.id) ? 'on' : ''}" data-act="weak" data-id="${w.id}">${esc(w.n)}</button>`).join('')}</div>
    ${WEAKNESSES.filter(w => sel.includes(w.id)).map(w => `<div class="focus"><h4>${esc(w.n)}</h4><ul>${w.fix.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <p class="small muted">Base: ${w.ev.map(id => esc(EVIDENCE.find(e => e.id === id)?.title)).join(' · ')}</p></div>`).join('')}
  </div>
  <div class="card"><h3>Semana ideal (exemplo)</h3>
    <p class="small">Técnica e sparring nos dias mais descansados. Força depois do boxe ou em outro horário (≥ 6 h). Perna pesada longe do sparring. 1 dia de descanso total.</p>
    <table class="tbl small"><tr><td>Seg</td><td>Boxe técnica + Força (superior)</td></tr><tr><td>Ter</td><td>Força (inferior + potência)</td></tr><tr><td>Qua</td><td>Sparring</td></tr><tr><td>Qui</td><td>Força full body leve + corda</td></tr><tr><td>Sex</td><td>Saco / condicionamento</td></tr><tr><td>Sáb</td><td>Aeróbio leve 30–40 min</td></tr><tr><td>Dom</td><td>Descanso</td></tr></table>
  </div>
  <small class="cat pad">Base científica</small>
  ${EVIDENCE.filter(e => e.cat === 'Boxe').map(e => evCard(e)).join('')}`;
};

// ---------------- Ciência ----------------
views.ciencia = () => {
  const cats = [...new Set(EVIDENCE.map(e => e.cat))];
  return `<section class="head"><h1>Ciência</h1><div class="chip">${EVIDENCE.length} cartas</div></section>
  <p class="small muted pad">Cada recomendação do app vem daqui. Nível <b>A</b>: meta-análises / position stands. <b>B</b>: revisões e ensaios com limitações. <b>C</b>: dados observacionais ou de outra população.</p>
  <input id="evSearch" placeholder="Buscar (proteína, sono, soco…)" autocomplete="off">
  <div id="evList">${cats.map(c => `<small class="cat pad">${esc(c)}</small>${EVIDENCE.filter(e => e.cat === c).map(e => evCard(e)).join('')}`).join('')}</div>`;
};

// ---------------- Coach ----------------
function coachContext() {
  const p = S.profile, t = T(), plan = buildPlan(p);
  return `Você é o CORNER, um coach de boxe, força e nutrição esportiva que fala português do Brasil, de forma direta, informal e inteligente.
REGRAS: Baseie-se em evidência científica. Use as cartas de evidência abaixo como base principal e cite-as pelo título e autor/ano. Se algo não estiver bem estabelecido na literatura, diga que a evidência é limitada. Nunca invente estudos. Não faça diagnósticos médicos; para dor persistente, sintomas após pancada na cabeça, condições de saúde ou cortes de peso agressivos, recomende um profissional. Respostas curtas e práticas (leitura no celular).
PERFIL: ${p.sex === 'f' ? 'mulher' : 'homem'}, ${p.age} anos, ${p.height} cm, ${latestWeight()} kg${p.bf ? `, ${p.bf}% gordura` : ''}. Objetivo: ${GOALS[p.goal]}. Experiência: ${p.experience}. Musculação ${p.liftDays}x/semana, boxe ${p.boxDays}x/semana (${BOX_TYPES[p.boxType].n}).
METAS: ${t.kcal} kcal, P ${t.protein} g, C ${t.carbs} g, G ${t.fat} g, água ${t.water} ml. Gasto estimado ${Math.round(t.tdee)} kcal (${t.source}).
HOJE: consumido ${Math.round(dayFood().k)} kcal, P ${Math.round(dayFood().p)} g.
PLANO: ${plan.split}: ${plan.days.map(d => d.name + ' [' + d.items.map(i => EXERCISES[i.ex].n + ' ' + i.sets + 'x' + i.lo + '-' + i.hi).join(', ') + ']').join(' | ')}.
PONTOS FRACOS NO BOXE: ${S.weak.map(id => WEAKNESSES.find(w => w.id === id)?.n).join(', ') || 'não informados'}.
CARTAS DE EVIDÊNCIA:
${EVIDENCE.map(e => `- [${e.level}] ${e.title}: ${e.do} (${e.refs.join('; ')})`).join('\n')}`;
}
const STOP = new Set(['como', 'que', 'uma', 'para', 'pra', 'com', 'sem', 'mais', 'tem', 'dos', 'das', 'nos', 'nas', 'por', 'qual', 'quanto', 'aumentar', 'posso', 'devo', 'melhor']);
function offlineAnswer(q) {
  const words = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\W+/).filter(w => w.length > 2 && !STOP.has(w));
  const scored = EVIDENCE.map(e => {
    const hay = (e.tags.join(' ') + ' ' + e.title + ' ' + e.do).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return [e, words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0)];
  }).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 2);
  if (!scored.length) return { text: 'Sem a IA ligada eu respondo só com as cartas de evidência e não achei nenhuma sobre isso. Tente palavras como proteína, sono, soco, volume ou creatina, ou ative a IA em Perfil.' };
  return { text: 'Modo offline: o que a base científica diz.', cards: scored.map(([e]) => e.id) };
}
views.coach = () => {
  const hasKey = !!getKey();
  return `<section class="head"><h1>Coach</h1><div class="chip ${hasKey ? 'on' : ''}">${hasKey ? 'IA ativa' : 'Offline'}</div></section>
  ${hasKey ? '' : `<p class="note small">Sem chave de API, o coach responde com as cartas de evidência. Para conversar de verdade, adicione sua chave da API Anthropic em <a href="#perfil">Perfil</a>.</p>`}
  <div id="chat" class="chat">${S.chat.length ? S.chat.map(m => msgHTML(m)).join('') : `<div class="muted small center pad">Pergunte qualquer coisa. Ex.: "Tô cansando no 3º round, o que ajusto?" ou "Posso treinar perna no dia do sparring?"</div>`}</div>
  <div class="chips">${['Cansei no 3º round', 'Como aumentar a força do soco?', 'O que comer antes do sparring?', 'Tô estagnado no supino'].map(s => `<button class="chipbtn" data-act="ask" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <form id="chatForm" class="chatbar"><textarea name="q" rows="1" placeholder="Fale com seu córner…"></textarea><button class="btn primary" type="submit" aria-label="Enviar">➤</button></form>
  ${S.chat.length ? '<button class="btn ghost small" data-act="clearChat">Limpar conversa</button>' : ''}`;
};
function md(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^#{1,3} (.+)$/gm, '<b>$1</b>').replace(/^[-•] (.+)$/gm, '• $1').replace(/\n/g, '<br>');
}
function msgHTML(m) {
  const cards = (m.cards || []).map(id => EVIDENCE.find(e => e.id === id)).filter(Boolean).map(e => evCard(e, true)).join('');
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

// ---------------- Perfil ----------------
views.perfil = () => `${views.onboarding()}
  <div class="card form"><h3>Coach com IA</h3>
    <p class="small muted">Chave da API Anthropic (console.anthropic.com). Cobrança por uso, separada da assinatura do Claude. Fica salva só neste aparelho e fora dos backups.</p>
    <input id="apiKey" type="password" placeholder="sk-ant-…" value="${getKey() ? '••••••••' : ''}" autocomplete="off">
    <label>Modelo<input id="apiModel" value="${esc(S.settings.model)}"></label>
    <div class="row gap"><button class="btn small" data-act="saveKey">Salvar chave</button>${getKey() ? '<button class="btn small ghost" data-act="delKey">Remover</button>' : ''}</div>
  </div>
  <div class="card"><h3>Seus dados</h3>
    <div class="row gap wrap"><button class="btn small" data-act="export">Exportar backup</button><label class="btn small ghost">Restaurar<input type="file" accept="application/json" id="importFile" hidden></label><button class="btn small danger" data-act="reset">Apagar tudo</button></div>
  </div>
  <p class="small muted center pad">CORNER v1.0 · não substitui acompanhamento profissional.</p>`;

// ---------------- Roteador ----------------
const TABS = [['hoje', 'Hoje', 'M3 12l9-8 9 8M5 10v10h14V10'], ['nutri', 'Nutrição', 'M12 3c4 3 6 6 6 10a6 6 0 0 1-12 0c0-4 2-7 6-10z'], ['treino', 'Treino', 'M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12'], ['boxe', 'Boxe', 'M7 4h7a4 4 0 0 1 4 4v4a6 6 0 0 1-6 6H9a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2zM9 18v3h6v-3'], ['coach', 'Coach', 'M4 5h16v11H8l-4 4z']];
function render() {
  const [route, arg] = (location.hash.replace(/^#\/?/, '') || 'hoje').split(/[\/-]/);
  const app = $('#app');
  if (!S.profile) { app.innerHTML = views.onboarding(); $('#nav').hidden = true; $('#topbar').hidden = true; bindAfter('onboarding'); return; }
  $('#nav').hidden = false; $('#topbar').hidden = false;
  const v = views[route] ? route : 'hoje';
  app.innerHTML = views[v](arg);
  $('#nav').innerHTML = TABS.map(([id, label, d]) => `<a href="#${id}" class="${(v === id || (v === 'sessao' && id === 'treino')) ? 'on' : ''}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg><span>${label}</span></a>`).join('');
  bindAfter(v);
  if (v === 'boxe') paintTimer();
}
let lastRoute = '';
window.addEventListener('hashchange', () => { render(); if (location.hash !== lastRoute) window.scrollTo(0, 0); lastRoute = location.hash; });

function bindAfter(v) {
  const pf = $('#profileForm');
  if (pf) {
    const cutVis = () => pf.querySelector('.cut-only').style.display = pf.goal.value === 'cut' ? '' : 'none';
    pf.goal.addEventListener('change', cutVis); cutVis();
    pf.addEventListener('submit', e => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(pf));
      const p = {
        sex: fd.sex, age: num(fd.age), height: num(fd.height), weight: num(fd.weight), bf: num(fd.bf), neat: num(fd.neat), goal: fd.goal, rate: num(fd.rate),
        experience: fd.experience, liftDays: num(fd.liftDays), liftMin: num(fd.liftMin) || 60, boxDays: num(fd.boxDays), boxMin: num(fd.boxMin) || 75, boxType: fd.boxType
      };
      if (!p.age || !p.height || !p.weight || p.age < 14 || p.age > 90 || p.height < 120 || p.height > 230 || p.weight < 35 || p.weight > 250) { toast('Confira idade, altura e peso.'); return; }
      const first = !S.profile;
      S.profile = p;
      if (first || !S.logs.weights[today()]) S.logs.weights[today()] = p.weight;
      save(); toast(first ? 'Plano pronto! 🥊' : 'Perfil atualizado'); location.hash = '#hoje'; render();
    });
  }
  if (v === 'hoje') {
    $('#weighForm').addEventListener('submit', e => {
      e.preventDefault(); const kg = num(e.target.kg.value);
      if (!kg || kg < 30 || kg > 300) { toast('Peso inválido'); return; }
      S.logs.weights[today()] = kg; save(); render(); toast('Peso registrado');
    });
  }
  if (v === 'nutri') {
    const inp = $('#foodSearch'), res = $('#foodResults');
    const show = () => {
      const q = inp.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const list = FOODS.map((f, i) => [f, i]).filter(([f]) => !q || f.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)).slice(0, q ? 12 : 8);
      res.innerHTML = list.map(([f, i]) => `<button class="chipbtn" data-act="pickFood" data-i="${i}">${esc(f.n)}</button>`).join('');
    };
    inp.addEventListener('input', show); show();
    $('#manualFood').addEventListener('submit', e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target));
      addFood({ n: fd.n, k: num(fd.k) || 0, p: num(fd.p) || 0, c: num(fd.c) || 0, f: num(fd.f) || 0 });
    });
  }
  if (v === 'ciencia') {
    $('#evSearch').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      $('#evList').innerHTML = EVIDENCE.filter(x => !q || (x.title + x.do + x.why + x.tags.join(' ') + x.refs.join(' ')).toLowerCase().includes(q)).map(x => evCard(x, !!q)).join('') || '<p class="muted small pad">Nada encontrado.</p>';
    });
  }
  if (v === 'boxe') {
    $('#boxForm').addEventListener('submit', e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); const min = num(fd.min) || 0;
      S.logs.boxing.push({ date: today(), type: fd.type, min, kcal: sessionKcal(BOX_TYPES[fd.type].met, latestWeight(), min) });
      save(); toast('Sessão salva'); render();
    });
    document.querySelectorAll('[data-tm]').forEach(i => i.addEventListener('change', () => {
      const n = Math.max(1, Math.round(num(i.value) || 1)); S.timer[i.dataset.tm] = n; S.timer.preset = 'custom'; save(); if (TM.phase === 'idle') paintTimer();
    }));
  }
  if (v === 'coach') {
    const f = $('#chatForm'), ta = f.q;
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; });
    f.addEventListener('submit', e => { e.preventDefault(); const q = ta.value; ta.value = ''; askCoach(q); });
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); f.requestSubmit(); } });
  }
  if (v === 'perfil') {
    $('#importFile').addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      try { const data = JSON.parse(await file.text()); if (!data.logs) throw 0; S = Object.assign(blank(), data); save(); toast('Backup restaurado'); render(); }
      catch (err) { toast('Arquivo inválido'); }
    });
  }
}

function addFood(item) {
  (S.logs.food[today()] ||= []).push(item); save(); toast(`+${fmt(item.k, 0)} kcal`); render();
}

// ---------------- Ações ----------------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  if (a === 'water') { S.logs.water[today()] = (S.logs.water[today()] || 0) + +el.dataset.v; save(); render(); }
  if (a === 'pickFood') {
    const i = +el.dataset.i; $('#foodPick').innerHTML = foodPickHTML(i);
    const f = $('#pickForm'), info = $('#pickInfo');
    const upd = () => { const g = num(f.g.value) || 0, fd = FOODS[i], m = g / 100; info.textContent = `${fmt(fd.k * m, 0)} kcal · P ${fmt(fd.p * m)} · C ${fmt(fd.c * m)} · G ${fmt(fd.f * m)}`; };
    f.g.addEventListener('input', upd); upd(); f.g.focus(); f.g.select();
    f.addEventListener('submit', ev => { ev.preventDefault(); const g = num(f.g.value) || 0, fd = FOODS[i], m = g / 100; addFood({ n: fd.n, g, k: fd.k * m, p: fd.p * m, c: fd.c * m, f: fd.f * m }); });
  }
  if (a === 'delFood') { S.logs.food[today()].splice(+el.dataset.i, 1); save(); render(); }
  if (a === 'toggleAdaptive') { S.settings.adaptive = el.checked; save(); render(); }
  if (a === 'finishWorkout') {
    const n = Object.values(draft?.sets || {}).flat().filter(s => s && s.reps).length;
    if (!n) { toast('Registre pelo menos uma série.'); return; }
    S.logs.workouts.push({ ...draft, sets: Object.fromEntries(Object.entries(draft.sets).map(([k, v]) => [k, v.filter(Boolean)])) });
    draft = null; save(); toast(`Treino salvo: ${n} séries 💪`); location.hash = '#treino';
  }
  if (a === 'preset') { const p = TIMER_PRESETS.find(x => x.id === el.dataset.id); S.timer = { preset: p.id, rounds: p.rounds, work: p.work, rest: p.rest }; save(); timerReset(); render(); }
  if (a === 'tToggle') timerToggle();
  if (a === 'tReset') timerReset();
  if (a === 'weak') { const id = el.dataset.id; S.weak = S.weak.includes(id) ? S.weak.filter(x => x !== id) : [...S.weak, id]; save(); render(); }
  if (a === 'ask') askCoach(el.dataset.q);
  if (a === 'clearChat') { S.chat = []; save(); render(); }
  if (a === 'saveKey') {
    const v = $('#apiKey').value.trim(); S.settings.model = $('#apiModel').value.trim() || 'claude-sonnet-5-5'; save();
    if (v && !v.startsWith('••')) { setKey(v); toast('Chave salva no aparelho'); } else toast('Modelo salvo');
    render();
  }
  if (a === 'delKey') { setKey(''); toast('Chave removida'); render(); }
  if (a === 'export') {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `corner-backup-${today()}.json`; link.click();
  }
  if (a === 'reset') {
    if (el.dataset.armed) { S = blank(); save(); location.hash = '#hoje'; render(); return; }
    el.dataset.armed = '1'; el.textContent = 'Toque de novo pra apagar TUDO';
    setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = 'Apagar tudo'; } }, 4000);
  }
});
document.addEventListener('input', e => {
  const k = e.target.dataset?.set; if (!k || !draft) return;
  const [ex, i, field] = k.split('|');
  const arr = (draft.sets[ex] ||= []); arr[+i] = { ...(arr[+i] || {}), [field]: num(e.target.value) };
  e.target.closest('.set')?.classList.toggle('done', !!arr[+i].reps);
});

render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
