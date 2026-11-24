// ============================================================
// RONIN — esportes. Cada esporte muda: gasto calórico, gerador de treino,
// combinações faladas, pontos fracos, ênfase da força e cartas de ciência.
// ============================================================
import { COMBOS, BOX_THEMES, WEAKNESSES as BOX_WEAK } from './data.js';

const COMMON = {
  aquec: BOX_THEMES.aquec, final: BOX_THEMES.final, core: BOX_THEMES.core, corda: BOX_THEMES.corda
};

// ---------- Muay thai ----------
const MT_COMBOS = {
  iniciante: ['1-2', 'teep', 'chute de direita', '1-2, chute de direita', 'joelhada', '1, teep', 'checa, 2', 'chute baixo'],
  intermediario: ['1-2-3, chute de direita', 'chute baixo, 2', '2, chute de esquerda', '1-2, joelhada', 'cotovelada', 'checa, chute', 'teep, 1-2', '1, chute no corpo'],
  avancado: ['1-2-3-2, chute baixo', 'finta de teep, chute alto', 'agarra o chute, 2-3', 'clinch, 2 joelhadas, cotovelada', '1-2, troca de base, chute', '3, chute baixo de direita', 'teep, 2, joelhada']
};
const MT_THEMES = {
  ...COMMON,
  mt_teep: { t: 'Teep e distância', f: 'Teep da frente e de trás pra controlar a distância. Volta pra base logo depois.', calls: true, pool: ['teep', '1, teep', 'teep de trás', '1-2, teep', 'teep, 1-2'] },
  mt_chute: { t: 'Chutes', f: 'Gire o pé de apoio, o quadril passa por cima. Acerte com a canela, não com o pé.', calls: true, pool: ['chute de direita', '1-2, chute de direita', 'chute baixo', '1, chute de esquerda', '2, chute de esquerda', 'chute no corpo'] },
  mt_joelho: { t: 'Joelhos e clinch', f: 'Mãos no clinch imaginário, joelhada reta e em diagonal. Quadril vai pra frente.', calls: true, pool: ['joelhada', '2 joelhadas', '1-2, joelhada', 'clinch, joelhada', 'joelhada de trás'] },
  mt_cotovelo: { t: 'Cotovelos', f: 'Curto, de perto. Gira o quadril como num gancho.', calls: true, pool: ['cotovelada', '1, cotovelada', '2, cotovelada de esquerda', 'cotovelada de baixo pra cima'] },
  mt_defesa: { t: 'Defesa de chute', f: 'Checa o chute baixo, bloqueia o alto e devolve na hora.', calls: true, pool: ['checa, chute', 'bloqueia, 2', 'checa, 1-2', 'agarra o chute, 2', 'passo pra trás, teep'] },
  mt_saco: { t: 'Saco: chutes e joelhos', f: 'Combos que terminam em chute ou joelhada. Alterne os lados.', calls: true, saco: true },
  mt_pot: { t: 'Saco: potência', f: 'Chutes com tudo, um de cada vez. Reseta a base entre eles.', calls: true, saco: true, pool: ['chute de direita', 'chute de esquerda', 'chute baixo', 'joelhada'] },
  mt_pressao: { t: 'Pressão', f: 'Ritmo alto o round inteiro: soco, chute, soco. Nos últimos 30 s, solta tudo.', calls: true }
};

// ---------- MMA ----------
const MMA_COMBOS = {
  iniciante: ['1-2', 'jab, double leg', 'sprawl', '1-2, chute baixo', 'sprawl, 1-2', '1, entra na queda'],
  intermediario: ['1-2-3, entra na queda', 'chute baixo, 2', 'sprawl, levanta, 1-2', 'finta de jab, double leg', '2, joelhada', '1-2, sprawl, 2'],
  avancado: ['1-2, troca de nível, single leg', 'sprawl, joelhada', 'chute no corpo, 2-3', 'finta de queda, uppercut', '1-2-3, chute baixo, sprawl']
};
const MMA_THEMES = {
  ...COMMON,
  mma_strike: { t: 'Trocação', f: 'Socos e chutes curtos, sempre pronto pra defender queda.', calls: true },
  mma_wrestle: { t: 'Quedas na sombra', f: 'Mude o nível com as pernas e entre: double leg na sombra, levanta e volta pra base.', calls: true, pool: ['1-2, entra na queda', 'jab, double leg', 'finta, single leg', '1, troca de nível'] },
  mma_sprawl: { t: 'Sprawl e levantar', f: 'Sprawl, levanta, 1-2. Repete. É o round que mais cansa.', calls: true, pool: ['sprawl', 'sprawl, 1-2', 'sprawl, levanta, 2', 'sprawl, joelhada'] },
  mma_gnp: { t: 'Ground and pound', f: 'Saco deitado no chão: socos e cotoveladas por cima, base larga e postura alta.', calls: false, saco: true },
  mma_chao: { t: 'Levantada e fuga', f: 'Fuga de quadril, levantada técnica, volta pra base e solta um 1-2.', calls: false }
};

// ---------- Jiu-jitsu ----------
const JJ_THEMES = {
  jj_aquec: { t: 'Movimentação solo', f: 'Fuga de quadril, ponte, rolamento de ombro e levantada técnica. Solte o corpo.', calls: false },
  jj_quadril: { t: 'Fuga de quadril e ponte', f: 'Fuga de quadril pela sala, dos dois lados. Ponte com giro (upa) entre as passagens.', calls: false },
  jj_guarda: { t: 'Guarda (solo)', f: 'Escalada de guarda, invertida e recuperação de guarda. Pés sempre ativos.', calls: false },
  jj_granby: { t: 'Granby e sit-out', f: 'Rolamento de Granby pros dois lados + sit-out. Queixo encostado no peito.', calls: false },
  jj_grip: { t: 'Pegada', f: 'Pendurado na barra ou na toalha: 20–30 s pendurado, 20 s solto, até o gongo.', calls: false },
  jj_posic: { t: 'Posicional (com parceiro)', f: 'Um passa, o outro guarda. Troca a cada finalização, raspagem ou passagem.', calls: false, partner: true },
  jj_rola: { t: 'Rola (com parceiro)', f: 'Ritmo de competição. Respira e gasta energia só quando precisa.', calls: false, partner: true },
  final: { t: 'Finalizador', f: '20 s de sprawl + fuga de quadril / 10 s de descanso, até o gongo.', calls: false },
  core: BOX_THEMES.core
};

export const SPORTS = {
  boxe: {
    n: 'Boxe', mark: '拳', combat: true,
    types: { tecnica: { n: 'Técnica / sombra', met: 4.0 }, saco: { n: 'Saco / manopla', met: 5.5 }, sparring: { n: 'Sparring', met: 7.8 }, condic: { n: 'Condicionamento', met: 8.0 }, luta: { n: 'Luta (ringue)', met: 12.8 } },
    defaultType: 'tecnica', round: [180, 60], roundIni: [120, 60],
    presets: [{ id: 'amador', n: 'Amador 3×3', rounds: 3, work: 180, rest: 60 }, { id: 'saco', n: 'Saco 6×3', rounds: 6, work: 180, rest: 60 }, { id: 'pro', n: 'Pro 12×3', rounds: 12, work: 180, rest: 60 }, { id: 'hiit', n: 'HIIT 30/30', rounds: 10, work: 30, rest: 30 }],
    combos: COMBOS, themes: BOX_THEMES, weak: BOX_WEAK,
    plan: ({ saco, weak }) => ({
      warm: ['aquec', 'corda'],
      tech: [...(weak.includes('legs') ? ['foot'] : []), ...(weak.includes('chin') ? ['defesa'] : []), 'jab', 'retas', 'defesa', 'foot', 'niveis'],
      hard: [...(weak.includes('guard') ? ['guarda'] : []), ...(saco ? ['saco_vol', ...(weak.includes('power') ? ['saco_pot'] : []), 'saco_pot', 'pressao'] : [...(weak.includes('power') ? ['explosiva'] : []), 'pressao', 'explosiva'])],
      tail: [...(weak.includes('gas') ? ['final'] : []), 'core']
    }),
    sc: [], ev: ['soco', 'concorrente', 'pescoco', 'corte-peso'],
    week: [['Seg', 'Técnica + força (superior)'], ['Ter', 'Força (inferior + potência)'], ['Qua', 'Boxe intenso / sparring'], ['Qui', 'Força leve + corda'], ['Sex', 'Saco / condicionamento'], ['Sáb', 'Aeróbio leve 30–40 min'], ['Dom', 'Descanso']],
    legend: true
  },
  muaythai: {
    n: 'Muay thai', mark: '脚', combat: true,
    types: { tecnica: { n: 'Técnica / sombra', met: 5.0 }, saco: { n: 'Saco / aparador', met: 7.0 }, sparring: { n: 'Sparring', met: 9.4 }, condic: { n: 'Condicionamento', met: 8.0 } },
    defaultType: 'tecnica', round: [180, 60], roundIni: [120, 60],
    presets: [{ id: 'mt3', n: 'Amador 3×3', rounds: 3, work: 180, rest: 60 }, { id: 'mtpro', n: 'Pro 5×3/2', rounds: 5, work: 180, rest: 120 }, { id: 'mtsaco', n: 'Saco 5×3', rounds: 5, work: 180, rest: 60 }],
    legend: true, combos: MT_COMBOS, themes: MT_THEMES,
    weak: [
      { id: 'mt_gas', n: 'Canso nos rounds', fix: ['Base aeróbia 2x/semana: 30–40 min em ritmo de conversa (corrida leve, bike, corda).', 'Rounds intensos com descanso curto no saco.', 'Carboidrato suficiente nos dias de sparring.'], ev: ['mt-energia', 'carb-combate'] },
      { id: 'mt_kick', n: 'Chute fraco / sem equilíbrio', fix: ['Força unilateral (búlgaro, afundo) e panturrilha.', 'Arremesso rotacional ou sombra explosiva no início do treino.', 'Chute lento segurando 2 s no alto: equilíbrio e mobilidade de quadril.'], ev: ['soco', 'forca-lesao'] },
      { id: 'mt_clinch', n: 'Perco no clinch', fix: ['Puxadas e remadas pesadas + pegada.', 'Isometria de pescoço 2–3x/semana.', 'Rounds de joelhada no saco.'], ev: ['pescoco', 'jj-perfil'] },
      { id: 'mt_shin', n: 'Canela/pé doem muito', fix: ['Aumente o volume de chutes no saco aos poucos, semana a semana.', 'Use caneleira no sparring.', 'Dor que piora, inchaço ou dor num ponto só do osso: avaliação médica.'], ev: ['mt-lesao'] },
      { id: 'mt_groin', n: 'Virilha / adutor puxa', fix: ['Prancha de Copenhague 2x/semana (o app já coloca no treino de força).', 'Mobilidade de quadril no aquecimento.', 'Volte aos chutes altos aos poucos.'], ev: ['forca-lesao'] }
    ],
    plan: ({ saco, weak }) => ({
      warm: ['aquec', 'corda'],
      tech: [...(weak.includes('mt_kick') ? ['mt_chute'] : []), ...(weak.includes('mt_clinch') ? ['mt_joelho'] : []), 'mt_teep', 'mt_chute', 'mt_defesa', 'mt_joelho', 'mt_cotovelo'],
      hard: saco ? ['mt_saco', 'mt_pot', 'mt_pressao'] : ['mt_pressao', 'mt_chute'],
      tail: [...(weak.includes('mt_gas') ? ['final'] : []), 'core']
    }),
    sc: [['adductor', 2, 15, 30], ['calf', 2, 12, 20]], ev: ['mt-energia', 'mt-lesao', 'concorrente', 'corte-peso'],
    week: [['Seg', 'Técnica + força (superior)'], ['Ter', 'Força (inferior) + corda'], ['Qua', 'Sparring / aparador'], ['Qui', 'Aeróbio leve'], ['Sex', 'Saco: chutes e joelhos'], ['Sáb', 'Técnica leve'], ['Dom', 'Descanso']]
  },
  jiu: {
    n: 'Jiu-jitsu', mark: '柔', combat: true,
    types: { tecnica: { n: 'Técnica / drills', met: 5.3 }, rola: { n: 'Rola / treino de luta', met: 10.3 }, solo: { n: 'Drills solo em casa', met: 6.0 } },
    defaultType: 'tecnica', round: [300, 60], roundIni: [240, 60],
    presets: [{ id: 'jj5', n: 'Rola 5×5', rounds: 5, work: 300, rest: 60 }, { id: 'jj6', n: 'Rola 6×6', rounds: 6, work: 360, rest: 60 }, { id: 'jjpos', n: 'Posicional 8×2', rounds: 8, work: 120, rest: 30 }],
    combos: null, themes: JJ_THEMES,
    weak: [
      { id: 'jj_grip', n: 'Pegada acaba rápido', fix: ['Pendurar na barra ou na toalha: 3–4 séries de 20–40 s.', 'Remadas e puxadas pesadas.', 'Caminhada do fazendeiro.'], ev: ['jj-perfil'] },
      { id: 'jj_gas', n: 'Sem gás no rola', fix: ['Base aeróbia 2x/semana em ritmo de conversa.', 'Respire: solte o ar quando fizer força, não prenda.', 'Rounds de 5 min com 1 min de descanso.'], ev: ['jj-perfil', 'carb-combate'] },
      { id: 'jj_guard', n: 'Passam minha guarda fácil', fix: ['Fuga de quadril e escalada de guarda em todo treino.', 'Mobilidade de quadril.', 'Core: hollow e ponte.'], ev: ['jj-perfil'] },
      { id: 'jj_neck', n: 'Pescoço / lombar sofrem', fix: ['Isometria de pescoço 2–3x/semana.', 'Ponte de glúteo e prancha.', 'Dor que irradia pro braço/perna ou formigamento: avaliação médica.'], ev: ['pescoco', 'forca-lesao'] }
    ],
    plan: ({ partner, weak, barra }) => ({
      warm: ['jj_aquec'],
      tech: [...(weak.includes('jj_guard') ? ['jj_guarda'] : []), 'jj_quadril', 'jj_guarda', 'jj_granby'],
      hard: partner ? ['jj_posic', 'jj_rola', 'jj_rola'] : [...(barra && weak.includes('jj_grip') ? ['jj_grip'] : []), 'final', 'jj_quadril'],
      tail: ['core']
    }),
    sc: [['grip', 3, 20, 40], ['neck', 2, 15, 30]], ev: ['jj-perfil', 'forca-lesao', 'pescoco', 'corte-peso'],
    week: [['Seg', 'Treino de jiu + força (puxar + pegada)'], ['Ter', 'Aeróbio leve'], ['Qua', 'Treino de jiu (rola)'], ['Qui', 'Força (inferior + pescoço)'], ['Sex', 'Treino de jiu'], ['Sáb', 'Drills solo leves'], ['Dom', 'Descanso']]
  },
  mma: {
    n: 'MMA', mark: '闘', combat: true,
    types: { strike: { n: 'Trocação', met: 6.0 }, grapple: { n: 'Grappling / quedas', met: 8.0 }, sparring: { n: 'Sparring', met: 9.0 } },
    defaultType: 'strike', round: [300, 60], roundIni: [180, 60],
    presets: [{ id: 'mma3', n: 'Luta 3×5', rounds: 3, work: 300, rest: 60 }, { id: 'mma5', n: 'Título 5×5', rounds: 5, work: 300, rest: 60 }, { id: 'mmahiit', n: 'Sprawl 10×30', rounds: 10, work: 30, rest: 30 }],
    legend: true, combos: MMA_COMBOS, themes: { ...MMA_THEMES, jab: BOX_THEMES.jab, defesa: BOX_THEMES.defesa, mt_chute: MT_THEMES.mt_chute, mt_joelho: MT_THEMES.mt_joelho },
    weak: [
      { id: 'mma_gas', n: 'Canso nos rounds', fix: ['Base aeróbia 2x/semana.', 'Rounds de sprawl + levantar com descanso curto.', 'Força: ela atrasa o cansaço no clinch e no chão.'], ev: ['mma-perfil', 'carb-combate'] },
      { id: 'mma_td', n: 'Sou derrubado fácil', fix: ['Sprawl em todo treino.', 'Força de perna e quadril (agachamento, terra romeno).', 'Base: pés afastados, peso no meio.'], ev: ['mma-perfil'] },
      { id: 'mma_strike', n: 'Trocação fraca', fix: ['Rounds de jab e defesa.', 'Arremesso rotacional e saltos (potência).', 'Combos terminando em chute baixo.'], ev: ['soco'] },
      { id: 'mma_ground', n: 'Fico preso por baixo', fix: ['Fuga de quadril e levantada técnica todo dia.', 'Ponte com giro (upa).', 'Força de puxada e pegada.'], ev: ['jj-perfil'] }
    ],
    plan: ({ saco, weak }) => ({
      warm: ['aquec'],
      tech: [...(weak.includes('mma_td') ? ['mma_sprawl'] : []), ...(weak.includes('mma_ground') ? ['mma_chao'] : []), 'mma_strike', 'mma_wrestle', 'jab', 'mt_chute', 'defesa'],
      hard: [...(saco ? ['mma_gnp'] : []), 'mma_sprawl', 'mma_strike', 'mt_joelho'],
      tail: [...(weak.includes('mma_gas') ? ['final'] : []), 'core']
    }),
    sc: [['grip', 2, 20, 40], ['neck', 2, 15, 30]], ev: ['mma-perfil', 'concorrente', 'pescoco', 'corte-peso'],
    week: [['Seg', 'Trocação + força (superior)'], ['Ter', 'Grappling / quedas'], ['Qua', 'Força (inferior + potência)'], ['Qui', 'Sparring'], ['Sex', 'Chão + condicionamento'], ['Sáb', 'Aeróbio leve'], ['Dom', 'Descanso']]
  },
  corrida: {
    n: 'Corrida', mark: '走', combat: false,
    types: { leve: { n: 'Rodagem leve', met: 8.3 }, intervalado: { n: 'Intervalado / tiros', met: 10.5 }, longo: { n: 'Longão', met: 9.0 } },
    defaultType: 'leve', round: [180, 120], roundIni: [120, 120],
    presets: [{ id: 'r6x3', n: '6× 3 min forte', rounds: 6, work: 180, rest: 120 }, { id: 'r10x1', n: '10× 1 min', rounds: 10, work: 60, rest: 60 }, { id: 'r4x4', n: '4× 4 min', rounds: 4, work: 240, rest: 180 }],
    combos: null, themes: {},
    weak: [
      { id: 'r_gas', n: 'Canso rápido', fix: ['Cerca de 80% dos treinos em ritmo leve, dá pra conversar.', '1–2 sessões intensas por semana, não mais.', 'Aumente o volume total aos poucos.'], ev: ['corrida-8020'] },
      { id: 'r_pain', n: 'Dor na canela / joelho', fix: ['Força 2x/semana: perna, panturrilha e quadril.', 'Não aumente distância e intensidade na mesma semana.', 'Dor que piora correndo ou dor num ponto do osso: pare e procure avaliação.'], ev: ['forca-lesao'] },
      { id: 'r_pace', n: 'Quero ficar mais rápido', fix: ['Intervalado 1x/semana.', 'Pliometria leve (pogo, saltos) 2x/semana.', 'Força pesada de perna.'], ev: ['corrida-economia'] }
    ],
    sc: [['pogo', 3, 15, 20], ['calf', 3, 12, 20]], ev: ['corrida-8020', 'corrida-economia', 'forca-lesao'],
    week: [['Seg', 'Rodagem leve + força'], ['Ter', 'Intervalado'], ['Qua', 'Descanso ou caminhada'], ['Qui', 'Rodagem leve + força'], ['Sex', 'Descanso'], ['Sáb', 'Longão leve'], ['Dom', 'Descanso']]
  }
};

export const SPORT_IDS = Object.keys(SPORTS);

// Sessão de corrida: blocos com o mesmo timer (trabalho/descanso)
// ritmo em segundos por km ↔ texto "6:00" e km/h
export const paceTxt = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
export const paceKmh = s => 3600 / s;
export function parsePace(v, unit = 'minkm') {
  const t = String(v || '').trim().replace(',', '.');
  if (unit === 'kmh') { const k = parseFloat(t); return k >= 4 && k <= 25 ? Math.round(3600 / k) : 0; }
  const m = t.match(/^(\d{1,2})(?::(\d{1,2}))?$/); if (!m) return 0;
  const s = +m[1] * 60 + (+m[2] || 0); return s >= 150 && s <= 900 ? s : 0;
}
// km + ritmo → treino: rodagem e longão viram a distância no ritmo; intervalado e tiros usam o tempo equivalente
export function runSession({ minutes = 30, kind = 'intervalado', km = 0, pace = 0 }) {
  const B = (t, f, work, rest = 0) => ({ id: 'run', t, f, work, rest, calls: false });
  if (km > 0 && pace > 0) {
    const main = Math.round(km * pace), txt = `${String(km).replace('.', ',')} km a ${paceTxt(pace)}/km (${paceKmh(pace).toFixed(1).replace('.', ',')} km/h)`;
    if (kind === 'leve' || kind === 'longo') return [B('Aquecimento', 'Caminhada rápida e trote bem leve.', 300), B(kind === 'longo' ? 'Longão' : 'Rodagem', `${txt}. ${kind === 'longo' ? 'Leve e constante; hidrate se passar de 60 min.' : 'Ritmo de conversa.'}`, main), B('Volta à calma', 'Trote leve e caminhada.', 300)];
    minutes = Math.round(main / 60) + 10;
  }
  if (kind === 'leve') return [B('Aquecimento', 'Caminhada rápida e trote bem leve.', 300), B('Rodagem leve', 'Ritmo de conversa: deu pra falar frases inteiras, tá certo.', Math.max(300, (minutes - 10) * 60)), B('Volta à calma', 'Trote leve e caminhada.', 300)];
  if (kind === 'longo') return [B('Aquecimento', 'Trote leve.', 300), B('Longão', 'Leve e constante. Hidrate se passar de 60 min.', Math.max(600, (minutes - 10) * 60)), B('Volta à calma', 'Caminhada.', 300)];
  if (kind === 'tiros') {
    const n = Math.max(4, Math.min(12, Math.round((minutes - 15) / 2)));
    return [B('Aquecimento', 'Trote leve + 3 acelerações curtas.', 600), ...Array.from({ length: n }, (_, i) => ({ ...B(`Tiro ${i + 1}/${n}`, 'Forte, mas controlado: o último tem que sair igual ao primeiro.', 60, 60) })), B('Volta à calma', 'Trote leve.', 300)];
  }
  const n = Math.max(3, Math.min(8, Math.round((minutes - 15) / 5)));
  return [B('Aquecimento', 'Trote leve + 3 acelerações curtas.', 600), ...Array.from({ length: n }, (_, i) => ({ ...B(`Bloco ${i + 1}/${n}`, 'Ritmo forte e sustentável (dá pra falar só palavras soltas). Depois, trote leve.', 180, 120) })), B('Volta à calma', 'Trote leve.', 300)];
}

// Gerador de rounds para esportes de combate
export function combatSession(sportId, { minutes = 30, level = 'intermediario', saco = false, partner = false, corda = false, barra = false, weak = [] }) {
  const sp = SPORTS[sportId];
  const [work, rest] = level === 'iniciante' ? sp.roundIni : sp.round;
  const n = Math.max(3, Math.round(minutes * 60 / (work + rest)));
  const P = sp.plan({ saco, partner, weak, barra, corda });
  const th = id => sp.themes[id] || BOX_THEMES[id] || JJ_THEMES[id];
  const list = [P.warm[0]];
  if (n >= 8 && P.warm[1] && (corda || P.warm[1] !== 'corda')) list.push(P.warm[1]);
  const uniq = a => [...new Set(a)].filter(id => th(id) && (!th(id).partner || partner) && (!th(id).saco || saco));
  const tech = uniq(P.tech), hard = uniq(P.hard), tail = uniq(P.tail);
  const slots = Math.max(1, n - list.length - tail.length);
  const nTech = Math.max(1, Math.ceil(slots / 2)), nHard = Math.max(0, slots - nTech);
  const cyc = (arr, k) => arr.length ? Array.from({ length: k }, (_, i) => arr[i % arr.length]) : [];
  list.push(...cyc(tech, nTech), ...cyc(hard.length ? hard : tech, nHard), ...tail);
  return list.map(id => {
    const x = th(id);
    return { id, sport: sportId, t: x.t, f: x.f, calls: !!(x.calls && sp.combos), pool: x.pool, saco: !!x.saco, work: id === 'final' ? Math.min(work, 120) : work, rest };
  });
}
