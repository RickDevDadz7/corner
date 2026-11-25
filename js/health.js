// ============================================================
// RONIN — condições de saúde e adaptações do corpo.
// Cada condição liga: restrições da dieta (marcadas sozinhas, dá pra desmarcar),
// orientações de alimentação, cuidados no treino e, quando o risco pede, liberação médica.
// Fontes de referência: ACSM Guidelines (11ª ed.), Diretrizes da SBD 2023 (diabetes),
// Diretriz Brasileira de Hipertensão 2020, ESSA/ABRASSO (osteoporose), ACOG 2020 (gestação),
// OARSI 2019 (artrose), KDIGO 2024 (rim), GINA (asma), FENACELBRA/ACG (celíaca).
// Não substitui médico, nutricionista ou fisioterapeuta.
// ============================================================
import { EXERCISES } from './data.js';

const JUMPS = ['jump', 'broad', 'skater', 'pogo', 'plyopush', 'medslam'];
const SUPINE = ['bp', 'incbp', 'dbfp', 'fly', 'skull', 'dbpullover', 'legraiseb', 'hollow', 'sgb', 'slide', 'ht'];
const FLEX_LOADED = ['crunchcable', 'russian', 'legraiseb', 'hlr', 'abwheel'];

export const COND_GROUPS = { meta: 'Metabolismo', cardio: 'Coração e pressão', osso: 'Ossos e articulações', coluna: 'Coluna', dig: 'Digestão', outro: 'Outras' };
export const CONDITIONS = {
  diabetes1: { n: 'Diabetes tipo 1', g: 'meta', restr: ['acucar'],
    diet: ['Conte o carboidrato de cada refeição pra acertar a insulina; o Tairen mostra os gramas de cada item.', 'Prefira carboidrato com fibra (feijão, aveia, fruta inteira) e distribua ao longo do dia.'],
    train: ['Meça a glicemia antes: abaixo de 90 mg/dL, coma 15–30 g de carboidrato antes; acima de 250 com cetona, não treine.', 'Leve sempre carboidrato rápido (suco, bala) e avise quem treina com você.', 'Hipoglicemia pode vir horas depois, até de madrugada: confira à noite nos dias de treino pesado.'] },
  diabetes2: { n: 'Diabetes tipo 2 / pré-diabetes', g: 'meta', restr: ['acucar'],
    diet: ['Prato com metade de verdura, 1/4 de proteína e 1/4 de carboidrato com fibra.', 'Fibra alta (25–35 g/dia) e carboidrato espalhado nas refeições, sem concentrar num pico.'],
    train: ['Musculação 2–3x por semana melhora a glicemia por até 48 h: é tratamento, não só estética.', 'Uma caminhada de 10–15 min depois das refeições ajuda a baixar o pico de açúcar.', 'Se usa insulina ou sulfonilureia, meça a glicemia antes e tenha carboidrato por perto.'] },
  obesidade: { n: 'Obesidade', g: 'meta', care: JUMPS,
    diet: ['Déficit moderado (perder 0,5–1% do peso por semana) preserva músculo e é mais fácil de manter.', 'Proteína alta e muita verdura ajudam na saciedade.'],
    train: ['Saltos e impacto ficam pra depois: comece com força e caminhada, que protegem joelho e tornozelo.', 'Força é prioridade: perder gordura mantendo músculo muda o metabolismo e a composição.'] },
  colesterol: { n: 'Colesterol alto / triglicerídeos', g: 'meta', restr: ['frituras'],
    diet: ['Troque gordura saturada (frituras, embutidos, gordura da carne) por azeite, castanhas e peixe.', 'Fibra solúvel ajuda: aveia, feijão, maçã. Triglicerídeo alto: corte açúcar e álcool.'],
    train: ['Aeróbico + musculação somam: o exercício melhora o HDL e os triglicerídeos.'] },
  hipotireoidismo: { n: 'Hipotireoidismo', g: 'meta',
    diet: ['Tome o remédio em jejum, com água, e espere 30–60 min pra comer. Café, cálcio, ferro e soja atrapalham a absorção perto da dose.'],
    train: ['Com o hormônio controlado, o treino é igual ao de qualquer pessoa. Cansaço fora do normal: confira os exames.'] },
  gota: { n: 'Gota / ácido úrico alto', g: 'meta', restr: ['alcool'],
    diet: ['Evite cerveja e destilados, refrigerante e suco com frutose; carne vermelha, vísceras e frutos do mar com moderação.', 'Beba bastante água. Leite e derivados magros ajudam a baixar o ácido úrico.'],
    train: ['Na crise, descanse a articulação inflamada. Fora dela, treine normal e evite desidratar.'] },
  hipertensao: { n: 'Pressão alta', g: 'cardio', restr: ['ultra'], rir: '2–3',
    diet: ['Sódio abaixo de 2 g por dia (cerca de 5 g de sal): cuidado com embutido, tempero pronto, salgadinho e enlatado.', 'Padrão DASH: frutas, verduras, feijão, laticínio magro e castanhas.'],
    train: ['Não prenda a respiração na força (solte o ar ao subir) e pare 2–3 reps antes da falha.', 'Pressão acima de 160/100 no dia: não treine pesado e procure seu médico.', 'Exercício regular baixa a pressão de 5 a 8 mmHg em média.'] },
  cardiopatia: { n: 'Doença do coração (infarto, insuficiência, arritmia)', g: 'cardio', clearance: true, conservative: true, noPower: true, rir: '3–4',
    diet: ['Siga a orientação do cardiologista sobre sal e líquidos.'],
    train: ['Precisa de liberação do cardiologista, de preferência com teste de esforço, antes de treinar.', 'Dor no peito, falta de ar fora do normal ou tontura: pare na hora e procure atendimento.'] },
  osteoporose: { n: 'Osteoporose / osteopenia', g: 'osso', avoid: [...FLEX_LOADED, 'lmr'], care: [...JUMPS, 'dl', 'rdl', 'sq', 'row', 'tbar'],
    diet: ['Cálcio de 1.000–1.200 mg por dia (leite, iogurte, queijo, sardinha, couve) e vitamina D conforme exame.', 'Proteína de pelo menos 1–1,2 g por kg: músculo e osso andam juntos.'],
    train: ['Força progressiva é o melhor remédio pro osso: carga alta com técnica, 2–3x por semana.', 'Evite dobrar a coluna com carga (abdominal tradicional, giro russo): saíram da rotina.', 'Impacto (saltos) ajuda o osso, mas só com liberação e começando pequeno. Equilíbrio evita queda.'] },
  artrose: { n: 'Artrose (desgaste nas articulações)', g: 'osso', care: [...JUMPS, 'sq', 'lp', 'afundo', 'walklunge', 'bul'],
    diet: ['Perder peso alivia o joelho: cada quilo a menos tira cerca de 4 kg de carga dele por passo.'],
    train: ['Fortalecer a musculatura em volta é o tratamento de primeira linha.', 'Dor até 3 de 10 durante o treino é aceitável se passar em 24 h; mais que isso, reduza a carga ou a amplitude.'] },
  fibromialgia: { n: 'Fibromialgia', g: 'osso', conservative: true, rir: '3–4',
    diet: ['Sem dieta específica comprovada: foque em comida de verdade e sono regular.'],
    train: ['Comece leve e suba devagar: exercício é um dos tratamentos com melhor evidência, mas exagero piora a dor por dias.'] },
  escoliose: { n: 'Escoliose (coluna curvada pro lado)', g: 'coluna',
    diet: [],
    train: ['Força e core ajudam na dor e na postura. Treino não "endireita" a coluna, mas exercício específico pode frear a curva e melhorar a função.', 'Desenhe sua coluna no perfil: o Tairen diz o lado da curva e monta os complementares.'] },
  cifose: { n: 'Cifose (costas arredondadas)', g: 'coluna',
    diet: [],
    train: ['Pelo menos uma série de puxar pra cada série de empurrar: costas fortes seguram os ombros pra trás.', 'Mobilidade da parte alta das costas e alongamento do peitoral, de preferência todo dia.', 'Cifose rígida ou com dor (ex.: Scheuermann): acompanhe com fisioterapeuta.'] },
  lordose: { n: 'Hiperlordose (lombar muito curvada)', g: 'coluna', care: ['hipext', 'superman', 'gm', 'ohp'],
    diet: [],
    train: ['Antes de agachar ou levantar peso, ative glúteo e abdômen (ponte, dead bug).', 'Peso acima da cabeça: costelas "pra baixo" e glúteo contraído, sem arquear a lombar.', 'Alongue o flexor do quadril, que costuma estar encurtado.'] },
  celiaco: { n: 'Doença celíaca', g: 'dig', restr: ['celiaca'],
    diet: ['Zero glúten, inclusive traços: confira "contém glúten" no rótulo e cuidado com contaminação (mesma tábua, mesma fritura).', 'Aveia só se for certificada sem glúten.'],
    train: ['Treino normal. Com anemia ou baixa absorção no começo do tratamento, vá com calma.'] },
  refluxo: { n: 'Refluxo / gastrite', g: 'dig', restr: ['frituras', 'cafeina', 'alcool'],
    diet: ['Refeições menores, sem deitar até 2–3 h depois de comer.', 'Gordura, café, álcool, chocolate e hortelã costumam piorar.'],
    train: ['Treine pelo menos 2 h depois de comer. Exercícios deitado ou de cabeça pra baixo podem piorar.'] },
  sii: { n: 'Intestino irritável', g: 'dig', restr: ['frutose'],
    diet: ['Dieta com pouco FODMAP por 4–6 semanas, depois reintroduzir um grupo por vez (de preferência com nutricionista).'],
    train: ['Exercício regular costuma melhorar os sintomas.'] },
  asma: { n: 'Asma', g: 'outro',
    diet: [],
    train: ['Aquecimento longo (10–15 min) reduz a crise induzida pelo exercício.', 'Bombinha de resgate sempre por perto; use antes do treino se o médico orientou.'] },
  anemia: { n: 'Anemia (falta de ferro)', g: 'outro',
    diet: ['Ferro: carne vermelha magra, feijão, lentilha, folhas escuras. Vitamina C junto (laranja, limão) aumenta a absorção.', 'Café e chá longe das refeições com ferro.'],
    train: ['Cansaço e falta de ar mais cedo são esperados: reduza o volume até os exames melhorarem.'] },
  renal: { n: 'Doença renal crônica', g: 'outro', clearance: true, conservative: true, proteinCap: 0.8,
    diet: ['Proteína limitada (cerca de 0,8 g por kg, o Tairen já ajustou) e sódio, potássio e fósforo conforme exame, com nutricionista.'],
    train: ['Precisa de liberação do nefrologista. Força leve a moderada ajuda a manter músculo.'] },
  gestacao: { n: 'Gestação', g: 'outro', clearance: true, conservative: true, noPower: true, noCut: true, restr: ['alcool'], avoid: [...SUPINE, ...FLEX_LOADED, 'plankrot', 'birddog', 'sideplank', 'copen', 'kbswing', 'dl', 'lmr', 'woodchop'], rir: '3–4',
    diet: ['Sem dieta de emagrecimento: o Tairen trocou a meta pra manter. Ácido fólico, ferro, cálcio e iodo com o obstetra.', 'Nada de álcool, carne ou peixe cru, queijo não pasteurizado e peixes grandes (atum, cação).'],
    train: ['Precisa de liberação do obstetra. Com ela, 150 min por semana de exercício moderado é recomendado.', 'Depois do 1º trimestre, evite ficar deitada de barriga pra cima: exercícios de banco e chão saíram da rotina.', 'Nada de impacto, salto, risco de queda ou contato. Sangramento, dor ou tontura: pare e procure atendimento.'] }
};
export const condsOf = p => (Array.isArray(p?.cond) ? p.cond : []).filter(k => CONDITIONS[k]);
export const condFlag = (p, f) => condsOf(p).some(k => CONDITIONS[k][f]);
export const condRestr = keys => [...new Set(keys.flatMap(k => CONDITIONS[k]?.restr || []))];

// ---------- corpo ----------
export const BODY = {
  semBracoE: 'Sem braço esquerdo', semBracoD: 'Sem braço direito', semMaoE: 'Sem mão esquerda', semMaoD: 'Sem mão direita',
  semPernaE: 'Sem perna esquerda', semPernaD: 'Sem perna direita', protese: 'Uso prótese na perna', cadeira: 'Uso cadeira de rodas'
};
export const bodyOf = p => (Array.isArray(p?.body) ? p.body : []).filter(k => BODY[k]);
export function caps(p) {
  const b = new Set(bodyOf(p));
  const arms = 2 - (b.has('semBracoE') ? 1 : 0) - (b.has('semBracoD') ? 1 : 0);
  const hands = arms - (b.has('semMaoE') && !b.has('semBracoE') ? 1 : 0) - (b.has('semMaoD') && !b.has('semBracoD') ? 1 : 0);
  const legsReal = b.has('cadeira') ? 0 : 2 - (b.has('semPernaE') ? 1 : 0) - (b.has('semPernaD') ? 1 : 0);
  const pros = b.has('protese') && !b.has('cadeira') && legsReal < 2;
  return { arms, hands, legs: pros ? 2 : legsReal, legsReal, pros, chair: b.has('cadeira'), any: b.size > 0 };
}
// o que cada exercício exige: a = braços (0, 1 = dá com um, 2 = precisa dos dois), l = pernas (idem),
// s = precisa ficar em pé, f = deitar/ajoelhar no chão ou banco (transferência)
const N = (a, l, s = 0, f = 0) => ({ a, l, s, f });
export const NEEDS = {
  jump: N(0, 2, 1), mbr: N(2, 0), shadowx: N(1, 0), mbc: N(2, 0), plyopush: N(2, 0, 0, 1),
  sq: N(2, 2, 1), rdl: N(2, 2, 1), lp: N(0, 1), ht: N(2, 2, 0, 1), lc: N(0, 1, 0, 1), calf: N(0, 1, 1), bp: N(2, 0, 0, 1), ohp: N(2, 0, 1),
  pu: N(2, 0), row: N(2, 2, 1), tri: N(1, 0), lmr: N(2, 2, 1), gsq: N(1, 2, 1), dbrdl: N(1, 2, 1), bul: N(0, 2, 1), dbfp: N(1, 0, 0, 1),
  dbi: N(1, 0, 0, 1), dbohp: N(1, 0), dbrow: N(1, 0), lat: N(1, 0), curl: N(1, 0), ham: N(1, 0), farm: N(1, 2, 1), pal: N(1, 0), fp: N(1, 0),
  er: N(1, 0), bandrow: N(1, 0), bandpd: N(1, 0), bandlat: N(1, 0), bandcurl: N(1, 0), bandtri: N(1, 0), pullup: N(2, 0), chin: N(2, 0),
  hlr: N(2, 2), dip: N(2, 0), pushup: N(2, 0, 0, 1), pike: N(2, 2, 0, 1), chairdip: N(2, 1), diamond: N(2, 0, 0, 1), invrow: N(2, 1, 0, 1),
  ytw: N(1, 0, 0, 1), bwsq: N(0, 2, 1), afundo: N(0, 2, 1), slide: N(0, 1, 0, 1), sgb: N(0, 1, 0, 1), calfbw: N(0, 1, 1), hollow: N(0, 0, 0, 1),
  plankrot: N(2, 2, 0, 1), hang: N(2, 0), towelgrip: N(2, 0), copen: N(1, 2, 0, 1), pogo: N(0, 2, 1), neck: N(1, 0),
  ext: N(0, 1), hack: N(0, 2, 1), dl: N(2, 2, 1), sumo: N(1, 2, 1), walklunge: N(0, 2, 1), stepup: N(0, 2, 1), singlerdl: N(1, 1, 1),
  nordic: N(0, 2, 0, 1), hipext: N(0, 2), abd: N(0, 2), addu: N(0, 2), cablekick: N(1, 2, 1), seatcalf: N(0, 1), kbswing: N(1, 2, 1), incbp: N(2, 0, 0, 1),
  fly: N(1, 0, 0, 1), cross: N(1, 0), pecdeck: N(1, 0), seatrow: N(1, 0), tbar: N(2, 2, 1), pullover: N(1, 0, 1), dbpullover: N(1, 0, 0, 1),
  shrug: N(1, 0), arnold: N(1, 0), landpress: N(1, 0), cablelat: N(1, 0), rdelt: N(1, 0), bandpull: N(2, 0), skull: N(1, 0, 0, 1),
  ohtri: N(1, 0), kick: N(1, 0), bbcurl: N(2, 0), preacher: N(1, 0), conc: N(1, 0), abwheel: N(2, 2, 0, 1), crunchcable: N(1, 2, 0, 1),
  legraiseb: N(0, 1, 0, 1), sideplank: N(1, 1, 0, 1), birddog: N(2, 2, 0, 1), russian: N(0, 0, 0, 1), woodchop: N(1, 0), superman: N(0, 0, 0, 1),
  broad: N(0, 2, 1), skater: N(0, 2, 1), medslam: N(2, 2, 1),
  wcdip: N(2, 0), sbpress: N(1, 0), sitstand: N(0, 2), wallpush: N(2, 0, 1), suitcase: N(1, 2, 1),
  fsq: N(2, 2, 1), gm: N(2, 2, 1), sled: N(2, 2, 1), rope: N(1, 0), mbo: N(2, 0), bandohp: N(1, 0), seatcrunch: N(1, 0),
  deadbug: N(0, 0, 0, 1), curlup: N(0, 0, 0, 1), thrrot: N(1, 2, 0, 1), catcamel: N(2, 2, 0, 1), wallangel: N(1, 0), thext: N(0, 0, 0, 1),
  doorpec: N(1, 0), hipflex: N(0, 2, 0, 1), tke: N(0, 1, 1), wallsit: N(0, 2, 1), latwalk: N(0, 2, 1), balance: N(0, 1, 1), wristfe: N(1, 0), chintuck: N(0, 0)
};
// dá pra fazer com o corpo que a pessoa tem?
export function bodyOk(ex, p, c = caps(p)) {
  if (!c.any) return true;
  const n = NEEDS[ex] || N(1, 1), e = EXERCISES[ex];
  if (n.a > c.arms || n.l > c.legs) return false;
  if (n.s && (c.chair || (c.legsReal < 2 && !c.pros && n.l !== 1))) return false;
  if (n.f && c.chair) return false;
  if (c.pros && e?.t === 'power' && n.l > 0) return false; // salto com prótese só com orientação específica
  return true;
}
// nome adaptado: exercício de dois lados feito com um braço/uma perna
export function bodyLabel(ex, p, c = caps(p)) {
  if (!c.any) return '';
  const n = NEEDS[ex] || N(1, 1), e = EXERCISES[ex], uni = e?.u === '/lado' || e?.u === '/perna';
  if (c.arms === 1 && n.a === 1 && !uni && Object.keys(e.m).some(m => ['peito', 'costas', 'ombros', 'biceps', 'triceps'].includes(m))) return 'um braço';
  if (c.legsReal === 1 && !c.pros && n.l === 1 && !uni) return 'uma perna';
  if (c.chair && !n.s && !n.f && n.l === 0) return 'sentado';
  return '';
}
export function bodyCare(ex, p, c = caps(p)) {
  if (!c.any) return '';
  const e = EXERCISES[ex], n = NEEDS[ex] || N(1, 1);
  if (c.hands < c.arms && n.a > 0 && e?.req?.some(r => ['gym', 'halteres', 'kettlebell', 'barra'].includes(r))) return 'Use alça de punho ou gancho no lado sem a mão.';
  if (c.pros && n.l > 0 && n.s) return 'Com prótese: carga moderada, base larga e apoio por perto.';
  if (c.legsReal === 1 && !c.pros && n.s) return 'Faça perto de um apoio firme (barra, parede) pro equilíbrio.';
  return '';
}
// músculo que não se aplica ao corpo da pessoa (ex.: pernas em cadeirante)
export function bodyNA(p, c = caps(p)) { return c.chair || c.legs === 0 ? ['quad', 'post', 'glut', 'pant'] : []; }
// figura das demonstrações com o corpo da pessoa
export function bodyFig(p) {
  const c = caps(p), b = new Set(bodyOf(p)), missing = [];
  if (b.has('semBracoE') || b.has('semBracoD')) missing.push('arm');
  if (b.has('semBracoE') && b.has('semBracoD')) missing.push('arm2');
  if ((b.has('semMaoE') && !b.has('semBracoE')) || (b.has('semMaoD') && !b.has('semBracoD'))) missing.push('hand');
  if (b.has('semPernaE') || b.has('semPernaD')) missing.push('leg');
  if (b.has('semPernaE') && b.has('semPernaD')) missing.push('leg2');
  return missing.length ? { missing: missing.map(m => ({ arm: 'armR', arm2: 'armL', hand: 'handR', leg: 'legR', leg2: 'legL' }[m])), prosthesis: c.pros } : null;
}
