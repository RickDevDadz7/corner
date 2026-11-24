// ============================================================
// RONIN — biblioteca de técnicas animadas (esqueleto com IK, traço próprio)
// Guarda ortodoxa: L = lado da frente (esquerdo), R = lado de trás (direito).
// ============================================================
import { solve, mix, draw, EASE } from './rig.js';

const D = Math.PI / 180;
// Guarda base
const G = { p: [0, 0.86, 0], py: -40, cy: -45, lean: 12, hL: [0.26, 0.17, 0.04], hR: [0.14, 0.21, -0.12], fL: [0.38, 0, -0.12], fR: [-0.3, 0, 0.12] };
const P = (o, from = G) => ({ ...from, ...o });
// quadro: pose, duração (ms), passo, opções { e: curva, fx: articulação com rastro, hit: estouro, hi: destaques }
const F = (p, d, step, o = {}) => ({ p, d, step, e: o.e || 'inout', fx: o.fx || null, hit: !!o.hit, hi: o.hi || [] });

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
const UPA_ROLL = P({ p: [0.12, 0.4, -0.12], lean: -110, tw: -55, hL: [0.12, 0.05, -0.1], hR: [0.16, 0.0, -0.18], fL: [0.42, 0, -0.26], fR: [0.5, 0.12, 0.12], kR: [0.4, 1, -0.6] }, LIE);
const UPA_TOP = { p: [0.1, 0.62, -0.2], py: 0, cy: 0, ay: 0, lean: 40, hL: [0.38, -0.32, 0.18], hR: [0.38, -0.32, -0.18], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6], fL: [-0.25, 0, -0.34], fR: [-0.25, 0, -0.02], kL: [0.6, -0.4, -0.4], kR: [0.6, -0.4, 0.4], tL: [-1, 0, 0], tR: [-1, 0, 0] };
// base de combate (postura dentro da guarda): de joelhos, sobe o pé da frente, coluna reta
const KNEEL = { p: [0, 0.5, 0], py: 0, cy: 0, ay: 0, lean: 25, hL: [0.38, -0.3, 0.15], hR: [0.38, -0.3, -0.15], eL: [-0.4, -1, 0.5], eR: [-0.4, -1, -0.5], fL: [-0.42, 0, -0.14], fR: [-0.42, 0, 0.14], kL: [1, -1, 0], kR: [1, -1, 0], tL: [-1, -0.2, 0], tR: [-1, -0.2, 0] };
const CBASE = { ...KNEEL, p: [0, 0.54, 0], lean: 6, py: -20, cy: -15, fL: [0.36, 0, -0.2], kL: [1, 0.6, 0], tL: [1, 0, -0.2], hL: [0.3, -0.3, 0.16], hR: [0.3, -0.3, -0.16] };
const CBASE_P = { ...CBASE, p: [0.02, 0.56, 0], lean: -2, hL: [0.22, -0.4, 0.2], hR: [0.22, -0.4, -0.2], eL: [-0.2, -1, 1], eR: [-0.2, -1, -1] };
// passagem toreando: agacha, segura as calças, joga as pernas pro lado e circula
const TOR0 = { p: [0, 0.7, 0], py: 0, cy: 0, ay: 0, lean: 32, hL: [0.5, -0.32, 0.18], hR: [0.5, -0.32, -0.18], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6], fL: [0.12, 0, -0.26], fR: [-0.2, 0, 0.26], tL: [1, 0, -0.3], tR: [1, 0, 0.3] };
const TOR1 = { ...TOR0, p: [0.02, 0.68, -0.12], cy: 20, hL: [0.42, -0.36, -0.22], hR: [0.36, -0.36, -0.5], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.8] };
const TOR2 = { ...TOR0, p: [0.18, 0.62, 0.36], py: -30, cy: -30, lean: 40, hL: [0.4, -0.4, -0.3], hR: [0.3, -0.42, -0.6], fL: [0.48, 0, 0.1], fR: [-0.05, 0, 0.6], tL: [0.6, 0, -0.8], tR: [1, 0, 0] };
const TOR3 = { ...TOR2, p: [0.3, 0.42, 0.34], lean: 52, hL: [0.42, -0.4, -0.3], hR: [0.34, -0.28, 0.1], fL: [0.5, 0, 0.0], fR: [-0.2, 0, 0.62] };
// raspagem de tesoura: de lado, canela atravessada na barriga dele, perna de baixo varre no chão
const SCI0 = P({ p: [0.1, 0.18, 0], lean: -98, tw: -60, fL: [0.58, 0.48, -0.05], kL: [0.4, 1, 0], tL: [0, 0, 1], fR: [0.5, 0.04, 0.2], kR: [0.5, 0.5, 0.6], hL: [0.36, 0.1, 0.12], hR: [0.3, -0.1, -0.14] }, LIE);
const SCI1 = P({ ...SCI0, fL: [0.15, 0.62, -0.25], kL: [0.2, 1, -0.4], fR: [0.95, 0.05, 0.12], kR: [0, 1, 0.3], hL: [0.3, 0.2, 0.3], hR: [0.32, 0.0, -0.2] }, LIE);
const SCI2 = { p: [0.42, 0.55, 0], py: 0, cy: 0, ay: 0, lean: 25, hL: [0.38, -0.32, 0.16], hR: [0.38, -0.32, -0.16], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6], fL: [0.15, 0, -0.38], fR: [0.15, 0, 0.38], kL: [0.8, -0.3, -0.5], kR: [0.8, -0.3, 0.5], tL: [-1, 0, 0], tR: [-1, 0, 0] };
// triângulo: perna por cima do ombro dele, fecha o "4" e puxa a cabeça
const TRI0 = P({ p: [0.1, 0.12, 0], fL: [0.62, 0.42, -0.2], fR: [0.62, 0.42, 0.2], kL: [0.2, 1, -0.4], kR: [0.2, 1, 0.4], tL: [0.4, 1, 0], tR: [0.4, 1, 0], hL: [0.38, -0.05, 0.12], hR: [0.38, -0.05, -0.12] }, LIE);
const TRI1 = P({ ...TRI0, p: [0.08, 0.16, 0], lean: -82, fL: [0.42, 0.92, -0.12], kL: [0.2, 1, -0.2], tL: [0, 1, 0.3], fR: [0.7, 0.34, 0.24], hL: [0.3, -0.1, -0.1], hR: [0.42, 0.02, -0.12] }, LIE);
const TRI2 = P({ ...TRI1, p: [0.06, 0.22, 0], lean: -74, tw: 25, fL: [0.62, 0.6, 0.28], kL: [0.3, 1, -0.7], tL: [0, 0, 1], fR: [0.46, 0.66, 0.42], kR: [0.4, 0.6, 1], hL: [0.36, -0.2, 0.0], hR: [0.36, -0.2, -0.08] }, LIE);
// quebra de postura na guarda fechada: pernas fechadas nas costas dele, puxa com joelhos e mãos
const GF0 = P({ p: [0.1, 0.13, 0], fL: [0.68, 0.36, 0.12], fR: [0.68, 0.36, -0.12], kL: [0.2, 1, -1], kR: [0.2, 1, 1], tL: [0, 0, 1], tR: [0, 0, -1], hL: [0.48, 0.12, 0.12], hR: [0.48, 0.12, -0.12], eL: [-1, 0, 1], eR: [-1, 0, -1] }, LIE);
const GF1 = P({ ...GF0, p: [0.1, 0.15, 0], lean: -86, fL: [0.36, 0.5, 0.1], fR: [0.36, 0.5, -0.1], kL: [0.5, 1, -1], kR: [0.5, 1, 1], hL: [0.22, -0.08, 0.14], hR: [0.22, -0.08, -0.14] }, LIE);

const LIMB = { haL: 'armL', elL: 'armL', haR: 'armR', elR: 'armR', anL: 'legL', knL: 'legL', anR: 'legR', knR: 'legR' };
const T = (id, sport, cat, n, sub, frames, steps, furos, opts = {}) => ({ id, sport, cat, n, sub, frames, steps, furos, gloves: opts.gloves ?? true, cam: opts.cam ?? 22, ox: opts.ox ?? 0, tilt: opts.tilt ?? 0, zoom: opts.zoom ?? 1,
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
    [F(G, 480, 0), F(OVER_MID, 170, 0, { e: 'load', fx: 'haR' }), F(OVER, 160, 1, { e: 'snap', fx: 'haR', hit: true, hi: ['pel'] }), F(OVER, 110, 2), F(G, 380, 3)],
    ['Troque levemente de nível, cabeça fora da linha.', 'A mão de trás faz um arco por cima, como um laço.', 'O peso do corpo vai junto pra frente.', 'Volte rápido pra guarda: é golpe de risco.'],
    ['Lançar de muito longe.', 'Cabeça no centro, sem esquiva.', 'Ficar caído pra frente depois do golpe.']),
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
    [F(G, 480, 0), F(SLIP_OUT, 200, 0, { e: 'snap', hi: ['head'] }), F(SLIP_OUT, 180, 1, { hi: ['pel'] }), F(G, 220, 2), F(SLIP_IN, 200, 0, { e: 'snap', hi: ['head'] }), F(SLIP_IN, 160, 1), F(G, 260, 3)],
    ['Veja o soco vindo, mãos no rosto.', 'Gire o tronco e leve a cabeça pra fora da linha.', 'Dobre um pouco os joelhos: o movimento é das pernas e do quadril.', 'Volte já armado pra contra-atacar.'],
    ['Esquivar só com o pescoço.', 'Fechar os olhos ou virar o rosto.', 'Esquivar demais e perder o equilíbrio.'], { cam: 70 }),
  T('pendulo', ['boxe', 'mma'], 'Defesa', 'Pêndulo', 'Passar por baixo do gancho em "U".',
    [F(G, 450, 0), F(BOB1, 200, 0, { hi: ['knL', 'knR'] }), F(BOB2, 160, 1, { e: 'lin', fx: 'head' }), F(BOB3, 180, 2, { fx: 'head' }), F(G, 260, 3)],
    ['Dobre os joelhos: desça com as pernas, não com as costas.', 'Passe a cabeça por baixo do golpe, desenhando um "U".', 'Mãos no rosto o tempo todo.', 'Suba do outro lado, já em posição de bater.'],
    ['Curvar a coluna e olhar pro chão.', 'Descer demais (fica lento pra voltar).', 'Baixar as mãos.'], { cam: 72 }),
  T('recuo', ['boxe'], 'Defesa', 'Recuo e contra (pull counter)', 'Tira a cabeça pra trás e devolve com o direto.',
    [F(G, 480, 0), F(PULL, 180, 0, { e: 'snap', hi: ['head'] }), F(PULL, 120, 1, { hi: ['anR'] }), F(CROSS, 170, 2, { e: 'snap', fx: 'haR', hit: true }), F(G, 300, 3)],
    ['Leia o jab.', 'Desloque o peso pra perna de trás, tirando a cabeça do alcance.', 'Os pés não saem do lugar.', 'Volte com o direto enquanto o braço dele recolhe.'],
    ['Inclinar pra trás só com a cintura.', 'Levantar o queixo.', 'Recuar sem contra-atacar.']),
  T('pivo', ['boxe', 'muaythai', 'mma'], 'Defesa', 'Pivô', 'Girar sobre o pé da frente pra sair do canto.',
    [F(G, 520, 0), F(pivot(-35), 220, 0, { hi: ['anL'] }), F(pivot(-70), 240, 1, { fx: 'anR' }), F(pivot(-70), 300, 2), F(G, 500, 3)],
    ['Peso na ponta do pé da frente.', 'O pé de trás varre o chão em arco.', 'O corpo gira junto, guarda sempre fechada.', 'Agora você está de frente pro lado dele, não pras cordas.'],
    ['Cruzar os pés.', 'Girar com o peso no calcanhar.', 'Baixar as mãos durante o giro.'], { cam: 40 }),
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
    [F(G, 450, 0), F(SWITCH, 170, 0, { e: 'snap', hi: ['anL', 'anR'] }), F(SW_CH, 150, 1, { e: 'lin', fx: 'anL', hi: ['pel'] }), F(SW_KICK, 140, 2, { e: 'snap', fx: 'anL', hit: true }), F(SW_KICK, 120, 3), F(SW_CH, 220, 3), F(G, 360, 3)],
    ['Pulo curto trocando os pés de lugar.', 'Gire no pé que ficou na frente e jogue o quadril.', 'A canela esquerda acerta o corpo (fígado do lado dele).', 'Volte pra guarda normal.'],
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
    [F(G, 450, 0), F(ELBOW_UP_DIP, 220, 0, { e: 'load', hi: ['knL', 'knR'] }), F(ELBOW_UP, 160, 1, { e: 'snap', fx: 'elR', hit: true }), F(ELBOW_UP, 120, 2), F(G, 340, 3)],
    ['Dobre os joelhos.', 'Empurre o chão e suba o cotovelo por dentro, na linha do queixo.', 'A mão vai pra trás da sua cabeça.', 'Volte pra guarda.'],
    ['Subir de longe.', 'Abrir o cotovelo pro lado.', 'Ficar com o rosto aberto embaixo.'], { cam: 4 }),
  T('checar', ['muaythai', 'mma'], 'Defesa', 'Checar o chute', 'Bloqueia o chute baixo com a canela.',
    [F(G, 480, 0), F(CHECK, 170, 0, { e: 'snap', hi: ['knL'] }), F(CHECK, 360, 1, { hi: ['anL'] }), F(G, 220, 2), F(JAB, 150, 3, { e: 'snap', fx: 'haL', hit: true }), F(G, 260, 3)],
    ['Leia o chute vindo na sua perna da frente.', 'Levante o joelho e vire a canela pra fora, encontrando o chute.', 'Guarda alta: pode vir soco junto.', 'Pise e devolva na hora.'],
    ['Checar com a perna mole (dói igual).', 'Levantar a perna tarde.', 'Baixar a guarda ao checar.'], { cam: 35 }),
  // ===== QUEDAS =====
  T('double', ['mma', 'jiu'], 'Quedas', 'Queda de duas pernas (double leg)', 'Troca de nível, entra fundo e empurra.',
    [F(G, 450, 0), F(LEVEL, 220, 0, { hi: ['knL', 'knR'] }), F(SHOT, 230, 1, { e: 'snap', fx: 'pel', hi: ['knL'] }), F(DRIVE, 300, 2, { fx: 'pel', hit: true, hi: ['anR'] }), F(DRIVE, 200, 3), F(G, 500, 3)],
    ['Troque de nível com as pernas, costas retas, olhando pra frente.', 'Passo fundo entre os pés dele; o joelho da frente quase encosta no chão.', 'Abrace atrás dos joelhos e cole a cabeça no peito dele.', 'Empurre com a perna de trás e gire pro lado.'],
    ['Abaixar a cabeça e olhar pro chão.', 'Entrar de longe (dá tempo de ele fazer sprawl).', 'Parar no meio: a queda é um movimento contínuo.'], { cam: 12, ox: -25 }),
  T('sprawl', ['mma', 'jiu'], 'Quedas', 'Sprawl', 'A defesa de queda: tira as pernas e cai com o quadril.',
    [F(G, 400, 0), F(SPRAWL, 230, 1, { e: 'snap', fx: 'anR', hi: ['anL', 'anR'] }), F(SPRAWL, 320, 2, { hi: ['pel'] }), F(SPRAWL_UP, 280, 3), F(G, 300, 3)],
    ['O adversário entra nas suas pernas.', 'Jogue as pernas pra trás, bem abertas.', 'Afunde o quadril no chão, peito por cima dele.', 'Levante e volte pra base.'],
    ['Cair de joelhos (ele termina a queda).', 'Quadril alto: o peso não chega nele.', 'Demorar pra reagir.'], { cam: 10, ox: 70 }),
  // ===== CHÃO =====
  T('ponte', ['jiu', 'mma'], 'Chão', 'Ponte (upa)', 'O motor de toda fuga por baixo.',
    [F(LIE, 520, 0), F(BRIDGE, 240, 1, { e: 'snap', fx: 'pel', hi: ['pel', 'anL', 'anR'] }), F(BRIDGE, 320, 2, { hi: ['shL', 'shR'] }), F(LIE, 420, 3)],
    ['Deitado, pés plantados perto do quadril.', 'Empurre o chão com os pés e jogue o quadril pro teto.', 'O peso vai pros ombros (nunca pro pescoço).', 'Desça controlando.'],
    ['Pés longe do quadril: a ponte perde força.', 'Empurrar com o pescoço.', 'Fazer devagar: a ponte é explosiva.'], { gloves: false, cam: 25, ox: 15 }),
  T('fuga', ['jiu', 'mma'], 'Chão', 'Fuga de quadril', 'Criar espaço por baixo e recuperar a guarda.',
    [F(LIE, 460, 0), F(SHRIMP1, 260, 1, { hi: ['anL'] }), F(SHRIMP2, 300, 2, { fx: 'pel', hi: ['pel', 'haL', 'haR'] }), F(SHRIMP2, 260, 3, { hi: ['knR'] }), F(LIE, 460, 3)],
    ['De costas, um pé plantado no chão.', 'Empurre o chão e vire de lado, apoiado no ombro.', 'Leve o quadril pra trás enquanto as mãos empurram ("moldura").', 'Recolha o joelho pro espaço que abriu.'],
    ['Ficar reto de costas (o quadril não sai).', 'Empurrar com os braços esticados sem mover o quadril.', 'Esquecer de colocar o joelho no espaço.'], { gloves: false, cam: 30, ox: 25 }),
  T('levantada', ['jiu', 'mma'], 'Chão', 'Levantada técnica', 'Levantar do chão sem se expor.',
    [F(SIT, 520, 0, { hi: ['haR'] }), F(STAND1, 300, 1, { fx: 'anR', hi: ['haR', 'anL'] }), F(STAND1, 200, 2), F(STAND2, 340, 3), F(STAND2, 400, 3)],
    ['Sentado, mão de trás apoiada no chão atrás de você, outra mão protegendo o rosto.', 'Pé da frente plantado, levante o quadril apoiado na mão e no pé.', 'A perna de baixo passa por trás, entre a mão e o pé.', 'Já levanta em guarda, recuando.'],
    ['Levantar de frente, de cabeça baixa.', 'Tirar a mão do chão cedo demais.', 'Levantar perto do adversário.'], { gloves: false, cam: 18 })
,
  // ===== JIU-JITSU: GUARDA, PASSAGEM, RASPAGEM, FINALIZAÇÃO =====
  T('upa', ['jiu', 'mma'], 'Chão', 'Upa (fuga da montada)', 'Prende um braço e o pé dele, faz ponte por cima do ombro e rola.',
    [F(LIE, 480, 0), F(UPA_TRAP, 280, 0, { hi: ['haL', 'haR'] }), F(UPA_TRAP, 200, 1, { hi: ['anL'] }), F(UPA_UP, 240, 2, { e: 'snap', fx: 'pel', hi: ['pel'] }), F(UPA_ROLL, 280, 2, { fx: 'pel', hi: ['shL'] }), F(UPA_TOP, 420, 3, { fx: 'pel', hi: ['pel'] }), F(UPA_TOP, 500, 3), F(LIE, 600, 0)],
    ['Prenda o braço dele junto ao seu peito (as duas mãos no mesmo braço).', 'Com o pé do mesmo lado, prenda o pé dele por fora.', 'Ponte explosiva por cima do ombro do lado preso: ele não tem braço nem pé pra apoiar.', 'Role junto e caia dentro da guarda dele, postura alta.'],
    ['Ponte reta pra cima (sem direção, ele só se equilibra).', 'Prender o braço sem prender o pé do mesmo lado.', 'Esperar ele subir a montada no peito.'], { gloves: false, cam: 28, ox: 15 }),
  T('basecombate', ['jiu'], 'Guarda e passagem', 'Postura na guarda (base de combate)', 'A base pra não ser raspado nem finalizado dentro da guarda.',
    [F(KNEEL, 520, 0, { hi: ['knL', 'knR'] }), F(CBASE, 300, 1, { fx: 'anL', hi: ['anL'] }), F(CBASE, 260, 2, { hi: ['pel'] }), F(CBASE_P, 260, 2, { e: 'snap', hi: ['haL', 'haR'] }), F(CBASE_P, 500, 3, { hi: ['head'] }), F(KNEEL, 500, 0)],
    ['Dentro da guarda, de joelhos: mãos no quadril ou na faixa dele.', 'Suba um pé ao lado do quadril dele (base de combate), o outro joelho fica no chão.', 'Coluna reta, cabeça alta, cotovelos fechados.', 'Empurre o quadril dele pra baixo com as mãos: é daqui que você abre a guarda.'],
    ['Coluna curvada e cabeça baixa (vira presa pro triângulo e pra guilhotina).', 'Mãos no peito dele (braço fica fácil de pegar).', 'Joelhos colados um no outro (base estreita, raspagem fácil).'], { gloves: false, cam: 40 }),
  T('toreando', ['jiu', 'mma'], 'Guarda e passagem', 'Passagem toreando', 'Agarra as calças, joga as pernas pro lado e passa pela lateral.',
    [F(TOR0, 520, 0, { hi: ['haL', 'haR'] }), F(TOR0, 200, 1, { hi: ['pel'] }), F(TOR1, 260, 1, { e: 'snap', fx: 'haR', hi: ['haL', 'haR'] }), F(TOR2, 320, 2, { fx: 'pel', hi: ['anR'] }), F(TOR3, 300, 3, { hi: ['pel'] }), F(TOR3, 500, 3), F(TOR0, 600, 0)],
    ['Em pé, quadril baixo e longe dos pés dele; pegue as calças na altura do joelho.', 'Empurre as duas pernas dele pro chão, pra um lado, com força.', 'Circule rápido pro lado oposto, passando pela linha das pernas.', 'Desça o peito no lado dele e estabilize nos 100 kg.'],
    ['Ficar parado em frente às pernas (ele recompõe a guarda).', 'Quadril alto e perto (ele puxa você pra guarda).', 'Soltar as pernas antes de cravar o peso no lado.'], { gloves: false, cam: 55 }),
  T('tesoura', ['jiu'], 'Guarda e passagem', 'Raspagem de tesoura', 'Canela atravessada na barriga dele, a perna de baixo corta a base.',
    [F(LIE, 480, 0), F(SCI0, 340, 0, { hi: ['knL', 'haL', 'haR'] }), F(SCI0, 220, 1, { hi: ['anR'] }), F(SCI1, 220, 2, { e: 'snap', fx: 'anR', hi: ['anR', 'anL'] }), F(SCI1, 220, 2), F(SCI2, 420, 3, { fx: 'pel', hi: ['pel'] }), F(SCI2, 500, 3), F(LIE, 600, 0)],
    ['Na guarda, gola numa mão e manga na outra; vire de lado.', 'A canela de cima atravessa a barriga dele; a perna de baixo fica no chão, atrás do joelho dele.', 'Puxe a gola e a manga enquanto as pernas fecham como tesoura: a de cima empurra, a de baixo varre.', 'Ele cai de costas e você sobe junto pra montada.'],
    ['Ficar de costas reto (a tesoura não tem força).', 'Não puxar com as mãos: as pernas sozinhas não derrubam.', 'Raspar e ficar deitado, sem subir junto.'], { gloves: false, cam: 30, ox: 15 }),
  T('triangulo', ['jiu', 'mma'], 'Guarda e passagem', 'Triângulo (movimento solo)', 'Uma perna por cima do ombro, fecha o "4" e puxa a cabeça.',
    [F(TRI0, 520, 0, { hi: ['haL', 'haR'] }), F(TRI1, 300, 1, { fx: 'anL', hi: ['anL'] }), F(TRI1, 220, 1), F(TRI2, 320, 2, { e: 'snap', fx: 'anL', hi: ['knR', 'anL'] }), F(TRI2, 380, 3, { hi: ['haL', 'haR', 'pel'] }), F(TRI2, 300, 3), F(TRI0, 600, 0)],
    ['Da guarda, controle um braço dele pra dentro e o outro pra fora.', 'Suba o quadril e passe a perna por cima do ombro dele, atrás do pescoço.', 'Feche o "4": o pé de cima trava atrás do seu próprio joelho.', 'Puxe a cabeça dele, aperte os joelhos e ajuste o ângulo virando o quadril.'],
    ['Deixar os dois braços dele do mesmo lado (não é triângulo, é só guarda).', 'Ficar reto de frente pra ele (corte o ângulo virando o quadril).', 'Esquecer de puxar a cabeça (ele posta e escapa).'], { gloves: false, cam: 30, ox: 15 }),
  T('quebrapostura', ['jiu'], 'Guarda e passagem', 'Quebra de postura (guarda fechada)', 'Puxa com os joelhos e as mãos ao mesmo tempo: a cabeça dele desce no seu peito.',
    [F(GF0, 520, 0, { hi: ['anL', 'anR'] }), F(GF0, 200, 1, { hi: ['haL', 'haR'] }), F(GF1, 260, 2, { e: 'snap', fx: 'knL', hi: ['knL', 'knR', 'haL'] }), F(GF1, 400, 3, { hi: ['pel'] }), F(GF0, 520, 0)],
    ['Guarda fechada: tornozelos cruzados nas costas dele.', 'Pegue a gola ou a nuca com as mãos.', 'Puxe os joelhos pro peito e as mãos pra baixo, ao mesmo tempo.', 'Com a postura dele quebrada, ataque (triângulo, armlock, raspagem).'],
    ['Puxar só com os braços (ele é mais forte que seus bíceps).', 'Guarda fechada parada, sem puxar: ele levanta a postura.', 'Abrir a guarda sem motivo.'], { gloves: false, cam: 30, ox: 15 })
];

export const CATS = ['Socos', 'Chutes', 'Joelhos e cotovelos', 'Defesa', 'Quedas', 'Chão', 'Guarda e passagem'];

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

// pose de impacto (miniatura)
export function peak(t) { return (t.frames.find(f => f.hit) || t.frames[Math.min(2, t.frames.length - 1)]).p; }
// alvo = onde a parte que golpeia chega no impacto (só nos golpes, não no chão/defesa)
export function targetOf(t) {
  const h = t.frames.find(f => f.hit && f.fx && f.fx !== 'pel'); if (!h || !t.gloves) return null;
  return solve(h.p)[h.fx];
}
export function thumbSVG(t) { return draw(solve(peak(t)), { gloves: t.gloves, cam: t.cam, ox: t.ox, act: t.act, tilt: t.tilt, zoom: t.zoom, target: targetOf(t) }); }

// ---------- animação ----------
export function animate(el, tech, onStep) {
  const fr = tech.frames;
  let i = 0, t0 = performance.now(), speed = 1, raf = 0, paused = false, pausedAt = 0, lastStep = -1;
  let trail = [], burstT = 0, burstP = null, path = [];
  const target = targetOf(tech);
  function frame(now) {
    if (paused) return;
    const nextI = (i + 1) % fr.length, next = fr[nextI];
    let t = (now - t0) / (next.d * speed);
    if (t >= 1) {
      if (next.hit) burstT = now;
      i = nextI; t0 = now; t = 0;
      if (i === 0) { t0 = now + 450 * speed; trail = []; path = []; }
    }
    const a = fr[i], b = fr[(i + 1) % fr.length];
    const k = EASE[b.e](Math.max(0, Math.min(1, t)));
    const J = solve(mix(a.p, b.p, k));
    if (b.fx && t > 0) { trail.push(J[b.fx]); if (trail.length > 9) trail.shift(); if (target && b.fx !== 'pel' && (!path.length || Math.hypot(...J[b.fx].map((v, j) => v - path[path.length - 1][j])) > 0.015)) path.push(J[b.fx]); }
    else if (trail.length) trail.shift();
    let burst = null;
    const since = now - burstT;
    if (burstT && since < 260 * speed) { if (a.fx) burstP = J[a.fx]; burst = burstP ? { p: burstP, s: 1.15 - since / (260 * speed) * 0.6 } : null; }
    const show = k > 0.5 ? b : a;
    el.innerHTML = draw(J, { gloves: tech.gloves, hi: show.hi, trail: trail.length > 1 ? trail : null, burst, cam: tech.cam, ox: tech.ox, act: tech.act, tilt: tech.tilt, zoom: tech.zoom, target, path: path.length > 2 ? path : null, props: tech.props ? tech.props(J) : null, ...(tech.body || {}) });
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
