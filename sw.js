/* Service worker — Relevé Terrain WADRA Bay (TD → Pièce → Équipement + synchro Supabase) */
const CACHE = 'wadra-releve-v3';
const ASSETS = [
  './',
  './index.html',
  './config.js',
  './sync.js',
  './data.js',
  './data_z0.js',
  './data_z1.js',
  './data_z2.js',
  './data_z3.js',
  './data_z4.js',
  './data_z5.js',
  './data_z6.js',
  './data_z7.js',
  './data_z8.js',
  './data_z9.js',
  './data_z10.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  // Les appels à la base partagée Supabase passent toujours par le réseau (jamais mis en cache)
  if (e.request.url.indexOf('.supabase.co') !== -1) return;
  e.respondWith(caches.match(e.request).then(function (cached) {
    return cached || fetch(e.request).catch(function () {
      return (e.request.mode === 'navigate') ? caches.match('./index.html') : Response.error();
