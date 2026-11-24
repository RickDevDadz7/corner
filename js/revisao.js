// Página de revisão das animações de força: marca as que precisam melhorar e copia a lista.
import { EXERCISES } from './data.js';
import { hasDemo, exThumb, exAnimate } from './exanim.js';
const KEY = 'ronin:revisao', st = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } upd(); };
const ids = Object.keys(EXERCISES).filter(hasDemo), list = document.getElementById('list');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
list.innerHTML = ids.map((id, i) => `<div class="rv ${st[id] ? 'sel' : ''}" data-id="${id}"><b>${i + 1}. ${esc(EXERCISES[id].n)}</b><div class="fg">${exThumb(id)}</div>
  <button class="mk">${st[id] ? '✓ Marcado' : 'Precisa melhorar'}</button>${st[id] ? `<textarea placeholder="O que está errado?">${esc(st[id].note || '')}</textarea>` : ''}</div>`).join('');
let anim = null, cur = null;
list.addEventListener('click', e => {
  const card = e.target.closest('.rv'); if (!card) return; const id = card.dataset.id;
  if (e.target.closest('.mk')) {
    if (st[id]) { delete st[id]; card.classList.remove('sel'); card.querySelector('textarea')?.remove(); e.target.textContent = 'Precisa melhorar'; }
    else { st[id] = { note: '' }; card.classList.add('sel'); e.target.textContent = '✓ Marcado'; e.target.insertAdjacentHTML('afterend', '<textarea placeholder="O que está errado?"></textarea>'); card.querySelector('textarea').focus(); }
    return save();
  }
  if (e.target.closest('.fg')) {
    if (anim) { anim.stop?.(); anim = null; } if (cur && cur !== card) cur.querySelector('.fg').innerHTML = exThumb(cur.dataset.id);
    if (cur === card) { cur = null; card.querySelector('.fg').innerHTML = exThumb(id); return; }
    cur = card; anim = exAnimate(card.querySelector('.fg'), id);
  }
});
list.addEventListener('input', e => { const c = e.target.closest('.rv'); if (c && st[c.dataset.id]) { st[c.dataset.id].note = e.target.value.slice(0, 200); save(); } });
function upd() { document.getElementById('cnt').textContent = `${Object.keys(st).length} marcados`; }
document.getElementById('copy').addEventListener('click', async () => {
  const txt = 'Animações pra melhorar:\n' + Object.entries(st).map(([id, v]) => `- ${EXERCISES[id]?.n} (${id})${v.note ? ': ' + v.note : ''}`).join('\n');
  try { await navigator.clipboard.writeText(txt); document.getElementById('copy').textContent = 'Copiado!'; } catch (e) { prompt('Copie o texto:', txt); }
  setTimeout(() => document.getElementById('copy').textContent = 'Copiar lista', 1500);
});
upd();
