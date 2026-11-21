// ============================================================
// RONIN — biblioteca de técnicas animadas (traço próprio, vista lateral, guarda ortodoxa)
// Pose = coordenadas das articulações num quadro 220×200. L = lado da frente, R = lado de trás.
// ============================================================

const BASE = {
  head: [100, 40], neck: [98, 54], sh: [97, 61], hip: [94, 108],
  eR: [94, 82], hR: [110, 50], eL: [110, 80], hL: [122, 56],
  kR: [82, 146], fR: [70, 182], kL: [110, 146], fL: [122, 182]
};
const UPPER = ['head', 'neck', 'sh', 'eR', 'hR', 'eL', 'hL'];
const P = (over = {}, from = BASE) => ({ ...from, ...over });
function shift(pose, dx, dy, parts = UPPER) { const o = { ...pose }; for (const k of parts) o[k] = [o[k][0] + dx, o[k][1] + dy]; return o; }
function crouch(pose, d) {
  const o = shift(pose, 0, d, [...UPPER, 'hip']);
  o.kR = [o.kR[0] - d * 0.3, o.kR[1] + d * 0.5]; o.kL = [o.kL[0] + d * 0.3, o.kL[1] + d * 0.5];
  return o;
}

// ---------- Boxe ----------
const JAB = P({ hL: [170, 58], eL: [146, 60], sh: [101, 61], neck: [101, 54], head: [104, 41] });
const CROSS = P({ hR: [172, 57], eR: [146, 59], sh: [104, 61], neck: [104, 54], head: [108, 41], hip: [98, 108], kR: [92, 148], fR: [74, 180], hL: [114, 48], eL: [104, 76] });
const HOOK0 = P({ hL: [118, 64], eL: [116, 72], hip: [95, 108] });
const HOOK = P({ eL: [128, 60], hL: [150, 56], sh: [100, 61], hip: [97, 108], head: [101, 41], kL: [114, 146], fL: [124, 182] });
const UP0 = crouch(P({ hR: [106, 96], eR: [96, 90] }), 8);
const UP = P({ hR: [132, 42], eR: [114, 70], hip: [98, 108], sh: [101, 61], head: [104, 41], neck: [101, 54], kR: [90, 147], fR: [72, 180] });
const SLIP = crouch(shift(BASE, 12, 8), 4);
const BOB = crouch(shift(BASE, 6, 10), 14);

// ---------- Muay thai ----------
const TEEP0 = P({ kL: [128, 118], fL: [122, 150], head: [96, 41], neck: [95, 55], sh: [94, 62] });
const TEEP = P({ kL: [144, 116], fL: [176, 112], head: [88, 43], neck: [88, 57], sh: [89, 63], hip: [95, 108], hL: [114, 50], eL: [104, 76] });
const KICK0 = P({ kR: [112, 122], fR: [96, 146], hip: [98, 106], fL: [124, 182], eR: [86, 82], hR: [80, 92] });
const KICK = P({ kR: [140, 96], fR: [174, 90], hip: [102, 104], sh: [88, 62], neck: [86, 56], head: [82, 44], eR: [76, 82], hR: [64, 98], eL: [100, 72], hL: [106, 46], kL: [108, 146], fL: [118, 182] });
const KNEE0 = P({ hL: [142, 44], hR: [138, 48], eL: [126, 58], eR: [122, 62] });
const KNEE = P({ hL: [138, 46], hR: [134, 50], eL: [122, 60], eR: [118, 64], kR: [138, 112], fR: [116, 142], hip: [104, 110], sh: [95, 62], neck: [95, 55], head: [95, 42] });

// ---------- MMA ----------
const SPRAWL = { head: [146, 140], neck: [136, 146], sh: [128, 150], hip: [96, 166], eR: [138, 166], hR: [150, 174], eL: [142, 164], hL: [156, 172], kR: [66, 176], fR: [36, 182], kL: [72, 178], fL: [44, 182] };
const SHOT = { head: [138, 92], neck: [128, 98], sh: [122, 102], hip: [90, 130], eR: [134, 118], hR: [150, 124], eL: [138, 114], hL: [154, 118], kR: [70, 166], fR: [60, 182], kL: [124, 172], fL: [140, 182] };

// ---------- Jiu-jitsu (deitado, cabeça à esquerda) ----------
const LIE = { head: [40, 168], neck: [52, 170], sh: [58, 171], hip: [100, 174], eL: [70, 156], hL: [84, 146], eR: [66, 158], hR: [80, 150], kL: [126, 146], fL: [142, 182], kR: [120, 148], fR: [134, 182] };
const BRIDGE = { ...LIE, hip: [100, 140], kL: [128, 136], kR: [122, 138], neck: [52, 168], sh: [60, 166] };
const SHRIMP0 = { ...LIE, hip: [104, 168], kL: [126, 140], fL: [140, 182], kR: [128, 150], fR: [146, 180] };
const SHRIMP = { ...LIE, head: [34, 168], neck: [46, 170], sh: [52, 170], hip: [78, 170], eL: [80, 158], hL: [104, 152], eR: [76, 160], hR: [100, 156], kL: [104, 156], fL: [134, 176], kR: [110, 162], fR: [142, 180] };

const F = (p, d, step, hi = [], arrow = null) => ({ p, d, step, hi, arrow });

export const TECHNIQUES = [
  { id: 'jab', sport: ['boxe', 'muaythai', 'mma'], n: 'Jab', sub: 'O golpe mais usado: mede distância e abre caminho.', gloves: true,
    steps: ['Guarda: queixo baixo, mãos no rosto, peso no meio.', 'A mão da frente sai reta, girando o punho no fim.', 'O ombro da frente sobe e protege o queixo.', 'Volta pelo mesmo caminho, rápido, pra guarda.'],
    furos: ['Baixar a mão de trás quando o jab sai.', 'Puxar o braço antes de soltar (avisa o golpe).', 'Voltar devagar ou por baixo, deixando o rosto aberto.'],
    frames: [F(BASE, 500, 0), F(JAB, 180, 1, ['hL']), F(JAB, 260, 2, ['sh']), F(BASE, 260, 3)] },
  { id: 'direto', sport: ['boxe', 'muaythai', 'mma'], n: 'Direto (2)', sub: 'O soco de força: nasce no pé de trás.', gloves: true,
    steps: ['Da guarda, gire o pé de trás (calcanhar sobe).', 'O quadril gira pra frente e leva o ombro.', 'O braço só termina o movimento: mão reta até o alvo.', 'A mão da frente fica no rosto. Volta pra guarda.'],
    furos: ['Soco só de braço, sem girar o pé e o quadril.', 'Inclinar o corpo pra frente além do joelho da frente.', 'Abrir o cotovelo (vira um soco "de lado").'],
    frames: [F(BASE, 500, 0), F(P({ fR: [74, 180], kR: [88, 148], hip: [96, 108] }), 160, 0, ['fR']), F(P({ fR: [74, 180], kR: [90, 148], hip: [98, 108], sh: [101, 61] }), 140, 1, ['hip']), F(CROSS, 200, 2, ['hR']), F(CROSS, 200, 3), F(BASE, 280, 3)] },
  { id: 'gancho', sport: ['boxe', 'muaythai', 'mma'], n: 'Gancho de esquerda (3)', sub: 'Curto e em arco: a força vem da rotação.', gloves: true,
    steps: ['Peso levemente na perna da frente.', 'Gire o pé e o quadril da frente pra dentro.', 'O braço fica travado em ~90°, cotovelo na altura do punho.', 'O punho acompanha o giro do tronco e volta pro rosto.'],
    furos: ['Abrir o braço pra "carregar" o golpe (o adversário vê).', 'Girar só o braço, sem o pé da frente.', 'Deixar a mão de trás cair durante o giro.'],
    frames: [F(BASE, 500, 0), F(HOOK0, 160, 1, ['hip', 'fL']), F(HOOK, 200, 2, ['eL', 'hL'], 'hook'), F(HOOK, 200, 3), F(BASE, 280, 3)] },
  { id: 'uppercut', sport: ['boxe', 'muaythai', 'mma'], n: 'Uppercut de direita (6)', sub: 'De baixo pra cima: perfeito de perto.', gloves: true,
    steps: ['Dobre levemente os joelhos (carrega as pernas).', 'Empurre o chão com o pé de trás e gire o quadril.', 'A mão sobe por dentro, palma pra você.', 'Para na altura do queixo do adversário e volta pra guarda.'],
    furos: ['Baixar a mão até a cintura antes de subir (golpe telegrafado).', 'Jogar a cabeça pra frente junto com o soco.', 'Usar de longe: é golpe de curta distância.'],
    frames: [F(BASE, 450, 0), F(UP0, 260, 0, ['kR', 'kL']), F(UP, 200, 2, ['hip', 'hR'], 'up'), F(UP, 200, 3), F(BASE, 300, 3)] },
  { id: 'esquiva', sport: ['boxe', 'muaythai', 'mma'], n: 'Esquiva', sub: 'Sair da linha do soco sem perder a posição.', gloves: true,
    steps: ['Veja o soco vindo, mãos no rosto.', 'Gire levemente o tronco e leve a cabeça pra fora da linha.', 'Dobre um pouco os joelhos: o movimento é das pernas e do quadril.', 'Volte já armado pra contra-atacar.'],
    furos: ['Esquivar só com o pescoço.', 'Fechar os olhos ou virar o rosto.', 'Esquivar demais e perder o equilíbrio.'],
    frames: [F(BASE, 500, 0), F(SLIP, 240, 1, ['head']), F(SLIP, 260, 2, ['hip']), F(BASE, 300, 3)] },
  { id: 'pendulo', sport: ['boxe', 'mma'], n: 'Pêndulo', sub: 'Passar por baixo do gancho em "U".', gloves: true,
    steps: ['Dobre os joelhos: desça com as pernas, não com as costas.', 'Passe a cabeça por baixo do golpe, desenhando um "U".', 'Mãos no rosto o tempo todo.', 'Suba do outro lado, já em posição de bater.'],
    furos: ['Curvar a coluna e olhar pro chão.', 'Descer demais (fica lento pra voltar).', 'Baixar as mãos durante o movimento.'],
    frames: [F(BASE, 450, 0), F(BOB, 320, 0, ['kL', 'kR'], 'u'), F(BOB, 200, 2), F(shift(crouch(BASE, 6), 2, 4), 220, 3), F(BASE, 260, 3)] },
  { id: 'teep', sport: ['muaythai', 'mma'], n: 'Teep (chute frontal)', sub: 'O "jab" das pernas: empurra e controla a distância.', gloves: true,
    steps: ['Levante o joelho da frente bem alto.', 'Empurre com a sola do pé, estendendo o quadril pra frente.', 'O tronco inclina um pouco pra trás pra equilibrar.', 'Recolha o joelho e pise de volta na base.'],
    furos: ['Chutar com a perna esticada desde o início (sem levantar o joelho).', 'Inclinar pra trás demais e cair fora da base.', 'Baixar as mãos.'],
    frames: [F(BASE, 450, 0), F(TEEP0, 200, 0, ['kL']), F(TEEP, 200, 1, ['fL', 'hip']), F(TEEP, 220, 2, ['sh']), F(TEEP0, 180, 3), F(BASE, 260, 3)] },
  { id: 'chute', sport: ['muaythai', 'mma'], n: 'Chute de direita', sub: 'O golpe de assinatura do muay thai: a canela é o taco.', gloves: true,
    steps: ['Dê um passo curto pra fora com o pé da frente.', 'Gire nesse pé (calcanhar aponta pro alvo) e jogue o quadril.', 'A perna vem como um taco, acertando com a canela.', 'O braço de trás desce pra equilibrar; o da frente protege o rosto.'],
    furos: ['Não girar o pé de apoio (trava o quadril e machuca o joelho).', 'Acertar com o peito do pé.', 'Dobrar e "estalar" a perna em vez de passar o quadril.'],
    frames: [F(BASE, 450, 0), F(P({ fL: [126, 182], kL: [112, 146] }), 160, 0, ['fL']), F(KICK0, 200, 1, ['hip', 'fL']), F(KICK, 220, 2, ['kR', 'fR'], 'kick'), F(KICK, 200, 3, ['hR']), F(KICK0, 200, 3), F(BASE, 300, 3)] },
  { id: 'joelhada', sport: ['muaythai', 'mma'], n: 'Joelhada', sub: 'No clinch ou na entrada: o quadril faz o golpe.', gloves: true,
    steps: ['Mãos atrás da cabeça do adversário (clinch).', 'Puxe com os braços enquanto o quadril vai pra frente.', 'O joelho sobe reto, ponta do pé pra baixo.', 'Volte pra base, pronto pra outra.'],
    furos: ['Inclinar pra frente e "dar" o joelho só com a perna.', 'Soltar o clinch na hora do golpe.', 'Ficar na ponta do pé de apoio sem equilíbrio.'],
    frames: [F(BASE, 400, 0), F(KNEE0, 260, 0, ['hL', 'hR']), F(KNEE, 220, 1, ['hip', 'kR'], 'knee'), F(KNEE, 220, 2), F(KNEE0, 200, 3), F(BASE, 280, 3)] },
  { id: 'sprawl', sport: ['mma'], n: 'Sprawl', sub: 'A defesa de queda: tira as pernas e cai com o quadril.', gloves: true,
    steps: ['O adversário entra nas suas pernas.', 'Jogue as pernas pra trás, bem abertas.', 'Afunde o quadril no chão, peito por cima dele.', 'Levante e volte pra base.'],
    furos: ['Cair de joelhos (ele termina a queda).', 'Quadril alto: o peso não chega nele.', 'Demorar pra reagir.'],
    frames: [F(BASE, 400, 0), F(SHOT, 220, 0), F(SPRAWL, 260, 1, ['fL', 'fR']), F(SPRAWL, 320, 2, ['hip']), F(SHOT, 300, 3), F(BASE, 300, 3)] },
  { id: 'ponte', sport: ['jiu', 'mma'], n: 'Ponte (upa)', sub: 'O motor de toda fuga por baixo.', gloves: false,
    steps: ['Deitado, pés plantados perto do quadril.', 'Empurre o chão com os pés e jogue o quadril pro teto.', 'O peso vai pra trás do ombro (nunca pro pescoço).', 'Desça controlando.'],
    furos: ['Pés longe do quadril: a ponte perde força.', 'Empurrar com o pescoço.', 'Fazer devagar: a ponte é explosiva.'],
    frames: [F(LIE, 500, 0), F(BRIDGE, 260, 1, ['hip', 'fL', 'fR']), F(BRIDGE, 300, 2, ['sh']), F(LIE, 360, 3)] },
  { id: 'fuga', sport: ['jiu', 'mma'], n: 'Fuga de quadril', sub: 'Criar espaço por baixo e recuperar a guarda.', gloves: false,
    steps: ['De costas, pé de um lado plantado no chão.', 'Empurre o chão e vire de lado, apoiado no ombro.', 'Leve o quadril pra trás enquanto as mãos empurram ("moldura").', 'Recolha o joelho pro espaço que abriu.'],
    furos: ['Ficar de costas reto (o quadril não sai).', 'Empurrar com os braços esticados sem mover o quadril.', 'Esquecer de colocar o joelho no espaço.'],
    frames: [F(LIE, 450, 0), F(SHRIMP0, 260, 1, ['fL']), F(SHRIMP, 320, 2, ['hip', 'hL', 'hR']), F(SHRIMP, 260, 3, ['kL']), F(LIE, 380, 3)] }
];

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

// ---------- Renderização ----------
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const ARROWS = {
  hook: 'M150 34 Q172 56 150 78', up: 'M140 96 Q150 70 138 36', u: 'M118 40 Q130 96 150 40',
  kick: 'M118 160 Q170 150 180 96', knee: 'M100 150 Q150 130 148 96'
};

export function figureSVG(pose, { gloves = true, hi = [], arrow = null, ground = 184 } = {}) {
  const L = (a, b, cls) => `<line x1="${pose[a][0].toFixed(1)}" y1="${pose[a][1].toFixed(1)}" x2="${pose[b][0].toFixed(1)}" y2="${pose[b][1].toFixed(1)}" class="${cls}"/>`;
  // membro de trás que está atacando vira "ativo" (escuro, desenhado na frente)
  const armOn = pose.hR[0] - pose.sh[0] > 22, legOn = pose.fR[1] < 170 && pose.hip[1] < 150;
  const armR = [L('sh', 'eR', armOn ? 'lf' : 'lb'), L('eR', 'hR', armOn ? 'lf' : 'lb')].join('');
  const legR = [L('hip', 'kR', legOn ? 'lf' : 'lb'), L('kR', 'fR', legOn ? 'lf' : 'lb')].join('');
  const front = [L('hip', 'kL', 'lf'), L('kL', 'fL', 'lf'), L('sh', 'eL', 'lf'), L('eL', 'hL', 'lf')].join('');
  const torso = L('neck', 'hip', 'tr') + L('neck', 'sh', 'tr');
  const glove = (k, back) => gloves ? `<circle cx="${pose[k][0]}" cy="${pose[k][1]}" r="8" class="${back ? 'gb' : 'gf'}"/>` : '';
  const hl = hi.map(k => `<circle cx="${pose[k][0]}" cy="${pose[k][1]}" r="15" class="hi"/>`).join('');
  return `<svg viewBox="0 0 220 200" class="fig" role="img" aria-hidden="true">
    <line x1="10" y1="${ground}" x2="210" y2="${ground}" class="gr"/>
    ${hl}${armOn ? '' : armR + glove('hR', true)}${legOn ? '' : legR}${torso}
    <circle cx="${pose.head[0]}" cy="${pose.head[1]}" r="12" class="hd"/>
    ${front}${glove('hL', false)}${legOn ? legR : ''}${armOn ? armR + glove('hR', false) : ''}
    ${arrow ? `<path d="${ARROWS[arrow]}" class="arw" marker-end="url(#ah)"/>` : ''}
    <defs><marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arh"/></marker></defs>
  </svg>`;
}

// Anima uma técnica dentro de um elemento. Retorna { stop, setSpeed, toggle }.
export function animate(el, tech, onStep) {
  const fr = tech.frames;
  let i = 0, t0 = performance.now(), speed = 1, raf = 0, paused = false, lastStep = -1, pausedAt = 0;
  function frame(now) {
    if (paused) return;
    const cur = fr[i], next = fr[(i + 1) % fr.length];
    const dur = cur.d * speed;
    let t = (now - t0) / dur;
    if (t >= 1) { i = (i + 1) % fr.length; t0 = now; t = 0; if (i === 0) t0 = now + 500 * speed; }
    const k = ease(Math.max(0, Math.min(1, t)));
    const pose = {};
    for (const j of Object.keys(cur.p)) pose[j] = lerp(cur.p[j], next.p[j], k);
    const show = k > 0.5 ? next : cur;
    el.innerHTML = figureSVG(pose, { gloves: tech.gloves, hi: show.hi, arrow: show.arrow });
    if (show.step !== lastStep) { lastStep = show.step; onStep && onStep(show.step); }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return {
    stop() { cancelAnimationFrame(raf); paused = true; },
    setSpeed(s) { speed = s; },
    toggle() { if (paused) { paused = false; t0 += performance.now() - pausedAt; raf = requestAnimationFrame(frame); } else { paused = true; pausedAt = performance.now(); cancelAnimationFrame(raf); } return paused; }
  };
}
