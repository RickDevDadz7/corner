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

// ---------- Karatê (kumite estilo WKF: pontos, distância longa, entradas explosivas) ----------
const KA_COMBOS = {
  iniciante: ['kizami', 'gyaku', 'kizami, gyaku', 'mae-geri', 'mae-geri, gyaku', 'mawashi chudan', 'desliza, gyaku', 'age-uke, gyaku'],
  intermediario: ['kizami, gyaku, mawashi', 'finta de kizami, gyaku', 'mawashi jodan', 'gedan-barai, gyaku', 'kizami-mawashi', 'mae-geri, kizami, gyaku', 'recua, gyaku'],
  avancado: ['ura-mawashi', 'kizami, mawashi jodan', 'finta de mawashi, gyaku', 'sai do eixo, gyaku', 'yoko-geri, gyaku', 'kizami, gyaku, mawashi jodan', 'contra no tempo: gyaku']
};
const KA_THEMES = {
  ...COMMON,
  ka_ashi: { t: 'Movimentação (ashi-sabaki)', f: 'Deslize pra frente, pra trás e pros lados, sempre na ponta dos pés. Ritmo leve, pronto pra explodir.', calls: false },
  ka_zuki: { t: 'Socos: kizami e gyaku', f: 'Entra deslizando com o kizami, gyaku sai com o quadril. Volta pra distância depois de cada ponto.', calls: true, pool: ['kizami', 'gyaku', 'kizami, gyaku', 'desliza, gyaku', 'finta de kizami, gyaku'] },
  ka_keri: { t: 'Chutes', f: 'Mae-geri e mawashi: joelho alto, estala e recolhe. Mãos no lugar.', calls: true, pool: ['mae-geri', 'mawashi chudan', 'mawashi jodan', 'mae-geri, gyaku', 'kizami-mawashi'] },
  ka_uke: { t: 'Defesas (uke)', f: 'Age-uke, gedan-barai e soto-uke, sempre com o contra-ataque na sequência.', calls: true, pool: ['age-uke, gyaku', 'gedan-barai, gyaku', 'recua, gyaku', 'sai do eixo, gyaku'] },
  ka_contra: { t: 'Contra-ataque (no tempo)', f: 'Espera ele começar e chega antes: gyaku no tempo ou saída e contra.', calls: true, pool: ['contra no tempo: gyaku', 'recua, gyaku', 'sai do eixo, gyaku', 'age-uke, gyaku'] },
  ka_kumite: { t: 'Kumite na sombra', f: 'Explosões de 2–3 s pontuando, pausa ativa, de novo. Como na luta de verdade.', calls: true },
  ka_kata: { t: 'Kata', f: 'Seu kata devagar e preciso; depois no ritmo, com kime (contração no fim de cada golpe).', calls: false },
  ka_saco: { t: 'Saco ou aparador', f: 'Gyaku e mawashi com potência, um de cada vez, voltando pra kamae.', calls: true, saco: true, pool: ['gyaku', 'kizami, gyaku', 'mawashi chudan', 'mae-geri'] }
};

// ---------- Jiu-jitsu ----------
const JJ_THEMES = {
  jj_aquec: { t: 'Movimentação solo', f: 'Fuga de quadril, ponte, rolamento de ombro e levantada técnica. Solte o corpo.', calls: false },
  jj_quadril: { t: 'Fuga de quadril e ponte', f: 'Fuga de quadril pela sala, dos dois lados. Ponte com giro (upa) entre as passagens.', calls: false },
  jj_guarda: { t: 'Guarda (solo)', f: 'Escalada de guarda, invertida e recuperação de guarda. Pés sempre ativos.', calls: false },
  jj_granby: { t: 'Granby e sit-out', f: 'Rolamento de Granby pros dois lados + sit-out. Queixo encostado no peito.', calls: false },
  jj_quedas: { t: 'Quedas na sombra', f: 'Sprawl, entrada de double leg e volta pra base. A troca de nível é com as pernas.', calls: false },
  jj_grip: { t: 'Pegada', f: 'Pendurado na barra ou na toalha: 20–30 s pendurado, 20 s solto, até o gongo.', calls: false },
  jj_posic: { t: 'Posicional (com parceiro)', f: 'Um passa, o outro guarda. Troca a cada finalização, raspagem ou passagem.', calls: false, partner: true },
  jj_rola: { t: 'Rola (com parceiro)', f: 'Ritmo de competição. Respira e gasta energia só quando precisa.', calls: false, partner: true },
  final: { t: 'Finalizador', f: '20 s de sprawl + fuga de quadril / 10 s de descanso, até o gongo.', calls: false },
  core: BOX_THEMES.core
};

export const SPORTS = {
  boxe: {
    n: 'Boxe', mark: '拳', combat: true,
    types: { tecnica: { n: 'Técnica / sombra', met: 4.0 }, saco: { n: 'Saco', met: 5.5 }, manopla: { n: 'Manopla', met: 5.5 }, sparring: { n: 'Sparring', met: 7.8 }, condic: { n: 'Condicionamento', met: 8.0 }, luta: { n: 'Luta (ringue)', met: 12.8 } },
    defaultType: 'tecnica', round: [180, 60], roundIni: [120, 60],
    presets: [{ id: 'amador', n: 'Amador 3×3', rounds: 3, work: 180, rest: 60 }, { id: 'saco', n: 'Saco 6×3', rounds: 6, work: 180, rest: 60 }, { id: 'pro', n: 'Pro 12×3', rounds: 12, work: 180, rest: 60 }, { id: 'hiit', n: 'HIIT 30/30', rounds: 10, work: 30, rest: 30 }],
    combos: COMBOS, themes: BOX_THEMES, weak: BOX_WEAK,
    plan: ({ saco, weak }) => ({
      warm: ['aquec', 'corda'],
      tech: [...(weak.includes('legs') ? ['foot'] : []), ...(weak.includes('chin') || weak.includes('def') ? ['defesa'] : []), ...(weak.includes('speed') ? ['retas'] : []), 'jab', 'retas', 'defesa', 'foot', 'niveis'],
      hard: [...(weak.includes('guard') ? ['guarda'] : []), ...(saco ? ['saco_vol', ...(weak.includes('power') ? ['saco_pot'] : []), 'saco_pot', 'pressao'] : [...(weak.includes('power') ? ['explosiva'] : []), 'pressao', 'explosiva'])],
      tail: [...(weak.includes('gas') ? ['final'] : []), 'core']
    }),
    sc: [], ev: ['soco', 'concorrente', 'pescoco', 'corte-peso'],
    week: [['Seg', 'Técnica + força (superior)'], ['Ter', 'Força (inferior + potência)'], ['Qua', 'Boxe intenso / sparring'], ['Qui', 'Força leve + corda'], ['Sex', 'Saco / condicionamento'], ['Sáb', 'Aeróbio leve 30–40 min'], ['Dom', 'Descanso']],
    legend: true
  },
  muaythai: {
    n: 'Muay thai', mark: '脚', combat: true,
    types: { tecnica: { n: 'Técnica / sombra', met: 5.0 }, saco: { n: 'Saco', met: 7.0 }, aparador: { n: 'Aparador / manopla', met: 7.0 }, sparring: { n: 'Sparring', met: 9.4 }, condic: { n: 'Condicionamento', met: 8.0 } },
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
      tech: [...(weak.includes('mt_kick') ? ['mt_chute'] : []), ...(weak.includes('mt_clinch') ? ['mt_joelho'] : []), ...(weak.includes('mt_foot') ? ['mt_teep'] : []), ...(weak.includes('mt_def') ? ['mt_defesa'] : []), 'mt_teep', 'mt_chute', 'mt_defesa', 'mt_joelho', 'mt_cotovelo'],
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
      tech: [...(weak.includes('jj_guard') ? ['jj_guarda'] : []), ...(weak.includes('jj_td') ? ['jj_quedas'] : []), ...(weak.includes('jj_bottom') ? ['jj_quadril'] : []), 'jj_quadril', 'jj_guarda', 'jj_granby'],
      hard: partner ? ['jj_posic', 'jj_rola', 'jj_rola'] : [...(barra && weak.includes('jj_grip') ? ['jj_grip'] : []), 'final', 'jj_quadril'],
      tail: ['core']
    }),
    sc: [['grip', 3, 20, 40], ['neck', 2, 15, 30]], ev: ['jj-perfil', 'forca-lesao', 'pescoco', 'corte-peso'],
    week: [['Seg', 'Treino de jiu + força (puxar + pegada)'], ['Ter', 'Aeróbio leve'], ['Qua', 'Treino de jiu (rola)'], ['Qui', 'Força (inferior + pescoço)'], ['Sex', 'Treino de jiu'], ['Sáb', 'Drills solo leves'], ['Dom', 'Descanso']]
  },
  mma: {
    n: 'MMA', mark: '闘', combat: true, retired: true,
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
  karate: {
    n: 'Karatê', mark: '空', combat: true,
    types: { kihon: { n: 'Kihon (técnica básica)', met: 5.0 }, kata: { n: 'Kata', met: 4.5 }, kumite: { n: 'Kumite (luta)', met: 9.0 }, condic: { n: 'Condicionamento', met: 8.0 } },
    defaultType: 'kihon', round: [180, 60], roundIni: [120, 60],
    presets: [{ id: 'kwkf', n: 'Kumite 3 min', rounds: 3, work: 180, rest: 60 }, { id: 'k4x2', n: 'Kumite 4×2', rounds: 4, work: 120, rest: 60 }, { id: 'kkihon', n: 'Kihon 6×2', rounds: 6, work: 120, rest: 45 }],
    combos: KA_COMBOS, themes: KA_THEMES,
    weak: [
      { id: 'ka_speed', fix: ['No kumite, quem chega primeiro pontua: técnica curta e explosiva vence força.', 'Pliometria e saltos 2x/semana, sempre descansado.'], ev: ['karate-perfil', 'soco'] },
      { id: 'ka_dist', fix: ['Distância é tudo no kumite: fique um passo fora e entre com deslize.', 'Treine entrar e sair sem cruzar os pés até virar automático.'], ev: ['karate-perfil'] },
      { id: 'ka_kick', fix: ['Chute alto depende de mobilidade de quadril e força do glúteo médio.', 'Chute lento segurando no alto treina equilíbrio e amplitude.'], ev: ['karate-perfil', 'forca-lesao'] },
      { id: 'ka_counter', fix: ['Contra-ataque (deai/go no sen) é tempo, não velocidade: reaja ao começo do movimento dele.', 'Defesa e contra-ataque no mesmo movimento, sem pausa.'], ev: ['karate-perfil'] },
      { id: 'ka_kata', fix: ['Bases firmes vêm de perna forte: agachamento e afundo.', 'Kata devagar primeiro, depois no ritmo: precisão antes de velocidade.'], ev: ['karate-perfil'] },
      { id: 'ka_gas', fix: ['Kumite é intermitente: explosões curtas com pausas. Treine assim: 10–15 s forte, 20–30 s leve.', 'Base aeróbia 2x/semana acelera a recuperação entre as trocas.'], ev: ['karate-perfil', 'carb-combate'] }
    ],
    plan: ({ saco, weak }) => ({
      warm: ['aquec', 'corda'],
      tech: [...(weak.includes('ka_dist') ? ['ka_ashi'] : []), ...(weak.includes('ka_counter') ? ['ka_contra'] : []), ...(weak.includes('ka_kick') ? ['ka_keri'] : []), 'ka_zuki', 'ka_keri', 'ka_ashi', 'ka_contra', 'ka_uke'],
      hard: [...(saco ? ['ka_saco'] : []), 'ka_kumite', ...(weak.includes('ka_kata') ? ['ka_kata'] : []), 'ka_kumite'],
      tail: [...(weak.includes('ka_gas') ? ['final'] : []), 'core']
    }),
    sc: [['pogo', 3, 15, 20], ['adductor', 2, 15, 30]], ev: ['karate-perfil', 'concorrente', 'forca-lesao', 'corte-peso'],
    week: [['Seg', 'Kihon + força (superior)'], ['Ter', 'Força (inferior + potência)'], ['Qua', 'Kumite'], ['Qui', 'Kata + mobilidade'], ['Sex', 'Kumite / condicionamento'], ['Sáb', 'Aeróbio leve'], ['Dom', 'Descanso']]
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

// ---------- Objetivos na luta: cada um vira drills (com animação quando existe) e, no treino de força
// (objetivo "Força pra luta"), exercícios que constroem a qualidade física por trás ----------
// drill: { n, dose, how, tech?: id da técnica animada, ex?: exercício com demonstração }; lift: [vaga, séries, reps min, reps máx]
const D = (n, dose, how, link = {}) => ({ n, dose, how, ...link });
const GOALX = {
  // boxe
  gas: { n: 'Mais gás nos rounds', drills: [D('Saco 30/30', '4–6 × 3 min', '30 s soltando muito volume, 30 s em ritmo moderado, sem parar de se mexer.'), D('Corda', '3 × 3 min', 'Ritmo constante; no último minuto, acelera.')] },
  power: { n: 'Soco mais forte', drills: [D('Saco: um soco por vez', '5 × 6 por mão', 'Reseta a base a cada soco: gira o pé, o quadril e solta com tudo. 1 min de descanso.', { tech: 'direto' }), D('Arremesso rotacional de medicine ball', '4 × 4 por lado', 'Na parede, girando como no cruzado, na máxima velocidade. Sempre descansado.', { ex: 'mbr' })], lift: [['power_r', 3, 4, 5]] },
  speed: { n: 'Mais velocidade de mão', drills: [D('Sombra de velocidade', '6 × 20 s', 'O mais rápido possível sem perder a técnica; 40 s leve entre as séries. A mão volta pra guarda tão rápido quanto saiu.', { tech: 'jab' }), D('Rounds de reação', '3 × 2 min', 'Use o gerador com combinações faladas: soltou a voz, soltou o golpe. Treina o tempo de reação.'), D('Flexão pliométrica', '3 × 5', 'Desce controlado e empurra o chão com tudo.', { ex: 'plyopush' })], lift: [['power_p', 3, 4, 6]] },
  legs: { n: 'Footwork mais leve', drills: [D('Corda com variações', '3 × 3 min', 'Pés alternados, lado a lado e frente-trás. Leve, na ponta dos pés.'), D('Sombra só de pernas', '3 × 2 min', 'Entra e sai, passo lateral e pivô, sem cruzar os pés e sem as mãos saírem da guarda.', { tech: 'pivo' }), D('Saltos curtos (pogo)', '3 × 20', 'Tornozelo firme, pouco tempo no chão.', { ex: 'pogo' })], lift: [['pogo', 3, 15, 20], ['calf', 2, 12, 15]] },
  def: { n: 'Defesa e esquiva', drills: [D('Sombra defensiva', '3 × 2 min', 'Esquiva, esquiva, pêndulo e devolve um 1-2. Olho sempre no alvo.', { tech: 'esquiva' }), D('Corda esticada na altura do queixo', '3 × 2 min', 'Anda por baixo dela fazendo pêndulo pros dois lados, sempre em guarda.', { tech: 'pendulo' }), D('Bloqueia e devolve', '3 × 2 min', 'Imagina o golpe, bloqueia e contra-ataca na hora. No gerador, escolha os rounds de defesa.', { tech: 'bloqueio' })] },
  guard: { n: 'Guarda que não cai', drills: [D('Rounds de guarda', '3 × 3 min', 'Mãos no rosto o round inteiro: só sai o jab e volta. Ombro cansado, mão continua lá.', { tech: 'bloqueio' })], lift: [['lateral', 3, 12, 20]] },
  chin: { n: 'Pescoço forte e aguentar golpes', drills: [D('Isometria de pescoço', '3 × 20 s cada lado', 'Mão empurra a cabeça, o pescoço segura sem mexer. Leve no começo.', { ex: 'neck' })], lift: [['neck', 2, 15, 30]] },
  weight: { n: 'Descer de categoria' },
  // muay thai
  mt_gas: { n: 'Mais gás nos rounds', drills: [D('Saco: rounds de chute', '5 × 3 min', 'Alterna 30 s de chutes seguidos com 30 s de socos leves, sem parar.', { tech: 'chute' }), D('Corda', '3 × 3 min', 'Ritmo constante, leve na ponta dos pés.')] },
  mt_kick: { n: 'Chute mais forte e equilibrado', drills: [D('Chute lento', '3 × 5 por lado', 'Sobe devagar e segura 2 s no alto, girando o pé de apoio: equilíbrio e mobilidade.', { tech: 'chute' }), D('Saco: potência', '5 × 5 por lado', 'Um chute por vez, com tudo, resetando a base.', { tech: 'chute' }), D('Equilíbrio em uma perna', '3 × 30 s', 'Joelho levemente dobrado; fica fácil, fecha os olhos.', { ex: 'balance' })], lift: [['power_r', 3, 4, 5], ['lunge', 3, 6, 8]] },
  mt_clinch: { n: 'Ganhar no clinch', drills: [D('Saco: joelhadas no clinch', '4 × 2 min', 'Mãos atrás da "nuca" do saco, joelhada reta e diagonal, quadril pra frente.', { tech: 'joelhadadiag' }), D('Isometria de pescoço', '3 × 20 s cada lado', 'Postura alta no clinch depende do pescoço.', { ex: 'neck' })], lift: [['hpull', 3, 6, 10], ['neck', 2, 15, 30]] },
  mt_foot: { n: 'Distância e footwork', drills: [D('Teep de controle', '3 × 2 min', 'Teep da frente e de trás sempre que o "adversário" entra; volta pra base logo.', { tech: 'teep' }), D('Entra, sai e troca de base', '3 × 2 min', 'Sombra só de pernas, com uma troca de base a cada 3 movimentos.', { tech: 'chuteesq' }), D('Corda', '3 × 3 min', 'Leve, na ponta dos pés.')], lift: [['pogo', 3, 15, 20]] },
  mt_def: { n: 'Defesa de chute', drills: [D('Checar o chute', '3 × 2 min', 'Levanta a canela na hora do chute baixo e devolve com 2 ou chute.', { tech: 'checar' }), D('Bloqueia o alto e devolve', '3 × 2 min', 'Braço colado na cabeça, absorve e devolve na hora.', { tech: 'bloqueio' })] },
  mt_shin: { n: 'Canela e pé doloridos' },
  mt_groin: { n: 'Virilha protegida', drills: [D('Prancha de Copenhague', '2 × 20–30 s cada lado', 'Fortalece o adutor, que mais sofre nos chutes.', { ex: 'copen' })], lift: [['adductor', 2, 15, 30]] },
  // karatê
  ka_speed: { n: 'Velocidade e explosão', drills: [D('Kizami e gyaku de velocidade', '6 × 15 s', 'O mais rápido possível com técnica, 45 s leve entre as séries.', { tech: 'kizami' }), D('Saltos curtos (pogo)', '3 × 20', 'Pouco tempo no chão, como na movimentação.', { ex: 'pogo' }), D('Salto vertical', '4 × 3', 'Máxima intenção, aterrissa macio.', { ex: 'jump' })], lift: [['power_l', 3, 3, 5]] },
  ka_dist: { n: 'Distância e movimentação', drills: [D('Deslize (tsugi-ashi)', '4 × 1 min', 'Entra e sai sem cruzar os pés, a base não muda.', { tech: 'tsugiashi' }), D('Entra, pontua e sai', '4 × 1 min', 'Desliza, kizami ou gyaku, e volta pra fora da distância na hora.', { tech: 'kizami' })], lift: [['pogo', 3, 15, 20]] },
  ka_kick: { n: 'Chutes mais altos', drills: [D('Mawashi lento', '3 × 5 por lado', 'Sobe devagar e segura 2 s na altura da cabeça.', { tech: 'mawashigeri' }), D('Flexor do quadril e adutor', '2 × 30 s cada lado', 'Mobilidade pra chutar alto sem puxar a virilha.', { ex: 'hipflex' }), D('Caminhada lateral com elástico', '2 × 10 cada lado', 'Glúteo médio estabiliza a perna de apoio.', { ex: 'latwalk' })], lift: [['adductor', 2, 15, 30]] },
  ka_counter: { n: 'Contra-ataque', drills: [D('Defesa e gyaku', '4 × 1 min', 'Age-uke ou gedan-barai e o gyaku sai no mesmo movimento.', { tech: 'ageuke' }), D('Rounds de reação', '3 × 2 min', 'No gerador, tema contra-ataque: reage à voz.', { tech: 'gyaku' })] },
  ka_kata: { n: 'Kata e bases firmes', drills: [D('Kata devagar', '3 ×', 'Cada base bem marcada e cada golpe com kime no fim.'), D('Afundo búlgaro', '3 × 8 cada perna', 'Força unilateral pra bases baixas e estáveis.', { ex: 'bul' })], lift: [['lunge', 3, 6, 10]] },
  ka_gas: { n: 'Mais gás no kumite', drills: [D('Intervalado de kumite', '8 × (15 s forte / 30 s leve)', 'Explosões de entrada e saída, como na luta.', { tech: 'tsugiashi' })] },
  // jiu-jitsu
  jj_grip: { n: 'Pegada que não acaba', drills: [D('Pendurado na toalha', '3 × 20–40 s', 'Duas toalhas na barra, pegada de kimono.', { ex: 'towelgrip' }), D('Caminhada do fazendeiro', '3 × 30–40 m', 'Peso pesado, pegada firme, postura alta.', { ex: 'farm' })], lift: [['grip', 3, 20, 40]] },
  jj_gas: { n: 'Mais gás no rola', drills: [D('Drills em circuito', '5 × 1 min', 'Fuga de quadril, ponte e sprawl sem parar; 30 s de descanso.', { tech: 'fuga' })] },
  jj_guard: { n: 'Guarda difícil de passar', drills: [D('Fuga de quadril', '4 × a sala', 'Pros dois lados, ombro no chão e quadril longe.', { tech: 'fuga' }), D('Ponte (upa)', '3 × 10', 'Quadril alto e gira por cima do ombro.', { tech: 'ponte' }), D('Quebra de postura', '3 × 8', 'Puxa com os joelhos e as mãos na guarda fechada.', { tech: 'quebrapostura' })] },
  jj_td: { n: 'Quedas e defesa de queda', drills: [D('Sprawl', '5 × 5', 'Tira as pernas pra trás e cai com o quadril no chão; levanta rápido.', { tech: 'sprawl' }), D('Entrada de double leg', '4 × 5', 'Troca de nível com as pernas e entra fundo, sem olhar pro chão.', { tech: 'double' })], lift: [['power_l', 3, 3, 5]] },
  jj_bottom: { n: 'Sair de baixo', drills: [D('Upa', '3 × 8 cada lado', 'Prende o braço e a perna do mesmo lado, ponte e gira.', { tech: 'upa' }), D('Levantada técnica', '3 × 8 cada lado', 'Mão de trás no chão, a perna passa por baixo e você volta em base.', { tech: 'levantada' })] },
  jj_sub: { n: 'Finalizar mais', drills: [D('Triângulo', '3 × 5 cada lado', 'Com parceiro e devagar: um braço dentro, outro fora, fecha o 4.', { tech: 'triangulo' }), D('Armlock da guarda', '3 × 5 cada lado', 'Ângulo primeiro, depois a perna por cima da cabeça.', { tech: 'armlock' }), D('Kimura', '3 × 5 cada lado', 'Espera a mão dele no chão e gira devagar.', { tech: 'kimura' }), D('Mata-leão', '3 × 5', 'Das costas, com os ganchos. Bateu, soltou.', { tech: 'mataleao' })] },
  jj_neck: { n: 'Pescoço e lombar protegidos', drills: [D('Isometria de pescoço', '3 × 20 s cada lado', 'Sem mexer, leve no começo.', { ex: 'neck' }), D('Perdigueiro (bird dog)', '2 × 8 cada lado', 'Coluna parada enquanto braço e perna esticam.', { ex: 'birddog' })], lift: [['neck', 2, 15, 30], ['lowback', 2, 10, 15]] }
};
const NEWW = {
  boxe: [{ id: 'speed', fix: ['Velocidade de mão vem de técnica relaxada + potência: ombro solto, soco volta tão rápido quanto saiu.', 'Treino de potência (medicine ball, flexão pliométrica) sempre descansado, no começo do treino.'], ev: ['soco'] },
    { id: 'def', fix: ['Defesa é hábito: todo round de sombra com uma esquiva ou pêndulo depois de cada combinação.', 'Queixo baixo e olho no peito do adversário.'], ev: ['soco'] }],
  muaythai: [{ id: 'mt_foot', fix: ['Quem controla a distância controla a luta: teep e passo pra trás valem pontos e poupam pancada.', 'Corda e pliometria leve deixam as pernas mais rápidas.'], ev: ['mt-energia'] },
    { id: 'mt_def', fix: ['Checar dói menos que levar o chute baixo na coxa: treine dos dois lados.', 'Sempre devolva: defesa sem contra-ataque só adia o próximo chute.'], ev: ['mt-lesao'] }],
  jiu: [{ id: 'jj_td', fix: ['Luta em pé decide quem fica por cima: sprawl e entrada de queda toda semana.', 'Potência de perna (saltos) ajuda a entrar e a defender.'], ev: ['jj-perfil'] },
    { id: 'jj_bottom', fix: ['Saída de baixo é movimento: upa e fuga de quadril até virar automático.', 'Respire e proteja o pescoço antes de tentar sair.'], ev: ['jj-perfil'] },
    { id: 'jj_sub', fix: ['Finalização sai da posição: controle primeiro, ataque depois.', 'Triângulo, armlock e kimura saem da mesma guarda: encadeie um no outro.'], ev: ['jj-perfil'] }]
};
for (const [sid, list] of Object.entries(NEWW)) for (const w of list) if (!SPORTS[sid].weak.some(x => x.id === w.id)) SPORTS[sid].weak.splice(SPORTS[sid].weak.length - (sid === 'boxe' ? 1 : 0), 0, w);
for (const sp of Object.values(SPORTS)) for (const w of sp.weak || []) if (GOALX[w.id]) Object.assign(w, { ...GOALX[w.id], drills: GOALX[w.id].drills || [], lift: GOALX[w.id].lift || [] });
// vagas extras no treino de força pelos objetivos marcados (no máximo 2 pra não lotar a sessão)
export function goalLifts(weak = []) {
  const out = [];
  for (const sp of Object.values(SPORTS)) for (const w of sp.weak || []) if (weak.includes(w.id)) for (const l of w.lift || []) if (!out.some(x => x[0] === l[0])) out.push(l);
  return out.slice(0, 2);
}
// o que a pessoa faz no treino (pode ser mais de um): lista válida e MET médio pro gasto
export function typesOf(id, s) { const T = SPORTS[id]?.types || {}, a = (Array.isArray(s?.types) ? s.types : [s?.type]).filter(k => typeof k === 'string' && T[k]); return a.length ? [...new Set(a)] : [SPORTS[id]?.defaultType].filter(Boolean); }
export const metOf = (id, types) => { const T = SPORTS[id]?.types || {}, m = types.map(k => T[k]?.met).filter(Boolean); return m.length ? m.reduce((a, b) => a + b, 0) / m.length : 5; };
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
