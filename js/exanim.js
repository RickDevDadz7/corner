// ============================================================
// RONIN — demonstrações dos exercícios de força com o mesmo boneco dos golpes.
// Mesmo esqueleto (rig.js). Corpo de perfil olhando pra +X; lado esquerdo = Z negativo.
// w = mão no mundo (barra, chão, banco); h = mão em coordenadas do tronco.
// ============================================================
import { solve, draw } from './rig.js';
import { TECHNIQUES, animate as animTech } from './techniques.js';

const P = (base, o) => ({ ...base, ...o });
// quadro: pose, duração, passo (índice da instrução), curva
const F = (p, d, step, e = 'inout') => ({ p, d, step, e, fx: null, hit: false, hi: [] });
const mid = (a, b) => a.map((v, i) => (v + b[i]) / 2);
const ext = (a, b, k) => a.map((v, i) => v + (v - b[i]) * k);

// ---------- poses-base ----------
const ST = { p: [0, 0.9, 0], py: 0, cy: 0, lean: 2, fL: [0.03, 0, -0.13], fR: [0.03, 0, 0.13], tL: [1, 0, -0.12], tR: [1, 0, 0.12], kL: [1, 0, -0.15], kR: [1, 0, 0.15],
  hL: [0.03, -0.55, 0.23], hR: [0.03, -0.55, -0.23], eL: [-0.4, -1, 0.3], eR: [-0.4, -1, -0.3] };
const ATH = P(ST, { p: [-0.03, 0.84, 0], lean: 10, fL: [0.05, 0, -0.2], fR: [0.05, 0, 0.2], kL: [1, 0, -0.35], kR: [1, 0, 0.35] }); // base atlética
// deitado de costas (cabeça pra trás, rosto pra cima)
const SUP = { py: 0, cy: 0, lean: -90, eL: [-1, 0, 0.6], eR: [-1, 0, -0.6] };
// de bruços (cabeça pra frente, rosto pra baixo)
const PRO = { py: 0, cy: 0, lean: 90 };

// ---------- padrões ----------
const PAT = {};
const def = (k, o) => { PAT[k] = { gloves: false, cam: 22, ox: 0, act: [], tilt: 0, zoom: 1, ...o }; };

// Agachamento com barra nas costas
{ const up = P(ST, { p: [-0.02, 0.89, 0], fL: [0.03, 0, -0.17], fR: [0.03, 0, 0.17], tL: [1, 0, -0.35], tR: [1, 0, 0.35], hL: [-0.07, 0.05, 0.42], hR: [-0.07, 0.05, -0.42], eL: [-0.5, -1, 0.3], eR: [-0.5, -1, -0.3], lean: 6 });
  const dn = P(up, { p: [-0.27, 0.5, 0], lean: 40, kL: [1, 0.1, -0.45], kR: [1, 0.1, 0.45] });
  def('sq', { cam: 40, frames: [F(up, 500, 0), F(dn, 1300, 0), F(dn, 250, 1), F(up, 900, 1)], steps: ['Desce controlando, quadril pra trás e joelhos seguindo a ponta do pé', 'Sobe empurrando o chão, tronco travado'],
    props: J => [{ k: 'bar', a: J.haL, b: J.haR }] }); }
// Goblet: halter na frente do peito
{ const up = P(ST, { p: [-0.02, 0.89, 0], fL: [0.03, 0, -0.19], fR: [0.03, 0, 0.19], tL: [1, 0, -0.4], tR: [1, 0, 0.4], hL: [0.2, -0.12, 0.06], hR: [0.2, -0.12, -0.06], eL: [0.2, -1, 0.4], eR: [0.2, -1, -0.4] });
  const dn = P(up, { p: [-0.22, 0.48, 0], lean: 28, kL: [1, 0.1, -0.55], kR: [1, 0.1, 0.55] });
  def('gsq', { frames: [F(up, 500, 0), F(dn, 1200, 0), F(dn, 250, 1), F(up, 900, 1)], steps: ['Halter colado no peito, desce entre as pernas', 'Sobe pelo calcanhar, peito aberto'],
    props: J => [{ k: 'db', p: mid(J.haL, J.haR), d: [0, 1, 0] }] }); }
// Agachamento livre (peso corporal)
{ const up = P(ST, { fL: [0.03, 0, -0.17], fR: [0.03, 0, 0.17], tL: [1, 0, -0.35], tR: [1, 0, 0.35], hL: [0.12, -0.45, 0.2], hR: [0.12, -0.45, -0.2] });
  const dn = P(up, { p: [-0.26, 0.46, 0], lean: 32, kL: [1, 0.1, -0.45], kR: [1, 0.1, 0.45], hL: [0.52, 0.02, 0.18], hR: [0.52, 0.02, -0.18], eL: [-1, -0.3, 0.2], eR: [-1, -0.3, -0.2] });
  def('bwsq', { frames: [F(up, 400, 0), F(dn, 1100, 0), F(dn, 200, 1), F(up, 800, 1)], steps: ['Braços à frente pra equilibrar, desce sentando', 'Sobe sem tirar o calcanhar do chão'] }); }
// Terra romeno: dobradiça de quadril
{ const up = P(ST, { p: [0, 0.88, 0], fL: [0.03, 0, -0.12], fR: [0.03, 0, 0.12], wL: [0.07, 0.75, -0.22], wR: [0.07, 0.75, 0.22], eL: [-1, -0.3, 0.2], eR: [-1, -0.3, -0.2] });
  const dn = P(up, { p: [-0.2, 0.84, 0], lean: 74, wL: [0.25, 0.42, -0.22], wR: [0.25, 0.42, 0.22], kL: [1, 0, -0.1], kR: [1, 0, 0.1] });
  const st = ['Quadril vai pra trás, joelho quase reto, barra raspando na coxa', 'Volta empurrando o quadril pra frente, coluna neutra'];
  def('rdl', { frames: [F(up, 500, 0), F(dn, 1400, 0), F(dn, 200, 1), F(up, 900, 1)], steps: st, props: J => [{ k: 'bar', a: J.haL, b: J.haR }] });
  def('dbrdl', { frames: PAT.rdl.frames, steps: ['Quadril pra trás, halteres colados na coxa', 'Volta empurrando o quadril, coluna neutra'], props: J => [{ k: 'db', p: J.haL, d: [1, 0, 0] }, { k: 'db', p: J.haR, d: [1, 0, 0] }] }); }
// Leg press 45°
{ const bent = { p: [0, 0.42, 0], py: 0, cy: 0, lean: -58, fL: [0.38, 0.72, -0.15], fR: [0.38, 0.72, 0.15], tL: [0.55, 0.85, 0], tR: [0.55, 0.85, 0], kL: [0.2, 1, -0.2], kR: [0.2, 1, 0.2], wL: [0.06, 0.4, -0.3], wR: [0.06, 0.4, 0.3], eL: [-1, 0, 0.3], eR: [-1, 0, -0.3] };
  const ext_ = P(bent, { fL: [0.6, 1.0, -0.15], fR: [0.6, 1.0, 0.15] });
  const plat = J => { const c = mid(J.anL, J.anR), o = [c[0] + 0.06, c[1] + 0.05], q = [-0.78, 0.62]; return { k: 'line', a: [o[0] + q[0] * 0.24, o[1] + q[1] * 0.24, 0], b: [o[0] - q[0] * 0.24, o[1] - q[1] * 0.24, 0], w: 9, c: 'prb', layer: 'front' }; };
  def('lp', { zoom: 0.92, ox: 10, frames: [F(ext_, 500, 0), F(bent, 1300, 0), F(bent, 200, 1), F(ext_, 900, 1)], steps: ['Desce até o joelho chegar perto do peito, lombar colada', 'Empurra a plataforma sem travar o joelho no fim'],
    props: J => [{ k: 'line', a: [0.08, 0.36, 0], b: [-0.48, 0.74, 0], w: 12, c: 'pr', layer: 'back' }, { k: 'line', a: [-0.2, 0.3, 0], b: [0.2, 0.3, 0], w: 10, c: 'pr', layer: 'back' }, { k: 'line', a: [-0.05, 0, 0], b: [0.05, 0.3, 0], w: 6, c: 'pr', layer: 'back' }, { k: 'line', a: [0.15, 0.35, 0], b: [0.9, 1.1, 0], w: 4, c: 'pr', layer: 'back' }, plat(J)] }); }
// Hip thrust (ombros no banco)
{ const dn = { ...SUP, p: [-0.1, 0.26, 0], lean: -62, fL: [0.42, 0, -0.16], fR: [0.42, 0, 0.16], kL: [0.3, 1, -0.2], kR: [0.3, 1, 0.2], wL: [0, 0.4, -0.3], wR: [0, 0.4, 0.3] };
  const up = P(dn, { p: [0, 0.55, 0], lean: -96, wL: [0.05, 0.68, -0.3], wR: [0.05, 0.68, 0.3] });
  def('ht', { ox: 25, frames: [F(dn, 500, 0), F(up, 900, 0), F(up, 600, 1), F(dn, 1000, 1)], steps: ['Escápulas no banco, sobe empurrando pelo calcanhar até o tronco ficar reto', 'Aperta o glúteo 1 s em cima e desce controlando'],
    props: J => [{ k: 'box', x1: -0.85, x2: -0.42, y: 0.42 }, { k: 'bar', a: [J.pel[0] + 0.04, J.pel[1] + 0.12, -0.3], b: [J.pel[0] + 0.04, J.pel[1] + 0.12, 0.3] }] }); }
// Ponte de glúteo (no chão)
{ const dn = { ...SUP, p: [-0.06, 0.2, 0], lean: -95, fL: [0.4, 0, -0.14], fR: [0.4, 0, 0.14], kL: [0.2, 1, -0.2], kR: [0.2, 1, 0.2], wL: [-0.3, 0.02, -0.28], wR: [-0.3, 0.02, 0.28] };
  const up = P(dn, { p: [-0.02, 0.4, 0], lean: -112 });
  def('sgb', { ox: 25, frames: [F(dn, 400, 0), F(up, 800, 0), F(up, 900, 1), F(dn, 900, 1)], steps: ['Pés firmes, sobe o quadril até alinhar joelho, quadril e ombro', 'Segura 1 s apertando o glúteo e desce devagar'] });
  // Flexora deslizando: começa em ponte com perna dobrada e estica sem baixar o quadril
  const ex2 = P(up, { p: [0.02, 0.3, 0], lean: -112, fL: [0.86, 0.02, -0.14], fR: [0.86, 0.02, 0.14] });
  def('slide', { ox: 15, frames: [F(up, 500, 0), F(ex2, 1300, 0), F(ex2, 200, 1), F(up, 1000, 1)], steps: ['Em ponte, desliza os calcanhares pra longe sem deixar o quadril cair', 'Puxa de volta com o posterior da coxa'],
    props: J => [{ k: 'line', a: [J.anL[0] - 0.05, 0.01, 0], b: [J.anL[0] + 0.12, 0.01, 0], w: 5, c: 'prb', layer: 'front' }] }); }
// Mesa flexora (deitado de bruços)
{ const st = { ...PRO, p: [0, 0.56, 0], fL: [-0.89, 0.58, -0.1], fR: [-0.89, 0.58, 0.1], tL: [0, -1, 0], tR: [0, -1, 0], kL: [-0.2, -1, 0], kR: [-0.2, -1, 0], wL: [0.68, 0.48, -0.22], wR: [0.68, 0.48, 0.22], eL: [-1, 0, 0.5], eR: [-1, 0, -0.5] };
  const cu = P(st, { fL: [-0.32, 0.98, -0.1], fR: [-0.32, 0.98, 0.1], tL: [-1, 0.3, 0], tR: [-1, 0.3, 0] });
  def('lc', { ox: 5, zoom: 0.92, frames: [F(st, 400, 0), F(cu, 900, 0), F(cu, 300, 1), F(st, 1200, 1)], steps: ['Puxa o rolo em direção ao glúteo, quadril colado no banco', 'Desce controlando, sem soltar o peso'],
    props: J => [{ k: 'box', x1: -0.55, x2: 0.62, y: 0.46, z1: -0.18, z2: 0.18 }, { k: 'line', a: [J.anL[0], J.anL[1] + 0.05, -0.2], b: [J.anL[0], J.anL[1] + 0.05, 0.2], w: 9, c: 'prb', layer: 'front' }] }); }
// Panturrilha
{ const dn = P(ST, { fL: [0.03, 0, -0.12], fR: [0.03, 0, 0.12] });
  const up = P(dn, { p: [0, 0.98, 0], fL: [0.03, 0.1, -0.12], fR: [0.03, 0.1, 0.12], tL: [1, -0.85, 0], tR: [1, -0.85, 0] });
  def('calf', { frames: [F(dn, 400, 0), F(up, 700, 0), F(up, 500, 1), F(dn, 900, 1)], steps: ['Sobe na ponta do pé o mais alto possível', 'Segura em cima e desce até alongar, pausa embaixo'],
    props: J => [{ k: 'line', a: [J.shL[0] - 0.05, J.shL[1] + 0.06, -0.32], b: [J.shR[0] - 0.05, J.shR[1] + 0.06, 0.32], w: 10, c: 'prb' }] });
  const dn2 = P(dn, { p: [0, 1.0, 0], fL: [0.03, 0.12, -0.12], fR: [0.03, 0.12, 0.12], tL: [1, 0.35, 0], tR: [1, 0.35, 0] });
  const up2 = P(dn2, { p: [0, 1.1, 0], fL: [0.03, 0.24, -0.12], fR: [0.03, 0.24, 0.12], tL: [1, -0.85, 0], tR: [1, -0.85, 0] });
  def('calfbw', { frames: [F(dn2, 400, 0), F(up2, 700, 0), F(up2, 400, 1), F(dn2, 900, 1)], steps: ['Ponta do pé no degrau, calcanhar pra fora. Sobe tudo', 'Desce até o calcanhar passar da linha do degrau'],
    props: () => [{ k: 'box', x1: 0.12, x2: 0.55, y: 0.16 }] }); }
// Supino reto
{ const up = { ...SUP, p: [0, 0.52, 0], fL: [0.42, 0, -0.24], fR: [0.42, 0, 0.24], kL: [0.3, 1, -0.3], kR: [0.3, 1, 0.3], tL: [1, 0, -0.2], tR: [1, 0, 0.2], wL: [-0.44, 1.04, -0.4], wR: [-0.44, 1.04, 0.4] };
  const dn = P(up, { wL: [-0.38, 0.68, -0.42], wR: [-0.38, 0.68, 0.42] });
  const bench = { k: 'box', x1: -0.95, x2: 0.15, y: 0.44, z1: -0.16, z2: 0.16 };
  def('bp', { ox: 25, frames: [F(up, 400, 0), F(dn, 1100, 0), F(dn, 150, 1), F(up, 800, 1)], steps: ['Escápulas travadas, desce a barra até a linha do peito', 'Empurra pra cima e um pouco pra trás, pés firmes'],
    props: J => [bench, { k: 'bar', a: J.haL, b: J.haR }] });
  const up2 = P(up, { wL: [-0.44, 1.04, -0.22], wR: [-0.44, 1.04, 0.22] }), dn2 = P(up, { wL: [-0.36, 0.66, -0.4], wR: [-0.36, 0.66, 0.4] });
  def('dbfp', { ox: 25, frames: [F(up2, 400, 0), F(dn2, 1100, 0), F(dn2, 150, 1), F(up2, 800, 1)], steps: ['Desce os halteres com os cotovelos a ~45° do tronco', 'Empurra de volta juntando os halteres em cima'],
    props: J => [bench, { k: 'db', p: J.haL, d: [0, 0, 1] }, { k: 'db', p: J.haR, d: [0, 0, 1] }] });
  const iu = P(up, { p: [0, 0.5, 0], lean: -58, wL: [-0.34, 1.32, -0.22], wR: [-0.34, 1.32, 0.22] }), id = P(iu, { wL: [-0.34, 0.92, -0.4], wR: [-0.34, 0.92, 0.4] });
  def('dbi', { ox: 25, frames: [F(iu, 400, 0), F(id, 1100, 0), F(id, 150, 1), F(iu, 800, 1)], steps: ['Banco a 30°, desce os halteres até o alto do peito', 'Empurra pra cima sem tirar as escápulas do banco'],
    props: J => [{ k: 'box', x1: -0.2, x2: 0.2, y: 0.42, z1: -0.16, z2: 0.16 }, { k: 'line', a: [-0.12, 0.44, 0], b: [-0.62, 0.78, 0], w: 12, c: 'pr', layer: 'back' }, { k: 'db', p: J.haL, d: [0, 0, 1] }, { k: 'db', p: J.haR, d: [0, 0, 1] }] }); }
// Desenvolvimento
{ const dn = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.15, 0.04, 0.24], hR: [0.15, 0.04, -0.24], eL: [0.6, -1, 0.2], eR: [0.6, -1, -0.2] });
  const up = P(dn, { hL: [0.03, 0.5, 0.22], hR: [0.03, 0.5, -0.22] });
  def('ohp', { zoom: 0.94, cam: 50, frames: [F(dn, 400, 0), F(up, 900, 0), F(up, 200, 1), F(dn, 1000, 1)], steps: ['Glúteo e abdômen contraídos, empurra a barra reto pra cima', 'Cabeça passa pra frente no topo; desce até o queixo'],
    props: J => [{ k: 'bar', a: J.haL, b: J.haR }] });
  const dn2 = P(dn, { hL: [0.06, 0.06, 0.36], hR: [0.06, 0.06, -0.36], eL: [0, -1, 1], eR: [0, -1, -1] }), up2 = P(dn2, { hL: [0.04, 0.5, 0.24], hR: [0.04, 0.5, -0.24] });
  def('dbohp', { zoom: 0.94, cam: 40, frames: [F(dn2, 400, 0), F(up2, 900, 0), F(up2, 200, 1), F(dn2, 1000, 1)], steps: ['Halteres na altura da orelha, empurra pra cima', 'Desce controlando, sem arquear a lombar'],
    props: J => [{ k: 'db', p: J.haL, d: [1, 0, 0] }, { k: 'db', p: J.haR, d: [1, 0, 0] }] }); }
// Barra fixa / supinada / pendurar
{ const Y = 2.12, hang = { p: [0.0, 1.13, 0], py: 0, cy: 0, lean: -4, wL: [0.02, Y, -0.36], wR: [0.02, Y, 0.36], eL: [0, -1, 1], eR: [0, -1, -1], fL: [-0.22, 0.32, -0.1], fR: [-0.22, 0.32, 0.1], kL: [1, 0, 0], kR: [1, 0, 0], tL: [0.3, -1, 0], tR: [0.3, -1, 0] };
  const top = P(hang, { p: [-0.02, 1.53, 0], lean: -10, fL: [-0.25, 0.72, -0.1], fR: [-0.25, 0.72, 0.1] });
  const pole = { k: 'line', a: [0.02, Y, -0.65], b: [0.02, Y, 0.65], w: 6, c: 'prb' };
  const posts = [{ k: 'line', a: [0.02, Y, -0.65], b: [0.02, 0, -0.65], w: 5, c: 'pr', layer: 'back' }, { k: 'line', a: [0.02, Y, 0.65], b: [0.02, 0, 0.65], w: 5, c: 'pr', layer: 'back' }];
  const pr = () => [...posts, pole];
  def('pullup', { zoom: 0.7, cam: 34, frames: [F(hang, 400, 0), F(top, 1000, 0), F(top, 200, 1), F(hang, 1100, 1)], steps: ['Ombros longe das orelhas, puxa o peito em direção à barra', 'Desce até esticar os braços, sem balançar'], props: pr });
  const ch = P(hang, { wL: [0.02, Y, -0.2], wR: [0.02, Y, 0.2], eL: [1, -1, 0.3], eR: [1, -1, -0.3] }), ct = P(top, { wL: [0.02, Y, -0.2], wR: [0.02, Y, 0.2], eL: [1, -1, 0.3], eR: [1, -1, -0.3] });
  def('chin', { zoom: 0.7, cam: 34, frames: [F(ch, 400, 0), F(ct, 1000, 0), F(ct, 200, 1), F(ch, 1100, 1)], steps: ['Palmas pra você, puxa até o queixo passar da barra', 'Desce controlando até o braço esticar'], props: pr });
  const h2 = P(hang, { p: [0.0, 1.17, 0] });
  def('hang', { zoom: 0.7, cam: 34, frames: [F(hang, 1400, 0), F(h2, 1400, 0)], steps: ['Pendurado com os ombros ativos (puxados pra baixo), aperta a barra com força'], props: pr });
  const lr0 = P(hang, { fL: [0.02, 0.24, -0.1], fR: [0.02, 0.24, 0.1], kL: [1, 0, 0], kR: [1, 0, 0] });
  const lr1 = P(lr0, { p: [-0.08, 1.15, 0], fL: [0.8, 1.05, -0.1], fR: [0.8, 1.05, 0.1], tL: [0.4, 1, 0], tR: [0.4, 1, 0] });
  def('hlr', { zoom: 0.7, cam: 34, frames: [F(lr0, 400, 0), F(lr1, 1000, 0), F(lr1, 300, 1), F(lr0, 1200, 1)], steps: ['Sem balanço, sobe as pernas até a linha do quadril', 'Desce devagar, sem embalar'], props: pr });
  // Puxada no aparelho (sentado)
  const sd = { p: [0, 0.5, 0], py: 0, cy: 0, lean: -6, fL: [0.42, 0, -0.14], fR: [0.42, 0, 0.14], kL: [1, 0.3, -0.1], kR: [1, 0.3, 0.1], tL: [1, 0, 0], tR: [1, 0, 0], wL: [0.08, 1.5, -0.42], wR: [0.08, 1.5, 0.42], eL: [0, -1, 1], eR: [0, -1, -1] };
  const sp = P(sd, { lean: -16, wL: [0.18, 1.0, -0.4], wR: [0.18, 1.0, 0.4] });
  def('pu', { zoom: 0.86, frames: [F(sd, 400, 0), F(sp, 900, 0), F(sp, 200, 1), F(sd, 1100, 1)], steps: ['Peito aberto, puxa a barra até o alto do peito com os cotovelos', 'Volta controlando até esticar os braços'],
    props: J => [{ k: 'box', x1: -0.2, x2: 0.22, y: 0.44, z1: -0.18, z2: 0.18 }, { k: 'line', a: [0.32, 0.6, -0.2], b: [0.32, 0.6, 0.2], w: 9, c: 'prb', layer: 'front' }, { k: 'line', a: mid(J.haL, J.haR), b: [0.1, 2.05, 0], w: 2, c: 'pr', layer: 'back' }, { k: 'bar', a: J.haL, b: J.haR, plates: false, ext: 0.12 }] });
  const bd = P(ST, { p: [0, 0.6, 0], fL: [-0.42, 0, -0.14], fR: [-0.42, 0, 0.14], kL: [0.2, -1, 0], kR: [0.2, -1, 0], tL: [-1, 0, 0], tR: [-1, 0, 0], lean: 4, wL: [0.2, 1.55, -0.3], wR: [0.2, 1.55, 0.3], eL: [0, -1, 1], eR: [0, -1, -1] });
  const bp_ = P(bd, { wL: [0.16, 1.08, -0.34], wR: [0.16, 1.08, 0.34] });
  def('bandpd', { zoom: 0.86, frames: [F(bd, 400, 0), F(bp_, 900, 0), F(bp_, 200, 1), F(bd, 1100, 1)], steps: ['Ajoelhado, elástico preso no alto da porta: puxa até o peito', 'Volta devagar, sem deixar o elástico puxar você'],
    props: J => [{ k: 'band', a: J.haL, b: [0.55, 2.05, 0] }, { k: 'band', a: J.haR, b: [0.55, 2.05, 0] }] }); }
// Remadas
{ const dn = P(ST, { p: [-0.16, 0.82, 0], lean: 66, fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], kL: [1, 0, -0.2], kR: [1, 0, 0.2], wL: [0.27, 0.43, -0.27], wR: [0.27, 0.43, 0.27], eL: [-1, 0, 0.4], eR: [-1, 0, -0.4] });
  const up = P(dn, { wL: [0.07, 0.8, -0.27], wR: [0.07, 0.8, 0.27] });
  def('row', { frames: [F(dn, 400, 0), F(up, 800, 0), F(up, 200, 1), F(dn, 1000, 1)], steps: ['Tronco inclinado e travado, puxa a barra até o umbigo com o cotovelo', 'Desce controlando, sem levantar o tronco'], props: J => [{ k: 'bar', a: J.haL, b: J.haR }] });
  const ud = P(ST, { p: [-0.2, 0.82, 0], lean: 72, fR: [0.18, 0, 0.18], fL: [-0.3, 0, -0.18], kL: [1, 0, -0.1], kR: [1, 0, 0.1], wR: [0.52, 0.5, 0.18], wL: [0.3, 0.32, -0.22], eR: [0, -1, -0.3], eL: [-1, 0, 0.3] });
  const uu = P(ud, { wL: [0.04, 0.68, -0.24], cy: 8 });
  def('dbrow', { frames: [F(ud, 400, 0), F(uu, 800, 0), F(uu, 200, 1), F(ud, 1000, 1)], steps: ['Mão de apoio no banco, puxa o halter em direção ao quadril', 'Desce esticando o braço, com leve rotação no fim'],
    props: J => [{ k: 'box', x1: 0.36, x2: 0.95, y: 0.48, z1: -0.05, z2: 0.3 }, { k: 'db', p: J.haL, d: [1, 0, 0] }] });
  const rd = P(ST, { p: [-0.05, 0.86, 0], lean: 4, fL: [0.05, 0, -0.16], fR: [0.05, 0, 0.16], hL: [0.52, -0.18, 0.16], hR: [0.52, -0.18, -0.16] });
  const ru = P(rd, { hL: [0.0, -0.2, 0.25], hR: [0.0, -0.2, -0.25], eL: [-1, 0, 0.3], eR: [-1, 0, -0.3] });
  const anch = [1.15, 1.0, 0];
  def('bandrow', { frames: [F(rd, 400, 0), F(ru, 800, 0), F(ru, 1000, 1), F(rd, 900, 1)], steps: ['Elástico preso na porta na altura do peito, puxa com o cotovelo', 'Pausa de 1 s com as escápulas juntas e volta devagar'],
    props: J => [{ k: 'band', a: J.haL, b: anch }, { k: 'band', a: J.haR, b: anch }] });
  const ibot = { ...SUP, p: [0.46, 0.13, 0], lean: -80, fL: [1.3, 0, -0.1], fR: [1.3, 0, 0.1], kL: [0, 1, 0], kR: [0, 1, 0], tL: [0.2, 1, 0], tR: [0.2, 1, 0], wL: [0.02, 0.78, -0.3], wR: [0.02, 0.78, 0.3] };
  const itop = P(ibot, { p: [0.45, 0.4, 0], lean: -66 });
  def('invrow', { ox: -10, zoom: 0.92, frames: [F(ibot, 400, 0), F(itop, 900, 0), F(itop, 300, 1), F(ibot, 1000, 1)], steps: ['Debaixo de uma mesa firme, corpo reto, puxa o peito até a borda', 'Desce até esticar os braços sem dobrar o quadril'],
    props: () => [{ k: 'box', x1: -0.55, x2: 0.12, y: 0.82, y0: 0.76, z1: -0.45, z2: 0.45, layer: 'front' }, { k: 'line', a: [-0.5, 0.78, 0.42], b: [-0.5, 0, 0.42], w: 5, c: 'pr', layer: 'back' }] }); }
// Tríceps na polia / elástico
{ const top = P(ST, { lean: 10, p: [-0.03, 0.88, 0], fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.24, -0.16, 0.1], hR: [0.24, -0.16, -0.1], eL: [-1, -0.3, 0], eR: [-1, -0.3, 0] });
  const bot = P(top, { hL: [0.12, -0.57, 0.13], hR: [0.12, -0.57, -0.13] });
  const st = ['Cotovelos colados no corpo, estica até o fim', 'Volta até 90°, sem o cotovelo sair do lugar'];
  def('tri', { frames: [F(top, 400, 0), F(bot, 700, 0), F(bot, 200, 1), F(top, 900, 1)], steps: st, props: J => [{ k: 'line', a: mid(J.haL, J.haR), b: [0.32, 2.1, 0], w: 2, c: 'pr', layer: 'back' }, { k: 'line', a: J.haL, b: J.haR, w: 5, c: 'prb' }] });
  def('bandtri', { frames: PAT.tri.frames, steps: ['Elástico preso no alto, cotovelos colados: estica até o fim', 'Volta devagar até 90°'], props: J => [{ k: 'band', a: J.haL, b: [0.35, 2.05, 0] }, { k: 'band', a: J.haR, b: [0.35, 2.05, 0] }] }); }
// Roscas
{ const dn = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.06, -0.57, 0.24], hR: [0.06, -0.57, -0.24], eL: [-1, -0.2, 0], eR: [-1, -0.2, 0] });
  const up = P(dn, { hL: [0.2, -0.14, 0.22], hR: [0.2, -0.14, -0.22] });
  def('curl', { frames: [F(dn, 400, 0), F(up, 800, 0), F(up, 200, 1), F(dn, 1100, 1)], steps: ['Cotovelo parado do lado do corpo, sobe o halter', 'Desce devagar até esticar o braço'], props: J => [{ k: 'db', p: J.haL, d: [0, 0, 1] }, { k: 'db', p: J.haR, d: [0, 0, 1] }] });
  def('ham', { frames: PAT.curl.frames, steps: ['Pegada neutra (polegar pra cima), cotovelo parado', 'Desce controlando: trabalha antebraço e punho'], props: J => [{ k: 'db', p: J.haL, d: [1, 0.4, 0] }, { k: 'db', p: J.haR, d: [1, 0.4, 0] }] });
  def('bandcurl', { frames: PAT.curl.frames, steps: ['Pisa no elástico, cotovelo parado, sobe', 'Desce devagar contra a tensão'], props: J => [{ k: 'band', a: J.haL, b: [0.08, 0.02, -0.13] }, { k: 'band', a: J.haR, b: [0.08, 0.02, 0.13] }] }); }
// Elevação lateral (vista mais de frente)
{ const dn = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.06, -0.54, 0.26], hR: [0.06, -0.54, -0.26], eL: [-0.3, 0.2, 1], eR: [-0.3, 0.2, -1] });
  const up = P(dn, { hL: [0.1, -0.06, 0.74], hR: [0.1, -0.06, -0.74] });
  def('lat', { cam: 72, frames: [F(dn, 400, 0), F(up, 900, 0), F(up, 200, 1), F(dn, 1100, 1)], steps: ['Sobe os braços pro lado até a linha do ombro, sem roubar com o corpo', 'Desce devagar'], props: J => [{ k: 'db', p: J.haL, d: [1, 0, 0] }, { k: 'db', p: J.haR, d: [1, 0, 0] }] });
  def('bandlat', { cam: 72, frames: PAT.lat.frames, steps: ['Pisa no elástico e sobe os braços até a linha do ombro', 'Desce devagar contra a tensão'], props: J => [{ k: 'band', a: J.haL, b: [0.05, 0.02, -0.15] }, { k: 'band', a: J.haR, b: [0.05, 0.02, 0.15] }] }); }
// Face pull e rotação externa
{ const st = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.53, 0.12, 0.1], hR: [0.53, 0.12, -0.1] });
  const pl = P(st, { hL: [0.12, 0.26, 0.32], hR: [0.12, 0.26, -0.32], eL: [-0.6, 0.3, 1], eR: [-0.6, 0.3, -1] });
  def('fp', { cam: 40, frames: [F(st, 400, 0), F(pl, 800, 0), F(pl, 400, 1), F(st, 1000, 1)], steps: ['Elástico na altura do rosto, puxa abrindo os cotovelos pra trás e pra cima', 'Segura um instante e volta devagar'],
    props: J => [{ k: 'band', a: J.haL, b: [1.1, 1.55, 0] }, { k: 'band', a: J.haR, b: [1.1, 1.55, 0] }] });
  const ei = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.26, -0.3, 0.06], eL: [0, -1, 0.15] });
  const eo = P(ei, { hL: [0.15, -0.3, 0.46] });
  def('er', { cam: 60, frames: [F(ei, 400, 0), F(eo, 900, 0), F(eo, 300, 1), F(ei, 1100, 1)], steps: ['Cotovelo colado (uma toalha embaixo ajuda), gira o antebraço pra fora', 'Volta devagar. Leve e controlado, é exercício de proteção'],
    props: J => [{ k: 'band', a: J.haL, b: [0.3, 1.0, 0.9] }] }); }
// Paralelas e mergulho no banco/cadeira
{ const Y = 1.12, top = { p: [-0.03, 1.22, 0], py: 0, cy: 0, lean: 8, wL: [0.02, Y, -0.27], wR: [0.02, Y, 0.27], eL: [-1, 0, 0.15], eR: [-1, 0, -0.15], fL: [-0.28, 0.48, -0.1], fR: [-0.28, 0.48, 0.1], kL: [1, -0.3, 0], kR: [1, -0.3, 0], tL: [0.2, -1, 0], tR: [0.2, -1, 0] };
  const bot = P(top, { p: [-0.1, 0.9, 0], lean: 20, fL: [-0.34, 0.18, -0.1], fR: [-0.34, 0.18, 0.1] });
  def('dip', { zoom: 0.86, frames: [F(top, 400, 0), F(bot, 1000, 0), F(bot, 150, 1), F(top, 800, 1)], steps: ['Tronco levemente à frente, desce até o ombro ficar na altura do cotovelo', 'Empurra de volta até esticar. Parou se doer o ombro'],
    props: () => [{ k: 'line', a: [-0.35, Y - 0.02, -0.27], b: [0.45, Y - 0.02, -0.27], w: 6, c: 'prb', layer: 'front' }, { k: 'line', a: [-0.35, Y - 0.02, 0.27], b: [0.45, Y - 0.02, 0.27], w: 6, c: 'prb', layer: 'back' }, { k: 'line', a: [0.4, Y, 0.27], b: [0.4, 0, 0.27], w: 5, c: 'pr', layer: 'back' }, { k: 'line', a: [0.4, Y, -0.27], b: [0.4, 0, -0.27], w: 5, c: 'pr', layer: 'front' }] });
  const ct = { p: [0.04, 0.5, 0], py: 0, cy: 0, lean: 0, wL: [-0.18, 0.46, -0.22], wR: [-0.18, 0.46, 0.22], eL: [-1, 0, 0.2], eR: [-1, 0, -0.2], fL: [0.62, 0, -0.12], fR: [0.62, 0, 0.12], kL: [0.3, 1, 0], kR: [0.3, 1, 0], tL: [0.3, 1, 0], tR: [0.3, 1, 0] };
  const cb = P(ct, { p: [0.03, 0.22, 0], lean: 6 });
  def('chairdip', { frames: [F(ct, 400, 0), F(cb, 1000, 0), F(cb, 150, 1), F(ct, 800, 1)], steps: ['Mãos na borda da cadeira firme, desce dobrando o cotovelo pra trás', 'Empurra de volta. Pare se sentir o ombro'],
    props: () => [{ k: 'box', x1: -0.62, x2: -0.14, y: 0.44 }] }); }
// Flexões
{ const top = { ...PRO, p: [0, 0.4, 0], lean: 66, fL: [-0.82, 0.03, -0.1], fR: [-0.82, 0.03, 0.1], tL: [0.3, -1, 0], tR: [0.3, -1, 0], kL: [0, -1, 0], kR: [0, -1, 0], wL: [0.44, 0, -0.25], wR: [0.44, 0, 0.25], eL: [-1, 0, 0.4], eR: [-1, 0, -0.4] };
  const bot = P(top, { p: [-0.02, 0.17, 0], lean: 79 });
  def('pushup', { ox: 40, zoom: 0.88, frames: [F(top, 400, 0), F(bot, 900, 0), F(bot, 150, 1), F(top, 700, 1)], steps: ['Corpo em prancha, desce até o peito quase encostar', 'Empurra o chão sem deixar o quadril cair'] });
  const air = P(top, { p: [0.02, 0.52, 0], lean: 62, wL: [0.46, 0.14, -0.25], wR: [0.46, 0.14, 0.25] });
  def('plyopush', { ox: 40, zoom: 0.88, frames: [F(top, 300, 0), F(bot, 600, 0), F(air, 220, 1, 'snap'), F(top, 260, 1), F(top, 500, 1)], steps: ['Desce controlando', 'Empurra o chão o mais rápido possível: as mãos saem do chão'] });
  const dt = P(top, { wL: [0.42, 0, -0.06], wR: [0.42, 0, 0.06], eL: [-1, 0, 0.05], eR: [-1, 0, -0.05] }), db_ = P(dt, { p: [-0.03, 0.19, 0], lean: 79 });
  def('diamond', { ox: 40, zoom: 0.88, frames: [F(dt, 400, 0), F(db_, 900, 0), F(db_, 150, 1), F(dt, 700, 1)], steps: ['Mãos juntas embaixo do peito, cotovelos colados no corpo', 'Empurra de volta mantendo a prancha'] });
  const pk = { ...PRO, p: [-0.2, 0.86, 0], lean: 140, fL: [-0.6, 0.05, -0.12], fR: [-0.6, 0.05, 0.12], tL: [0.4, -1, 0], tR: [0.4, -1, 0], kL: [-1, 0, 0], kR: [-1, 0, 0], wL: [0.34, 0, -0.25], wR: [0.34, 0, 0.25], eL: [-1, 0, 0.6], eR: [-1, 0, -0.6] };
  const pkd = P(pk, { p: [-0.12, 0.8, 0], lean: 120 });
  def('pike', { ox: 15, frames: [F(pk, 400, 0), F(pkd, 900, 0), F(pkd, 150, 1), F(pk, 800, 1)], steps: ['Quadril alto, desce a cabeça à frente das mãos', 'Empurra de volta. Prepara o ombro pra parada de mão'] });
  const pl = P(top, { p: [-0.02, 0.36, 0], lean: 70 }), pr1 = P(pl, { wL: [0.86, 0.32, -0.18] }), pr2 = P(pl, { wR: [0.86, 0.32, 0.18] });
  def('plankrot', { ox: 40, zoom: 0.88, frames: [F(pl, 400, 0), F(pr1, 900, 0), F(pl, 700, 0), F(pr2, 900, 1), F(pl, 700, 1)], steps: ['Em prancha, estica um braço à frente sem o quadril girar', 'Troca de braço. Pés afastados facilitam'] }); }
// Afundo e búlgaro
{ const up = P(ST, { p: [-0.06, 0.86, 0], fL: [0.32, 0, -0.12], fR: [-0.44, 0.06, 0.12], tR: [1, -0.6, 0], kL: [1, 0, -0.1], kR: [1, 0, 0.1] });
  const dn = P(up, { p: [-0.06, 0.5, 0], kR: [0.1, -1, 0] });
  def('afundo', { frames: [F(up, 400, 0), F(dn, 1000, 0), F(dn, 150, 1), F(up, 800, 1)], steps: ['Passo largo, desce até o joelho de trás quase encostar no chão', 'Sobe empurrando pelo pé da frente'] });
  const bu = P(ST, { p: [-0.1, 0.83, 0], lean: 10, fL: [0.22, 0, -0.12], fR: [-0.66, 0.46, 0.12], tR: [-1, -0.2, 0], kR: [0.2, -1, 0], kL: [1, 0, -0.1], wL: [-0.02, 0.73, -0.24], wR: [-0.02, 0.73, 0.24] });
  const bd = P(bu, { p: [-0.12, 0.5, 0], lean: 16, wL: [0.02, 0.42, -0.24], wR: [0.02, 0.42, 0.24] });
  def('bul', { frames: [F(bu, 400, 0), F(bd, 1100, 0), F(bd, 150, 1), F(bu, 800, 1)], steps: ['Pé de trás no banco, desce reto até a coxa da frente ficar paralela', 'Sobe pelo pé da frente, joelho alinhado'],
    props: J => [{ k: 'box', x1: -0.95, x2: -0.58, y: 0.44 }, { k: 'db', p: J.haL, d: [1, 0, 0] }, { k: 'db', p: J.haR, d: [1, 0, 0] }] }); }
// Caminhada do fazendeiro
{ const a = P(ST, { lean: 3, fL: [0.22, 0, -0.12], fR: [-0.2, 0.04, 0.12], tR: [1, -0.4, 0], p: [0.0, 0.87, 0], hL: [0.02, -0.56, 0.27], hR: [0.02, -0.56, -0.27], eL: [-0.2, -1, 0.4], eR: [-0.2, -1, -0.4] });
  const b = P(a, { fL: [-0.2, 0.04, -0.12], fR: [0.22, 0, 0.12], tL: [1, -0.4, 0], tR: [1, 0, 0.12], kL: [1, 0, -0.15], kR: [1, 0, 0.15] });
  def('farm', { frames: [F(a, 500, 0), F(b, 500, 0), F(a, 500, 0)], steps: ['Halteres pesados, tronco alto, passos curtos e firmes'], props: J => [{ k: 'db', p: J.haL, d: [1, 0, 0] }, { k: 'db', p: J.haR, d: [1, 0, 0] }] }); }
// Anti-rotação e rotação
{ const ch = P(ATH, { cam: 0, hL: [0.16, -0.12, 0.03], hR: [0.16, -0.12, -0.03] });
  const pr = P(ch, { hL: [0.54, -0.1, 0.02], hR: [0.54, -0.1, -0.02] });
  def('pal', { cam: 35, frames: [F(ch, 400, 0), F(pr, 700, 0), F(pr, 900, 1), F(ch, 700, 1)], steps: ['Elástico preso do lado, na altura do peito: empurra pra frente', 'Segura 2 s sem deixar o tronco girar e volta'],
    props: J => [{ k: 'band', a: mid(J.haL, J.haR), b: [0.1, 1.15, 1.0] }] });
  const mL = P(ATH, { cy: -35, py: -15, hL: [0.38, -0.35, 0.3], hR: [0.38, -0.33, 0.22] }), mT = P(ATH, { p: [-0.02, 0.86, 0], hL: [0.42, 0.18, 0.03], hR: [0.42, 0.16, -0.03] }), mR = P(ATH, { cy: 35, py: 15, hL: [0.38, -0.33, -0.22], hR: [0.38, -0.35, -0.3], eL: [-0.4, -1, -0.3], eR: [-0.4, -1, -0.6] });
  def('lmr', { cam: 40, frames: [F(mL, 500, 0), F(mT, 600, 0), F(mR, 600, 1), F(mT, 600, 1)], steps: ['Pé gira, quadril leva: a barra vai de um quadril até o outro em arco', 'Braços quase retos, quem gira é o corpo'],
    props: J => [{ k: 'line', a: [1.25, 0.02, 0], b: ext(mid(J.haL, J.haR), [1.25, 0.02, 0], 0.08), w: 5, c: 'prb' }, { k: 'line', a: [1.2, 0.0, 0], b: [1.32, 0.0, 0], w: 8, c: 'pr', layer: 'back' }] }); }
// Y-T-W deitado de bruços
{ const base = { ...PRO, p: [0, 0.1, 0], fL: [-0.88, 0.06, -0.1], fR: [-0.88, 0.06, 0.1], tL: [-0.2, -1, 0], tR: [-0.2, -1, 0], kL: [0, -1, 0], kR: [0, -1, 0], eL: [0, 1, 0.5], eR: [0, 1, -0.5] };
  const y0 = P(base, { wL: [0.98, 0.06, -0.38], wR: [0.98, 0.06, 0.38] }), y1 = P(base, { wL: [0.95, 0.28, -0.4], wR: [0.95, 0.28, 0.4] });
  const t1 = P(base, { wL: [0.48, 0.3, -0.75], wR: [0.48, 0.3, 0.75] }), w1 = P(base, { wL: [0.62, 0.3, -0.42], wR: [0.62, 0.3, 0.42], eL: [-1, 0.6, 0.8], eR: [-1, 0.6, -0.8] });
  def('ytw', { cam: 40, tilt: 18, ox: 10, frames: [F(y0, 400, 0), F(y1, 700, 0), F(y0, 500, 0), F(t1, 800, 1), F(y0, 500, 1), F(w1, 800, 2), F(y0, 500, 2)], steps: ['Y: braços à frente em diagonal, polegar pra cima, sobe', 'T: braços abertos pro lado', 'W: cotovelos dobrados, aperta as escápulas'] }); }
// Hollow
{ const h0 = { ...SUP, p: [0, 0.1, 0], lean: -76, wL: [-0.98, 0.42, -0.16], wR: [-0.98, 0.42, 0.16], eL: [0, 1, 0.3], eR: [0, 1, -0.3], fL: [0.86, 0.32, -0.05], fR: [0.86, 0.32, 0.05], tL: [1, 0.2, 0], tR: [1, 0.2, 0], kL: [0, 1, 0], kR: [0, 1, 0] };
  const h1 = P(h0, { p: [0, 0.09, 0], lean: -80, fL: [0.88, 0.22, -0.05], fR: [0.88, 0.22, 0.05] });
  def('hollow', { ox: 20, zoom: 0.9, frames: [F(h0, 900, 0), F(h1, 900, 0)], steps: ['Lombar colada no chão, braços e pernas estendidos e afastados do chão. Segura'] }); }
// Prancha de Copenhague (vista de frente, deitado de lado)
const TW = -90;
{ const c0 = { p: [0.05, 0.36, 0], py: 0, cy: 0, lean: -80, tw: TW, fL: [0.98, 0.47, 0], fR: [0.86, 0.1, 0.05], tL: [1, 0, 0], tR: [1, 0, 0], kL: [0, 1, -1], kR: [0, 1, -1], wR: [-0.28, 0.03, -0.22], wL: [0.0, 0.5, -0.12], eR: [0, 0, -1], eL: [0, 1, 0] };
  const c1 = P(c0, { p: [0.05, 0.24, 0], lean: -84 });
  def('copen', { cam: 0, zoom: 0.9, ox: 20, frames: [F(c1, 500, 0), F(c0, 800, 0), F(c0, 1200, 1), F(c1, 800, 1)], steps: ['De lado, antebraço no chão e perna de cima apoiada no sofá: sobe o quadril', 'Segura com o corpo reto. A virilha de cima faz a força'],
    props: () => [{ k: 'box', x1: 0.78, x2: 1.2, y: 0.42 }] }); }
// Isometria de pescoço e de pegada
{ const n0 = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.3, 0.27, 0.02], eL: [0.4, -1, 0.6] });
  const n1 = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.02, 0.3, 0.2], eL: [0, -0.3, 1] });
  const n2 = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [-0.14, 0.3, 0.06], hR: [-0.14, 0.3, -0.06], eL: [0.3, 0.2, 1], eR: [0.3, 0.2, -1] });
  def('neck', { cam: 45, frames: [F(n0, 1400, 0), F(n1, 1400, 1), F(n2, 1400, 2)], steps: ['Frente: mão na testa empurra, pescoço não se mexe', 'Lado: mão na lateral da cabeça', 'Trás: mãos atrás da cabeça. Faça também do outro lado'] });
  const g0 = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.36, -0.22, 0.1], hR: [0.36, -0.22, -0.1], eL: [-0.4, -1, 0.5], eR: [-0.4, -1, -0.5] });
  const g1 = P(g0, { hL: [0.38, -0.2, 0.1], hR: [0.34, -0.26, -0.1] });
  def('towelgrip', { cam: 40, frames: [F(g0, 300, 0), F(g1, 300, 0), F(g0, 300, 0), F(g1, 300, 0)], steps: ['Toalha molhada nas duas mãos, torce com força máxima e segura'], props: J => [{ k: 'line', a: J.haL, b: J.haR, w: 9, c: 'pr' }] }); }
// Potência
{ const s0 = P(ST, { hL: [0.05, -0.5, 0.22], hR: [0.05, -0.5, -0.22] });
  const dip = P(s0, { p: [-0.2, 0.58, 0], lean: 34, kL: [1, 0, -0.2], kR: [1, 0, 0.2], hL: [-0.32, -0.38, 0.2], hR: [-0.32, -0.38, -0.2] });
  const air = P(s0, { p: [0.14, 1.28, 0], lean: 0, fL: [0.18, 0.4, -0.13], fR: [0.18, 0.4, 0.13], tL: [1, -0.6, 0], tR: [1, -0.6, 0], hL: [0.3, 0.46, 0.18], hR: [0.3, 0.46, -0.18], eL: [0, -1, 0.3], eR: [0, -1, -0.3] });
  const land = P(s0, { p: [0.38, 0.98, 0], lean: 26, fL: [0.6, 0.5, -0.15], fR: [0.6, 0.5, 0.15], kL: [1, 0, -0.2], kR: [1, 0, 0.2], hL: [0.4, -0.15, 0.2], hR: [0.4, -0.15, -0.2] });
  const stand = P(s0, { p: [0.58, 1.4, 0], fL: [0.6, 0.5, -0.13], fR: [0.6, 0.5, 0.13] });
  def('jump', { zoom: 0.82, ox: -10, frames: [F(s0, 500, 0), F(dip, 450, 0, 'load'), F(air, 260, 1, 'snap'), F(land, 300, 2), F(stand, 500, 2), F(stand, 400, 2)], steps: ['Desce rápido e balança os braços pra trás', 'Explode pra cima com tudo: máxima intenção', 'Aterrissa macio, joelho dobrando. Desce da caixa, não pule pra trás'],
    props: () => [{ k: 'box', x1: 0.34, x2: 0.94, y: 0.5 }] });
  const pg0 = P(s0, { p: [0, 0.92, 0], fL: [0.03, 0.06, -0.12], fR: [0.03, 0.06, 0.12], tL: [1, -0.5, 0], tR: [1, -0.5, 0], hL: [0.12, -0.42, 0.24], hR: [0.12, -0.42, -0.24] });
  const pg1 = P(pg0, { p: [0, 1.06, 0], fL: [0.03, 0.2, -0.12], fR: [0.03, 0.2, 0.12], tL: [1, -1, 0], tR: [1, -1, 0] });
  def('pogo', { frames: [F(pg0, 150, 0), F(pg1, 200, 0, 'snap'), F(pg0, 200, 0)], steps: ['Tornozelo duro, contato curto no chão: quica como mola, quase sem dobrar o joelho'] });
  const c0 = P(ATH, { hL: [0.2, -0.08, 0.13], hR: [0.2, -0.08, -0.13], eL: [-0.2, -1, 0.7], eR: [-0.2, -1, -0.7] });
  const c1 = P(c0, { p: [0.12, 0.88, 0], lean: 14, fR: [-0.1, 0.03, 0.2], tR: [1, -0.4, 0], hL: [0.6, 0, 0.11], hR: [0.6, 0, -0.11] });
  const cb = P(c0, { hL: [0.82, 0.05, 0.1], hR: [0.82, 0.05, -0.1] });
  def('mbc', { cam: 30, frames: [F(c0, 600, 0), F(c1, 230, 1, 'snap'), F(cb, 300, 1), F(c0, 600, 0)], steps: ['Bola no peito, base atlética', 'Explode empurrando como um direto com os dois braços'],
    props: J => [{ k: 'ball', p: mid(J.haL, J.haR).map((v, i) => i === 0 ? v + 0.08 : v) }] });
  const r0 = P(ATH, { py: -60, cy: -80, lean: 10, fL: [0.15, 0, -0.25], fR: [-0.15, 0, 0.25], hL: [0.25, -0.3, -0.05], hR: [0.25, -0.35, -0.2], eL: [-0.4, -1, 0.2], eR: [-0.4, -1, -0.3] });
  const r1 = P(r0, { py: 20, cy: 40, hL: [0.5, -0.05, -0.05], hR: [0.5, -0.05, -0.2] });
  def('mbr', { cam: 10, frames: [F(r0, 700, 0, 'load'), F(r1, 280, 1, 'snap'), F(r1, 400, 1), F(r0, 600, 0)], steps: ['De lado pra parede, carrega no quadril de trás', 'Gira o quadril antes dos ombros e solta a bola como um cruzado'],
    props: J => [{ k: 'ball', p: mid(J.haL, J.haR) }] }); }


// ==================== Biblioteca ampliada (v3.21) ====================
const SEAT = { p: [0, 0.5, 0], py: 0, cy: 0, lean: -4, fL: [0.45, 0, -0.14], fR: [0.45, 0, 0.14], kL: [1, 0.3, 0], kR: [1, 0.3, 0], tL: [1, 0, 0], tR: [1, 0, 0], hL: [0.05, -0.5, 0.26], hR: [0.05, -0.5, -0.26] };
const BENCH = { ...SUP, p: [0, 0.52, 0], fL: [0.42, 0, -0.24], fR: [0.42, 0, 0.24], kL: [0.3, 1, -0.3], kR: [0.3, 1, 0.3], tL: [1, 0, -0.2], tR: [1, 0, 0.2] };
const BENCHBOX = { k: 'box', x1: -0.95, x2: 0.15, y: 0.44, z1: -0.16, z2: 0.16 };
const QUAD = { ...PRO, p: [-0.02, 0.52, 0], fL: [-0.45, 0.04, -0.12], fR: [-0.45, 0.04, 0.12], kL: [0, -1, 0], kR: [0, -1, 0], tL: [-1, 0, 0], tR: [-1, 0, 0], wL: [0.45, 0, -0.18], wR: [0.45, 0, 0.18], eL: [-1, 0, 0.3], eR: [-1, 0, -0.3] };
const KNEEL = { p: [0, 0.52, 0], py: 0, cy: 0, lean: 0, fL: [-0.43, 0.04, -0.12], fR: [-0.43, 0.04, 0.12], kL: [0.2, -1, 0], kR: [0.2, -1, 0], tL: [-1, 0, 0], tR: [-1, 0, 0] };
const seatBox = { k: 'box', x1: -0.22, x2: 0.4, y: 0.45, z1: -0.2, z2: 0.2 }, backRest = { k: 'line', a: [-0.2, 0.46, 0], b: [-0.28, 1.25, 0], w: 12, c: 'pr', layer: 'back' };
const dbs = (d = [1, 0, 0]) => J => [{ k: 'db', p: J.haL, d }, { k: 'db', p: J.haR, d }];
const barP = (r) => J => [{ k: 'bar', a: J.haL, b: J.haR, r }];
const STD = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15] });
const rep4 = (a, b, d1 = 900, d2 = 1000) => [F(a, 400, 0), F(b, d1, 0), F(b, 200, 1), F(a, d2, 1)];

// Pernas
{ const bent = P(SEAT, { p: [0, 0.52, 0], fL: [0.47, 0.08, -0.12], fR: [0.47, 0.08, 0.12], kL: [1, 0.6, 0], kR: [1, 0.6, 0], tL: [1, 0.2, 0], tR: [1, 0.2, 0], wL: [0.05, 0.45, -0.3], wR: [0.05, 0.45, 0.3] });
  const st = P(bent, { fL: [0.88, 0.47, -0.12], fR: [0.88, 0.47, 0.12], tL: [0.3, 1, 0], tR: [0.3, 1, 0] });
  def('ext', { frames: [F(bent, 400, 0), F(st, 800, 0), F(st, 400, 1), F(bent, 1000, 1)], steps: ['Costas no encosto, estica a perna até o fim', 'Segura 1 s em cima e desce devagar'],
    props: J => [seatBox, backRest, { k: 'line', a: [J.anL[0] + 0.05, J.anL[1] + 0.05, -0.22], b: [J.anL[0] + 0.05, J.anL[1] + 0.05, 0.22], w: 10, c: 'prb', layer: 'front' }] }); }
{ const up = P(ST, { p: [-0.05, 0.86, 0], lean: -12, fL: [0.15, 0, -0.17], fR: [0.15, 0, 0.17], tL: [1, 0, -0.35], tR: [1, 0, 0.35], hL: [-0.04, 0.08, 0.3], hR: [-0.04, 0.08, -0.3], eL: [0, -1, 0.6], eR: [0, -1, -0.6] });
  const dn = P(up, { p: [-0.2, 0.5, 0], lean: -4, kL: [1, 0.2, -0.4], kR: [1, 0.2, 0.4] });
  def('hack', { frames: rep4(up, dn, 1200, 900), steps: ['Costas coladas no apoio, desce fundo', 'Sobe empurrando a plataforma com o pé inteiro'],
    props: J => [{ k: 'line', a: [J.pel[0] - 0.14, J.pel[1] - 0.06, 0], b: [J.neck[0] - 0.14, J.neck[1] + 0.02, 0], w: 13, c: 'pr', layer: 'back' }, { k: 'line', a: [-0.3, 0.01, 0], b: [0.4, 0.01, 0], w: 6, c: 'prb', layer: 'back' }] }); }
{ const up = P(ST, { p: [0, 0.88, 0], fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], wL: [0.07, 0.76, -0.24], wR: [0.07, 0.76, 0.24], eL: [-1, -0.3, 0.2], eR: [-1, -0.3, -0.2] });
  const dn = P(up, { p: [-0.24, 0.62, 0], lean: 62, wL: [0.15, 0.28, -0.24], wR: [0.15, 0.28, 0.24], kL: [1, 0, -0.3], kR: [1, 0, 0.3] });
  def('dl', { cam: 30, frames: [F(dn, 500, 0), F(up, 1100, 0), F(up, 300, 1), F(dn, 1100, 1)], steps: ['Barra colada na canela, peito aberto, empurra o chão com as pernas', 'Trava o quadril em cima e desce com a barra raspando na perna'], props: barP(0.22) }); }
{ const up = P(ST, { fL: [0.03, 0, -0.36], fR: [0.03, 0, 0.36], tL: [0.6, 0, -0.8], tR: [0.6, 0, 0.8], kL: [0.6, 0, -0.8], kR: [0.6, 0, 0.8], wL: [0.08, 0.82, -0.05], wR: [0.08, 0.82, 0.05], eL: [0, -1, 0.3], eR: [0, -1, -0.3] });
  const dn = P(up, { p: [-0.08, 0.55, 0], lean: 12, wL: [0.1, 0.46, -0.05], wR: [0.1, 0.46, 0.05] });
  def('sumo', { cam: 50, frames: rep4(up, dn, 1100, 900), steps: ['Pés afastados e virados pra fora, desce reto com o halter entre as pernas', 'Sobe empurrando os joelhos pra fora'],
    props: J => [{ k: 'db', p: [mid(J.haL, J.haR)[0], mid(J.haL, J.haR)[1] - 0.1, 0], d: [0, 1, 0] }] }); }
def('walklunge', { frames: PAT.afundo.frames, steps: ['Passo longo à frente, desce até o joelho de trás quase encostar', 'Sobe e já leva a outra perna pra frente'], props: dbs() });
{ const s0 = P(ST, { p: [-0.02, 0.86, 0], lean: 10, fL: [0.4, 0.42, -0.12], fR: [-0.06, 0, 0.12], kL: [1, 0.2, -0.1], hL: [0.1, -0.45, 0.25], hR: [0.1, -0.45, -0.25] });
  const s1 = P(s0, { p: [0.38, 1.3, 0], lean: 4, fR: [0.44, 0.42, 0.12] });
  def('stepup', { zoom: 0.82, frames: rep4(s0, s1, 900, 1000), steps: ['Pé inteiro em cima do banco, sobe com a força dessa perna', 'Desce controlando, sem despencar'], props: () => [{ k: 'box', x1: 0.22, x2: 0.66, y: 0.42 }] }); }
{ const up = P(ST, { fL: [0.03, 0, -0.1], fR: [-0.12, 0.05, 0.12], tR: [1, -0.4, 0], wL: [0.07, 0.76, -0.22], wR: [0.07, 0.76, 0.22], eL: [-1, -0.3, 0.2], eR: [-1, -0.3, -0.2] });
  const dn = P(up, { p: [-0.15, 0.85, 0], lean: 80, fR: [-0.95, 0.66, 0.1], kR: [0, -1, 0], tR: [0, -1, 0], wL: [0.3, 0.36, -0.22], wR: [0.3, 0.36, 0.22] });
  def('singlerdl', { frames: rep4(up, dn, 1300, 1000), steps: ['Apoiado numa perna, tronco desce e a perna de trás sobe junto', 'Volta apertando o glúteo da perna de apoio, quadril reto'], props: J => [{ k: 'db', p: J.haL, d: [1, 0, 0] }] }); }
{ const up = P(KNEEL, { hL: [0.25, -0.25, 0.22], hR: [0.25, -0.25, -0.22], eL: [-0.6, -1, 0.3], eR: [-0.6, -1, -0.3] });
  const dn = P(up, { p: [0.34, 0.36, 0], lean: 52, hL: [0.42, -0.12, 0.22], hR: [0.42, -0.12, -0.22] });
  def('nordic', { frames: [F(up, 400, 0), F(dn, 1800, 0, 'lin'), F(dn, 200, 1), F(up, 1200, 1)], steps: ['Pés presos, corpo reto do joelho à cabeça: desce o mais devagar que conseguir', 'Aparou nas mãos, empurra e volta'],
    props: J => [{ k: 'line', a: [J.anL[0] + 0.02, J.anL[1] + 0.08, -0.22], b: [J.anL[0] + 0.02, J.anL[1] + 0.08, 0.22], w: 10, c: 'prb', layer: 'front' }] }); }
{ const up = { py: 0, cy: 0, p: [0, 0.8, 0], lean: 48, fL: [-0.6, 0.25, -0.1], fR: [-0.6, 0.25, 0.1], kL: [0, -1, 0], kR: [0, -1, 0], tL: [0.3, -1, 0], tR: [0.3, -1, 0], hL: [0.14, -0.06, 0.06], hR: [0.14, -0.06, -0.06], eL: [0, -1, 1], eR: [0, -1, -1] };
  const dn = P(up, { lean: 128 });
  def('hipext', { ox: 10, frames: [F(dn, 400, 0), F(up, 900, 0), F(up, 400, 1), F(dn, 1100, 1)], steps: ['Quadril no apoio, dobra pra frente e sobe apertando o glúteo', 'Para quando o corpo alinhar, sem jogar a cabeça pra trás'],
    props: J => [{ k: 'line', a: [-0.62, 0.2, 0], b: [0.06, 0.72, 0], w: 7, c: 'pr', layer: 'back' }, { k: 'line', a: [-0.05, 0.68, 0], b: [0.14, 0.82, 0], w: 14, c: 'prb', layer: 'back' }, { k: 'line', a: [J.anL[0] + 0.06, J.anL[1] - 0.05, -0.2], b: [J.anL[0] + 0.06, J.anL[1] - 0.05, 0.2], w: 9, c: 'prb', layer: 'front' }, { k: 'line', a: [-0.62, 0.2, 0], b: [-0.62, 0, 0], w: 5, c: 'pr', layer: 'back' }] }); }
{ const s0 = { p: [0, 0.5, 0], py: 0, cy: 0, lean: -12, fL: [0.42, 0.06, -0.14], fR: [0.42, 0.06, 0.14], kL: [1, 0.4, -0.2], kR: [1, 0.4, 0.2], tL: [1, 0, 0], tR: [1, 0, 0], wL: [0.0, 0.45, -0.3], wR: [0.0, 0.45, 0.3] };
  const s1 = P(s0, { fL: [0.38, 0.06, -0.44], fR: [0.38, 0.06, 0.44], kL: [0.6, 0.4, -1], kR: [0.6, 0.4, 1], tL: [1, 0, -0.5], tR: [1, 0, 0.5] });
  def('abd', { cam: 72, frames: rep4(s0, s1, 800, 1000), steps: ['Sentado com as costas no encosto, abre os joelhos contra a almofada', 'Volta devagar sem deixar o peso bater'],
    props: J => [seatBox, backRest, { k: 'line', a: [J.knL[0], J.knL[1] - 0.06, J.knL[2] - 0.07], b: [J.knL[0], J.knL[1] + 0.08, J.knL[2] - 0.07], w: 9, c: 'prb', layer: 'front' }, { k: 'line', a: [J.knR[0], J.knR[1] - 0.06, J.knR[2] + 0.07], b: [J.knR[0], J.knR[1] + 0.08, J.knR[2] + 0.07], w: 9, c: 'prb', layer: 'back' }] }); }
{ const s0 = P(ST, { lean: 25, p: [-0.05, 0.86, 0], fR: [0.03, 0, 0.13], fL: [0.0, 0.03, -0.13], wL: [0.5, 1.1, -0.2], wR: [0.5, 1.1, 0.2], eL: [-1, -0.3, 0.3], eR: [-1, -0.3, -0.3] });
  const s1 = P(s0, { fL: [-0.62, 0.42, -0.13], kL: [0, -1, 0], tL: [0, -1, 0] });
  def('cablekick', { frames: rep4(s0, s1, 800, 900), steps: ['Apoiado na máquina, leva a perna pra trás com o glúteo', 'Volta controlando, sem arquear a lombar'],
    props: J => [{ k: 'line', a: [0.55, 0, -0.3], b: [0.55, 1.9, -0.3], w: 6, c: 'pr', layer: 'back' }, { k: 'line', a: J.anL, b: [0.55, 0.08, -0.13], w: 2, c: 'pr' }] }); }
{ const dn = P(SEAT, { p: [0, 0.52, 0], lean: -2, fL: [0.47, 0.08, -0.13], fR: [0.47, 0.08, 0.13], kL: [1, 0.8, 0], kR: [1, 0.8, 0], tL: [1, 0.25, 0], tR: [1, 0.25, 0], wL: [0.42, 0.66, -0.22], wR: [0.42, 0.66, 0.22], eL: [0, -1, 0.5], eR: [0, -1, -0.5] });
  const up = P(dn, { fL: [0.47, 0.16, -0.13], fR: [0.47, 0.16, 0.13], tL: [1, -0.8, 0], tR: [1, -0.8, 0] });
  def('seatcalf', { frames: rep4(dn, up, 700, 1000), steps: ['Joelho embaixo da almofada, sobe na ponta do pé', 'Desce até alongar e pausa embaixo'],
    props: J => [seatBox, { k: 'line', a: [J.knL[0] - 0.05, J.knL[1] + 0.07, -0.25], b: [J.knL[0] - 0.05, J.knL[1] + 0.07, 0.25], w: 10, c: 'prb', layer: 'front' }, { k: 'box', x1: 0.5, x2: 0.72, y: 0.1, z1: -0.25, z2: 0.25 }] }); }
{ const dn = P(ST, { p: [-0.2, 0.8, 0], lean: 68, fL: [0.05, 0, -0.2], fR: [0.05, 0, 0.2], kL: [1, 0, -0.25], kR: [1, 0, 0.25], wL: [-0.05, 0.5, -0.05], wR: [-0.05, 0.5, 0.05], eL: [-1, 0, 0.2], eR: [-1, 0, -0.2] });
  const up = P(ST, { p: [0.02, 0.9, 0], lean: -4, fL: [0.05, 0, -0.2], fR: [0.05, 0, 0.2], wL: [0.52, 1.2, -0.05], wR: [0.52, 1.2, 0.05], eL: [0, -1, 0.3], eR: [0, -1, -0.3] });
  def('kbswing', { frames: [F(dn, 500, 0, 'load'), F(up, 350, 1, 'snap'), F(up, 150, 1), F(dn, 600, 0)], steps: ['Kettlebell passa entre as pernas, quadril vai pra trás', 'Joga o quadril pra frente: o peso sobe até o peito sozinho'],
    props: J => [{ k: 'ball', p: [mid(J.haL, J.haR)[0], mid(J.haL, J.haR)[1] - 0.08, 0], r: 0.1, cls: 'dbb' }] }); }
// Peito
{ const iu = P(BENCH, { p: [0, 0.5, 0], lean: -58, wL: [-0.34, 1.32, -0.42], wR: [-0.34, 1.32, 0.42] }), id = P(iu, { wL: [-0.3, 0.95, -0.44], wR: [-0.3, 0.95, 0.44] });
  def('incbp', { ox: 25, frames: rep4(iu, id, 1100, 800), steps: ['Banco a 30°, desce a barra no alto do peito', 'Empurra pra cima sem tirar as escápulas do banco'],
    props: J => [{ k: 'box', x1: -0.2, x2: 0.2, y: 0.42, z1: -0.16, z2: 0.16 }, { k: 'line', a: [-0.12, 0.44, 0], b: [-0.62, 0.78, 0], w: 12, c: 'pr', layer: 'back' }, { k: 'bar', a: J.haL, b: J.haR }] }); }
{ const up = P(BENCH, { wL: [-0.44, 1.02, -0.14], wR: [-0.44, 1.02, 0.14], eL: [-1, 0, 0.6], eR: [-1, 0, -0.6] }), dn = P(up, { wL: [-0.44, 0.64, -0.62], wR: [-0.44, 0.64, 0.62] });
  def('fly', { ox: 25, cam: 38, frames: rep4(up, dn, 1100, 900), steps: ['Cotovelo levemente dobrado, abre os braços até alongar o peito', 'Fecha como num abraço, sem bater os halteres'], props: J => [BENCHBOX, ...dbs([1, 0, 0])(J)] });
  const dp0 = P(BENCH, { wL: [-0.42, 1.02, -0.05], wR: [-0.42, 1.02, 0.05], eL: [-0.3, 0, 1], eR: [-0.3, 0, -1] }), dp1 = P(dp0, { wL: [-0.98, 0.64, -0.05], wR: [-0.98, 0.64, 0.05] });
  def('dbpullover', { ox: 35, frames: rep4(dp0, dp1, 1100, 900), steps: ['Halter em cima do peito, leva pra trás da cabeça com o braço quase reto', 'Volta puxando com as costas'],
    props: J => [BENCHBOX, { k: 'db', p: mid(J.haL, J.haR), d: [0.4, 1, 0] }] }); }
{ const op = P(ST, { lean: 14, fL: [0.18, 0, -0.15], fR: [-0.15, 0, 0.15], wL: [0.15, 1.45, -0.72], wR: [0.15, 1.45, 0.72], eL: [-0.3, 0.2, 1], eR: [-0.3, 0.2, -1] }), cl = P(op, { wL: [0.48, 1.06, -0.06], wR: [0.48, 1.06, 0.06] });
  def('cross', { cam: 55, frames: rep4(op, cl, 900, 1000), steps: ['Um pé à frente, braços abertos com o cotovelo levemente dobrado', 'Junta as mãos na frente do peito e volta devagar'],
    props: J => [{ k: 'line', a: J.haL, b: [0.0, 2.05, -0.95], w: 2, c: 'pr' }, { k: 'line', a: J.haR, b: [0.0, 2.05, 0.95], w: 2, c: 'pr' }] }); }
{ const op = P(SEAT, { lean: -2, hL: [-0.02, 0.0, 0.62], hR: [-0.02, 0.0, -0.62], eL: [0, -0.3, 1], eR: [0, -0.3, -1] }), cl = P(op, { hL: [0.45, 0.02, 0.05], hR: [0.45, 0.02, -0.05] });
  def('pecdeck', { cam: 65, frames: rep4(op, cl, 900, 1000), steps: ['Costas no encosto, braços abertos na altura do peito', 'Junta as mãos à frente e volta sem deixar o peso bater'], props: () => [seatBox, backRest] }); }
// Costas
{ const ex = { p: [0, 0.45, 0], py: 0, cy: 0, lean: 18, fL: [0.82, 0.25, -0.12], fR: [0.82, 0.25, 0.12], kL: [0.2, 1, -0.1], kR: [0.2, 1, 0.1], tL: [0.3, 1, 0], tR: [0.3, 1, 0], wL: [0.66, 0.72, -0.08], wR: [0.66, 0.72, 0.08], eL: [-1, -0.3, 0.3], eR: [-1, -0.3, -0.3] };
  const pl = P(ex, { lean: -2, wL: [0.12, 0.76, -0.18], wR: [0.12, 0.76, 0.18] });
  def('seatrow', { ox: 10, frames: rep4(ex, pl, 800, 1000), steps: ['Peito estufado, puxa o triângulo até a barriga', 'Volta esticando os braços sem curvar a coluna'],
    props: J => [{ k: 'box', x1: -0.3, x2: 0.3, y: 0.4, z1: -0.18, z2: 0.18 }, { k: 'line', a: [0.92, 0.05, 0], b: [0.92, 0.45, 0], w: 9, c: 'prb', layer: 'back' }, { k: 'line', a: mid(J.haL, J.haR), b: [1.05, 0.5, 0], w: 2, c: 'pr' }] }); }
{ const dn = P(ST, { p: [-0.16, 0.8, 0], lean: 50, fL: [0.03, 0, -0.18], fR: [0.03, 0, 0.18], kL: [1, 0, -0.25], kR: [1, 0, 0.25], wL: [0.22, 0.52, -0.08], wR: [0.22, 0.52, 0.08], eL: [-1, 0, 0.4], eR: [-1, 0, -0.4] });
  const up = P(dn, { wL: [0.12, 0.86, -0.08], wR: [0.12, 0.86, 0.08] }), piv = [-1.05, 0.03, 0];
  def('tbar', { ox: 30, frames: rep4(dn, up, 800, 1000), steps: ['Tronco inclinado e travado, puxa a barra até o peito', 'Desce esticando os braços sem levantar o tronco'],
    props: J => { const h = mid(J.haL, J.haR); return [{ k: 'line', a: piv, b: ext(h, piv, 0.15), w: 5, c: 'prb' }, { k: 'ball', p: ext(h, piv, 0.11), r: 0.17, cls: 'plt' }]; } }); }
{ const up = P(ST, { lean: 22, p: [-0.06, 0.86, 0], wL: [0.55, 1.55, -0.15], wR: [0.55, 1.55, 0.15], eL: [-0.3, -1, 0.2], eR: [-0.3, -1, -0.2] }), dn = P(up, { wL: [0.25, 0.86, -0.15], wR: [0.25, 0.86, 0.15] });
  def('pullover', { zoom: 0.92, frames: rep4(up, dn, 800, 1000), steps: ['Braço quase reto, empurra a barra até a coxa usando as costas', 'Volta até a altura dos olhos, devagar'],
    props: J => [{ k: 'line', a: mid(J.haL, J.haR), b: [1.0, 2.1, 0], w: 2, c: 'pr' }, { k: 'bar', a: J.haL, b: J.haR, plates: false, ext: 0.1 }] }); }
{ const dn = P(STD, { wL: [0.03, 0.8, -0.24], wR: [0.03, 0.8, 0.24], eL: [-0.3, -1, 0.2], eR: [-0.3, -1, -0.2] }), up = P(dn, { wL: [0.03, 0.88, -0.25], wR: [0.03, 0.88, 0.25] });
  def('shrug', { cam: 45, frames: rep4(dn, up, 600, 900), steps: ['Braço reto, sobe os ombros em direção às orelhas', 'Segura 1 s e desce'], props: dbs() }); }
// Ombros
{ const dn = P(STD, { hL: [0.14, 0.04, 0.12], hR: [0.14, 0.04, -0.12], eL: [0.8, -1, 0.1], eR: [0.8, -1, -0.1] }), up = P(dn, { hL: [0.04, 0.5, 0.24], hR: [0.04, 0.5, -0.24], eL: [0, -1, 1], eR: [0, -1, -1] });
  def('arnold', { cam: 40, zoom: 0.94, frames: rep4(dn, up, 900, 1000), steps: ['Halteres na frente do rosto, palmas pra você', 'Gira as mãos pra fora enquanto empurra pra cima, e faz o caminho de volta'], props: dbs() }); }
{ const anc = [1.35, 0.02, 0], s0 = P(ATH, { fL: [0.25, 0, -0.15], fR: [-0.25, 0, 0.15], lean: 15, hL: [0.18, 0.02, 0.12], eL: [0.4, -1, 0.4] }), s1 = P(s0, { hL: [0.55, 0.32, 0.04] });
  def('landpress', { frames: rep4(s0, s1, 800, 1000), steps: ['Ponta da barra na altura do ombro, um pé à frente', 'Empurra pra cima e pra frente até esticar o braço'],
    props: J => [{ k: 'line', a: anc, b: ext(J.haL, anc, 0.1), w: 5, c: 'prb' }, { k: 'ball', p: ext(J.haL, anc, -0.12), r: 0.15, cls: 'plt' }] }); }
{ const dn = P(STD, { hL: [0.06, -0.54, 0.12], eL: [-0.3, 0.2, 1] }), up = P(dn, { hL: [0.1, -0.06, 0.74] });
  def('cablelat', { cam: 72, frames: rep4(dn, up, 900, 1000), steps: ['Cabo vindo do lado oposto, cruzando na frente do corpo', 'Sobe até a linha do ombro e desce devagar'], props: J => [{ k: 'line', a: J.haL, b: [0, 0.06, 0.5], w: 2, c: 'pr' }] }); }
{ const dn = P(ST, { p: [-0.2, 0.84, 0], lean: 72, fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], kL: [1, 0, -0.15], kR: [1, 0, 0.15], wL: [0.27, 0.42, -0.14], wR: [0.27, 0.42, 0.14], eL: [-1, 0.3, 0.6], eR: [-1, 0.3, -0.6] });
  const up = P(dn, { wL: [0.27, 0.9, -0.74], wR: [0.27, 0.9, 0.74] });
  def('rdelt', { cam: 55, frames: rep4(dn, up, 900, 1000), steps: ['Tronco inclinado, abre os braços pro lado com o cotovelo levemente dobrado', 'Desce devagar, sem embalar'], props: dbs() }); }
{ const s0 = P(STD, { hL: [0.52, 0.0, 0.1], hR: [0.52, 0.0, -0.1], eL: [-0.3, -1, 0.3], eR: [-0.3, -1, -0.3] }), s1 = P(s0, { hL: [0.1, 0.0, 0.72], hR: [0.1, 0.0, -0.72] });
  def('bandpull', { cam: 60, frames: rep4(s0, s1, 700, 900), steps: ['Braços esticados na frente segurando o elástico', 'Abre até encostar no peito, aperta as escápulas e volta'], props: J => [{ k: 'band', a: J.haL, b: J.haR }] }); }
// Braços
{ const up = P(BENCH, { wL: [-0.44, 1.02, -0.12], wR: [-0.44, 1.02, 0.12], eL: [1, 0.3, 0.2], eR: [1, 0.3, -0.2] }), dn = P(up, { wL: [-0.7, 0.86, -0.12], wR: [-0.7, 0.86, 0.12] });
  def('skull', { ox: 30, frames: rep4(up, dn, 1000, 800), steps: ['Braços apontando pro teto, desce os halteres ao lado da cabeça dobrando só o cotovelo', 'Estica de volta sem mexer o braço'], props: J => [BENCHBOX, ...dbs([0, 0, 1])(J)] }); }
{ const dn = P(STD, { hL: [-0.12, 0.28, 0.05], hR: [-0.12, 0.28, -0.05], eL: [0.3, 1, 0.3], eR: [0.3, 1, -0.3] }), up = P(dn, { hL: [0.03, 0.55, 0.05], hR: [0.03, 0.55, -0.05] });
  def('ohtri', { zoom: 0.92, frames: rep4(dn, up, 800, 1000), steps: ['Halter atrás da cabeça, cotovelos apontando pra cima', 'Estica até o fim sem abrir os cotovelos'], props: J => [{ k: 'db', p: mid(J.haL, J.haR), d: [0, 1, 0] }] }); }
{ const b0 = P(ST, { p: [-0.12, 0.84, 0], lean: 62, fL: [0.15, 0, -0.15], fR: [-0.2, 0, 0.15], kL: [1, 0, -0.1], kR: [1, 0, 0.1], wR: [0.55, 0.52, 0.2], eR: [0, -1, -0.3], wL: [0.04, 0.64, -0.22], eL: [-0.4, -1, 0.1] });
  const b1 = P(b0, { wL: [-0.2, 0.8, -0.22] });
  def('kick', { frames: rep4(b0, b1, 700, 900), steps: ['Mão de apoio no banco, braço colado no corpo', 'Estica o antebraço pra trás até o fim e volta'],
    props: J => [{ k: 'box', x1: 0.4, x2: 0.92, y: 0.48, z1: 0, z2: 0.35 }, { k: 'db', p: J.haL, d: [1, 0, 0] }] }); }
def('bbcurl', { frames: PAT.curl.frames, steps: ['Pegada na largura do ombro, cotovelo parado', 'Desce devagar até esticar'], props: barP(0.13) });
{ const ex = { p: [0, 0.55, 0], py: 0, cy: 0, lean: 15, fL: [0.42, 0, -0.14], fR: [0.42, 0, 0.14], kL: [1, 0.3, 0], kR: [1, 0.3, 0], tL: [1, 0, 0], tR: [1, 0, 0], wL: [0.52, 0.6, -0.17], wR: [0.52, 0.6, 0.17], eL: [0.6, -1, 0.1], eR: [0.6, -1, -0.1] };
  const cu = P(ex, { wL: [0.36, 1.04, -0.17], wR: [0.36, 1.04, 0.17] });
  def('preacher', { frames: rep4(ex, cu, 800, 1100), steps: ['Braço todo apoiado no banco Scott, sobe a barra', 'Desce até quase esticar, devagar'],
    props: J => [{ k: 'box', x1: -0.22, x2: 0.22, y: 0.5, z1: -0.18, z2: 0.18 }, { k: 'line', a: [0.12, 1.0, 0], b: [0.45, 0.72, 0], w: 16, c: 'pr', layer: 'back' }, { k: 'bar', a: J.haL, b: J.haR, r: 0.12 }] }); }
{ const dn = { p: [0, 0.5, 0], py: 0, cy: 0, lean: 35, fL: [0.45, 0, -0.25], fR: [0.45, 0, 0.25], kL: [1, 0.3, -0.4], kR: [1, 0.3, 0.4], tL: [1, 0, -0.3], tR: [1, 0, 0.3], wL: [0.38, 0.35, -0.14], eL: [0, -1, -0.3], wR: [0.36, 0.55, 0.22], eR: [0, -1, -0.3] };
  const up = P(dn, { wL: [0.42, 0.72, -0.16] });
  def('conc', { frames: rep4(dn, up, 800, 1000), steps: ['Sentado, cotovelo apoiado na parte de dentro da coxa', 'Sobe apertando o bíceps e desce até esticar'],
    props: J => [{ k: 'box', x1: -0.25, x2: 0.25, y: 0.45 }, { k: 'db', p: J.haL, d: [0, 0, 1] }] }); }
// Core
{ const s0 = { py: 0, cy: 0, p: [-0.3, 0.5, 0], lean: 60, fL: [-0.75, 0.07, -0.12], fR: [-0.75, 0.07, 0.12], kL: [0, -1, 0], kR: [0, -1, 0], tL: [-1, 0, 0], tR: [-1, 0, 0], wL: [0.14, 0.13, -0.15], wR: [0.14, 0.13, 0.15], eL: [-1, 0, 0.3], eR: [-1, 0, -0.3] };
  const s1 = P(s0, { p: [-0.12, 0.3, 0], lean: 82, wL: [0.85, 0.13, -0.15], wR: [0.85, 0.13, 0.15] });
  def('abwheel', { ox: 25, frames: rep4(s0, s1, 1200, 1000), steps: ['De joelhos, barriga dura: rola pra frente até onde a lombar aguenta', 'Volta puxando com o abdômen'],
    props: J => [{ k: 'ball', p: [mid(J.haL, J.haR)[0], 0.1, 0], r: 0.1, cls: 'dbb' }] }); }
{ const up = P(KNEEL, { lean: 8, hL: [0.08, 0.22, 0.1], hR: [0.08, 0.22, -0.1], eL: [0.6, -0.5, 0.6], eR: [0.6, -0.5, -0.6] }), dn = P(up, { p: [0.05, 0.48, 0], lean: 68 });
  def('crunchcable', { frames: rep4(up, dn, 800, 1000), steps: ['Ajoelhado, corda ao lado da cabeça', 'Enrola a coluna levando o cotovelo à coxa; o quadril não se mexe'], props: J => [{ k: 'line', a: mid(J.haL, J.haR), b: [0.4, 2.1, 0], w: 2, c: 'pr' }] }); }
{ const dn = { ...SUP, p: [0, 0.14, 0], lean: -92, fL: [0.88, 0.1, -0.06], fR: [0.88, 0.1, 0.06], kL: [0, 1, 0], kR: [0, 1, 0], tL: [1, 0.3, 0], tR: [1, 0.3, 0], wL: [-0.15, 0.03, -0.28], wR: [-0.15, 0.03, 0.28], eL: [0, 0, 1], eR: [0, 0, -1] };
  const up = P(dn, { fL: [0.12, 0.98, -0.06], fR: [0.12, 0.98, 0.06], tL: [0, 1, 0], tR: [0, 1, 0] });
  def('legraiseb', { ox: 15, frames: rep4(dn, up, 900, 1200), steps: ['Deitado, lombar colada no chão, sobe as pernas até a vertical', 'Desce devagar sem deixar a lombar sair do chão'] }); }
{ const s0 = { p: [0.05, 0.34, 0], py: 0, cy: 0, lean: -80, tw: TW, fL: [0.92, 0.08, -0.02], fR: [0.9, 0.04, 0.04], tL: [1, 0, 0], tR: [1, 0, 0], kL: [0, 1, -1], kR: [0, 1, -1], wR: [-0.28, 0.03, -0.22], wL: [0.0, 0.5, -0.12], eR: [0, 0, -1], eL: [0, 1, 0] };
  const s1 = P(s0, { p: [0.05, 0.24, 0], lean: -84 });
  def('sideplank', { cam: 0, zoom: 0.9, ox: 20, frames: [F(s1, 500, 0), F(s0, 800, 0), F(s0, 1400, 1), F(s1, 800, 1)], steps: ['De lado, cotovelo embaixo do ombro, sobe o quadril', 'Segura com o corpo reto do pé à cabeça'] }); }
{ const e1 = P(QUAD, { wL: [1.0, 0.56, -0.15], eL: [0, 0, 1], fR: [-0.92, 0.55, 0.12], kR: [0, 1, 0], tR: [0, -1, 0] }), e2 = P(QUAD, { wR: [1.0, 0.56, 0.15], eR: [0, 0, -1], fL: [-0.92, 0.55, -0.12], kL: [0, 1, 0], tL: [0, -1, 0] });
  def('birddog', { ox: 20, frames: [F(QUAD, 400, 0), F(e1, 800, 0), F(e1, 600, 0), F(QUAD, 600, 1), F(e2, 800, 1), F(e2, 600, 1)], steps: ['De quatro, estica o braço e a perna opostos', 'Volta e troca o lado, sem o quadril girar'] }); }
{ const b = { py: 0, cy: 0, ay: 0, p: [0, 0.14, 0], lean: -40, fL: [0.55, 0.22, -0.1], fR: [0.55, 0.22, 0.1], kL: [0.4, 1, -0.2], kR: [0.4, 1, 0.2], tL: [1, 0, 0], tR: [1, 0, 0], hL: [0.32, -0.12, 0.05], hR: [0.32, -0.12, -0.05], eL: [0, -1, 0.5], eR: [0, -1, -0.5] };
  const r1 = P(b, { cy: -38, ay: -38 }), r2 = P(b, { cy: 38, ay: 38 });
  def('russian', { cam: 40, ox: 10, frames: [F(r1, 600, 0), F(r2, 700, 0), F(r1, 700, 0)], steps: ['Tronco inclinado pra trás, pés fora do chão: gira o tronco inteiro de um lado pro outro'] }); }
{ const hi = P(ATH, { p: [-0.03, 0.8, 0], fL: [0.05, 0, -0.25], fR: [0.05, 0, 0.25], cy: -30, py: -15, wL: [0.25, 1.68, -0.48], wR: [0.28, 1.64, -0.4], eL: [0, -1, 0.5], eR: [0, -1, -0.3] });
  const lo = P(hi, { cy: 35, py: 15, wL: [0.4, 0.66, 0.38], wR: [0.42, 0.62, 0.46] }), anc = [0.2, 2.05, -1.0];
  def('woodchop', { cam: 45, zoom: 0.94, frames: [F(hi, 500, 0, 'load'), F(lo, 600, 0), F(lo, 200, 1), F(hi, 900, 1)], steps: ['Elástico preso no alto, puxa cruzando o corpo até o quadril oposto', 'Pé gira, quadril leva. Volta controlando'],
    props: J => [{ k: 'band', a: mid(J.haL, J.haR), b: anc }] }); }
{ const b = { ...PRO, p: [0, 0.12, 0], fL: [-0.88, 0.05, -0.1], fR: [-0.88, 0.05, 0.1], tL: [-0.2, -1, 0], tR: [-0.2, -1, 0], kL: [0, -1, 0], kR: [0, -1, 0], wL: [0.98, 0.06, -0.2], wR: [0.98, 0.06, 0.2], eL: [0, 1, 0.4], eR: [0, 1, -0.4] };
  const up = P(b, { lean: 84, wL: [0.96, 0.3, -0.2], wR: [0.96, 0.3, 0.2], fL: [-0.86, 0.28, -0.1], fR: [-0.86, 0.28, 0.1] });
  def('superman', { ox: 15, frames: [F(b, 400, 0), F(up, 700, 0), F(up, 900, 0), F(b, 800, 0)], steps: ['De bruços, sobe braços e pernas juntos, segura 2 s e desce'] }); }
// Potência
{ const s0 = P(ST, { hL: [0.05, -0.5, 0.22], hR: [0.05, -0.5, -0.22] });
  const dip = P(s0, { p: [-0.2, 0.58, 0], lean: 34, kL: [1, 0, -0.2], kR: [1, 0, 0.2], hL: [-0.32, -0.38, 0.2], hR: [-0.32, -0.38, -0.2] });
  const air = P(s0, { p: [0.55, 1.12, 0], lean: 20, fL: [0.45, 0.42, -0.13], fR: [0.45, 0.42, 0.13], kL: [1, 0, -0.1], kR: [1, 0, 0.1], hL: [0.5, 0.1, 0.18], hR: [0.5, 0.1, -0.18] });
  const land = P(s0, { p: [0.92, 0.6, 0], lean: 30, fL: [1.12, 0, -0.15], fR: [1.12, 0, 0.15], kL: [1, 0, -0.2], kR: [1, 0, 0.2], hL: [0.45, -0.1, 0.2], hR: [0.45, -0.1, -0.2] });
  def('broad', { zoom: 0.72, ox: -25, frames: [F(s0, 500, 0), F(dip, 450, 0, 'load'), F(air, 300, 1, 'snap'), F(land, 320, 2), F(land, 600, 2)], steps: ['Desce e balança os braços pra trás', 'Explode pra frente jogando os braços', 'Aterrissa dobrando o joelho, estável'] }); }
{ const L = P(ST, { p: [0, 0.78, -0.32], lean: 28, fL: [0.03, 0, -0.38], fR: [-0.22, 0.16, -0.12], kL: [1, 0, -0.2], kR: [0.3, -1, 0], tR: [0, -1, 0], hL: [0.25, -0.35, -0.1], hR: [0.3, -0.25, 0.35] });
  const A = P(ST, { p: [0, 1.0, 0], lean: 18, fL: [0, 0.22, -0.2], fR: [0, 0.22, 0.2] });
  const R = P(ST, { p: [0, 0.78, 0.32], lean: 28, fR: [0.03, 0, 0.38], fL: [-0.22, 0.16, 0.12], kR: [1, 0, 0.2], kL: [0.3, -1, 0], tL: [0, -1, 0], hR: [0.25, -0.35, 0.1], hL: [0.3, -0.25, -0.35] });
  def('skater', { cam: 82, zoom: 0.9, frames: [F(L, 500, 0), F(A, 260, 0, 'snap'), F(R, 260, 0), F(R, 500, 1), F(A, 260, 1, 'snap'), F(L, 260, 1)], steps: ['Salta de lado de uma perna pra outra', 'Aterrissa na outra perna e segura 1 s antes de voltar'] }); }
{ const up = P(ST, { p: [0, 0.94, 0], fL: [0.03, 0.04, -0.15], fR: [0.03, 0.04, 0.15], tL: [1, -0.4, -0.1], tR: [1, -0.4, 0.1], hL: [0.06, 0.54, 0.09], hR: [0.06, 0.54, -0.09], eL: [0, -1, 1], eR: [0, -1, -1] });
  const dn = P(ST, { p: [-0.14, 0.62, 0], lean: 55, fL: [0.03, 0, -0.18], fR: [0.03, 0, 0.18], kL: [1, 0, -0.2], kR: [1, 0, 0.2], wL: [0.38, 0.22, -0.1], wR: [0.38, 0.22, 0.1] });
  def('medslam', { zoom: 0.86, frames: [F(up, 600, 0, 'load'), F(dn, 240, 1, 'snap'), F(dn, 400, 1), F(up, 700, 0)], steps: ['Bola acima da cabeça, sobe na ponta do pé', 'Joga a bola no chão com o corpo todo'],
    props: J => [{ k: 'ball', p: [mid(J.haL, J.haR)[0] + 0.04, Math.max(0.12, mid(J.haL, J.haR)[1] - 0.02), 0] }] }); }

// ==================== Adaptados (v3.22) ====================
{ const sd = P(SEAT, { p: [0, 0.52, 0], lean: 2, wL: [0.02, 0.62, -0.3], wR: [0.02, 0.62, 0.3], eL: [-1, 0, 0.4], eR: [-1, 0, -0.4] }), up = P(sd, { p: [0, 0.64, 0], fL: [0.45, 0.04, -0.14], fR: [0.45, 0.04, 0.14] });
  const chair = J => [{ k: 'box', x1: -0.22, x2: 0.3, y: 0.48, z1: -0.24, z2: 0.24 }, { k: 'line', a: [-0.2, 0.62, -0.32], b: [0.25, 0.62, -0.32], w: 6, c: 'prb', layer: 'front' }, { k: 'line', a: [-0.2, 0.62, 0.32], b: [0.25, 0.62, 0.32], w: 6, c: 'prb', layer: 'back' }, { k: 'ball', p: [-0.05, 0.3, -0.34], r: 0.3, cls: 'whl', layer: 'front' }];
  def('wcdip', { frames: rep4(sd, up, 700, 900), steps: ['Mãos nos apoios, braço quase esticado de cada lado', 'Empurra pra baixo e tira o quadril do assento; desce devagar'], props: chair }); }
{ const s0 = P(SEAT, { lean: 0, hL: [0.16, -0.1, 0.2], hR: [0.16, -0.1, -0.2], eL: [-1, -0.2, 0.6], eR: [-1, -0.2, -0.6] }), s1 = P(s0, { hL: [0.55, -0.08, 0.14], hR: [0.55, -0.08, -0.14] });
  def('sbpress', { frames: rep4(s0, s1, 700, 900), steps: ['Sentado, elástico preso atrás na altura do peito', 'Empurra pra frente até esticar e volta devagar'],
    props: J => [seatBox, backRest, { k: 'band', a: J.haL, b: [-0.32, 1.0, -0.25] }, { k: 'band', a: J.haR, b: [-0.32, 1.0, 0.25] }] }); }
{ const s0 = P(SEAT, { p: [-0.02, 0.5, 0], lean: 4, fL: [0.32, 0, -0.15], fR: [0.32, 0, 0.15], hL: [0.18, -0.05, 0.05], hR: [0.18, -0.05, -0.05], eL: [0, -1, 0.5], eR: [0, -1, -0.5] });
  const mid_ = P(s0, { p: [0.04, 0.56, 0], lean: 34 }), up = P(s0, { p: [0.12, 0.9, 0], lean: 4 });
  def('sitstand', { frames: [F(s0, 400, 0), F(mid_, 400, 0), F(up, 500, 0), F(up, 200, 1), F(mid_, 600, 1), F(s0, 500, 1)], steps: ['Peito à frente e levanta empurrando o chão com os pés', 'Senta devagar, controlando até encostar'],
    props: () => [{ k: 'box', x1: -0.32, x2: 0.12, y: 0.45 }] }); }
{ const s0 = P(ST, { p: [-0.05, 0.86, 0], lean: 18, fL: [-0.28, 0, -0.15], fR: [-0.28, 0, 0.15], wL: [0.52, 1.32, -0.25], wR: [0.52, 1.32, 0.25], eL: [-0.3, -1, 0.6], eR: [-0.3, -1, -0.6] });
  const s1 = P(s0, { p: [0.08, 0.84, 0], lean: 34 });
  def('wallpush', { frames: rep4(s0, s1, 800, 800), steps: ['Mãos na parede, corpo reto da cabeça ao calcanhar', 'Desce o peito até perto da parede e empurra de volta'],
    props: () => [{ k: 'line', a: [0.6, 0, 0], b: [0.6, 2.0, 0], w: 8, c: 'pr', layer: 'back' }] }); }
def('suitcase', { frames: PAT.farm.frames, steps: ['Peso numa mão só, tronco reto sem tombar pro lado, passos firmes'], props: J => [{ k: 'db', p: J.haL, d: [1, 0, 0] }] });


// ==================== Revisão do Rick (v3.24) ====================
{ // salto: desce da caixa a pé, sem o boneco "arrastar" de volta
  const s0 = P(ST, { hL: [0.05, -0.5, 0.22], hR: [0.05, -0.5, -0.22] });
  const dip = P(s0, { p: [-0.2, 0.58, 0], lean: 34, kL: [1, 0, -0.2], kR: [1, 0, 0.2], hL: [-0.32, -0.38, 0.2], hR: [-0.32, -0.38, -0.2] });
  const air = P(s0, { p: [0.14, 1.28, 0], lean: 0, fL: [0.18, 0.4, -0.13], fR: [0.18, 0.4, 0.13], tL: [1, -0.6, 0], tR: [1, -0.6, 0], hL: [0.3, 0.46, 0.18], hR: [0.3, 0.46, -0.18], eL: [0, -1, 0.3], eR: [0, -1, -0.3] });
  const land = P(s0, { p: [0.38, 0.98, 0], lean: 26, fL: [0.6, 0.5, -0.15], fR: [0.6, 0.5, 0.15], kL: [1, 0, -0.2], kR: [1, 0, 0.2], hL: [0.4, -0.15, 0.2], hR: [0.4, -0.15, -0.2] });
  const top = P(s0, { p: [0.58, 1.4, 0], fL: [0.6, 0.5, -0.13], fR: [0.6, 0.5, 0.13] });
  const step = P(s0, { p: [0.3, 0.86, 0], lean: 6, fL: [0.55, 0.5, -0.13], fR: [0.12, 0, 0.13], kL: [1, 0.3, -0.1], kR: [1, 0, 0.1] });
  const step2 = P(s0, { p: [0.12, 0.88, 0], fL: [0.2, 0.08, -0.13], fR: [0.08, 0, 0.13], tL: [1, -0.5, 0] });
  def('jump', { zoom: 0.82, ox: -10, frames: [F(s0, 500, 0), F(dip, 450, 0, 'load'), F(air, 260, 1, 'snap'), F(land, 300, 2), F(top, 500, 2), F(step, 550, 2), F(step2, 350, 2), F(s0, 450, 2)], steps: PAT.jump.steps, props: PAT.jump.props }); }
// rotacionais com a câmera do cruzado (de cima e de frente)
def('mbr', { ...PAT.mbr, cam: 72, tilt: 22, zoom: 1.05 });
def('lmr', { ...PAT.lmr, cam: 72, tilt: 22, zoom: 0.95 });
{ // panturrilha na máquina: plataforma, coluna e ombreira
  const dn = P(ST, { p: [0, 0.96, 0], fL: [0.03, 0.08, -0.12], fR: [0.03, 0.08, 0.12], tL: [1, 0.35, 0], tR: [1, 0.35, 0], hL: [-0.02, 0.06, 0.32], hR: [-0.02, 0.06, -0.32], eL: [0, -1, 0.6], eR: [0, -1, -0.6] });
  const up = P(dn, { p: [0, 1.07, 0], fL: [0.03, 0.2, -0.12], fR: [0.03, 0.2, 0.12], tL: [1, -0.85, 0], tR: [1, -0.85, 0] });
  def('calf', { zoom: 0.9, frames: [F(dn, 400, 0), F(up, 700, 0), F(up, 500, 1), F(dn, 900, 1)], steps: PAT.calf.steps,
    props: J => [{ k: 'box', x1: 0.12, x2: 0.45, y: 0.12, z1: -0.3, z2: 0.3 }, { k: 'line', a: [-0.32, 0, 0], b: [-0.32, 1.95, 0], w: 8, c: 'pr', layer: 'back' },
      { k: 'line', a: [-0.32, J.shL[1] + 0.08, 0], b: [J.shL[0], J.shL[1] + 0.08, 0], w: 6, c: 'pr', layer: 'back' }, { k: 'line', a: [J.shL[0] - 0.02, J.shL[1] + 0.07, -0.3], b: [J.shR[0] - 0.02, J.shR[1] + 0.07, 0.3], w: 11, c: 'prb' }, { k: 'line', a: [J.anL[0], J.anL[1] + 0.03, 0], b: [J.anL[0] + 0.01, J.anL[1] - 0.06, 0], w: 1, c: 'mus' }] }); }
// roscas vistas de 3/4 pela frente, com a pegada
{ const o = PAT.curl; def('curl', { ...o, cam: 50, tilt: 6, props: J => [...o.props(J), { k: 'badge', palm: 'in', text: 'Palma pra|cima' }] }); }
{ const o = PAT.ham; def('ham', { ...o, cam: 50, tilt: 6, props: J => [...o.props(J), { k: 'badge', palm: 'neutral', text: 'Pegada neutra|(martelo)' }] }); }
def('bbcurl', { ...PAT.bbcurl, cam: 40, tilt: 6 });
def('er', { ...PAT.er, cam: 80, tilt: 16 });
{ const o = PAT.chin; def('chin', { ...o, props: J => [...o.props(J), { k: 'badge', palm: 'in', text: 'Palmas viradas|pra você' }] }); }
{ const o = PAT.pullup; def('pullup', { ...o, props: J => [...o.props(J), { k: 'badge', palm: 'out', text: 'Palmas viradas|pra frente' }] }); }
{ // pike: desce bem a cabeça, à frente das mãos
  const pk = { ...PRO, p: [-0.2, 0.86, 0], lean: 140, fL: [-0.6, 0.05, -0.12], fR: [-0.6, 0.05, 0.12], tL: [0.4, -1, 0], tR: [0.4, -1, 0], kL: [-1, 0, 0], kR: [-1, 0, 0], wL: [0.34, 0, -0.25], wR: [0.34, 0, 0.25], eL: [-1, 0, 0.35], eR: [-1, 0, -0.35] };
  const dn = P(pk, { p: [-0.05, 0.7, 0], lean: 108 });
  def('pike', { ox: 20, cam: 12, frames: [F(pk, 400, 0), F(dn, 1000, 0), F(dn, 200, 1), F(pk, 800, 1)], steps: PAT.pike.steps }); }
def('diamond', { ...PAT.diamond, cam: 34, tilt: 14, props: () => [{ k: 'badge', text: 'Mãos juntas|embaixo do peito' }] });
def('ytw', { ...PAT.ytw, cam: 12, tilt: 62, zoom: 0.95, ox: 15 });
{ // ponte e flexora deslizando: braços ao lado do quadril, toalha no calcanhar
  const dn = { ...SUP, p: [-0.06, 0.2, 0], lean: -95, fL: [0.4, 0, -0.14], fR: [0.4, 0, 0.14], kL: [0.2, 1, -0.2], kR: [0.2, 1, 0.2], wL: [-0.02, 0.03, -0.32], wR: [-0.02, 0.03, 0.32], eL: [0, -1, 0.4], eR: [0, -1, -0.4] };
  const up = P(dn, { p: [-0.02, 0.4, 0], lean: -112 });
  def('sgb', { ox: 25, cam: 18, tilt: 10, frames: [F(dn, 400, 0), F(up, 800, 0), F(up, 900, 1), F(dn, 900, 1)], steps: PAT.sgb.steps });
  const ex = P(up, { p: [0.04, 0.3, 0], lean: -110, fL: [0.86, 0.03, -0.14], fR: [0.86, 0.03, 0.14] });
  def('slide', { ox: 15, cam: 18, tilt: 12, frames: [F(up, 500, 0), F(ex, 1300, 0), F(ex, 200, 1), F(up, 1000, 1)], steps: PAT.slide.steps,
    props: J => [{ k: 'line', a: [J.anL[0] - 0.04, 0.01, -0.22], b: [J.anL[0] + 0.14, 0.01, 0.22], w: 7, c: 'twl', layer: 'back' }] }); }
{ // hollow: braços e pernas afastados, visto um pouco de cima
  const h0 = { ...SUP, p: [0, 0.1, 0], lean: -76, wL: [-0.98, 0.42, -0.22], wR: [-0.98, 0.42, 0.22], eL: [0, 1, 0.3], eR: [0, 1, -0.3], fL: [0.86, 0.32, -0.1], fR: [0.86, 0.32, 0.1], tL: [1, 0.2, 0], tR: [1, 0.2, 0], kL: [0, 1, 0], kR: [0, 1, 0] };
  const h1 = P(h0, { lean: -84, wL: [-0.98, 0.3, -0.22], wR: [-0.98, 0.3, 0.22], fL: [0.88, 0.2, -0.1], fR: [0.88, 0.2, 0.1] });
  def('hollow', { ox: 20, zoom: 0.9, cam: 22, tilt: 26, frames: [F(h0, 900, 0), F(h1, 900, 0)], steps: PAT.hollow.steps }); }
{ // toalha: vista de frente, uma mão gira pra cada lado
  const g0 = P(ST, { fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [0.4, -0.08, 0.16], hR: [0.4, -0.08, -0.16], eL: [-0.4, -1, 0.6], eR: [-0.4, -1, -0.6] });
  const g1 = P(g0, { hL: [0.42, -0.02, 0.16], hR: [0.38, -0.16, -0.16] }), g2 = P(g0, { hL: [0.38, -0.16, 0.16], hR: [0.42, -0.02, -0.16] });
  def('towelgrip', { cam: 72, tilt: 10, frames: [F(g1, 350, 0), F(g2, 350, 0), F(g1, 350, 0)], steps: PAT.towelgrip.steps,
    props: J => [{ k: 'line', a: J.haL, b: J.haR, w: 12, c: 'twl' }, { k: 'badge', text: 'Torce a toalha|com força' }] }); }
{ // hack: trilhos, encosto, ombreiras e plataforma
  const up = P(ST, { p: [-0.05, 0.86, 0], lean: -12, fL: [0.15, 0.06, -0.17], fR: [0.15, 0.06, 0.17], tL: [1, 0.1, -0.35], tR: [1, 0.1, 0.35], hL: [-0.04, 0.08, 0.3], hR: [-0.04, 0.08, -0.3], eL: [0, -1, 0.6], eR: [0, -1, -0.6] });
  const dn = P(up, { p: [-0.2, 0.52, 0], lean: -4, kL: [1, 0.2, -0.4], kR: [1, 0.2, 0.4] });
  def('hack', { frames: rep4(up, dn, 1200, 900), steps: PAT.hack.steps,
    props: J => [{ k: 'line', a: [-0.62, 0.02, -0.3], b: [-0.08, 1.95, -0.3], w: 6, c: 'pr', layer: 'back' }, { k: 'line', a: [-0.62, 0.02, 0.3], b: [-0.08, 1.95, 0.3], w: 6, c: 'pr', layer: 'back' },
      { k: 'line', a: [J.pel[0] - 0.14, J.pel[1] - 0.06, 0], b: [J.neck[0] - 0.14, J.neck[1] + 0.02, 0], w: 14, c: 'prb', layer: 'back' },
      { k: 'line', a: [J.shL[0] - 0.04, J.shL[1] + 0.07, -0.3], b: [J.shR[0] - 0.04, J.shR[1] + 0.07, 0.3], w: 10, c: 'prb' }, { k: 'line', a: [-0.05, 0.03, 0], b: [0.42, 0.1, 0], w: 8, c: 'prb', layer: 'back' }] }); }
{ // avanço caminhando: anda pra frente alternando as pernas
  const lg = (x, lead) => { const f = x + 0.6, b = x; const o = lead === 'L' ? { fL: [f, 0, -0.12], fR: [b, 0.06, 0.12], tR: [1, -0.6, 0], kR: [0.1, -1, 0], kL: [1, 0, -0.1] } : { fR: [f, 0, 0.12], fL: [b, 0.06, -0.12], tL: [1, -0.6, 0], kL: [0.1, -1, 0], kR: [1, 0, 0.1] }; return P(ST, { p: [x + 0.28, 0.5, 0], lean: 4, ...o }); };
  const st = x => P(ST, { p: [x, 0.88, 0], fL: [x + 0.03, 0, -0.12], fR: [x + 0.03, 0, 0.12] });
  def('walklunge', { zoom: 0.8, ox: 0, frames: [F(st(-0.6), 400, 0), F(lg(-0.57, 'L'), 800, 0), F(st(0.0), 700, 1), F(lg(0.03, 'R'), 800, 0), F(st(0.6), 700, 1), F(st(0.6), 300, 1)], steps: PAT.walklunge.steps, props: dbs() }); }
{ // glúteo na polia: inclinado, perna de trás estica e sobe
  const s0 = P(ST, { lean: 32, p: [-0.05, 0.86, 0], fR: [0.05, 0, 0.13], fL: [0.02, 0.05, -0.13], kL: [1, 0, -0.1], wL: [0.48, 1.08, -0.18], wR: [0.48, 1.08, 0.18], eL: [-1, -0.3, 0.3], eR: [-1, -0.3, -0.3] });
  const s1 = P(s0, { fL: [-0.66, 0.52, -0.13], kL: [0, -1, 0], tL: [0, -1, 0] });
  def('cablekick', { cam: 10, frames: rep4(s0, s1, 800, 900), steps: PAT.cablekick.steps,
    props: J => [{ k: 'line', a: [0.58, 0, -0.3], b: [0.58, 1.9, -0.3], w: 7, c: 'pr', layer: 'back' }, { k: 'line', a: J.anL, b: [0.58, 0.1, -0.13], w: 2, c: 'pr' }, { k: 'line', a: [0.5, 1.08, -0.3], b: [0.5, 1.08, 0.3], w: 6, c: 'prb', layer: 'back' }] }); }
{ // swing: o arco do peso (entre as pernas → cintura → peito)
  const dn = P(ST, { p: [-0.2, 0.8, 0], lean: 68, fL: [0.05, 0, -0.2], fR: [0.05, 0, 0.2], kL: [1, 0, -0.25], kR: [1, 0, 0.25], wL: [-0.1, 0.52, -0.04], wR: [-0.1, 0.52, 0.04], eL: [-1, 0, 0.2], eR: [-1, 0, -0.2] });
  const mid_ = P(dn, { p: [-0.08, 0.86, 0], lean: 22, wL: [0.32, 0.78, -0.04], wR: [0.32, 0.78, 0.04] });
  const up = P(ST, { p: [0.02, 0.9, 0], lean: -4, fL: [0.05, 0, -0.2], fR: [0.05, 0, 0.2], wL: [0.52, 1.2, -0.04], wR: [0.52, 1.2, 0.04], eL: [0, -1, 0.3], eR: [0, -1, -0.3] });
  def('kbswing', { cam: 28, frames: [F(dn, 450, 0, 'load'), F(mid_, 220, 1, 'snap'), F(up, 250, 1), F(up, 120, 1), F(mid_, 300, 0), F(dn, 350, 0)], steps: PAT.kbswing.steps, props: PAT.kbswing.props }); }
def('pecdeck', { ...PAT.pecdeck, props: J => [seatBox, backRest, { k: 'line', a: [-0.3, 0, 0], b: [-0.3, 1.9, 0], w: 8, c: 'pr', layer: 'back' }, { k: 'line', a: [-0.3, 1.9, 0], b: [0.05, 1.9, 0], w: 6, c: 'pr', layer: 'back' },
  { k: 'line', a: J.elL, b: J.haL, w: 13, c: 'prb', layer: 'back' }, { k: 'line', a: J.elR, b: J.haR, w: 13, c: 'prb', layer: 'back' }, { k: 'line', a: J.haL, b: [0.05, 1.9, -0.05], w: 1.5, c: 'pr', layer: 'back' }, { k: 'line', a: J.haR, b: [0.05, 1.9, 0.05], w: 1.5, c: 'pr', layer: 'back' }] });
def('dbpullover', { ...PAT.dbpullover, cam: 34, tilt: 14 });
{ // encolhimento: o ombro sobe de verdade e o trapézio fica marcado
  const dn = P(STD, { wL: [0.03, 0.8, -0.24], wR: [0.03, 0.8, 0.24], eL: [-0.3, -1, 0.2], eR: [-0.3, -1, -0.2], shrug: 0 }), up = P(dn, { shrug: 1, wL: [0.03, 0.87, -0.24], wR: [0.03, 0.87, 0.24] });
  def('shrug', { cam: 55, frames: rep4(dn, up, 600, 900), steps: PAT.shrug.steps,
    props: J => [...dbs()(J), { k: 'line', a: J.neck, b: J.shL, w: 9, c: 'mus' }, { k: 'line', a: J.neck, b: J.shR, w: 9, c: 'mus' }] }); }
{ // tríceps testa: braço parado apontando pro teto, só o antebraço desce
  const up = P(BENCH, { wL: [-0.45, 1.02, -0.2], wR: [-0.45, 1.02, 0.2], eL: [1, -0.4, 0.05], eR: [1, -0.4, -0.05] }), dn = P(up, { wL: [-0.72, 0.84, -0.2], wR: [-0.72, 0.84, 0.2] });
  def('skull', { ox: 30, cam: 26, frames: rep4(up, dn, 1000, 800), steps: PAT.skull.steps, props: J => [BENCHBOX, ...dbs([0, 0, 1])(J)] }); }
{ const dn = P(STD, { hL: [-0.16, 0.2, 0.06], hR: [-0.16, 0.2, -0.06], eL: [0.1, 1, 0.25], eR: [0.1, 1, -0.25] }), up = P(dn, { hL: [0.03, 0.56, 0.06], hR: [0.03, 0.56, -0.06] });
  def('ohtri', { zoom: 0.92, cam: 32, frames: rep4(dn, up, 800, 1000), steps: PAT.ohtri.steps, props: PAT.ohtri.props }); }
def('kick', { ...PAT.kick, cam: 6 });
def('preacher', { ...PAT.preacher, props: J => [{ k: 'box', x1: -0.22, x2: 0.22, y: 0.5, z1: -0.18, z2: 0.18 }, { k: 'line', a: [0.3, 0.72, 0], b: [0.3, 0, 0], w: 6, c: 'pr', layer: 'back' }, { k: 'line', a: [0.12, 0.8, 0.18], b: [0.5, 0.52, 0.18], w: 14, c: 'pr', layer: 'front' }, { k: 'line', a: [0.12, 0.8, -0.18], b: [0.5, 0.52, -0.18], w: 14, c: 'pr', layer: 'back' }, { k: 'bar', a: J.haL, b: J.haR, r: 0.12 }] });
def('birddog', { ...PAT.birddog, cam: 32, tilt: 30 });
def('superman', { ...PAT.superman, cam: 22, tilt: 22 });
{ // prancha lateral / Copenhague: vista de frente, braço de cima na cintura
  const base = { p: [0.05, 0.36, 0], py: 0, cy: 0, lean: -80, tw: TW, tL: [1, 0, 0], tR: [1, 0, 0], kL: [0, 1, -1], kR: [0, 1, -1], wR: [-0.4, 0.03, -0.24], eR: [0, 0, -1], eL: [-1, 0, 0.6] };
  const sp0 = { ...base, fL: [0.92, 0.1, -0.03], fR: [0.9, 0.04, 0.04] };
  const sp = J => [{ k: 'line', a: J.pel, b: J.haL, w: 0.1, c: 'pr' }];
  const s1 = P(sp0, { p: [0.05, 0.22, 0], lean: -84, wL: [0.0, 0.36, -0.12] }), s0 = P(sp0, { wL: [0.03, 0.5, -0.12] });
  def('sideplank', { cam: 6, tilt: 12, zoom: 0.92, ox: 20, frames: [F(s1, 500, 0), F(s0, 800, 0), F(s0, 1400, 1), F(s1, 800, 1)], steps: PAT.sideplank.steps });
  const c0 = { ...base, fL: [0.98, 0.47, 0], fR: [0.86, 0.1, 0.05], wL: [0.03, 0.5, -0.12] }, c1 = P(c0, { p: [0.05, 0.22, 0], lean: -84, wL: [0.0, 0.36, -0.12] });
  def('copen', { cam: 6, tilt: 12, zoom: 0.9, ox: 20, frames: [F(c1, 500, 0), F(c0, 800, 0), F(c0, 1200, 1), F(c1, 800, 1)], steps: PAT.copen.steps, props: () => [{ k: 'box', x1: 0.8, x2: 1.22, y: 0.42 }] }); }

// ==================== v3.25 ====================
{ const up = P(ST, { p: [-0.02, 0.89, 0], fL: [0.03, 0, -0.17], fR: [0.03, 0, 0.17], tL: [1, 0, -0.35], tR: [1, 0, 0.35], hL: [0.2, 0.1, 0.22], hR: [0.2, 0.1, -0.22], eL: [1, 0.2, 0.3], eR: [1, 0.2, -0.3] });
  const dn = P(up, { p: [-0.18, 0.47, 0], lean: 18, kL: [1, 0.1, -0.45], kR: [1, 0.1, 0.45] });
  def('fsq', { cam: 40, frames: [F(up, 500, 0), F(dn, 1300, 0), F(dn, 250, 1), F(up, 900, 1)], steps: ['Barra na frente dos ombros, cotovelos altos: desce reto', 'Sobe sem deixar o tronco cair pra frente'], props: J => [{ k: 'bar', a: J.haL, b: J.haR }] }); }
{ const up = P(ST, { p: [-0.02, 0.88, 0], fL: [0.03, 0, -0.15], fR: [0.03, 0, 0.15], hL: [-0.07, 0.05, 0.42], hR: [-0.07, 0.05, -0.42], eL: [-0.5, -1, 0.3], eR: [-0.5, -1, -0.3] });
  const dn = P(up, { p: [-0.2, 0.85, 0], lean: 72, kL: [1, 0, -0.1], kR: [1, 0, 0.1] });
  def('gm', { cam: 34, frames: rep4(up, dn, 1300, 900), steps: ['Barra nas costas, joelho levemente dobrado: quadril vai pra trás', 'Volta empurrando o quadril pra frente, coluna sempre neutra'], props: J => [{ k: 'bar', a: J.haL, b: J.haR }] }); }
{ const b = { py: 0, cy: 0, p: [-0.05, 0.8, 0], lean: 50, hL: [0, 0, 0], wL: [0.6, 1.0, -0.2], wR: [0.6, 1.0, 0.2], eL: [-1, -0.3, 0.3], eR: [-1, -0.3, -0.3], tL: [1, -0.3, 0], tR: [1, -0.3, 0], kL: [1, 0, 0], kR: [1, 0, 0] };
  const a1 = P(b, { fL: [0.25, 0.02, -0.12], fR: [-0.55, 0.06, 0.12], tR: [1, -0.8, 0] }), a2 = P(b, { fR: [0.25, 0.02, 0.12], fL: [-0.55, 0.06, -0.12], tL: [1, -0.8, 0], tR: [1, -0.3, 0] });
  def('sled', { frames: [F(a1, 300, 0), F(a2, 300, 0), F(a1, 300, 0)], steps: ['Inclinado, braços firmes no trenó, empurra com passos curtos e fortes'],
    props: () => [{ k: 'box', x1: 0.62, x2: 1.02, y: 0.28, z1: -0.3, z2: 0.3, layer: 'front' }, { k: 'line', a: [0.66, 0.28, -0.2], b: [0.62, 1.02, -0.2], w: 6, c: 'prb', layer: 'front' }, { k: 'line', a: [0.66, 0.28, 0.2], b: [0.62, 1.02, 0.2], w: 6, c: 'prb', layer: 'back' }, { k: 'ball', p: [0.84, 0.42, 0], r: 0.16, cls: 'plt', layer: 'front' }] }); }
{ const b = P(ATH, { p: [-0.05, 0.72, 0], lean: 18, fL: [0.05, 0, -0.24], fR: [0.05, 0, 0.24], kL: [1, 0, -0.4], kR: [1, 0, 0.4], eL: [-0.5, -1, 0.4], eR: [-0.5, -1, -0.4] });
  const w1 = P(b, { hL: [0.45, 0.08, 0.16], hR: [0.45, -0.22, -0.16] }), w2 = P(b, { hL: [0.45, -0.22, 0.16], hR: [0.45, 0.08, -0.16] }), anc = [1.6, 0.15, 0];
  def('rope', { cam: 30, frames: [F(w1, 220, 0, 'snap'), F(w2, 220, 0, 'snap'), F(w1, 220, 0, 'snap')], steps: ['Meio agachado, ondas rápidas alternando os braços'],
    props: J => [{ k: 'line', a: J.haL, b: [1.0, J.haL[1] * 0.6 + 0.1, -0.1], w: 5, c: 'prb' }, { k: 'line', a: [1.0, J.haL[1] * 0.6 + 0.1, -0.1], b: anc, w: 5, c: 'prb' }, { k: 'line', a: J.haR, b: [1.0, J.haR[1] * 0.6 + 0.1, 0.1], w: 5, c: 'prb', layer: 'back' }, { k: 'line', a: [1.0, J.haR[1] * 0.6 + 0.1, 0.1], b: anc, w: 5, c: 'prb', layer: 'back' }] }); }
{ const ld = P(ST, { p: [-0.05, 0.88, 0], lean: -10, fL: [0.25, 0, -0.15], fR: [-0.25, 0.03, 0.15], tR: [1, -0.4, 0], hL: [-0.12, 0.5, 0.08], hR: [-0.12, 0.5, -0.08], eL: [0, 1, 0.5], eR: [0, 1, -0.5] });
  const th = P(ld, { p: [0.08, 0.86, 0], lean: 22, hL: [0.5, 0.25, 0.08], hR: [0.5, 0.25, -0.08] });
  def('mbo', { frames: [F(ld, 600, 0, 'load'), F(th, 240, 1, 'snap'), F(th, 400, 1), F(ld, 700, 0)], steps: ['Bola atrás da cabeça, peso no pé de trás', 'Arremessa pra frente com o corpo todo e solta a bola'],
    props: J => [{ k: 'ball', p: mid(J.haL, J.haR) }] }); }
{ const dn = P(SEAT, { lean: 0, hL: [0.12, 0.06, 0.25], hR: [0.12, 0.06, -0.25], eL: [0.5, -1, 0.4], eR: [0.5, -1, -0.4] }), up = P(dn, { hL: [0.04, 0.52, 0.22], hR: [0.04, 0.52, -0.22] });
  def('bandohp', { frames: rep4(dn, up, 800, 1000), steps: ['Sentado, elástico preso embaixo do assento, mãos na altura do ombro', 'Empurra acima da cabeça até esticar e volta devagar'],
    props: J => [seatBox, backRest, { k: 'band', a: J.haL, b: [0.0, 0.44, -0.2] }, { k: 'band', a: J.haR, b: [0.0, 0.44, 0.2] }] }); }
{ const up = P(SEAT, { lean: -4, hL: [0.14, -0.04, 0.06], hR: [0.14, -0.04, -0.06], eL: [0.2, -1, 0.6], eR: [0.2, -1, -0.6] }), dn = P(up, { lean: 38 });
  def('seatcrunch', { frames: rep4(up, dn, 800, 1000), steps: ['Sentado, elástico preso atrás no alto, segurando no peito', 'Enrola o tronco pra frente contraindo o abdômen e volta devagar'],
    props: J => [seatBox, { k: 'band', a: mid(J.haL, J.haR), b: [-0.6, 1.7, 0] }] }); }

// ==================== Pranchas laterais vistas de frente (v3.25.1) ====================
// O esqueleto 3D é de perfil; a prancha lateral acontece no plano da frente. Aqui o boneco é 2D, visto de frente
// (ombros empilhados, peito virado pra câmera), no mesmo estilo dos outros. Medidas em metros, y pra cima.
function flatSVG(p, d) {
  const S = 100, X = v => (8 + (v[0] + 0.75) * S).toFixed(1), Y = v => (178 - v[1] * S).toFixed(1);
  const seg = (a, b, w, c) => `<line x1="${X(a)}" y1="${Y(a)}" x2="${X(b)}" y2="${Y(b)}" stroke-width="${w}" class="${c}" stroke-linecap="round"/>`;
  const limb = (pts, w, far) => { let o = '', f = ''; for (let i = 1; i < pts.length; i++) { o += seg(pts[i - 1], pts[i], w + 5, 'fo'); f += seg(pts[i - 1], pts[i], w - 2 * (i - 1), far ? 'fb' : 'fn'); } return o + f; };
  const poly = (ps, c) => `<polygon points="${ps.map(v => X(v) + ',' + Y(v)).join(' ')}" class="${c}"/>`;
  const bench = d.bench ? (() => { const [x1, x2, h] = d.bench; return seg([x1 + 0.06, 0], [x1 + 0.06, h], 5, 'prb') + seg([x2 - 0.06, 0], [x2 - 0.06, h], 5, 'prb') + `<rect x="${X([x1, 0])}" y="${Y([0, h + 0.05])}" width="${((x2 - x1) * S).toFixed(1)}" height="${(0.07 * S).toFixed(1)}" rx="2" class="bxt"/>`; })() : '';
  return `<svg viewBox="0 0 230 200" class="fig" role="img" aria-hidden="true">
    <line x1="0" y1="178" x2="230" y2="178" class="gr"/>${bench}
    ${limb([p.Hb, p.Kb, p.Ab], 15, true)}${limb([p.Sb, p.Eb, p.Wb], 12, true)}
    ${seg(p.N, p.Hd, 9, 'fn')}${poly([p.Sb, p.St, p.Ht, p.Hb], 'tor')}
    <circle cx="${X(p.Hd)}" cy="${Y(p.Hd)}" r="13" class="hd"/>
    ${limb([p.Ht, p.Kt, p.At], 16, false)}${poly([p.Hb, p.Ht, p.Pt, p.Pb], 'gf')}${limb([p.St, p.Et, p.Wt], 12, false)}</svg>`;
}
// monta a pose de frente a partir de: ombro de baixo (sobre o cotovelo), quadril de baixo e tornozelos
function flatPose(Sb, Hb, Ab, At, kneeB) {
  const ax = [Sb[0] - Hb[0], Sb[1] - Hb[1]], L = Math.hypot(...ax), u = [ax[0] / L, ax[1] / L], n = [-u[1], u[0]];
  const add = (a, v, k) => [a[0] + v[0] * k, a[1] + v[1] * k], mid = (a, b, o) => [(a[0] + b[0]) / 2 + (o?.[0] || 0), (a[1] + b[1]) / 2 + (o?.[1] || 0)];
  const nn = n[1] < 0 ? [-n[0], -n[1]] : n; // normal sempre pra cima
  const St = add(Sb, nn, 0.34), Ht = add(Hb, nn, 0.24), Sc = mid(Sb, St), N = add(Sc, u, 0.08);
  const Pb = add(Hb, u, -0.17), Pt = add(Ht, u, -0.17);
  return { Sb, St, Hb, Ht, Pb, Pt, N, Hd: add(N, u, 0.14), Eb: [Sb[0] - 0.02, 0.06], Wb: [Sb[0] + 0.1, 0.04],
    Et: add(add(St, nn, 0.12), u, -0.16), Wt: add(Ht, u, 0.02), Ab, At,
    Kb: mid(Pb, Ab, kneeB || [0, 0]), Kt: mid(Pt, At, [0, 0.01]) };
}
function flatAnimate(el, d, onStep) {
  const fr = d.flat; let i = 0, t0 = performance.now(), raf = 0, speed = 1, paused = false, pausedAt = 0, last = -1;
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const frame = now => {
    let t = (now - t0) / (fr[i].d * speed);
    while (t >= 1) { t0 += fr[i].d * speed; i = (i + 1) % fr.length; t = (now - t0) / (fr[i].d * speed); }
    const a = fr[i].p, b = fr[(i + 1) % fr.length].p, k = ease(Math.max(0, t)), pt = {};
    for (const key in a) pt[key] = [a[key][0] + (b[key][0] - a[key][0]) * k, a[key][1] + (b[key][1] - a[key][1]) * k];
    el.innerHTML = flatSVG(pt, d);
    if (onStep && fr[i].step !== last) { last = fr[i].step; onStep(last); }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { stop() { cancelAnimationFrame(raf); paused = true; }, setSpeed(s) { speed = s; }, toggle() { if (paused) { paused = false; t0 += performance.now() - pausedAt; raf = requestAnimationFrame(frame); } else { paused = true; pausedAt = performance.now(); cancelAnimationFrame(raf); } return paused; } };
}
{ const Sb = [-0.42, 0.36];
  // prancha lateral: quadril no chão → corpo em linha reta do pé ao ombro
  const spDn = flatPose(Sb, [0.12, 0.09], [1.05, 0.05], [1.05, 0.15]), spUp = flatPose(Sb, [0.12, 0.25], [1.05, 0.05], [1.05, 0.15]);
  PAT.sideplank = { flat: [{ p: spDn, d: 600, step: 0 }, { p: spUp, d: 800, step: 0 }, { p: spUp, d: 1400, step: 1 }, { p: spDn, d: 800, step: 1 }], steps: PAT.sideplank.steps, frames: [] };
  // Copenhague: tornozelo de cima no banco; a perna de baixo sobe e encosta por baixo do banco
  const cDn = flatPose(Sb, [0.1, 0.09], [0.82, 0.05], [1.12, 0.47], [0, 0.03]), cUp = flatPose(Sb, [0.1, 0.33], [1.02, 0.3], [1.12, 0.47], [0, -0.02]);
  PAT.copen = { flat: [{ p: cDn, d: 600, step: 0 }, { p: cUp, d: 800, step: 0 }, { p: cUp, d: 1200, step: 1 }, { p: cDn, d: 800, step: 1 }], bench: [0.92, 1.45, 0.4], steps: PAT.copen.steps, frames: [] };
}

// exercício → demonstração (sombra explosiva usa o cruzado da aba de luta)
const ALIAS = { plyopush: 'plyopush' };
export function hasDemo(ex) { return ex === 'shadowx' || !!PAT[ALIAS[ex] || ex]; }
function demoOf(ex) {
  if (ex === 'shadowx') { const t = TECHNIQUES.find(x => x.id === 'gancho'); return t ? { ...t, steps: t.steps || null } : null; }
  return PAT[ALIAS[ex] || ex] || null;
}
export function demoSteps(ex) { const d = demoOf(ex); return d?.steps || null; }
// corpo da pessoa (membro ausente/prótese): nas demonstrações o lado de perto é quem trabalha,
// então o membro que falta some do lado de trás (visto de lado, tanto faz se é o esquerdo ou o direito)
function bodyOpt(body) { const m = body?.missing || []; return m.length ? { missing: m, prosthesis: !!body.prosthesis } : null; }
function propsFor(d, J, body) {
  const list = d.props ? d.props(J) : null, bo = bodyOpt(body); if (!list || !bo) return list;
  const gone = bo.missing.some(x => x === 'armR' || x === 'handR') ? [J.haR] : [];
  return list.filter(it => !(it.k === 'db' && gone.includes(it.p)) && !(it.k === 'band' && gone.includes(it.a)));
}
export function exThumb(ex, body) {
  const d = demoOf(ex); if (!d) return '';
  if (d.flat) return flatSVG(d.flat[1].p, d);
  const f = d.frames[Math.min(1, d.frames.length - 1)].p, J = solve(f);
  return draw(J, { gloves: d.gloves, cam: d.cam, ox: d.ox, act: d.act, tilt: d.tilt, zoom: d.zoom, props: propsFor(d, J, body), ...(bodyOpt(body) || {}) });
}
export function exFrameSVG(ex, i, body) { const d0 = demoOf(ex); if (d0?.flat) return flatSVG(d0.flat[Math.min(i, d0.flat.length - 1)].p, d0); const d = d0, J = solve(d.frames[i].p); return draw(J, { gloves: d.gloves, cam: d.cam, ox: d.ox, act: d.act, tilt: d.tilt, zoom: d.zoom, props: propsFor(d, J, body), ...(bodyOpt(body) || {}) }); }
export function exAnimate(el, ex, onStep, body) { const d = demoOf(ex); if (!d) return null; if (d.flat) return flatAnimate(el, d, onStep); const bo = bodyOpt(body); return animTech(el, bo ? { ...d, props: J => propsFor(d, J, body), body: bo } : d, onStep); }
export const DEMO_IDS = Object.keys(PAT);
