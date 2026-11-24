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
  const c1 = P(c0, { p: [0.05, 0.16, 0], lean: -86 });
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

// exercício → demonstração (sombra explosiva usa o cruzado da aba de luta)
const ALIAS = { plyopush: 'plyopush' };
export function hasDemo(ex) { return ex === 'shadowx' || !!PAT[ALIAS[ex] || ex]; }
function demoOf(ex) {
  if (ex === 'shadowx') { const t = TECHNIQUES.find(x => x.id === 'gancho'); return t ? { ...t, steps: t.steps || null } : null; }
  return PAT[ALIAS[ex] || ex] || null;
}
export function demoSteps(ex) { const d = demoOf(ex); return d?.steps || null; }
// miniatura: pose do meio do movimento
export function exThumb(ex) {
  const d = demoOf(ex); if (!d) return '';
  const f = d.frames[Math.min(1, d.frames.length - 1)].p, J = solve(f);
  return draw(J, { gloves: d.gloves, cam: d.cam, ox: d.ox, act: d.act, tilt: d.tilt, zoom: d.zoom, props: d.props ? d.props(J) : null });
}
export function exFrameSVG(ex, i) { const d = demoOf(ex), J = solve(d.frames[i].p); return draw(J, { gloves: d.gloves, cam: d.cam, ox: d.ox, act: d.act, tilt: d.tilt, zoom: d.zoom, props: d.props ? d.props(J) : null }); }
export function exAnimate(el, ex, onStep) { const d = demoOf(ex); return d ? animTech(el, d, onStep) : null; }
export const DEMO_IDS = Object.keys(PAT);
