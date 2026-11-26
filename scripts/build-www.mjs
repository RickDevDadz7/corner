// Copia o PWA (os mesmos arquivos do site) pra pasta www/, que vai dentro do app Android.
// Não copia o que não é do app (servidor, testes, pacote Android).
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
const OUT = 'www';
const KEEP = ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js', 'js', 'img', 'icons', 'vendor'];
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const f of KEEP) if (existsSync(f)) cpSync(f, `${OUT}/${f}`, { recursive: true });
console.log('www/ pronto:', KEEP.filter(existsSync).join(', '));
