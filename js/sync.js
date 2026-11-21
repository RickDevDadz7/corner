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
const PREFS = ['profile', 'settings', 'weak', 'timer', 'boxGen', 'ui'];
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
  return o;
}

function unionById(x = [], y = [], del = {}) {
  const m = new Map();
  for (const it of [...x, ...y]) if (it && it.id && !del[it.id] && !m.has(it.id)) m.set(it.id, it);
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
  for (const [d, kg] of Object.entries(RL.weights || {})) {
    const tb = b.meta?.wt?.[d] || 0, ta = a.meta?.wt?.[d] || 0;
    if (L.weights[d] == null || tb > ta) { L.weights[d] = kg; out.meta.wt[d] = Math.max(ta, tb); }
  }
  // listas por dia
  for (const key of ['food', 'water']) {
    const src = { ...(a.logs[key] || {}) };
    for (const d of new Set([...Object.keys(src), ...Object.keys(RL[key] || {})])) {
      const u = unionById(src[d], RL[key]?.[d], del);
      if (u.length) L[key][d] = u; else delete L[key][d];
    }
  }
  // listas simples
  for (const key of ['workouts', 'sessions']) L[key] = unionById(a.logs[key], RL[key], del).sort(byDate);
  return out;
}

const sig = S => JSON.stringify([S.meta?.pt, Object.keys(S.del || {}).length, S.logs.workouts.length, S.logs.sessions.length,
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
      if (r.device_id === dev) continue;
      let data = null; try { data = JSON.parse(r.data); } catch (e) { continue; }
      if (!data || data.app !== 'ronin' || !data.state) continue;
      // conta nova neste aparelho: adota o perfil de quem já usa
      if (!S.profile && data.state.profile) { S.profile = clone(data.state.profile); S.meta = S.meta || {}; S.meta.pt = 0; }
      S = merge(S, data.state);
      others.push({ name: r.name, at: r.updated_at });
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
