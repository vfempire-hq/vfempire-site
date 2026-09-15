#!/usr/bin/env node
// Ping IndexNow (Bing, Yandex, Seznam, Naver; Google reads sitemaps) with every URL in sitemap.xml.
// Run after each deploy: node scripts/indexnow.mjs   (the key file /<key>.txt is served from the site root)
import fs from 'fs';
const key = fs.readFileSync(new URL('./indexnow-key.txt', import.meta.url), 'utf8').trim();
const urls = [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'vfempire.com', key, keyLocation: `https://vfempire.com/${key}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${urls.length} urls, HTTP ${r.status}`);
