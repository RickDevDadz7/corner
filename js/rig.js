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
   chin: cabeça desliza pra trás (+) ou pra frente (−), sem inclinar · fL/fR: pé no mundo [x,y,z] · kL/kR: direção do joelho no mundo · tL/tR: direção da ponta do pé no mundo */
export function solve(P) {
  const py = (P.py ?? -40) * D, cy = (P.cy ?? -45) * D, lean = (P.lean ?? 8) * D, tw = (P.tw ?? 0) * D;
  const pel = P.p || [0, 0.92, 0];
  const Fp = fwdY(py), Lp = leftY(py);
  const ext = (P.ext || 0) * D; // ext: coluna curva (extensão torácica, °): a metade de cima inclina pra trás
  const frame = (yaw, ln = lean - ext) => {
    let F = fwdY(yaw), U = [0, 1, 0], L = leftY(yaw);
    F = rot(F, L, ln); U = rot(U, L, ln);
    F = rot(F, U, tw); L = rot(L, U, tw);
    return [F, U, L];
  };
  const [F, U, L] = frame(cy);
  // mãos miram no adversário (ay = direção do golpe), não pra onde o peito aponta
  const [Fa, Ua, La] = frame((P.ay ?? (P.tw ? P.cy ?? 0 : 0)) * D);
  const B = BONES;
  const U0 = ext ? frame(cy, lean)[1] : U, mid = add(pel, mul(U0, B.spine * 0.6));
  const chest = ext ? add(mid, mul(U, B.spine * 0.4)) : add(pel, mul(U, B.spine));
  const J = { pel, chest };
  if (ext) { J.mid = mid; J.midL = add(mid, mul(L, 0.16)); J.midR = add(mid, mul(L, -0.16)); }
  J.hipL = add(pel, mul(Lp, B.hip)); J.hipR = add(pel, mul(Lp, -B.hip));
  const shU = -0.03 + (P.shrug || 0) * 0.07; // shrug: ombros sobem (encolhimento)
  J.shL = add(add(chest, mul(L, B.sh)), mul(U, shU)); J.shR = add(add(chest, mul(L, -B.sh)), mul(U, shU));
  J.neck = add(chest, mul(U, B.neck)); J.head = add(add(J.neck, mul(U, B.head - Math.abs(P.chin || 0) * 0.015)), mul(F, 0.02 - (P.chin || 0) * 0.09)); // chin: + = queixo pra trás (retração), − = cabeça pra frente
  const loc = v => add(chest, add(add(mul(Fa, v[0]), mul(Ua, v[1])), mul(La, v[2])));
  const locDir = v => add(add(mul(Fa, v[0]), mul(Ua, v[1])), mul(La, v[2]));
  for (const s of ['L', 'R']) {
    const sh = J['sh' + s], h = P['w' + s] || loc(P['h' + s]); // w = mão em coordenadas do mundo (barra, banco, chão)
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
let CAM = 30 * D, TILT = 0, ZOOM = 1;
const SCALE = 96, OX = 100, GY = 190;
// câmera: giro em volta do lutador (cam) + inclinação de cima (tilt), pra arcos horizontais aparecerem
function proj(p) {
  const x = p[0] * Math.cos(CAM) + p[2] * Math.sin(CAM);
  const z = -p[0] * Math.sin(CAM) + p[2] * Math.cos(CAM);
  return [OX + x * SCALE * ZOOM, GY + (ZOOM - 1) * 40 - 66 * Math.sin(TILT) - (p[1] * Math.cos(TILT) + z * Math.sin(TILT)) * SCALE * ZOOM, z];
}
const W = { th: 17, sn: 13, ua: 13, fa: 11, foot: 9 };

// missing: membros ausentes ('armL','armR','handL','handR','legL','legR'); prosthesis: perna ausente desenhada como prótese
// parceiro: segundo boneco (short e luvas azuis) com pose própria, girado 180° e a d metros à frente
// partner = { J (já posicionado no mundo, ver placePartner), gloves, front: desenha na frente do principal }
// duas vistas do mesmo quadro lado a lado (ex.: de lado + de cima)
export function dual(a, b) {
  const inner = (s, x) => s.replace('<svg ', `<svg x="${x}" y="0" width="230" height="200" `).replace(' class="fig"', '');
  return `<svg viewBox="0 0 460 200" class="fig dual" role="img" aria-hidden="true">${inner(a, 0)}${inner(b, 230)}<line x1="230" y1="14" x2="230" y2="186" class="sep"/></svg>`;
}
export function placePartner(J2, d = 1.1, dz = 0) { const o = {}; for (const k in J2) { const v = J2[k]; o[k] = [d - v[0], v[1], dz - v[2]]; } return o; }
export function draw(J, { gloves = true, hi = [], trail = null, trail2 = null, burst = null, cam = 30, ox = 0, oy = 0, noshadow = false, act = [], tilt = 0, zoom = 1, target = null, path = null, props = null, missing = null, prosthesis = false, partner = null } = {}) {
  CAM = cam * D; TILT = tilt * D; ZOOM = zoom; NOSH = noshadow;
  const F1 = figParts(J, { gloves, act, missing, prosthesis });
  let p2 = '';
  let F2 = null;
  if (partner?.J) { F2 = figParts(partner.J, { gloves: partner.gloves ?? gloves, act: partner.act || [] }); p2 = `<g class="p2">${F2.shadow}${F2.back}${F2.gBack}${F2.torso}${F2.frontLegs}${F2.trunks}${F2.head}${F2.front}${F2.gFront}</g>`; }
  const { P, zMid } = F1;
  // (corpo montado em figParts)
  let pBack = '', pFront = '';
  // selo fixo no canto (ex.: posição da mão)
  // o selo ganha uma faixa própria em cima do desenho (assim nunca cobre cabeça nem mãos)
  let badge = '';
  const BH = (props || []).some(it => it && it.k === 'badge') ? 46 : 0;
  for (const it of props || []) if (it && it.k === 'badge') badge += badgeSVG(it, -ox, -oy - BH);
  if (props) for (const it of propSVG(props)) { if (it.layer === 'back' || (it.layer !== 'front' && it.z > zMid + 0.02)) pBack += it.svg; else pFront += it.svg; }
  const { back, gBack, torso, frontLegs, trunks, head, front, gFront, shadow } = F1;
  return composeSVG();
  function composeSVG() {
  // alvo: onde o golpe chega (cabeça/corpo do adversário imaginário)
  let tg = '';
  if (target) { const c = proj(target); tg = `<g class="tgt"><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="13"/><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="4"/></g>`; }
  if (path && path.length > 1) { const q = path.map(proj); tg += `<polyline points="${q.map(v => v[0].toFixed(1) + ',' + v[1].toFixed(1)).join(' ')}" class="pth"/>`; const a = q[q.length - 1], b = q[q.length - 2], an = Math.atan2(a[1] - b[1], a[0] - b[0]); tg += `<path d="M${a[0].toFixed(1)},${a[1].toFixed(1)}L${(a[0] - 9 * Math.cos(an - 0.5)).toFixed(1)},${(a[1] - 9 * Math.sin(an - 0.5)).toFixed(1)}L${(a[0] - 9 * Math.cos(an + 0.5)).toFixed(1)},${(a[1] - 9 * Math.sin(an + 0.5)).toFixed(1)}Z" class="pta"/>`; }
  const hl = hi.filter(k => P[k]).map(k => `<circle cx="${P[k][0].toFixed(1)}" cy="${P[k][1].toFixed(1)}" r="15" class="hi"/>`).join('');
  let fx = '';
  if (trail && trail.length > 1) {
    const pts = trail.map(t => proj(t));
    for (let i = 1; i < pts.length; i++) fx += `<line x1="${pts[i - 1][0].toFixed(1)}" y1="${pts[i - 1][1].toFixed(1)}" x2="${pts[i][0].toFixed(1)}" y2="${pts[i][1].toFixed(1)}" stroke-width="${(3 + 9 * i / pts.length).toFixed(1)}" opacity="${(0.08 + 0.4 * i / pts.length).toFixed(2)}" class="trl"/>`;
  }
  if (trail2 && trail2.length > 1) { // rastro do golpe do parceiro (azul)
    const pts = trail2.map(t => proj(t));
    for (let i = 1; i < pts.length; i++) fx += `<line x1="${pts[i - 1][0].toFixed(1)}" y1="${pts[i - 1][1].toFixed(1)}" x2="${pts[i][0].toFixed(1)}" y2="${pts[i][1].toFixed(1)}" stroke-width="${(3 + 9 * i / pts.length).toFixed(1)}" opacity="${(0.1 + 0.45 * i / pts.length).toFixed(2)}" class="trl trl2"/>`;
  }
  if (burst) {
    const c = proj(burst.p), r1 = 9 * burst.s, r2 = 22 * burst.s;
    let d = '';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.2, r = i % 2 ? r1 : r2; d += `${i ? 'L' : 'M'}${(c[0] + Math.cos(a) * r).toFixed(1)},${(c[1] + Math.sin(a) * r).toFixed(1)}`; }
    fx += `<path d="${d}Z" class="bst"/>`;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; fx += `<line x1="${(c[0] + Math.cos(a) * r2 * 1.1).toFixed(1)}" y1="${(c[1] + Math.sin(a) * r2 * 1.1).toFixed(1)}" x2="${(c[0] + Math.cos(a) * r2 * 1.7).toFixed(1)}" y2="${(c[1] + Math.sin(a) * r2 * 1.7).toFixed(1)}" class="bsl"/>`; }
  }
  const pf = partner?.front, me = `${back}${gBack}${torso}${frontLegs}${trunks}${head}${front}${gFront}`;
  // luta agarrada: ordem por camada entre os dois (m = principal, p = parceiro; b = membros de trás, t = tronco,
  // l = pernas da frente + short (n = só as pernas, s = só o short), h = cabeça, f = braços da frente). Ex.: 'mb pb pt pl ph mt ml mh pf mf'
  if (F2 && partner.ord) {
    const part = (F, k) => k === 'b' ? F.back + F.gBack : k === 't' ? F.torso : k === 'l' ? F.frontLegs + F.trunks : k === 'n' ? F.frontLegs : k === 's' ? F.trunks : k === 'h' ? F.head : k === 'f' ? F.front + F.gFront : '';
    const lay = partner.ord.split(/\s+/).map(x => x[0] === 'p' ? `<g class="p2">${part(F2, x[1])}</g>` : part(F1, x[1])).join('');
    return `<svg viewBox="${-ox} ${-oy - BH} 230 ${200 + BH}" class="fig" role="img" aria-hidden="true">
    ${TILT ? '' : `<line x1="${6 - ox - 120}" y1="${GY}" x2="${224 - ox + 120}" y2="${GY}" class="gr"/>`}${shadow}${hl}
    ${pBack}${lay}${pFront}${tg}${fx}${badge}</svg>`;
  }
  return `<svg viewBox="${-ox} ${-oy - BH} 230 ${200 + BH}" class="fig" role="img" aria-hidden="true">
    ${TILT ? '' : `<line x1="${6 - ox - 120}" y1="${GY}" x2="${224 - ox + 120}" y2="${GY}" class="gr"/>`}${shadow}${hl}
    ${pBack}${pf ? '' : p2}${me}${pf ? p2 : ''}${pFront}${tg}${fx}${badge}</svg>`;
  }
}
// monta um boneco (sombra, membros, tronco, short, cabeça, luvas) já projetado
let NOSH = false; // sem sombra (técnicas com pegadas no chão)
function figParts(J, { gloves = true, act = [], missing = null, prosthesis = false } = {}) {
  const miss = new Set(missing || []);
  const P = {}; for (const k in J) P[k] = proj(J[k]);
  const segs = [];
  const seg = (a, b, w, kind, side) => segs.push({ a: P[a], b: P[b], w, kind, side, z: (P[a][2] + P[b][2]) / 2 });
  const stub = (a, b, t) => { const k = a + '_' + b; P[k] = [P[a][0] + (P[b][0] - P[a][0]) * t, P[a][1] + (P[b][1] - P[a][1]) * t, P[a][2] + (P[b][2] - P[a][2]) * t]; return k; };
  for (const s of ['L', 'R']) {
    if (!miss.has('leg' + s)) { seg('hip' + s, 'kn' + s, W.th, 'leg', s); seg('kn' + s, 'an' + s, W.sn, 'leg', s); seg('an' + s, 'to' + s, W.foot, 'foot', s); }
    else if (prosthesis) { seg('hip' + s, 'kn' + s, W.th, 'leg', s); seg('kn' + s, 'an' + s, 5, 'pros', s); seg('an' + s, 'to' + s, W.foot, 'pros', s); }
    else seg('hip' + s, stub('hip' + s, 'kn' + s, 0.45), W.th, 'leg', s);
    if (!miss.has('arm' + s)) { seg('sh' + s, 'el' + s, W.ua, 'arm', s); seg('el' + s, 'ha' + s, W.fa, 'arm', s); }
    else seg('sh' + s, stub('sh' + s, 'el' + s, 0.4), W.ua, 'arm', s);
  }
  // tronco como polígono (mostra a rotação: estreito de lado, largo de frente)
  const torsoZ = (P.shL[2] + P.shR[2] + P.hipL[2] + P.hipR[2]) / 4;
  const zMid = torsoZ;
  const far = x => act.includes('-' + x.kind + x.side) || (x.z > zMid + 0.02 && !act.includes(x.kind + x.side)); // '-armR' = força o membro atrás do corpo
  segs.sort((a, b) => b.z - a.z);
  const line = (s, cls) => {
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const w1 = s.w / 2, w2 = s.w * (s.kind === 'foot' ? 0.45 : 0.36);
    const q = [[s.a[0] + nx * w1, s.a[1] + ny * w1], [s.b[0] + nx * w2, s.b[1] + ny * w2], [s.b[0] - nx * w2, s.b[1] - ny * w2], [s.a[0] - nx * w1, s.a[1] - ny * w1]];
    return `<path d="M${q.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L')}Z" class="${cls}"/><circle cx="${s.a[0].toFixed(1)}" cy="${s.a[1].toFixed(1)}" r="${w1.toFixed(1)}" class="${cls}"/><circle cx="${s.b[0].toFixed(1)}" cy="${s.b[1].toFixed(1)}" r="${w2.toFixed(1)}" class="${cls}"/>`;
  };
  const pt = k => `${P[k][0].toFixed(1)},${P[k][1].toFixed(1)}`;
  const torso = (P.mid ? `<polyline points="${P.neck[0].toFixed(1)},${(P.neck[1] + 6).toFixed(1)} ${pt('mid')} ${P.pel[0].toFixed(1)},${(P.pel[1] - 4).toFixed(1)}" stroke-width="25" class="lf" fill="none" stroke-linejoin="round"/><polygon points="${pt('shL')} ${pt('shR')} ${pt('midR')} ${pt('hipR')} ${pt('hipL')} ${pt('midL')}" class="tor"/>`
    : `<line x1="${P.neck[0].toFixed(1)}" y1="${(P.neck[1] + 6).toFixed(1)}" x2="${P.pel[0].toFixed(1)}" y2="${(P.pel[1] - 4).toFixed(1)}" stroke-width="25" class="lf"/><polygon points="${pt('shL')} ${pt('shR')} ${pt('hipR')} ${pt('hipL')}" class="tor"/>`) + `<line x1="${P.neck[0].toFixed(1)}" y1="${P.neck[1].toFixed(1)}" x2="${P.chest[0].toFixed(1)}" y2="${P.chest[1].toFixed(1)}" stroke-width="9" class="lf"/>`;
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
  // membro inteiro (coxa+canela+pé ou braço+antebraço) ganha um contorno único da cor do papel por baixo:
  // separa do tronco e do outro membro sem marcar as juntas por dentro
  const groups = {};
  for (const s of segs) { const k = (s.kind === 'arm' ? 'arm' : 'leg') + s.side; (groups[k] ||= { k, segs: [], arm: s.kind === 'arm' }).segs.push(s); }
  const gl = Object.values(groups).map(g => ({ ...g, z: g.segs.reduce((a, s) => a + s.z, 0) / g.segs.length })).sort((a, b) => b.z - a.z);
  for (const g of gl) {
    const f = far({ z: g.z, kind: g.arm ? 'arm' : 'leg', side: g.k.slice(-1) });
    const halo = g.segs.map(s => line(s, 'ol')).join(''), body = g.segs.map(s => line(s, s.kind === 'pros' ? 'lp' : f ? 'lb' : 'lf')).join('');
    if (f) back += halo + body; else if (g.arm) front += halo + body; else frontLegs += halo + body;
  }
  const farH = s => act.includes('-arm' + s) || (P['ha' + s][2] > zMid + 0.02 && !act.includes('arm' + s));
  const gL = miss.has('armL') || miss.has('handL') ? '' : glove('L', farH('L')), gR = miss.has('armR') || miss.has('handR') ? '' : glove('R', farH('R'));
  const gBack = (farH('L') ? gL : '') + (farH('R') ? gR : '');
  const gFront = (!farH('L') ? gL : '') + (!farH('R') ? gR : '');
  const sp = proj([J.pel[0], 0, J.pel[2]]);
  const shadow = NOSH ? '' : `<ellipse cx="${sp[0].toFixed(1)}" cy="${(sp[1] + 1).toFixed(1)}" rx="52" ry="${(6 + 30 * Math.sin(TILT)).toFixed(1)}" class="sh"/>`;
  return { P, zMid, back, gBack, torso, frontLegs, trunks, head, front, gFront, shadow };
}

// ---------- equipamentos ----------
const f1 = v => v.toFixed(1);
function propSVG(list) {
  const out = [], S = SCALE * ZOOM;
  const ln = (a, b, w, c, layer) => { const p = proj(a), q = proj(b); out.push({ z: (p[2] + q[2]) / 2, layer, svg: `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(q[0])}" y2="${f1(q[1])}" stroke-width="${w}" class="${c}" stroke-linecap="round"/>` }); };
  const circ = (a, r, c, layer) => { const p = proj(a); out.push({ z: p[2], layer, svg: `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(r)}" class="${c}"/>` }); };
  for (const it of list) {
    if (!it) continue;
    if (it.k === 'line') ln(it.a, it.b, it.w || 6, it.c || 'pr', it.layer);
    else if (it.k === 'band') ln(it.a, it.b, 3, 'bnd', it.layer || 'front');
    else if (it.k === 'bar') { // barra olímpica: atravessa as mãos e passa das duas pontas
      const d = [it.b[0] - it.a[0], it.b[1] - it.a[1], it.b[2] - it.a[2]], l = Math.hypot(...d) || 1, u = d.map(x => x / l), ext = it.ext ?? 0.28;
      const A = it.a.map((v, i) => v - u[i] * ext), B = it.b.map((v, i) => v + u[i] * ext);
      ln(A, B, 4.5, 'prb', it.layer || 'front');
      if (it.plates !== false) for (const E of [A, B]) { const p = E.map((v, i) => v - u[i] * 0.06); circ(p, (it.r || 0.17) * S, 'plt'); circ(p, 3, 'pltc'); }
    } else if (it.k === 'db') { // halter
      const d = it.d || [0, 0, 1], h = 0.09, A = it.p.map((v, i) => v - d[i] * h), B = it.p.map((v, i) => v + d[i] * h);
      ln(A, B, 4, 'prb', it.layer || 'front'); circ(A, 0.06 * S, 'dbb', it.layer || 'front'); circ(B, 0.06 * S, 'dbb', it.layer || 'front');
    } else if (it.k === 'badge') { /* desenhado à parte */ }
    else if (it.k === 'ball') circ(it.p, (it.r || 0.12) * S, it.cls || 'mbl', it.layer || 'front');
    else if (it.k === 'box') { // caixa/banco visto de lado: x1..x2, altura y, profundidade z1..z2
      const z1 = it.z1 ?? -0.25, z2 = it.z2 ?? 0.25, y0 = it.y0 ?? 0;
      const c = [[it.x1, y0, z2], [it.x2, y0, z2], [it.x2, it.y, z2], [it.x1, it.y, z2], [it.x1, it.y, z1], [it.x2, it.y, z1], [it.x2, y0, z1]].map(proj);
      const pts = k => k.map(i => f1(c[i][0]) + ',' + f1(c[i][1])).join(' ');
      out.push({ z: 9, layer: it.layer || 'back', svg: `<polygon points="${pts([0, 1, 2, 3])}" class="bxf"/><polygon points="${pts([3, 2, 5, 4])}" class="bxt"/><polygon points="${pts([1, 6, 5, 2])}" class="bxs"/>` });
    }
  }
  return out;
}

// selo com a posição da mão: palma pra você (supinada), dorso pra você (pronada) ou de lado (neutra)
function badgeSVG(it, x0, y0 = 0) {
  const x = x0 + 4, y = y0 + 4, w = 104, t = String(it.text || '').replace(/[<>&"]/g, '');
  const hand = it.palm ? `<g transform="translate(${x + 16},${y + 20}) rotate(${it.palm === 'neutral' ? -90 : 0})">
    <rect x="-7" y="-2" width="14" height="13" rx="3" class="${it.palm === 'in' ? 'bh-in' : 'bh-out'}"/>
    ${[-6, -2.2, 1.6, 5.4].map(fx => `<rect x="${fx - 1.6}" y="-12" width="3.2" height="11" rx="1.6" class="${it.palm === 'in' ? 'bh-in' : 'bh-out'}"/>`).join('')}
    <rect x="${it.palm === 'in' ? 6 : -10}" y="1" width="4" height="8" rx="2" transform="rotate(${it.palm === 'in' ? -30 : 30} ${it.palm === 'in' ? 8 : -8} 5)" class="${it.palm === 'in' ? 'bh-in' : 'bh-out'}"/>
    ${it.palm === 'in' ? '<path d="M-4 4h8M-4 7h6" class="bh-line"/>' : '<path d="M-5 -1h10" class="bh-line"/>'}</g>` : '';
  return `<g class="badge"><rect x="${x}" y="${y}" width="${w}" height="36" rx="3"/>${hand}<text x="${x + (it.palm ? 31 : 6)}" y="${y + 15}">${t.split('|')[0]}</text><text x="${x + (it.palm ? 31 : 6)}" y="${y + 28}">${t.split('|')[1] || ''}</text></g>`;
}
