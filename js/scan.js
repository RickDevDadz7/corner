// Leitor de código de barras + busca no Open Food Facts (base aberta, sem chave)
import { restrOf } from './data.js';

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
let detector = null;

// Android/Chrome tem leitor nativo; iPhone e PC usam o leitor embutido (carrega só quando precisa)
async function getDetector() {
  if (detector) return detector;
  if ('BarcodeDetector' in window) {
    try {
      const ok = await window.BarcodeDetector.getSupportedFormats();
      if (FORMATS.some(f => ok.includes(f))) return (detector = new window.BarcodeDetector({ formats: FORMATS.filter(f => ok.includes(f)) }));
    } catch (e) { }
  }
  const m = await import('../vendor/barcode/ponyfill.js');
  const wasm = new URL('../vendor/barcode/zxing_reader.wasm', import.meta.url).href;
  m.setZXingModuleOverrides({ locateFile: (p, prefix) => p.endsWith('.wasm') ? wasm : prefix + p });
  return (detector = new m.BarcodeDetector({ formats: FORMATS }));
}

// liga a câmera traseira no <video> e chama onCode(código) quando ler; devolve a função que desliga
export async function startScan(video, onCode) {
  const det = await getDetector();
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  video.srcObject = stream; video.setAttribute('playsinline', ''); video.muted = true;
  await video.play().catch(() => { });
  let live = true, busy = false, last = '', hits = 0;
  const stop = () => { live = false; stream.getTracks().forEach(t => t.stop()); video.srcObject = null; };
  const tick = async () => {
    if (!live) return;
    if (!busy && video.readyState >= 2) {
      busy = true;
      try {
        const r = await det.detect(video);
        const code = r.map(x => x.rawValue).find(v => /^\d{8,14}$/.test(v));
        // duas leituras iguais seguidas: evita número errado com a câmera em movimento
        if (code) { hits = code === last ? hits + 1 : 1; last = code; if (hits >= 2 && live) { stop(); onCode(code); return; } }
      } catch (e) { }
      busy = false;
    }
    setTimeout(tick, 120);
  };
  tick();
  return stop;
}

// alergênicos e categorias do Open Food Facts → restrições do app
const ALLERG = { 'en:gluten': ['gluten', 'celiaca'], 'en:milk': ['leite', 'lactose', 'vegano'], 'en:eggs': ['ovo', 'vegano'], 'en:peanuts': ['amendoim'], 'en:nuts': ['castanhas'],
  'en:soybeans': ['soja'], 'en:fish': ['peixe', 'carne', 'vegano'], 'en:crustaceans': ['crustaceos', 'carne', 'vegano'], 'en:molluscs': ['moluscos', 'carne', 'vegano'],
  'en:sesame-seeds': ['gergelim'], 'en:mustard': ['mostarda'], 'en:celery': ['aipo'], 'en:lupin': ['tremoco'], 'en:sulphur-dioxide-and-sulphites': ['sulfitos'] };
const CATS = [[/alcoholic-beverages|beers|wines/, 'alcool'], [/^en:pastas?$|en:breads|en:pizzas|en:sandwich-breads/, 'massa'], [/en:meats|en:fishes|en:poultry|en:seafood/, 'carne'], [/en:meats|en:fishes|en:poultry|en:seafood|en:dairies|en:eggs|en:honeys/, 'vegano'], [/en:fried-foods/, 'frituras'], [/en:sodas|en:energy-drinks|en:coffees/, 'cafeina']];
const num = v => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };

export async function lookupBarcode(code) {
  if (!/^\d{8,14}$/.test(code)) return { error: 'código inválido' };
  const fields = 'code,product_name,product_name_pt,brands,quantity,serving_quantity,nutriments,ingredients_text_pt,ingredients_text,allergens_tags,traces_tags,categories_tags,nova_group';
  let data;
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`, { headers: { Accept: 'application/json' } });
    if (res.status === 404) return { notFound: true };
    if (!res.ok) return { error: 'base indisponível (' + res.status + ')' };
    data = await res.json();
  } catch (e) { return { error: 'sem internet' }; }
  const p = data && data.status === 1 ? data.product : null;
  if (!p) return { notFound: true };
  const nu = p.nutriments || {};
  let k = num(nu['energy-kcal_100g']);
  if (!k && nu.energy_100g) k = num(nu.energy_100g) / 4.184;
  const name = String(p.product_name_pt || p.product_name || '').trim().slice(0, 120);
  const brand = String(p.brands || '').split(',')[0].trim().slice(0, 60);
  if (!name || !k) return { notFound: true, partial: name };
  const ml = /\bml\b|\blitro|\b\d+\s*l\b/i.test(String(p.quantity || ''));
  const ingr = String(p.ingredients_text_pt || p.ingredients_text || '').slice(0, 2000);
  const x = new Set();
  for (const t of p.allergens_tags || []) for (const k2 of ALLERG[t] || []) x.add(k2);
  if ((p.traces_tags || []).includes('en:gluten')) x.add('celiaca'); // celíaco evita até traços
  for (const t of p.categories_tags || []) for (const [re, k2] of CATS) if (re.test(t)) x.add(k2);
  if (p.nova_group === 4) x.add('ultra');
  for (const k2 of restrOf(ingr)) if (!['massa', 'latex', 'frutose', 'histamina'].includes(k2)) x.add(k2);
  for (const k2 of restrOf(name)) x.add(k2);
  return {
    code, n: brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} (${brand})` : name,
    u: ml ? 'ml' : 'g', serving: num(p.serving_quantity) || 0,
    k, p: num(nu.proteins_100g), c: num(nu.carbohydrates_100g), f: num(nu.fat_100g), fb: num(nu.fiber_100g),
    x: [...x]
  };
}
