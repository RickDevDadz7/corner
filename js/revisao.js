// Página de revisão das animações (força e lutas): marca as que precisam melhorar e copia a lista.
import { EXERCISES } from './data.js';
import { hasDemo, exThumb, exAnimate } from './exanim.js';
import { TECHNIQUES, thumbSVG, animate } from './techniques.js';
import { SPORTS } from './sports.js';
const KEY = 'ronin:revisao', st = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } upd(); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// força: id do exercício; lutas: "t:" + id da técnica
const ITEMS = {
  forca: Object.keys(EXERCISES).filter(hasDemo).map(id => ({ key: id, n: EXERCISES[id].n, thumb: () => exThumb(id), run: el => exAnimate(el, id) })),
  luta: TECHNIQUES.map(t => ({ key: 't:' + t.id, n: `${t.n} · ${t.sport.filter(x => SPORTS[x] && !SPORTS[x].retired).map(x => SPORTS[x].n).join(', ')}`, thumb: () => thumbSVG(t), run: el => animate(el, t) }))
};
const nameOf = k => k.startsWith('t:') ? TECHNIQUES.find(t => 't:' + t.id === k)?.n : EXERCISES[k]?.n;
const list = document.getElementById('list');
let tab = 'forca', anim = null, cur = null;
function paint() {
  if (anim) { anim.stop?.(); anim = null; } cur = null;
  list.innerHTML = ITEMS[tab].map((it, i) => `<div class="rv ${st[it.key] ? 'sel' : ''}" data-k="${esc(it.key)}"><b>${i + 1}. ${esc(it.n)}</b><div class="fg">${it.thumb()}</div>
    <button class="mk">${st[it.key] ? '✓ Marcado' : 'Precisa melhorar'}</button>${st[it.key] ? `<textarea placeholder="O que está errado?">${esc(st[it.key].note || '')}</textarea>` : ''}</div>`).join('');
}
const itemOf = k => ITEMS[tab].find(x => x.key === k);
document.getElementById('tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b)); paint(); });
list.addEventListener('click', e => {
  const card = e.target.closest('.rv'); if (!card) return; const k = card.dataset.k, it = itemOf(k); if (!it) return;
  if (e.target.closest('.mk')) {
    if (st[k]) { delete st[k]; card.classList.remove('sel'); card.querySelector('textarea')?.remove(); e.target.textContent = 'Precisa melhorar'; }
    else { st[k] = { note: '' }; card.classList.add('sel'); e.target.textContent = '✓ Marcado'; e.target.insertAdjacentHTML('afterend', '<textarea placeholder="O que está errado?"></textarea>'); card.querySelector('textarea').focus(); }
    return save();
  }
  if (e.target.closest('.fg')) {
    if (anim) { anim.stop?.(); anim = null; } if (cur && cur !== card) cur.querySelector('.fg').innerHTML = itemOf(cur.dataset.k)?.thumb() || '';
    if (cur === card) { cur = null; card.querySelector('.fg').innerHTML = it.thumb(); return; }
    cur = card; anim = it.run(card.querySelector('.fg'));
  }
});
list.addEventListener('input', e => { const c = e.target.closest('.rv'); if (c && st[c.dataset.k]) { st[c.dataset.k].note = e.target.value.slice(0, 200); save(); } });
function upd() { document.getElementById('cnt').textContent = `${Object.keys(st).length} marcados`; }
document.getElementById('copy').addEventListener('click', async () => {
  const txt = 'Animações pra melhorar:\n' + Object.entries(st).map(([k, v]) => `- ${nameOf(k) || k} (${k})${v.note ? ': ' + v.note : ''}`).join('\n');
  try { await navigator.clipboard.writeText(txt); document.getElementById('copy').textContent = 'Copiado!'; } catch (e) { prompt('Copie o texto:', txt); }
  setTimeout(() => document.getElementById('copy').textContent = 'Copiar lista', 1500);
});
paint(); upd();
