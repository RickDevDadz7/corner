// ============================================================
// RONIN — esqueleto 2,5D com cinemática inversa (IK).
// Ossos com comprimento fixo; mãos em coordenadas do tronco, pés no mundo.
// Eixos: X = pra frente (adversário), Y = pra cima, Z = profundidade.
// ============================================================
const D = Math.PI / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => { const l = len(a) || 1; return mul(a, 1 / l); };
function rot(v, k, a) { // Rodrigues
  const c = Math.cos(a), s = Math.sin(a);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}
const fwdY = t => [Math.cos(t), 0, -Math.sin(t)];
const leftY = t => [-Math.sin(t), 0, -Math.cos(t)];

export const BONES = { spine: 0.48, neck: 0.08, head: 0.12, sh: 0.2, hip: 0.12, ua: 0.29, fa: 0.27, th: 0.45, sn: 0.45, foot: 0.13 };

// Dois ossos (IK): raiz, alvo, comprimentos, direção do "polo" (pra onde o cotovelo/joelho aponta)
function ik2(root, target, a, b, poleDir) {
  const d0 = sub(target, root);
  const d = Math.min(len(d0), (a + b) * 0.999), u = norm(d0);
  const cosA = Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d)));
  let v = sub(poleDir, mul(u, dot(poleDir, u)));
  if (len(v) < 1e-6) v = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  v = norm(v);
  const mid = add(root, add(mul(u, a * cosA), mul(v, a * Math.sqrt(1 - cosA * cosA))));
  const end = add(root, mul(u, d));
  return [mid, end];
}

/* Pose:
   p: [x,y,z] pélvis · py: giro do quadril (°) · cy: giro do tronco (°) · lean: inclinação pra frente (°) · tw: rolar no eixo da coluna (°, deitado)
   hL/hR: mão em coords do tronco [frente, cima, lado(+ = esquerda)] · eL/eR: direção do cotovelo nas mesmas coords
   fL/fR: pé no mundo [x,y,z] · kL/kR: direção do joelho no mundo · tL/tR: direção da ponta do pé no mundo */
export function solve(P) {
  const py = (P.py ?? -40) * D, cy = (P.cy ?? -45) * D, lean = (P.lean ?? 8) * D, tw = (P.tw ?? 0) * D;
  const pel = P.p || [0, 0.92, 0];
  const Fp = fwdY(py), Lp = leftY(py);
  const frame = yaw => {
    let F = fwdY(yaw), U = [0, 1, 0], L = leftY(yaw);
    F = rot(F, L, lean); U = rot(U, L, lean);
    F = rot(F, U, tw); L = rot(L, U, tw);
    return [F, U, L];
  };
  const [F, U, L] = frame(cy);
  // mãos miram no adversário (ay = direção do golpe), não pra onde o peito aponta
  const [Fa, Ua, La] = frame((P.ay ?? (P.tw ? P.cy ?? 0 : 0)) * D);
  const B = BONES;
  const chest = add(pel, mul(U, B.spine));
  const J = { pel, chest };
  J.hipL = add(pel, mul(Lp, B.hip)); J.hipR = add(pel, mul(Lp, -B.hip));
  J.shL = add(add(chest, mul(L, B.sh)), mul(U, -0.03)); J.shR = add(add(chest, mul(L, -B.sh)), mul(U, -0.03));
  J.neck = add(chest, mul(U, B.neck)); J.head = add(add(J.neck, mul(U, B.head)), mul(F, 0.02));
  const loc = v => add(chest, add(add(mul(Fa, v[0]), mul(Ua, v[1])), mul(La, v[2])));
  const locDir = v => add(add(mul(Fa, v[0]), mul(Ua, v[1])), mul(La, v[2]));
  for (const s of ['L', 'R']) {
    const sh = J['sh' + s], h = loc(P['h' + s]);
    const pole = locDir(P['e' + s] || [-0.25, -1, s === 'L' ? 0.55 : -0.55]);
    [J['el' + s], J['ha' + s]] = ik2(sh, h, B.ua, B.fa, pole);
    const hip = J['hip' + s], f = P['f' + s];
    const kp = P['k' + s] || add(Fp, mul(Lp, s === 'L' ? 0.25 : -0.25));
    [J['kn' + s], J['an' + s]] = ik2(hip, f, B.th, B.sn, kp);
    const td = norm(P['t' + s] || (s === 'L' ? Fp : rot(Fp, [0, 1, 0], -35 * D)));
    J['to' + s] = add(J['an' + s], mul(td, B.foot));
  }
  return J;
}

// ---------- interpolação ----------
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export function mix(A, B, t) {
  const o = {};
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const a = A[k], b = B[k];
    if (a === undefined || b === undefined) { o[k] = t < 0.5 ? (a ?? b) : (b ?? a); continue; }
    o[k] = Array.isArray(a) ? lerp3(a, b, t) : typeof a === 'number' ? lerp(a, b, t) : (t < 0.5 ? a : b);
  }
  return o;
}
export const EASE = {
  inout: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  snap: t => 1 - Math.pow(1 - t, 4),          // sai rápido (golpe)
  load: t => t * t,                            // carrega devagar
  lin: t => t
};

// ---------- projeção e desenho ----------
let CAM = 30 * D;
const SCALE = 96, OX = 100, GY = 190;
function proj(p) {
  const x = p[0] * Math.cos(CAM) + p[2] * Math.sin(CAM);
  const z = -p[0] * Math.sin(CAM) + p[2] * Math.cos(CAM);
  return [OX + x * SCALE, GY - p[1] * SCALE, z];
}
const W = { th: 17, sn: 13, ua: 13, fa: 11, foot: 9 };

export function draw(J, { gloves = true, hi = [], trail = null, burst = null, cam = 30, ox = 0, act = [] } = {}) {
  CAM = cam * D;
  const P = {}; for (const k in J) P[k] = proj(J[k]);
  const segs = [];
  const seg = (a, b, w, kind, side) => segs.push({ a: P[a], b: P[b], w, kind, side, z: (P[a][2] + P[b][2]) / 2 });
  for (const s of ['L', 'R']) {
    seg('hip' + s, 'kn' + s, W.th, 'leg', s); seg('kn' + s, 'an' + s, W.sn, 'leg', s); seg('an' + s, 'to' + s, W.foot, 'foot', s);
    seg('sh' + s, 'el' + s, W.ua, 'arm', s); seg('el' + s, 'ha' + s, W.fa, 'arm', s);
  }
  // tronco como polígono (mostra a rotação: estreito de lado, largo de frente)
  const torsoZ = (P.shL[2] + P.shR[2] + P.hipL[2] + P.hipR[2]) / 4;
  const zMid = torsoZ;
  const far = x => x.z > zMid + 0.02 && !act.includes(x.kind + x.side);
  segs.sort((a, b) => b.z - a.z);
  const line = (s, cls) => {
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const w1 = s.w / 2, w2 = s.w * (s.kind === 'foot' ? 0.45 : 0.36);
    const q = [[s.a[0] + nx * w1, s.a[1] + ny * w1], [s.b[0] + nx * w2, s.b[1] + ny * w2], [s.b[0] - nx * w2, s.b[1] - ny * w2], [s.a[0] - nx * w1, s.a[1] - ny * w1]];
    return `<path d="M${q.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L')}Z" class="${cls}"/><circle cx="${s.a[0].toFixed(1)}" cy="${s.a[1].toFixed(1)}" r="${w1.toFixed(1)}" class="${cls}"/><circle cx="${s.b[0].toFixed(1)}" cy="${s.b[1].toFixed(1)}" r="${w2.toFixed(1)}" class="${cls}"/>`;
  };
  const pt = k => `${P[k][0].toFixed(1)},${P[k][1].toFixed(1)}`;
  const torso = `<line x1="${P.neck[0].toFixed(1)}" y1="${(P.neck[1] + 6).toFixed(1)}" x2="${P.pel[0].toFixed(1)}" y2="${(P.pel[1] - 4).toFixed(1)}" stroke-width="25" class="lf"/><polygon points="${pt('shL')} ${pt('shR')} ${pt('hipR')} ${pt('hipL')}" class="tor"/><line x1="${P.neck[0].toFixed(1)}" y1="${P.neck[1].toFixed(1)}" x2="${P.chest[0].toFixed(1)}" y2="${P.chest[1].toFixed(1)}" stroke-width="9" class="lf"/>`;
  const mid = (a, b, t) => [P[a][0] + (P[b][0] - P[a][0]) * t, P[a][1] + (P[b][1] - P[a][1]) * t];
  const tL = mid('hipL', 'knL', 0.42), tR = mid('hipR', 'knR', 0.42);
  const waistL = mid('hipL', 'shL', 0.12), waistR = mid('hipR', 'shR', 0.12);
  const f2 = p => p[0].toFixed(1) + ',' + p[1].toFixed(1);
  const L2 = (p, q, w, c) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke-width="${w}" class="${c}" stroke-linecap="round"/>`;
  const hl_ = P.hipL, hr_ = P.hipR;
  const trunks = L2(hl_, tL, 24, 'tko') + L2(hr_, tR, 24, 'tko') + L2(hl_, hr_, 24, 'tko') + L2(hl_, tL, 19, 'tkf') + L2(hr_, tR, 19, 'tkf') + L2(hl_, hr_, 19, 'tkf') + L2(waistL, waistR, 4, 'blt');
  const head = `<circle cx="${P.head[0].toFixed(1)}" cy="${P.head[1].toFixed(1)}" r="14" class="hd"/>`;
  const glove = (s, isFar) => gloves ? `<circle cx="${P['ha' + s][0].toFixed(1)}" cy="${P['ha' + s][1].toFixed(1)}" r="10.5" class="${isFar ? 'gb' : 'gf'}"/>` : `<circle cx="${P['ha' + s][0].toFixed(1)}" cy="${P['ha' + s][1].toFixed(1)}" r="4.5" class="${isFar ? 'hb' : 'hf'}"/>`;
  let back = '', frontLegs = '', front = '';
  for (const s of segs) { const f = far(s); const h = line(s, f ? 'lb' : 'lf'); if (f) back += h; else if (s.kind === 'arm') front += h; else frontLegs += h; }
  const farH = s => P['ha' + s][2] > zMid + 0.02 && !act.includes('arm' + s);
  const gL = glove('L', farH('L')), gR = glove('R', farH('R'));
  const gBack = (farH('L') ? gL : '') + (farH('R') ? gR : '');
  const gFront = (!farH('L') ? gL : '') + (!farH('R') ? gR : '');
  const shadow = `<ellipse cx="${proj([J.pel[0], 0, J.pel[2]])[0].toFixed(1)}" cy="${GY + 1}" rx="52" ry="6" class="sh"/>`;
  const hl = hi.filter(k => P[k]).map(k => `<circle cx="${P[k][0].toFixed(1)}" cy="${P[k][1].toFixed(1)}" r="15" class="hi"/>`).join('');
  let fx = '';
  if (trail && trail.length > 1) {
    const pts = trail.map(t => proj(t));
    for (let i = 1; i < pts.length; i++) fx += `<line x1="${pts[i - 1][0].toFixed(1)}" y1="${pts[i - 1][1].toFixed(1)}" x2="${pts[i][0].toFixed(1)}" y2="${pts[i][1].toFixed(1)}" stroke-width="${(3 + 9 * i / pts.length).toFixed(1)}" opacity="${(0.08 + 0.4 * i / pts.length).toFixed(2)}" class="trl"/>`;
  }
  if (burst) {
    const c = proj(burst.p), r1 = 9 * burst.s, r2 = 22 * burst.s;
    let d = '';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.2, r = i % 2 ? r1 : r2; d += `${i ? 'L' : 'M'}${(c[0] + Math.cos(a) * r).toFixed(1)},${(c[1] + Math.sin(a) * r).toFixed(1)}`; }
    fx += `<path d="${d}Z" class="bst"/>`;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; fx += `<line x1="${(c[0] + Math.cos(a) * r2 * 1.1).toFixed(1)}" y1="${(c[1] + Math.sin(a) * r2 * 1.1).toFixed(1)}" x2="${(c[0] + Math.cos(a) * r2 * 1.7).toFixed(1)}" y2="${(c[1] + Math.sin(a) * r2 * 1.7).toFixed(1)}" class="bsl"/>`; }
  }
  return `<svg viewBox="${-ox} 0 230 200" class="fig" role="img" aria-hidden="true">
    <line x1="${6 - ox}" y1="${GY}" x2="${224 - ox}" y2="${GY}" class="gr"/>${shadow}${hl}
    ${back}${gBack}${torso}${frontLegs}${trunks}${head}${front}${gFront}${fx}</svg>`;
}
