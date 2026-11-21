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
const HOOK_LOAD = P({ cy: -60, py: -52, lean: 12, p: [0.03, 0.85, -0.02] });
const HOOK_MID = P({ cy: -30, py: -25, hL: [0.40, 0.2, 0.2], eL: [0, 0.45, 1], p: [0.04, 0.85, 0] });
const HOOK = P({ cy: 0, py: -10, lean: 12, hL: [0.40, 0.2, -0.1], eL: [0, 0.5, 1], fL: [0.38, 0, -0.12], tL: [0.75, 0, 0.66], p: [0.05, 0.85, 0] });
const HOOK4_MID = P({ cy: -10, py: -12, hR: [0.40, 0.2, -0.24], eR: [0, 0.45, -1], fR: [-0.27, 0.04, 0.1], tR: [0.8, -0.3, 0.5] });
const HOOK4 = P({ cy: 25, py: 5, lean: 14, hR: [0.40, 0.2, 0.08], eR: [0, 0.5, -1], hL: [0.16, 0.22, 0.1], fR: [-0.27, 0.05, 0.1], tR: [0.8, -0.35, 0.5], p: [0.06, 0.86, 0] });
const UP_DIP = P({ p: [0.02, 0.76, 0], lean: 18, cy: -50, hR: [0.2, -0.02, -0.1], eR: [-0.4, -1, -0.3] });
const UP6 = P({ p: [0.07, 0.9, 0], cy: 12, py: -5, lean: 8, hR: [0.42, 0.3, 0], eR: [0.2, -1, -0.3], fR: [-0.27, 0.05, 0.1], tR: [0.8, -0.35, 0.5] });
const UP5_DIP = P({ p: [0.03, 0.76, 0], lean: 18, cy: -55, py: -48, hL: [0.24, -0.02, 0.1], eL: [-0.4, -1, 0.3] });
const UP5 = P({ p: [0.06, 0.9, 0], cy: -15, py: -20, lean: 8, hL: [0.42, 0.3, 0], eL: [0.2, -1, 0.3] });
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
const KNEE_D = P({ p: [0.12, 0.92, 0.04], py: 35, cy: 10, lean: -12, hL: [0.44, -0.02, 0.1], hR: [0.44, -0.02, -0.02], eL: [0, -0.4, 1], eR: [0, -0.4, -1], fR: [0.15, 0.4, 0.2], kR: [0.8, 0.6, -0.6], tR: [0.2, -1, 0] });
const ELBOW = P({ p: [0.07, 0.85, 0], py: 0, cy: 28, lean: 14, hR: [0.14, 0.27, 0.16], eR: [1, 0.25, -0.15], fR: [-0.27, 0.05, 0.1], tR: [0.8, -0.35, 0.5] });
const ELBOW_UP_DIP = P({ p: [0.02, 0.76, 0], lean: 18, cy: -40, hR: [0.12, 0.1, -0.12] });
const ELBOW_UP = P({ p: [0.07, 0.92, 0], cy: 15, lean: 6, hR: [0.06, 0.4, -0.04], eR: [1, 0.25, 0], fR: [-0.27, 0.05, 0.1], tR: [0.8, -0.35, 0.5] });
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

const LIMB = { haL: 'armL', elL: 'armL', haR: 'armR', elR: 'armR', anL: 'legL', knL: 'legL', anR: 'legR', knR: 'legR' };
const T = (id, sport, cat, n, sub, frames, steps, furos, opts = {}) => ({ id, sport, cat, n, sub, frames, steps, furos, gloves: opts.gloves ?? true, cam: opts.cam ?? 22, ox: opts.ox ?? 0,
  act: [...new Set(frames.map(f => LIMB[f.fx]).filter(Boolean))].flatMap(x => x.startsWith('leg') ? [x, 'foot' + x.slice(3)] : [x]) });
const SC = ['boxe', 'muaythai', 'mma'];

export const TECHNIQUES = [
  // ===== SOCOS =====
  T('jab', SC, 'Socos', 'Jab (1)', 'O golpe mais usado: mede distância e abre caminho.',
    [F(G, 520, 0), F(JAB, 150, 1, { e: 'snap', fx: 'haL', hit: true }), F(JAB, 90, 2, { hi: ['shL'] }), F(G, 230, 3)],
    ['Guarda: queixo baixo, mãos no rosto, peso no meio.', 'A mão da frente sai reta e gira o punho no fim.', 'O ombro da frente sobe e protege o queixo.', 'Volta pelo mesmo caminho, rápido, pra guarda.'],
    ['Baixar a mão de trás quando o jab sai.', 'Puxar o braço pra trás antes de soltar (avisa o golpe).', 'Voltar devagar ou por baixo, deixando o rosto aberto.']),
  T('jabcorpo', SC, 'Socos', 'Jab no corpo', 'Troca de nível: desce com as pernas e acerta a linha da cintura.',
    [F(G, 500, 0), F(P({ p: [0.06, 0.74, 0], lean: 22 }), 200, 0, { hi: ['knL', 'knR'] }), F(BODYJAB, 150, 1, { e: 'snap', fx: 'haL', hit: true }), F(BODYJAB, 100, 2), F(G, 320, 3)],
    ['Dobre os joelhos: o nível muda pelas pernas, não pela coluna.', 'O jab sai reto na altura do plexo.', 'A mão de trás fica no rosto (é quando chega o contra-golpe).', 'Suba já em guarda.'],
    ['Abaixar só o tronco, olhando pro chão.', 'Ficar embaixo depois do golpe.', 'Soltar sem a cabeça fora da linha central.']),
  T('direto', SC, 'Socos', 'Direto (2)', 'O soco de força: nasce no pé de trás.',
    [F(G, 480, 0), F(CROSS_LOAD, 140, 0, { e: 'load' }), F(CROSS, 170, 1, { e: 'snap', fx: 'haR', hit: true, hi: ['anR', 'pel'] }), F(CROSS, 110, 2), F(G, 300, 3)],
    ['Da guarda, gire o pé de trás (o calcanhar sobe).', 'O quadril gira pra frente e leva o ombro junto.', 'O braço só termina o movimento: mão reta até o alvo.', 'A mão da frente fica no rosto. Volta pra guarda.'],
    ['Soco só de braço, sem girar o pé e o quadril.', 'Inclinar o corpo além do joelho da frente.', 'Abrir o cotovelo (vira um soco "de lado").']),
  T('gancho', SC, 'Socos', 'Gancho de esquerda (3)', 'Curto e em arco: a força vem da rotação.',
    [F(G, 480, 0), F(HOOK_LOAD, 170, 0, { e: 'load' }), F(HOOK_MID, 90, 1, { e: 'lin', fx: 'haL', hi: ['pel', 'anL'] }), F(HOOK, 110, 2, { e: 'snap', fx: 'haL', hit: true }), F(HOOK, 110, 3), F(G, 320, 3)],
    ['Peso levemente na perna da frente.', 'Gire o pé e o quadril da frente pra dentro.', 'Braço travado em ~90°, cotovelo na altura do punho.', 'O punho segue o giro do tronco e volta pro rosto.'],
    ['Abrir o braço pra "carregar" o golpe (o adversário vê).', 'Girar só o braço, sem o pé da frente.', 'Deixar a mão de trás cair durante o giro.'], { cam: 62 }),
  T('gancho4', ['boxe', 'mma'], 'Socos', 'Gancho de direita (4)', 'O gancho da mão de trás: rotação total do quadril.',
    [F(G, 480, 0), F(P({ cy: -55 }), 140, 0, { e: 'load' }), F(HOOK4_MID, 100, 1, { e: 'lin', fx: 'haR', hi: ['anR', 'pel'] }), F(HOOK4, 110, 2, { e: 'snap', fx: 'haR', hit: true }), F(HOOK4, 110, 3), F(G, 340, 3)],
    ['Da guarda, gire o pé de trás como no direto.', 'O quadril gira e o cotovelo sobe até a altura do ombro.', 'O braço fica travado em gancho; o tronco é que leva o punho.', 'Volte pra guarda pelo mesmo arco.'],
    ['Abrir muito o arco (fica lento e visível).', 'Deixar o queixo exposto ao girar.', 'Girar sem o pé de trás.'], { cam: 58 }),
  T('uppercut6', SC, 'Socos', 'Uppercut de direita (6)', 'De baixo pra cima: perfeito de perto.',
    [F(G, 450, 0), F(UP_DIP, 240, 0, { e: 'load', hi: ['knL', 'knR'] }), F(UP6, 170, 1, { e: 'snap', fx: 'haR', hit: true, hi: ['pel'] }), F(UP6, 120, 3), F(G, 320, 3)],
    ['Dobre os joelhos (carrega as pernas).', 'Empurre o chão com o pé de trás e gire o quadril.', 'A mão sobe por dentro, palma virada pra você.', 'Para na altura do queixo e volta pra guarda.'],
    ['Baixar a mão até a cintura antes de subir (golpe telegrafado).', 'Jogar a cabeça pra frente junto.', 'Usar de longe: é golpe de curta distância.']),
  T('uppercut5', ['boxe', 'mma'], 'Socos', 'Uppercut de esquerda (5)', 'O uppercut da frente: rápido e escondido.',
    [F(G, 450, 0), F(UP5_DIP, 230, 0, { e: 'load', hi: ['knL'] }), F(UP5, 160, 1, { e: 'snap', fx: 'haL', hit: true }), F(UP5, 110, 2), F(G, 320, 3)],
    ['Desça um pouco o peso sobre a perna da frente.', 'Gire o quadril da frente e empurre com a perna.', 'O punho sobe curto, cotovelo colado no corpo.', 'Volte pra guarda.'],
    ['Abrir o cotovelo pra fora.', 'Perder a mão de trás do rosto.', 'Subir na ponta dos pés.']),
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
    [F(G, 400, 0), F(CLINCH, 230, 0, { hi: ['haL', 'haR'] }), F(KNEE_D, 170, 1, { e: 'snap', fx: 'knR', hit: true, hi: ['pel'] }), F(KNEE_D, 120, 2), F(CLINCH, 220, 3), F(G, 300, 3)],
    ['Clinch firme, puxando a cabeça dele pro lado oposto.', 'Gire o quadril e traga o joelho em diagonal.', 'Acerte as costelas com a ponta do joelho.', 'Alterne os lados.'],
    ['Abrir o joelho demais (vira empurrão).', 'Soltar o pescoço dele.', 'Ficar parado depois da joelhada.'], { cam: 40 }),
  T('cotovelada', ['muaythai', 'mma'], 'Joelhos e cotovelos', 'Cotovelada horizontal', 'Curta, de perto, como um gancho.',
    [F(G, 450, 0), F(P({ cy: -55 }), 140, 0, { e: 'load' }), F(ELBOW, 150, 1, { e: 'snap', fx: 'elR', hit: true, hi: ['pel'] }), F(ELBOW, 120, 2, { hi: ['elR'] }), F(G, 320, 3)],
    ['Bem perto do adversário.', 'Gire o pé de trás e o quadril, como num gancho.', 'A ponta do cotovelo passa na altura da sobrancelha dele.', 'A outra mão protege o rosto.'],
    ['Usar de longe.', 'Abrir o braço (vira tapa).', 'Esquecer a guarda da outra mão.'], { cam: 55 }),
  T('cotoveladasobe', ['muaythai'], 'Joelhos e cotovelos', 'Cotovelada ascendente', 'De baixo pra cima, por dentro da guarda.',
    [F(G, 450, 0), F(ELBOW_UP_DIP, 220, 0, { e: 'load', hi: ['knL', 'knR'] }), F(ELBOW_UP, 160, 1, { e: 'snap', fx: 'elR', hit: true }), F(ELBOW_UP, 120, 2), F(G, 340, 3)],
    ['Dobre os joelhos.', 'Empurre o chão e suba o cotovelo por dentro, na linha do queixo.', 'A mão vai pra trás da sua cabeça.', 'Volte pra guarda.'],
    ['Subir de longe.', 'Abrir o cotovelo pro lado.', 'Ficar com o rosto aberto embaixo.']),
  T('checar', ['muaythai', 'mma'], 'Defesa', 'Checar o chute', 'Bloqueia o chute baixo com a canela.',
    [F(G, 480, 0), F(CHECK, 170, 0, { e: 'snap', hi: ['knL'] }), F(CHECK, 360, 1, { hi: ['anL'] }), F(G, 220, 2), F(JAB, 150, 3, { e: 'snap', fx: 'haL', hit: true }), F(G, 260, 3)],
    ['Leia o chute vindo na sua perna da frente.', 'Levante o joelho e vire a canela pra fora, encontrando o chute.', 'Guarda alta: pode vir soco junto.', 'Pise e devolva na hora.'],
    ['Checar com a perna mole (dói igual).', 'Levantar a perna tarde.', 'Baixar a guarda ao checar.'], { cam: 35 }),
  // ===== QUEDAS =====
  T('double', ['mma'], 'Quedas', 'Queda de duas pernas (double leg)', 'Troca de nível, entra fundo e empurra.',
    [F(G, 450, 0), F(LEVEL, 220, 0, { hi: ['knL', 'knR'] }), F(SHOT, 230, 1, { e: 'snap', fx: 'pel', hi: ['knL'] }), F(DRIVE, 300, 2, { fx: 'pel', hit: true, hi: ['anR'] }), F(DRIVE, 200, 3), F(G, 500, 3)],
    ['Troque de nível com as pernas, costas retas, olhando pra frente.', 'Passo fundo entre os pés dele; o joelho da frente quase encosta no chão.', 'Abrace atrás dos joelhos e cole a cabeça no peito dele.', 'Empurre com a perna de trás e gire pro lado.'],
    ['Abaixar a cabeça e olhar pro chão.', 'Entrar de longe (dá tempo de ele fazer sprawl).', 'Parar no meio: a queda é um movimento contínuo.'], { cam: 12, ox: -25 }),
  T('sprawl', ['mma'], 'Quedas', 'Sprawl', 'A defesa de queda: tira as pernas e cai com o quadril.',
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
];

export const CATS = ['Socos', 'Chutes', 'Joelhos e cotovelos', 'Defesa', 'Quedas', 'Chão'];

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
export function thumbSVG(t) { return draw(solve(peak(t)), { gloves: t.gloves, cam: t.cam, ox: t.ox, act: t.act }); }

// ---------- animação ----------
export function animate(el, tech, onStep) {
  const fr = tech.frames;
  let i = 0, t0 = performance.now(), speed = 1, raf = 0, paused = false, pausedAt = 0, lastStep = -1;
  let trail = [], burstT = 0, burstP = null;
  function frame(now) {
    if (paused) return;
    const nextI = (i + 1) % fr.length, next = fr[nextI];
    let t = (now - t0) / (next.d * speed);
    if (t >= 1) {
      if (next.hit) burstT = now;
      i = nextI; t0 = now; t = 0;
      if (i === 0) { t0 = now + 450 * speed; trail = []; }
    }
    const a = fr[i], b = fr[(i + 1) % fr.length];
    const k = EASE[b.e](Math.max(0, Math.min(1, t)));
    const J = solve(mix(a.p, b.p, k));
    if (b.fx && t > 0) { trail.push(J[b.fx]); if (trail.length > 9) trail.shift(); }
    else if (trail.length) trail.shift();
    let burst = null;
    const since = now - burstT;
    if (burstT && since < 260 * speed) { if (a.fx) burstP = J[a.fx]; burst = burstP ? { p: burstP, s: 1.15 - since / (260 * speed) * 0.6 } : null; }
    const show = k > 0.5 ? b : a;
    el.innerHTML = draw(J, { gloves: tech.gloves, hi: show.hi, trail: trail.length > 1 ? trail : null, burst, cam: tech.cam, ox: tech.ox, act: tech.act });
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
