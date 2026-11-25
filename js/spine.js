// ============================================================
// RONIN — coluna: desenho editável (de costas e de lado), leitura da curva e exercícios complementares.
// Funções puras (sem DOM). A leitura é uma ESTIMATIVA visual: não substitui raio-X nem avaliação.
// Base: SRS (escoliose = curva lateral >= 10° de Cobb); SOSORT 2016 (exercício específico, Schroth/SEAS);
// Fishman 2014 (prancha lateral com o lado convexo da curva principal pra baixo); McGill (big 3);
// Kendall (cifose/lordose posturais); Lynch 2010 e Kamali 2016 (fortalecer e alongar na hipercifose).
// ============================================================
export const VERT = [...Array.from({ length: 7 }, (_, i) => 'C' + (i + 1)), ...Array.from({ length: 12 }, (_, i) => 'T' + (i + 1)), ...Array.from({ length: 5 }, (_, i) => 'L' + (i + 1))];
export const REGION = i => i < 7 ? 'cervical' : i < 19 ? 'torácica' : 'lombar';
const N = VERT.length, LIM = 45;
// altura (y) de cada vértebra no desenho: cervicais menores, lombares maiores
const GAP = i => i < 7 ? 11 : i < 19 ? 14 : 17;
export const VY = (() => { const y = [58]; for (let i = 1; i < N; i++) y.push(y[i - 1] + (GAP(i - 1) + GAP(i)) / 2); return y; })();
export const VR = i => i < 7 ? 5 : i < 19 ? 6.5 : 8;
// curvas normais vistas de lado (+ = pra frente): lordose cervical, cifose torácica, lordose lombar
export const SAG0 = Array.from({ length: N }, (_, i) => i < 7 ? 10 * Math.sin(Math.PI * (i + 0.5) / 7) : i < 19 ? -16 * Math.sin(Math.PI * (i - 6.5) / 12) : 12 * Math.sin(Math.PI * (i - 18.5) / 5));

const arr = a => Array.from({ length: N }, (_, i) => { const v = Math.round(+(Array.isArray(a) ? a[i] : 0)); return Number.isFinite(v) ? Math.max(-LIM, Math.min(LIM, v)) : 0; });
// valida o que vem do perfil (pode ter vindo da nuvem)
export function spineOf(p) {
  const s = p?.spine && typeof p.spine === 'object' ? p.spine : {};
  const cobb = Math.round(+s.cobb);
  return { x: arr(s.x), z: arr(s.z), sh: ['E', 'D'].includes(s.sh) ? s.sh : '', hip: ['E', 'D'].includes(s.hip) ? s.hip : '', cobb: cobb >= 1 && cobb <= 120 ? cobb : 0 };
}
export const spineEmpty = s => !s.x.some(Boolean) && !s.z.some(Boolean) && !s.sh && !s.hip && !s.cobb;
// arrastar uma vértebra puxa as vizinhas numa curva suave (sino com sigma ~2,6 vértebras)
export function dragSpine(a, i, d, sigma = 2.6) {
  return a.map((v, j) => Math.max(-LIM, Math.min(LIM, v + d * Math.exp(-((j - i) ** 2) / (2 * sigma * sigma)))));
}
const deg = r => r * 180 / Math.PI;
// o desenho exagera o desvio 2× pra ficar visível no celular; o ângulo usa o tamanho real
const EXAG = 2;
function tilt(x, i) { const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1); return deg(Math.atan2((x[b] - x[a]) / EXAG, VY[b] - VY[a])); }
const RNAME = { cervical: 'cervical', 'torácica': 'torácica', lombar: 'lombar' };
function regionOfApex(i) { return i === 18 || i === 19 ? 'toracolombar' : RNAME[REGION(i)]; }

// leitura de costas: curvas laterais pelo método de Cobb (inclinação máxima das vértebras das pontas)
export function lateral(s) {
  const x = s.x, th = x.map((_, i) => tilt(x, i)), ext = [0];
  // picos e vales da inclinação, ignorando oscilação menor que 2° (ruído do desenho)
  let dir = 0, cand = 0;
  for (let i = 1; i < N; i++) {
    if (dir >= 0 && th[i] >= th[cand]) { cand = i; if (!dir && th[i] - th[0] > 2) dir = 1; continue; }
    if (dir <= 0 && th[i] <= th[cand]) { cand = i; if (!dir && th[0] - th[i] > 2) dir = -1; continue; }
    if (Math.abs(th[i] - th[cand]) > 2) { if (dir) ext.push(cand); dir = th[i] > th[cand] ? 1 : -1; cand = i; }
  }
  if (cand !== N - 1 && cand !== ext[ext.length - 1]) ext.push(cand);
  if (ext[ext.length - 1] !== N - 1) ext.push(N - 1);
  const curves = [];
  for (let k = 0; k < ext.length - 1; k++) {
    const a = ext[k], b = ext[k + 1], ang = Math.abs(th[a] - th[b]);
    let apex = a, sag = 0;
    for (let i = a; i <= b; i++) { const line = x[a] + (x[b] - x[a]) * (VY[i] - VY[a]) / (VY[b] - VY[a]), dv = x[i] - line; if (Math.abs(dv) > Math.abs(sag)) { sag = dv; apex = i; } }
    if (ang >= 5 && Math.abs(sag) >= 3) curves.push({ from: a, to: b, apex, angle: Math.round(ang), sag: Math.abs(sag), side: sag > 0 ? 'direita' : 'esquerda', region: regionOfApex(apex) });
  }
  curves.sort((p, q) => q.angle - p.angle);
  // a coluna voltando pro centro nas pontas (pescoço/lombar baixa) não é curva própria se for bem menor que a principal
  if (curves.length > 1) { const top = curves[0].angle; for (let k = curves.length - 1; k > 0; k--) { const c = curves[k]; if ((c.from === 0 || c.to === N - 1) && c.angle < top * 0.6) curves.splice(k, 1); } }
  if (curves[0] && s.cobb) curves[0] = { ...curves[0], angle: s.cobb, exam: true };
  const main = curves[0] || null, big = curves.filter(c => c.angle >= 10);
  return { curves, main, type: big.length >= 2 ? 'S' : big.length === 1 ? 'C' : '', level: !main ? '' : main.angle < 10 ? 'assimetria' : main.angle < 25 ? 'leve' : main.angle < 40 ? 'moderada' : 'acentuada' };
}
// leitura de lado: desvio de cada região em relação à curva normal (z + = mais pra trás)
export function sagittal(s) {
  const z = s.z, avg = (a, b) => z.slice(a, b + 1).reduce((t, v) => t + v, 0) / (b - a + 1), out = [];
  const c = avg(2, 5), t = Math.max(...z.slice(10, 15)), t2 = Math.min(...z.slice(10, 15)), l = Math.min(...z.slice(20, 23)), l2 = Math.max(...z.slice(20, 23));
  if (c >= 5) out.push({ k: 'retCerv', n: 'Pescoço mais reto que o normal (retificação cervical)' });
  else if (c <= -5) out.push({ k: 'hiperCerv', n: 'Pescoço mais curvado pra frente que o normal' });
  if (t >= 6) out.push({ k: 'cifose', n: 'Costas mais arredondadas que o normal (hipercifose torácica)' });
  else if (t2 <= -6) out.push({ k: 'dorsoPlano', n: 'Costas mais retas que o normal (dorso plano)' });
  if (l <= -6) out.push({ k: 'lordose', n: 'Lombar mais curvada que o normal (hiperlordose)' });
  else if (l2 >= 6) out.push({ k: 'retLomb', n: 'Lombar mais reta que o normal (retificação lombar)' });
  return out;
}
const SIDE = { E: 'esquerdo', D: 'direito' };
// frases curtas pra tela e pro coach
export function spineSummary(s) {
  const L = lateral(s), S = sagittal(s), out = [];
  if (L.main) {
    const m = L.main, n = L.curves.filter(c => c.angle >= 10).length;
    out.push(m.angle < 10 ? `Pequena assimetria ${m.region} (~${m.angle}°): abaixo de 10° não é considerada escoliose.`
      : `Curva ${n >= 2 ? 'em S' : 'em C'}: principal ${m.region}, convexa pra ${m.side}, ápice em ${VERT[m.apex]}, ${m.exam ? `${m.angle}° (do seu exame)` : `~${m.angle}° (estimativa do desenho)`} · ${L.level}.`);
    for (const c of L.curves.slice(1).filter(c => c.angle >= 10)) out.push(`Curva secundária ${c.region}, convexa pra ${c.side}, ~${c.angle}°.`);
  }
  for (const x of S) out.push(x.n + '.');
  if (s.sh) out.push(`Ombro ${SIDE[s.sh]} mais baixo.`);
  if (s.hip) out.push(`Quadril ${SIDE[s.hip]} mais alto.`);
  return out;
}

// ---------- exercícios complementares ----------
// dose padrão; "why" explica o porquê pra cada pessoa
const D = { iso: '3 × 20–30 s', iso2: '2 × 30–45 s', rep: '2 × 8–12', rep15: '2 × 12–15', side: '2 × 8–10 cada lado', stretch: '2 × 30–45 s cada lado', max: '1 × o máximo que aguentar (com boa forma), todo dia' };
const REHAB = {
  ombro: [['er', D.rep15, 'Manguito rotador: estabiliza o ombro'], ['ytw', D.rep, 'Escápula forte segura o ombro'], ['wallangel', D.rep, 'Mobilidade do ombro sem carga']],
  cotovelo: [['wristfe', D.rep15, 'Fortalece os tendões do antebraço (lento na descida)'], ['towelgrip', D.iso, 'Isometria alivia a dor do tendão']],
  punho: [['wristfe', D.rep15, 'Fortalece o punho com carga leve'], ['towelgrip', D.iso, 'Pegada sem dobrar o punho']],
  lombar: [['curlup', '3 × 6 (segura 8–10 s)', 'Big 3 de McGill: abdômen sem dobrar a lombar'], ['sideplank', D.iso, 'Big 3 de McGill: lateral do tronco'], ['birddog', D.side, 'Big 3 de McGill: coluna estável com braço e perna mexendo'], ['deadbug', D.side, 'Controle do core com a lombar protegida']],
  joelho: [['wallsit', '4 × 30–45 s', 'Isometria reduz a dor do tendão patelar'], ['tke', D.rep15, 'Ativa o quadríceps sem forçar o joelho'], ['sgb', D.rep15, 'Glúteo forte alinha o joelho']],
  quadril: [['latwalk', D.side, 'Glúteo médio: estabiliza quadril e joelho'], ['sgb', D.rep15, 'Glúteo sem carga na virilha'], ['hipflex', D.stretch, 'Alivia o flexor do quadril']],
  tornozelo: [['balance', '3 × 30 s cada perna', 'Equilíbrio reduz nova torção'], ['calfbw', '3 × 15 (desce em 3 s)', 'Panturrilha e tendão de Aquiles']],
  pescoco: [['chintuck', '2 × 10 (segura 3–5 s)', 'Fortalece os flexores profundos do pescoço'], ['neck', D.iso, 'Isometria fortalece sem mexer o pescoço'], ['wallangel', D.rep, 'Postura do ombro e da parte alta das costas']]
};
// p: perfil; conds: condições marcadas; inj: lesões marcadas
export function complements(p, conds = [], inj = []) {
  const s = spineOf(p), L = lateral(s), S = new Set(sagittal(s).map(x => x.k)), out = [], add = (ex, dose, why, tag) => { if (!out.some(o => o.ex === ex)) out.push({ ex, dose, why, tag }); };
  const has = k => conds.includes(k);
  const scol = has('escoliose') || (L.main && L.main.angle >= 10);
  if (scol) {
    const m = L.main && L.main.angle >= 10 ? L.main : null;
    add('sideplank', D.max, m ? `Deitado sobre o lado ${m.side.replace('direita', 'direito').replace('esquerda', 'esquerdo')} (lado convexo da curva ${m.region} pra baixo). Só esse lado.` : 'Faça dos dois lados. Desenhando a coluna, o Tairen diz qual lado priorizar.', 'Escoliose');
    if (!m || m.region !== 'lombar') add('thrrot', D.side, 'Mobilidade da coluna torácica, controlando a rotação', 'Escoliose');
    add('birddog', D.side, 'Estabilidade da coluna sem carga', 'Escoliose');
    add('pal', D.side, 'Anti-rotação: o tronco aprende a não ceder pro lado da curva', 'Escoliose');
    add('suitcase', '3 × 20–30 m cada lado', 'Peso de um lado só: o tronco trabalha pra ficar reto', 'Escoliose');
  }
  if (has('cifose') || S.has('cifose')) {
    add('thext', D.rep, 'Estende a parte alta das costas, que fica travada na cifose', 'Cifose');
    add('doorpec', D.stretch, 'Peitoral encurtado puxa os ombros pra frente', 'Cifose');
    add('ytw', D.rep, 'Fortalece quem segura a escápula pra trás', 'Cifose');
    add('wallangel', D.rep, 'Postura e mobilidade do ombro', 'Cifose');
    add('chintuck', '2 × 10 (segura 3–5 s)', 'Na cifose a cabeça costuma ir pra frente', 'Cifose');
  }
  if (has('lordose') || S.has('lordose')) {
    add('hipflex', D.stretch, 'Flexor do quadril encurtado aumenta a curva da lombar', 'Lordose');
    add('deadbug', D.side, 'Abdômen controla a pelve sem arquear', 'Lordose');
    add('sgb', D.rep15, 'Glúteo forte ajuda a posicionar a pelve', 'Lordose');
    add('curlup', '3 × 6 (segura 8–10 s)', 'Abdômen sem dobrar a lombar', 'Lordose');
  }
  if (S.has('retLomb') || S.has('dorsoPlano')) { add('catcamel', D.rep, 'Devolve o movimento da coluna, segmento por segmento', 'Coluna reta'); add('birddog', D.side, 'Estabilidade da coluna', 'Coluna reta'); }
  if (S.has('retCerv') || S.has('hiperCerv')) { add('chintuck', '2 × 10 (segura 3–5 s)', 'Cabeça alinhada sobre os ombros', 'Pescoço'); add('neck', D.iso, 'Fortalece o pescoço sem movimento', 'Pescoço'); add('wallangel', D.rep, 'Postura da parte alta das costas', 'Pescoço'); }
  for (const k of inj) for (const [ex, dose, why] of REHAB[k] || []) add(ex, dose, why, 'Lesão');
  return out;
}
// dicas fixas (sem prescrever): o que vale pra todo mundo com essas condições
export function spineTips(p, conds = []) {
  const s = spineOf(p), L = lateral(s), tips = [];
  if (conds.includes('escoliose') || (L.main && L.main.angle >= 10)) {
    tips.push('Exercícios de um lado só: comece pelo lado mais fraco e faça as mesmas repetições dos dois lados. Espelho ajuda a não compensar com o tronco.');
    if (L.main && L.main.angle >= 40) tips.push('Curva acima de 40°: acompanhe com ortopedista. Carga alta nas costas (agachamento, terra) só com técnica muito boa e sem ir à falha.');
    else if (L.main && L.main.angle >= 25) tips.push('Curva entre 25° e 40°: fisioterapia com método específico (Schroth/SEAS) tem a melhor evidência pra frear a progressão.');
  }
  if (s.sh) tips.push(`Ombro ${SIDE[s.sh]} mais baixo: treine os dois lados por igual (remada e desenvolvimento unilaterais) e evite carregar bolsa sempre do mesmo lado.`);
  if (s.hip) tips.push(`Quadril ${SIDE[s.hip]} mais alto: pode vir da coluna ou de diferença no tamanho das pernas. Vale avaliar antes de usar palmilha.`);
  return tips;
}
