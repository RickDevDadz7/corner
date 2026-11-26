// ============================================================
// RONIN — Mobilidade: aquecimento, alongamento, mobilidade articular e desaceleração.
// Funções puras: biblioteca + gerador de rotina (sem DOM).
// Regras (Behm 2016; Thomas 2018; Van Hooren & Peake 2018):
//  - antes do treino: aquecimento dinâmico + mobilidade; nada de alongamento estático longo
//  - flexibilidade se ganha com tempo somado de alongamento na semana, fora do aquecimento
//  - desaceleração é opcional e pra baixar o ritmo; não acelera recuperação nem previne todas as lesões
// ============================================================

export const MCATS = { aq: 'Aquecimento', al: 'Alongamento', mob: 'Mobilidade', rel: 'Desaceleração' };
export const REGIONS = { geral: 'Corpo todo', pescoco: 'Pescoço', ombro: 'Ombros', peito: 'Peito', punho: 'Cotovelos e punhos', toracica: 'Coluna torácica', lombar: 'Coluna lombar', quadril: 'Quadril', adutor: 'Adutores', posterior: 'Posterior da coxa', quadriceps: 'Quadríceps', joelho: 'Joelhos', panturrilha: 'Panturrilha', tornozelo: 'Tornozelos' };
export const MOMENTS = { antes: 'Antes do treino', flex: 'Flexibilidade', depois: 'Depois do treino', descanso: 'Dia de descanso' };
export const LVL = ['', 'Iniciante', 'Intermediário', 'Avançado'];
const STRIKE = ['boxe', 'muaythai', 'karate', 'mma'], KICK = ['muaythai', 'karate', 'mma'];

// d = segundos (por lado quando side); pos: pe | parede | chao (a rotina agrupa pra trocar pouco de posição)
const M = (n, cat, reg, pos, d, o = {}) => ({ n, cat, reg, pos, d, side: !!o.side, lvl: o.lvl || 1, sp: o.sp || null, ex: o.ex || null, warm: !!o.warm, how: o.how || [], err: o.err || [], care: o.care || '' });
export const MOB = {
  // ---------- aquecimento dinâmico ----------
  polichinelo: M('Polichinelo', 'aq', ['geral'], 'pe', 45, { warm: true, how: ['Pés juntos, braços ao lado do corpo.', 'Salta abrindo pernas e braços, salta de novo fechando.', 'Ritmo leve: é pra aquecer, não pra cansar.'], err: ['Aterrissar com o calcanhar travado.', 'Começar rápido demais.'], care: 'Joelho ou tornozelo reclamando: troque pela marcha.' }),
  marcha: M('Elevação de joelhos (marcha)', 'aq', ['quadril', 'geral'], 'pe', 40, { warm: true, how: ['Em pé, sobe um joelho até a altura do quadril.', 'Alterna as pernas num ritmo constante, braços acompanhando.', 'Tronco alto, sem jogar o corpo pra trás.'], err: ['Curvar as costas pra subir mais o joelho.'] }),
  pulinhos: M('Pulinhos (ou corda)', 'aq', ['panturrilha', 'tornozelo', 'geral'], 'pe', 45, { warm: true, sp: ['boxe', 'muaythai', 'karate', 'mma', 'corrida'], how: ['Saltos baixos na ponta dos pés, joelho levemente dobrado.', 'Com corda, mesmo ritmo.', 'Respire solto.'], err: ['Saltar alto demais.', 'Cair com o calcanhar.'] }),
  bracosgiro: M('Rotação de ombros (círculos de braço)', 'aq', ['ombro'], 'pe', 30, { how: ['Braços esticados ao lado do corpo.', 'Círculos grandes, de baixo até em cima, sem pressa; depois inverte o sentido.', 'Movimento controlado, sem balançar o tronco.'], err: ['Encolher os ombros perto da orelha.'] }),
  abraco: M('Abre e fecha os braços', 'aq', ['peito', 'ombro'], 'pe', 30, { how: ['Braços na altura do peito.', 'Abre bem pra trás e fecha cruzando na frente, alternando qual braço passa por cima.', 'Ritmo constante.'], err: ['Arquear a lombar ao abrir.'] }),
  quadrilgiro: M('Rotação de quadril', 'aq', ['quadril', 'lombar'], 'pe', 30, { how: ['Mãos na cintura, pés na largura do quadril.', 'Desenha círculos grandes com o quadril; depois inverte.', 'Joelhos soltos.'], err: ['Mexer só o tronco.'] }),
  balancofrente: M('Balanço de perna (frente e trás)', 'aq', ['quadril', 'posterior'], 'pe', 25, { side: true, lvl: 2, sp: [...KICK, 'corrida'], how: ['Mão apoiada na parede, de lado pra ela.', 'Balança a perna de fora pra frente e pra trás, aumentando aos poucos.', 'Tronco parado, perna de apoio levemente dobrada.'], err: ['Começar já no máximo.', 'Arquear a lombar quando a perna vai pra trás.'] }),
  balancolado: M('Balanço de perna (lateral)', 'aq', ['adutor', 'quadril'], 'pe', 25, { side: true, lvl: 2, sp: [...KICK, 'jiu'], how: ['De frente pra parede, mãos apoiadas.', 'Balança a perna de um lado pro outro na frente do corpo, aumentando aos poucos.', 'Quadril de frente pra parede.'], err: ['Girar o quadril junto.'] }),
  agacha: M('Agachamento sem carga', 'aq', ['quadril', 'joelho', 'tornozelo'], 'pe', 40, { ex: 'bwsq', how: ['Pés na largura dos ombros.', 'Desce sentando pra trás, joelhos na direção da ponta dos pés.', 'Sobe pelo calcanhar. Devagar e com amplitude confortável.'], err: ['Calcanhar sair do chão.', 'Joelhos caindo pra dentro.'] }),
  avancotorcao: M('Avanço com rotação do tronco', 'aq', ['quadril', 'toracica'], 'pe', 40, { lvl: 2, sp: ['jiu', 'mma', ...STRIKE], how: ['Dá um passo à frente e desce no avanço.', 'Gira o tronco pro lado da perna da frente, braços juntos.', 'Volta e troca de perna.'], err: ['Joelho da frente passar muito do pé.', 'Girar só os braços.'] }),
  inchworm: M('Caminhada com as mãos', 'aq', ['posterior', 'ombro', 'geral'], 'chao', 40, { lvl: 2, how: ['Em pé, dobra o quadril e põe as mãos no chão (joelho pode dobrar).', 'Caminha com as mãos até a prancha.', 'Volta caminhando com as mãos e sobe.'], err: ['Deixar o quadril cair na prancha.'] }),
  mgs: M('Avanço com cotovelo ao chão', 'aq', ['quadril', 'toracica', 'adutor'], 'chao', 30, { side: true, lvl: 2, sp: ['jiu', 'mma', 'muaythai', 'karate'], how: ['Avanço longo, mãos no chão por dentro do pé da frente.', 'Desce o cotovelo em direção ao pé, depois gira e aponta a mão pro teto.', 'Volta e repete devagar.'], err: ['Joelho de trás colado no chão sem querer (pode apoiar, mas por escolha).'] }),
  skipping: M('Skipping', 'aq', ['quadril', 'panturrilha'], 'pe', 30, { lvl: 2, sp: ['corrida'], how: ['Corrida no lugar com joelho alto.', 'Pisa na frente do pé, rápido e leve.', 'Braços acompanhando.'], err: ['Inclinar pra trás.'] }),
  sombraleve: M('Sombra leve', 'aq', ['geral', 'ombro'], 'pe', 60, { sp: STRIKE, how: ['Em guarda, golpes soltos a 50% e muita movimentação.', 'Sobe o ritmo aos poucos.', 'Respira a cada golpe.'], err: ['Golpe com força total ainda frio.'] }),
  // ---------- alongamento estático ----------
  posteriorpe: M('Posterior da coxa em pé', 'al', ['posterior'], 'pe', 30, { side: true, how: ['Calcanhar num degrau baixo, perna quase esticada.', 'Inclina o tronco à frente com as costas retas até sentir atrás da coxa.', 'Respira e segura.'], err: ['Curvar as costas pra ir mais longe.'], care: 'Sente formigamento descendo pela perna: alivie.' }),
  posteriorchao: M('Posterior da coxa sentado', 'al', ['posterior'], 'chao', 30, { side: true, how: ['Sentado, uma perna esticada e a outra dobrada com a sola na coxa.', 'Inclina o tronco sobre a perna esticada, costas longas.', 'Segura sem balançar.'], err: ['Puxar o pé com força e arredondar a coluna.'] }),
  quadpe: M('Quadríceps em pé', 'al', ['quadriceps', 'quadril'], 'pe', 30, { side: true, how: ['Segura o pé atrás, calcanhar perto do glúteo.', 'Joelhos lado a lado, quadril levemente pra frente.', 'Apoie a outra mão na parede se precisar.'], err: ['Joelho abrindo pro lado.', 'Arquear a lombar.'], care: 'Dor no joelho: segure mais longe do glúteo ou faça deitado de lado.' }),
  panturrilha: M('Panturrilha na parede', 'al', ['panturrilha', 'tornozelo'], 'parede', 30, { side: true, how: ['Mãos na parede, uma perna atrás esticada.', 'Calcanhar de trás no chão, leva o quadril à frente.', 'Pé de trás apontando pra frente.'], err: ['Calcanhar subir.'] }),
  peitoporta: M('Peitoral na porta', 'al', ['peito', 'ombro'], 'parede', 30, { side: true, ex: 'doorpec', how: ['Antebraço no batente, cotovelo na altura do ombro.', 'Dá um passo à frente até sentir o peito alongar.', 'Ombro longe da orelha.'], err: ['Cotovelo acima do ombro.'], care: 'Formigamento no braço: baixe o cotovelo.' }),
  ombrocruz: M('Ombro cruzado', 'al', ['ombro'], 'pe', 30, { side: true, how: ['Leva um braço esticado na frente do peito.', 'A outra mão puxa acima do cotovelo.', 'Ombro baixo.'], err: ['Puxar pelo punho torcendo o cotovelo.'] }),
  triceps: M('Tríceps acima da cabeça', 'al', ['ombro'], 'pe', 30, { side: true, how: ['Mão atrás da cabeça, cotovelo apontando pro teto.', 'A outra mão empurra o cotovelo de leve.', 'Tronco reto.'], err: ['Arquear as costas.'] }),
  flexorquadril: M('Flexor do quadril ajoelhado', 'al', ['quadril', 'quadriceps'], 'chao', 30, { side: true, ex: 'hipflex', how: ['Meio ajoelhado, almofada embaixo do joelho.', 'Aperta o glúteo de trás e leva o quadril à frente.', 'Lombar neutra.'], err: ['Arquear a lombar em vez de mover o quadril.'] }),
  borboleta: M('Adutores (borboleta)', 'al', ['adutor', 'quadril'], 'chao', 40, { sp: [...KICK, 'jiu'], how: ['Sentado, solas dos pés juntas.', 'Costas retas, deixa os joelhos caírem pros lados.', 'Pode inclinar à frente com a coluna longa.'], err: ['Empurrar os joelhos com força.'] }),
  figura4: M('Glúteo (figura 4)', 'al', ['quadril'], 'chao', 30, { side: true, how: ['Deitado, tornozelo cruzado sobre o joelho oposto.', 'Puxa a perna de baixo em direção ao peito.', 'Cabeça e ombros relaxados no chão.'], err: ['Forçar o joelho de cima pra baixo.'] }),
  lateral: M('Lateral do tronco', 'al', ['toracica', 'lombar'], 'pe', 25, { side: true, how: ['Em pé, um braço acima da cabeça.', 'Inclina pro lado oposto, sem girar o tronco.', 'Quadril parado.'], err: ['Jogar o quadril pro lado.'] }),
  pescocolat: M('Lateral do pescoço', 'al', ['pescoco'], 'pe', 20, { side: true, how: ['Ombros baixos, olhando pra frente.', 'Leva a orelha em direção ao ombro, sem subir o ombro.', 'A mão só apoia, não puxa.'], err: ['Puxar a cabeça com força.'], care: 'Tontura, dormência ou dor que desce pro braço: pare.' }),
  antebraco: M('Antebraço e punho', 'al', ['punho'], 'pe', 20, { side: true, sp: STRIKE, how: ['Braço esticado à frente.', 'Com a outra mão, leva os dedos pra trás (palma pra frente); depois pra baixo.', 'Suave.'], err: ['Forçar com o cotovelo dobrado.'] }),
  cossack: M('Agachamento lateral parado', 'al', ['adutor', 'quadril'], 'pe', 30, { side: true, lvl: 2, sp: [...KICK, 'jiu'], how: ['Pernas bem afastadas.', 'Desce pra um lado, a outra perna esticada com o pé pra cima.', 'Peito aberto, calcanhar do lado dobrado no chão.'], err: ['Joelho do lado dobrado cair pra dentro.'] }),
  // ---------- mobilidade articular ----------
  pescocorot: M('Rotação do pescoço', 'mob', ['pescoco'], 'pe', 30, { how: ['Ombros baixos.', 'Gira a cabeça devagar pra olhar por cima de um ombro, depois do outro.', 'Até onde for confortável.'], err: ['Fazer círculos rápidos com a cabeça.'] }),
  queixo: M('Retração do queixo', 'mob', ['pescoco'], 'pe', 30, { ex: 'chintuck', how: ['Olhando pra frente, leva o queixo pra trás em linha reta.', 'Segura 3 s e solta.', 'Não olha pra baixo.'], err: ['Inclinar a cabeça.'] }),
  carombro: M('CARs de ombro', 'mob', ['ombro'], 'pe', 30, { side: true, lvl: 2, sp: ['boxe', 'jiu', 'mma'], how: ['Em pé, aperta o abdômen e o punho do outro lado.', 'Desenha o maior círculo possível com o braço, bem devagar.', 'O tronco não se mexe.'], err: ['Arquear a lombar quando o braço passa por cima.'] }),
  anjo: M('Anjo na parede', 'mob', ['ombro', 'toracica'], 'parede', 40, { ex: 'wallangel', how: ['Costas, cabeça e braços encostados na parede.', 'Sobe e desce os braços sem descolar nada.', 'Só até onde mantém o contato.'], err: ['Arquear a lombar pra subir mais.'] }),
  punhocirc: M('Círculos de punho', 'mob', ['punho'], 'pe', 30, { sp: STRIKE, how: ['Dedos entrelaçados ou mãos soltas.', 'Círculos lentos nos dois sentidos.', 'Abre e fecha as mãos no fim.'], err: [] }),
  punhochao: M('Punho no chão', 'mob', ['punho'], 'chao', 30, { lvl: 2, sp: ['jiu', 'mma'], how: ['De quatro, mãos embaixo dos ombros.', 'Balança o corpo devagar pra frente e pra trás.', 'Depois com os dedos virados pra você, bem leve.'], err: ['Pôr peso demais logo de cara.'], care: 'Dor aguda no punho: pare.' }),
  rottoracica: M('Rotação torácica em 4 apoios', 'mob', ['toracica'], 'chao', 30, { side: true, ex: 'thrrot', sp: ['boxe', 'jiu', 'mma', 'muaythai'], how: ['De quatro, mão atrás da cabeça.', 'Gira o cotovelo pro teto acompanhando com o olhar.', 'O quadril fica parado.'], err: ['Girar o quadril junto.'] }),
  exttoracica: M('Extensão torácica no rolo', 'mob', ['toracica'], 'chao', 40, { lvl: 2, ex: 'thext', how: ['Rolo ou toalha enrolada embaixo das escápulas.', 'Mãos atrás da cabeça, estende a parte alta das costas.', 'A lombar não arqueia.'], err: ['Rolar na lombar.'] }),
  gatocamelo: M('Gato-camelo', 'mob', ['lombar', 'toracica'], 'chao', 40, { ex: 'catcamel', how: ['De quatro.', 'Arredonda as costas soltando o ar, depois desce a barriga olhando à frente.', 'Lento, sem forçar o fim.'], err: ['Fazer rápido.'] }),
  pelve: M('Báscula da pelve deitado', 'mob', ['lombar'], 'chao', 30, { how: ['Deitado, joelhos dobrados.', 'Encosta a lombar no chão girando a pelve, depois solta.', 'Movimento pequeno e lento.'], err: ['Tirar o quadril do chão.'] }),
  carquadril: M('CARs de quadril', 'mob', ['quadril'], 'chao', 30, { side: true, lvl: 2, sp: [...KICK, 'jiu'], how: ['De quatro (ou em pé apoiado).', 'Sobe o joelho pro lado e desenha o maior círculo possível com o quadril, devagar.', 'O tronco não gira.'], err: ['Rodar o tronco junto.'] }),
  noventa: M('90/90 de quadril', 'mob', ['quadril'], 'chao', 45, { lvl: 2, sp: ['jiu', 'mma', 'muaythai', 'karate'], how: ['Sentado, as duas pernas dobradas a 90° pro mesmo lado.', 'Gira os joelhos pro outro lado, sem usar as mãos se conseguir.', 'Alterna devagar.'], err: ['Despencar o tronco pra trás.'] }),
  agachafundo: M('Agachamento profundo assistido', 'mob', ['quadril', 'tornozelo'], 'pe', 40, { how: ['Segura num batente ou poste.', 'Desce o mais fundo confortável, calcanhar no chão.', 'Balança de leve de um lado pro outro.'], err: ['Deixar o calcanhar subir.'], care: 'Joelho operado ou dolorido: pare antes do ponto de dor.' }),
  calcanhar: M('Deslizar o calcanhar deitado', 'mob', ['joelho'], 'chao', 30, { side: true, how: ['Deitado, pernas esticadas.', 'Desliza o calcanhar até o glúteo dobrando o joelho e volta.', 'Sem dor.'], err: [] }),
  tornozeloparede: M('Joelho na parede (tornozelo)', 'mob', ['tornozelo'], 'parede', 30, { side: true, sp: ['corrida', ...STRIKE], how: ['De frente pra parede, pé a um palmo dela.', 'Leva o joelho até a parede sem tirar o calcanhar do chão.', 'Vai e volta devagar.'], err: ['Joelho cair pra dentro.'] }),
  tornozelocirc: M('Círculos de tornozelo', 'mob', ['tornozelo'], 'pe', 20, { side: true, how: ['Apoiado na parede, ponta do pé no chão ou pé no ar.', 'Círculos lentos nos dois sentidos.'], err: [] }),
  // ---------- desaceleração ----------
  caminhada: M('Caminhada leve', 'rel', ['geral'], 'pe', 90, { how: ['Caminha devagar, soltando os braços.', 'Deixa a respiração voltar ao normal.'], err: [] }),
  soltura: M('Soltar o corpo', 'rel', ['geral'], 'pe', 30, { how: ['Sacode braços e pernas de leve.', 'Ombros soltos.'], err: [] }),
  respiracao: M('Respiração lenta', 'rel', ['geral'], 'chao', 90, { how: ['Deitado ou sentado, mão na barriga.', 'Puxa o ar em 4 s pelo nariz, solta em 6 s.', 'Sente a barriga subir e descer.'], err: ['Forçar o ar no peito.'], care: 'Tontura: volte a respirar normal.' }),
  crianca: M('Posição da criança', 'rel', ['lombar', 'ombro'], 'chao', 45, { how: ['Ajoelhado, senta nos calcanhares.', 'Leva o tronco à frente e estica os braços no chão.', 'Respira devagar.'], err: [] , care: 'Dor no joelho: ponha uma almofada atrás dos joelhos.' }),
  joelhospeito: M('Joelhos ao peito', 'rel', ['lombar'], 'chao', 40, { how: ['Deitado, abraça os dois joelhos.', 'Balança de leve de um lado pro outro.'], err: [] }),
  torcao: M('Torção deitado', 'rel', ['lombar', 'toracica'], 'chao', 30, { side: true, how: ['Deitado, joelhos dobrados juntos.', 'Deixa os joelhos caírem pra um lado, ombros no chão.', 'Respira e troca.'], err: ['Forçar os joelhos até o chão.'] }),
  pernasparede: M('Pernas na parede', 'rel', ['geral'], 'chao', 90, { how: ['Deitado, glúteo perto da parede, pernas apoiadas pra cima.', 'Braços soltos, respiração lenta.'], err: [] }),
  escaneamento: M('Atenção ao corpo', 'rel', ['geral'], 'chao', 60, { how: ['Deitado, olhos fechados.', 'Passa a atenção dos pés à cabeça, soltando cada parte.', 'Respiração lenta.'], err: [] })
};
// bonecos da mobilidade (exanim, ids m_<id>); pescoço não tem (o boneco não inclina a cabeça)
for (const id of Object.keys(MOB)) if (!MOB[id].ex && !['pescocolat', 'pescocorot'].includes(id)) MOB[id].ex = 'm_' + id;
export const MOB_IDS = Object.keys(MOB);

// regiões que cada modalidade mais usa
export const SPORT_REG = {
  boxe: ['ombro', 'toracica', 'quadril', 'tornozelo', 'punho'],
  muaythai: ['quadril', 'adutor', 'tornozelo', 'posterior', 'toracica'],
  karate: ['quadril', 'adutor', 'posterior', 'tornozelo', 'ombro'],
  jiu: ['quadril', 'toracica', 'ombro', 'pescoco', 'lombar'],
  mma: ['quadril', 'toracica', 'ombro', 'adutor', 'tornozelo'],
  corrida: ['tornozelo', 'quadril', 'panturrilha', 'posterior', 'quadriceps'],
  forca: ['quadril', 'ombro', 'toracica', 'tornozelo'],
  geral: []
};
// musculação: músculos da sessão → regiões
const MUSC_REG = { peito: ['ombro', 'peito', 'toracica'], costas: ['ombro', 'toracica'], ombros: ['ombro', 'toracica'], biceps: ['punho'], triceps: ['ombro'], quad: ['quadril', 'joelho', 'tornozelo'], post: ['quadril', 'posterior'], glut: ['quadril'], pant: ['tornozelo', 'panturrilha'], core: ['lombar'], pescoco: ['pescoco'] };
export function regionsOfMuscles(keys = []) { return [...new Set(keys.flatMap(k => MUSC_REG[k] || []))]; }

// blocos de cada momento: [categorias, fração do tempo, opções]
const PLAN = {
  antes: [[['aq'], 0.2, { warm: true }], [['mob'], 0.4], [['aq'], 0.4, { notWarm: true }]],
  depois: [[['rel'], 0.15, { only: ['caminhada', 'soltura'] }], [['al'], 0.6], [['rel'], 0.25, { only: ['respiracao', 'crianca', 'joelhospeito', 'torcao', 'pernasparede', 'escaneamento'] }]],
  flex: [[['aq'], 0.15, { warm: true }], [['al'], 0.75], [['rel'], 0.1, { only: ['respiracao'] }]],
  descanso: [[['mob'], 0.5], [['al'], 0.3], [['rel'], 0.2, { only: ['respiracao', 'pernasparede', 'escaneamento', 'crianca'] }]]
};
const POS = { pe: 0, parede: 1, chao: 2 };
const TRANS = 5; // segundos entre exercícios
const rnd = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

// tempo do exercício no momento (alongamento segura mais na sessão de flexibilidade)
export function holdOf(id, moment, level = 'intermediario') {
  const m = MOB[id];
  if (m.cat !== 'al') return m.d;
  if (moment === 'flex' || moment === 'descanso') return level === 'iniciante' ? 30 : level === 'avancado' ? 60 : 45;
  return level === 'iniciante' ? 20 : 30;
}
export const itemSec = (id, moment, level) => holdOf(id, moment, level) * (MOB[id].side ? 2 : 1);

// monta a rotina: { items: [{id, sec}], sec, moment, sport, region }
// parecidos demais pra entrar na mesma rotina (na tela parecem o mesmo exercício)
const FAM = { bracosgiro: 'braco', abraco: 'braco' };
export function buildRoutine({ moment = 'antes', sport = 'geral', region = '', min = 10, level = 'intermediario', regs = null, seed = 1, favs = [] } = {}) {
  const want = region ? [region] : regs?.length ? regs : SPORT_REG[sport] || [];
  const maxLvl = level === 'iniciante' ? 1 : level === 'avancado' ? 3 : 2, r = rnd(seed), used = new Set(), fams = new Set(), out = [];
  const budgetAll = min * 60; let carry = 0;
  for (const [cats, frac, o = {}] of PLAN[moment] || PLAN.antes) {
    let budget = budgetAll * frac + carry;
    const pool = MOB_IDS.filter(id => {
      const m = MOB[id];
      if (!cats.includes(m.cat) || used.has(id) || m.lvl > maxLvl || (FAM[id] && fams.has(FAM[id]))) return false;
      if (o.only && !o.only.includes(id)) return false;
      if (o.warm && !m.warm) return false;
      if (o.notWarm && m.warm) return false;
      if (m.sp && !m.sp.includes(sport) && m.sp.length < 5) return false; // específico de outra modalidade fica de fora
      return true;
    });
    const score = id => { const m = MOB[id]; let s = r() * 0.8;
      if (want.length) s += m.reg.filter(x => want.includes(x)).length * 2 + (m.reg.includes('geral') ? 0.5 : 0);
      if (region && !m.reg.includes(region) && !m.reg.includes('geral')) s -= 3;
      if (m.sp?.includes(sport)) s += 1.5;
      if (favs.includes(id)) s += 1;
      return s; };
    const ranked = pool.sort((a, b) => score(b) - score(a));
    const block = [];
    for (const id of ranked) {
      const sec = itemSec(id, moment, level);
      if (budget <= 10 || (o.warm && block.length >= 2)) break;
      if (sec > budget + 20 && block.length) continue;
      if (FAM[id] && fams.has(FAM[id])) continue;
      block.push({ id, sec }); used.add(id); if (FAM[id]) fams.add(FAM[id]); budget -= sec + TRANS;
    }
    // menos troca de posição: em pé → parede → chão (aquecimento geral fica no começo)
    const spec = id => +!!MOB[id].sp?.includes(sport) && MOB[id].sp.length < 5; // o mais específico da modalidade fecha o aquecimento
    block.sort((a, b) => (MOB[b.id].warm - MOB[a.id].warm) || spec(a.id) - spec(b.id) || POS[MOB[a.id].pos] - POS[MOB[b.id].pos]);
    out.push(...block); carry = Math.max(0, budget);
  }
  const sec = out.reduce((a, x) => a + x.sec, 0) + Math.max(0, out.length - 1) * TRANS;
  return { items: out, sec, moment, sport, region, level };
}

// fases pro motor do cronômetro (rtimer): cada lado vira uma fase; 5 s de troca entre elas
export function phasesOfRoutine(R) {
  const ph = [{ k: 'prep', d: 5, r: 1, x: 0 }]; let n = 0;
  R.items.forEach((it, i) => {
    const m = MOB[it.id], h = it.sec / (m.side ? 2 : 1), sides = m.side ? ['Lado direito', 'Lado esquerdo'] : [''];
    sides.forEach((s, j) => {
      if (n) ph.push({ k: 'rest', d: j ? 3 : TRANS, r: n + 1, x: i });
      n++; ph.push({ k: 'round', d: Math.round(h), r: n, x: i, s });
    });
  });
  return ph;
}

// valida rotina salva (vem do aparelho ou da nuvem)
export function cleanRoutineMob(x) {
  if (!x || typeof x !== 'object' || !Array.isArray(x.items)) return null;
  const items = x.items.filter(it => it && MOB[it.id] && it.sec > 0 && it.sec < 600).slice(0, 40).map(it => ({ id: it.id, sec: Math.round(it.sec) }));
  if (!items.length) return null;
  return { items, moment: MOMENTS[x.moment] ? x.moment : 'antes', sport: SPORT_REG[x.sport] ? x.sport : 'geral', region: REGIONS[x.region] ? x.region : '', sec: items.reduce((a, it) => a + it.sec, 0) + (items.length - 1) * TRANS, name: String(x.name || '').slice(0, 60) };
}
