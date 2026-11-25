// ============================================================
// RONIN — biblioteca de técnicas animadas (esqueleto com IK, traço próprio)
// Guarda ortodoxa: L = lado da frente (esquerdo), R = lado de trás (direito).
// ============================================================
import { solve, mix, draw, dual, EASE, placePartner } from './rig.js';

const D = Math.PI / 180;
// Guarda base
const G = { p: [0, 0.86, 0], py: -40, cy: -45, lean: 12, hL: [0.26, 0.17, 0.04], hR: [0.14, 0.21, -0.12], fL: [0.38, 0, -0.12], fR: [-0.3, 0, 0.12] };
const P = (o, from = G) => ({ ...from, ...o });
// quadro: pose, duração (ms), passo, opções { e: curva, fx: articulação com rastro, hit: estouro, hi: destaques }
const F = (p, d, step, o = {}) => ({ p, d, step, e: o.e || 'inout', fx: o.fx || null, pfx: o.pfx || null, hit: !!o.hit, hi: o.hi || [], q: o.q || null });

// ---------- Boxe: socos ----------
const JAB = P({ p: [0.05, 0.86, 0], cy: -60, lean: 15, hL: [0.85, 0.19, -0.03] });
const CROSS_LOAD = P({ p: [-0.02, 0.85, 0], cy: -52 });
const CROSS = P({ p: [0.08, 0.86, 0], py: -2, cy: 12, lean: 16, hR: [0.88, 0.18, 0], hL: [0.18, 0.22, 0.08], fR: [-0.27, 0.04, 0.1], tR: [0.75, -0.35, 0.55] });
const HOOK_LOAD = P({ cy: -62, py: -50, lean: 14, p: [0.02, 0.84, -0.02], hL: [0.22, 0.16, 0.12], fL: [0.38, 0, -0.12], tL: [0.5, 0, -0.86] });
const HOOK_MID = P({ cy: -30, py: -30, lean: 13, p: [0.04, 0.84, 0], hL: [0.3, 0.22, 0.5], eL: [-0.3, 0.3, 1], tL: [0.7, 0, -0.3] });
const HOOK = P({ cy: 10, py: -4, lean: 13, p: [0.07, 0.84, 0], hL: [0.48, 0.21, -0.02], eL: [-0.1, 0.4, 1], hR: [0.16, 0.22, -0.06], tL: [0.8, 0, 0.6] });
const UP5_DIP = P({ p: [0.03, 0.72, 0], lean: 22, cy: -60, py: -50, hL: [0.18, -0.28, 0.1], eL: [-0.6, -1, 0.3] });
const UP5 = P({ p: [0.07, 0.9, 0], cy: -20, py: -22, lean: 6, hL: [0.44, 0.2, 0.0], eL: [0.1, -1, 0.15], hR: [0.16, 0.24, -0.1] });
const BODYJAB = P({ p: [0.1, 0.72, 0], lean: 22, cy: -62, hL: [0.85, 0.05, -0.02], hR: [0.18, 0.24, -0.08] });
const OVER_MID = P({ p: [0.03, 0.82, 0], cy: -10, lean: 18, hR: [0.3, 0.45, -0.25], eR: [-0.2, 1, -0.6] });
const OVER = P({ p: [0.1, 0.78, 0], cy: 20, py: 0, lean: 30, hR: [0.78, 0.05, 0.03], eR: [0, 1, -0.4], fR: [-0.27, 0.05, 0.1], tR: [0.8, -0.35, 0.5] });

// ---------- Boxe: defesa ----------
const BLOCK = P({ lean: 18, p: [0, 0.83, 0], hL: [0.2, 0.33, 0.08], hR: [0.17, 0.34, -0.08], eL: [0.3, -1, 0.1], eR: [0.3, -1, -0.1] });
const PARRY = P({ hR: [0.34, 0.2, 0.12], eR: [0, -1, -0.3], cy: -40 });
const SLIP_OUT = P({ p: [0.05, 0.8, 0.1], cy: -25, lean: 22 });
const SLIP_IN = P({ p: [0.05, 0.8, -0.1], cy: -62, lean: 22 });
const BOB1 = P({ p: [0.03, 0.72, 0.1], lean: 28, cy: -35 });
const BOB2 = P({ p: [0.06, 0.66, 0], lean: 30, cy: -45 });
const BOB3 = P({ p: [0.04, 0.78, -0.1], lean: 22, cy: -58 });
const PULL = P({ p: [-0.1, 0.84, 0.02], lean: -6, cy: -40, fL: [0.38, 0, -0.12] });
function pivot(deg) {
  const a = deg * D, lead = G.fL, r = [G.fR[0] - lead[0], G.fR[2] - lead[2]];
  const rr = [r[0] * Math.cos(a) + r[1] * Math.sin(a), -r[0] * Math.sin(a) + r[1] * Math.cos(a)];
  const pr = [G.p[0] - lead[0], G.p[2] - lead[2]], pp = [pr[0] * Math.cos(a) + pr[1] * Math.sin(a), -pr[0] * Math.sin(a) + pr[1] * Math.cos(a)];
  return P({ fR: [lead[0] + rr[0], 0, lead[2] + rr[1]], p: [lead[0] + pp[0], 0.86, lead[2] + pp[1]], py: G.py + deg, cy: G.cy + deg, ay: deg, tL: [Math.cos((deg - 20) * D), 0, -Math.sin((deg - 20) * D)] });
}

// ---------- Muay thai ----------
const KICK_STEP = P({ p: [0.12, 0.86, -0.08], py: -15, fL: [0.48, 0, -0.3], tL: [0.45, 0, -0.9] });
const KICK_CH = P({ p: [0.14, 0.9, -0.12], py: 35, cy: 15, lean: -8, fL: [0.48, 0, -0.3], tL: [0.3, 0, -1], fR: [0.12, 0.55, 0.12], kR: [0.5, 0.9, -0.4], tR: [0.6, -0.6, -0.5], hR: [-0.05, -0.3, -0.22], eR: [-1, 0, -0.3], hL: [0.18, 0.26, 0.14] });
const KICK = P({ p: [0.15, 0.92, -0.15], py: 72, cy: 40, lean: -28, fL: [0.48, 0, -0.3], tL: [0.1, 0, -1], fR: [1.12, 1.18, -0.38], kR: [0, 1, 0], tR: [0.6, 0.1, -0.8], hR: [-0.25, -0.38, -0.25], eR: [-1, 0, -0.2], hL: [0.18, 0.28, 0.16] });
const LOWKICK = P({ p: [0.14, 0.86, -0.12], py: 62, cy: 32, lean: -14, fL: [0.48, 0, -0.3], tL: [0.15, 0, -1], fR: [1.0, 0.34, -0.36], kR: [0.2, 1, -0.2], tR: [0.6, -0.3, -0.75], hR: [-0.2, -0.35, -0.25], eR: [-1, 0, -0.2], hL: [0.18, 0.28, 0.14] });
const SWITCH = P({ p: [-0.02, 0.88, 0.04], fL: [0.05, 0, -0.14], fR: [0.08, 0, 0.16], cy: -40 });
const SW_CH = P({ p: [0.02, 0.9, 0.12], py: -110, cy: -95, lean: -8, fR: [0.08, 0, 0.16], tR: [0.3, 0, 1], fL: [0.12, 0.55, -0.12], kL: [0.5, 0.9, 0.4], tL: [0.6, -0.6, 0.5], hL: [-0.05, -0.3, 0.22], eL: [-1, 0, 0.3], hR: [0.18, 0.26, -0.14] });
const SW_KICK = P({ p: [0.04, 0.92, 0.15], py: -140, cy: -120, lean: -26, fR: [0.08, 0, 0.16], tR: [0.1, 0, 1], fL: [1.06, 1.12, 0.42], kL: [0, 1, 0], tL: [0.6, 0.1, 0.8], hL: [-0.25, -0.38, 0.25], eL: [-1, 0, 0.2], hR: [0.18, 0.28, -0.16] });
const TEEP_CH = P({ p: [-0.02, 0.9, 0], lean: 2, fL: [0.26, 0.55, -0.1], kL: [1, 1, 0], tL: [1, 0.2, 0] });
const TEEP = P({ p: [-0.06, 0.92, 0], py: -25, lean: -20, cy: -40, fL: [0.86, 0.78, -0.08], kL: [0, 1, 0], tL: [0.25, 1, 0], hL: [0.2, 0.24, 0.08] });
const CLINCH = P({ p: [0.06, 0.88, 0], lean: 4, hL: [0.46, 0.14, 0.06], hR: [0.46, 0.14, -0.06], eL: [0, -0.4, 1], eR: [0, -0.4, -1] });
const KNEE = P({ p: [0.14, 0.92, 0.02], py: 8, cy: -10, lean: -14, hL: [0.44, -0.02, 0.06], hR: [0.44, -0.02, -0.06], eL: [0, -0.4, 1], eR: [0, -0.4, -1], fR: [0.12, 0.42, 0.04], kR: [1, 0.7, 0], tR: [0.2, -1, 0] });
const KNEE_D_MID = P({ p: [0.1, 0.9, 0.02], py: 10, cy: -5, lean: -8, hL: [0.44, -0.02, 0.08], hR: [0.44, -0.02, -0.04], eL: [0, -0.4, 1], eR: [0, -0.4, -1], fR: [-0.05, 0.42, 0.42], kR: [0.2, 0.5, 1], tR: [0.2, -1, 0] });
const KNEE_D = P({ p: [0.12, 0.92, 0.04], py: 35, cy: 10, lean: -12, hL: [0.44, -0.02, 0.1], hR: [0.44, -0.02, -0.02], eL: [0, -0.4, 1], eR: [0, -0.4, -1], fR: [0.15, 0.4, 0.2], kR: [0.8, 0.6, -0.6], tR: [0.2, -1, 0] });
const ELBOW_MID = P({ p: [0.04, 0.85, 0], cy: -15, py: -18, lean: 14, hR: [0.12, 0.3, -0.12], eR: [0.1, 0.25, -1], fR: [-0.27, 0.04, 0.1], tR: [0.8, -0.3, 0.5] });
const ELBOW = P({ p: [0.07, 0.85, 0], py: 0, cy: 28, lean: 14, hR: [0.14, 0.27, 0.16], eR: [1, 0.25, -0.15], fR: [-0.27, 0.05, 0.1], tR: [0.8, -0.35, 0.5] });
const ELBOW_UP_DIP = P({ p: [0.02, 0.74, 0], lean: 20, cy: -42, hR: [0.1, 0.05, -0.14], eR: [0, -1, -0.2] });
const ELBOW_UP = P({ p: [0.12, 0.92, 0], cy: 10, lean: 14, hR: [0.02, 0.42, -0.04], eR: [1, 0.15, 0], hL: [0.18, 0.24, 0.1], fR: [-0.27, 0.05, 0.1], tR: [0.8, -0.35, 0.5] });
const CHECK = P({ p: [-0.02, 0.88, 0.02], lean: 10, fL: [0.3, 0.36, -0.22], kL: [0.6, 0.6, -0.8], tL: [0.8, 0.2, -0.3], hL: [0.2, 0.3, 0.08], hR: [0.16, 0.32, -0.08] });

// ---------- MMA / quedas ----------
const LEVEL = P({ p: [0.06, 0.62, 0], lean: 32, cy: -40, hL: [0.35, -0.02, 0.1], hR: [0.3, 0.0, -0.1], fL: [0.42, 0, -0.12] });
const SHOT = P({ p: [0.42, 0.48, 0], py: -25, cy: -20, lean: 40, fL: [0.22, 0, -0.1], kL: [1, -0.6, 0], tL: [0.2, -0.2, 0], fR: [-0.48, 0, 0.14], hL: [0.6, -0.38, 0.2], hR: [0.6, -0.38, -0.2], eL: [0, -0.5, 1], eR: [0, -0.5, -1] });
const DRIVE = P({ p: [0.7, 0.62, 0], py: -10, cy: -5, lean: 32, fL: [0.6, 0, -0.12], fR: [0.05, 0, 0.16], hL: [0.5, -0.42, 0.14], hR: [0.5, -0.42, -0.14], eL: [0, -0.5, 1], eR: [0, -0.5, -1] });
const SPRAWL = P({ p: [-0.5, 0.24, 0], py: 0, cy: 0, lean: 74, fL: [-1.1, 0, -0.2], fR: [-1.1, 0, 0.2], kL: [0, -1, 0], kR: [0, -1, 0], tL: [0, -1, 0], tR: [0, -1, 0], hL: [0.42, -0.62, 0.22], hR: [0.42, -0.62, -0.22] });
const SPRAWL_UP = P({ p: [-0.3, 0.62, 0], lean: 30, fL: [0.0, 0, -0.15], fR: [-0.65, 0, 0.15] });

// ---------- Chão (deitado de costas, pés pra frente) ----------
const LIE = { p: [0.1, 0.12, 0], py: 0, cy: 0, ay: 0, lean: -94, hL: [0.28, -0.12, 0.14], hR: [0.28, -0.12, -0.14], eL: [-1, 0, 1], eR: [-1, 0, -1], fL: [0.5, 0, -0.16], fR: [0.5, 0, 0.16], kL: [0, 1, 0], kR: [0, 1, 0], tL: [1, 0, 0], tR: [1, 0, 0] };
const BRIDGE = P({ p: [0.12, 0.42, 0], lean: -122, hL: [0.1, 0.12, 0.25], hR: [0.1, 0.12, -0.25] }, LIE);
const SHRIMP1 = P({ p: [0.1, 0.2, 0.02], lean: -100, tw: 60, ay: 0, fL: [0.42, 0, -0.18], fR: [0.55, 0, 0.12] }, LIE);
const SHRIMP2 = P({ p: [-0.22, 0.16, 0.02], lean: -96, tw: 70, ay: 0, hL: [0.15, -0.42, 0.1], hR: [0.2, -0.4, 0.02], fL: [0.35, 0, -0.16], fR: [0.32, 0.08, 0.14], kR: [1, 0.4, 0] }, LIE);
const SIT = { p: [0, 0.12, 0], py: -10, cy: -20, ay: 0, lean: -28, hL: [0.3, 0.2, 0.08], hR: [-0.3, -0.42, -0.25], eR: [-1, 0, 0], fL: [0.5, 0, -0.14], kL: [0, 1, 0], fR: [0.15, 0, 0.22], kR: [0.3, 0.2, 1], tR: [1, 0, 0] };
const STAND1 = { ...SIT, p: [-0.12, 0.42, 0.06], lean: 12, cy: -40, fR: [-0.28, 0, 0.2], kR: [0, -0.5, 1] };
const STAND2 = P({ p: [-0.3, 0.86, 0], fL: [0.1, 0, -0.12], fR: [-0.55, 0, 0.12] });

// ---------- Jiu-jitsu: guarda, passagem, raspagem, finalização ----------
// upa: prende o braço, ponte por cima do ombro e rola
const UPA_TRAP = P({ hL: [0.12, 0.05, -0.05], hR: [0.16, 0.0, -0.18], eL: [-1, 0, 1], eR: [-1, 0, -0.5], fL: [0.42, 0, -0.2], fR: [0.42, 0, 0.2] }, LIE);
const UPA_UP = P({ p: [0.12, 0.44, 0.02], lean: -122, tw: 0, hL: [0.12, 0.05, -0.05], hR: [0.16, 0.0, -0.18], fL: [0.42, 0, -0.2], fR: [0.42, 0, 0.2] }, LIE);
// base de combate (postura dentro da guarda): de joelhos, sobe o pé da frente, coluna reta
const KNEEL = { p: [0, 0.5, 0], py: 0, cy: 0, ay: 0, lean: 25, hL: [0.38, -0.3, 0.15], hR: [0.38, -0.3, -0.15], eL: [-0.4, -1, 0.5], eR: [-0.4, -1, -0.5], fL: [-0.42, 0, -0.14], fR: [-0.42, 0, 0.14], kL: [1, -1, 0], kR: [1, -1, 0], tL: [-1, -0.2, 0], tR: [-1, -0.2, 0] };
const CBASE = { ...KNEEL, p: [0, 0.54, 0], lean: 6, py: -20, cy: -15, fL: [0.36, 0, -0.2], kL: [1, 0.6, 0], tL: [1, 0, -0.2], hL: [0.3, -0.3, 0.16], hR: [0.3, -0.3, -0.16] };
const CBASE_P = { ...CBASE, p: [0.02, 0.56, 0], lean: -2, hL: [0.22, -0.4, 0.2], hR: [0.22, -0.4, -0.2], eL: [-0.2, -1, 1], eR: [-0.2, -1, -1] };
// passagem toreando: agacha e segura as calças na altura do joelho (resto em "Chão em dupla")
const TOR0 = { p: [0, 0.7, 0], py: 0, cy: 0, ay: 0, lean: 32, hL: [0.5, -0.32, 0.18], hR: [0.5, -0.32, -0.18], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6], fL: [0.12, 0, -0.26], fR: [-0.2, 0, 0.26], tL: [1, 0, -0.3], tR: [1, 0, 0.3] };

// ---------- Karatê (kamae de kumite: mais de lado, mão da frente estendida, base longa) ----------
const KA = { p: [0, 0.82, 0], py: -62, cy: -64, lean: 4, hL: [0.4, 0.12, 0.02], hR: [0.16, 0.1, -0.06], eL: [-0.2, -1, 0.4], eR: [-0.2, -1, -0.5], fL: [0.5, 0, -0.1], fR: [-0.44, 0, 0.14], tL: [0.9, 0, -0.3], tR: [0.4, 0, 0.9] };
const KP = o => ({ ...KA, ...o });
const KIZ_SL = KP({ p: [0.22, 0.8, 0], fL: [0.78, 0, -0.1], fR: [-0.22, 0, 0.14] });
const KIZ = KP({ p: [0.24, 0.8, 0], cy: -68, lean: 8, fL: [0.78, 0, -0.1], fR: [-0.2, 0, 0.14], hL: [0.92, 0.2, -0.04], hR: [0.14, 0.1, -0.08] });
const GYA_L = KP({ p: [0.06, 0.78, 0], cy: -66, hR: [0.08, -0.12, -0.12] });
const GYA = KP({ p: [0.14, 0.78, 0], py: -8, cy: 8, lean: 10, fR: [-0.4, 0.03, 0.14], tR: [0.8, -0.3, 0.5], hR: [0.92, 0.06, 0.0], hL: [0.0, -0.2, 0.16], eL: [-1, -0.3, 0.3] });
const MAE_CH = KP({ p: [0.04, 0.86, 0], py: -20, cy: -30, lean: 0, fR: [0.18, 0.58, 0.06], kR: [1, 0.8, 0], tR: [0.6, -0.8, 0] });
const MAE = KP({ p: [0.02, 0.88, 0], py: -15, cy: -25, lean: -12, fR: [0.92, 0.82, 0.04], kR: [0, 1, 0], tR: [0.3, 1, 0] });
const MAW_CH = KP({ p: [0.06, 0.88, -0.06], py: 20, cy: 0, lean: -10, fL: [0.5, 0, -0.1], tL: [0.4, 0, -0.9], fR: [0.25, 0.85, -0.25], kR: [0.6, 0.8, -0.6], tR: [0.6, -0.4, -0.6], hR: [0.12, 0.12, -0.2] });
const MAW = KP({ p: [0.08, 0.9, -0.1], py: 78, cy: 45, lean: -34, fL: [0.5, 0, -0.1], tL: [0.05, 0, -1], fR: [0.98, 1.5, -0.32], kR: [0, 1, 0], tR: [0.5, -0.2, -0.85], hR: [0.12, 0.14, -0.2], hL: [0.22, 0.24, 0.16] });
const YOK_CH = KP({ p: [-0.02, 0.86, 0.02], py: -88, cy: -85, lean: -8, fR: [-0.3, 0, 0.12], fL: [0.2, 0.58, -0.04], kL: [0.6, 0.7, -0.7], tL: [0.3, -0.9, 0] });
const YOK = KP({ p: [-0.08, 0.86, 0.04], py: -92, cy: -90, lean: -30, fR: [-0.3, 0, 0.12], fL: [0.92, 0.86, -0.08], kL: [0, 1, 0], tL: [0, -1, 0.3], hL: [0.2, 0.18, 0.1] });
const AGE0 = KP({ hL: [0.1, -0.08, 0.1], hR: [0.42, 0.24, 0.0] });
const AGE = KP({ p: [0.04, 0.8, 0], cy: -15, hL: [0.17, 0.34, -0.05], eL: [0.2, -0.2, 1], hR: [0.02, -0.25, -0.2], eR: [-1, -1, -0.2] });
const GED0 = KP({ hL: [0.16, 0.3, -0.18], eL: [0, -1, 0.6], hR: [0.3, -0.1, -0.04] });
const GED = KP({ lean: 8, hL: [0.5, -0.42, -0.04], eL: [0, -0.2, 1], hR: [0.02, -0.18, -0.16], eR: [-1, -0.3, -0.3] });
const TS_F1 = KP({ p: [0.12, 0.82, 0], fL: [0.8, 0, -0.1] });
const TS_F2 = KP({ p: [0.3, 0.82, 0], fL: [0.8, 0, -0.1], fR: [-0.14, 0, 0.14] });
const TS_B1 = KP({ p: [0.18, 0.82, 0], fL: [0.8, 0, -0.1], fR: [-0.44, 0, 0.14] });
// ---------- Boxe: gancho no corpo e passos ----------
const BHOOK_LOAD = P({ p: [0.04, 0.72, 0], lean: 20, cy: -62, py: -48, hL: [0.24, 0.02, 0.12], fL: [0.38, 0, -0.12], tL: [0.5, 0, -0.86] });
const BHOOK = P({ p: [0.08, 0.72, 0], lean: 20, cy: 8, py: -6, hL: [0.4, -0.16, 0.16], eL: [-0.1, 0.1, 1], hR: [0.16, 0.24, -0.06], tL: [0.8, 0, 0.6] });
const STEP_F1 = P({ p: [0.12, 0.86, 0], fL: [0.62, 0, -0.12] });
const STEP_F2 = P({ p: [0.24, 0.86, 0], fL: [0.62, 0, -0.12], fR: [-0.06, 0, 0.12] });
const STEP_L1 = P({ p: [0.24, 0.86, -0.12], fL: [0.62, 0, -0.36], fR: [-0.06, 0, 0.12] });
const STEP_L2 = P({ p: [0.24, 0.86, -0.24], fL: [0.62, 0, -0.36], fR: [-0.06, 0, -0.12] });
// ---------- Muay thai: chute alto e entrada no clinch ----------
const HKICK = P({ p: [0.15, 0.93, -0.15], py: 76, cy: 44, lean: -38, fL: [0.48, 0, -0.3], tL: [0.08, 0, -1], fR: [1.0, 1.55, -0.38], kR: [0, 1, 0], tR: [0.55, 0.1, -0.8], hR: [-0.25, -0.38, -0.25], eR: [-1, 0, -0.2], hL: [0.18, 0.3, 0.16] });
const CL_REACH = P({ p: [0.1, 0.87, 0], lean: 10, hL: [0.6, 0.3, 0.0], hR: [0.6, 0.3, -0.06], eL: [0, 0.3, 1], eR: [0, 0.3, -1] });
const CL_PULL = P({ p: [0.12, 0.88, 0], lean: 2, hL: [0.4, 0.02, 0.04], hR: [0.4, 0.02, -0.04], eL: [0, -0.3, 1], eR: [0, -0.3, -1] });
// ---------- Jiu-jitsu / quedas: single leg ----------
const SL_SHOT = P({ p: [0.38, 0.5, 0], py: -30, cy: -25, lean: 42, fL: [0.25, 0, -0.1], kL: [1, -0.5, 0], fR: [-0.5, 0, 0.14], hL: [0.62, -0.45, 0.02], hR: [0.56, -0.5, -0.12], eL: [0, -0.4, 1], eR: [0, -0.4, -1] });
const SL_KNEE = P({ p: [0.44, 0.38, 0.04], py: -30, cy: -15, lean: 30, fL: [0.42, 0, -0.14], kL: [1, 0.3, 0], fR: [0.1, 0.06, 0.16], kR: [0, -1, 0], tR: [-1, -0.2, 0], hL: [0.42, -0.25, 0.04], hR: [0.42, -0.25, -0.12] });
const SL_UP = P({ p: [0.46, 0.82, 0], py: -20, cy: -20, lean: 18, fL: [0.6, 0, -0.14], fR: [0.06, 0, 0.16], hL: [0.34, -0.12, 0.08], hR: [0.34, -0.12, -0.1], eL: [0, -0.4, 1], eR: [0, -0.4, -1] });

// ============================================================
// Técnicas em dupla (v3.32): o parceiro (short azul) ataca, é derrubado ou recebe o golpe.
// Cada entrada: opções do parceiro + pose dele em cada quadro da técnica (null = mantém a anterior).
// Poses do parceiro na mesma convenção (olhando pra +X); placePartner gira 180° e põe a _d metros.
// ============================================================
const Q = (pose, o = {}) => ({ ...pose, ...o });
const PDOWN = P({ p: [0.06, 0.8, 0], lean: 36, hL: [0.24, 0.02, 0.12], hR: [0.24, 0.02, -0.12] });
const PKNEED = P({ p: [0.02, 0.84, 0], lean: 42, hL: [0.2, -0.05, 0.14], hR: [0.2, -0.05, -0.14] });
const PHIT = P({ p: [-0.06, 0.86, 0], lean: -6, cy: -30 });
const PFLAT = P({ p: [-0.05, 0.36, 0], py: 0, cy: 0, lean: 70, fL: [-0.75, 0, -0.18], fR: [-0.75, 0, 0.18], kL: [0, -1, 0], kR: [0, -1, 0], tL: [0, -1, 0], tR: [0, -1, 0], hL: [0.42, -0.5, 0.2], hR: [0.42, -0.5, -0.2] });
const PKNEEL = P({ p: [-0.1, 0.5, 0], py: 0, cy: 0, lean: 25, fL: [-0.5, 0, -0.14], fR: [-0.5, 0, 0.14], kL: [0, -1, 0], kR: [0, -1, 0], tL: [-1, 0, 0], tR: [-1, 0, 0], hL: [0.3, -0.1, 0.14], hR: [0.3, -0.1, -0.14] });
const PGRAB = P({ p: [-0.04, 0.86, 0], lean: -10, cy: -35, hL: [0.3, 0.1, 0.18], hR: [0.3, 0.1, -0.2] });
const PFALL = P({ p: [-0.28, 0.5, 0], py: 0, cy: 0, lean: -55, fL: [0.25, 0.3, -0.14], fR: [0.15, 0.2, 0.14], kL: [0, 1, 0], kR: [0, 1, 0], hL: [-0.1, -0.3, 0.3], hR: [-0.1, -0.3, -0.3] });
const PDOWNB = P({ ...LIE, p: [-0.35, 0.12, 0], hL: [0.2, 0.1, 0.25], hR: [0.2, 0.1, -0.25] }, LIE);
const PSL1 = P({ p: [-0.02, 0.88, 0], lean: -4, fL: [0.32, 0.34, -0.12], kL: [1, 0.4, 0], tL: [1, -0.4, 0], hL: [0.3, 0.16, 0.22], hR: [0.26, 0.12, -0.2] });
const PSL2 = P({ ...PSL1, p: [-0.12, 0.86, 0.04], lean: -16, fR: [-0.36, 0, 0.18], hL: [0.1, 0.2, 0.4], hR: [0.1, 0.1, -0.36] });
const PBKICK = P({ p: [0.15, 0.9, -0.15], py: 70, cy: 38, lean: -22, fL: [0.48, 0, -0.3], tL: [0.1, 0, -1], fR: [1.08, 0.95, -0.36], kR: [0, 1, 0], tR: [0.6, 0, -0.8], hR: [-0.25, -0.38, -0.25], eR: [-1, 0, -0.2], hL: [0.18, 0.28, 0.16] });
const PCAUGHT = P({ ...PBKICK, p: [0.1, 0.88, -0.12], lean: -18, hL: [0.2, 0.25, 0.25], fR: [1.0, 0.92, -0.3] });
const PSHOOT = P({ ...SHOT, _d: 1.05 });
// agarrar o chute (muay thai): braço da frente prende a perna e o direto sai na hora
const CATCH = P({ p: [0.06, 0.84, 0], lean: 12, cy: -40, hL: [0.36, -0.12, 0.06], eL: [0, -1, 0.6], hR: [0.16, 0.24, -0.1] });
const CATCH_X = P({ ...CROSS, p: [0.2, 0.84, 0], hL: [0.3, -0.12, 0.06], eL: [0, -1, 0.6] });
// contra no tempo (karatê): ele entra, você chega antes com o gyaku
const DEAI = KP({ p: [0.1, 0.78, 0], py: -8, cy: 8, lean: 12, fR: [-0.4, 0.03, 0.14], tR: [0.8, -0.3, 0.5], hR: [0.92, 0.12, 0.0], hL: [0.0, -0.2, 0.16], eL: [-1, -0.3, 0.3] });

// <chao-duo>
// ============================================================
// Chão em dupla (v3.33): o jiu com o parceiro (short azul).
// PW(d, ponto do mundo) → o mesmo ponto nas coords do parceiro posto a d metros (mão/pé dele encosta em você).
// SAME(q): parceiro olhando pro mesmo lado que você (pose escrita direto no mundo; o d soma no x).
// Mãos com w (mundo) quando encostam no outro; lado de perto da câmera = −z.
// ============================================================
const PW = (d, v) => [+(d - v[0]).toFixed(3), v[1], -v[2]];
const flipV = v => v && [-v[0], v[1], -v[2]];
const SAME = q => { const o = { ...q, p: flipV(q.p), py: (q.py ?? -40) + 180, cy: (q.cy ?? -45) + 180 }; for (const k of ['fL', 'fR', 'kL', 'kR', 'tL', 'tR', 'wL', 'wR']) if (q[k]) o[k] = flipV(q[k]); if (q.ay !== undefined) o.ay = q.ay + 180; return o; };
const KN = { py: 0, cy: 0, ay: 0, kL: [1, -1, 0], kR: [1, -1, 0], tL: [-1, -0.2, 0], tR: [-1, -0.2, 0] };

// ---------- você por baixo, ele de joelhos na sua guarda fechada ----------
const GD = 0.4;
const PG = { ...KN, _d: GD, p: [0, 0.5, 0], lean: 30, fL: [-0.42, 0, -0.14], fR: [-0.42, 0, 0.14], wL: PW(GD, [0.13, 0.3, 0.12]), wR: PW(GD, [0.13, 0.3, -0.12]), eL: [-0.3, -1, 0.8], eR: [-0.3, -1, -0.8] };
const GB0 = P({ p: [0.1, 0.14, 0], fL: [0.62, 0.55, 0.05], fR: [0.62, 0.52, -0.05], kL: [0.3, 1, -0.6], kR: [0.3, 1, 0.6], tL: [0, 0, 1], tR: [0, 0, -1], wL: [0.12, 0.36, -0.12], wR: [0.12, 0.36, 0.12], eL: [0, 0, -1], eR: [0, 0, 1] }, LIE);
// quebra de postura: puxa os joelhos e os braços dele, depois abraça a cabeça
const GB1 = P({ ...GB0, p: [0.1, 0.16, 0], lean: -80, fL: [0.42, 0.58, 0.05], fR: [0.42, 0.55, -0.05], kL: [0.3, 1, -1], kR: [0.3, 1, 1], wL: [-0.12, 0.42, -0.22], wR: [-0.12, 0.42, 0.22] }, LIE);
const GB2 = P({ ...GB1, lean: -76, wL: [-0.24, 0.5, -0.06], wR: [-0.24, 0.5, 0.06], eL: [0.3, 0.2, -1], eR: [0.3, 0.2, 1] }, LIE);
const PG_PULL = { ...PG, _d: 0.32, p: [0, 0.46, 0], lean: 62, wL: PW(0.32, [-0.1, 0.4, 0.22]), wR: PW(0.32, [-0.1, 0.4, -0.22]) };
const PG_DOWN = { ...PG, _d: 0.44, p: [0, 0.44, 0], lean: 82, wL: PW(0.44, [-0.1, 0.02, 0.36]), wR: PW(0.44, [-0.1, 0.02, -0.36]), eL: [0, 0, 1], eR: [0, 0, -1] };

// ---------- você por cima: base de combate dentro da guarda dele ----------
const BD = 0.35;
const KNEEL_D = { ...KNEEL, wL: [0.3, 0.4, -0.14], wR: [0.3, 0.4, 0.14] };
const CBASE_D = { ...CBASE, wL: [0.28, 0.42, -0.14], wR: [0.28, 0.42, 0.14] };
const CBASE_PD = { ...CBASE_P, wL: [0.26, 0.33, -0.15], wR: [0.26, 0.33, 0.15] };
const PB = { py: 0, cy: 0, ay: 0, _d: BD, p: [0.15, 0.24, 0], lean: -100, fL: PW(BD, [-0.22, 0.6, 0.05]), fR: PW(BD, [-0.22, 0.58, -0.05]), kL: [0.2, 1, -0.7], kR: [0.2, 1, 0.7], tL: [0, 0, 1], tR: [0, 0, -1], wL: PW(BD, [0.3, 0.4, 0.14]), wR: PW(BD, [0.3, 0.4, -0.14]), eL: [0, 0.3, -1], eR: [0, 0.3, 1] };
const PB_PULL = { ...PB, fL: PW(BD, [-0.16, 0.66, 0.05]), fR: PW(BD, [-0.16, 0.64, -0.05]), wL: PW(BD, [0.32, 0.46, 0.14]), wR: PW(BD, [0.32, 0.46, -0.14]) };
const PB_PUSH = { ...PB, p: [0.15, 0.17, 0], fL: PW(BD, [-0.24, 0.5, 0.06]), fR: PW(BD, [-0.24, 0.48, -0.06]), wL: PW(BD, [0.26, 0.33, 0.15]), wR: PW(BD, [0.26, 0.33, -0.15]) };

// ---------- triângulo: um braço dentro, outro fora; perna por cima do ombro; fecha o "4" ----------
const TRD0 = P({ ...GB0, fL: [0.34, 0.5, -0.16], fR: [0.36, 0.5, 0.16], kL: [0.1, 1, -0.8], kR: [0.1, 1, 0.8], wL: [0.12, 0.32, -0.38], wR: [0.0, 0.3, 0.05] }, LIE);
const TRD1 = P({ ...TRD0, p: [0.05, 0.26, 0], lean: -80, fL: [0.3, 0.78, 0.15], kL: [0.2, 1, -0.6], fR: [0.36, 0.5, 0.2], wL: [0.0, 0.72, -0.08], wR: [-0.05, 0.3, 0.08] }, LIE);
const TRD2 = P({ ...TRD1, p: [0.0, 0.24, 0], lean: -64, tw: 12, fL: [0.33, 0.52, 0.2], kL: [0.2, 1, -0.5], fR: [-0.05, 0.42, 0.3], kR: [1, 0.6, 0.4], wL: [0.12, 0.52, -0.06], wR: [0.12, 0.52, 0.06], eL: [0, 0.4, -1], eR: [0, 0.4, 1] }, LIE);
const PT1 = { ...PG, _d: 0.5, lean: 45, wR: PW(0.5, [0.12, 0.32, -0.38]), wL: PW(0.5, [0.0, 0.3, 0.05]) };
const PT2 = { ...PG, _d: 0.55, p: [0, 0.48, 0], lean: 65, wR: PW(0.55, [0.3, 0.05, -0.42]), wL: PW(0.55, [-0.05, 0.3, 0.08]) };
const PT3 = { ...PG, _d: 0.72, p: [0, 0.5, 0], lean: 88, fL: [-0.4, 0, -0.16], fR: [-0.4, 0, 0.16], wR: PW(0.72, [0.35, 0.02, -0.38]), wL: PW(0.72, [-0.1, 0.35, 0.1]), _ord: 'mb pb mt ms mh pt ps pn pf mn ph mf' };

// ---------- armlock: prende o braço no peito, ângulo, perna por cima da cabeça, quadril pra cima ----------
const ALD1 = P({ ...GB0, p: [0.08, 0.14, 0.04], py: 15, cy: 25, fR: [0.4, 0.48, 0.18], kR: [0.2, 1, 0.8], fL: [0.42, 0.1, -0.3], kL: [0.2, 1, -0.6], wL: [-0.18, 0.32, -0.06], wR: [-0.18, 0.34, 0.04] }, LIE);
const ALD2 = P({ ...ALD1, fL: [-0.16, 0.8, 0.12], kL: [-0.3, 1, -0.8] }, LIE);
const ALD3 = P({ ...ALD2, p: [0.06, 0.3, 0], py: -10, cy: -10, lean: -110, fL: [0.14, 0.34, 0.6], kL: [0.2, 1, 0.3], fR: [0.55, 0.55, 0.2], kR: [0.3, 1, 0.6], wL: [-0.4, 0.34, -0.06], wR: [-0.4, 0.34, 0.04] }, LIE);
const PA1 = { ...PG, _d: 0.5, p: [0, 0.48, 0], lean: 60, wR: PW(0.5, [-0.18, 0.32, -0.04]), wL: PW(0.5, [0.15, 0.3, 0.15]) };
const PA2 = { ...PA1 };
const PA3 = { ...PG, _d: 0.55, p: [0, 0.48, 0], py: 20, cy: 40, lean: 113, wR: PW(0.55, [-0.4, 0.31, -0.02]), wL: PW(0.55, [0.2, 0.02, 0.5]), eR: [0, 0.3, 1], _act: 'armR' };

// ---------- kimura: ele apoia a mão no chão, você senta, prende o punho e gira o braço pras costas ----------
const KMD1 = P({ ...GB0, p: [0.12, 0.14, -0.02], py: -15, cy: -30, lean: -55, fL: [0.48, 0.05, -0.42], kL: [0.2, 1, -0.6], fR: [0.6, 0.5, 0.05], wL: [0.1, 0.08, -0.38], wR: [0.08, 0.12, -0.34], eR: [1, 0.3, -0.3] }, LIE);
const KMD2 = P({ ...KMD1, p: [0.05, 0.16, -0.1], py: -15, cy: -20, lean: -75, fL: [0.42, 0.04, -0.5], kL: [0.3, 1, -0.4], fR: [0.6, 0.5, 0.05], wL: [0.05, 0.68, -0.32], wR: [0.0, 0.62, -0.3], eR: [1, 0.4, -0.2] }, LIE);
const PK1 = { ...PG, _d: 0.45, p: [0, 0.44, 0], py: 10, cy: 25, lean: 76, wR: PW(0.45, [0.1, 0.02, -0.4]), wL: PW(0.45, [0.13, 0.3, 0.12]) };
const PK2 = { ...PG, _d: 0.45, p: [0, 0.44, 0], py: 15, cy: 28, lean: 100, wR: PW(0.45, [0.05, 0.68, -0.32]), eR: [0.6, -0.3, -1], wL: PW(0.45, [0.25, 0.02, 0.35]), _act: 'armR' };

// ---------- guilhotina: a cabeça dele desce, o braço abraça o pescoço por baixo e o quadril empurra ----------
const GUD1 = P({ ...GB0, p: [0.1, 0.14, 0], lean: -62, fL: [0.6, 0.5, 0.05], fR: [0.6, 0.48, -0.05], wL: [-0.22, 0.42, 0.05], wR: [-0.25, 0.4, 0.08], eL: [1, 0, -0.2] }, LIE);
const GUD2 = P({ ...GUD1, p: [0.06, 0.2, 0], lean: -80, fL: [0.7, 0.42, 0.05], fR: [0.7, 0.4, -0.05], kL: [0.5, 1, -0.6], kR: [0.5, 1, 0.6], wL: [-0.3, 0.33, 0.05], wR: [-0.32, 0.31, 0.08], eL: [1, -1, -0.3] }, LIE);
const PGU1 = { ...PG, _d: 0.38, p: [0, 0.46, 0], cy: -12, lean: 80, wL: PW(0.38, [-0.2, 0.44, 0.08]), wR: PW(0.38, [-0.18, 0.45, -0.04]), eL: [1, 0, 0.3], eR: [1, 0, -0.3] };
const PGU2 = { ...PG, _d: 0.5, p: [0, 0.44, 0], cy: -10, lean: 95, wL: PW(0.5, [-0.28, 0.34, 0.08]), wR: PW(0.5, [-0.26, 0.36, -0.04]), eL: [1, 0, 0.3], eR: [1, 0, -0.3] };

// ---------- raspagem de tesoura: de lado, canela na barriga dele, a perna de baixo corta a base; sobe na montada ----------
const TSD1 = P({ p: [0.12, 0.2, 0], lean: -95, tw: 60, fL: [0.36, 0.6, -0.3], kL: [0.2, 0.5, 1], fR: [0.56, 0.05, 0.28], kR: [0.3, 1, 0.3], tR: [1, 0, 0], wL: [0.13, 0.32, -0.12], wR: [0.18, 0.5, 0.16], eL: [0, 0, -1], eR: [0, 0, 1] }, LIE);
const TSD2 = P({ ...TSD1, fL: [0.6, 0.72, -0.25], fR: [0.12, 0.08, 0.3], kR: [0, 1, 0.3], wL: [-0.05, 0.3, -0.16], wR: [0.0, 0.4, 0.16] }, LIE);
const TSD3 = { p: [0.62, 0.42, 0], py: 0, cy: 0, ay: 0, lean: 25, fL: [0.22, 0, -0.32], fR: [0.22, 0, 0.32], kL: [1, -0.6, -0.5], kR: [1, -0.6, 0.5], tL: [-1, -0.2, 0], tR: [-1, -0.2, 0], wL: [0.97, 0.24, -0.13], wR: [0.97, 0.24, 0.13], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6] };
const PS2 = { ...PG, _d: 0.5, p: [0, 0.4, 0], lean: -25, fL: [0.15, 0.12, -0.16], fR: [-0.2, 0.03, 0.16], kL: [1, 1, 0], wL: PW(0.5, [0.15, 0.75, 0.32]), wR: PW(0.5, [0.1, 0.6, -0.3]) };
const PS2B = { ...PG, _d: 0.55, p: [0.05, 0.24, 0], lean: -70, fL: [0.45, 0.4, -0.16], fR: [0.38, 0.32, 0.16], kL: [0.3, 1, 0], kR: [0.3, 1, 0], tL: [1, 0, 0], tR: [1, 0, 0], wL: PW(0.55, [0.55, 0.55, 0.38]), wR: PW(0.55, [0.5, 0.5, -0.38]) };
const PS3 = { ...LIE, py: 0, cy: 0, ay: 0, _d: 0.55, p: [0.1, 0.12, 0], fL: PW(0.55, [0.05, 0, 0.24]), fR: PW(0.55, [0.05, 0, -0.24]), kL: [0, 1, -0.4], kR: [0, 1, 0.4], tL: [1, 0, 0], tR: [1, 0, 0], wL: PW(0.55, [0.72, 0.52, 0.16]), wR: PW(0.55, [0.72, 0.52, -0.16]), _ord: 'pb mb pt ps pn ph pf mt ms mn mh mf' };

// ---------- passagem toreando: segura nos joelhos, joga as pernas pro lado, circula e cai nos 100 kg ----------
const TO = 0.82;
const PTO0 = { ...LIE, py: 0, cy: 0, ay: 0, _d: TO, p: [0.1, 0.12, 0], fL: PW(TO, [0.2, 0.55, 0.15]), fR: PW(TO, [0.2, 0.55, -0.15]), kL: [0.2, 1, -0.4], kR: [0.2, 1, 0.4], tL: [-1, 0.3, 0], tR: [-1, 0.3, 0], wL: PW(TO, [0.95, 0.45, 0.18]), wR: PW(TO, [0.95, 0.45, -0.18]), eL: [0, 0, -1], eR: [0, 0, 1] };
const PTO1 = { ...PTO0, fL: PW(TO, [0.4, 0.06, -0.3]), fR: PW(TO, [0.36, 0.04, -0.48]), kL: [0, 0.6, 1], kR: [0, 0.6, 1], tL: [-1, 0, 0], tR: [-1, 0, 0] };
const PTO2 = { ...PTO1 };
const PTO3 = { ...PTO1, wL: PW(TO, [0.92, 0.4, 0.42]), wR: PW(TO, [1.0, 0.52, -0.06]), eL: [0, 0, -1], eR: [0, 0, 1] };
const TORD0 = { ...TOR0, wL: [0.47, 0.58, -0.17], wR: [0.47, 0.58, 0.17] };
const TORD1 = { ...TOR0, p: [0.06, 0.62, 0.14], lean: 45, cy: -10, fR: [-0.15, 0, 0.36], wL: [0.5, 0.22, -0.32], wR: [0.5, 0.24, -0.16] };
const TORD2 = { ...TOR0, p: [0.42, 0.58, 0.48], py: 50, cy: 60, lean: 48, fL: [0.6, 0, 0.3], fR: [0.15, 0, 0.62], tL: [0.2, 0, -1], tR: [0.6, 0, -0.8], wL: [0.5, 0.18, -0.26], wR: [0.82, 0.2, 0.12] };
const TORD3 = { p: [1.0, 0.36, 0.6], py: 90, cy: 90, ay: 90, lean: 70, fL: [0.85, 0, 0.84], fR: [1.15, 0, 0.84], kL: [0, -0.6, -1], kR: [0, -0.6, -1], tL: [0, -0.2, 1], tR: [0, -0.2, 1], wL: [0.72, 0.16, 0.26], wR: [1.42, 0.1, 0.0], eL: [-0.3, -1, 0.5], eR: [-0.3, -1, -0.5] };

// ---------- upa com ele montado: prende braço e pé do mesmo lado, ponte, rola e cai na guarda dele ----------
const UPD1 = { ...UPA_TRAP, fR: [0.38, 0, 0.4] };
const UPD2 = { ...UPA_UP, fR: [0.38, 0, 0.4] };
const UPD3 = P({ p: [0.1, 0.4, 0.16], lean: -100, tw: -110, hL: [0.12, 0.05, -0.1], hR: [0.16, 0.0, -0.18], fL: [0.42, 0, -0.16], fR: [0.42, 0.12, 0.4], kR: [0.4, 1, 0.6] }, LIE);
const UPD4 = { p: [0.0, 0.5, 0.38], py: 180, cy: 0, ay: 0, lean: -40, tw: -180, fL: [0.42, 0, 0.52], fR: [0.42, 0, 0.24], kL: [-1, -1, 0], kR: [-1, -1, 0], tL: [1, -0.2, 0], tR: [1, -0.2, 0], wL: [-0.33, 0.32, 0.52], wR: [-0.33, 0.32, 0.24], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6] };
const PM0 = { py: 0, cy: 0, ay: 0, _d: 0, p: [0.05, 0.36, 0], lean: 25, fL: [-0.35, 0, -0.3], fR: [-0.35, 0, 0.3], kL: [1, -0.5, -0.8], kR: [1, -0.5, 0.8], tL: [-1, -0.2, 0], tR: [-1, -0.2, 0], wL: PW(0, [-0.3, 0.22, 0.1]), wR: PW(0, [-0.3, 0.22, -0.1]), eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6], _ord: 'mb mt ms mn mh pb pt ps pn ph mf pf' };
const PM1 = { ...PM0, p: [0.2, 0.6, -0.08], lean: 60, fL: [-0.2, 0.15, -0.3], fR: [-0.25, 0.1, 0.3], wL: PW(0, [-0.3, 0.3, 0.1]), wR: PW(0, [-0.8, 0.1, -0.25]) };
const PM2 = { ...PM0, p: [0.25, 0.45, -0.3], py: 90, lean: 80, tw: 90, fL: [-0.1, 0.4, -0.5], fR: [0.0, 0.5, -0.1], kL: [0, 1, 0], kR: [0, 1, 0], wL: PW(0, [-0.3, 0.35, 0.2]), wR: PW(0, [-0.7, 0.1, 0.2]) };
const PM3 = { py: 180, cy: 0, ay: 0, _d: 0, p: [0.28, 0.2, -0.38], lean: 100, tw: 180, fL: [-0.22, 0.55, -0.43], fR: [-0.22, 0.55, -0.33], kL: [0.2, 1, 0.6], kR: [0.2, 1, -0.6], tL: [0, 0, 1], tR: [0, 0, -1], wL: PW(0, [-0.33, 0.32, 0.24]), wR: PW(0, [-0.33, 0.32, 0.52]), eL: [0, 0.3, 1], eR: [0, 0.3, -1], _ord: 'pb mb pt ps ph pf mt ms mh mf pn mn' };

// ---------- mata-leão: nas suas costas dele com os ganchos; braço por baixo do queixo, trava no bíceps ----------
const ML0 = { p: [0, 0.12, 0], py: 0, cy: 0, ay: 0, lean: -10, fL: [0.58, 0.16, -0.08], fR: [0.58, 0.16, 0.08], kL: [0.4, 1, -1], kR: [0.4, 1, 1], tL: [1, 0, 0.3], tR: [1, 0, -0.3], wL: [0.3, 0.44, -0.05], wR: [0.3, 0.41, 0.03], eL: [0, 0.3, 1], eR: [0, -0.5, -1] };
const ML1 = { ...ML0, wL: [0.08, 0.55, 0.17], eL: [1, 0.1, 0] };
const ML2 = { ...ML1, wL: [0.03, 0.54, 0.18], wR: [-0.04, 0.8, 0.14], eR: [0.2, 1, -0.6] };
const ML3 = { ...ML2, lean: -14, wL: [0.0, 0.54, 0.18], wR: [-0.08, 0.78, 0.14] };
const PML0 = { ...SAME({ p: [0.32, 0.12, 0], py: 0, cy: 0, ay: 0, lean: -22, fL: [1.0, 0, -0.18], fR: [1.0, 0, 0.18], kL: [0.2, 1, -0.3], kR: [0.2, 1, 0.3], tL: [0.3, 1, 0], tR: [0.3, 1, 0], wL: [0.3, 0.5, -0.1], wR: [0.3, 0.48, 0.1], eL: [0, -1, 0.3], eR: [0, -1, -0.3] }), _d: 0 };
const PML3 = { ...SAME({ p: [0.3, 0.12, 0], py: 0, cy: 0, ay: 0, lean: -30, fL: [0.98, 0, -0.2], fR: [1.0, 0, 0.18], kL: [0.2, 1, -0.3], kR: [0.2, 1, 0.3], tL: [0.3, 1, 0], tR: [0.3, 1, 0], wL: [0.25, 0.38, -0.36], wR: [0.18, 0.6, 0.06], eL: [0, -1, 0.3], eR: [0, -1, -0.3] }), _d: 0 };
const PML1 = { ...SAME({ p: [0.32, 0.12, 0], py: 0, cy: 0, ay: 0, lean: -22, fL: [1.0, 0, -0.18], fR: [1.0, 0, 0.18], kL: [0.2, 1, -0.3], kR: [0.2, 1, 0.3], tL: [0.3, 1, 0], tR: [0.3, 1, 0], wL: [0.2, 0.6, -0.08], wR: [0.18, 0.6, 0.06], eL: [0, -1, 0.3], eR: [0, -1, -0.3] }), _d: 0 };
// </chao-duo>
// <lutas-rev>
// ============================================================
// Revisão das lutas (v3.34): poses refeitas a pedido do Rick.
// MIR(pose): espelha (base trocada, canhoto); pegadas: marcas fixas no chão pra ver o pé andar.
// ============================================================
const MIRV = v => v && [v[0], v[1], -v[2]];
function MIR(q) {
  const o = { ...q }; for (const k of ['p', 'wL', 'wR', 'fL', 'fR', 'kL', 'kR', 'tL', 'tR']) delete o[k];
  if (q.p) o.p = MIRV(q.p);
  for (const [a, b] of [['wL', 'wR'], ['fL', 'fR'], ['kL', 'kR'], ['tL', 'tR']]) { if (q[b]) o[a] = MIRV(q[b]); if (q[a]) o[b] = MIRV(q[a]); }
  for (const [a, b] of [['hL', 'hR'], ['eL', 'eR']]) { o[a] = q[b] && MIRV(q[b]); o[b] = q[a] && MIRV(q[a]); if (!o[a]) delete o[a]; if (!o[b]) delete o[b]; }
  for (const k of ['py', 'cy', 'ay', 'tw']) if (q[k] !== undefined) o[k] = -q[k];
  return o;
}
const FOOT = (f, w = 9) => ({ k: 'line', a: [f[0] - 0.08, 0.002, f[2]], b: [f[0] + 0.08, 0.002, f[2]], w, c: 'ftp', layer: 'back' });
const PRINTS = (...ps) => () => ps.flatMap(p => [FOOT(p.fL), FOOT(p.fR)]);

// cruzado por cima: a mão sai por fora e por cima, longe da cabeça, e desce no alvo
const OVR_UP = P({ p: [0.03, 0.8, 0], cy: -30, lean: 18, hR: [0.02, 0.56, -0.44], eR: [-0.4, 0.4, -1] });
const OVR_TOP = P({ p: [0.07, 0.79, 0], cy: 0, py: -10, lean: 24, hR: [0.48, 0.5, -0.3], eR: [0, 1, -0.7], fR: [-0.28, 0.03, 0.1], tR: [0.8, -0.3, 0.5] });
const OVR = P({ ...OVER, hR: [0.8, 0.08, 0.0], eR: [0, 1, -0.5] });

// esquiva: o pé e o quadril giram e a cabeça sai da linha (sem tombar o tronco)
const SLIPO = P({ p: [0.02, 0.8, 0.09], py: -66, cy: -80, lean: 12, hL: [0.24, 0.2, 0.06], hR: [0.14, 0.24, -0.1], tL: [0.5, 0, -0.86], fL: [0.38, 0, -0.12] });
const SLIPI = P({ p: [0.06, 0.8, -0.09], py: -18, cy: -12, lean: 12, tR: [0.75, -0.35, 0.55], fR: [-0.27, 0.04, 0.12], hL: [0.24, 0.2, 0.06], hR: [0.16, 0.24, -0.08] });
// pêndulo: "U" grande por baixo do gancho
const BOBA = P({ p: [0.06, 0.64, 0.16], lean: 18, cy: -60, py: -50, kL: [1, 0, -0.4], kR: [1, 0, 0.4] });
const BOBB = P({ p: [0.1, 0.5, 0.02], lean: 24, cy: -45, kL: [1, 0, -0.4], kR: [1, 0, 0.4] });
const BOBC = P({ p: [0.08, 0.68, -0.16], lean: 16, cy: -22, py: -25, kL: [1, 0, -0.4], kR: [1, 0, 0.4] });
// gancho do parceiro no pêndulo: punho na altura da cabeça, de um lado pro outro (mãos em coords do mundo dele)
const PHB = P({ cy: -20, py: -25, lean: 10, p: [0.04, 0.84, 0], wL: [0.56, 1.52, -0.24], eL: [-0.3, 0.3, 1], tL: [0.7, 0, -0.3] });
const PHC = P({ cy: 22, py: 0, lean: 12, p: [0.07, 0.84, 0], wL: [0.5, 1.48, 0.24], eL: [-0.1, 0.5, 1], hR: [0.16, 0.22, -0.06], tL: [0.8, 0, 0.6] });

// chute de esquerda: pulinho trocando os pés, fica em base canhota e chuta com a esquerda (que ficou atrás)
const SW_AIR = P({ p: [0.04, 0.95, 0.01], py: 0, cy: 0, fL: [0.06, 0.1, -0.13], fR: [0.08, 0.1, 0.14], tL: [1, -0.4, 0], tR: [1, -0.4, 0] });
const G_S = MIR(G);
const SWK_CH = MIR(KICK_CH), SWK = MIR(KICK);

// cotovelada ascendente: o antebraço sobe por fora do rosto, cotovelo na linha do queixo
const ELB_UP = P({ ...ELBOW_UP, hR: [0.04, 0.5, -0.24], eR: [1, 0.35, -0.1] });

// kizami: o pé da frente desliza primeiro (rente ao chão), o de trás acompanha depois do soco
const KZ1 = KP({ p: [0.12, 0.8, 0], fL: [0.8, 0.03, -0.1], tL: [0.9, -0.15, -0.3] });
const KZ2 = KP({ p: [0.24, 0.8, 0], cy: -68, lean: 8, fL: [0.8, 0, -0.1], fR: [-0.44, 0, 0.14], hL: [0.92, 0.2, -0.04], hR: [0.14, 0.1, -0.08] });
const KZ3 = KP({ ...KZ2, fR: [-0.2, 0.02, 0.14] });
const KZ4 = KP({ p: [0.12, 0.8, 0], fL: [0.8, 0, -0.1], fR: [-0.44, 0.02, 0.14] });

// passos: frente, trás, lados (a base nunca muda)
const PS_F1 = P({ p: [0.12, 0.86, 0], fL: [0.62, 0.02, -0.12] });
const PS_F2 = P({ p: [0.24, 0.86, 0], fL: [0.62, 0, -0.12], fR: [-0.06, 0, 0.12] });
const PS_B1 = P({ p: [0.12, 0.86, 0], fL: [0.62, 0, -0.12], fR: [-0.3, 0.02, 0.12] });
const PS_L1 = P({ p: [0, 0.86, -0.15], fL: [0.38, 0.02, -0.42], fR: [-0.3, 0, 0.12] });
const PS_L2 = P({ p: [0, 0.86, -0.3], fL: [0.38, 0, -0.42], fR: [-0.3, 0, -0.18] });
const PS_R1 = P({ p: [0, 0.86, -0.15], fL: [0.38, 0, -0.42], fR: [-0.3, 0.02, 0.12] });

// double leg: entra, abraça as DUAS pernas atrás dos joelhos, levanta e ele cai de costas
const DL_GRAB = P({ p: [0.36, 0.44, 0], py: -20, cy: -10, lean: 48, fL: [0.62, 0, -0.1], kL: [1, -0.7, 0], tL: [0.4, -0.5, 0], fR: [-0.35, 0, 0.16], wL: [1.0, 0.42, -0.06], wR: [1.0, 0.42, 0.18], eL: [0, -0.3, -1], eR: [0, -0.3, 1] });
const DL_LIFT = P({ p: [0.5, 0.74, 0], py: -5, cy: 0, lean: 26, fL: [0.7, 0, -0.14], fR: [0.12, 0, 0.16], kL: [1, 0, -0.2], kR: [1, 0, 0.2], wL: [0.92, 0.74, -0.08], wR: [0.92, 0.74, 0.16], eL: [0, -0.3, -1], eR: [0, -0.3, 1] });
const DL_TOP = { ...KNEEL, p: [0.95, 0.5, 0], lean: 40, wL: [1.32, 0.3, -0.14], wR: [1.32, 0.3, 0.14] };
const PDL0 = P({ p: [0, 0.86, 0], py: -10, cy: -30, lean: 8, fL: [0.06, 0, -0.15], fR: [0.0, 0, 0.15], hL: [0.3, 0.1, 0.18], hR: [0.3, 0.1, -0.2] });
const PDL1 = P({ ...PDL0, _d: 1.0, lean: 30, p: [0, 0.82, 0], hL: [0.3, -0.25, 0.2], hR: [0.3, -0.25, -0.2] });
const PDL2 = P({ _d: 1.0, p: [0.0, 1.02, 0], py: 0, cy: 0, lean: -35, fL: [0.2, 0.55, -0.1], fR: [0.2, 0.55, 0.1], kL: [1, -0.2, 0], kR: [1, -0.2, 0], tL: [1, 0.4, 0], tR: [1, 0.4, 0], hL: [0.0, 0.2, 0.4], hR: [0.0, 0.2, -0.4] });
const PDL3 = { ...LIE, _d: 1.0, p: [-0.4, 0.12, 0], fL: [0.15, 0, -0.26], fR: [0.15, 0, 0.26], kL: [0, 1, -0.3], kR: [0, 1, 0.3], hL: [0.25, 0.05, 0.25], hR: [0.25, 0.05, -0.25], _ord: 'pb mb pt ps pn ph pf mt ms mn mh mf' };

// sprawl: ele entra na perna; você joga as pernas pra trás e afunda o quadril nas costas dele
const SPR2 = { p: [-0.02, 0.38, 0], py: 0, cy: 0, ay: 0, lean: 76, fL: [-0.95, 0, -0.24], fR: [-0.95, 0, 0.24], kL: [0, -1, 0], kR: [0, -1, 0], tL: [0, -1, 0], tR: [0, -1, 0], wL: [0.42, 0.34, -0.18], wR: [0.42, 0.34, 0.18], eL: [-0.2, 0, -1], eR: [-0.2, 0, 1] };
const SPR_UP2 = P({ p: [-0.35, 0.6, 0], lean: 30, fL: [-0.05, 0, -0.15], fR: [-0.7, 0, 0.15] });
const PSH = { ...SHOT, _d: 0.95 };
const PSFL = { ...PG, _d: 0.75, p: [0, 0.32, 0], lean: 100, fL: [-0.5, 0, -0.15], fR: [-0.5, 0, 0.15], wL: PW(0.75, [-0.18, 0.22, 0.2]), wR: PW(0.75, [-0.18, 0.22, -0.2]), eL: [0, -1, 0.3], eR: [0, -1, -0.3], _ord: 'pb pt ps pn ph pf mb mt ms mn mh mf' };
const PSKN = { ...PKNEEL, _d: 0.9 };

// fuga de quadril com ele nos 100 kg (do lado de lá): vira de lado pra ele, empurra e tira o quadril, põe o joelho
const PSC = { ...SAME({ ...TORD3, p: [-0.3, 0.36, 0.6], fL: [-0.45, 0, 0.84], fR: [-0.15, 0, 0.84], wL: [-0.66, 0.08, 0.0], wR: [0.12, 0.16, 0.22] }), _d: 0, _ord: 'mb mt ms mn mh pb pt ps pn ph pf mf' };
const PSC2 = { ...PSC, _ord: 'mb mt ms mh pb pt ps pn ph pf mn mf' };
const FU0 = P({ wL: [-0.22, 0.44, 0.08], wR: [-0.3, 0.5, 0.16], eL: [0, 0, -1], eR: [0, 0, -1] }, LIE);
const FU1 = P({ p: [0.1, 0.18, -0.06], lean: -96, tw: -60, fL: [0.45, 0, -0.22], fR: [0.42, 0, 0.04], kL: [0.2, 1, -0.6], kR: [0.2, 1, 0.2], wL: [-0.16, 0.42, 0.12], wR: [-0.26, 0.5, 0.16] }, LIE);
const FU2 = P({ ...FU1, p: [0.0, 0.18, -0.36], lean: -100, tw: -64, fL: [0.32, 0, -0.5], fR: [0.36, 0.04, -0.16], wL: [-0.14, 0.42, 0.1], wR: [-0.24, 0.48, 0.14] }, LIE);
const FU3 = P({ ...FU2, fR: [0.08, 0.3, -0.1], kR: [0.3, 0.6, 1], tR: [1, 0, 0] }, LIE);

// age-uke contra o soco no rosto; cruzado no corpo com o parceiro
const PKZ = KP({ p: [0.24, 0.8, 0], cy: -68, lean: 6, fL: [0.78, 0, -0.1], fR: [-0.2, 0, 0.14], hL: [0.95, 0.42, -0.04], hR: [0.14, 0.1, -0.08] });
const PBODY = P({ p: [-0.06, 0.82, 0], lean: 26, cy: -20, py: -30, hR: [0.12, -0.12, -0.22], hL: [0.24, 0.18, 0.06] });
// </lutas-rev>

const LIMB = { haL: 'armL', elL: 'armL', haR: 'armR', elR: 'armR', anL: 'legL', knL: 'legL', anR: 'legR', knR: 'legR' };
const T = (id, sport, cat, n, sub, frames, steps, furos, opts = {}) => ({ id, sport, cat, n, sub, frames, steps, furos, props: opts.props, body: opts.body, partner: opts.partner || null, gloves: opts.gloves ?? true, cam: opts.cam ?? 22, ox: opts.ox ?? 0, tilt: opts.tilt ?? 0, zoom: opts.zoom ?? 1,
  act: [...new Set(frames.map(f => LIMB[f.fx]).filter(Boolean))].flatMap(x => x.startsWith('leg') ? [x, 'foot' + x.slice(3)] : [x]) });
const SC = ['boxe', 'muaythai', 'mma'];

export const TECHNIQUES = [
  // ===== SOCOS =====
  T('jab', SC, 'Socos', 'Jab', 'O golpe mais usado: mede distância e abre caminho.',
    [F(G, 520, 0), F(JAB, 150, 1, { e: 'snap', fx: 'haL', hit: true }), F(JAB, 90, 2, { hi: ['shL'] }), F(G, 230, 3)],
    ['Guarda: queixo baixo, mãos no rosto, peso no meio.', 'A mão da frente sai reta e gira o punho no fim.', 'O ombro da frente sobe e protege o queixo.', 'Volta pelo mesmo caminho, rápido, pra guarda.'],
    ['Baixar a mão de trás quando o jab sai.', 'Puxar o braço pra trás antes de soltar (avisa o golpe).', 'Voltar devagar ou por baixo, deixando o rosto aberto.']),
  T('jabcorpo', SC, 'Socos', 'Jab no corpo', 'Troca de nível: desce com as pernas e acerta a linha da cintura.',
    [F(G, 500, 0), F(P({ p: [0.06, 0.74, 0], lean: 22 }), 200, 0, { hi: ['knL', 'knR'] }), F(BODYJAB, 150, 1, { e: 'snap', fx: 'haL', hit: true }), F(BODYJAB, 100, 2), F(G, 320, 3)],
    ['Dobre os joelhos: o nível muda pelas pernas, não pela coluna.', 'O jab sai reto na altura do plexo.', 'A mão de trás fica no rosto (é quando chega o contra-golpe).', 'Suba já em guarda.'],
    ['Abaixar só o tronco, olhando pro chão.', 'Ficar embaixo depois do golpe.', 'Soltar sem a cabeça fora da linha central.']),
  T('direto', SC, 'Socos', 'Direto', 'O soco de força: nasce no pé de trás.',
    [F(G, 480, 0), F(CROSS_LOAD, 140, 0, { e: 'load' }), F(CROSS, 170, 1, { e: 'snap', fx: 'haR', hit: true, hi: ['anR', 'pel'] }), F(CROSS, 110, 2), F(G, 300, 3)],
    ['Da guarda, gire o pé de trás (o calcanhar sobe).', 'O quadril gira pra frente e leva o ombro junto.', 'O braço só termina o movimento: mão reta até o alvo.', 'A mão da frente fica no rosto. Volta pra guarda.'],
    ['Soco só de braço, sem girar o pé e o quadril.', 'Inclinar o corpo além do joelho da frente.', 'Abrir o cotovelo (vira um soco "de lado").']),
  T('gancho', SC, 'Socos', 'Cruzado', 'Curto e em arco: a força vem da rotação.',
    [F(G, 480, 0), F(HOOK_LOAD, 170, 0, { e: 'load' }), F(HOOK_MID, 90, 1, { e: 'lin', fx: 'haL', hi: ['pel', 'anL'] }), F(HOOK, 110, 2, { e: 'snap', fx: 'haL', hit: true }), F(HOOK, 110, 3), F(G, 320, 3)],
    ['Peso levemente na perna da frente.', 'Gire o pé e o quadril da frente pra dentro.', 'Braço travado em ~90°, cotovelo na altura do punho.', 'O punho segue o giro do tronco e volta pro rosto.'],
    ['Abrir o braço pra "carregar" o golpe (o adversário vê).', 'Girar só o braço, sem o pé da frente.', 'Deixar a mão de trás cair durante o giro.'], { cam: 76, tilt: 22, zoom: 1.15 }),
  T('uppercut5', SC, 'Socos', 'Uppercut', 'De baixo pra cima: rápido, escondido e perfeito de perto.',
    [F(G, 450, 0), F(UP5_DIP, 250, 0, { e: 'load', hi: ['knL'] }), F(UP5_DIP, 110, 1, { hi: ['haL'] }), F(UP5, 180, 2, { e: 'snap', fx: 'haL', hit: true }), F(UP5, 190, 3), F(G, 320, 3)],
    ['Desça um pouco o peso sobre a perna da frente.', 'O punho desce curto, palma pra cima, cotovelo colado.', 'Gire o quadril da frente e empurre com a perna: o punho sobe.', 'Acerta o queixo e volta pra guarda.'],
    ['Abrir o cotovelo pra fora.', 'Perder a mão de trás do rosto.', 'Subir na ponta dos pés.'], { cam: 8 }),
  T('overhand', ['boxe', 'mma'], 'Socos', 'Cruzado por cima (overhand)', 'Por cima da guarda: arco alto, corpo cai junto.',
    [F(G, 480, 0), F(OVR_UP, 200, 0, { e: 'load', fx: 'haR' }), F(OVR_TOP, 130, 1, { e: 'lin', fx: 'haR' }), F(OVR, 130, 1, { e: 'snap', fx: 'haR', hit: true, hi: ['pel'] }), F(OVR, 140, 2, { hi: ['pel'] }), F(G, 400, 3)],
    ['Troque levemente de nível, cabeça fora da linha.', 'A mão de trás faz um arco por cima, como um laço.', 'O peso do corpo vai junto pra frente.', 'Volte rápido pra guarda: é golpe de risco.'],
    ['Lançar de muito longe.', 'Cabeça no centro, sem esquiva.', 'Ficar caído pra frente depois do golpe.'], { cam: 62, tilt: 18, zoom: 1.05 }),
  // ===== DEFESA =====
  T('bloqueio', SC, 'Defesa', 'Bloqueio (guarda alta)', 'A defesa mais simples: luvas na testa, cotovelos fechados.',
    [F(G, 480, 0), F(BLOCK, 160, 0, { e: 'snap', hi: ['haL', 'haR'] }), F(BLOCK, 380, 1, { hi: ['elL', 'elR'] }), F(G, 300, 2)],
    ['Luvas sobem até a testa, antebraços na frente do rosto.', 'Cotovelos colados protegem as costelas.', 'Queixo baixo, olhos abertos; responda logo depois.'],
    ['Fechar os olhos e esperar.', 'Ficar só na guarda alta (vira saco de pancada).', 'Abrir os cotovelos.']),
  T('aparada', ['boxe', 'mma'], 'Defesa', 'Aparada (parry)', 'Desvia o jab com um tapinha da mão de trás.',
    [F(G, 520, 0), F(PARRY, 110, 0, { e: 'snap', fx: 'haR', hi: ['haR'] }), F(PARRY, 90, 1), F(G, 200, 2), F(CROSS, 170, 3, { e: 'snap', fx: 'haR', hit: true }), F(G, 300, 3)],
    ['Espere o jab chegar perto.', 'A mão de trás dá um tapa curto pra dentro, desviando o soco.', 'Não persiga a mão do adversário: movimento curto.', 'Responda com o direto na hora.'],
    ['Abrir muito a mão (abre o rosto).', 'Aparar cedo demais.', 'Aparar e não contra-atacar.'], { cam: 50 }),
  T('esquiva', SC, 'Defesa', 'Esquiva', 'Sair da linha do soco sem perder a posição.',
    [F(G, 480, 0), F(SLIPO, 200, 0, { e: 'snap', hi: ['head'] }), F(SLIPO, 260, 1, { hi: ['anL', 'pel'] }), F(G, 240, 2), F(SLIPI, 200, 0, { e: 'snap', hi: ['head'] }), F(SLIPI, 240, 1, { hi: ['anR', 'pel'] }), F(G, 300, 3)],
    ['Veja o soco vindo, mãos no rosto.', 'Gire o pé e o quadril: o ombro vai pra trás e a cabeça sai pra fora do soco.', 'O tronco não tomba pro lado; o giro é que tira a cabeça da linha.', 'Volte já armado pra contra-atacar.'],
    ['Esquivar só com o pescoço.', 'Inclinar o tronco pro lado em vez de girar.', 'Esquivar demais e perder o equilíbrio.'], { cam: 70 }),
  T('pendulo', ['boxe', 'mma'], 'Defesa', 'Pêndulo', 'Passar por baixo do gancho em "U".',
    [F(G, 450, 0), F(BOBA, 260, 0, { hi: ['knL', 'knR'], fx: 'head', pfx: 'haL' }), F(BOBB, 220, 1, { e: 'lin', fx: 'head', pfx: 'haL' }), F(BOBC, 240, 2, { fx: 'head', pfx: 'haL' }), F(G, 320, 3)],
    ['Dobre os joelhos: desça com as pernas, não com as costas.', 'Passe a cabeça por baixo do golpe, desenhando um "U".', 'Mãos no rosto o tempo todo.', 'Suba do outro lado, já em posição de bater.'],
    ['Curvar a coluna e olhar pro chão.', 'Descer demais (fica lento pra voltar).', 'Baixar as mãos.'], { cam: 72 }),
  T('recuo', ['boxe'], 'Defesa', 'Recuo e contra (pull counter)', 'Tira a cabeça pra trás e devolve com o direto.',
    [F(G, 480, 0), F(PULL, 180, 0, { e: 'snap', hi: ['head'] }), F(PULL, 120, 1, { hi: ['anR'] }), F(CROSS, 170, 2, { e: 'snap', fx: 'haR', hit: true }), F(G, 300, 3)],
    ['Leia o jab.', 'Desloque o peso pra perna de trás, tirando a cabeça do alcance.', 'Os pés não saem do lugar.', 'Volte com o direto enquanto o braço dele recolhe.'],
    ['Inclinar pra trás só com a cintura.', 'Levantar o queixo.', 'Recuar sem contra-atacar.']),
  T('pivo', ['boxe', 'muaythai', 'mma'], 'Defesa', 'Pivô', 'Girar sobre um pé pra sair do canto. Funciona nos dois pés.',
    [F(G, 520, 0, { hi: ['anL'] }), F(pivot(-35), 260, 1, { fx: 'anR', hi: ['anL'] }), F(pivot(-70), 280, 1, { fx: 'anR' }), F(pivot(-70), 360, 2), F(pivot(-70), 300, 3), F(G, 600, 3)],
    ['Peso na ponta do pé da frente (dá pra fazer também girando no pé de trás).', 'O outro pé varre o chão em arco, longe do pé que gira.', 'O corpo gira junto, guarda sempre fechada.', 'Agora você está de frente pro lado dele, não pras cordas.'],
    ['Cruzar os pés.', 'Girar com o peso no calcanhar.', 'Baixar as mãos durante o giro.'], { cam: 30, tilt: 55, zoom: 0.95, props: PRINTS(G) }),
  // ===== CHUTES =====
  T('chute', ['muaythai', 'mma'], 'Chutes', 'Chute de direita', 'O golpe símbolo do muay thai: a canela é o taco.',
    [F(G, 450, 0), F(KICK_STEP, 160, 0, { hi: ['anL'] }), F(KICK_CH, 150, 1, { e: 'lin', fx: 'anR', hi: ['pel'] }), F(KICK, 140, 2, { e: 'snap', fx: 'anR', hit: true }), F(KICK, 130, 3, { hi: ['haR'] }), F(KICK_CH, 220, 3), F(G, 320, 3)],
    ['Passo curto pra fora com o pé da frente.', 'Gire nesse pé (o calcanhar aponta pro alvo) e jogue o quadril.', 'A perna vem como um taco: acerta com a canela.', 'O braço de trás desce pra equilibrar; o da frente protege o rosto.'],
    ['Não girar o pé de apoio (trava o quadril e força o joelho).', 'Acertar com o peito do pé.', 'Dobrar e "estalar" a perna em vez de passar o quadril.'], { cam: 8 }),
  T('chutebaixo', ['muaythai', 'mma'], 'Chutes', 'Chute baixo (low kick)', 'Na coxa do adversário: tira a base dele aos poucos.',
    [F(G, 450, 0), F(KICK_STEP, 150, 0, { hi: ['anL'] }), F(P({ fR: [0.2, 0.32, 0.05], kR: [0.4, 0.8, -0.3], py: 25, cy: 10 }, KICK_STEP), 130, 1, { e: 'lin', fx: 'anR' }), F(LOWKICK, 130, 2, { e: 'snap', fx: 'anR', hit: true }), F(LOWKICK, 110, 3), F(G, 360, 3)],
    ['Passo pra fora com o pé da frente.', 'Gire o quadril e desça a canela na coxa dele, levemente de cima pra baixo.', 'Mão da frente no rosto: ele pode devolver um soco.', 'Volte pra base.'],
    ['Chutar sem preparar (com socos antes fica mais fácil acertar).', 'Acertar com o pé no joelho (machuca você).', 'Chutar de longe demais.'], { cam: 10 }),
  T('chuteesq', ['muaythai', 'mma'], 'Chutes', 'Chute de esquerda (troca de base)', 'Troca os pés rápido e chuta com a perna da frente.',
    [F(G, 450, 0, { hi: ['anL'] }), F(SW_AIR, 110, 0, { e: 'snap', fx: 'anL', hi: ['anL', 'anR'] }), F(G_S, 110, 0, { hi: ['anR'] }), F(SWK_CH, 150, 1, { e: 'lin', fx: 'anL', hi: ['pel'] }), F(SWK, 140, 2, { e: 'snap', fx: 'anL', hit: true }), F(SWK, 120, 2), F(SWK_CH, 220, 3), F(G_S, 260, 3), F(G, 380, 3)],
    ['Pulinho curto: o pé esquerdo vai pra trás e o direito pra frente.', 'Agora a esquerda ficou atrás: gire no pé direito e jogue o quadril.', 'A canela esquerda acerta o corpo (fígado do lado dele).', 'Volte pra guarda normal.'],
    ['Troca de base lenta (avisa o chute).', 'Chutar sem girar o pé de apoio.', 'Baixar as duas mãos.'], { cam: 15 }),
  T('teep', ['muaythai', 'mma'], 'Chutes', 'Teep (chute frontal)', 'O "jab" das pernas: empurra e controla a distância.',
    [F(G, 450, 0), F(TEEP_CH, 190, 0, { hi: ['knL'] }), F(TEEP, 150, 1, { e: 'snap', fx: 'anL', hit: true, hi: ['pel'] }), F(TEEP, 140, 2, { hi: ['shL'] }), F(TEEP_CH, 180, 3), F(G, 300, 3)],
    ['Levante o joelho da frente bem alto.', 'Empurre com a sola do pé, estendendo o quadril pra frente.', 'O tronco inclina um pouco pra trás pra equilibrar.', 'Recolha o joelho e pise de volta na base.'],
    ['Chutar com a perna esticada desde o início (sem levantar o joelho).', 'Inclinar pra trás demais e sair da base.', 'Baixar as mãos.'], { cam: 5 }),
  // ===== JOELHOS E COTOVELOS =====
  T('joelhada', ['muaythai', 'mma'], 'Joelhos e cotovelos', 'Joelhada reta', 'No clinch ou na entrada: o quadril faz o golpe.',
    [F(G, 400, 0), F(CLINCH, 230, 0, { hi: ['haL', 'haR'] }), F(KNEE, 170, 1, { e: 'snap', fx: 'knR', hit: true, hi: ['pel'] }), F(KNEE, 120, 2), F(CLINCH, 220, 3), F(G, 300, 3)],
    ['Mãos atrás da cabeça do adversário (clinch).', 'Puxe com os braços enquanto o quadril vai pra frente.', 'O joelho sobe reto, ponta do pé pra baixo.', 'Volte pra base, pronto pra outra.'],
    ['Inclinar pra frente e "dar" o joelho só com a perna.', 'Soltar o clinch na hora do golpe.', 'Ficar na ponta do pé de apoio sem equilíbrio.']),
  T('joelhadadiag', ['muaythai'], 'Joelhos e cotovelos', 'Joelhada diagonal (no clinch)', 'Entra pelo lado, nas costelas.',
    [F(G, 400, 0), F(CLINCH, 230, 0, { hi: ['haL', 'haR'] }), F(KNEE_D_MID, 160, 1, { e: 'lin', fx: 'knR', hi: ['pel'] }), F(KNEE_D, 150, 2, { e: 'snap', fx: 'knR', hit: true }), F(KNEE_D, 200, 2), F(CLINCH, 220, 3), F(G, 300, 3)],
    ['Clinch firme, puxando a cabeça dele pro lado oposto.', 'Gire o quadril e traga o joelho em diagonal.', 'Acerte as costelas com a ponta do joelho.', 'Alterne os lados.'],
    ['Abrir o joelho demais (vira empurrão).', 'Soltar o pescoço dele.', 'Ficar parado depois da joelhada.'], { cam: 76, tilt: 22, zoom: 1.1 }),
  T('cotovelada', ['muaythai', 'mma'], 'Joelhos e cotovelos', 'Cotovelada horizontal', 'Curta, de perto, como um gancho.',
    [F(G, 450, 0), F(P({ cy: -55 }), 140, 0, { e: 'load' }), F(ELBOW_MID, 110, 1, { e: 'lin', fx: 'elR', hi: ['anR'] }), F(ELBOW, 140, 2, { e: 'snap', fx: 'elR', hit: true, hi: ['pel'] }), F(ELBOW, 200, 2, { hi: ['elR'] }), F(G, 320, 3)],
    ['Bem perto do adversário.', 'Gire o pé de trás e o quadril, como num gancho.', 'A ponta do cotovelo passa na altura da sobrancelha dele.', 'A outra mão protege o rosto.'],
    ['Usar de longe.', 'Abrir o braço (vira tapa).', 'Esquecer a guarda da outra mão.'], { cam: 76, tilt: 22, zoom: 1.15 }),
  T('cotoveladasobe', ['muaythai'], 'Joelhos e cotovelos', 'Cotovelada ascendente', 'De baixo pra cima, por dentro da guarda.',
    [F(G, 450, 0), F(ELBOW_UP_DIP, 220, 0, { e: 'load', hi: ['knL', 'knR'] }), F(ELB_UP, 160, 1, { e: 'snap', fx: 'elR', hit: true }), F(ELB_UP, 160, 2), F(G, 340, 3)],
    ['Dobre os joelhos.', 'Empurre o chão e suba o cotovelo por dentro, na linha do queixo.', 'A mão passa do lado da sua orelha.', 'Volte pra guarda.'],
    ['Subir de longe.', 'Abrir o cotovelo pro lado.', 'Ficar com o rosto aberto embaixo.'], { cam: 38, tilt: 6 }),
  T('checar', ['muaythai', 'mma'], 'Defesa', 'Checar o chute', 'Bloqueia o chute baixo com a canela.',
    [F(G, 480, 0), F(CHECK, 170, 0, { e: 'snap', hi: ['knL'] }), F(CHECK, 360, 1, { hi: ['anL'] }), F(G, 220, 2), F(JAB, 150, 3, { e: 'snap', fx: 'haL', hit: true }), F(G, 260, 3)],
    ['Leia o chute vindo na sua perna da frente.', 'Levante o joelho e vire a canela pra fora, encontrando o chute.', 'Guarda alta: pode vir soco junto.', 'Pise e devolva na hora.'],
    ['Checar com a perna mole (dói igual).', 'Levantar a perna tarde.', 'Baixar a guarda ao checar.'], { cam: 35 }),
  // ===== QUEDAS =====
  T('double', ['mma', 'jiu'], 'Quedas', 'Queda de duas pernas (double leg)', 'Troca de nível, entra fundo e empurra.',
    [F(G, 450, 0), F(LEVEL, 220, 0, { hi: ['knL', 'knR'] }), F(SHOT, 230, 1, { e: 'snap', fx: 'pel', hi: ['knL'] }), F(DL_GRAB, 260, 2, { hi: ['haL', 'haR'] }), F(DL_LIFT, 320, 3, { fx: 'pel', hit: true, hi: ['pel'] }), F(DL_TOP, 420, 3), F(DL_TOP, 420, 3), F(G, 420, 0)],
    ['Troque de nível com as pernas, costas retas, olhando pra frente.', 'Passo fundo entre os pés dele; o joelho da frente quase encosta no chão.', 'Abrace as duas pernas atrás dos joelhos, juntando uma na outra, cabeça colada no lado dele.', 'Levante o joelho e o quadril, tirando os pés dele do chão: ele cai de costas.'],
    ['Abaixar a cabeça e olhar pro chão.', 'Entrar de longe (dá tempo de ele fazer sprawl).', 'Parar no meio: a queda é um movimento contínuo.'], { cam: 12, ox: -25 }),
  T('sprawl', ['mma', 'jiu'], 'Quedas', 'Sprawl', 'A defesa de queda: tira as pernas e cai com o quadril.',
    [F(G, 450, 0), F(G, 260, 0, { hi: ['pel'] }), F(SPR2, 240, 1, { e: 'snap', fx: 'anR', hi: ['anL', 'anR'] }), F(SPR2, 420, 2, { hi: ['pel'] }), F(SPR_UP2, 320, 3), F(G, 380, 3)],
    ['Ele abaixa e entra nas suas pernas.', 'Jogue as pernas pra trás, bem abertas, longe das mãos dele.', 'Afunde o quadril nas costas dele e empurre a cabeça pra baixo.', 'Levante e volte pra base antes dele.'],
    ['Cair de joelhos (ele termina a queda).', 'Quadril alto: o peso não chega nele.', 'Demorar pra reagir.'], { cam: 10, ox: 70 }),
  // ===== CHÃO =====
  T('ponte', ['jiu', 'mma'], 'Chão', 'Ponte (upa)', 'O motor de toda fuga por baixo.',
    [F(LIE, 520, 0), F(BRIDGE, 240, 1, { e: 'snap', fx: 'pel', hi: ['pel', 'anL', 'anR'] }), F(BRIDGE, 320, 2, { hi: ['shL', 'shR'] }), F(LIE, 420, 3)],
    ['Deitado, pés plantados perto do quadril.', 'Empurre o chão com os pés e jogue o quadril pro teto.', 'O peso vai pros ombros (nunca pro pescoço).', 'Desça controlando.'],
    ['Pés longe do quadril: a ponte perde força.', 'Empurrar com o pescoço.', 'Fazer devagar: a ponte é explosiva.'], { gloves: false, cam: 25, ox: 15, zoom: 1.3 }),
  T('fuga', ['jiu', 'mma'], 'Chão', 'Fuga de quadril', 'Criar espaço por baixo e recuperar a guarda.',
    [F(FU0, 520, 0, { hi: ['haL', 'haR'] }), F(FU1, 300, 1, { hi: ['anL', 'anR'] }), F(FU2, 340, 2, { fx: 'pel', hi: ['pel', 'haL', 'haR'] }), F(FU3, 300, 3, { hi: ['knR'] }), F(FU3, 420, 3), F(FU0, 520, 0)],
    ['Ele está nos 100 kg: mãos fazendo moldura no pescoço e no ombro dele.', 'Pés plantados: vire de lado, de frente pra ele, apoiado no ombro.', 'Leve o quadril pra trás enquanto as mãos empurram ("moldura").', 'Recolha o joelho pro espaço que abriu.'],
    ['Ficar reto de costas (o quadril não sai).', 'Empurrar com os braços esticados sem mover o quadril.', 'Esquecer de colocar o joelho no espaço.'], { gloves: false, cam: 30, ox: 25, zoom: 1.3 }),
  T('levantada', ['jiu', 'mma'], 'Chão', 'Levantada técnica', 'Levantar do chão sem se expor.',
    [F(SIT, 520, 0, { hi: ['haR'] }), F(STAND1, 300, 1, { fx: 'anR', hi: ['haR', 'anL'] }), F(STAND1, 200, 2), F(STAND2, 340, 3), F(STAND2, 400, 3)],
    ['Sentado, mão de trás apoiada no chão atrás de você, outra mão protegendo o rosto.', 'Pé da frente plantado, levante o quadril apoiado na mão e no pé.', 'A perna de baixo passa por trás, entre a mão e o pé.', 'Já levanta em guarda, recuando.'],
    ['Levantar de frente, de cabeça baixa.', 'Tirar a mão do chão cedo demais.', 'Levantar perto do adversário.'], { gloves: false, cam: 18, zoom: 1.3 })
,
  // ===== JIU-JITSU: GUARDA, PASSAGEM, RASPAGEM, FINALIZAÇÃO =====
  T('upa', ['jiu', 'mma'], 'Chão', 'Upa (fuga da montada)', 'Prende um braço e o pé dele, faz ponte por cima do ombro e rola.',
    [F(LIE, 480, 0), F(UPD1, 280, 0, { hi: ['haL', 'haR'] }), F(UPD1, 200, 1, { hi: ['anR'] }), F(UPD2, 260, 2, { e: 'snap', fx: 'pel', hi: ['pel'] }), F(UPD3, 320, 2, { fx: 'pel', hi: ['shR'] }), F(UPD4, 460, 3, { fx: 'pel', hi: ['pel'] }), F(UPD4, 560, 3), F(LIE, 380, 0)],
    ['Prenda o braço dele junto ao seu peito (as duas mãos no mesmo braço).', 'Com o pé do mesmo lado, prenda o pé dele por fora.', 'Ponte explosiva por cima do ombro do lado preso: ele não tem braço nem pé pra apoiar.', 'Role junto e caia dentro da guarda dele, postura alta.'],
    ['Ponte reta pra cima (sem direção, ele só se equilibra).', 'Prender o braço sem prender o pé do mesmo lado.', 'Esperar ele subir a montada no peito.'], { gloves: false, cam: 28, ox: 15, zoom: 1.3 }),
  T('basecombate', ['jiu'], 'Guarda e passagem', 'Postura na guarda (base de combate)', 'A base pra não ser raspado nem finalizado dentro da guarda.',
    [F(KNEEL_D, 520, 0, { hi: ['knL', 'knR'] }), F(CBASE_D, 300, 1, { fx: 'anL', hi: ['anL'] }), F(CBASE_D, 260, 2, { hi: ['pel'] }), F(CBASE_PD, 260, 2, { e: 'snap', hi: ['haL', 'haR'] }), F(CBASE_PD, 500, 3, { hi: ['head'] }), F(KNEEL_D, 500, 0)],
    ['Dentro da guarda, de joelhos: mãos no quadril ou na faixa dele.', 'Suba um pé ao lado do quadril dele (base de combate), o outro joelho fica no chão.', 'Coluna reta, cabeça alta, cotovelos fechados.', 'Empurre o quadril dele pra baixo com as mãos: é daqui que você abre a guarda.'],
    ['Coluna curvada e cabeça baixa (vira presa pro triângulo e pra guilhotina).', 'Mãos no peito dele (braço fica fácil de pegar).', 'Joelhos colados um no outro (base estreita, raspagem fácil).'], { gloves: false, cam: 40 }),
  T('toreando', ['jiu', 'mma'], 'Guarda e passagem', 'Passagem toreando', 'Agarra as calças, joga as pernas pro lado e passa pela lateral.',
    [F(TORD0, 520, 0, { hi: ['haL', 'haR'] }), F(TORD0, 200, 1, { hi: ['pel'] }), F(TORD1, 280, 1, { e: 'snap', fx: 'haR', hi: ['haL', 'haR'] }), F(TORD2, 360, 2, { fx: 'pel', hi: ['anR'] }), F(TORD3, 360, 3, { hi: ['pel'] }), F(TORD3, 560, 3), F(TORD0, 420, 0)],
    ['Em pé, quadril baixo e longe dos pés dele; pegue as calças na altura do joelho.', 'Empurre as duas pernas dele pro chão, pra um lado, com força.', 'Circule rápido pro lado oposto, passando pela linha das pernas.', 'Desça o peito no lado dele e estabilize nos 100 kg.'],
    ['Ficar parado em frente às pernas (ele recompõe a guarda).', 'Quadril alto e perto (ele puxa você pra guarda).', 'Soltar as pernas antes de cravar o peso no lado.'], { gloves: false, cam: 55 }),
  T('tesoura', ['jiu'], 'Guarda e passagem', 'Raspagem de tesoura', 'Canela atravessada na barriga dele, a perna de baixo corta a base.',
    [F(GB0, 480, 0), F(TSD1, 340, 0, { hi: ['knL', 'haL', 'haR'] }), F(TSD1, 220, 1, { hi: ['anR'] }), F(TSD2, 240, 2, { e: 'snap', fx: 'anR', hi: ['anR', 'anL'] }), F(TSD2, 260, 2), F(TSD3, 460, 3, { fx: 'pel', hi: ['pel'] }), F(TSD3, 560, 3), F(GB0, 380, 0)],
    ['Na guarda, gola numa mão e manga na outra; vire de lado.', 'A canela de cima atravessa a barriga dele; a perna de baixo fica no chão, atrás do joelho dele.', 'Puxe a gola e a manga enquanto as pernas fecham como tesoura: a de cima empurra, a de baixo varre.', 'Ele cai de costas e você sobe junto pra montada.'],
    ['Ficar de costas reto (a tesoura não tem força).', 'Não puxar com as mãos: as pernas sozinhas não derrubam.', 'Raspar e ficar deitado, sem subir junto.'], { gloves: false, cam: 30, ox: 15, zoom: 1.3 }),
  T('triangulo', ['jiu', 'mma'], 'Guarda e passagem', 'Triângulo', 'Uma perna por cima do ombro, fecha o "4" e puxa a cabeça.',
    [F(GB0, 520, 0, { hi: ['haL', 'haR'] }), F(TRD0, 300, 0, { hi: ['haL', 'haR'] }), F(TRD1, 320, 1, { fx: 'anL', hi: ['anL'] }), F(TRD2, 320, 2, { e: 'snap', fx: 'anL', hi: ['knR', 'anL'] }), F(TRD2, 380, 3, { hi: ['haL', 'haR', 'pel'] }), F(TRD2, 300, 3), F(GB0, 640, 0)],
    ['Da guarda, controle um braço dele pra dentro e o outro pra fora.', 'Suba o quadril e passe a perna por cima do ombro dele, atrás do pescoço.', 'Feche o "4": o pé de cima trava atrás do seu próprio joelho.', 'Puxe a cabeça dele, aperte os joelhos e ajuste o ângulo virando o quadril.'],
    ['Deixar os dois braços dele do mesmo lado (não é triângulo, é só guarda).', 'Ficar reto de frente pra ele (corte o ângulo virando o quadril).', 'Esquecer de puxar a cabeça (ele posta e escapa).'], { gloves: false, cam: 30, ox: 15, zoom: 1.3 }),
  // ===== NOVAS (v3.31): karatê, movimentação, chute alto, clinch, single leg, armlock =====
  T('kizami', ['karate'], 'Socos', 'Kizami-zuki', 'O soco da mão da frente com deslize: rápido, pra marcar ponto.',
    [F(KA, 500, 0), F(KZ1, 170, 1, { fx: 'anL', hi: ['anL'] }), F(KZ2, 120, 1, { e: 'snap', fx: 'haL', hit: true }), F(KZ3, 160, 2, { fx: 'anR', hi: ['anR'] }), F(KZ4, 200, 3, { fx: 'anR', hi: ['anR'] }), F(KA, 260, 3, { fx: 'anL' })],
    ['Kamae: de lado, mão da frente na altura do peito.', 'O pé da frente desliza rente ao chão e o soco sai junto, reto.', 'O pé de trás desliza atrás e recupera a base.', 'Volta deslizando: primeiro o pé de trás, depois o da frente.'],
    ['Soltar o soco depois do passo (chega atrasado).', 'Puxar o braço pra trás antes (avisa o golpe).', 'Ficar parado na frente depois de pontuar.'], { gloves: false, cam: 30, tilt: 22, props: PRINTS(KA) }),
  T('gyaku', ['karate'], 'Socos', 'Gyaku-zuki', 'O soco reverso: a mão de trás, com a força do quadril.',
    [F(KA, 480, 0), F(GYA_L, 150, 0, { e: 'load' }), F(GYA, 160, 1, { e: 'snap', fx: 'haR', hit: true, hi: ['pel', 'anR'] }), F(GYA, 140, 2, { hi: ['haL'] }), F(KA, 380, 3)],
    ['Da kamae, o quadril começa o giro.', 'O pé de trás empurra o chão e o quadril fica de frente.', 'A mão de trás sai reta e a da frente puxa pra cintura (hikite).', 'Volta pra kamae protegendo o rosto.'],
    ['Soco só de braço, sem girar o quadril.', 'Inclinar o tronco pra frente.', 'Deixar a mão da frente caída sem voltar pra guarda.'], { gloves: false, cam: 16 }),
  T('maegeri', ['karate'], 'Chutes', 'Mae-geri', 'O chute frontal: sobe o joelho e estica, acertando com a planta do pé.',
    [F(KA, 460, 0), F(MAE_CH, 200, 0, { hi: ['knR'] }), F(MAE, 150, 1, { e: 'snap', fx: 'anR', hit: true }), F(MAE, 120, 2), F(MAE_CH, 180, 3), F(KA, 320, 3)],
    ['Sobe o joelho de trás bem alto, apontando pro alvo.', 'Estica a perna e empurra o quadril pra frente.', 'Acerta com a planta do pé (dedos puxados pra cima).', 'Recolhe o joelho antes de pisar.'],
    ['Chutar com a perna esticada desde o chão.', 'Acertar com os dedos esticados (machuca).', 'Largar a perna sem recolher.'], { gloves: false, cam: 6 }),
  T('mawashigeri', ['karate'], 'Chutes', 'Mawashi-geri jodan', 'O chute circular na cabeça: joelho alto e estala com o peito do pé.',
    [F(KA, 460, 0), F(MAW_CH, 200, 0, { e: 'lin', hi: ['knR', 'anL'] }), F(MAW, 150, 1, { e: 'snap', fx: 'anR', hit: true }), F(MAW, 120, 2, { hi: ['pel'] }), F(MAW_CH, 200, 3), F(KA, 340, 3)],
    ['Sobe o joelho de trás de lado, bem alto.', 'Gira o pé de apoio: o calcanhar aponta pro alvo.', 'Estala a perna e acerta com o peito do pé, na cabeça.', 'Recolhe pelo mesmo caminho e volta pra kamae.'],
    ['Não girar o pé de apoio (trava o quadril).', 'Baixar as mãos durante o chute.', 'Empurrar em vez de estalar e recolher.'], { gloves: false, cam: 8 }),
  T('yokogeri', ['karate'], 'Chutes', 'Yoko-geri', 'O chute lateral: o calcanhar empurra em linha reta.',
    [F(KA, 460, 0), F(YOK_CH, 220, 0, { hi: ['knL'] }), F(YOK, 160, 1, { e: 'snap', fx: 'anL', hit: true }), F(YOK, 130, 2), F(YOK_CH, 200, 3), F(KA, 340, 3)],
    ['Fica bem de lado e sobe o joelho da frente na frente do peito.', 'Gira o pé de apoio pra trás.', 'Empurra o calcanhar reto até o alvo, tronco inclina pra equilibrar.', 'Recolhe o joelho e pisa de volta.'],
    ['Chutar de frente (vira um mae-geri torto).', 'Acertar com a ponta do pé.', 'Cair pra trás depois do chute.'], { gloves: false, cam: 4 }),
  T('ageuke', ['karate'], 'Defesa', 'Age-uke (defesa alta)', 'O antebraço sobe e desvia o golpe acima da cabeça.',
    [F(KA, 480, 0), F(AGE0, 200, 0, { hi: ['haL'] }), F(AGE, 170, 1, { e: 'snap', fx: 'haL', hi: ['elL'] }), F(AGE, 300, 2), F(KA, 420, 3)],
    ['Da guarda, o braço que defende começa perto do quadril.', 'Sobe girando o antebraço até acima da testa.', 'O cotovelo fica um pouco à frente da cabeça, inclinado.', 'A outra mão puxa pra cintura e já prepara o contra-ataque.'],
    ['Bloquear em cima da cabeça, sem inclinação (o golpe escorrega pro rosto).', 'Levantar o ombro junto.', 'Esquecer de contra-atacar.'], { gloves: false, cam: 40 }),
  T('gedanbarai', ['karate'], 'Defesa', 'Gedan-barai (defesa baixa)', 'Varre pra baixo e pra fora o chute ou soco baixo.',
    [F(KA, 480, 0), F(GED0, 200, 0, { hi: ['haL'] }), F(GED, 170, 1, { e: 'snap', fx: 'haL' }), F(GED, 280, 2), F(KA, 420, 3)],
    ['A mão que defende começa perto da orelha oposta.', 'Desce em diagonal, varrendo pra fora.', 'Termina acima do joelho da frente, braço quase esticado.', 'Volta pra guarda.'],
    ['Defender só com a mão, sem o antebraço.', 'Abaixar o tronco junto.', 'Varrer pra dentro, trazendo o golpe pro corpo.'], { gloves: false, cam: 30 }),
  T('tsugiashi', ['karate'], 'Movimentação', 'Deslize (tsugi-ashi)', 'Entrar e sair da distância sem cruzar os pés.',
    [F(KA, 480, 0), F(TS_F1, 200, 0, { hi: ['anL'] }), F(TS_F2, 220, 1, { hi: ['anR'] }), F(TS_F2, 200, 1), F(TS_B1, 220, 2, { hi: ['anR'] }), F(KA, 260, 3)],
    ['Kamae, peso na ponta dos pés.', 'O pé da frente desliza pra frente e o de trás acompanha a mesma distância.', 'Pra sair, o pé de trás recua primeiro e o da frente acompanha.', 'A base nunca diminui nem aumenta.'],
    ['Cruzar os pés.', 'Saltar alto (fica sem base no ar).', 'Mover o tronco antes das pernas.'], { gloves: false, cam: 14 }),
  T('ganchocorpo', SC, 'Socos', 'Cruzado no corpo', 'Desce com as pernas e acerta a costela ou o fígado.',
    [F(G, 480, 0), F(BHOOK_LOAD, 200, 0, { e: 'load', hi: ['knL', 'knR'] }), F(BHOOK, 170, 1, { e: 'snap', fx: 'haL', hit: true, hi: ['pel'] }), F(BHOOK, 120, 2), F(G, 360, 3)],
    ['Dobre os joelhos e incline pro lado da frente.', 'Gire o pé e o quadril, como no cruzado.', 'O soco entra em arco na altura da costela.', 'Sobe já em guarda, mão de trás no rosto.'],
    ['Abaixar só o tronco.', 'Abrir demais o braço (fica lento).', 'Ficar embaixo depois do golpe.'], { cam: 40 }),
  T('passos', ['boxe', 'muaythai', 'karate'], 'Movimentação', 'Passos: entra, sai e lateral', 'O pé do lado pra onde você vai se move primeiro.',
    [F(G, 460, 0), F(PS_F1, 220, 0, { fx: 'anL', hi: ['anL'] }), F(PS_F2, 220, 0, { fx: 'anR', hi: ['anR'] }), F(PS_B1, 220, 1, { fx: 'anR', hi: ['anR'] }), F(G, 240, 1, { fx: 'anL', hi: ['anL'] }), F(PS_L1, 240, 2, { fx: 'anL', hi: ['anL'] }), F(PS_L2, 240, 2, { fx: 'anR', hi: ['anR'] }), F(PS_R1, 240, 2, { fx: 'anR', hi: ['anR'] }), F(G, 300, 3, { fx: 'anL', hi: ['anL'] })],
    ['Pra frente: o pé da frente anda, o de trás acompanha.', 'Pra trás: o pé de trás sai primeiro.', 'Pro lado: o pé daquele lado vai primeiro, o outro acompanha.', 'A distância entre os pés não muda; mãos na guarda.'],
    ['Cruzar os pés.', 'Pular em vez de deslizar.', 'Andar com o peso todo no calcanhar.'], { cam: 35, tilt: 55, zoom: 0.95, props: PRINTS(G) }),
  T('chutealto', ['muaythai'], 'Chutes', 'Chute alto (na cabeça)', 'O mesmo chute de direita, só que na altura da cabeça.',
    [F(G, 450, 0), F(KICK_STEP, 160, 0, { hi: ['anL'] }), F(KICK_CH, 160, 1, { e: 'lin', fx: 'anR', hi: ['pel'] }), F(HKICK, 150, 2, { e: 'snap', fx: 'anR', hit: true }), F(HKICK, 130, 3), F(KICK_CH, 220, 3), F(G, 320, 3)],
    ['Passo pra fora com o pé da frente.', 'Gire o pé de apoio e jogue o quadril mais pra cima.', 'A canela acerta o pescoço ou a cabeça; o tronco inclina pra trás.', 'O braço da frente protege o rosto o tempo todo.'],
    ['Tentar chutar alto sem girar o pé de apoio.', 'Abaixar as duas mãos.', 'Chutar alto sem mobilidade de quadril (aqueça bem antes).'], { cam: 8 }),
  T('clinch', ['muaythai'], 'Joelhos e cotovelos', 'Entrada no clinch', 'Mãos na nuca, cotovelos fechados e puxa pra baixo.',
    [F(G, 460, 0), F(CL_REACH, 200, 0, { hi: ['haL', 'haR'] }), F(CL_PULL, 220, 1, { fx: 'haL', hi: ['elL', 'elR'] }), F(KNEE, 170, 2, { e: 'snap', fx: 'knR', hit: true, hi: ['pel'] }), F(CL_PULL, 220, 3), F(G, 380, 3)],
    ['Entra com as mãos por dentro, uma sobre a outra na nuca dele.', 'Cotovelos fechados apertando o pescoço.', 'Puxa a cabeça pra baixo e já sobe a joelhada.', 'Postura alta: quadril pra frente, você por cima.'],
    ['Segurar com os cotovelos abertos (ele escapa).', 'Puxar com os braços esticados, longe do corpo.', 'Inclinar pra frente e perder a postura.'], { cam: 30 }),
  T('singleleg', ['jiu', 'mma'], 'Quedas', 'Queda de uma perna (single leg)', 'Entra numa perna, levanta ela e tira o equilíbrio.',
    [F(G, 460, 0), F(LEVEL, 200, 0, { hi: ['knL', 'knR'] }), F(SL_SHOT, 220, 1, { fx: 'pel', hi: ['haL', 'haR'] }), F(SL_KNEE, 220, 2, { hi: ['knR'] }), F(SL_UP, 260, 3, { hi: ['haL', 'haR'] }), F(SL_UP, 300, 3), F(G, 420, 3)],
    ['Muda o nível com as pernas, olhando pra frente.', 'Entra na perna da frente dele, cabeça encostada no peito.', 'Joelho de trás no chão, abraça a perna na altura do joelho.', 'Levanta com a perna presa e gira pra derrubar.'],
    ['Abaixar só o tronco (ele faz sprawl em você).', 'Cabeça pra baixo, olhando pro chão.', 'Segurar o pé em vez do joelho.'], { gloves: false, cam: 40 }),
  T('armlock', ['jiu', 'mma'], 'Guarda e passagem', 'Armlock da guarda', 'Ângulo, perna por cima da cabeça dele e quadril pra cima.',
    [F(GB0, 520, 0), F(ALD1, 300, 1, { fx: 'pel', hi: ['pel', 'haL', 'haR'] }), F(ALD2, 280, 2, { fx: 'anL', hi: ['anL'] }), F(ALD3, 280, 3, { e: 'snap', fx: 'pel', hit: true, hi: ['pel'] }), F(ALD3, 440, 3), F(GB0, 620, 0)],
    ['Da guarda fechada, prende o braço dele no seu peito.', 'Pé no quadril dele e gira o corpo, fazendo ângulo.', 'A perna de cima passa por cima da cabeça dele.', 'Joelhos fechados e quadril pra cima: o cotovelo dele fica preso.'],
    ['Fazer sem ângulo (fica de frente e ele tira o braço).', 'Joelhos abertos.', 'Esquecer de controlar o punho dele contra o peito.'], { gloves: false, cam: 30, ox: 15, zoom: 1.3 }),
  T('agarrachute', ['muaythai'], 'Defesa', 'Agarrar o chute e devolver', 'Prende a perna dele no braço e solta o direto antes que ele caia em base.',
    [F(G, 460, 0), F(CATCH, 180, 0, { e: 'snap', hi: ['haL'] }), F(CATCH, 200, 1, { hi: ['elL'] }), F(CATCH_X, 170, 2, { e: 'snap', fx: 'haR', hit: true, hi: ['pel'] }), F(CATCH_X, 160, 3), F(G, 400, 3)],
    ['Viu o chute no corpo: dá um passinho pra dentro e recebe com o braço da frente.', 'O antebraço passa por baixo da perna e prende contra a costela.', 'Ele fica numa perna só: é a hora de devolver.', 'Direto ou chute baixo na perna de apoio e solta a perna.'],
    ['Tentar agarrar de longe (o chute chega com força total).', 'Segurar com as duas mãos e baixar a guarda.', 'Ficar parado segurando sem contra-atacar.'], { cam: 26, partner: { d: 1.28 } }),
  T('deai', ['karate'], 'Defesa', 'Contra no tempo (deai)', 'Ele começa a entrar e você chega antes com o gyaku.',
    [F(KA, 520, 0), F(KA, 160, 0, { hi: ['head'] }), F(GYA_L, 120, 1, { e: 'load' }), F(DEAI, 150, 2, { e: 'snap', fx: 'haR', hit: true, hi: ['pel'] }), F(DEAI, 180, 3), F(KA, 420, 3)],
    ['Na distância, olhando o quadril e o ombro dele.', 'Ele começa a entrar: é o sinal.', 'O gyaku sai no mesmo instante, com o quadril, sem recuar.', 'Pontua e sai da linha dele.'],
    ['Esperar o golpe dele chegar pra reagir (aí já é tarde).', 'Recuar antes de contra-atacar.', 'Soco sem o quadril, que não pontua.'], { gloves: false, cam: 16, partner: { d: 1.45, gloves: false } }),
  T('mataleao', ['jiu', 'mma'], 'Chão', 'Mata-leão', 'Das costas: o braço passa por baixo do queixo, trava no bíceps e a outra mão vai na nuca.',
    [F(ML0, 520, 0, { hi: ['anL', 'anR'] }), F(ML0, 200, 0), F(ML1, 320, 1, { fx: 'haL', hi: ['elL'] }), F(ML2, 320, 2, { hi: ['haL', 'haR'] }), F(ML3, 320, 3, { e: 'inout', fx: 'elL', hit: true, hi: ['chest'] }), F(ML3, 520, 3), F(ML0, 700, 0)],
    ['Nas costas dele, com os ganchos: seus pés por dentro das coxas dele.', 'O braço de cima passa por baixo do queixo, com o cotovelo no meio do pescoço.', 'A mão desse braço segura a dobra do seu outro braço (no bíceps); a outra mão vai atrás da cabeça dele. Sem essa trava não aperta.', 'Feche os cotovelos e estufe o peito. Bateu, soltou na hora.'],
    ['Apertar o queixo em vez do pescoço (dói, mas não finaliza).', 'Cruzar os pés na frente dele: ele trava seu tornozelo.', 'Fazer força só com o braço, sem fechar os cotovelos.'], { gloves: false }),
  T('kimura', ['jiu', 'mma'], 'Guarda e passagem', 'Kimura da guarda', 'Ele apoia a mão no chão: você senta, prende o punho e trava o braço dele.',
    [F(GB0, 520, 0), F(GB0, 280, 0, { hi: ['head'] }), F(KMD1, 340, 1, { fx: 'haL', hi: ['haL', 'haR'] }), F(KMD2, 360, 3, { e: 'inout', fx: 'haR', hit: true, hi: ['haL', 'haR'] }), F(KMD2, 480, 3), F(GB0, 640, 0)],
    ['Guarda fechada: espere ele apoiar uma mão no chão.', 'Abra a guarda e sente de lado: a mão do mesmo lado segura o punho dele.', 'O outro braço passa por cima do braço dele e segura o seu próprio punho (o "4").', 'Deite de novo e gire o punho dele pras costas, devagar. Bateu, soltou.'],
    ['Segurar o punho sem passar o braço por cima do braço dele (ele puxa e solta).', 'Ficar de frente pra ele: deite em ângulo.', 'Girar rápido: no treino, gire devagar e solte quando ele bater.'], { gloves: false }),
  T('guilhotina', ['jiu', 'mma'], 'Guarda e passagem', 'Guilhotina da guarda', 'A cabeça dele desceu: o braço abraça o pescoço por baixo e o quadril empurra ele pra longe.',
    [F(GB0, 520, 0), F(GB0, 320, 0, { hi: ['head'] }), F(GUD1, 340, 1, { fx: 'haL', hi: ['haL', 'elL'] }), F(GUD2, 360, 3, { e: 'inout', fx: 'pel', hit: true, hi: ['pel', 'haL'] }), F(GUD2, 480, 3), F(GB0, 640, 0)],
    ['A cabeça dele desce do lado do seu ombro.', 'Seu braço passa por cima da nuca e o antebraço fica embaixo do pescoço dele.', 'A outra mão segura essa mão (palma com palma) junto ao seu peito.', 'Feche a guarda, empurre o quadril dele pra longe e puxe o antebraço pra cima. Bateu, soltou.'],
    ['Puxar só com os braços, sem esticar o corpo.', 'Antebraço no queixo em vez do pescoço.', 'Guarda aberta: ele passa e escapa.'], { gloves: false }),
  T('quebrapostura', ['jiu'], 'Guarda e passagem', 'Quebra de postura (guarda fechada)', 'Puxa com os joelhos e as mãos ao mesmo tempo: a cabeça dele desce no seu peito.',
    [F(GB0, 520, 0, { hi: ['anL', 'anR'] }), F(GB0, 220, 1, { hi: ['haL', 'haR'] }), F(GB1, 300, 2, { e: 'snap', fx: 'knL', hi: ['knL', 'knR', 'haL'] }), F(GB2, 360, 3, { hi: ['haL', 'haR'] }), F(GB2, 460, 3), F(GB0, 620, 0)],
    ['Guarda fechada: tornozelos cruzados nas costas dele.', 'Segure os punhos ou as mangas dele.', 'Puxe os joelhos pro peito e os braços dele pra fora, ao mesmo tempo.', 'Postura quebrada: abrace a cabeça e ataque (triângulo, armlock, raspagem).'],
    ['Puxar só com os braços (ele é mais forte que seus bíceps).', 'Guarda fechada parada, sem puxar: ele levanta a postura.', 'Abrir a guarda sem motivo.'], { gloves: false, cam: 30, ox: 15, zoom: 1.3 })
];

// ---------- técnicas em dupla ----------
const qOf = (t, i) => { for (let j = i; j >= 0; j--) if (t.frames[j].q) return t.frames[j].q; return t.frames.find(f => f.q)?.q || null; };
const DUO = {
  bloqueio: { o: { d: 1.15 }, q: [G, CROSS_LOAD, CROSS, G] },
  aparada: { o: { d: 1.1 }, q: [G, JAB, JAB, G, PHIT, G] },
  esquiva: { o: { d: 1.1, cam: 15, tilt: 50, fit: true, zmax: 1.05, props: PRINTS(G) }, q: [G, JAB, JAB, G, CROSS, CROSS, G] },
  pendulo: { o: { d: 0.85, cam: 20, tilt: 26, fit: true, zmax: 1.05 }, q: [G, HOOK_LOAD, PHB, PHC, G] },
  recuo: { o: { d: 1.12 }, q: [G, JAB, JAB, PHIT, G] },
  checar: { o: { d: 1.25 }, q: [G, LOWKICK, LOWKICK, Q(G, { _d: 1.08 }), Q(PHIT, { _d: 1.08 }), G] },
  clinch: { o: { d: 0.8 }, q: [Q(G, { _d: 1.0 }), G, PDOWN, PKNEED, PDOWN, Q(G, { _d: 1.0 })] },
  ageuke: { o: { d: 1.3, gloves: false, cam: 40, tilt: 10, fit: true, zmax: 1.05 }, q: [KA, KIZ_SL, PKZ, PKZ, KA] },
  sprawl: { o: { d: 1.15, cam: 30, tilt: 22, fit: true, zmax: 1.05 }, q: [G, PSH, PSFL, PSFL, PSKN, G] },
  double: { o: { d: 1.12, cam: 30, tilt: 14, fit: true, zmax: 1.0 }, q: [G, G, PDL1, PDL1, PDL2, PDL3, PDL3, G] },
  fuga: { o: { d: 0, gloves: false, cam: 25, tilt: 35, fit: true }, q: [PSC, PSC, PSC, PSC2, PSC2, PSC] },
  ganchocorpo: { o: { d: 1.0, cam: 40, tilt: 12, fit: true, zmax: 1.05 }, q: [G, G, PBODY, PBODY, G] },
  singleleg: { o: { d: 1.05, gloves: false }, q: [G, G, PSL1, PSL1, PSL2, PFALL, G] }
};
DUO.agarrachute = { o: { d: 1.28 }, q: [G, KICK_CH, PBKICK, PCAUGHT, Q(PCAUGHT, { lean: -30 }), G] };
DUO.deai = { o: { d: 1.45, gloves: false }, q: [KA, KA, KIZ_SL, Q(KIZ_SL, { lean: -10, cy: -40 }), KIZ_SL, KA] };
// em dupla: câmera mais de lado (um não cobre o outro) e a dupla centralizada no quadro
// <chao-duo-q>
const GUARD = 'mb mt ms mh pb pt ps pn ph pf mn mf';
DUO.quebrapostura = { o: { d: GD, gloves: false, fit: true, cam: 25, tilt: 35, ox: 20, zoom: 0.95, ord: GUARD }, q: [PG, PG, PG_PULL, PG_DOWN, PG_DOWN, PG] };
DUO.basecombate = { o: { d: BD, gloves: false, fit: true, cam: 25, tilt: 35, ox: 10, zoom: 0.95, ord: 'pb mb pt ps ph mt ms mn mh mf pn pf' }, q: [PB_PULL, PB, PB, PB_PUSH, PB_PUSH, PB_PULL] };
DUO.triangulo = { o: { d: GD, gloves: false, fit: true, cam: 25, tilt: 35, ox: 20, zoom: 0.95, ord: GUARD }, q: [PG, PT1, PT1, PT2, PT3, PT3, PG] };
DUO.armlock = { o: { d: GD, gloves: false, fit: true, cam: 25, tilt: 35, ox: 20, zoom: 0.95, ord: 'mb pb mt ms mh pt ps pn ph mn pf mf' }, q: [PG, PA1, PA2, PA3, PA3, PG] };
DUO.kimura = { o: { d: GD, gloves: false, fit: true, cam: 25, tilt: 35, ox: 20, zoom: 0.95, ord: 'mb mt ms mh pb pt ps pn ph mn pf mf' }, q: [PG, PK1, PK1, PK2, PK2, PG] };
DUO.guilhotina = { o: { d: GD, gloves: false, fit: true, cam: 25, tilt: 35, ox: 20, zoom: 0.95, ord: GUARD }, q: [PG, PG_DOWN, PGU1, PGU2, PGU2, PG] };
DUO.tesoura = { o: { d: GD, gloves: false, fit: true, cam: 25, tilt: 35, ox: 10, zoom: 0.9, ord: GUARD }, q: [PG, PG, PG, PS2, PS2B, PS3, PS3, PG] };
DUO.toreando = { o: { d: TO, gloves: false, fit: true, cam: 22, tilt: 35, ox: -20, zoom: 0.82, ord: 'pb mb pt ps pn ph pf mt ms mn mh mf' }, q: [PTO0, PTO0, PTO1, PTO2, PTO3, PTO3, PTO0] };
DUO.upa = { o: { d: 0, gloves: false, fit: true, cam: 25, tilt: 35, ox: 30, zoom: 0.95 }, q: [PM0, PM0, PM0, PM1, PM2, PM3, PM3, PM0] };
DUO.mataleao = { o: { d: 0, gloves: false, fit: true, cam: 12, tilt: 12, ox: -10, zoom: 1.1, props: () => [{ k: 'badge', text: 'Mão na dobra|do outro braço' }], ord: 'mb pb mt ms mh pt ps pn ph mn pf mf' }, q: [PML0, PML0, PML1, PML1, PML3, PML3, PML0] };
// </chao-duo-q>
// enquadramento automático (chão em dupla): mede os dois bonecos em todos os quadros e no meio deles e escolhe zoom/ox/oy
function fitView(t) {
  const a = t.cam * D, T = (t.tilt || 0) * D, ca = Math.cos(a), sa = Math.sin(a);
  let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
  const add = J => { for (const k in J) { const p = J[k], u = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca, v = p[1] * Math.cos(T) + z * Math.sin(T); u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); } };
  const n = t.frames.length;
  for (let i = 0; i < n; i++) for (const k of [0, 0.5]) {
    const A = t.frames[i], B = t.frames[(i + 1) % n]; add(solve(mix(A.p, B.p, k)));
    const qa = qOf(t, i), qb = qOf(t, (i + 1) % n), q = qa && qb ? mix(qa, qb, k) : qa || qb;
    if (q) add(placePartner(solve(q), q._d ?? t.partner.d ?? 1.1, q._dz ?? 0));
  }
  const tg = targetOf(t); if (tg) add({ tg });
  const PAD = 17, s = Math.sin(T), Z = Math.min(t.partner?.zmax ?? 1.3, (230 - 2 * PAD) / ((u1 - u0) * 96), (200 - 2 * PAD) / ((v1 - v0) * 96));
  const cx = 100 + (u0 + u1) / 2 * 96 * Z, cy = 150 + 40 * Z - 66 * s - (v0 + v1) / 2 * 96 * Z;
  t.zoom = +Z.toFixed(3); t.ox = Math.round(115 - cx); t.oy = Math.round(100 - cy);
}
for (const t of TECHNIQUES) { const x = DUO[t.id]; if (!x) continue; t.partner = x.o; t.cam = x.o.cam ?? 12; t.ox = x.o.ox ?? -Math.round((x.o.d ?? 1.1) * 46); t.zoom = x.o.zoom ?? 0.92; if (x.o.tilt) t.tilt = x.o.tilt; if (x.o.props) t.props = x.o.props; t.frames.forEach((f, i) => { if (x.q[i]) f.q = x.q[i]; }); if (x.o.fit) fitView(t); }
// revisão v3.34: enquadramento automático também nas técnicas solo refeitas
for (const t of TECHNIQUES) if (['overhand', 'pivo', 'chuteesq', 'cotoveladasobe', 'kizami', 'passos'].includes(t.id)) fitView(t);
for (const t of TECHNIQUES) if (['pivo', 'kizami', 'passos', 'esquiva'].includes(t.id)) t.noshadow = true;

export const CATS = ['Socos', 'Chutes', 'Joelhos e cotovelos', 'Defesa', 'Movimentação', 'Quedas', 'Chão', 'Guarda e passagem'];

export const TIRED = {
  title: 'Por que eu canso?',
  sub: 'Na maioria das vezes, o pulmão aguenta. São estes furos que esvaziam o tanque.',
  items: [
    ['Prende a respiração', 'Solte um "tss" curto em cada golpe. Respiração travada = cansaço dobrado.', null],
    ['Tensão o tempo todo', 'Ombros e mãos soltos entre os golpes; só aperta no impacto. Músculo tenso gasta energia parado.', null],
    ['Começa rápido demais', 'Os primeiros 30 s decidem o round: comece no ritmo que você aguenta até o fim e acelere no final.', null],
    ['Base aeróbia fraca', 'É ela que recupera você no minuto de descanso. 2 treinos leves e longos por semana fazem diferença.', 'mt-energia'],
    ['Tanque vazio', 'Pouco carboidrato ou pouco sono derrubam o desempenho mais do que parece.', 'carb-combate']
  ]
};
// versão da pessoa: muda a linguagem pelo esporte, a ordem pelo nível e pelo objetivo; mostra os 4 que mais importam
export function tiredFor(sport, level = 'intermediario', weak = []) {
  const it = Object.fromEntries(TIRED.items.map(x => [x[0], [...x]]));
  if (sport === 'jiu') {
    it['Prende a respiração'] = ['Prende a respiração', 'Solte o ar quando fizer força (ponte, pegada, explosão). No rola, respirar travado esvazia o tanque.', null];
    it['Tensão o tempo todo'] = ['Aperta tudo o tempo todo', 'Segure só o que importa e use quadril e peso. Pegada apertada sem parar queima o antebraço.', null];
    it['Começa rápido demais'] = ['Explode sem parar', 'Escapar no desespero cansa e não funciona: escolha o momento da explosão.', null];
  } else if (sport === 'karate') {
    it['Começa rápido demais'] = ['Fica parado no calcanhar', 'No kumite, ficar na ponta dos pés mantém a reação rápida; parado no calcanhar, cada entrada custa o dobro.', null];
  }
  let order = ['Prende a respiração', 'Tensão o tempo todo', 'Começa rápido demais', 'Base aeróbia fraca', 'Tanque vazio'];
  if (level === 'avancado') order = ['Base aeróbia fraca', 'Tanque vazio', 'Começa rápido demais', 'Tensão o tempo todo', 'Prende a respiração'];
  if (weak.some(w => /gas/.test(w))) order = ['Base aeróbia fraca', ...order.filter(k => k !== 'Base aeróbia fraca')];
  return order.map(k => it[k]).filter(Boolean).slice(0, 4);
}

// pose de impacto (miniatura)
export function peak(t) { return (t.frames.find(f => f.hit) || t.frames[Math.min(2, t.frames.length - 1)]).p; }
// alvo = onde a parte que golpeia chega no impacto (só nos golpes, não no chão/defesa)
export function targetOf(t) {
  const h = t.frames.find(f => f.hit && f.fx && f.fx !== 'pel'); if (!h || !t.gloves || t.partner) return null; // com parceiro, o alvo é ele
  return solve(h.p)[h.fx];
}
// um quadro qualquer (folha de revisão): i = índice do quadro
// parceiro (segundo boneco): q = pose dele no quadro (mesma convenção, olhando pra +X); _d = distância (m)
function partnerOf(t, q) { if (!t.partner || !q) return null; return { J: placePartner(solve(q), q._d ?? t.partner.d ?? 1.1, q._dz ?? 0), gloves: t.partner.gloves ?? t.gloves, front: !!(q._front ?? t.partner.front), ord: q._ord ?? t.partner.ord ?? null, act: q._act ? q._act.split(' ') : null }; }
export function techFrameSVG(t, i) { const k = Math.max(0, Math.min(i, t.frames.length - 1)), f = t.frames[k], J = solve(f.p); return draw(J, { gloves: t.gloves, cam: t.cam, ox: t.ox, oy: t.oy, noshadow: t.noshadow, act: t.act, tilt: t.tilt, zoom: t.zoom, target: targetOf(t), props: t.props?.(J), partner: partnerOf(t, qOf(t, k)), ...(t.body || {}) }); }
// meio do caminho entre o quadro i e o próximo (folha de revisão: confere a transição)
export function midFrameSVG(t, i, k = 0.5) { const a = t.frames[i], b = t.frames[(i + 1) % t.frames.length], J = solve(mix(a.p, b.p, k)), qa = qOf(t, i), qb = qOf(t, (i + 1) % t.frames.length); return draw(J, { gloves: t.gloves, cam: t.cam, ox: t.ox, oy: t.oy, noshadow: t.noshadow, tilt: t.tilt, zoom: t.zoom, partner: partnerOf(t, qa && qb ? mix(qa, qb, k) : qa || qb) }); }
export function thumbSVG(t) { const k = Math.max(0, t.frames.findIndex(f => f.hit)); return draw(solve(peak(t)), { gloves: t.gloves, cam: t.cam, ox: t.ox, oy: t.oy, noshadow: t.noshadow, act: t.act, tilt: t.tilt, zoom: t.zoom, target: targetOf(t), partner: partnerOf(t, qOf(t, k || Math.floor(t.frames.length / 2))) }); }

// ---------- animação ----------
export function animate(el, tech, onStep) {
  const fr = tech.frames;
  let i = 0, t0 = performance.now(), speed = 1, raf = 0, paused = false, pausedAt = 0, lastStep = -1;
  let trail = [], trail2 = [], burstT = 0, burstP = null, path = [];
  const target = targetOf(tech);
  function frame(now) {
    if (paused) return;
    const nextI = (i + 1) % fr.length, next = fr[nextI];
    let t = (now - t0) / (next.d * speed);
    if (t >= 1) {
      if (next.hit) burstT = now;
      i = nextI; t0 = now; t = 0;
      if (i === 0) { t0 = now + 450 * speed; trail = []; trail2 = []; path = []; }
    }
    const a = fr[i], b = fr[(i + 1) % fr.length];
    const k = EASE[b.e](Math.max(0, Math.min(1, t)));
    const J = solve(mix(a.p, b.p, k)), qa = qOf(tech, i), qb = qOf(tech, (i + 1) % fr.length), pq = qa && qb ? mix(qa, qb, k) : qa || qb;
    if (b.fx && t > 0) { trail.push(J[b.fx]); if (trail.length > 9) trail.shift(); if (target && b.fx !== 'pel' && (!path.length || Math.hypot(...J[b.fx].map((v, j) => v - path[path.length - 1][j])) > 0.015)) path.push(J[b.fx]); }
    else if (trail.length) trail.shift();
    let burst = null;
    const since = now - burstT;
    if (burstT && since < 260 * speed) { if (a.fx) burstP = J[a.fx]; burst = burstP ? { p: burstP, s: 1.15 - since / (260 * speed) * 0.6 } : null; }
    const show = k > 0.5 ? b : a;
    const po = partnerOf(tech, pq);
    if (b.pfx && po && t > 0) { trail2.push(po.J[b.pfx]); if (trail2.length > 10) trail2.shift(); } else if (trail2.length) trail2.shift();
    const o = { gloves: tech.gloves, partner: po, hi: show.hi, trail: trail.length > 1 ? trail : null, trail2: trail2.length > 1 ? trail2 : null, burst, cam: tech.cam, ox: tech.ox, oy: tech.oy, noshadow: tech.noshadow, act: tech.act, tilt: tech.tilt, zoom: tech.zoom, target, path: path.length > 2 ? path : null, props: tech.props ? tech.props(J) : null, ...(tech.body || {}) };
    el.innerHTML = tech.view2 ? dual(draw(J, o), draw(J, { ...o, ...tech.view2 })) : draw(J, o);
    if (show.step !== lastStep) { lastStep = show.step; onStep && onStep(show.step); }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return {
    stop() { cancelAnimationFrame(raf); paused = true; },
    setSpeed(s) { speed = s; },
    toggle() { if (paused) { paused = false; const dt = performance.now() - pausedAt; t0 += dt; burstT += dt; raf = requestAnimationFrame(frame); } else { paused = true; pausedAt = performance.now(); cancelAnimationFrame(raf); } return paused; }
  };
}
