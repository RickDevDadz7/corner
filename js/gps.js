// ============================================================
// RONIN — motor da corrida com GPS (puro, sem DOM: dá pra testar no node).
// Cada leitura do GPS passa por addFix(): descarta ponto impreciso, salto impossível
// e "tremida" parado; suaviza com um filtro de Kalman simples. O tempo conta pelo
// relógio (início, pausas), como o cronômetro de rounds, então não atrasa.
//
// Pontos guardados: [lat, lon, segundos ativos, altitude|null, marca]
//   marca 0 = normal · 1 = começo de trecho (depois de pausa ou salto: a distância até ele NÃO conta)
//   marca 2 = trecho sem sinal (tela bloqueada, túnel): conta em linha reta e aparece tracejado.
// ============================================================
export const KEY = 'ronin:gps';
export const MAXACC = 35;            // m: leitura pior que isso é ignorada
const MAXV = 12, GAPV = 8;          // m/s: mais rápido que isso não é corrida (salto do GPS)
// Q: quanto a posição pode mudar por segundo no filtro; mv: distância mínima entre pontos (fração da precisão)
export const TUNE = { q: 1.5, mv: 1, mvMin: 3 }; // ajustado em simulação: erro de distância ~1%, parado quase não soma
export const EFFORTS = [1000, 3000, 5000, 10000, 21097.5, 42195];
export const EFF_N = { 1000: '1 km', 3000: '3 km', 5000: '5 km', 10000: '10 km', 21097.5: 'Meia (21 km)', 42195: 'Maratona' };
// ganchos pro app nativo (notificação fixa / Live Activity), como no rtimer
export const bridge = { update: null };

const rad = d => d * Math.PI / 180;
export function dist(a, b) {
  const dLa = rad(b[0] - a[0]), dLo = rad(b[1] - a[1]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLo / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}
const r6 = x => Math.round(x * 1e6) / 1e6;

export function newTrack(cfg = {}, now = Date.now()) {
  return { v: 1, cfg, start: now, pausedMs: 0, pausedAt: 0, paused: false, auto: false, done: false, doneAt: 0,
    pts: [], dist: 0, gapM: 0, up: null, anc: null, k: null, lastFix: 0, mv: now, acc: 0, jumps: 0, newSeg: false, hid: 0 };
}
// segundos de corrida (sem pausas)
export function activeSec(tr, now = Date.now()) {
  const end = tr.done ? tr.doneAt : tr.paused ? tr.pausedAt : now;
  return Math.max(0, (end - tr.start - tr.pausedMs) / 1000);
}
// o filtro anda uns metros atrás da posição real: ao pausar/encerrar, fecha o trecho na última leitura
function flush(tr) {
  const n = tr.pts.length, last = tr.pts[n - 1], r = tr.raw;
  if (!last || !r || last[4] === 1 && n === 1) return;
  const at = Math.round((r[2] - tr.start - tr.pausedMs) / 100) / 10, d = dist(last, r);
  if (at > last[2] && d >= 2 && d < 60 && d / Math.max(1, at - last[2]) <= MAXV * 2) { tr.pts.push([r6(r[0]), r6(r[1]), at, last[3], 0]); tr.dist += d; }
}
export function pause(tr, now = Date.now(), auto = false) { if (tr.paused || tr.done) return; if (!auto) flush(tr); tr.paused = true; tr.auto = auto; tr.pausedAt = now; }
export function resume(tr, now = Date.now()) {
  if (!tr.paused || tr.done) return;
  tr.pausedMs += Math.max(0, now - tr.pausedAt); tr.paused = false;
  if (!tr.auto) tr.newSeg = true; // pausa manual: o caminho feito parado não entra na distância
  tr.auto = false; tr.mv = now;
}
export function finish(tr, now = Date.now()) { if (tr.done) return; if (!tr.paused) flush(tr); if (!tr.paused) tr.pausedAt = now; tr.doneAt = tr.paused ? tr.pausedAt : now; tr.done = true; }

// Kalman (posição), Q em m/s: quanto a pessoa pode se mexer entre leituras
function kal(tr, lat, lon, acc, t) {
  const k = tr.k;
  if (!k) { tr.k = { lat, lon, v: acc * acc, t }; return [lat, lon]; }
  const dt = (t - k.t) / 1000; if (dt > 0) { k.v += dt * TUNE.q * TUNE.q; k.t = t; }
  const g = k.v / (k.v + acc * acc);
  k.lat += g * (lat - k.lat); k.lon += g * (lon - k.lon); k.v *= 1 - g;
  return [k.lat, k.lon];
}

/** Leitura do GPS → aceita ou descarta. f = {lat, lon, acc, alt?, altAcc?, t} (t em ms). Devolve o motivo. */
export function addFix(tr, f, opt = {}) {
  if (tr.done) return 'done';
  if (![f.lat, f.lon, f.t].every(Number.isFinite) || Math.abs(f.lat) > 90 || Math.abs(f.lon) > 180) return 'bad';
  const acc = Number.isFinite(f.acc) && f.acc > 0 ? f.acc : 99;
  tr.acc = acc;
  if (acc > MAXACC) return 'acc';
  if (f.t <= tr.lastFix) return 'old';
  tr.lastFix = f.t;
  tr.raw = [f.lat, f.lon, f.t];
  const n = tr.pts.length, last = n ? tr.pts[n - 1] : null;
  // pausa automática: volta sozinha quando a pessoa sai do lugar
  if (tr.paused) {
    if (!tr.auto || !last) return 'paused';
    if (dist(last, [f.lat, f.lon]) < Math.max(10, acc)) return 'paused';
    resume(tr, f.t);
  }
  const at = Math.round((f.t - tr.start - tr.pausedMs) / 100) / 10;
  const alt = Number.isFinite(f.alt) && (!Number.isFinite(f.altAcc) || f.altAcc <= 20) ? Math.round(f.alt * 10) / 10 : null;
  const push = (p, mark) => {
    tr.pts.push([r6(p[0]), r6(p[1]), at, alt, mark]); tr.mv = f.t; tr.jumps = 0;
    if (alt != null) { // subida acumulada: altitude suavizada + histerese de 5 m (a altitude do GPS oscila muito)
      tr.as = tr.as == null ? alt : tr.as + 0.15 * (alt - tr.as);
      if (tr.anc == null) { tr.anc = tr.as; tr.up = tr.up || 0; }
      else if (tr.as - tr.anc >= 5) { tr.up += tr.as - tr.anc; tr.anc = tr.as; }
      else if (tr.anc - tr.as >= 5) tr.anc = tr.as;
    }
  };
  if (!last || tr.newSeg) { tr.k = null; const p = kal(tr, f.lat, f.lon, acc, f.t); push(p, last ? 1 : 0); tr.newSeg = false; tr.hid = 0; return 'start'; }
  const dt = at - last[2];
  if (dt <= 0) return 'old';
  // voltou de um tempo sem leitura (tela bloqueada, túnel): liga em linha reta se for plausível
  if (dt > 20 || tr.hid) {
    const raw = [f.lat, f.lon], d = dist(last, raw);
    tr.hid = 0; tr.k = null; kal(tr, f.lat, f.lon, acc, f.t);
    if (d < Math.max(15, acc)) { tr.pts[n - 1] = [last[0], last[1], at, last[3], last[4]]; return 'still'; } // ficou parado esse tempo todo
    if (d / dt <= GAPV) { tr.dist += d; tr.gapM += d; push(raw, 2); return 'gap'; }
    push(raw, 1); return 'jumpseg';
  }
  const p = kal(tr, f.lat, f.lon, acc, f.t), d = dist(last, p);
  if (d / dt > MAXV) {
    // um salto isolado é erro do GPS; vários seguidos = ele estava errado antes, recomeça o trecho aqui
    if (++tr.jumps >= 5) { tr.k = null; push([f.lat, f.lon], 1); return 'jumpseg'; }
    return 'jump';
  }
  if (d < Math.max(TUNE.mvMin, acc * TUNE.mv)) return 'still';
  tr.dist += d; push(p, 0);
  return 'ok';
}
// sem andar há um tempo → pausa automática (o app chama no tick)
export function autoCheck(tr, now = Date.now(), idle = 12000) {
  if (tr.done || tr.paused || !tr.pts.length || now - tr.mv < idle) return false;
  pause(tr, tr.mv + 3000, true); return true;
}

// distância e tempo acumulados ponto a ponto (o que conta)
export function cum(pts) {
  const D = [], T = []; let d = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i && pts[i][4] !== 1) d += dist(pts[i - 1], pts[i]);
    D.push(d); T.push(pts[i][2]);
  }
  return { D, T };
}
// ritmo atual (s/km) pelos últimos ~30 s; 0 = parado
export function curPace(tr, now = Date.now(), win = 30) {
  const P = tr.pts, n = P.length;
  if (n < 2 || tr.paused || now - tr.mv > 10000) return 0;
  const tEnd = P[n - 1][2]; let d = 0, i = n - 1;
  while (i > 0 && P[i][4] !== 1 && tEnd - P[i - 1][2] <= win) { d += dist(P[i - 1], P[i]); i--; }
  if (i > 0 && P[i][4] !== 1 && d < 25) { d += dist(P[i - 1], P[i]); i--; }
  const dt = tEnd - P[i][2];
  if (d < 20 || dt <= 0 || d / dt < 0.5) return 0;
  return dt / d * 1000;
}
// tempo de cada km completo (s)
export function splits(pts) {
  const { D, T } = cum(pts), out = []; let k = 1, prev = 0;
  for (let i = 1; i < D.length; i++) {
    while (D[i] >= k * 1000) {
      const f = D[i] === D[i - 1] ? 1 : (k * 1000 - D[i - 1]) / (D[i] - D[i - 1]), t = T[i - 1] + f * (T[i] - T[i - 1]);
      out.push(Math.round(t - prev)); prev = t; k++;
    }
  }
  return out;
}
// melhores trechos contínuos (1 km, 5 km...) dentro da corrida: janela deslizante
export function bestEfforts(pts, targets = EFFORTS) {
  const { D, T } = cum(pts), out = {};
  for (const L of targets) {
    if (!D.length || D[D.length - 1] < L) continue;
    let best = Infinity, j = 0;
    for (let i = 0; i < D.length; i++) {
      if (j < i) j = i;
      while (j < D.length && D[j] - D[i] < L) j++;
      if (j >= D.length) break;
      const f = (L - (D[j - 1] - D[i])) / ((D[j] - D[j - 1]) || 1), t = T[j - 1] + f * (T[j] - T[j - 1]) - T[i];
      if (t > 0 && t < best) best = t;
    }
    if (best < Infinity) out[L] = Math.round(best);
  }
  return out;
}
// calorias pela equação do ACSM (caminhada abaixo de ~8 km/h, corrida acima); 1 L de O2 ≈ 5 kcal
export function kcalRun(kg, m, sec, up = 0) {
  if (!(kg > 0) || !(m > 0) || !(sec > 0)) return 0;
  const v = m / (sec / 60), gr = up > 0 ? up / m : 0;
  const vo2 = v < 134 ? 3.5 + 0.1 * v + 1.8 * v * gr : 3.5 + 0.2 * v + 0.9 * v * gr;
  return Math.round(vo2 * kg * (sec / 60) / 1000 * 5);
}
// previsão de tempo pra outra distância (Riegel 1981): T2 = T1 × (D2/D1)^1,06
export const riegel = (sec, m, target) => sec * Math.pow(target / m, 1.06);

// ---------- percurso compacto (polyline do Google, 5 casas) ----------
function encNum(v) { v = v < 0 ? ~(v << 1) : v << 1; let s = ''; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } return s + String.fromCharCode(v + 63); }
export function encode(coords) {
  let s = '', pa = 0, po = 0;
  for (const [la, lo] of coords) { const a = Math.round(la * 1e5), o = Math.round(lo * 1e5); s += encNum(a - pa) + encNum(o - po); pa = a; po = o; }
  return s;
}
export const RT_OK = /^[\x3f-\x7e]{0,200000}$/;
export function decode(s) {
  if (typeof s !== 'string' || !RT_OK.test(s)) return [];
  const out = []; let i = 0, la = 0, lo = 0;
  const next = () => { let r = 0, sh = 0, b; do { if (i >= s.length) return null; b = s.charCodeAt(i++) - 63; r |= (b & 0x1f) << sh; sh += 5; } while (b >= 0x20); return r & 1 ? ~(r >> 1) : r >> 1; };
  while (i < s.length) { const a = next(), o = next(); if (a == null || o == null) break; la += a; lo += o; out.push([la / 1e5, lo / 1e5]); }
  return out.filter(p => Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180);
}
// simplifica (Douglas-Peucker, ~3 m) sem perder as marcas de trecho
function perp(p, a, b) {
  const k = Math.cos(rad(a[0])) * 111320, x = (q) => [(q[1] - a[1]) * k, (q[0] - a[0]) * 110540];
  const [px, py] = x(p), [bx, by] = x(b), L = bx * bx + by * by;
  if (!L) return Math.hypot(px, py);
  const t = Math.max(0, Math.min(1, (px * bx + py * by) / L));
  return Math.hypot(px - t * bx, py - t * by);
}
export function simplify(pts, tol = 3) {
  const keep = new Uint8Array(pts.length);
  const run = (i, j) => {
    let m = -1, md = tol;
    for (let k = i + 1; k < j; k++) { const d = perp(pts[k], pts[i], pts[j]); if (d > md) { md = d; m = k; } }
    if (m >= 0) { keep[m] = 1; run(i, m); run(m, j); }
  };
  let s = 0;
  for (let i = 0; i < pts.length; i++) if (i === pts.length - 1 || pts[i + 1]?.[4]) { keep[s] = keep[i] = 1; run(s, i); s = i + 1; }
  if (pts.length) keep[0] = 1;
  return pts.filter((_, i) => keep[i]);
}

// ---------- corrida terminada → registro ----------
export function summary(tr, kg) {
  const sec = Math.round(activeSec(tr)), m = tr.dist, sp = splits(tr.pts), be = bestEfforts(tr.pts);
  const simp = simplify(tr.pts), cut = [], gap = [];
  simp.forEach((p, i) => { if (i && p[4] === 1) cut.push(i); if (p[4] === 2) gap.push(i); });
  const up = tr.up == null ? null : Math.round(tr.up);
  return { sec, km: Math.round(m / 10) / 100, min: Math.max(1, Math.round(sec / 60)), up, kcal: kcalRun(kg, m, sec, up || 0), sp, be,
    rt: encode(simp.map(p => [p[0], p[1]])), ...(cut.length ? { cut } : {}), ...(gap.length ? { gap } : {}), ...(tr.gapM > 50 ? { gkm: Math.round(tr.gapM / 10) / 100 } : {}) };
}
// trechos do percurso salvo, pra desenhar: [{pts, dash}]
export function segments(coords, cut = [], gap = []) {
  const C = new Set(cut), G = new Set(gap), out = []; let curr = null;
  coords.forEach((p, i) => {
    if (!i || C.has(i)) { curr = { pts: [p], dash: false }; out.push(curr); return; }
    if (G.has(i)) { out.push({ pts: [coords[i - 1], p], dash: true }); curr = { pts: [p], dash: false }; out.push(curr); return; }
    curr.pts.push(p);
  });
  return out.filter(s => s.pts.length > 1 || out.length === 1);
}
// privacidade: tira os primeiros e os últimos ~N metros (não mostra onde a pessoa mora)
export function trimEnds(coords, m = 200) {
  if (coords.length < 3) return coords;
  let a = 0, d = 0; while (a < coords.length - 1 && d < m) { d += dist(coords[a], coords[a + 1]); a++; }
  let b = coords.length - 1; d = 0; while (b > a && d < m) { d += dist(coords[b - 1], coords[b]); b--; }
  return b - a >= 1 ? coords.slice(a, b + 1) : [];
}

// ---------- salvar/retomar a corrida em andamento ----------
export function persist(tr) {
  try { if (tr) localStorage.setItem(KEY, JSON.stringify(tr)); else localStorage.removeItem(KEY); } catch (e) { }
  try { bridge.update?.(tr); } catch (e) { }
}
export function restore() {
  try {
    const tr = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!tr || tr.v !== 1 || !Array.isArray(tr.pts) || tr.pts.length > 40000 || typeof tr.start !== 'number') return null;
    if (!tr.pts.every(p => Array.isArray(p) && p.length === 5 && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Number.isFinite(p[2]))) return null;
    if (!Number.isFinite(tr.dist) || !Number.isFinite(tr.pausedMs)) return null;
    if (Date.now() - tr.start > 8 * 3600e3) { persist(null); return null; } // abandonada
    return tr;
  } catch (e) { return null; }
}
