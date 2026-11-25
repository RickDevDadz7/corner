/* RONIN — sincronização entre aparelhos pela conta (Supabase, tabela ronin_sync).
 * Mesmo padrão do Trilha Dev / Deutsch mit Plan: cada aparelho grava só a própria linha e,
 * ao sincronizar, lê as linhas dos outros aparelhos da mesma conta e junta tudo.
 *
 * Regras da junção (idempotente: juntar duas vezes não muda nada):
 *  - comida, água, treinos e sessões têm id → união por id;
 *  - apagar deixa uma "lápide" (del[id] = quando) → o item não ressuscita vindo de outro aparelho;
 *  - peso: por dia, vale o registro mais recente;
 *  - perfil e preferências: vale o que foi alterado por último (meta.pt);
 *  - níveis de progressão da calistenia: vale o maior.
 * A chave da API da IA e a conversa com o coach nunca saem do aparelho. */
import { cloud } from './cloud.js';

export const TABLE = 'ronin_sync';
const PREFS = ['profile', 'settings', 'weak', 'timer', 'boxGen', 'ui', 'routines'];
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const ls = () => { try { return globalThis.localStorage; } catch (e) { return null; } };

export function deviceId() {
  const s = ls(); let id = s && s.getItem('ronin-device');
  if (!id) { id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); try { s && s.setItem('ronin-device', id); } catch (e) { } }
  return id;
}
export function deviceName() {
  let ua = ''; try { ua = navigator.userAgent || ''; } catch (e) { }
  return /Android|iPhone|iPad|Mobile/i.test(ua) ? 'Celular' : 'Navegador do PC';
}
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Só o que é sincronizado (sem conversa do coach)
export function payloadOf(S) {
  const o = {}; for (const k of [...PREFS, 'prog', 'logs', 'del', 'meta']) o[k] = clone(S[k]);
  if (o.timer) o.timer.program = null;
  // percursos só no aparelho, se a pessoa escolheu (distância/tempo/ritmo continuam sincronizando)
  if (S.ui?.gps?.sync === false && o.logs?.sessions) o.logs.sessions = o.logs.sessions.map(x => { if (!x || !x.rt) return x; const { rt, cut, gap, ...r } = x; return r; });
  return o;
}

// Segurança: tudo que chega da nuvem passa por aqui antes de virar tela.
// id só com letras/números/-/_ e campos numéricos viram número de verdade (bloqueia HTML injetado).
const ID_OK = /^[A-Za-z0-9_-]{1,64}$/, RT_OK = /^[\x3f-\x7e]{0,200000}$/;
const NUMS = ['k', 'p', 'c', 'f', 'fb', 'g', 'q', 'st', 't', 'ml', 'kg', 'min', 'rpe', 'kcal', 'rounds', 'sets', 'reps', 'load', 'dur', 'start', 'km', 'sec', 'up', 'gkm', 'tot', 'mx'];
function clean(it) {
  if (!it || typeof it !== 'object' || typeof it.id !== 'string' || !ID_OK.test(it.id)) return null;
  const o = { ...it };
  for (const k of NUMS) if (k in o) { const n = Number(o[k]); o[k] = Number.isFinite(n) ? n : 0; }
  // percurso da corrida (polyline): só caracteres do formato, nunca vira HTML (é decodificado em números)
  if ('rt' in o && (typeof o.rt !== 'string' || !RT_OK.test(o.rt))) delete o.rt;
  for (const k of Object.keys(o)) if (k !== 'rt' && typeof o[k] === 'string' && o[k].length > 500) o[k] = o[k].slice(0, 500);
  return o;
}
function unionById(x = [], y = [], del = {}) {
  const m = new Map();
  for (const raw of [...x, ...y]) {
    const it = clean(raw);
    if (!it || del[it.id]) continue;
    const cur = m.get(it.id);
    if (!cur || (it.t || 0) > (cur.t || 0)) m.set(it.id, it); // edição mais recente vence
  }
  return [...m.values()];
}
const byDate = (a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.id).localeCompare(String(b.id));

export function merge(local, remote) {
  if (!remote || !remote.logs) return local;
  const a = local, b = remote, out = clone(a);
  out.meta = out.meta || {}; out.meta.wt = out.meta.wt || {};
  // lápides
  out.del = { ...(b.del || {}) };
  for (const [k, v] of Object.entries(a.del || {})) out.del[k] = Math.max(v, out.del[k] || 0);
  const del = out.del;
  // perfil e preferências
  if ((b.meta?.pt || 0) > (a.meta?.pt || 0)) { for (const k of PREFS) if (b[k] !== undefined) out[k] = clone(b[k]); out.meta.pt = b.meta.pt; if (out.timer) out.timer.program = a.timer?.program || null; }
  // progressões: maior nível
  out.prog = { ...(a.prog || {}) };
  for (const [k, v] of Object.entries(b.prog || {})) out.prog[k] = Math.max(v, out.prog[k] ?? -1);
  // peso: registro mais recente do dia
  const L = out.logs, RL = b.logs;
  for (const [d, raw] of Object.entries(RL.weights || {})) {
    const kg = Number(raw); if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(kg) || kg < 30 || kg > 300) continue;
    const tb = b.meta?.wt?.[d] || 0, ta = a.meta?.wt?.[d] || 0;
    if ((del['w:' + d] || 0) >= tb && del['w:' + d]) continue; // apagada depois dessa versão
    if (L.weights[d] == null || tb > ta) { L.weights[d] = kg; out.meta.wt[d] = Math.max(ta, tb); }
  }
  for (const d of Object.keys(L.weights)) if (del['w:' + d] && del['w:' + d] >= (out.meta.wt[d] || 0)) { delete L.weights[d]; delete out.meta.wt[d]; }
  // listas por dia
  for (const key of ['food', 'water']) {
    const src = { ...(a.logs[key] || {}) };
    for (const d of new Set([...Object.keys(src), ...Object.keys(RL[key] || {})])) {
      const u = unionById(src[d], RL[key]?.[d], del);
      if (u.length) L[key][d] = u; else delete L[key][d];
    }
  }
  // listas simples
  for (const key of ['workouts', 'sessions', 'mob']) L[key] = unionById(a.logs[key], RL[key], del).sort(byDate);
  return out;
}

const sig = S => JSON.stringify([S.meta?.pt, Object.keys(S.del || {}).length, S.logs.workouts.length, S.logs.workouts.reduce((a, w) => a + (+w.t || 0), 0), S.logs.sessions.length, (S.logs.mob || []).length,
  Object.values(S.logs.food).flat().length, Object.values(S.logs.water).flat().length, Object.keys(S.logs.weights).length, JSON.stringify(S.prog)]);

let running = null;
/** Puxa os outros aparelhos, junta, salva e envia a linha deste aparelho. getS/setS acessam o estado do app. */
export function syncNow(getS, setS) {
  if (running) return running;
  running = (async () => {
    const u = cloud.user();
    if (!u) throw Object.assign(new Error('Entre na sua conta primeiro.'), { code: 'signed_out' });
    const dev = deviceId();
    let S = getS();
    const before = sig(S);
    const rows = await cloud.rest(TABLE + '?select=device_id,name,updated_at,data&user_id=eq.' + encodeURIComponent(u.id));
    const others = [];
    for (const r of rows || []) {
      // a linha deste aparelho também entra: depois de sair da conta (aparelho limpo) é dela que os dados voltam.
      // A junção é idempotente e as lápides impedem que o que foi apagado aqui volte.
      let data = null; try { data = JSON.parse(r.data); } catch (e) { continue; }
      if (!data || data.app !== 'ronin' || !data.state) continue;
      // conta nova neste aparelho: adota o perfil de quem já usa
      if (!S.profile && data.state.profile) { S.profile = clone(data.state.profile); S.meta = S.meta || {}; S.meta.pt = 0; }
      S = merge(S, data.state);
      if (r.device_id !== dev) others.push({ name: r.name, at: r.updated_at });
    }
    const changed = sig(S) !== before;
    if (changed) setS(S);
    await cloud.rest(TABLE + '?on_conflict=user_id,device_id', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { device_id: dev, name: deviceName(), updated_at: new Date().toISOString(), data: JSON.stringify({ v: 1, app: 'ronin', state: payloadOf(S) }) }
    });
    const info = { at: Date.now(), devices: others.length + 1, others, changed };
    try { ls().setItem('ronin-sync-last', JSON.stringify(info)); } catch (e) { }
    return info;
  })();
  return running.finally(() => { running = null; });
}
export async function wipe() {
  const u = cloud.user(); if (!u) return;
  await cloud.rest(TABLE + '?user_id=eq.' + encodeURIComponent(u.id), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
}
export const lastInfo = () => { try { return JSON.parse(ls().getItem('ronin-sync-last') || 'null'); } catch (e) { return null; } };
