/* =====================================================================
   WADRA Bay — Module HÉBERGEMENTS (état des chambres & bungalows, travaux)
   ---------------------------------------------------------------------
   Pensé pour le technicien : une clé = un écran, une liste de points à
   cocher (OK / à surveiller / HS), une liste de travaux à faire que l'on
   coche quand c'est réglé, des photos. Tout est daté et signé, et
   l'historique se construit tout seul.
   - 50 clés : villas Plage 101-105, bungalows Forêt 201-204,
     chambres 301-322 (bâtiments N et O), bungalows Lagune 401-419 ;
   - point de départ : le rapport de JC ALIKIE du 22 mars 2026 (seed) ;
   - « À faire » global regroupé par clé, export xlsx (état, travaux, historique) ;
   - stockage local (state.hebg) + synchro Supabase (type "hebg", id "hebg:101").
   Dépend des globales de index.html : state, $, esc, toast, touch, nav,
   view, photosFor, triggerPhoto, openViewer, openSheet, closeSheet,
   sheetConfirm, sheetChoose, sheetActions, sheetInput, XLSX ;
   et de MAINT (facultatif) pour créer une intervention depuis une clé.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------- référentiel des clés -------------------- */
  var TYPES = {
    plage:   { label: "Villa Plage",      short: "Plage",   color: "#1f7a8c",
               items: ["clim_salon", "clim_ch", "pac", "tv_salon", "tv_ch", "wifi", "spa", "brasseur", "ecl_int", "ecl_ext", "plomb", "divers"] },
    foret:   { label: "Bungalow Forêt",   short: "Forêt",   color: "#2e7d32",
               items: ["clim", "pac", "tv", "wifi", "brasseur", "ecl_int", "ecl_ext", "plomb", "divers"] },
    chambre: { label: "Chambre",          short: "Chambre", color: "#5c6bc0",
               items: ["clim", "tv", "wifi", "brasseur", "ecl_int", "ecl_ext", "plomb", "divers"] },
    lagune:  { label: "Bungalow Lagune",  short: "Lagune",  color: "#0d7a6f",
               items: ["clim", "pac", "tv", "wifi", "brasseur", "ecl_int", "ecl_ext", "plomb", "fplafond", "deck", "divers"] }
  };
  var ITEMS = {
    clim:       { label: "Climatisation",              ic: "❄️", hint: "code erreur, condensation…" },
    clim_salon: { label: "Climatisation salon",        ic: "❄️", hint: "code erreur, condensation…" },
    clim_ch:    { label: "Climatisation chambre",      ic: "❄️", hint: "code erreur, condensation…" },
    pac:        { label: "Pompe à chaleur (eau chaude)", ic: "♨️", hint: "fuite, purge, pas d'eau chaude…" },
    tv:         { label: "TV & CANAL+",                ic: "📺", hint: "décodeur, image, télécommande…" },
    tv_salon:   { label: "TV & CANAL+ salon",          ic: "📺", hint: "décodeur, image, télécommande…" },
    tv_ch:      { label: "TV & CANAL+ chambre",        ic: "📺", hint: "décodeur, image, télécommande…" },
    wifi:       { label: "Wifi",                       ic: "📶", hint: "" },
    spa:        { label: "Spa",                        ic: "🛁", hint: "code erreur, sonde…" },
    brasseur:   { label: "Brasseur d'air",             ic: "🌀", hint: "télécommande, piles…" },
    ecl_int:    { label: "Éclairage intérieur",        ic: "💡", hint: "spot, LED, transfo…" },
    ecl_ext:    { label: "Éclairage extérieur",        ic: "🔦", hint: "deck, marches, terrasse…" },
    plomb:      { label: "Plomberie / sanitaires",     ic: "🚿", hint: "lavabo, chasse d'eau, douche, EC/EF…" },
    fplafond:   { label: "Faux plafond / finitions",   ic: "🧱", hint: "" },
    deck:       { label: "Deck / terrasse",            ic: "🪵", hint: "nettoyage, fixation…" },
    divers:     { label: "Autre point",                ic: "📝", hint: "coffre, mini-bar, porte, serrure…" }
  };
  var STATES = {
    ok:  { label: "OK",            short: "OK",  color: "#1a9d5a", bg: "#e6f6ec" },
    att: { label: "À surveiller",  short: "⚠",   color: "#d9822b", bg: "#fdf0e0" },
    hs:  { label: "HS",            short: "HS",  color: "#c0392b", bg: "#fbe6e3" },
    na:  { label: "Non vérifié",   short: "?",   color: "#8895a3", bg: "#eef1f2" }
  };
  var KEYS = [];
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  var i;
  for (i = 1; i <= 5; i++)  KEYS.push({ id: "1" + pad(i), type: "plage",   grp: "Villas Plage 101 – 105" });
  for (i = 1; i <= 4; i++)  KEYS.push({ id: "2" + pad(i), type: "foret",   grp: "Bungalows Forêt 201 – 204" });
  for (i = 1; i <= 22; i++) KEYS.push({ id: "3" + pad(i), type: "chambre", grp: "Chambres 301 – 322 (bâtiments N et O)" });
  for (i = 1; i <= 19; i++) KEYS.push({ id: "4" + pad(i), type: "lagune",  grp: "Bungalows Lagune 401 – 419" });
  var GROUPS = [];
  KEYS.forEach(function (k) { if (GROUPS.indexOf(k.grp) < 0) GROUPS.push(k.grp); });
  function keyInfo(id) { return KEYS.filter(function (k) { return k.id === id; })[0] || null; }
  function keyLabel(id) { var k = keyInfo(id); return k ? (TYPES[k.type].label + " " + id) : ("Clé " + id); }
  function keyType(id) { var k = keyInfo(id); return k ? TYPES[k.type] : TYPES.chambre; }
  var TECHS = ["JC ALIKIE", "François YANTAO"];

  /* -------------------- données -------------------- */
  function ensureH() { state.hebg = state.hebg || {}; return state.hebg; }
  function rec(id) { return ensureH()[id] || null; }
  function recOrNew(id) {
    var H = ensureH();
    if (!H[id]) H[id] = { items: {}, todos: [], hist: [], date: "", by: "", obs: "" };
    var r = H[id];
    r.items = r.items || {}; r.todos = r.todos || []; r.hist = r.hist || [];
    return r;
  }
  function itemState(r, key) { var it = r && r.items && r.items[key]; return it && it.st ? it.st : "na"; }
  function openTodos(r) { return (r && r.todos || []).filter(function (t) { return !t.done; }); }
  function keyStatus(id) { /* pire état de la clé : hs > att > ok > na */
    var r = rec(id);
    if (!r || !r.date) return "na";
    var worst = "ok", any = false;
    keyType(id).items.forEach(function (k) {
      var st = itemState(r, k);
      if (st === "na") return;
      any = true;
      if (st === "hs") worst = "hs";
      else if (st === "att" && worst !== "hs") worst = "att";
    });
    if (openTodos(r).length && worst === "ok") worst = "att";
    return any || openTodos(r).length ? worst : "na";
  }
  function issues(id) { /* points non OK + travaux ouverts, pour la liste globale */
    var r = rec(id), out = [];
    if (!r) return out;
    keyType(id).items.forEach(function (k) {
      var it = r.items[k];
      if (!it || it.st === "ok" || it.st === "na") return;
      out.push({ key: id, kind: "item", item: k, st: it.st, txt: ITEMS[k].label + (it.note ? " — " + it.note : ""), date: it.date || r.date });
    });
    openTodos(r).forEach(function (t) { out.push({ key: id, kind: "todo", tid: t.id, st: "todo", txt: t.txt, date: t.date }); });
    return out;
  }
  function allIssues() { var out = []; KEYS.forEach(function (k) { out = out.concat(issues(k.id)); }); return out; }
  function pushHist(r, txt, by) {
    r.hist = r.hist || [];
    r.hist.push({ date: nowDate(), heure: nowTime(), by: by || "", txt: txt });
    if (r.hist.length > 80) r.hist = r.hist.slice(-80);
  }
  function who() {
    var n = (state.meta && state.meta.auditeur) || "";
    try { n = localStorage.getItem("wadra_tech") || n; } catch (e) {}
    return n;
  }
  function rememberWho(n) { try { if (n) localStorage.setItem("wadra_tech", n); } catch (e) {} }

  /* -------------------- utilitaires -------------------- */
  function nowDate() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function nowTime() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function frDate(d) { return d ? (d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4)) : ""; }
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    try { s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) {}
    return s;
  }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save(id, txt) {
    var r = recOrNew(id);
    if (txt) pushHist(r, txt, who());
    touch("hebg:" + id);
  }

  /* -------------------- état interne -------------------- */
  var V = { screen: "grid", id: null, q: "", showHist: false, filter: "all" };
  function back() {
    if (V.screen === "key") { V.screen = "grid"; V.id = null; render(); return true; }
    if (V.screen === "todo") { V.screen = "grid"; render(); return true; }
    return false;
  }

  /* -------------------- RENDU : grille des clés -------------------- */
  function chip(st, txt) {
    var s = STATES[st] || STATES.na;
    return '<span style="display:inline-block;padding:1px 7px;border-radius:6px;font-size:10.5px;font-weight:800;color:#fff;background:' + s.color + '">' + esc(txt || s.short) + '</span>';
  }
  function renderGrid() {
    var iss = allIssues();
    var nHs = iss.filter(function (x) { return x.st === "hs"; }).length;
    var nAtt = iss.filter(function (x) { return x.st === "att"; }).length;
    var nTodo = iss.filter(function (x) { return x.kind === "todo"; }).length;
    var nKeysPb = {}; iss.forEach(function (x) { nKeysPb[x.key] = 1; });
    var lastDate = ""; KEYS.forEach(function (k) { var r = rec(k.id); if (r && r.date > lastDate) lastDate = r.date; });

    var html = '<div style="border-radius:16px;overflow:hidden;margin-bottom:12px;padding:16px;color:#fff;' +
      'background:linear-gradient(135deg,#1f7a8c,#155e6b 60%,#0c3f48);box-shadow:0 2px 10px rgba(20,30,40,.18)">' +
      '<div style="font-size:19px;font-weight:800">🏠 Chambres &amp; bungalows — état et travaux</div>' +
      '<div style="font-size:12.5px;opacity:.92;margin-top:3px">Une clé = un écran. Coche OK / ⚠ / HS, note les travaux, coche quand c\'est fait.' +
      (lastDate ? " Dernier passage : " + frDate(lastDate) : "") + '</div>' +
      '<div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap">' +
      stat(nHs, "points HS", "#ffb3a7") + stat(nAtt, "à surveiller", "#ffd9a8") + stat(nTodo, "travaux à faire", "#fff") +
      stat(Object.keys(nKeysPb).length + " / " + KEYS.length, "clés avec un point", "#fff") +
      '</div></div>';

    html += '<button class="btn primary" id="hTodo" style="background:#c0392b">📋 Tout ce qu\'il reste à faire (' + iss.length + ')</button>';

    html += '<div class="panel" style="margin-top:12px"><h2>Rechercher</h2>' +
      '<input type="text" id="hSearch" placeholder="N° de clé, clim, décodeur, douche…" value="' + esc(V.q) + '" ' +
      'style="width:100%;border:1.4px solid #d6dbde;border-radius:9px;padding:9px 10px;background:#fafbfb"></div>';

    html += '<div id="hGrid"></div>';

    html += '<div class="panel"><h2>Légende</h2><div class="small" style="display:flex;gap:8px;flex-wrap:wrap">' +
      chip("ok", "OK : tout fonctionne") + chip("att", "⚠ : point à surveiller ou travaux en attente") + chip("hs", "HS : au moins un équipement en panne") + chip("na", "? : clé non visitée") +
      '</div></div>';

    html += '<div class="panel"><h2>Export</h2>' +
      '<button class="btn sec" id="hExp">⬇️ État des clés + travaux + historique (xlsx)</button></div>';

    $("app").innerHTML = html;
    $("hTodo").onclick = function () { V.screen = "todo"; render(); };
    $("hExp").onclick = exportXlsx;
    $("hSearch").addEventListener("input", function () { V.q = this.value; paintGrid(); });
    paintGrid();
  }
  function stat(v, l, c) {
    return '<div style="flex:1;min-width:80px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800;color:' + c + '">' + v + '</div><div style="font-size:11px;opacity:.9">' + l + '</div></div>';
  }
  function matchKey(id, q) {
    if (!q) return true;
    var r = rec(id) || { items: {}, todos: [] };
    var hay = [id, keyLabel(id)];
    Object.keys(r.items || {}).forEach(function (k) { var it = r.items[k]; hay.push((ITEMS[k] ? ITEMS[k].label : k) + " " + (it.note || "") + " " + (STATES[it.st] ? STATES[it.st].label : "")); });
    (r.todos || []).forEach(function (t) { hay.push(t.txt); });
    hay = norm(hay.join(" "));
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function paintGrid() {
    var box = $("hGrid"); if (!box) return;
    var q = norm(V.q), h = "";
    GROUPS.forEach(function (g) {
      var ks = KEYS.filter(function (k) { return k.grp === g && matchKey(k.id, q); });
      if (!ks.length) return;
      var t = TYPES[ks[0].type];
      h += '<div class="panel" style="padding:12px 12px 8px"><h2 style="color:' + t.color + '">' + esc(g) + '</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:7px">';
      ks.forEach(function (k) {
        var st = keyStatus(k.id), s = STATES[st], n = issues(k.id).length;
        h += '<div class="hk" data-k="' + k.id + '" style="border-radius:10px;padding:9px 4px;text-align:center;cursor:pointer;background:' + s.bg +
          ';border:1.6px solid ' + s.color + ';color:' + s.color + '">' +
          '<div style="font-size:17px;font-weight:800;color:#1a2025">' + k.id + '</div>' +
          '<div style="font-size:10.5px;font-weight:800">' + (st === "na" ? "non visité" : (n ? n + " point" + (n > 1 ? "s" : "") : "OK")) + '</div></div>';
      });
      h += '</div></div>';
    });
    if (!h) h = '<div class="panel tiny muted">Aucune clé pour « ' + esc(V.q) + ' ».</div>';
    box.innerHTML = h;
    box.querySelectorAll(".hk").forEach(function (el) {
      el.onclick = function () { V.screen = "key"; V.id = el.dataset.k; V.showHist = false; render(); };
    });
  }

  /* -------------------- RENDU : à faire (global) -------------------- */
  function renderTodo() {
    var iss = allIssues();
    var html = '<div class="panel"><h2>📋 Tout ce qu\'il reste à faire</h2>' +
      '<div class="tiny muted">Regroupé par clé. Touche une ligne pour la régler (réparé / fait) ou ouvrir la clé.</div>' +
      '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">' +
      fbtn("all", "Tout (" + iss.length + ")") + fbtn("hs", "HS (" + iss.filter(function (x) { return x.st === "hs"; }).length + ")") +
      fbtn("att", "⚠ (" + iss.filter(function (x) { return x.st === "att"; }).length + ")") +
      fbtn("todo", "Travaux (" + iss.filter(function (x) { return x.kind === "todo"; }).length + ")") +
      '</div></div>';
    var list = iss.filter(function (x) { return V.filter === "all" || x.st === V.filter || (V.filter === "todo" && x.kind === "todo"); });
    var byKey = {};
    list.forEach(function (x) { byKey[x.key] = byKey[x.key] || []; byKey[x.key].push(x); });
    if (!list.length) html += '<div class="panel small">🎉 Rien en attente.</div>';
    Object.keys(byKey).sort().forEach(function (k) {
      var t = keyType(k);
      html += '<div class="panel" style="padding:11px 12px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:16px;font-weight:800;color:' + t.color + '">' + esc(keyLabel(k)) + '</div>' +
        '<button class="btn sec hOpen" data-k="' + k + '" style="width:auto;padding:5px 10px;margin:0 0 0 auto;font-size:12px">Ouvrir ›</button></div>';
      byKey[k].forEach(function (x) {
        html += '<div class="row-item hIss" data-k="' + k + '" data-kind="' + x.kind + '" data-item="' + (x.item || "") + '" data-tid="' + (x.tid || "") + '" style="padding:9px 10px;margin-bottom:6px">' +
          '<div class="row-icon" style="background:' + (x.kind === "todo" ? "#5c6bc0" : STATES[x.st].color) + '">' + (x.kind === "todo" ? "🔧" : (ITEMS[x.item] || {}).ic || "•") + '</div>' +
          '<div class="row-body"><div class="row-title" style="font-size:13.5px">' + esc(x.txt) + '</div>' +
          '<div class="row-desc">' + (x.kind === "todo" ? "Travaux" : STATES[x.st].label) + (x.date ? " · depuis le " + frDate(x.date) : "") + '</div></div>' +
          '<div class="row-chev">✓</div></div>';
      });
      html += '</div>';
    });
    $("app").innerHTML = html;
    document.querySelectorAll(".hf").forEach(function (b) { b.onclick = function () { V.filter = b.dataset.f; renderTodo(); }; });
    document.querySelectorAll(".hOpen").forEach(function (b) { b.onclick = function () { V.screen = "key"; V.id = b.dataset.k; render(); }; });
    document.querySelectorAll(".hIss").forEach(function (el) {
      el.onclick = function () {
        var k = el.dataset.k;
        if (el.dataset.kind === "todo") resolveTodo(k, el.dataset.tid, renderTodo);
        else resolveItem(k, el.dataset.item, renderTodo);
      };
    });
  }
  function fbtn(f, l) {
    var on = V.filter === f;
    return '<button class="btn sec hf" data-f="' + f + '" style="width:auto;padding:6px 11px;margin:0;font-size:12.5px;' + (on ? "background:#1f7a8c;color:#fff;border-color:#1f7a8c" : "") + '">' + esc(l) + '</button>';
  }
  function askWho(cb) {
    var opts = TECHS.map(function (t) { return { label: "👷 " + t, value: t }; });
    opts.push({ label: "✍️ Autre nom…", value: "__other" });
    var w = who();
    if (w && TECHS.indexOf(w) < 0) opts.unshift({ label: "👷 " + w, value: w });
    sheetChoose("Qui intervient ?", "", opts, function (v) {
      if (v === "__other") { sheetInput("Votre nom", "", "", "OK", function (n) { rememberWho(n); cb(n); }); return; }
      rememberWho(v); cb(v);
    });
  }
  function resolveItem(k, item, after) {
    var r = recOrNew(k), it = r.items[item] || {};
    sheetActions(keyLabel(k) + " — " + ITEMS[item].label + (it.note ? " (" + it.note + ")" : ""), [
      { label: "✅ Réparé / OK maintenant", cb: function () {
        askWho(function (n) {
          r.items[item] = { st: "ok", note: "", date: nowDate() };
          pushHist(r, ITEMS[item].label + " : réparé (était " + (STATES[it.st] || STATES.na).label + (it.note ? ", " + it.note : "") + ")", n);
          touch("hebg:" + k); toast("✅ " + ITEMS[item].label + " OK"); after();
        });
      } },
      { label: "📝 Modifier la note", cb: function () {
        sheetInput("Note", ITEMS[item].label, it.note || "", "Enregistrer", function (t) {
          r.items[item] = { st: it.st || "att", note: t, date: it.date || nowDate() };
          touch("hebg:" + k); after();
        });
      } },
      { label: "🏠 Ouvrir la clé " + k, cb: function () { V.screen = "key"; V.id = k; render(); } }
    ]);
  }
  function resolveTodo(k, tid, after) {
    var r = recOrNew(k);
    var t = r.todos.filter(function (x) { return x.id === tid; })[0];
    if (!t) return;
    sheetActions(keyLabel(k) + " — " + t.txt, [
      { label: "✅ C'est fait", cb: function () {
        askWho(function (n) {
          t.done = true; t.doneDate = nowDate(); t.by = n;
          pushHist(r, "Travaux faits : " + t.txt, n);
          touch("hebg:" + k); toast("✅ Fait"); after();
        });
      } },
      { label: "📝 Modifier le texte", cb: function () {
        sheetInput("Travaux", "", t.txt, "Enregistrer", function (x) { t.txt = x; touch("hebg:" + k); after(); });
      } },
      { label: "🗑 Supprimer (saisi par erreur)", danger: true, cb: function () {
        sheetConfirm("Supprimer ces travaux ?", t.txt, "Supprimer", true, function () {
          r.todos = r.todos.filter(function (x) { return x.id !== tid; });
          touch("hebg:" + k); after();
        });
      } },
      { label: "🏠 Ouvrir la clé " + k, cb: function () { V.screen = "key"; V.id = k; render(); } }
    ]);
  }

  /* -------------------- RENDU : une clé -------------------- */
  function renderKey() {
    var id = V.id, k = keyInfo(id); if (!k) { V.screen = "grid"; return renderGrid(); }
    var t = TYPES[k.type], r = recOrNew(id);
    var st = keyStatus(id), s = STATES[st];
    var ph = photosFor("hebg_" + id);
    var html = '<div style="border-radius:16px;padding:14px 16px;margin-bottom:12px;color:#fff;background:linear-gradient(135deg,' + t.color + ',#1a2025 140%)">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<div style="font-size:30px;font-weight:800">' + id + '</div>' +
      '<div style="flex:1"><div style="font-size:15px;font-weight:800">' + esc(t.label) + '</div>' +
      '<div style="font-size:12px;opacity:.9">' + (r.date ? "Dernier passage : " + frDate(r.date) + (r.by ? " · " + esc(r.by) : "") : "Jamais visitée") + '</div></div>' +
      '<span style="background:' + s.color + ';color:#fff;border-radius:8px;padding:3px 9px;font-weight:800;font-size:12px">' + esc(st === "na" ? "?" : s.label) + '</span>' +
      '</div></div>';

    /* points à vérifier */
    html += '<div class="panel" style="padding:12px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<h2 style="margin:0;flex:1">Points à vérifier</h2>' +
      '<button class="btn sec" id="hAllOk" style="width:auto;padding:6px 10px;margin:0;font-size:12px">✅ Tout OK</button></div>';
    t.items.forEach(function (key) {
      var it = r.items[key] || { st: "na", note: "" }, def = ITEMS[key];
      html += '<div style="border-top:1px solid #eef1f2;padding:9px 0">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
        '<div style="font-size:18px;width:26px;text-align:center">' + def.ic + '</div>' +
        '<div style="flex:1;font-weight:700;font-size:14px">' + esc(def.label) + '</div>' +
        '<div style="display:flex;gap:4px">' + seg(key, "ok", it.st) + seg(key, "att", it.st) + seg(key, "hs", it.st) + '</div></div>' +
        '<div class="hNoteWrap" data-key="' + key + '" style="display:' + (it.st === "att" || it.st === "hs" || it.note ? "block" : "none") + ';margin:6px 0 0 34px">' +
        '<input type="text" class="hNote" data-key="' + key + '" placeholder="' + esc(def.hint || "précision…") + '" value="' + esc(it.note || "") + '" ' +
        'style="width:100%;border:1.4px solid #d6dbde;border-radius:8px;padding:7px 9px;font-size:13px;background:#fafbfb">' +
        (it.date && it.st !== "ok" && it.st !== "na" ? '<div class="tiny muted" style="margin-top:2px">depuis le ' + frDate(it.date) + '</div>' : "") +
        '</div></div>';
    });
    html += '</div>';

    /* travaux à faire */
    var open = openTodos(r), done = r.todos.filter(function (x) { return x.done; });
    html += '<div class="panel" style="padding:12px"><h2>Travaux à faire (' + open.length + ')</h2>';
    if (!open.length) html += '<div class="tiny muted">Rien en attente sur cette clé.</div>';
    open.forEach(function (td) {
      html += '<div class="row-item hTd" data-tid="' + td.id + '" style="padding:9px 10px;margin-bottom:6px">' +
        '<div class="row-icon" style="background:#5c6bc0">🔧</div>' +
        '<div class="row-body"><div class="row-title" style="font-size:13.5px">' + esc(td.txt) + '</div>' +
        '<div class="row-desc">depuis le ' + frDate(td.date) + (td.who ? " · " + esc(td.who) : "") + '</div></div><div class="row-chev">✓</div></div>';
    });
    html += '<div style="display:flex;gap:7px;margin-top:6px">' +
      '<input type="text" id="hNewTodo" placeholder="ex. remplacer le décodeur, purger le réservoir…" style="flex:1;border:1.4px solid #d6dbde;border-radius:9px;padding:9px 10px;background:#fafbfb">' +
      '<button class="btn primary" id="hAddTodo" style="width:auto;padding:0 14px;margin:0;background:#5c6bc0">＋</button></div>';
    if (done.length) html += '<div class="tiny muted" style="margin-top:8px">' + done.length + ' travaux faits : ' +
      esc(done.slice(-3).map(function (x) { return x.txt + " (" + frDate(x.doneDate) + ")"; }).join(" · ")) + (done.length > 3 ? " …" : "") + '</div>';
    html += '</div>';

    /* observations + photos */
    html += '<div class="panel"><label class="fld"><span>Observations sur la clé</span>' +
      '<textarea id="hObs" placeholder="remarques générales, à surveiller…">' + esc(r.obs || "") + '</textarea></label>' +
      '<h2>📷 Photos (' + ph.length + ')</h2><div class="photos" id="hPh"></div></div>';

    html += '<button class="btn primary" id="hSave" style="background:' + t.color + '">💾 Enregistrer le passage (' + frDate(nowDate()) + ')</button>';
    if (window.MAINT && MAINT.openForKey) html += '<button class="btn sec" id="hInter" style="margin-top:9px">🛠️ Créer une fiche d\'intervention détaillée</button>';
    html += '<button class="btn sec" id="hHist" style="margin-top:9px">🕘 Historique de la clé (' + (r.hist || []).length + ')</button>' +
      '<div id="hHistBox" style="display:' + (V.showHist ? "block" : "none") + '"></div>';

    $("app").innerHTML = html;
    paintPhotos(id);
    paintHist(r);

    /* segments OK / ⚠ / HS : une touche = enregistré, la note apparaît si besoin */
    function bindSegs() {
      document.querySelectorAll(".hSeg").forEach(function (b2) {
        if (b2._bound) return; b2._bound = true;
        b2.onclick = function () {
          var key = b2.dataset.key, val = b2.dataset.st;
          var it = r.items[key] || {}, was = it.st || "na";
          var w = document.querySelector('.hNoteWrap[data-key="' + key + '"]');
          var note = (w && w.querySelector("input") && w.querySelector("input").value) || it.note || "";
          r.items[key] = { st: val, note: val === "ok" ? "" : note, date: (was === val ? it.date : nowDate()) || nowDate() };
          if (was !== val) pushHist(r, ITEMS[key].label + " : " + (STATES[was] || STATES.na).label + " → " + STATES[val].label + (note && val !== "ok" ? " (" + note + ")" : ""), who());
          touch("hebg:" + id);
          b2.parentNode.innerHTML = seg(key, "ok", val) + seg(key, "att", val) + seg(key, "hs", val);
          bindSegs();
          if (w) { w.style.display = (val === "ok") ? "none" : "block"; var inp = w.querySelector("input"); if (inp) { if (val === "ok") inp.value = ""; else { try { inp.focus(); } catch (e) {} } } }
        };
      });
    }
    bindSegs();
    document.querySelectorAll(".hNote").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var key = inp.dataset.key, it = r.items[key] || { st: "att", date: nowDate() };
        it.note = inp.value.trim(); if (it.st === "na" || it.st === "ok") it.st = "att";
        r.items[key] = it; touch("hebg:" + id);
        var w = inp.closest(".hNoteWrap");
        var segs = w && w.previousSibling && w.previousSibling.querySelector && w.previousSibling.querySelector("div:last-child");
        if (segs) { segs.innerHTML = seg(key, "ok", it.st) + seg(key, "att", it.st) + seg(key, "hs", it.st); bindSegs(); }
      });
    });
    $("hAllOk").onclick = function () {
      sheetConfirm("Tout marquer OK ?", "Tous les points de la clé " + id + " passent en OK (les travaux à faire restent).", "Tout OK", false, function () {
        t.items.forEach(function (key) {
          var it = r.items[key] || {};
          if (it.st && it.st !== "ok" && it.st !== "na") pushHist(r, ITEMS[key].label + " : " + STATES[it.st].label + " → OK", who());
          r.items[key] = { st: "ok", note: "", date: nowDate() };
        });
        touch("hebg:" + id); render();
      });
    };
    $("hAddTodo").onclick = function () {
      var txt = $("hNewTodo").value.trim(); if (!txt) { $("hNewTodo").focus(); return; }
      r.todos.push({ id: rid(), txt: txt, date: nowDate(), who: who(), done: false });
      pushHist(r, "Travaux à faire ajoutés : " + txt, who());
      touch("hebg:" + id); render();
    };
    $("hNewTodo").addEventListener("keydown", function (e) { if (e.key === "Enter") $("hAddTodo").click(); });
    document.querySelectorAll(".hTd").forEach(function (el) { el.onclick = function () { resolveTodo(id, el.dataset.tid, render); }; });
    $("hObs").addEventListener("change", function () { r.obs = this.value; touch("hebg:" + id); });
    $("hSave").onclick = function () {
      askWho(function (n) {
        /* les points jamais cochés restent "non vérifiés" : on ne suppose rien */
        r.date = nowDate(); r.by = n; r.obs = $("hObs") ? $("hObs").value : r.obs;
        var nPb = issues(id).length;
        pushHist(r, "Passage enregistré — " + (nPb ? nPb + " point(s) en attente" : "tout OK"), n);
        touch("hebg:" + id);
        toast("💾 Clé " + id + " enregistrée" + (nPb ? " — " + nPb + " point(s) à suivre" : " — tout OK"));
        V.screen = "grid"; render();
      });
    };
    if ($("hInter")) $("hInter").onclick = function () { MAINT.openForKey(id, keyLabel(id)); };
    $("hHist").onclick = function () { V.showHist = !V.showHist; $("hHistBox").style.display = V.showHist ? "block" : "none"; };
  }
  function seg(key, st, cur) {
    var s = STATES[st], on = cur === st;
    return '<button type="button" class="hSeg" data-key="' + key + '" data-st="' + st + '" style="min-width:44px;height:36px;border-radius:8px;border:1.6px solid ' + s.color +
      ';font-weight:800;font-size:13px;cursor:pointer;background:' + (on ? s.color : "#fff") + ';color:' + (on ? "#fff" : s.color) + '">' + s.short + '</button>';
  }
  function paintPhotos(id) {
    var box = $("hPh"); if (!box) return;
    var key = "hebg_" + id, ph = photosFor(key), h = "";
    ph.forEach(function (p) { h += '<div class="thumb" data-pid="' + p.id + '"><img src="' + p.url + '" alt=""></div>'; });
    h += '<button class="addphoto" id="hPhAdd">📷<span>PHOTO</span></button>';
    box.innerHTML = h;
    box.querySelectorAll(".thumb").forEach(function (t) { t.onclick = function () { openViewer(t.dataset.pid); }; });
    $("hPhAdd").onclick = function () { triggerPhoto(key, false); };
  }
  function paintHist(r) {
    var box = $("hHistBox"); if (!box) return;
    var hs = (r.hist || []).slice().reverse();
    if (!hs.length) { box.innerHTML = '<div class="panel tiny muted">Aucun historique.</div>'; return; }
    var h = '<div class="panel" style="padding:10px 12px">';
    hs.forEach(function (x) {
      h += '<div class="small" style="border-top:1px solid #eef1f2;padding:6px 0"><b>' + frDate(x.date) + (x.heure ? " " + esc(x.heure) : "") + '</b>' +
        (x.by ? ' <span class="muted">· ' + esc(x.by) + '</span>' : "") + '<br>' + esc(x.txt) + '</div>';
    });
    box.innerHTML = h + '</div>';
  }

  /* -------------------- EXPORT xlsx -------------------- */
  function exportXlsx() {
    var wb = XLSX.utils.book_new();
    var allItems = ["clim", "clim_salon", "clim_ch", "pac", "tv", "tv_salon", "tv_ch", "wifi", "spa", "brasseur", "ecl_int", "ecl_ext", "plomb", "fplafond", "deck", "divers"];
    var aoa = [["ÉTAT DES CHAMBRES & BUNGALOWS — HÔTEL WADRA BAY"], ["Généré le", nowDate() + " " + nowTime()], [],
      ["Clé", "Type", "État global", "Dernier passage", "Par", "Travaux en attente"].concat(allItems.map(function (k) { return ITEMS[k].label; })).concat(["Observations"])];
    KEYS.forEach(function (k) {
      var r = rec(k.id) || { items: {}, todos: [] }, st = keyStatus(k.id);
      var row = [k.id, TYPES[k.type].label, st === "na" ? "non visitée" : STATES[st].label, r.date ? frDate(r.date) : "", r.by || "", openTodos(r).length];
      allItems.forEach(function (key) {
        if (TYPES[k.type].items.indexOf(key) < 0) { row.push(""); return; }
        var it = r.items[key];
        row.push(!it || !it.st || it.st === "na" ? "?" : (STATES[it.st].label + (it.note ? " — " + it.note : "")));
      });
      row.push(r.obs || "");
      aoa.push(row);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = aoa[3].map(function (h, i) { return { wch: i < 6 ? 12 : 22 }; });
    XLSX.utils.book_append_sheet(wb, ws, "État des clés");

    var aoa2 = [["TRAVAUX ET POINTS EN ATTENTE"], [], ["Clé", "Type", "Nature", "Point / travaux", "État", "Depuis le"]];
    allIssues().forEach(function (x) {
      aoa2.push([x.key, keyType(x.key).label, x.kind === "todo" ? "Travaux" : "Équipement", x.txt, x.kind === "todo" ? "à faire" : STATES[x.st].label, frDate(x.date)]);
    });
    var ws2 = XLSX.utils.aoa_to_sheet(aoa2);
    ws2["!cols"] = [{ wch: 7 }, { wch: 16 }, { wch: 11 }, { wch: 60 }, { wch: 13 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "À faire");

    var aoa3 = [["HISTORIQUE"], [], ["Date", "Heure", "Clé", "Par", "Événement"]], ev = [];
    KEYS.forEach(function (k) {
      var r = rec(k.id); if (!r) return;
      (r.hist || []).forEach(function (x) { ev.push([x.date, x.heure || "", k.id, x.by || "", x.txt]); });
      (r.todos || []).filter(function (t) { return t.done; }).forEach(function (t) { ev.push([t.doneDate || "", "", k.id, t.by || "", "Fait : " + t.txt]); });
    });
    ev.sort(function (a, b) { return (a[0] + a[1]) < (b[0] + b[1]) ? 1 : -1; });
    ev.forEach(function (e) { aoa3.push([frDate(e[0]), e[1], e[2], e[3], e[4]]); });
    var ws3 = XLSX.utils.aoa_to_sheet(aoa3);
    ws3["!cols"] = [{ wch: 11 }, { wch: 6 }, { wch: 6 }, { wch: 16 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Historique");
    XLSX.writeFile(wb, "WADRA_Bay_Etat_Chambres_" + nowDate() + ".xlsx");
    toast("Export téléchargé");
  }

  /* -------------------- SEED : rapport JC ALIKIE du 22/03/2026 -------------------- */
  /* Appliqué une seule fois par appareil, avec un horodatage ANCIEN et sans
     envoi : la base partagée (pré-remplie avec les mêmes données) et toute
     saisie ultérieure d'un technicien gagnent toujours sur ce point de départ. */
  var SEED_DATE = "2026-03-22", SEED_BY = "JC ALIKIE", SEED_TS = "2026-03-22T08:00:00.000Z";
  var SEED = window.WADRA_HEBG_SEED || null;
  function applySeed() {
    var H = ensureH();
    if (!SEED || H._seed === "v30") return;
    Object.keys(SEED).forEach(function (id) {
      if (H[id] || !keyInfo(id)) return; /* jamais par-dessus une saisie */
      var s = SEED[id], r = { items: {}, todos: [], hist: [], date: SEED_DATE, by: SEED_BY, obs: s.obs || "" };
      keyType(id).items.forEach(function (k) { r.items[k] = { st: "na", note: "", date: SEED_DATE }; });
      Object.keys(s.items || {}).forEach(function (k) {
        var v = s.items[k]; r.items[k] = { st: v[0], note: v[1] || "", date: SEED_DATE };
      });
      (s.todos || []).forEach(function (t, j) { r.todos.push({ id: "seed_" + id + "_" + j, txt: t, date: SEED_DATE, who: SEED_BY, done: false }); });
      r.hist.push({ date: SEED_DATE, heure: "", by: SEED_BY, txt: "Rapport bungalows & chambres du 22 mars 2026 (point de départ)" });
      H[id] = r;
      state.ts = state.ts || {}; if (!state.ts["hebg:" + id]) state.ts["hebg:" + id] = SEED_TS;
    });
    H._seed = "v30";
    try { scheduleSave(); } catch (e) {}
  }

  /* -------------------- rendu principal -------------------- */
  function render() {
    ensureH();
    window.scrollTo(0, 0);
    if (V.screen === "key") renderKey();
    else if (V.screen === "todo") renderTodo();
    else renderGrid();
  }

  window.HEBG = {
    render: render,
    back: back,
    seed: applySeed,
    keyLabel: keyLabel,
    keys: function () { return KEYS.map(function (k) { return { id: k.id, label: keyLabel(k.id) }; }); },
    counts: function () {
      var iss = allIssues();
      return { hs: iss.filter(function (x) { return x.st === "hs"; }).length, att: iss.filter(function (x) { return x.st === "att"; }).length,
               todo: iss.filter(function (x) { return x.kind === "todo"; }).length, total: iss.length };
    },
    lastDate: function () { var d = ""; KEYS.forEach(function (k) { var r = rec(k.id); if (r && r.date > d) d = r.date; }); return d ? frDate(d) : null; },
    openKey: function (id) { V.screen = "key"; V.id = id; nav("hebg"); },
    photoAdded: function (key) {
      if (view.name !== "hebg" || V.screen !== "key") return;
      if (key === "hebg_" + V.id) paintPhotos(V.id);
    }
  };
})();
