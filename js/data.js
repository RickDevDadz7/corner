// ============================================================
// CORNER — base de conhecimento (evidência, exercícios, alimentos)
// Cada recomendação traz fonte e nível de evidência:
//   A = meta-análises / position stands consistentes
//   B = revisões + ensaios com algumas limitações
//   C = dados observacionais, de outra população ou prática de campo
// ============================================================

export const MUSCLES = {
  peito: 'Peito', costas: 'Costas', ombros: 'Ombros', biceps: 'Bíceps', triceps: 'Tríceps',
  quad: 'Quadríceps', post: 'Posteriores', glut: 'Glúteos', pant: 'Panturrilha', core: 'Core', pescoco: 'Pescoço'
};
export const MAJOR = ['peito', 'costas', 'ombros', 'quad', 'post', 'glut'];

export const EVIDENCE = [
  {
    id: 'prot-total', cat: 'Nutrição', tags: ['proteina', 'proteína', 'massa', 'hipertrofia', 'comer'],
    title: 'Quanto de proteína por dia',
    do: 'Mire em 1,6 g/kg/dia. Até ~2,2 g/kg é a margem de segurança pra quem quer garantir.',
    why: 'Meta-análise com 49 ensaios: o ganho de massa magra com proteína extra praticamente estabiliza perto de 1,6 g/kg/dia; o limite superior do intervalo de confiança fica em ~2,2 g/kg.',
    level: 'A',
    refs: ['Morton RW et al. (2018) Br J Sports Med 52:376–384', 'Jäger R et al. (2017) ISSN Position Stand: Protein and Exercise. J Int Soc Sports Nutr 14:20']
  },
  {
    id: 'prot-cut', cat: 'Nutrição', tags: ['proteina', 'cutting', 'deficit', 'secar', 'emagrecer'],
    title: 'Proteína quando está secando',
    do: 'No déficit, suba pra 2,3–3,1 g por kg de massa magra (quanto mais magro e maior o déficit, mais pro topo).',
    why: 'Em atletas magros em déficit, proteína alta ajuda a preservar massa magra. A faixa vem de revisão focada em preparação física com restrição calórica.',
    level: 'B',
    refs: ['Helms ER, Aragon AA, Fitschen PJ (2014) J Int Soc Sports Nutr 11:20']
  },
  {
    id: 'prot-dist', cat: 'Nutrição', tags: ['proteina', 'refeicao', 'refeição', 'horario', 'timing'],
    title: 'Distribuição ao longo do dia',
    do: 'Divida a proteína em 3–5 refeições de ~0,25–0,4 g/kg cada, a cada 3–4 h. Uma refeição com proteína depois do treino é um bom hábito, mas o total do dia pesa mais.',
    why: 'Position stand da ISSN: doses por refeição nessa faixa maximizam a síntese proteica; o total diário continua sendo o fator principal.',
    level: 'B',
    refs: ['Jäger R et al. (2017) J Int Soc Sports Nutr 14:20', 'Kerksick CM et al. (2017) ISSN Position Stand: Nutrient Timing. J Int Soc Sports Nutr 14:33']
  },
  {
    id: 'carb-combate', cat: 'Nutrição', tags: ['carboidrato', 'carbo', 'energia', 'cansaco', 'cansaço', 'cansei', 'cansando', 'round', 'rounds', 'folego', 'fôlego', 'antes', 'sparring', 'comer'],
    title: 'Carboidrato pra quem luta',
    do: 'Treino moderado (~1 h/dia): 5–7 g/kg. Dias leves: 3–5 g/kg. Dias pesados de boxe + musculação: pode passar de 6 g/kg.',
    why: 'Rounds intensos dependem muito de glicogênio. A posição conjunta ACSM/AND/Dietitians of Canada escala o carboidrato pela carga de treino.',
    level: 'A',
    refs: ['Thomas DT, Erdman KA, Burke LM (2016) Nutrition and Athletic Performance. Med Sci Sports Exerc 48(3):543–568']
  },
  {
    id: 'tmb', cat: 'Gasto calórico', tags: ['tmb', 'basal', 'metabolismo', 'gasto', 'calorias', 'tdee'],
    title: 'Como estimar seu metabolismo basal',
    do: 'O app usa Mifflin-St Jeor. Se você informar % de gordura, usa Katch-McArdle (baseada em massa magra). Depois, ajusta pelo seu peso real.',
    why: 'Em comparação de equações preditivas, a Mifflin-St Jeor foi a mais precisa em adultos. Mesmo assim, toda equação erra ±10% em indivíduos: por isso o ajuste adaptativo com seus dados reais é o que manda.',
    level: 'A',
    refs: ['Mifflin MD et al. (1990) Am J Clin Nutr 51:241–247', 'Frankenfield D et al. (2005) J Am Diet Assoc 105:775–789']
  },
  {
    id: 'met', cat: 'Gasto calórico', tags: ['gasto', 'boxe', 'sparring', 'saco', 'calorias', 'met'],
    title: 'Gasto do treino (METs)',
    do: 'Saco ≈ 5,5 MET · sparring ≈ 7,8 MET · luta/ringue ≈ 12,8 MET · circuito vigoroso ≈ 8 MET · musculação ≈ 3,5–6 MET.',
    why: 'Valores do Compêndio de Atividades Físicas. É estimativa de população, não medida individual. O app soma só o gasto acima do repouso pra não contar duas vezes.',
    level: 'B',
    refs: ['Ainsworth BE et al. (2011) Compendium of Physical Activities. Med Sci Sports Exerc 43(8):1575–1581']
  },
  {
    id: 'ritmo-perda', cat: 'Composição corporal', tags: ['secar', 'emagrecer', 'deficit', 'cutting', 'perder', 'peso'],
    title: 'Ritmo ideal pra secar',
    do: 'Perca 0,5–1% do peso por semana. Mais magro = mais perto de 0,5%.',
    why: 'Ritmos mais lentos preservam melhor massa magra e desempenho em atletas. Ritmos agressivos aumentam perda de músculo e queda de rendimento.',
    level: 'B',
    refs: ['Helms ER, Aragon AA, Fitschen PJ (2014) J Int Soc Sports Nutr 11:20']
  },
  {
    id: 'volume', cat: 'Musculação', tags: ['volume', 'series', 'séries', 'hipertrofia', 'treino', 'quantas'],
    title: 'Quantas séries por semana',
    do: 'Comece com 10–12 séries semanais por músculo e suba até ~20 se estiver recuperando bem. Séries indiretas (ex.: tríceps no supino) contam como meia série.',
    why: 'Meta-análise mostrou relação dose-resposta: ≥10 séries/semana gera mais hipertrofia que menos. Meta-regressões mais recentes sugerem ganhos com retorno decrescente em volumes altos e validam a contagem fracionada.',
    level: 'A',
    refs: ['Schoenfeld BJ, Ogborn D, Krieger JW (2017) J Sports Sci 35(11):1073–1082', 'Pelland JC et al. (2024) SportRxiv — pré-print, ainda sem revisão por pares']
  },
  {
    id: 'freq', cat: 'Musculação', tags: ['frequencia', 'frequência', 'vezes', 'semana', 'full body', 'divisao'],
    title: 'Frequência de treino',
    do: 'Treine cada músculo pelo menos 2x por semana. Com volume igual, a divisão importa pouco: escolha a que cabe na sua rotina de boxe.',
    why: 'Meta-análise: 2x/semana superou 1x/semana para hipertrofia; com volume equalizado as diferenças ficam pequenas.',
    level: 'A',
    refs: ['Schoenfeld BJ, Ogborn D, Krieger JW (2016) Sports Med 46(11):1689–1697']
  },
  {
    id: 'carga', cat: 'Musculação', tags: ['carga', 'peso', 'leve', 'pesado', 'repeticoes', 'repetições'],
    title: 'Carga leve ou pesada?',
    do: 'Pra hipertrofia, de ~6 a 30 repetições funciona se você chegar perto da falha. Pra força máxima, inclua trabalho pesado (≤6–8 reps).',
    why: 'Meta-análise: cargas baixas e altas produziram hipertrofia semelhante; ganhos de força máxima foram maiores com cargas altas.',
    level: 'A',
    refs: ['Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW (2017) J Strength Cond Res 31(12):3508–3523']
  },
  {
    id: 'falha', cat: 'Musculação', tags: ['falha', 'rir', 'intensidade', 'esforco', 'esforço'],
    title: 'Precisa ir até a falha?',
    do: 'Não. Termine as séries com 0–3 repetições na reserva (RIR). Ir à falha toda série aumenta a fadiga, e você ainda tem que lutar.',
    why: 'Treinar até a falha não foi superior a parar perto dela para hipertrofia. Meta-regressões mostram que a hipertrofia melhora conforme se aproxima da falha, mas a força quase não depende disso.',
    level: 'A',
    refs: ['Refalo MC et al. (2023) Sports Med 53(3):649–665', 'Robinson ZP et al. (2024) Sports Med — meta-regressões de RIR']
  },
  {
    id: 'descanso', cat: 'Musculação', tags: ['descanso', 'intervalo', 'pausa'],
    title: 'Descanso entre séries',
    do: 'Exercícios compostos: 2–3 min. Isolados: 1–2 min. Na pressa, use superséries de músculos antagonistas.',
    why: 'Em homens treinados, 3 min de intervalo gerou mais força e hipertrofia que 1 min, com o mesmo protocolo.',
    level: 'B',
    refs: ['Schoenfeld BJ et al. (2016) J Strength Cond Res 30(7):1805–1812']
  },
  {
    id: 'progressao', cat: 'Musculação', tags: ['progressao', 'progressão', 'evoluir', 'estagnado', 'platô', 'plato', 'supino', 'travado'],
    title: 'Como progredir (dupla progressão)',
    do: 'Escolha uma faixa (ex.: 6–10). Quando bater o topo em todas as séries, suba a carga e volte pro início da faixa. O app sugere isso automaticamente.',
    why: 'Sobrecarga progressiva é o princípio central dos modelos de progressão do ACSM.',
    level: 'A',
    refs: ['ACSM (2009) Progression Models in Resistance Training for Healthy Adults. Med Sci Sports Exerc 41(3):687–708']
  },
  {
    id: 'concorrente', cat: 'Boxe', tags: ['boxe', 'concorrente', 'interferencia', 'cardio', 'mesmo dia', 'ordem', 'perna', 'cansei', 'round', 'rounds'],
    title: 'Boxe + musculação no mesmo plano',
    do: 'Se der, separe as sessões por 6 h ou mais. No mesmo horário, faça a técnica de boxe primeiro (precisa de você descansado). Evite perna pesada na véspera de sparring.',
    why: 'Meta-análise de treino concorrente: a interferência aparece mais em potência e hipertrofia de membros inferiores e cresce com o volume e a frequência do aeróbio.',
    level: 'B',
    refs: ['Wilson JM et al. (2012) J Strength Cond Res 26(8):2293–2307']
  },
  {
    id: 'soco', cat: 'Boxe', tags: ['soco', 'potencia', 'potência', 'forca', 'força', 'pancada', 'knockout'],
    title: 'De onde vem a força do soco',
    do: 'Treine força e potência de pernas (agachamento, saltos), transferência pelo tronco (arremessos rotacionais de medicine ball, landmine) e só então braço.',
    why: 'Revisão sobre força de soco: força de reação do solo e a cadeia perna → quadril → tronco são contribuintes centrais. É por isso que o soco nasce no pé.',
    level: 'B',
    refs: ['Lenetsky S, Harris N, Brughelli M (2013) Strength Cond J 35(2):1–7']
  },
  {
    id: 'pescoco', cat: 'Boxe', tags: ['pescoco', 'pescoço', 'concussao', 'concussão', 'cabeca', 'queixo'],
    title: 'Fortalecer o pescoço',
    do: 'Isometrias de pescoço (frente, trás, laterais), 2–3x/semana, 2–3 séries de 15–30 s. Progrida devagar.',
    why: 'Em atletas escolares de vários esportes, mais força cervical se associou a menor risco de concussão. É evidência observacional e de outra população, mas é barato e de baixo risco.',
    level: 'C',
    refs: ['Collins CL et al. (2014) J Prim Prev 35(5):309–319']
  },
  {
    id: 'corte-peso', cat: 'Boxe', tags: ['corte', 'peso', 'categoria', 'pesagem', 'desidratacao', 'desidratação'],
    title: 'Corte de peso pra pesagem',
    do: 'Chegue perto da categoria com déficit gradual. Evite cortes agudos grandes por desidratação. Se precisar de corte, faça com acompanhamento profissional.',
    why: 'Revisão em esportes de combate: perda aguda de peso tem limites, prejudica desempenho se a recuperação até a luta for curta e envolve riscos de saúde.',
    level: 'B',
    refs: ['Reale R, Slater G, Burke LM (2017) Int J Sports Physiol Perform 12(2):142–151']
  },
  {
    id: 'hidratacao', cat: 'Recuperação', tags: ['agua', 'água', 'hidratacao', 'hidratação', 'suor', 'beber'],
    title: 'Hidratação no treino',
    do: 'Não perca mais de ~2% do peso em suor numa sessão. Pese antes e depois: cada 1 kg perdido ≈ 1–1,5 L a repor.',
    why: 'Position stand do ACSM: déficits acima de ~2% do peso corporal prejudicam desempenho aeróbio e cognitivo.',
    level: 'A',
    refs: ['Sawka MN et al. (2007) ACSM Position Stand: Exercise and Fluid Replacement. Med Sci Sports Exerc 39(2):377–390']
  },
  {
    id: 'sono', cat: 'Recuperação', tags: ['sono', 'dormir', 'recuperacao', 'recuperação', 'cansaco'],
    title: 'Sono é treino',
    do: 'Mire em 7–9 h. Horário regular, quarto escuro e sem tela na última hora ajudam.',
    why: 'Revisão: privação de sono piora desempenho, tempo de reação e recuperação, além de mexer com fome e humor.',
    level: 'B',
    refs: ['Fullagar HH et al. (2015) Sports Med 45(2):161–186']
  },
  {
    id: 'creatina', cat: 'Suplementos', tags: ['creatina', 'suplemento', 'suplementos'],
    title: 'Creatina',
    do: 'Creatina monohidratada 3–5 g/dia, todo dia, em qualquer horário. Pode subir 1–2 kg de água no músculo (atenção se estiver perto do limite da categoria).',
    why: 'Position stand da ISSN: o suplemento com mais evidência pra força e massa magra, com bom perfil de segurança em pessoas saudáveis.',
    level: 'A',
    refs: ['Kreider RB et al. (2017) J Int Soc Sports Nutr 14:18']
  },
  {
    id: 'cafeina', cat: 'Suplementos', tags: ['cafeina', 'cafeína', 'cafe', 'café', 'pre treino', 'pré-treino'],
    title: 'Cafeína',
    do: '3–6 mg/kg cerca de 60 min antes do treino. Evite no fim do dia: atrapalha o sono, que vale mais.',
    why: 'Position stand da ISSN: melhora consistente em desempenho de força, potência e resistência. A resposta varia bastante entre pessoas.',
    level: 'A',
    refs: ['Guest NS et al. (2021) J Int Soc Sports Nutr 18:1']
  }
];

// Exercícios: m = músculos (1 = direto, 0,5 = indireto), inc = incremento de carga sugerido (kg)
export const EXERCISES = {
  jump:  { n: 'Salto vertical / na caixa', m: {}, t: 'power', inc: 0, cue: 'Máxima intenção. Aterrisse macio. Descanse 1–2 min. Potência que vai pro soco.' },
  mbr:   { n: 'Arremesso rotacional de medicine ball', m: { core: 1 }, t: 'power', inc: 0, cue: 'Gire o quadril antes dos ombros, como num cruzado. Cada lado.' },
  mbc:   { n: 'Arremesso de peito com medicine ball', m: {}, t: 'power', inc: 0, cue: 'Explosivo, como um direto com os dois braços.' },
  sq:    { n: 'Agachamento livre', m: { quad: 1, glut: 0.5 }, t: 'comp', inc: 5, cue: 'Base firme, tronco travado. Profundidade que você controla.' },
  rdl:   { n: 'Levantamento terra romeno', m: { post: 1, glut: 1 }, t: 'comp', inc: 5, cue: 'Quadril pra trás, coluna neutra, barra colada na perna.' },
  bul:   { n: 'Agachamento búlgaro', m: { quad: 1, glut: 1 }, t: 'comp', inc: 2, cue: 'Unilateral: equilíbrio e base de luta. Cada perna.' },
  lp:    { n: 'Leg press', m: { quad: 1, glut: 0.5 }, t: 'comp', inc: 10, cue: 'Amplitude completa sem tirar a lombar do banco.' },
  ht:    { n: 'Hip thrust', m: { glut: 1, post: 0.5 }, t: 'comp', inc: 5, cue: 'Extensão de quadril: o mesmo motor do soco de trás.' },
  lc:    { n: 'Mesa flexora', m: { post: 1 }, t: 'iso', inc: 2.5, cue: 'Controle a descida em 2–3 s.' },
  calf:  { n: 'Panturrilha em pé', m: { pant: 1 }, t: 'iso', inc: 5, cue: 'Pausa embaixo. Panturrilha forte = footwork que aguenta.' },
  bp:    { n: 'Supino reto', m: { peito: 1, triceps: 0.5, ombros: 0.5 }, t: 'comp', inc: 2.5, cue: 'Escápulas travadas, pés firmes.' },
  dbi:   { n: 'Supino inclinado com halteres', m: { peito: 1, ombros: 0.5, triceps: 0.5 }, t: 'comp', inc: 2, cue: 'Inclinação de 30°. Desça até alongar bem.' },
  dip:   { n: 'Paralelas', m: { peito: 1, triceps: 0.5 }, t: 'comp', inc: 2.5, cue: 'Tronco levemente à frente. Sem dor no ombro.' },
  ohp:   { n: 'Desenvolvimento em pé', m: { ombros: 1, triceps: 0.5 }, t: 'comp', inc: 2.5, cue: 'Glúteo e abdômen contraídos. Ombro forte segura a guarda.' },
  pu:    { n: 'Barra fixa / puxada', m: { costas: 1, biceps: 0.5 }, t: 'comp', inc: 2.5, cue: 'Peito em direção à barra, sem balanço.' },
  row:   { n: 'Remada curvada', m: { costas: 1, biceps: 0.5 }, t: 'comp', inc: 2.5, cue: 'Tronco firme. Puxe com o cotovelo.' },
  dbrow: { n: 'Remada unilateral', m: { costas: 1, biceps: 0.5 }, t: 'comp', inc: 2, cue: 'Leve rotação no fim: costas e anti-rotação.' },
  fp:    { n: 'Face pull', m: { ombros: 1, costas: 0.5 }, t: 'iso', inc: 2.5, cue: 'Ombro posterior: equilibra o volume de socos.' },
  lat:   { n: 'Elevação lateral', m: { ombros: 1 }, t: 'iso', inc: 1, cue: 'Até a linha do ombro, sem roubar.' },
  curl:  { n: 'Rosca direta', m: { biceps: 1 }, t: 'iso', inc: 1, cue: 'Cotovelo parado.' },
  ham:   { n: 'Rosca martelo', m: { biceps: 1 }, t: 'iso', inc: 1, cue: 'Pegada neutra: fortalece antebraço e punho.' },
  tri:   { n: 'Tríceps na polia', m: { triceps: 1 }, t: 'iso', inc: 2.5, cue: 'Extensão completa: é ela que termina o direto.' },
  pal:   { n: 'Pallof press', m: { core: 1 }, t: 'core', inc: 0, u: '/lado', cue: 'Anti-rotação: tronco que não gira quando você toma o golpe.' },
  lmr:   { n: 'Rotação com landmine', m: { core: 1 }, t: 'core', inc: 0, u: '/lado', cue: 'Pé gira, quadril leva, braço só acompanha.' },
  farm:  { n: 'Caminhada do fazendeiro', m: { core: 1 }, t: 'core', inc: 0, u: 'm', cue: 'Pegada e tronco. 20–30 m por série.' },
  neck:  { n: 'Isometria de pescoço (4 direções)', m: { pescoco: 1 }, t: 'prehab', inc: 0, u: 's', cue: 'Mão empurra, pescoço não se mexe. 15–30 s por direção.' },
  er:    { n: 'Rotação externa com elástico', m: {}, t: 'prehab', inc: 0, cue: 'Manguito rotador: seguro de vida do ombro do lutador.' }
};

// Modelos de treino: [exercício, séries, repsMin, repsMax]
export const TEMPLATES = {
  A:  { name: 'Full body A', list: [['jump', 3, 3, 5], ['sq', 3, 6, 10], ['bp', 3, 6, 10], ['row', 3, 8, 12], ['dip', 2, 8, 12], ['lc', 3, 10, 15], ['lat', 3, 12, 20], ['pal', 2, 10, 12]] },
  B:  { name: 'Full body B', list: [['mbr', 3, 5, 5], ['rdl', 3, 6, 10], ['ohp', 3, 6, 10], ['pu', 3, 6, 12], ['bul', 2, 8, 12], ['dbi', 2, 8, 12], ['curl', 2, 10, 15], ['tri', 2, 10, 15], ['neck', 2, 15, 30]] },
  C:  { name: 'Full body C', list: [['mbc', 3, 5, 5], ['lp', 3, 10, 15], ['dbi', 3, 8, 12], ['dbrow', 3, 8, 12], ['ht', 2, 8, 12], ['fp', 3, 12, 20], ['lmr', 2, 6, 8], ['er', 2, 15, 20], ['calf', 2, 10, 15]] },
  U1: { name: 'Superior 1', list: [['mbc', 3, 5, 5], ['bp', 4, 6, 10], ['row', 4, 6, 10], ['ohp', 3, 8, 12], ['pu', 3, 8, 12], ['lat', 3, 12, 20], ['tri', 2, 10, 15], ['curl', 2, 10, 15], ['neck', 2, 15, 30]] },
  L1: { name: 'Inferior 1', list: [['jump', 3, 3, 5], ['sq', 4, 6, 10], ['rdl', 3, 6, 10], ['lc', 3, 10, 15], ['calf', 3, 10, 15], ['pal', 3, 10, 12]] },
  U2: { name: 'Superior 2', list: [['mbr', 3, 5, 5], ['dbi', 3, 8, 12], ['pu', 3, 6, 10], ['dip', 3, 8, 12], ['dbrow', 3, 8, 12], ['fp', 3, 15, 20], ['ham', 2, 10, 15], ['er', 2, 15, 20]] },
  L2: { name: 'Inferior 2', list: [['jump', 3, 3, 5], ['ht', 3, 8, 12], ['bul', 3, 8, 12], ['lp', 3, 10, 15], ['lc', 2, 10, 15], ['calf', 3, 10, 15], ['lmr', 3, 6, 8], ['farm', 2, 20, 30]] },
  PU: { name: 'Empurrar', list: [['mbc', 3, 5, 5], ['bp', 4, 6, 10], ['ohp', 3, 6, 10], ['dbi', 3, 8, 12], ['lat', 3, 12, 20], ['tri', 3, 10, 15]] },
  PL: { name: 'Puxar', list: [['mbr', 3, 5, 5], ['pu', 4, 6, 10], ['row', 3, 8, 12], ['dbrow', 3, 8, 12], ['fp', 3, 12, 20], ['curl', 3, 10, 15], ['ham', 2, 10, 15], ['neck', 2, 15, 30]] },
  LG: { name: 'Pernas', list: [['jump', 3, 3, 5], ['sq', 4, 6, 10], ['rdl', 3, 6, 10], ['lp', 3, 10, 15], ['lc', 3, 10, 15], ['calf', 3, 10, 15], ['pal', 3, 10, 12]] }
};

export const SPLITS = {
  2: { name: 'Full body 2x', days: ['A', 'B'] },
  3: { name: 'Full body 3x', days: ['A', 'B', 'C'] },
  4: { name: 'Superior / Inferior', days: ['U1', 'L1', 'U2', 'L2'] },
  5: { name: 'Sup/Inf + Empurrar/Puxar/Pernas', days: ['U1', 'L1', 'PU', 'PL', 'LG'] },
  6: { name: 'Empurrar / Puxar / Pernas 2x', days: ['PU', 'PL', 'LG', 'PU', 'PL', 'LG'] }
};

// Valores aproximados por 100 g (base TACO/USDA). Confira o rótulo.
export const FOODS = [
  { n: 'Arroz branco cozido', k: 128, p: 2.5, c: 28.1, f: 0.2, g: 150 },
  { n: 'Arroz integral cozido', k: 124, p: 2.6, c: 25.8, f: 1.0, g: 150 },
  { n: 'Feijão carioca cozido', k: 76, p: 4.8, c: 13.6, f: 0.5, g: 140 },
  { n: 'Peito de frango grelhado', k: 159, p: 32.0, c: 0, f: 2.5, g: 120 },
  { n: 'Patinho grelhado', k: 219, p: 35.9, c: 0, f: 7.3, g: 120 },
  { n: 'Atum em lata (água)', k: 116, p: 26.0, c: 0, f: 1.0, g: 120 },
  { n: 'Ovo cozido (1 un ≈ 50 g)', k: 146, p: 13.3, c: 0.6, f: 9.5, g: 50 },
  { n: 'Pão francês (1 un ≈ 50 g)', k: 300, p: 8.0, c: 58.6, f: 3.1, g: 50 },
  { n: 'Cuscuz de milho cozido', k: 113, p: 2.2, c: 25.3, f: 0.7, g: 150 },
  { n: 'Macarrão cozido', k: 157, p: 5.8, c: 30.9, f: 0.9, g: 150 },
  { n: 'Batata-doce cozida', k: 77, p: 0.6, c: 18.4, f: 0.1, g: 150 },
  { n: 'Batata inglesa cozida', k: 52, p: 1.2, c: 11.9, f: 0.0, g: 150 },
  { n: 'Aveia em flocos', k: 394, p: 13.9, c: 66.6, f: 8.5, g: 30 },
  { n: 'Banana prata', k: 98, p: 1.3, c: 26.0, f: 0.1, g: 70 },
  { n: 'Maçã', k: 56, p: 0.3, c: 15.2, f: 0.0, g: 130 },
  { n: 'Mamão papaia', k: 40, p: 0.5, c: 10.4, f: 0.1, g: 150 },
  { n: 'Leite integral (ml)', k: 61, p: 3.1, c: 4.7, f: 3.2, g: 200 },
  { n: 'Iogurte natural', k: 51, p: 4.1, c: 1.9, f: 3.0, g: 170 },
  { n: 'Queijo minas frescal', k: 264, p: 17.4, c: 3.2, f: 20.2, g: 30 },
  { n: 'Whey protein (varia por marca)', k: 400, p: 78.0, c: 8.0, f: 6.0, g: 30 },
  { n: 'Pasta de amendoim', k: 588, p: 25.0, c: 20.0, f: 50.0, g: 15 },
  { n: 'Azeite de oliva', k: 884, p: 0, c: 0, f: 100, g: 10 }
];

export const BOX_TYPES = {
  tecnica:  { n: 'Técnica / sombra', met: 4.0 },
  saco:     { n: 'Saco / manopla', met: 5.5 },
  sparring: { n: 'Sparring', met: 7.8 },
  condic:   { n: 'Condicionamento / circuito', met: 8.0 },
  luta:     { n: 'Luta (ringue)', met: 12.8 }
};

export const TIMER_PRESETS = [
  { id: 'amador', n: 'Amador', rounds: 3, work: 180, rest: 60 },
  { id: 'saco', n: 'Saco', rounds: 6, work: 180, rest: 60 },
  { id: 'pro', n: 'Profissional', rounds: 12, work: 180, rest: 60 },
  { id: 'sparring2', n: 'Sparring 2 min', rounds: 5, work: 120, rest: 60 },
  { id: 'hiit', n: 'HIIT 30/30', rounds: 10, work: 30, rest: 30 },
  { id: 'tabata', n: 'Tabata', rounds: 8, work: 20, rest: 10 }
];

// Diagnóstico de boxe: ponto fraco → o que fazer
export const WEAKNESSES = [
  { id: 'gas', n: 'Canso nos últimos rounds', fix: [
      'Intervalados específicos: rounds de 3 min no saco alternando 30 s de volume alto e 30 s moderado.',
      'Base aeróbia: 2x/semana de 30–40 min em ritmo de conversa (corrida leve, bike, corda). Base aeróbia boa acelera a recuperação entre rounds.',
      'Carboidrato suficiente nos dias de sparring (veja a carta "Carboidrato pra quem luta").'
    ], ev: ['carb-combate', 'concorrente'] },
  { id: 'power', n: 'Falta potência no soco', fix: [
      'Arremessos rotacionais e de peito com medicine ball no início do treino, descansado: 3–5 séries de 3–5.',
      'Força de perna e quadril: agachamento, terra romeno, hip thrust.',
      'Saltos com máxima intenção. O soco nasce no chão.'
    ], ev: ['soco', 'carga'] },
  { id: 'guard', n: 'Guarda cai / ombro cansa', fix: [
      'Ombros: desenvolvimento e elevação lateral em séries longas (12–20).',
      'Rounds de sombra segurando halteres de 0,5–1 kg só no fim do treino técnico.',
      'Face pull e rotação externa pra equilibrar o ombro.'
    ], ev: ['volume'] },
  { id: 'legs', n: 'Pernas lentas / footwork pesado', fix: [
      'Corda 3–5 rounds por sessão.',
      'Panturrilha e trabalho unilateral (búlgaro).',
      'Saltos curtos e reativos (pogo jumps) 3x15–20 s.'
    ], ev: ['soco'] },
  { id: 'chin', n: 'Sinto muito os golpes / pescoço', fix: [
      'Isometrias de pescoço 2–3x/semana.',
      'Trabalho defensivo de técnica (é o maior fator protetor).',
      'Sintomas após pancada na cabeça (dor de cabeça, tontura, confusão): pare e procure avaliação médica.'
    ], ev: ['pescoco'] },
  { id: 'weight', n: 'Quero descer de categoria', fix: [
      'Déficit gradual de 0,5–1% do peso por semana, com proteína alta.',
      'Planeje a categoria com semanas de antecedência, sem depender de desidratação.',
      'Se for competir, alinhe o corte com treinador e nutricionista.'
    ], ev: ['corte-peso', 'ritmo-perda', 'prot-cut'] }
];
