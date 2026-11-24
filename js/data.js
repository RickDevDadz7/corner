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
    id: 'forca-lesao', cat: 'Recuperação', tags: ['lesao', 'lesão', 'prevenir', 'dor', 'canela', 'joelho', 'forca', 'força'],
    title: 'Força previne lesão',
    do: 'Duas sessões curtas de força por semana funcionam como seguro contra lesão, em qualquer esporte. Alongamento sozinho não cumpre esse papel.',
    why: 'Meta-análise de ensaios randomizados: o treino de força reduziu lesões esportivas para menos de 1/3 e quase dividiu pela metade as lesões por sobrecarga. Alongamento não mostrou efeito protetor.',
    level: 'A',
    refs: ['Lauersen JB, Bertelsen DM, Andersen LB (2014) Br J Sports Med 48(11):871–877']
  },
  {
    id: 'mt-energia', cat: 'Muay thai', tags: ['muay', 'thai', 'cansaco', 'cansaço', 'gasto', 'aerobio', 'anaerobio'],
    title: 'O que o muay thai exige do corpo',
    do: 'Treine os dois motores: base aeróbia (corrida leve, corda) e rounds intensos com pouco descanso.',
    why: 'Numa simulação de luta, o gasto médio foi de ~10,8 kcal/min (~9,4 METs), com grande participação tanto do metabolismo aeróbio quanto da glicólise anaeróbia. Em lutas reais, o sistema láctico é muito recrutado.',
    level: 'B',
    refs: ['Crisafulli A et al. (2009) Appl Physiol Nutr Metab 34(2):143–150', 'Cappai I et al. (2012) Int J Perform Anal Sport 12(3):507–516']
  },
  {
    id: 'mt-lesao', cat: 'Muay thai', tags: ['muay', 'lesao', 'lesão', 'canela', 'iniciante', 'dor'],
    title: 'Lesões no começo do muay thai',
    do: 'No começo, aumente o volume de chutes e sparring aos poucos. Use caneleira e protetor bucal, e técnica antes de força.',
    why: 'Num levantamento com praticantes, iniciantes relataram taxa anual de lesão bem maior que amadores e profissionais (13,5 contra ~2,4–2,8 por 1000 praticantes). Lesões de tecidos moles foram as mais comuns. É um estudo por questionário.',
    level: 'C',
    refs: ['Gartland S, Malik MH, Lovell ME (2001) Br J Sports Med 35(5):308–313']
  },
  {
    id: 'jj-perfil', cat: 'Jiu-jitsu', tags: ['jiu', 'jitsu', 'bjj', 'pegada', 'grappling', 'força'],
    title: 'O que diferencia no jiu-jitsu',
    do: 'Priorize força máxima, força isométrica (pegada) e resistência de força. O aeróbio é a base, mas não é o diferencial.',
    why: 'Revisão sistemática de 58 estudos: força máxima dinâmica, isométrica e de resistência se associam ao sucesso. A potência aeróbia (~42–52 mL/kg/min) não diferenciou atletas de níveis competitivos diferentes.',
    level: 'B',
    refs: ['Andreato LV et al. (2017) Sports Med Open 3:9']
  },
  {
    id: 'mma-perfil', cat: 'MMA', tags: ['mma', 'forca', 'força', 'potencia', 'potência', 'quedas', 'wrestling'],
    title: 'O que separa níveis no MMA',
    do: 'Força, potência e capacidade anaeróbia separam os níveis. Não troque a força por "só cardio".',
    why: 'Revisão sistemática de MMA e dos esportes que o compõem: várias medidas de força, potência neuromuscular e capacidade anaeróbia distinguiram atletas de nível mais alto. Os perfis diferem entre esportes de agarre e de trocação.',
    level: 'B',
    refs: ['James LP, Haff GG, Kelly VG, Beckman EM (2016) Sports Med 46(10):1525–1551']
  },
  {
    id: 'corrida-8020', cat: 'Corrida', tags: ['corrida', 'correr', 'ritmo', 'leve', 'intervalado', 'cansaco'],
    title: 'A regra do "quase tudo leve"',
    do: 'Faça cerca de 80% das sessões em ritmo leve (dá pra conversar) e cerca de 20% intensas.',
    why: 'Revisão sobre como atletas de endurance bem-sucedidos distribuem a intensidade: a maior parte do volume em baixa intensidade, com uma fração pequena de trabalho intenso.',
    level: 'B',
    refs: ['Seiler S (2010) Int J Sports Physiol Perform 5(3):276–291']
  },
  {
    id: 'corrida-economia', cat: 'Corrida', tags: ['corrida', 'economia', 'pliometria', 'forca', 'força', 'rapido', 'rápido'],
    title: 'Força deixa a corrida mais barata',
    do: 'Inclua força pesada e pliometria 2x/semana: no mesmo ritmo, você gasta menos energia.',
    why: 'Meta-análise com corredores de alto nível: programas de força com pliometria tiveram efeito grande e benéfico na economia de corrida.',
    level: 'A',
    refs: ['Balsalobre-Fernández C, Santos-Concejero J, Grivas GV (2016) J Strength Cond Res 30(8):2361–2368']
  },
  {
    id: 'calistenia', cat: 'Musculação', tags: ['calistenia', 'casa', 'flexao', 'flexão', 'peso corporal', 'sem academia', 'barra'],
    title: 'Calistenia funciona?',
    do: 'Sim. Use progressões (inclinada → chão → pés elevados → arqueiro) pra manter as séries entre ~8 e 20 reps perto da falha. Quando ficar fácil, passe pra variação mais difícil.',
    why: 'Ensaios comparando flexão com supino encontraram ganhos parecidos de força e de espessura muscular quando a carga relativa era equivalente. É coerente com a meta-análise que mostra hipertrofia parecida entre cargas leves e pesadas perto da falha.',
    level: 'B',
    refs: ['Calatayud J et al. (2015) J Strength Cond Res 29(1):246–253', 'Kikuchi N, Nakazato K (2017) J Exerc Sci Fit 15(1):37–42', 'Kotarsky CJ et al. (2018) J Strength Cond Res 32(3):651–659']
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
    id: 'refeicoes', cat: 'Nutrição', tags: ['refeicao', 'refeição', 'ceia', '3 em 3', 'frequencia', 'frequência', 'dormir', 'caseina', 'caseína'],
    title: 'Quantas refeições por dia?',
    do: 'Comer de 3 em 3 horas não é obrigatório: o total do dia é o que manda. Pra músculo, divida a proteína em 4 ou mais refeições de ~0,4 g/kg. Ceia com 30–40 g de proteína (iogurte, leite, cottage) ajuda quem precisa comer muito.',
    why: 'Meta-análise não achou diferença de composição corporal entre comer poucas ou muitas vezes por dia. Já a síntese muscular responde melhor à proteína distribuída, e proteína antes de dormir aumentou ganhos de massa e força em treino de 12 semanas.',
    level: 'B',
    refs: ['Schoenfeld BJ, Aragon AA, Krieger JW (2015) Nutr Rev 73(2):69–82', 'Schoenfeld BJ, Aragon AA (2018) J Int Soc Sports Nutr 15:10', 'Snijders T et al. (2015) J Nutr 145(6):1178–1184']
  },
  {
    id: 'agua-demais', cat: 'Recuperação', tags: ['agua', 'água', 'demais', 'hiponatremia', 'rim', 'rins', 'beber muito'],
    title: 'Água demais também faz mal',
    do: 'Beba ao longo do dia e pela sede. Evite passar de ~1 L por hora. Em treino longo, reponha o que suou (pese antes e depois), não mais que isso.',
    why: 'O rim elimina no máximo cerca de 0,8–1 L de água por hora. Beber mais rápido que isso, ou muito além do que se perde, dilui o sódio do sangue (hiponatremia): dor de cabeça, náusea, confusão e, em casos graves, convulsão. É a principal causa de hiponatremia em provas longas.',
    level: 'A',
    refs: ['Hew-Butler T et al. (2015) Third International Exercise-Associated Hyponatremia Consensus. Clin J Sport Med 25(4):303–320']
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

// Equipamentos. "gym" = academia (tem tudo). Peso corporal está sempre disponível.
export const EQUIP = {
  halteres: 'Halteres', elastico: 'Elásticos', barra: 'Barra fixa', paralelas: 'Paralelas / argolas',
  medball: 'Medicine ball', kettlebell: 'Kettlebell', roda: 'Roda abdominal', saco: 'Saco de pancada', corda: 'Corda de pular'
};

// Exercícios: m = músculos (1 = direto, 0,5 = indireto); req = equipamento necessário;
// inc = incremento de carga (kg); vars = progressões de calistenia (fácil → difícil); r = faixa de reps própria
export const EXERCISES = {
  // Potência
  jump:     { n: 'Salto vertical / na caixa', m: {}, t: 'power', req: [], cue: 'Máxima intenção. Aterrisse macio. O soco nasce no chão.' },
  mbr:      { n: 'Arremesso rotacional de medicine ball', m: { core: 1 }, t: 'power', req: ['medball'], u: '/lado', cue: 'Gire o quadril antes dos ombros, como num cruzado.' },
  shadowx:  { n: 'Sombra explosiva: cruzados máximos', m: { core: 0.5 }, t: 'power', req: [], u: '/lado', cue: 'Pé gira, quadril leva. 100% de velocidade, descanse entre séries.' },
  mbc:      { n: 'Arremesso de peito com medicine ball', m: {}, t: 'power', req: ['medball'], cue: 'Explosivo, como um direto com os dois braços.' },
  plyopush: { n: 'Flexão explosiva', m: { peito: 0.5, triceps: 0.5 }, t: 'power', req: [], r: [3, 6], vars: ['Flexão explosiva inclinada (mãos no sofá)', 'Flexão explosiva (mãos saem do chão)', 'Flexão com palma'], cue: 'Empurre o chão o mais rápido possível.' },
  // Academia
  sq:    { n: 'Agachamento livre com barra', m: { quad: 1, glut: 0.5 }, t: 'comp', req: ['gym'], inc: 5, cue: 'Base firme, tronco travado.' },
  rdl:   { n: 'Levantamento terra romeno', m: { post: 1, glut: 1 }, t: 'comp', req: ['gym'], inc: 5, cue: 'Quadril pra trás, coluna neutra.' },
  lp:    { n: 'Leg press', m: { quad: 1, glut: 0.5 }, t: 'comp', req: ['gym'], inc: 10, cue: 'Amplitude completa sem tirar a lombar do banco.' },
  ht:    { n: 'Hip thrust', m: { glut: 1, post: 0.5 }, t: 'comp', req: ['gym'], inc: 5, cue: 'Extensão de quadril: o motor do soco de trás.' },
  lc:    { n: 'Mesa flexora', m: { post: 1 }, t: 'iso', req: ['gym'], inc: 2.5, cue: 'Controle a descida.' },
  calf:  { n: 'Panturrilha em pé (máquina)', m: { pant: 1 }, t: 'iso', req: ['gym'], inc: 5, cue: 'Pausa embaixo.' },
  bp:    { n: 'Supino reto', m: { peito: 1, triceps: 0.5, ombros: 0.5 }, t: 'comp', req: ['gym'], inc: 2.5, cue: 'Escápulas travadas, pés firmes.' },
  ohp:   { n: 'Desenvolvimento com barra', m: { ombros: 1, triceps: 0.5 }, t: 'comp', req: ['gym'], inc: 2.5, cue: 'Glúteo e abdômen contraídos.' },
  pu:    { n: 'Puxada / barra fixa', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['gym'], inc: 2.5, cue: 'Peito em direção à barra.' },
  row:   { n: 'Remada curvada', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['gym'], inc: 2.5, cue: 'Puxe com o cotovelo.' },
  tri:   { n: 'Tríceps na polia', m: { triceps: 1 }, t: 'iso', req: ['gym'], inc: 2.5, cue: 'Extensão completa: ela termina o direto.' },
  lmr:   { n: 'Rotação com landmine', m: { core: 1 }, t: 'core', req: ['gym'], u: '/lado', cue: 'Pé gira, quadril leva.' },
  // Halteres
  gsq:   { n: 'Agachamento goblet', m: { quad: 1, glut: 0.5 }, t: 'comp', req: ['halteres'], inc: 2, cue: 'Halter no peito, desça entre as pernas.' },
  dbrdl: { n: 'Terra romeno com halteres', m: { post: 1, glut: 1 }, t: 'comp', req: ['halteres'], inc: 2, cue: 'Halteres colados na coxa.' },
  bul:   { n: 'Agachamento búlgaro com halteres', m: { quad: 1, glut: 1 }, t: 'comp', req: ['halteres'], inc: 2, u: '/perna', cue: 'Unilateral: equilíbrio e base de luta.' },
  dbfp:  { n: 'Supino com halteres (banco ou chão)', m: { peito: 1, triceps: 0.5, ombros: 0.5 }, t: 'comp', req: ['halteres'], inc: 2, cue: 'Cotovelos a ~45° do tronco.' },
  dbi:   { n: 'Supino inclinado com halteres', m: { peito: 1, ombros: 0.5, triceps: 0.5 }, t: 'comp', req: ['halteres'], inc: 2, cue: 'Inclinação de 30°.' },
  dbohp: { n: 'Desenvolvimento com halteres', m: { ombros: 1, triceps: 0.5 }, t: 'comp', req: ['halteres'], inc: 2, cue: 'Em pé ou sentado, sem arquear a lombar.' },
  dbrow: { n: 'Remada unilateral com halter', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['halteres'], inc: 2, u: '/lado', cue: 'Leve rotação no fim.' },
  lat:   { n: 'Elevação lateral', m: { ombros: 1 }, t: 'iso', req: ['halteres'], inc: 1, cue: 'Até a linha do ombro, sem roubar.' },
  curl:  { n: 'Rosca com halteres', m: { biceps: 1 }, t: 'iso', req: ['halteres'], inc: 1, cue: 'Cotovelo parado.' },
  ham:   { n: 'Rosca martelo', m: { biceps: 1 }, t: 'iso', req: ['halteres'], inc: 1, cue: 'Fortalece antebraço e punho.' },
  farm:  { n: 'Caminhada do fazendeiro', m: { core: 1 }, t: 'core', req: ['halteres'], u: 'm', r: [20, 30], cue: 'Pegada e tronco.' },
  // Elástico
  pal:      { n: 'Pallof press', m: { core: 1 }, t: 'core', req: ['elastico'], u: '/lado', cue: 'Anti-rotação: tronco que não gira quando toma o golpe.' },
  fp:       { n: 'Face pull com elástico', m: { ombros: 1, costas: 0.5 }, t: 'iso', req: ['elastico'], r: [12, 20], cue: 'Ombro posterior: equilibra o volume de socos.' },
  er:       { n: 'Rotação externa com elástico', m: {}, t: 'prehab', req: ['elastico'], r: [15, 20], cue: 'Manguito rotador: seguro do ombro do lutador.' },
  bandrow:  { n: 'Remada com elástico', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['elastico'], r: [10, 20], band: true, cue: 'Prenda na porta. Pausa de 1 s atrás.' },
  bandpd:   { n: 'Puxada alta com elástico', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['elastico'], r: [10, 20], band: true, cue: 'Elástico no alto da porta, puxe até o peito.' },
  bandlat:  { n: 'Elevação lateral com elástico', m: { ombros: 1 }, t: 'iso', req: ['elastico'], r: [12, 25], band: true, cue: 'Pise no elástico.' },
  bandcurl: { n: 'Rosca com elástico', m: { biceps: 1 }, t: 'iso', req: ['elastico'], r: [12, 25], band: true, cue: 'Cotovelo parado.' },
  bandtri:  { n: 'Tríceps com elástico', m: { triceps: 1 }, t: 'iso', req: ['elastico'], r: [12, 25], band: true, cue: 'Prenda no alto, extensão completa.' },
  // Barra / paralelas
  pullup: { n: 'Barra fixa', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['barra'], r: [3, 10], vars: ['Barra negativa (descida em 3–5 s)', 'Barra com elástico de assistência', 'Barra fixa pronada', 'Barra com pausa de 2 s no topo', 'Barra arqueiro'], cue: 'Sem balanço. Ombros longe das orelhas.' },
  chin:   { n: 'Barra supinada', m: { biceps: 1, costas: 1 }, t: 'comp', req: ['barra'], r: [4, 12], vars: ['Barra supinada negativa', 'Barra supinada', 'Barra supinada com pausa'], cue: 'Palmas pra você: mais bíceps.' },
  hlr:    { n: 'Elevação na barra', m: { core: 1 }, t: 'core', req: ['barra'], r: [6, 15], vars: ['Elevação de joelhos', 'Elevação de pernas estendidas', 'Pés na barra (toes to bar)'], cue: 'Sem balanço, controle a descida.' },
  dip:    { n: 'Paralelas', m: { peito: 1, triceps: 0.5 }, t: 'comp', req: ['paralelas'], r: [5, 15], vars: ['Paralelas negativa', 'Paralelas', 'Paralelas com pausa embaixo'], cue: 'Tronco levemente à frente. Sem dor no ombro.' },
  // Peso corporal (calistenia)
  pushup:  { n: 'Flexão', m: { peito: 1, triceps: 0.5, ombros: 0.5 }, t: 'comp', req: [], r: [8, 20], vars: ['Flexão inclinada (mãos no sofá/mesa)', 'Flexão no chão', 'Flexão com pés elevados', 'Flexão com pausa de 2 s embaixo', 'Flexão arqueiro'], cue: 'Corpo em prancha, peito encosta perto do chão.' },
  pike:    { n: 'Flexão pike', m: { ombros: 1, triceps: 0.5 }, t: 'comp', req: [], r: [5, 12], vars: ['Flexão pike', 'Flexão pike com pés elevados', 'Parada de mão na parede (segurar 20–40 s)', 'Flexão em parada de mão na parede (só descida)'], cue: 'Quadril alto, cabeça desce à frente das mãos.' },
  chairdip:{ n: 'Mergulho entre cadeiras', m: { triceps: 1, peito: 0.5 }, t: 'comp', req: [], r: [8, 15], vars: ['Mergulho com pés no chão, joelho dobrado', 'Mergulho com pernas estendidas', 'Mergulho com pés elevados'], cue: 'Cadeiras firmes. Pare se sentir o ombro.' },
  diamond: { n: 'Flexão fechada', m: { triceps: 1, peito: 0.5 }, t: 'comp', req: [], r: [6, 15], vars: ['Flexão fechada inclinada', 'Flexão diamante', 'Flexão diamante com pés elevados'], cue: 'Mãos juntas, cotovelos colados ao corpo.' },
  invrow:  { n: 'Remada invertida', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: [], r: [8, 15], vars: ['Remada na mesa, joelhos dobrados', 'Remada na mesa, pernas estendidas', 'Remada com pés elevados', 'Remada com pausa de 2 s no topo'], cue: 'Debaixo de uma mesa firme (ou barra baixa). Peito na borda.' },
  ytw:     { n: 'Y-T-W deitado', m: { ombros: 1, costas: 0.5 }, t: 'iso', req: [], r: [8, 12], vars: ['Y-T-W deitado', 'Y-T-W com pausa de 3 s', 'Y-T-W com garrafas de água'], cue: 'Deitado de bruços, polegar pra cima. Ombro posterior e escápula.' },
  bwsq:    { n: 'Agachamento (calistenia)', m: { quad: 1, glut: 0.5 }, t: 'comp', req: [], r: [8, 20], vars: ['Agachamento livre', 'Agachamento búlgaro (pé de trás no sofá)', 'Búlgaro com descida em 3 s', 'Pistol assistido (segurando na porta)', 'Agachamento shrimp'], cue: 'Unilateral fica pesado rápido: ótimo pra quem treina em casa.' },
  afundo:  { n: 'Afundo', m: { quad: 1, glut: 1 }, t: 'comp', req: [], r: [8, 15], u: '/perna', vars: ['Afundo reverso', 'Afundo com pausa embaixo', 'Afundo com salto alternado'], cue: 'Joelho de trás quase encosta no chão.' },
  slide:   { n: 'Flexora deslizando', m: { post: 1, glut: 0.5 }, t: 'comp', req: [], r: [6, 15], vars: ['Flexora deslizando (toalha no piso liso)', 'Flexora deslizando unilateral', 'Nórdico negativo (pés presos no sofá)'], cue: 'Quadril alto o tempo todo.' },
  sgb:     { n: 'Ponte de glúteo', m: { glut: 1, post: 0.5 }, t: 'comp', req: [], r: [10, 20], vars: ['Ponte de glúteo', 'Ponte unilateral', 'Hip thrust unilateral (costas no sofá)'], cue: 'Aperte o glúteo 1 s no topo.' },
  calfbw:  { n: 'Panturrilha no degrau', m: { pant: 1 }, t: 'iso', req: [], r: [12, 25], vars: ['Panturrilha no degrau', 'Panturrilha unilateral', 'Unilateral com pausa de 2 s'], cue: 'Amplitude total. Footwork que aguenta.' },
  hollow:  { n: 'Hollow (core de ginasta)', m: { core: 1 }, t: 'core', req: [], u: 's', r: [20, 45], vars: ['Dead bug', 'Hollow grupado', 'Hollow hold', 'Hollow rock'], cue: 'Lombar colada no chão.' },
  plankrot:{ n: 'Prancha anti-rotação', m: { core: 1 }, t: 'core', req: [], r: [10, 20], vars: ['Prancha com toque no ombro', 'Prancha com alcance à frente', 'Prancha com toque no ombro, pés juntos'], cue: 'Quadril não gira. Tronco blindado pra receber golpe.' },
  hang:    { n: 'Pendurar na barra (pegada)', m: {}, t: 'core', req: ['barra'], u: 's', r: [20, 45], vars: ['Pendurado com os pés apoiados', 'Pendurado', 'Pendurado na toalha'], cue: 'Ombros ativos, não "pendure nas articulações".' },
  towelgrip:{ n: 'Isometria de pegada (torcer toalha)', m: {}, t: 'core', req: [], u: 's', r: [20, 40], cue: 'Torça uma toalha molhada com força máxima. Pegada de quem agarra quimono.' },
  copen:   { n: 'Prancha de Copenhague', m: { core: 0.5 }, t: 'prehab', req: [], u: 's', r: [15, 30], vars: ['Copenhague com joelho apoiado', 'Copenhague com pé apoiado'], cue: 'Lado do corpo no chão, perna de cima no sofá. Fortalece o adutor (virilha).' },
  pogo:    { n: 'Pogo jumps (saltitos rígidos)', m: { pant: 0.5 }, t: 'power', req: [], u: 's', r: [15, 20], cue: 'Tornozelo "duro", contato curto com o chão. Mola, não amortecedor.' },
  neck:    { n: 'Isometria de pescoço (4 direções)', m: { pescoco: 1 }, t: 'prehab', req: [], u: 's', r: [15, 30], cue: 'Mão empurra, pescoço não se mexe.' },
  // ---- Biblioteca ampliada (v3.21): máquinas comuns no Brasil, halteres, kettlebell e variações pra trocar de estímulo ----
  // Pernas
  ext:      { n: 'Cadeira extensora', m: { quad: 1 }, t: 'iso', req: ['gym'], inc: 5, r: [10, 15], cue: 'Sobe até esticar e segura 1 s em cima. Desce devagar.' },
  hack:     { n: 'Agachamento hack (máquina)', m: { quad: 1, glut: 0.5 }, t: 'comp', req: ['gym'], inc: 10, cue: 'Costas coladas no apoio, desce fundo sem tirar o calcanhar.' },
  dl:       { n: 'Levantamento terra', m: { post: 1, glut: 1, costas: 0.5 }, t: 'comp', req: ['gym'], inc: 5, r: [3, 6], cue: 'Barra colada na canela, empurra o chão com as pernas e trava o quadril em cima.' },
  sumo:     { n: 'Agachamento sumô com halter', m: { quad: 1, glut: 1 }, t: 'comp', req: ['halteres'], inc: 2, cue: 'Pés bem afastados e virados pra fora, joelho segue a ponta do pé.' },
  walklunge:{ n: 'Avanço caminhando com halteres', m: { quad: 1, glut: 1 }, t: 'comp', req: ['halteres'], inc: 2, u: '/perna', r: [8, 12], cue: 'Passo longo, tronco alto, joelho de trás quase no chão.' },
  stepup:   { n: 'Subida no banco (step-up)', m: { quad: 1, glut: 1 }, t: 'comp', req: [], u: '/perna', r: [8, 15], vars: ['Subida no degrau baixo', 'Subida na cadeira', 'Subida na cadeira com mochila pesada'], cue: 'Quem sobe é a perna de cima: não dê impulso com a de baixo.' },
  singlerdl:{ n: 'Terra romeno unilateral', m: { post: 1, glut: 1 }, t: 'comp', req: ['halteres'], inc: 2, u: '/perna', r: [8, 12], cue: 'Quadril reto, perna de trás sobe junto com o tronco. Equilíbrio de lutador.' },
  nordic:   { n: 'Flexão nórdica', m: { post: 1 }, t: 'comp', req: [], r: [3, 8], vars: ['Nórdico só na descida (cai nas mãos)', 'Nórdico com elástico ajudando', 'Nórdico completo'], cue: 'Pés presos, corpo reto do joelho à cabeça, desce o mais devagar que conseguir.' },
  hipext:   { n: 'Extensão lombar no banco romano', m: { post: 1, glut: 1 }, t: 'iso', req: ['gym'], inc: 5, r: [10, 15], cue: 'Dobra no quadril, sobe apertando o glúteo até alinhar. Não hiperestenda.' },
  abd:      { n: 'Cadeira abdutora', m: { glut: 1 }, t: 'iso', req: ['gym'], inc: 5, r: [12, 20], cue: 'Abre os joelhos com controle, tronco levemente à frente pega mais glúteo.' },
  cablekick:{ n: 'Glúteo na polia (coice)', m: { glut: 1 }, t: 'iso', req: ['gym'], inc: 2.5, u: '/perna', r: [10, 15], cue: 'Perna vai pra trás sem arquear a lombar.' },
  seatcalf: { n: 'Panturrilha sentado', m: { pant: 1 }, t: 'iso', req: ['gym'], inc: 5, r: [12, 20], cue: 'Pega o sóleo: pausa embaixo, sobe tudo.' },
  kbswing:  { n: 'Kettlebell swing', m: { post: 1, glut: 1 }, t: 'comp', req: ['kettlebell'], inc: 4, r: [10, 20], cue: 'É quadril, não braço: joga o quadril pra frente e o peso flutua.' },
  // Peito
  incbp:    { n: 'Supino inclinado com barra', m: { peito: 1, ombros: 0.5, triceps: 0.5 }, t: 'comp', req: ['gym'], inc: 2.5, cue: 'Banco a 30°, barra desce no alto do peito.' },
  fly:      { n: 'Crucifixo com halteres', m: { peito: 1 }, t: 'iso', req: ['halteres'], inc: 1, r: [10, 15], cue: 'Cotovelo levemente dobrado e fixo, abre até sentir o peito alongar.' },
  cross:    { n: 'Crossover na polia', m: { peito: 1 }, t: 'iso', req: ['gym'], inc: 2.5, r: [10, 15], cue: 'Abraça uma árvore: mãos se encontram na frente do peito.' },
  pecdeck:  { n: 'Voador (peck deck)', m: { peito: 1 }, t: 'iso', req: ['gym'], inc: 5, r: [10, 15], cue: 'Peito aberto, junta as mãos sem bater os pesos.' },
  // Costas
  seatrow:  { n: 'Remada sentada na polia', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['gym'], inc: 5, cue: 'Peito estufado, puxa até a barriga sem jogar o tronco pra trás.' },
  tbar:     { n: 'Remada cavalinho (T-bar)', m: { costas: 1, biceps: 0.5 }, t: 'comp', req: ['gym'], inc: 5, cue: 'Tronco inclinado e travado, puxa o peso até o peito.' },
  pullover: { n: 'Pulldown com braço reto (polia)', m: { costas: 1 }, t: 'iso', req: ['gym'], inc: 2.5, r: [10, 15], cue: 'Braço quase reto, empurra a barra até a coxa usando as costas.' },
  dbpullover:{ n: 'Pullover com halter', m: { costas: 1, peito: 0.5 }, t: 'iso', req: ['halteres'], inc: 2, r: [10, 15], cue: 'Deitado, leva o halter pra trás da cabeça com o braço quase reto.' },
  shrug:    { n: 'Encolhimento com halteres', m: { costas: 1 }, t: 'iso', req: ['halteres'], inc: 2, r: [10, 15], cue: 'Sobe os ombros em direção às orelhas, pausa e desce. Trapézio forte protege o pescoço.' },
  // Ombros
  arnold:   { n: 'Desenvolvimento Arnold', m: { ombros: 1, triceps: 0.5 }, t: 'comp', req: ['halteres'], inc: 2, cue: 'Começa com as palmas pra você e gira enquanto empurra.' },
  landpress:{ n: 'Desenvolvimento landmine', m: { ombros: 1, peito: 0.5, triceps: 0.5 }, t: 'comp', req: ['gym'], inc: 2.5, u: '/lado', cue: 'Empurra pra cima e pra frente: mais amigável pro ombro que o desenvolvimento reto.' },
  cablelat: { n: 'Elevação lateral na polia', m: { ombros: 1 }, t: 'iso', req: ['gym'], inc: 2.5, u: '/lado', r: [12, 20], cue: 'Cabo cruza na frente do corpo, sobe até a linha do ombro.' },
  rdelt:    { n: 'Crucifixo invertido com halteres', m: { ombros: 1, costas: 0.5 }, t: 'iso', req: ['halteres'], inc: 1, r: [12, 20], cue: 'Tronco inclinado, abre os braços pro lado. Ombro de trás: equilibra os socos.' },
  bandpull: { n: 'Pull-apart com elástico', m: { ombros: 1, costas: 0.5 }, t: 'iso', req: ['elastico'], r: [15, 25], band: true, cue: 'Braços esticados na frente, abre o elástico até encostar no peito.' },
  // Braços
  skull:    { n: 'Tríceps testa com halteres', m: { triceps: 1 }, t: 'iso', req: ['halteres'], inc: 1, r: [10, 15], cue: 'Cotovelo apontado pro teto e parado, desce o peso ao lado da cabeça.' },
  ohtri:    { n: 'Tríceps francês (acima da cabeça)', m: { triceps: 1 }, t: 'iso', req: ['halteres'], inc: 2, r: [10, 15], cue: 'Cotovelos perto da cabeça, estica tudo lá em cima.' },
  kick:     { n: 'Tríceps coice', m: { triceps: 1 }, t: 'iso', req: ['halteres'], inc: 1, u: '/lado', r: [12, 15], cue: 'Braço colado no corpo, só o antebraço mexe.' },
  bbcurl:   { n: 'Rosca direta com barra', m: { biceps: 1 }, t: 'iso', req: ['gym'], inc: 2.5, r: [8, 12], cue: 'Cotovelo parado, sem balançar o tronco.' },
  preacher: { n: 'Rosca Scott', m: { biceps: 1 }, t: 'iso', req: ['gym'], inc: 2.5, r: [10, 15], cue: 'Braço apoiado no banco, desce até quase esticar.' },
  conc:     { n: 'Rosca concentrada', m: { biceps: 1 }, t: 'iso', req: ['halteres'], inc: 1, u: '/lado', r: [10, 15], cue: 'Cotovelo apoiado na coxa, aperta em cima.' },
  // Core
  abwheel:  { n: 'Roda abdominal', m: { core: 1 }, t: 'core', req: ['roda'], r: [6, 12], vars: ['Roda de joelhos, meia distância', 'Roda de joelhos completa', 'Roda em pé (curta)'], cue: 'Lombar não afunda: barriga dura e volta puxando com o abdômen.' },
  crunchcable:{ n: 'Abdominal na polia (ajoelhado)', m: { core: 1 }, t: 'core', req: ['gym'], inc: 5, r: [10, 15], cue: 'Enrola a coluna trazendo o cotovelo até a coxa, quadril parado.' },
  legraiseb:{ n: 'Elevação de pernas deitado', m: { core: 1 }, t: 'core', req: [], r: [10, 20], vars: ['Elevação de pernas dobradas', 'Elevação de pernas estendidas', 'Elevação com o quadril saindo do chão no topo'], cue: 'Lombar colada no chão durante a descida.' },
  sideplank:{ n: 'Prancha lateral', m: { core: 1 }, t: 'core', req: [], u: 's', r: [20, 45], vars: ['Prancha lateral de joelho', 'Prancha lateral', 'Prancha lateral com perna de cima elevada'], cue: 'Corpo reto do pé à cabeça, quadril não cai.' },
  birddog:  { n: 'Perdigueiro (bird dog)', m: { core: 1 }, t: 'core', req: [], u: '/lado', r: [8, 12], cue: 'De quatro, estica braço e perna opostos sem o quadril girar. Lombar agradece.' },
  russian:  { n: 'Giro russo', m: { core: 1 }, t: 'core', req: [], r: [16, 30], vars: ['Giro russo com pés no chão', 'Giro russo com pés no ar', 'Giro russo com peso'], cue: 'Gira o tronco inteiro, não só os braços.' },
  woodchop: { n: 'Lenhador com elástico', m: { core: 1 }, t: 'core', req: ['elastico'], u: '/lado', r: [10, 15], band: true, cue: 'Do alto pro baixo cruzando o corpo: pé gira, quadril leva, como um golpe.' },
  superman: { n: 'Superman (extensão no chão)', m: { core: 1, glut: 0.5 }, t: 'core', req: [], r: [10, 15], cue: 'De bruços, sobe braços e pernas juntos e segura 2 s.' },
  // Potência
  broad:    { n: 'Salto horizontal', m: {}, t: 'power', req: [], r: [3, 5], cue: 'Braços jogam pra frente, salta longe e aterrissa estável.' },
  skater:   { n: 'Salto do patinador', m: { glut: 0.5 }, t: 'power', req: [], u: '/lado', r: [4, 6], cue: 'Salto lateral de uma perna pra outra: troca de base rápida.' },
  medslam:  { n: 'Arremesso no chão (slam) com medicine ball', m: { core: 0.5 }, t: 'power', req: ['medball'], r: [5, 8], cue: 'Sobe na ponta do pé e joga a bola no chão com o corpo todo.' },
  // ---- Adaptados (v3.22): entram quando o corpo ou a condição pede (adapt = só se não houver outra opção na vaga) ----
  wcdip:    { n: 'Elevação do corpo na cadeira', m: { triceps: 1, peito: 0.5, costas: 0.5 }, t: 'comp', req: [], r: [6, 15], adapt: true, cue: 'Mãos nos apoios da cadeira, empurra pra baixo e tira o quadril do assento. Ombro forte e transferência mais fácil.' },
  sbpress:  { n: 'Supino sentado com elástico', m: { peito: 1, triceps: 0.5, ombros: 0.5 }, t: 'comp', req: ['elastico'], r: [10, 20], band: true, adapt: true, cue: 'Elástico preso atrás na altura do peito, empurra pra frente até esticar.' },
  sitstand: { n: 'Sentar e levantar da cadeira', m: { quad: 1, glut: 1 }, t: 'comp', req: [], r: [8, 15], adapt: true, vars: ['Sentar e levantar com apoio das mãos', 'Sentar e levantar sem as mãos', 'Sentar e levantar segurando peso no peito'], cue: 'Pés firmes, peito à frente, levanta sem embalar. Força de perna pra vida toda.' },
  wallpush: { n: 'Flexão na parede', m: { peito: 1, triceps: 0.5, ombros: 0.5 }, t: 'comp', req: [], r: [10, 20], adapt: true, cue: 'Mãos na parede na altura do ombro, corpo reto, desce o peito até perto da parede.' },
  suitcase: { n: 'Caminhada com peso de um lado (suitcase)', m: { core: 1 }, t: 'core', req: ['halteres'], u: 'm', r: [20, 30], adapt: true, cue: 'Peso numa mão só, tronco reto sem tombar pro lado. Troque de mão na série seguinte.' },
  // ---- v3.25: potência e condicionamento de lutador, academia, e mais opções sentado ----
  fsq:      { n: 'Agachamento frontal', m: { quad: 1, glut: 0.5, core: 0.5 }, t: 'comp', req: ['gym'], inc: 5, r: [4, 8], cue: 'Barra apoiada na frente dos ombros, cotovelos altos, tronco bem reto.' },
  gm:       { n: 'Good morning', m: { post: 1, glut: 1 }, t: 'comp', req: ['gym'], inc: 5, r: [8, 12], cue: 'Barra nas costas, joelho levemente dobrado, quadril vai pra trás com a coluna neutra. Carga leve.' },
  sled:     { n: 'Empurrar trenó (sled)', m: { quad: 0.5, glut: 0.5 }, t: 'power', req: ['gym'], u: 'm', r: [10, 20], cue: 'Corpo inclinado a 45°, braços firmes, passos curtos e explosivos. Potência de perna sem impacto.' },
  rope:     { n: 'Battle rope (corda naval)', m: { ombros: 0.5, core: 0.5 }, t: 'power', req: ['gym'], u: 's', r: [15, 30], cue: 'Base firme, ondas rápidas alternando os braços. Dá pra fazer sentado.' },
  mbo:      { n: 'Arremesso de medicine ball por cima da cabeça', m: { core: 0.5 }, t: 'power', req: ['medball'], r: [5, 8], cue: 'Bola atrás da cabeça, arremessa pra frente com o corpo todo, como um tiro de meta.' },
  bandohp:  { n: 'Desenvolvimento sentado com elástico', m: { ombros: 1, triceps: 0.5 }, t: 'comp', req: ['elastico'], r: [10, 20], band: true, cue: 'Elástico preso embaixo do assento, empurra acima da cabeça até esticar.' },
  seatcrunch:{ n: 'Abdominal sentado com elástico', m: { core: 1 }, t: 'core', req: ['elastico'], r: [10, 20], band: true, cue: 'Elástico preso atrás no alto, segura no peito e enrola o tronco pra frente. Ótimo pra quem treina sentado.' },
  // complementares (coluna, postura e reabilitação de lesões): não entram sozinhos nas rotinas, só no cartão de complementares
  deadbug:  { n: 'Dead bug', m: { core: 1 }, t: 'prehab', req: [], u: '/lado', r: [6, 10], vars: ['Dead bug só com as pernas', 'Dead bug', 'Dead bug segurando elástico'], cue: 'Deitado de costas, lombar colada no chão: estica braço e perna opostos devagar, sem a lombar subir.' },
  curlup:   { n: 'Curl-up de McGill', m: { core: 1 }, t: 'prehab', req: [], r: [5, 8], cue: 'Uma perna dobrada, mãos embaixo da lombar: tira só a cabeça e os ombros do chão, segura 8–10 s. A lombar não se mexe.' },
  thrrot:   { n: 'Rotação torácica em 4 apoios', m: {}, t: 'prehab', req: [], u: '/lado', r: [8, 10], cue: 'De quatro, mão atrás da cabeça: gira o cotovelo pro teto seguindo com o olhar. O quadril fica parado.' },
  catcamel: { n: 'Gato-camelo', m: {}, t: 'prehab', req: [], r: [8, 12], cue: 'De quatro: arredonda as costas pro teto, depois afunda o peito e olha pra frente. Devagar, sem forçar.' },
  wallangel:{ n: 'Anjo na parede', m: { ombros: 0.5 }, t: 'prehab', req: [], r: [8, 12], cue: 'Costas, cabeça e braços encostados na parede: sobe e desce os braços sem descolar nada.' },
  thext:    { n: 'Extensão torácica no rolo', m: {}, t: 'prehab', req: [], r: [8, 12], cue: 'Rolo (ou toalha enrolada) na altura das escápulas, mãos atrás da cabeça: estende a parte alta das costas sobre o rolo. A lombar não arqueia.' },
  doorpec:  { n: 'Alongamento de peitoral na porta', m: {}, t: 'prehab', req: [], u: 's', r: [30, 45], cue: 'Antebraço no batente com o cotovelo na altura do ombro: dá um passo à frente até sentir o peito alongar. Cada lado.' },
  hipflex:  { n: 'Alongamento do flexor do quadril', m: {}, t: 'prehab', req: [], u: 's', r: [30, 45], cue: 'Meio ajoelhado: aperta o glúteo de trás e leva o quadril à frente sem arquear a lombar. Cada lado.' },
  tke:      { n: 'Extensão terminal do joelho com elástico', m: { quad: 0.3 }, t: 'prehab', req: ['elastico'], u: '/perna', r: [12, 15], cue: 'Elástico atrás do joelho preso à frente: estica o joelho até o fim e segura 1 s.' },
  wallsit:  { n: 'Isometria na parede (cadeirinha)', m: { quad: 0.5 }, t: 'prehab', req: [], u: 's', r: [30, 45], cue: 'Costas na parede, joelhos a 60–90°: segura. Dor até 3 de 10 é aceitável.' },
  latwalk:  { n: 'Caminhada lateral com elástico', m: { glut: 0.5 }, t: 'prehab', req: ['elastico'], u: '/lado', r: [10, 15], cue: 'Miniband acima do joelho ou no tornozelo, meio agachado: passos de lado sem o joelho entrar.' },
  balance:  { n: 'Equilíbrio em uma perna', m: {}, t: 'prehab', req: [], u: 's', r: [30, 45], vars: ['Equilíbrio com olhos abertos', 'Equilíbrio de olhos fechados', 'Equilíbrio em almofada'], cue: 'Em uma perna, joelho levemente dobrado. Perto de um apoio. Cada perna.' },
  chintuck: { n: 'Retração do queixo', m: {}, t: 'prehab', req: [], r: [8, 12], cue: 'Sentado ou em pé, olhando pra frente: leva o queixo pra trás em linha reta (faz "papada"), segura 3–5 s. Sem olhar pra baixo.' },
  wristfe:  { n: 'Flexão e extensão de punho com halter', m: {}, t: 'prehab', req: ['halteres'], r: [12, 15], cue: 'Antebraço apoiado na coxa, halter leve: sobe o punho e desce devagar em 3 s. Palma pra cima e depois pra baixo.' },
};

// Cada "slot" é um padrão de movimento; o app escolhe o 1º exercício que você consegue fazer com seu equipamento
export const SLOTS = {
  power_l: ['jump', 'broad', 'skater', 'sled'], power_r: ['mbr', 'shadowx', 'medslam', 'rope'], power_p: ['mbc', 'plyopush', 'mbo', 'medslam', 'rope'],
  squat: ['sq', 'fsq', 'hack', 'gsq', 'sumo', 'bwsq', 'sitstand'], lunge: ['bul', 'walklunge', 'stepup', 'afundo', 'bwsq'], quad_acc: ['lp', 'hack', 'ext', 'stepup', 'afundo', 'bwsq', 'sitstand'],
  quad_iso: ['ext', 'stepup', 'bwsq'],
  hinge: ['rdl', 'dl', 'gm', 'dbrdl', 'singlerdl', 'kbswing', 'nordic', 'slide', 'sgb'], glute: ['ht', 'kbswing', 'sgb'], glute_iso: ['abd', 'cablekick', 'hipext', 'sgb'],
  hamcurl: ['lc', 'nordic', 'slide'], calf: ['calf', 'seatcalf', 'calfbw'],
  hpush: ['bp', 'dbfp', 'pushup', 'sbpress', 'wallpush'], ipush: ['dbi', 'incbp', 'landpress', 'dip', 'pushup', 'chairdip', 'sbpress', 'wallpush'], dip: ['dip', 'chairdip', 'diamond', 'wcdip'],
  chest_iso: ['cross', 'pecdeck', 'fly', 'pushup'],
  vpush: ['ohp', 'dbohp', 'arnold', 'landpress', 'pike', 'bandohp'], vpull: ['pu', 'pullup', 'bandpd', 'invrow'], hpull: ['row', 'seatrow', 'tbar', 'dbrow', 'invrow', 'bandrow'],
  hpull2: ['dbrow', 'seatrow', 'invrow', 'bandrow'], lat_iso: ['pullover', 'dbpullover', 'bandpd'], traps: ['shrug', 'farm'],
  rear: ['fp', 'rdelt', 'bandpull', 'ytw'], lateral: ['lat', 'cablelat', 'bandlat'],
  biceps: ['curl', 'bbcurl', 'chin', 'bandcurl'], biceps2: ['ham', 'preacher', 'conc', 'bandcurl'], triceps: ['tri', 'skull', 'ohtri', 'kick', 'bandtri', 'diamond', 'wcdip'],
  core_anti: ['pal', 'sideplank', 'abwheel', 'plankrot', 'birddog', 'suitcase'], core_rot: ['lmr', 'woodchop', 'hlr', 'russian', 'crunchcable', 'legraiseb', 'hollow', 'seatcrunch'],
  carry: ['farm', 'suitcase'], neck: ['neck'], er: ['er', 'ytw', 'bandpull'], lowback: ['hipext', 'superman', 'birddog'],
  grip: ['hang', 'farm', 'towelgrip'], adductor: ['copen'], pogo: ['pogo']
};

// Modelos de treino: [slot, séries, repsMin, repsMax]
export const TEMPLATES = {
  A:  { name: 'Full body A', list: [['power_l', 3, 3, 5], ['squat', 3, 6, 10], ['hpush', 3, 6, 10], ['hpull', 3, 8, 12], ['dip', 2, 8, 12], ['hamcurl', 3, 10, 15], ['lateral', 3, 12, 20], ['core_anti', 2, 10, 12]] },
  B:  { name: 'Full body B', list: [['power_r', 3, 5, 5], ['hinge', 3, 6, 10], ['vpush', 3, 6, 10], ['vpull', 3, 6, 12], ['lunge', 2, 8, 12], ['ipush', 2, 8, 12], ['biceps', 2, 10, 15], ['triceps', 2, 10, 15], ['neck', 2, 15, 30]] },
  C:  { name: 'Full body C', list: [['power_p', 3, 5, 5], ['quad_acc', 3, 10, 15], ['ipush', 3, 8, 12], ['hpull2', 3, 8, 12], ['glute', 2, 8, 12], ['rear', 3, 12, 20], ['core_rot', 2, 6, 8], ['er', 2, 15, 20], ['calf', 2, 10, 15]] },
  U1: { name: 'Superior 1', list: [['power_p', 3, 5, 5], ['hpush', 4, 6, 10], ['hpull', 4, 6, 10], ['vpush', 3, 8, 12], ['vpull', 3, 8, 12], ['lateral', 3, 12, 20], ['triceps', 2, 10, 15], ['biceps', 2, 10, 15], ['neck', 2, 15, 30]] },
  L1: { name: 'Inferior 1', list: [['power_l', 3, 3, 5], ['squat', 4, 6, 10], ['hinge', 3, 6, 10], ['hamcurl', 3, 10, 15], ['calf', 3, 10, 15], ['core_anti', 3, 10, 12]] },
  U2: { name: 'Superior 2', list: [['power_r', 3, 5, 5], ['ipush', 3, 8, 12], ['vpull', 3, 6, 10], ['chest_iso', 2, 10, 15], ['hpull2', 3, 8, 12], ['rear', 3, 15, 20], ['biceps2', 2, 10, 15], ['triceps', 2, 10, 15], ['er', 2, 15, 20]] },
  L2: { name: 'Inferior 2', list: [['power_l', 3, 3, 5], ['glute', 3, 8, 12], ['lunge', 3, 8, 12], ['quad_iso', 3, 10, 15], ['hamcurl', 2, 10, 15], ['glute_iso', 2, 12, 20], ['calf', 3, 10, 15], ['core_rot', 3, 6, 8], ['carry', 2, 20, 30]] },
  PU: { name: 'Empurrar', list: [['power_p', 3, 5, 5], ['hpush', 4, 6, 10], ['vpush', 3, 6, 10], ['ipush', 3, 8, 12], ['chest_iso', 2, 10, 15], ['lateral', 3, 12, 20], ['triceps', 3, 10, 15]] },
  PL: { name: 'Puxar', list: [['power_r', 3, 5, 5], ['vpull', 4, 6, 10], ['hpull', 3, 8, 12], ['lat_iso', 2, 10, 15], ['rear', 3, 12, 20], ['biceps', 3, 10, 15], ['biceps2', 2, 10, 15], ['traps', 2, 10, 15], ['neck', 2, 15, 30]] },
  LG: { name: 'Pernas', list: [['power_l', 3, 3, 5], ['squat', 4, 6, 10], ['hinge', 3, 6, 10], ['quad_acc', 3, 10, 15], ['hamcurl', 3, 10, 15], ['glute_iso', 2, 12, 20], ['calf', 3, 10, 15], ['core_anti', 3, 10, 12]] },
  // ABC tradicional de academia
  AA: { name: 'A · Peito e tríceps', list: [['power_p', 3, 5, 5], ['hpush', 4, 6, 10], ['ipush', 3, 8, 12], ['chest_iso', 3, 10, 15], ['dip', 3, 8, 12], ['lateral', 3, 12, 20], ['triceps', 3, 10, 15], ['core_anti', 3, 10, 12]] },
  BB: { name: 'B · Costas e bíceps', list: [['power_r', 3, 5, 5], ['vpull', 4, 6, 10], ['hpull', 4, 8, 12], ['lat_iso', 3, 10, 15], ['rear', 3, 12, 20], ['biceps', 3, 10, 15], ['biceps2', 2, 10, 15], ['traps', 2, 10, 15]] },
  CC: { name: 'C · Pernas e ombros', list: [['power_l', 3, 3, 5], ['squat', 4, 6, 10], ['hinge', 3, 6, 10], ['lunge', 3, 8, 12], ['vpush', 3, 6, 10], ['hamcurl', 3, 10, 15], ['calf', 3, 10, 15]] },
  // ABCDEF: um grupo por dia
  F1: { name: 'A · Peito', list: [['power_p', 3, 5, 5], ['hpush', 4, 6, 10], ['ipush', 4, 8, 12], ['chest_iso', 3, 10, 15], ['dip', 3, 8, 12], ['core_anti', 3, 10, 12]] },
  F2: { name: 'B · Costas', list: [['power_r', 3, 5, 5], ['vpull', 4, 6, 10], ['hpull', 4, 8, 12], ['hpull2', 3, 8, 12], ['lat_iso', 3, 10, 15], ['traps', 3, 10, 15], ['grip', 2, 20, 40]] },
  F3: { name: 'C · Quadríceps', list: [['power_l', 3, 3, 5], ['squat', 4, 6, 10], ['quad_acc', 3, 10, 15], ['lunge', 3, 8, 12], ['quad_iso', 3, 12, 15], ['calf', 4, 10, 15]] },
  F4: { name: 'D · Ombros', list: [['vpush', 4, 6, 10], ['lateral', 4, 12, 20], ['rear', 3, 12, 20], ['er', 2, 15, 20], ['neck', 2, 15, 30]] },
  F5: { name: 'E · Braços', list: [['biceps', 3, 10, 15], ['triceps', 3, 10, 15], ['biceps2', 3, 10, 15], ['dip', 3, 8, 12], ['core_rot', 3, 6, 8]] },
  F6: { name: 'F · Posterior e glúteo', list: [['hinge', 4, 6, 10], ['glute', 4, 8, 12], ['hamcurl', 3, 10, 15], ['glute_iso', 3, 12, 20], ['lowback', 2, 10, 15], ['calf', 3, 10, 15], ['core_anti', 3, 10, 12]] }
};

export const SPLITS = {
  1: { name: 'Full body 1x', days: ['A'] },
  2: { name: 'Full body 2x', days: ['A', 'B'] },
  3: { name: 'Full body 3x', days: ['A', 'B', 'C'] },
  4: { name: 'Superior / Inferior', days: ['U1', 'L1', 'U2', 'L2'] },
  5: { name: 'Sup/Inf + Empurrar/Puxar/Pernas', days: ['U1', 'L1', 'PU', 'PL', 'LG'] },
  6: { name: 'Empurrar / Puxar / Pernas 2x', days: ['PU', 'PL', 'LG', 'PU', 'PL', 'LG'] }
};

// ---------- Boxe: combinações (guarda ortodoxa) ----------
// 1 jab · 2 direto · 3 gancho de esquerda · 4 gancho de direita · 5 uppercut de esquerda · 6 uppercut de direita
// Numeração dos socos (guarda ortodoxa). tech = animação na biblioteca; mirror = espelho de outra
export const PUNCHES = [
  { n: 1, name: 'Jab', hand: 'frente', tech: 'jab', d: 'Reto e rápido. Mede a distância e abre caminho pros outros.' },
  { n: 2, name: 'Direto', hand: 'trás', tech: 'direto', d: 'Reto e forte: gira o pé de trás e o quadril.' },
  { n: 3, name: 'Cruzado', hand: 'frente', tech: 'gancho', d: 'Em arco, braço dobrado em 90°, na altura do queixo.' },
  { n: 4, name: 'Cruzado', hand: 'trás', mirror: 3, d: 'O mesmo arco do 3, com a mão de trás e giro total do quadril.' },
  { n: 5, name: 'Uppercut', hand: 'frente', tech: 'uppercut5', d: 'De baixo pra cima, por dentro da guarda. Golpe de perto.' },
  { n: 6, name: 'Uppercut', hand: 'trás', mirror: 5, d: 'O mesmo do 5, com a mão de trás: empurra o chão com o pé de trás.' }
];
export const COMBOS = {
  iniciante: ['1', '1-1', '1-2', '1-2-1', '1-1-2', '2-1-2', '1, esquiva', '1-2, passo atrás', 'bloqueia, 2', 'jab no corpo, 1', '1, pêndulo'],
  intermediario: ['1-2-3', '1-2-3-2', '3-2', '1-6-3-2', '1-2, esquiva, 2', '2-3-2', '1-1-2-3', '5-2', 'pêndulo, 3-2', '3 no corpo, 3 na cabeça', '1-2, gira', 'esquiva, 2-3', '1-2-5-2'],
  avancado: ['1-2-3-4', '1-2-5-2-3', 'esquiva, 6-3-2', '2-3-2, pêndulo, 3-2', '1-2-3, gira, 2', 'finta de jab, 2-3', '3 no corpo, 3, 2', '6-3-2', '1-1-2, pêndulo, 2-3-2', 'bloqueia, 3-6-3', '1-2, esquiva, 2-3-4']
};

export const BOX_THEMES = {
  aquec: { t: 'Aquecimento', f: 'Corda ou polichinelo + sombra leve. Solte ombros e quadril.', calls: false },
  jab: { t: 'Jab e distância', f: 'Jab dobrado, jab no corpo, entra e sai. Volte sempre pra guarda.', calls: true, pool: ['1', '1-1', 'jab no corpo, 1', '1, passo atrás', '1-1-2'] },
  retas: { t: 'Retas (1-2)', f: 'Gire o pé de trás no direto. Mão volta pro queixo.', calls: true },
  defesa: { t: 'Defesa + contra-ataque', f: 'Esquiva, pêndulo, bloqueio. Toda defesa termina em soco.', calls: true, pool: ['1, esquiva', 'esquiva, 2', 'pêndulo, 3-2', 'bloqueia, 2', 'esquiva, 2-3', 'bloqueia, 3-6-3'] },
  foot: { t: 'Footwork', f: 'Entrar e sair, giro pela esquerda, pivô. Pés nunca cruzam.', calls: true, pool: ['1, passo atrás', '1-2, gira', '1, pêndulo', '1-2-3, gira, 2', 'passo à esquerda, 1-2'] },
  niveis: { t: 'Corpo e cabeça', f: 'Troca de nível: abaixe com as pernas, não com as costas.', calls: true, pool: ['jab no corpo, 1', '3 no corpo, 3 na cabeça', '1-2, 3 no corpo', '2 no corpo, 3'] },
  saco_vol: { t: 'Saco: volume', f: 'Ritmo constante, combos de 2–4 golpes, respira.', calls: true, saco: true },
  saco_pot: { t: 'Saco: potência', f: 'Golpes curtos com tudo. Reseta a base entre combos.', calls: true, saco: true },
  pressao: { t: 'Pressão', f: 'Ritmo alto o round inteiro. Nos últimos 30 s, solta tudo.', calls: true },
  explosiva: { t: 'Sombra explosiva', f: '10 s em velocidade máxima, 10 s de movimento. Repita.', calls: true },
  guarda: { t: 'Guarda de ferro', f: 'Sombra com garrafas de 500 ml ou halteres leves. Guarda nunca cai.', calls: true },
  corda: { t: 'Corda / footwork', f: 'Corda variando ritmo (sem corda: skipping no lugar).', calls: false },
  final: { t: 'Finalizador', f: '20 s socos rápidos + 10 s sprawl/burpee. Repita até o gongo.', calls: false },
  core: { t: 'Core e pescoço', f: 'Hollow, prancha anti-rotação e isometria de pescoço. Sem pressa.', calls: false }
};

// Valores aproximados por 100 g (base TACO/USDA). Confira o rótulo.
export const FOODS = [
  { n: 'Arroz branco cozido', k: 128, p: 2.5, c: 28.1, f: 0.2, fb: 1.6, g: 150 },
  { n: 'Arroz integral cozido', k: 124, p: 2.6, c: 25.8, f: 1.0, fb: 2.7, g: 150 },
  { n: 'Feijão carioca cozido', k: 76, p: 4.8, c: 13.6, f: 0.5, fb: 8.5, g: 140 },
  { n: 'Peito de frango grelhado', k: 159, p: 32.0, c: 0, f: 2.5, fb: 0, g: 120 },
  { n: 'Patinho grelhado', k: 219, p: 35.9, c: 0, f: 7.3, fb: 0, g: 120 },
  { n: 'Atum em lata (água)', k: 116, p: 26.0, c: 0, f: 1.0, fb: 0, g: 120 },
  { n: 'Ovo cozido (1 un ≈ 50 g)', k: 146, p: 13.3, c: 0.6, f: 9.5, fb: 0, g: 50 },
  { n: 'Pão francês (1 un ≈ 50 g)', k: 300, p: 8.0, c: 58.6, f: 3.1, fb: 2.3, g: 50 },
  { n: 'Cuscuz de milho cozido', k: 113, p: 2.2, c: 25.3, f: 0.7, fb: 2.1, g: 150 },
  { n: 'Macarrão cozido', k: 157, p: 5.8, c: 30.9, f: 0.9, fb: 1.8, g: 150 },
  { n: 'Batata-doce cozida', k: 77, p: 0.6, c: 18.4, f: 0.1, fb: 2.2, g: 150 },
  { n: 'Batata inglesa cozida', k: 52, p: 1.2, c: 11.9, f: 0.0, fb: 1.3, g: 150 },
  { n: 'Aveia em flocos', k: 394, p: 13.9, c: 66.6, f: 8.5, fb: 9.1, g: 30 },
  { n: 'Banana prata', k: 98, p: 1.3, c: 26.0, f: 0.1, fb: 2.0, g: 70 },
  { n: 'Maçã', k: 56, p: 0.3, c: 15.2, f: 0.0, fb: 1.3, g: 130 },
  { n: 'Mamão papaia', k: 40, p: 0.5, c: 10.4, f: 0.1, fb: 1.0, g: 150 },
  { n: 'Leite integral (ml)', k: 61, p: 3.1, c: 4.7, f: 3.2, fb: 0, g: 200 },
  { n: 'Iogurte natural', k: 51, p: 4.1, c: 1.9, f: 3.0, fb: 0, g: 170 },
  { n: 'Queijo minas frescal', k: 264, p: 17.4, c: 3.2, f: 20.2, fb: 0, g: 30 },
  { n: 'Whey protein (varia por marca)', k: 400, p: 78.0, c: 8.0, f: 6.0, fb: 0, g: 30 },
  { n: 'Pasta de amendoim', k: 588, p: 25.0, c: 20.0, f: 50.0, fb: 6.0, g: 15 },
  { n: 'Azeite de oliva', k: 884, p: 0, c: 0, f: 100, fb: 0, g: 10 },
  // café da manhã e básicos
  { n: 'Ovo frito (1 un ≈ 50 g)', k: 240, p: 15.6, c: 1.2, f: 18.6, fb: 0, g: 50, cat: 'base' },
  { n: 'Pão integral (fatia ≈ 25 g)', k: 253, p: 9.4, c: 49.9, f: 3.7, fb: 6.9, g: 50, cat: 'base' },
  { n: 'Requeijão', k: 257, p: 9.6, c: 2.4, f: 23.4, fb: 0, g: 15, cat: 'base' },
  { n: 'Manteiga', k: 726, p: 0.4, c: 0.1, f: 82.4, fb: 0, g: 10, cat: 'base' },
  { n: 'Tilápia grelhada', k: 128, p: 26.2, c: 0, f: 2.7, fb: 0, g: 120, cat: 'base' },
  { n: 'Salada (alface e tomate)', k: 15, p: 1.0, c: 3.0, f: 0.2, fb: 1.6, g: 80, cat: 'base' },
  { n: 'Farofa pronta', k: 406, p: 2.1, c: 80.3, f: 9.1, fb: 7.8, g: 30, cat: 'base' },
  // frutas
  { n: 'Laranja', k: 37, p: 0.8, c: 8.9, f: 0.1, fb: 0.8, g: 150, cat: 'fruta' },
  { n: 'Morango', k: 30, p: 0.9, c: 6.8, f: 0.3, fb: 1.7, g: 100, cat: 'fruta' },
  { n: 'Uva', k: 53, p: 0.7, c: 13.6, f: 0.2, fb: 0.9, g: 100, cat: 'fruta' },
  { n: 'Abacaxi', k: 48, p: 0.9, c: 12.3, f: 0.1, fb: 1.0, g: 100, cat: 'fruta' },
  { n: 'Melancia', k: 33, p: 0.9, c: 8.1, f: 0.0, fb: 0.1, g: 200, cat: 'fruta' },
  { n: 'Manga', k: 64, p: 0.4, c: 16.7, f: 0.3, fb: 1.6, g: 150, cat: 'fruta' },
  { n: 'Abacate', k: 96, p: 1.2, c: 6.0, f: 8.4, fb: 6.3, g: 100, cat: 'fruta' },
  // lanches
  { n: 'Castanha-de-caju', k: 570, p: 18.5, c: 29.1, f: 46.3, fb: 3.7, g: 20, cat: 'lanche' },
  { n: 'Amendoim torrado', k: 606, p: 22.5, c: 18.7, f: 54.0, fb: 8.0, g: 20, cat: 'lanche' },
  { n: 'Barra de cereal (varia por marca)', k: 380, p: 5.0, c: 70.0, f: 9.0, fb: 3.0, g: 25, cat: 'lanche' },
  { n: 'Granola (varia por marca)', k: 420, p: 10.0, c: 65.0, f: 13.0, fb: 6.0, g: 40, cat: 'lanche' },
  { n: 'Pão de queijo', k: 363, p: 5.1, c: 34.2, f: 24.6, fb: 0.6, g: 40, cat: 'lanche' },
  // besteiras (valores médios; varia muito por marca/receita)
  { n: 'Chocolate ao leite', k: 540, p: 7.2, c: 59.6, f: 30.3, fb: 2.2, g: 25, cat: 'besteira' },
  { n: 'Biscoito recheado', k: 472, p: 6.4, c: 70.5, f: 19.6, fb: 3.0, g: 30, cat: 'besteira' },
  { n: 'Salgadinho de pacote', k: 500, p: 6.0, c: 60.0, f: 26.0, fb: 3.0, g: 25, cat: 'besteira' },
  { n: 'Batata frita', k: 270, p: 3.0, c: 35.0, f: 14.0, fb: 3.0, g: 100, cat: 'besteira' },
  { n: 'Pizza de mussarela (fatia ≈ 110 g)', k: 270, p: 11.0, c: 30.0, f: 12.0, fb: 2.0, g: 110, cat: 'besteira' },
  { n: 'Hambúrguer (sanduíche)', k: 250, p: 13.0, c: 30.0, f: 9.0, fb: 1.5, g: 200, cat: 'besteira' },
  { n: 'Coxinha frita', k: 280, p: 9.0, c: 35.0, f: 12.0, fb: 1.5, g: 80, cat: 'besteira' },
  { n: 'Sorvete de massa', k: 200, p: 3.5, c: 24.0, f: 10.0, fb: 0.5, g: 80, cat: 'besteira' },
  { n: 'Açaí com xarope', k: 110, p: 0.7, c: 21.5, f: 3.7, fb: 1.7, g: 300, cat: 'besteira' },
  { n: 'Refrigerante (ml)', k: 42, p: 0, c: 10.8, f: 0, fb: 0, g: 350, cat: 'besteira' },
  { n: 'Cerveja (ml)', k: 41, p: 0.3, c: 3.3, f: 0, fb: 0, g: 350, cat: 'besteira' }
];


// ~90 alimentos a mais (valores por 100 g, base TACO/USDA, aproximados) pra montar cardápios com variedade
FOODS.push(
  // bases e pães
  { n: 'Macarrão integral cozido', k: 149, p: 6.0, c: 30.0, f: 1.7, fb: 3.9, g: 150, cat: 'base' },
  { n: 'Mandioca cozida', k: 125, p: 0.6, c: 30.1, f: 0.3, fb: 1.6, g: 150, cat: 'base' },
  { n: 'Inhame cozido', k: 97, p: 2.1, c: 23.2, f: 0.2, fb: 1.7, g: 150, cat: 'base' },
  { n: 'Mandioquinha cozida', k: 80, p: 0.9, c: 18.9, f: 0.2, fb: 1.8, g: 150, cat: 'base' },
  { n: 'Quinoa cozida', k: 120, p: 4.4, c: 21.3, f: 1.9, fb: 2.8, g: 120, cat: 'base' },
  { n: 'Milho verde (lata, escorrido)', k: 98, p: 3.2, c: 17.1, f: 2.4, fb: 4.6, g: 60, cat: 'base' },
  { n: 'Tapioca (1 disco ≈ 50 g de goma)', k: 240, p: 0, c: 60.0, f: 0, fb: 0.3, g: 50, cat: 'base' },
  { n: 'Pão de forma tradicional (fatia ≈ 25 g)', k: 266, p: 7.6, c: 49.0, f: 3.3, fb: 2.7, g: 50, cat: 'base' },
  { n: 'Biscoito de arroz (1 un ≈ 9 g)', k: 387, p: 8.2, c: 81.5, f: 2.8, fb: 4.2, g: 18, cat: 'lanche' },
  // leguminosas
  { n: 'Feijão preto cozido', k: 77, p: 4.5, c: 14.0, f: 0.5, fb: 8.4, g: 140, cat: 'base' },
  { n: 'Lentilha cozida', k: 93, p: 6.3, c: 16.3, f: 0.5, fb: 7.9, g: 140, cat: 'base' },
  { n: 'Grão-de-bico cozido', k: 164, p: 8.9, c: 27.4, f: 2.6, fb: 7.6, g: 100, cat: 'base' },
  { n: 'Ervilha (lata, escorrida)', k: 74, p: 4.6, c: 13.4, f: 0.4, fb: 5.1, g: 80, cat: 'base' },
  // proteínas
  { n: 'Frango desfiado (peito cozido)', k: 163, p: 31.5, c: 0, f: 3.2, fb: 0, g: 100, cat: 'proteina' },
  { n: 'Sobrecoxa de frango assada (sem pele)', k: 233, p: 29.2, c: 0, f: 12.0, fb: 0, g: 120, cat: 'proteina' },
  { n: 'Carne moída (patinho) refogada', k: 212, p: 32.0, c: 0, f: 8.4, fb: 0, g: 100, cat: 'proteina' },
  { n: 'Alcatra grelhada', k: 241, p: 31.9, c: 0, f: 11.6, fb: 0, g: 120, cat: 'proteina' },
  { n: 'Contrafilé grelhado', k: 278, p: 32.4, c: 0, f: 15.5, fb: 0, g: 120, cat: 'proteina' },
  { n: 'Fígado bovino grelhado', k: 225, p: 29.9, c: 4.2, f: 9.0, fb: 0, g: 100, cat: 'proteina' },
  { n: 'Lombo de porco assado', k: 210, p: 35.7, c: 0, f: 6.4, fb: 0, g: 120, cat: 'proteina' },
  { n: 'Bisteca de porco grelhada', k: 280, p: 28.9, c: 0, f: 17.4, fb: 0, g: 120, cat: 'proteina' },
  { n: 'Salmão grelhado', k: 229, p: 23.9, c: 0, f: 14.0, fb: 0, g: 120, cat: 'proteina' },
  { n: 'Merluza assada', k: 122, p: 26.6, c: 0, f: 0.9, fb: 0, g: 120, cat: 'proteina' },
  { n: 'Sardinha em lata (óleo, escorrida)', k: 285, p: 15.9, c: 0, f: 24.0, fb: 0, g: 80, cat: 'proteina' },
  { n: 'Camarão cozido', k: 90, p: 19.0, c: 0, f: 1.0, fb: 0, g: 100, cat: 'proteina' },
  { n: 'Tofu firme', k: 144, p: 17.3, c: 2.8, f: 8.7, fb: 2.3, g: 120, cat: 'proteina' },
  { n: 'Clara de ovo cozida', k: 59, p: 13.4, c: 0, f: 0.1, fb: 0, g: 60, cat: 'proteina' },
  // laticínios e bebidas
  { n: 'Leite desnatado (ml)', k: 35, p: 3.4, c: 4.9, f: 0.1, fb: 0, g: 200, cat: 'base' },
  { n: 'Leite sem lactose semidesnatado (ml)', k: 46, p: 3.1, c: 4.8, f: 1.5, fb: 0, g: 200, cat: 'base' },
  { n: 'Iogurte natural desnatado', k: 41, p: 3.8, c: 5.8, f: 0.3, fb: 0, g: 170, cat: 'base' },
  { n: 'Queijo cottage', k: 98, p: 11.1, c: 3.4, f: 4.3, fb: 0, g: 50, cat: 'base' },
  { n: 'Ricota', k: 140, p: 12.6, c: 3.8, f: 8.1, fb: 0, g: 40, cat: 'base' },
  { n: 'Queijo mussarela', k: 330, p: 22.6, c: 3.0, f: 25.2, fb: 0, g: 30, cat: 'base' },
  { n: 'Bebida vegetal de aveia (ml)', k: 44, p: 0.5, c: 7.0, f: 1.5, fb: 0.8, g: 200, cat: 'base' },
  { n: 'Bebida vegetal de amêndoas sem açúcar (ml)', k: 15, p: 0.6, c: 0.3, f: 1.1, fb: 0.2, g: 200, cat: 'base' },
  { n: 'Café sem açúcar (ml)', k: 2, p: 0.1, c: 0.3, f: 0, fb: 0, g: 100, cat: 'base' },
  { n: 'Suco de laranja natural (ml)', k: 45, p: 0.7, c: 10.4, f: 0.1, fb: 0.4, g: 200, cat: 'fruta' },
  { n: 'Água de coco (ml)', k: 22, p: 0, c: 5.3, f: 0, fb: 0.1, g: 300, cat: 'fruta' },
  // verduras e legumes
  { n: 'Alface', k: 11, p: 1.3, c: 1.7, f: 0.2, fb: 1.8, g: 40, cat: 'verdura' },
  { n: 'Tomate', k: 15, p: 1.1, c: 3.1, f: 0.2, fb: 1.2, g: 80, cat: 'verdura' },
  { n: 'Brócolis cozido', k: 25, p: 2.1, c: 4.4, f: 0.5, fb: 3.4, g: 80, cat: 'verdura' },
  { n: 'Cenoura crua', k: 34, p: 1.3, c: 7.7, f: 0.2, fb: 3.2, g: 50, cat: 'verdura' },
  { n: 'Cenoura cozida', k: 30, p: 0.8, c: 6.7, f: 0.2, fb: 2.6, g: 80, cat: 'verdura' },
  { n: 'Abobrinha cozida', k: 15, p: 1.1, c: 3.0, f: 0.2, fb: 1.6, g: 80, cat: 'verdura' },
  { n: 'Abóbora cabotiá cozida', k: 48, p: 1.4, c: 10.8, f: 0.7, fb: 2.5, g: 100, cat: 'verdura' },
  { n: 'Chuchu cozido', k: 19, p: 0.4, c: 4.8, f: 0, fb: 1.0, g: 80, cat: 'verdura' },
  { n: 'Couve refogada', k: 90, p: 1.7, c: 8.7, f: 6.6, fb: 5.7, g: 50, cat: 'verdura' },
  { n: 'Espinafre refogado', k: 67, p: 2.7, c: 4.2, f: 5.4, fb: 2.5, g: 60, cat: 'verdura' },
  { n: 'Pepino', k: 10, p: 0.9, c: 2.0, f: 0, fb: 1.1, g: 60, cat: 'verdura' },
  { n: 'Beterraba cozida', k: 32, p: 1.3, c: 7.2, f: 0.1, fb: 1.9, g: 60, cat: 'verdura' },
  { n: 'Repolho cru', k: 17, p: 0.9, c: 3.9, f: 0.1, fb: 1.9, g: 50, cat: 'verdura' },
  { n: 'Vagem cozida', k: 25, p: 1.2, c: 5.3, f: 0.3, fb: 2.4, g: 80, cat: 'verdura' },
  { n: 'Couve-flor cozida', k: 19, p: 1.2, c: 3.9, f: 0.3, fb: 2.1, g: 80, cat: 'verdura' },
  // frutas
  { n: 'Banana nanica', k: 92, p: 1.4, c: 23.8, f: 0.1, fb: 1.9, g: 100, cat: 'fruta' },
  { n: 'Pera', k: 53, p: 0.6, c: 14.0, f: 0.1, fb: 3.0, g: 130, cat: 'fruta' },
  { n: 'Kiwi', k: 51, p: 1.3, c: 11.5, f: 0.6, fb: 2.7, g: 75, cat: 'fruta' },
  { n: 'Melão', k: 29, p: 0.7, c: 7.5, f: 0, fb: 0.3, g: 150, cat: 'fruta' },
  { n: 'Goiaba', k: 54, p: 1.1, c: 13.0, f: 0.4, fb: 6.2, g: 150, cat: 'fruta' },
  { n: 'Tangerina', k: 38, p: 0.8, c: 9.6, f: 0.1, fb: 0.9, g: 120, cat: 'fruta' },
  { n: 'Maracujá (polpa)', k: 68, p: 2.0, c: 12.3, f: 2.1, fb: 1.1, g: 50, cat: 'fruta' },
  { n: 'Açaí polpa sem açúcar', k: 58, p: 0.8, c: 6.2, f: 3.9, fb: 2.6, g: 100, cat: 'fruta' },
  { n: 'Uva passa', k: 299, p: 2.5, c: 79.0, f: 0.5, fb: 3.7, g: 20, cat: 'fruta' },
  // gorduras e sementes
  { n: 'Castanha-do-pará', k: 643, p: 14.5, c: 15.1, f: 63.5, fb: 7.9, g: 10, cat: 'lanche' },
  { n: 'Nozes', k: 620, p: 14.0, c: 18.4, f: 59.4, fb: 7.2, g: 20, cat: 'lanche' },
  { n: 'Amêndoas', k: 581, p: 18.6, c: 29.5, f: 47.3, fb: 11.6, g: 20, cat: 'lanche' },
  { n: 'Semente de chia', k: 486, p: 16.5, c: 42.0, f: 30.7, fb: 34.4, g: 10, cat: 'lanche' },
  { n: 'Linhaça', k: 495, p: 14.1, c: 43.3, f: 32.3, fb: 33.5, g: 10, cat: 'lanche' },
  { n: 'Mel', k: 309, p: 0.3, c: 84.0, f: 0, fb: 0, g: 15, cat: 'lanche' },
  { n: 'Barra de proteína (varia por marca)', k: 350, p: 30.0, c: 35.0, f: 10.0, fb: 5.0, g: 45, cat: 'lanche' },
  { n: 'Chocolate 70% cacau', k: 580, p: 7.8, c: 45.9, f: 42.6, fb: 10.9, g: 20, cat: 'besteira' },
  // pratos prontos comuns
  { n: 'Feijoada', k: 117, p: 8.7, c: 11.6, f: 6.5, fb: 5.1, g: 225, cat: 'base' },
  { n: 'Strogonoff de frango', k: 157, p: 17.5, c: 2.6, f: 8.0, fb: 0.3, g: 200, cat: 'base' },
  { n: 'Lasanha à bolonhesa', k: 140, p: 8.0, c: 14.0, f: 6.0, fb: 1.0, g: 250, cat: 'besteira' },
  { n: 'Omelete simples (2 ovos)', k: 190, p: 13.0, c: 1.0, f: 15.0, fb: 0, g: 110, cat: 'base' }
);

// Papel de cada alimento no cardápio: r = proteína (prot), laticínio (lat), pão/base do café (pao), carboidrato do almoço (carb),
// leguminosa (leg), verdura (veg), fruta, gordura (gord), azeite (oleo); ml = refeições onde cabe (c café, a almoço, l lanche, j jantar);
// un = [g por unidade, singular, plural]; md = [medida caseira, g]; mn/mx = limites em g; cru = g comprados por g comido (arroz cozido → cru)
const META = {
  'Arroz branco cozido': { r: 'carb', ml: 'aj', md: ['col. sopa', 25], cru: 0.4, buyN: 'Arroz branco' },
  'Arroz integral cozido': { r: 'carb', ml: 'aj', md: ['col. sopa', 25], cru: 0.4, buyN: 'Arroz integral' },
  'Macarrão cozido': { r: 'carb', ml: 'aj', md: ['pegador', 50], cru: 0.45, buyN: 'Macarrão' },
  'Macarrão integral cozido': { r: 'carb', ml: 'aj', md: ['pegador', 50], cru: 0.45, buyN: 'Macarrão integral' },
  'Batata-doce cozida': { r: 'carb', ml: 'acjl', md: ['pedaço médio', 80], cru: 1.1, buyN: 'Batata-doce' },
  'Batata inglesa cozida': { r: 'carb', ml: 'aj', md: ['unidade média', 120], cru: 1.1, buyN: 'Batata' },
  'Mandioca cozida': { r: 'carb', ml: 'aj', md: ['pedaço', 80], cru: 1.15, buyN: 'Mandioca' },
  'Inhame cozido': { r: 'carb', ml: 'acj', md: ['pedaço', 80], cru: 1.1, buyN: 'Inhame' },
  'Mandioquinha cozida': { r: 'carb', ml: 'aj', md: ['unidade', 70], cru: 1.1, buyN: 'Mandioquinha' },
  'Quinoa cozida': { r: 'carb', ml: 'aj', md: ['col. sopa', 20], cru: 0.35, buyN: 'Quinoa' },
  'Cuscuz de milho cozido': { r: 'pao', ml: 'cajl', md: ['fatia', 100], cru: 0.45, buyN: 'Flocão de milho', mn: 80, mx: 250 },
  'Tapioca (1 disco ≈ 50 g de goma)': { r: 'pao', ml: 'cl', un: [50, 'tapioca', 'tapiocas'], buyN: 'Goma de tapioca' },
  'Pão francês (1 un ≈ 50 g)': { r: 'pao', ml: 'cl', un: [50, 'pão francês', 'pães franceses'] },
  'Pão integral (fatia ≈ 25 g)': { r: 'pao', ml: 'cln', un: [25, 'fatia', 'fatias'], buyN: 'Pão integral (pacote ≈ 20 fatias)' },
  'Pão de forma tradicional (fatia ≈ 25 g)': { r: 'pao', ml: 'cl', un: [25, 'fatia', 'fatias'], buyN: 'Pão de forma (pacote ≈ 20 fatias)' },
  'Aveia em flocos': { r: 'pao', ml: 'cln', md: ['col. sopa', 10], mn: 20, mx: 60 },
  'Biscoito de arroz (1 un ≈ 9 g)': { r: 'pao', ml: 'cln', un: [9, 'biscoito de arroz', 'biscoitos de arroz'] },
  'Milho verde (lata, escorrido)': { r: 'veg', ml: 'aj', md: ['col. sopa', 20] },
  'Feijão carioca cozido': { r: 'leg', ml: 'aj', md: ['concha', 140], cru: 0.42, buyN: 'Feijão carioca' },
  'Feijão preto cozido': { r: 'leg', ml: 'aj', md: ['concha', 140], cru: 0.42, buyN: 'Feijão preto' },
  'Lentilha cozida': { r: 'leg', ml: 'aj', md: ['concha', 140], cru: 0.4, buyN: 'Lentilha' },
  'Grão-de-bico cozido': { r: 'leg', ml: 'aj', md: ['col. sopa', 25], cru: 0.45, buyN: 'Grão-de-bico' },
  'Ervilha (lata, escorrida)': { r: 'leg', ml: 'aj', md: ['col. sopa', 20] },
  'Peito de frango grelhado': { r: 'prot', ml: 'aj', md: ['filé', 100], cru: 1.35, buyN: 'Peito de frango' },
  'Frango desfiado (peito cozido)': { r: 'prot', ml: 'cajl', md: ['col. sopa', 25], cru: 1.35, buyN: 'Peito de frango' },
  'Sobrecoxa de frango assada (sem pele)': { r: 'prot', ml: 'aj', un: [90, 'sobrecoxa', 'sobrecoxas'], cru: 1.4, buyN: 'Sobrecoxa de frango' },
  'Patinho grelhado': { r: 'prot', ml: 'aj', md: ['bife', 100], cru: 1.35, buyN: 'Patinho' },
  'Carne moída (patinho) refogada': { r: 'prot', ml: 'aj', md: ['col. sopa', 25], cru: 1.35, buyN: 'Patinho moído' },
  'Alcatra grelhada': { r: 'prot', ml: 'aj', md: ['bife', 100], cru: 1.35, buyN: 'Alcatra' },
  'Contrafilé grelhado': { r: 'prot', ml: 'aj', md: ['bife', 100], cru: 1.35, buyN: 'Contrafilé' },
  'Fígado bovino grelhado': { r: 'prot', ml: 'aj', md: ['bife', 100], cru: 1.3, buyN: 'Fígado bovino' },
  'Lombo de porco assado': { r: 'prot', ml: 'aj', md: ['fatia', 60], cru: 1.4, buyN: 'Lombo de porco' },
  'Bisteca de porco grelhada': { r: 'prot', ml: 'aj', un: [100, 'bisteca', 'bistecas'], cru: 1.35, buyN: 'Bisteca de porco' },
  'Tilápia grelhada': { r: 'prot', ml: 'aj', md: ['filé', 100], cru: 1.3, buyN: 'Filé de tilápia' },
  'Salmão grelhado': { r: 'prot', ml: 'aj', md: ['posta', 120], cru: 1.3, buyN: 'Salmão' },
  'Merluza assada': { r: 'prot', ml: 'aj', md: ['filé', 100], cru: 1.3, buyN: 'Filé de merluza' },
  'Atum em lata (água)': { r: 'prot', ml: 'ajl', un: [120, 'lata', 'latas'], buyN: 'Atum em lata (água)' },
  'Sardinha em lata (óleo, escorrida)': { r: 'prot', ml: 'aj', un: [85, 'lata', 'latas'], mx: 85 },
  'Camarão cozido': { r: 'prot', ml: 'aj', md: ['col. sopa', 25], cru: 1.3, buyN: 'Camarão limpo' },
  'Tofu firme': { r: 'prot', ml: 'cajln', md: ['fatia', 40], buyN: 'Tofu' },
  'Ovo cozido (1 un ≈ 50 g)': { r: 'prot', ml: 'cjln', un: [50, 'ovo cozido', 'ovos cozidos'], mx: 150, buyN: 'Ovos' },
  'Ovo frito (1 un ≈ 50 g)': { r: 'prot', ml: 'c', un: [50, 'ovo frito', 'ovos fritos'], mx: 150, buyN: 'Ovos' },
  'Omelete simples (2 ovos)': { r: 'prot', ml: 'cj', un: [110, 'omelete (2 ovos)', 'omeletes (2 ovos cada)'], mn: 110, mx: 220 },
  'Clara de ovo cozida': { r: 'prot', ml: 'cl', un: [30, 'clara', 'claras'], buyN: 'Ovos (só as claras)' },
  'Leite integral (ml)': { r: 'lat', ml: 'cln', md: ['copo', 200], mn: 150, mx: 300 },
  'Leite desnatado (ml)': { r: 'lat', ml: 'cln', md: ['copo', 200], mn: 150, mx: 300 },
  'Leite sem lactose semidesnatado (ml)': { r: 'lat', ml: 'cln', md: ['copo', 200], mn: 150, mx: 300 },
  'Bebida vegetal de aveia (ml)': { r: 'lat', ml: 'cln', md: ['copo', 200], mn: 150, mx: 300 },
  'Bebida vegetal de amêndoas sem açúcar (ml)': { r: 'lat', ml: 'cl', md: ['copo', 200], mn: 150, mx: 300 },
  'Iogurte natural': { r: 'lat', ml: 'cln', un: [170, 'pote', 'potes'], mn: 170, mx: 340 },
  'Iogurte natural desnatado': { r: 'lat', ml: 'cln', un: [170, 'pote', 'potes'], mn: 170, mx: 340 },
  'Queijo minas frescal': { r: 'lat', ml: 'cln', md: ['fatia', 30], mn: 30, mx: 60 },
  'Queijo cottage': { r: 'lat', ml: 'cln', md: ['col. sopa', 25], mn: 50, mx: 150 },
  'Ricota': { r: 'lat', ml: 'cln', md: ['fatia', 40], mn: 40, mx: 100 },
  'Whey protein (varia por marca)': { r: 'lat', ml: 'cln', md: ['scoop', 30], mn: 20, mx: 40 },
  'Banana prata': { r: 'fruta', ml: 'cln', un: [70, 'banana prata', 'bananas prata'] },
  'Banana nanica': { r: 'fruta', ml: 'cln', un: [100, 'banana nanica', 'bananas nanica'] },
  'Maçã': { r: 'fruta', ml: 'cajln', un: [130, 'maçã', 'maçãs'] },
  'Pera': { r: 'fruta', ml: 'cajl', un: [130, 'pera', 'peras'] },
  'Mamão papaia': { r: 'fruta', ml: 'cln', md: ['meia papaia', 150] },
  'Laranja': { r: 'fruta', ml: 'cajl', un: [150, 'laranja', 'laranjas'] },
  'Tangerina': { r: 'fruta', ml: 'cajl', un: [120, 'tangerina', 'tangerinas'] },
  'Morango': { r: 'fruta', ml: 'cln', md: ['xícara', 100] },
  'Uva': { r: 'fruta', ml: 'cl', md: ['cacho pequeno', 100] },
  'Abacaxi': { r: 'fruta', ml: 'cajl', md: ['fatia', 100] },
  'Melancia': { r: 'fruta', ml: 'cajl', md: ['fatia', 200] },
  'Melão': { r: 'fruta', ml: 'cajl', md: ['fatia', 150] },
  'Manga': { r: 'fruta', ml: 'cl', md: ['meia manga', 150] },
  'Kiwi': { r: 'fruta', ml: 'cln', un: [75, 'kiwi', 'kiwis'] },
  'Goiaba': { r: 'fruta', ml: 'cajl', un: [150, 'goiaba', 'goiabas'] },
  'Açaí polpa sem açúcar': { r: 'fruta', ml: 'cl', un: [100, 'polpa', 'polpas'] },
  'Abacate': { r: 'gord', ml: 'cl', md: ['col. sopa', 30], mn: 30, mx: 100 },
  'Pasta de amendoim': { r: 'gord', ml: 'cln', md: ['col. sopa', 15], mn: 10, mx: 30 },
  'Castanha-de-caju': { r: 'gord', ml: 'cln', md: ['punhado', 20], mn: 10, mx: 30 },
  'Castanha-do-pará': { r: 'gord', ml: 'cl', un: [5, 'castanha-do-pará', 'castanhas-do-pará'], mn: 5, mx: 20 },
  'Nozes': { r: 'gord', ml: 'cln', md: ['punhado', 20], mn: 10, mx: 30 },
  'Amêndoas': { r: 'gord', ml: 'cln', md: ['punhado', 20], mn: 10, mx: 30 },
  'Amendoim torrado': { r: 'gord', ml: 'l', md: ['punhado', 20], mn: 10, mx: 30 },
  'Semente de chia': { r: 'gord', ml: 'cl', md: ['col. sopa', 10], mn: 10, mx: 20 },
  'Linhaça': { r: 'gord', ml: 'cl', md: ['col. sopa', 10], mn: 10, mx: 20 },
  'Azeite de oliva': { r: 'oleo', ml: 'aj', md: ['col. sopa', 8], mn: 4, mx: 16 },
  'Alface': { r: 'veg', ml: 'aj', md: ['prato raso', 40] },
  'Tomate': { r: 'veg', ml: 'aj', un: [80, 'tomate', 'tomates'] },
  'Salada (alface e tomate)': { r: 'veg', ml: 'aj', md: ['prato raso', 80], buyN: 'Alface e tomate (salada)' },
  'Brócolis cozido': { r: 'veg', ml: 'aj', md: ['ramo', 40] },
  'Cenoura crua': { r: 'veg', ml: 'aj', md: ['col. sopa ralada', 12] },
  'Cenoura cozida': { r: 'veg', ml: 'aj', md: ['col. sopa', 25] },
  'Abobrinha cozida': { r: 'veg', ml: 'aj', md: ['col. sopa', 25] },
  'Abóbora cabotiá cozida': { r: 'veg', ml: 'aj', md: ['pedaço', 50] },
  'Chuchu cozido': { r: 'veg', ml: 'aj', md: ['col. sopa', 25] },
  'Couve refogada': { r: 'veg', ml: 'aj', md: ['col. sopa', 20] },
  'Espinafre refogado': { r: 'veg', ml: 'aj', md: ['col. sopa', 25] },
  'Pepino': { r: 'veg', ml: 'aj', md: ['rodelas (meio pepino)', 60] },
  'Beterraba cozida': { r: 'veg', ml: 'aj', md: ['col. sopa', 20] },
  'Repolho cru': { r: 'veg', ml: 'aj', md: ['col. sopa', 12] },
  'Vagem cozida': { r: 'veg', ml: 'aj', md: ['col. sopa', 20] },
  'Couve-flor cozida': { r: 'veg', ml: 'aj', md: ['ramo', 40] }
};
for (const fd of FOODS) { Object.assign(fd, META[fd.n] || {}); if (fd.r === 'prot') fd.cat = 'proteina'; if (fd.r === 'veg') fd.cat = 'verdura'; }

export const MEALS = [
  { id: 'cafe', n: 'Café da manhã', ico: '朝', h: [4, 10] },
  { id: 'almoco', n: 'Almoço', ico: '昼', h: [11, 14] },
  { id: 'lanche', n: 'Lanche da tarde', ico: '間', h: [15, 17] },
  { id: 'jantar', n: 'Jantar', ico: '夜', h: [18, 21] },
  { id: 'ceia', n: 'Ceia', ico: '寝', h: [21, 23], opt: true },
  { id: 'extra', n: 'Beliscos e extras', ico: '他', h: [22, 3] }
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

// Restrições e alergias: o que cada uma evita, como reconhecer pelo nome (alimentos digitados à mão) e trocas possíveis
// g: alergia (lista da Anvisa RDC 26/2015 + as que a UE exige a mais), intol (intolerância/condição), dieta (escolha ou dieta)
const LEITE = /leite|iogurte|queijo|requeij[aã]o|manteiga|whey|creme de leite|sorvete|chocolate ao leite|pizza|p[aã]o de queijo|\bnata\b|coalhada|ricota|mussarela|parmes[aã]o|cream cheese|chantilly|doce de leite|leite condensado|case[ií]na|soro de leite/;
const GLUTEN = /trigo|macarr[aã]o|(?<!sorvete de )massa|lasanha|espaguete|nhoque|p[aã]o(?! de queijo)|pizza|hamb[uú]rguer|sandu[ií]che|coxinha|pastel|esfiha|biscoito|bolacha|bolo|cerveja|aveia|granola|barra de cereal|torrada|cevada|centeio|malte|cuscuz marroquino|semolina|farinha(?! de (?:mandioca|milho|arroz))|empanad|milanesa|kibe|quibe/;
const CARNE = /frango|carne|contrafil|fil[eé] mignon|cordeiro|\bpato\b|\bperu\b|chester|patinho|alcatra|picanha|bife|cox[aã]o|maminha|fraldinha|costela|cupim|lagarto|m[uú]sculo|ac[eé]m|f[ií]gado|porco|lombo|pernil|bacon|presunto|salsicha|lingui[cç]a|salame|mortadela|peito de peru|hamb[uú]rguer|coxinha|nuggets?|kibe|quibe|alm[oô]ndega|strogonoff|feijoada/;
const PEIXE = /peixe|atum|til[aá]pia|sardinha|salm[aã]o|bacalhau|merluza|pescada|robalo|truta|anchova|sushi|sashimi/;
const CRUST = /camar[aã]o|lagosta|caranguejo|siri|lagostim/;
const MOLUSC = /lula|polvo|mexilh[aã]o|marisco|ostra|vieira|sururu|lambreta/;
export const RESTR = {
  // alergias
  leite: { g: 'alergia', n: 'Leite e derivados', re: LEITE, swap: 'bebidas vegetais (aveia, arroz, coco), queijos veganos; confira o rótulo' },
  ovo: { g: 'alergia', n: 'Ovo', re: /\bovos?\b|omelete|maionese|gemada|merengue|suspiro|clara de ovo|albumina/, swap: 'frango, atum, tofu, iogurte; na receita, linhaça hidratada' },
  gluten: { g: 'alergia', n: 'Glúten (trigo, centeio, cevada, aveia)', re: GLUTEN, swap: 'arroz, batata, mandioca, tapioca, cuscuz de milho, pão de queijo' },
  amendoim: { g: 'alergia', n: 'Amendoim', re: /amendoim|pa[cç]oca|p[eé] de moleque/, swap: 'sementes de girassol ou abóbora' },
  castanhas: { g: 'alergia', n: 'Castanhas e nozes', re: /castanha|\bnoz\b|nozes|am[eê]ndoa|avel[aã]|pistache|macad[aâ]mia|pec[aã]|pinoli|pinh[aã]o|nutella|praline/, swap: 'sementes de girassol ou abóbora' },
  soja: { g: 'alergia', n: 'Soja', re: /\bsoja|tofu|shoyu|edamame|miss[oô]|prote[ií]na texturizada|lecitina de soja/, swap: 'grão-de-bico, lentilha, ervilha' },
  peixe: { g: 'alergia', n: 'Peixes', re: PEIXE, swap: 'frango, ovos, carne magra' },
  crustaceos: { g: 'alergia', n: 'Crustáceos (camarão, lagosta…)', re: CRUST, swap: 'frango, peixe (se tolerar), ovos' },
  moluscos: { g: 'alergia', n: 'Moluscos (lula, polvo…)', re: MOLUSC, swap: 'frango, peixe (se tolerar), ovos' },
  gergelim: { g: 'alergia', n: 'Gergelim', re: /gergelim|tahine|tahini|homus|hummus/, swap: 'sementes de girassol ou abóbora' },
  mostarda: { g: 'alergia', n: 'Mostarda', re: /mostarda/, swap: 'temperos com ervas, limão' },
  aipo: { g: 'alergia', n: 'Aipo (salsão)', re: /aipo|sals[aã]o/, swap: 'cebola, alho-poró' },
  tremoco: { g: 'alergia', n: 'Tremoço', re: /tremo[cç]o/, swap: 'grão-de-bico, ervilha' },
  sulfitos: { g: 'alergia', n: 'Sulfitos', re: /vinho|sulfito|metabissulfito|frutas? secas?|uva passa|damasco seco/, swap: 'frutas frescas' },
  latex: { g: 'alergia', n: 'Látex (reação cruzada: banana, abacate, kiwi)', re: /banana|abacate|kiwi|castanha/, swap: 'maçã, pera, mamão, morango' },
  // intolerâncias e condições
  lactose: { g: 'intol', n: 'Lactose', re: LEITE, swap: 'versões sem lactose, bebida vegetal, whey isolado (confira o rótulo)' },
  celiaca: { g: 'intol', n: 'Doença celíaca (glúten, até traços)', re: GLUTEN, swap: 'arroz, batata, mandioca, tapioca, cuscuz de milho; só produtos "sem glúten"' },
  frutose: { g: 'intol', n: 'Frutose / FODMAP', re: /mel\b|maç[aã]|pera|manga|melancia|xarope|frutose|refri|suco|cebola|alho|feij[aã]o|gr[aã]o-de-bico|lentilha|trigo/, swap: 'morango, laranja, banana firme, arroz, batata, aveia' },
  histamina: { g: 'intol', n: 'Histamina', re: /vinho|cerveja|queijo|salame|presunto|lingui[cç]a|atum|sardinha|tomate|espinafre|berinjela|abacate|chocolate|morango|fermentad|kombucha|chucrute|shoyu/, swap: 'carnes e peixes frescos, arroz, batata, frutas frescas exceto morango' },
  // dieta e escolhas
  alcool: { g: 'dieta', n: 'Álcool', re: /cerveja|vinho|vodka|cacha[cç]a|whisky|u[ií]sque|\bgin\b|drink|caipirinha|chopp?|espumante|licor|tequila|\brum\b|saqu[eê]|[aá]lcool/, swap: 'água com gás e limão, chá gelado sem açúcar, kombucha' },
  acucar: { g: 'dieta', n: 'Açúcar refinado', re: /a[cç][uú]car|refri|chocolate|\bdoce|bolo|biscoito recheado|sorvete|\bbala\b|brigadeiro|xarope|leite condensado|pudim|torta|nutella|barra de cereal|granola|geleia|achocolatado|pa[cç]oca/, swap: 'frutas (banana, manga, uva), iogurte natural com fruta, pasta de amendoim sem açúcar' },
  massa: { g: 'dieta', n: 'Massas (macarrão, pão, pizza)', re: /macarr[aã]o|(?<!sorvete de )massa|lasanha|espaguete|nhoque|p[aã]o(?! de queijo)|pizza|hamb[uú]rguer|sandu[ií]che|coxinha|pastel|esfiha|torrada|bolo|biscoito/, swap: 'arroz, batata-doce, batata, cuscuz de milho, mandioca, tapioca' },
  frituras: { g: 'dieta', n: 'Frituras', re: /frit[oa]|empanad|milanesa|pastel|coxinha|salgadinho|nuggets?|batata palha|torresmo|chips/, swap: 'assado, grelhado, cozido ou na airfryer' },
  ultra: { g: 'dieta', n: 'Ultraprocessados', re: /salgadinho|biscoito recheado|refri|salsicha|nuggets?|miojo|lamen instant|embutido|presunto|mortadela|salame|sorvete|achocolatado|empanado|congelado|refei[cç][aã]o pronta|bebida l[aá]ctea|barra de cereal/, swap: 'comida de verdade: arroz, feijão, ovos, carnes frescas, frutas' },
  cafeina: { g: 'dieta', n: 'Cafeína', re: /caf[eé]|expresso|cappuccino|energ[eé]tico|pr[eé]-treino|ch[aá] (?:preto|verde|mate)|mate\b|guaran[aá]|coca|cola\b/, swap: 'chás de ervas (camomila, hortelã), café descafeinado' },
  carneVermelha: { g: 'dieta', n: 'Carne vermelha', re: /carne|contrafil|fil[eé] mignon|cordeiro|patinho|alcatra|picanha|bife|cox[aã]o|maminha|fraldinha|costela|cupim|lagarto|m[uú]sculo|ac[eé]m|f[ií]gado|porco|lombo|pernil|bacon|hamb[uú]rguer|kibe|quibe|alm[oô]ndega/, swap: 'frango, peixe, ovos, feijão' },
  porco: { g: 'dieta', n: 'Carne de porco', re: /porco|lombo|pernil|bacon|presunto|salsicha|lingui[cç]a|salame|mortadela|torresmo|costelinha|feijoada/, swap: 'frango, carne bovina, peixe' },
  carne: { g: 'dieta', n: 'Vegetariana (sem carnes e peixes)', re: new RegExp(`${CARNE.source}|${PEIXE.source}|${CRUST.source}|${MOLUSC.source}`), swap: 'ovos, feijão, lentilha, grão-de-bico, tofu, iogurte' },
  vegano: { g: 'dieta', n: 'Vegana (nada de origem animal)', re: new RegExp(`${CARNE.source}|${PEIXE.source}|${CRUST.source}|${MOLUSC.source}|${LEITE.source}|\\bovos?\\b|omelete|maionese|\\bmel\\b`), swap: 'feijão, lentilha, grão-de-bico, tofu, bebidas vegetais' }
};
export const RESTR_GROUPS = { alergia: 'Alergias', intol: 'Intolerâncias', dieta: 'Dieta e escolhas' };
const RNORM = s => String(s).toLowerCase();
// "sem lactose", "sem açúcar", "sem glúten" e "zero" tiram a marcação correspondente
export const restrOf = name => {
  const t = RNORM(name), out = Object.keys(RESTR).filter(k => RESTR[k].re.test(t));
  const drop = new Set([...(/sem lactose|zero lactose/.test(t) ? ['lactose'] : []), ...(/sem a[cç][uú]car|zero a[cç][uú]car|\bzero\b/.test(t) ? ['acucar'] : []), ...(/sem gl[uú]ten/.test(t) ? ['gluten', 'celiaca'] : [])]);
  return out.filter(k => !drop.has(k));
};
