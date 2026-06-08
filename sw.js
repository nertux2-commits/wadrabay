/* Service worker — Relevé Terrain WADRA Bay (TD -> Pièce -> Équipement)
   v4 : pré-remplissage Mission 1 (Z03) + photos terrain + synchro Supabase */
const CACHE = 'wadra-releve-v6';
const ASSETS = [
  './',
  './index.html',
  './data.js',
  './config.js',
  './seed_z03.js',
  './sync.js',
  './sw.js',
  './photos_z03/Z03_C1_lave-linge-professionnel-n-3_1.jpg',
  './photos_z03/Z03_C1_lave-linge-professionnel-n-3_2.jpg',
  './photos_z03/Z03_C2_lave-linge-personnel_1.jpg',
  './photos_z03/Z03_C2_lave-linge-personnel_2.jpg',
  './photos_z03/Z03_C3_seche-linge-personnel_1.jpg',
  './photos_z03/Z03_C4_pompe-a-chaleur-pour-ecs_1.jpg',
  './photos_z03/Z03_C4_pompe-a-chaleur-pour-ecs_2.jpg',
  './photos_z03/Z03_C5_climatisation-services-generau_1.jpg',
  './photos_z03/Z03_C5_climatisation-services-generau_2.jpg',
  './photos_z03/Z03_C6_climatisation-services-generau_1.jpg',
  './photos_z03/Z03_C6_climatisation-services-generau_2.jpg',
  './photos_z03/Z03_C7_brasseur-d-air_1.jpg',
  './photos_z03/Z03_C7_brasseur-d-air_2.jpg',
  './photos_z03/Z03_E10_climatisation-services-generau_1.jpg',
  './photos_z03/Z03_E10_climatisation-services-generau_2.jpg',
  './photos_z03/Z03_E11_eclairage-services-generaux-la_1.jpg',
  './photos_z03/Z03_E1_seche-linge-n-1_1.jpg',
  './photos_z03/Z03_E1_seche-linge-n-1_2.jpg',
  './photos_z03/Z03_E2_seche-linge-n-2_1.jpg',
  './photos_z03/Z03_E2_seche-linge-n-2_2.jpg',
  './photos_z03/Z03_E3_seche-linge-n-3_1.jpg',
  './photos_z03/Z03_E3_seche-linge-n-3_2.jpg',
  './photos_z03/Z03_E4_seche-linge-n-4_1.jpg',
  './photos_z03/Z03_E4_seche-linge-n-4_2.jpg',
  './photos_z03/Z03_E5_calandreuse-n-1_1.jpg',
  './photos_z03/Z03_E5_calandreuse-n-1_2.jpg',
  './photos_z03/Z03_E7_lave-linge-professionnel_1.jpg',
  './photos_z03/Z03_E7_lave-linge-professionnel_2.jpg',
  './photos_z03/Z03_E9_extracteurs-de-ventilation-lav_1.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
];
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // addAll échoue si UN seul asset manque -> on met en cache un par un, tolérant
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  // La base partagée Supabase passe toujours par le réseau (jamais mise en cache)
  if (e.request.url.indexOf('.supabase.co') !== -1) return;
  e.respondWith(caches.match(e.request).then(function (cached) {
    return cached || fetch(e.request).catch(function () {
      return (e.request.mode === 'navigate') ? caches.match('./index.html') : Response.error();
    });
  }));
});
