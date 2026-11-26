// ============================================================
// RONIN — primeiro uso guiado: passa pelas telas destacando cada parte, com Próximo / Voltar / Pular.
// Cada passo: { r: rota, s: seletor (pode ter vários separados por vírgula; usa o primeiro que existir), t: título, d: texto }
// ============================================================
export const TOUR = [
  { r: 'hoje', s: null, t: 'Bem-vindo ao TAIREN', d: 'Um tour rápido pelas telas. Leva 1 minuto e dá pra pular quando quiser. Depois, ele fica em Perfil › Ver o tutorial.' },
  { r: 'hoje', s: '.dayrow', t: 'Resumo do dia', d: 'Treino, refeições, água e ciência. Cada bloco fica preto com ✓ quando você cumpre. Tocar leva direto pra parte.' },
  { r: 'hoje', s: '#h-treino', t: 'Seu treino de hoje', d: 'Segue a sua semana: mostra o que está marcado pra hoje e abre o treino com um toque. Dia de descanso também aparece aqui.' },
  { r: 'hoje', s: '#h-agenda', t: 'Seu dia, hora a hora', d: 'Refeições, água, pré e pós-treino encaixados no seu horário. Quanto mais você registra na hora, mais o Tairen aprende seus horários.' },
  { r: 'hoje', s: '#h-nutri', t: 'Calorias e macros', d: 'O anel mostra quanto você já comeu da meta do dia. As barras são proteína, carboidrato, gordura e fibras.' },
  { r: 'hoje', s: '#h-agua', t: 'Água', d: 'Toque nos botões pra registrar. O Tairen mostra o ideal do dia e avisa se você beber rápido demais ou muito além do necessário.' },
  { r: 'hoje', s: '#h-peso', t: 'Peso', d: 'Pese de manhã, depois do banheiro. O Tairen olha a tendência da semana, não o número de um dia: peso oscila 1 a 2 kg com água e sal.' },
  { r: 'hoje', s: '#h-sci', t: 'Ciência do dia', d: 'Uma dica com estudo por trás, todo dia. Todas ficam no botão Ciência, lá no topo.' },
  { r: 'nutri', s: '#n-metas', t: 'Suas metas', d: 'Calorias, proteína, carboidrato, gordura, fibras e água calculados pro seu corpo e objetivo.' },
  { r: 'nutri', s: '#n-menu', t: 'Cardápio sugerido', d: 'O Tairen monta um cardápio do dia com as suas metas e restrições, com trocas e lista de compras. Você ajusta como quiser.' },
  { r: 'nutri', s: '[id^="meal-"]', t: 'Registrar o que comeu', d: 'Cada refeição tem o + Adicionar: busca, recentes e leitor de código de barras. A quantidade é editável depois.' },
  { r: 'nutri', s: '#n-analise', t: 'Análise', d: 'Tendência de peso, fibras, deslizes nas restrições e avisos. Só aparece alerta quando os dados sustentam.' },
  { r: 'nutri', s: '#n-como', t: 'Como cheguei nesse número', d: 'Toda meta tem a conta aberta: fórmula, ajustes e o porquê. Nada de número mágico.' },
  { r: 'treino', s: '#t-rotina', t: 'Sua rotina de força', d: 'Montada pelo seu perfil: dias, objetivo, nível, esporte e tempo. Toque em Começar pra abrir o treino com séries, cargas e descanso.' },
  { r: 'treino', s: '.cyc', t: 'Ciclo de treino', d: 'O volume sobe semana a semana e a cada 4 ou 5 semanas vem uma semana leve pra recuperar. O Tairen faz isso sozinho.' },
  { r: 'treino', s: '#t-comp', t: 'Complementares', d: 'Este cartão só aparece pra quem marcou coluna, dor ou lesão no perfil. São exercícios de postura e reabilitação escolhidos pro seu caso.' },
  { r: 'treino', s: '#t-semana', t: 'Esta semana', d: 'Quantos treinos você já fez dos planejados. A rotina não tem dia fixo: fez, conta.' },
  { r: 'treino', s: '#t-hist,#t-evo', t: 'Histórico e evolução', d: 'Cada treino salvo vira histórico, e cada exercício ganha gráfico de evolução e recordes.' },
  { r: 'treino', s: '#nav a[href="#esporte"]', t: 'Seu esporte', d: 'Gerador de rounds e de corrida com timer, técnicas animadas e registro das sessões.' },
  { r: 'esporte-corrida', s: '#g-start', t: 'Corrida com GPS', d: 'Escolha o modo (livre, distância, tempo, ritmo, intervalado…) e comece: o Tairen mede distância, ritmo e percurso, fala cada km e salva sozinho no fim. Recordes e semana logo abaixo.' },
  { r: 'treino', s: '#nav a[href="#coach"]', t: 'Coach', d: 'Tire dúvidas de treino e dieta com quem conhece o seu plano.' },
  { r: 'treino', s: '#topbar a[href="#perfil"]', t: 'Perfil', d: 'Minha semana, objetivo, dores do dia, saúde e restrições. Mudou algo lá, o plano se ajusta na hora. Bom treino.' }
];

let st = null;
export function startTour(go, steps = TOUR) {
  stopTour();
  const root = document.createElement('div'); root.id = 'tour';
  root.innerHTML = '<div class="tr-hole"></div><div class="tr-card" role="dialog" aria-live="polite"><small class="tr-n"></small><h3 class="tr-t"></h3><p class="tr-d"></p><div class="tr-btns"><button type="button" class="btn small ghost" data-tr="skip">Pular</button><span></span><button type="button" class="btn small ghost" data-tr="back">Voltar</button><button type="button" class="btn small primary" data-tr="next">Próximo</button></div></div>';
  document.body.appendChild(root); document.body.classList.add('touring');
  st = { i: 0, steps, go, root, el: null };
  root.addEventListener('click', e => { const b = e.target.closest('[data-tr]'); if (!b) { e.stopPropagation(); return; } const a = b.dataset.tr; if (a === 'skip') return endTour(); move(a === 'next' ? 1 : -1); });
  st.onScroll = () => place(); window.addEventListener('resize', st.onScroll); window.addEventListener('scroll', st.onScroll, { passive: true });
  show();
}
function move(d) { let i = st.i + d; if (i >= st.steps.length) return endTour(); st.i = Math.max(0, i); show(d); }
function show(dir = 1) {
  const s = st.steps[st.i];
  if (location.hash.replace('#', '') !== s.r) st.go('#' + s.r);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const el = s.s ? s.s.split(',').map(q => document.querySelector(q)).find(Boolean) : null;
    if (s.s && !el) { const n = st.i + dir; if (n < 0 || n >= st.steps.length) return endTour(); st.i = n; return show(dir); } // parte que essa pessoa não tem: pula
    st.el = el;
    if (el && el.tagName === 'DETAILS') el.open = false;
    const c = st.root.querySelector('.tr-card');
    c.querySelector('.tr-n').textContent = `${st.i + 1} de ${st.steps.length}`;
    // título só quando não há parte destacada (senão repete o nome que já está na tela)
    const tt = c.querySelector('.tr-t'); tt.textContent = el ? '' : s.t; tt.hidden = !!el; c.querySelector('.tr-d').textContent = s.d;
    if (el && !inBar(el)) {
      // rola pra parte ficar logo abaixo do topo, com espaço pra explicação embaixo dela
      c.style.cssText = 'visibility:hidden;top:0'; const ch = c.offsetHeight, r = el.getBoundingClientRect();
      const fits = r.height + ch + 30 <= barBottom() - TOP;
      window.scrollTo(0, Math.max(0, r.top + window.scrollY - (fits ? TOP + 14 : 70)));
    }
    c.querySelector('[data-tr=back]').hidden = st.i === 0;
    c.querySelector('[data-tr=next]').textContent = st.i === st.steps.length - 1 ? 'Concluir' : 'Próximo';
    place(); c.querySelector('[data-tr=next]').focus({ preventScroll: true });
  }));
}
const TOP = 64;
const barBottom = () => { const n = document.querySelector('#nav'); return n ? n.getBoundingClientRect().top - 8 : innerHeight - 8; };
const inBar = el => !!el.closest('#nav,#topbar');
function place() {
  if (!st) return;
  const h = st.root.querySelector('.tr-hole'), c = st.root.querySelector('.tr-card');
  st.root.classList.toggle('dim', !st.el);
  if (!st.el) { h.style.cssText = 'display:none'; c.style.cssText = ''; c.className = 'tr-card mid'; return; }
  const r = st.el.getBoundingClientRect(), p = 6, top = Math.max(4, r.top - p), bot = Math.min(innerHeight - 4, r.bottom + p);
  h.style.cssText = `display:block;left:${Math.max(4, r.left - p)}px;top:${top}px;width:${Math.min(innerWidth - 8, r.width + 2 * p)}px;height:${Math.max(20, bot - top)}px`;
  // explicação colada na parte, do lado que tiver espaço: embaixo, senão em cima; sem espaço (parte enorme), no rodapé
  c.className = 'tr-card'; c.style.cssText = 'visibility:hidden;top:0';
  const ch = c.offsetHeight, below = bot + 10, above = top - 10 - ch, lim = barBottom();
  const y = below + ch <= lim ? below : above >= TOP ? above : lim - ch;
  c.style.cssText = `top:${Math.round(y)}px`;
}
export function endTour() { try { localStorage.setItem('ronin:tour', 'done'); } catch (e) { } stopTour(); }
export function stopTour() {
  if (!st) return;
  window.removeEventListener('resize', st.onScroll); window.removeEventListener('scroll', st.onScroll);
  st.root.remove(); document.body.classList.remove('touring'); st = null;
}
export const tourSeen = () => { try { return localStorage.getItem('ronin:tour') === 'done'; } catch (e) { return true; } };
export const touring = () => !!st;
