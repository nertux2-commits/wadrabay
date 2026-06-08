/* =====================================================================
   WADRA Bay — Moteur de synchronisation (Supabase)
   ---------------------------------------------------------------------
   Greffé sur l'appli existante. Ne casse jamais le mode hors-ligne :
   - toutes les saisies restent enregistrées localement (IndexedDB) ;
   - dès qu'il y a Internet, l'appli pousse ses nouveautés vers la base
     partagée et récupère celles des autres opérateurs ;
   - "dernière écriture gagne" (comparaison par horodatage d'édition).
   Dépend des variables/fonctions globales de index.html :
     state, photos, idbOK, idbPut, idbDel, persistState, nav, view, BASE
   ===================================================================== */
(function () {
  "use strict";

  var CFG = window.WADRA_CFG || {};
  var configured =
    CFG.SUPABASE_URL && CFG.SUPABASE_URL.indexOf("REMPLACER") < 0 &&
    CFG.SUPABASE_ANON && CFG.SUPABASE_ANON.indexOf("REMPLACER") < 0;

  var BUCKET = "photos";
  var sb = null;
  var signedIn = false;
  var busy = false;
  var changed = false;
  var pending = 0;
  var kickTimer = null;

  function T(x) { return x ? (Date.parse(x) || 0) : 0; }
  function photoTime(id) { var m = /p(\d+)_/.exec(id || ""); return m ? Number(m[1]) : Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  /* -------------------- état de synchro dans `state` -------------------- */
  function ensureSyncState() {
    state.ts = state.ts || {};            // id d'entrée -> horodatage d'édition local
    state.dirty = state.dirty || {};      // id d'entrée en attente d'envoi
    state.customDel = state.customDel || {}; // "zone:cid" -> "done" | true (tombstones équip. ajoutés)
    state.photoDel = state.photoDel || {};   // photoId -> {key, done}
    state.zones = state.zones || {};      // entrées "zone:" reçues de la base partagée
    state.custom = state.custom || {};    // équipements ajoutés sur le terrain (par zone)
    state.sync = state.sync || {};
    if (!state.sync.device) state.sync.device = "dev_" + Math.random().toString(36).slice(2, 9);
    state.sync.entriesPull = state.sync.entriesPull || "1970-01-01T00:00:00Z";
    state.sync.photosPull = state.sync.photosPull || "1970-01-01T00:00:00Z";
  }

  /* -------------------- indicateur visuel -------------------- */
  function injectBadge() {
    if (document.getElementById("syncBadge")) return;
    var st = document.createElement("style");
    st.textContent =
      "#syncBadge{position:fixed;left:12px;bottom:calc(env(safe-area-inset-bottom) + 12px);" +
      "z-index:55;display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:20px;" +
      "font-size:12.5px;font-weight:700;color:#fff;background:#8895a3;box-shadow:0 2px 8px rgba(0,0,0,.22);" +
      "cursor:pointer;-webkit-tap-highlight-color:transparent}" +
      "#syncBadge .d{width:8px;height:8px;border-radius:50%;background:#fff;opacity:.9}" +
      "#syncBadge.s-ok{background:#1a9d5a}#syncBadge.s-sync{background:#2f7dd1}" +
      "#syncBadge.s-err{background:#c0392b}#syncBadge.s-off{background:#8895a3}" +
      "#syncBadge.s-pending{background:#e0892a}" +
      "@keyframes sbpulse{0%,100%{opacity:.35}50%{opacity:1}}" +
      "#syncBadge.s-sync .d{animation:sbpulse 1s infinite}";
    document.head.appendChild(st);
    var el = document.createElement("div");
    el.id = "syncBadge";
    el.innerHTML = '<span class="d"></span><span class="t">…</span>';
    el.onclick = function () {
      if (!configured) { toast("Synchro non configurée (config.js)"); return; }
      if (!signedIn) { showGate(); return; }
      if (!navigator.onLine) { toast("Hors ligne — sera synchronisé au retour du réseau"); return; }
      toast("Synchronisation…"); cycle();
    };
    document.body.appendChild(el);
  }
  function setBadge(text, cls) {
    var el = document.getElementById("syncBadge"); if (!el) return;
    el.className = "s-" + (cls || "off");
    el.querySelector(".t").textContent = text;
  }
  function countPending() {
    var n = Object.keys(state.dirty || {}).length;
    for (var id in photos) { if (photos.hasOwnProperty(id) && !photos[id].synced && !(state.photoDel || {})[id]) n++; }
    for (var pid in (state.photoDel || {})) { if (state.photoDel[pid] && state.photoDel[pid].done !== true) n++; }
    pending = n; return n;
  }
  function updateBadge() {
    if (!configured) { setBadge("Local", "off"); return; }
    if (!signedIn) { setBadge("Connexion…", "off"); return; }
    if (!navigator.onLine) { setBadge(pending ? "Hors ligne · " + pending : "Hors ligne", "pending"); return; }
    if (busy) { setBadge("Synchro…", "sync"); return; }
    if (pending) { setBadge("À envoyer · " + pending, "pending"); return; }
    setBadge("À jour", "ok");
  }

  /* -------------------- démarrage -------------------- */
  function start() {
    ensureSyncState();
    injectBadge();
    if (!configured) { updateBadge(); return; }
    if (!window.supabase || !window.supabase.createClient) { setBadge("Lib. absente", "err"); return; }
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON,
      { auth: { persistSession: true, autoRefreshToken: true } });
    window.addEventListener("online", function () { updateBadge(); cycle(); });
    window.addEventListener("offline", function () { updateBadge(); });
    sb.auth.getSession().then(function (r) {
      if (r && r.data && r.data.session) { signedIn = true; onReady(); }
      else { updateBadge(); showGate(); }
    }).catch(function () { updateBadge(); showGate(); });
  }

  function onReady() {
    signedIn = true;
    updateBadge();
    cycle();
    setInterval(function () { if (signedIn) cycle(); }, 30000);
  }

  /* appelé après chaque saisie locale */
  function kick() {
    countPending(); updateBadge();
    if (!signedIn || !navigator.onLine) return;
    clearTimeout(kickTimer);
    kickTimer = setTimeout(function () { push(); }, 1500);
  }

  function cycle() {
    if (!signedIn || !navigator.onLine || busy) { updateBadge(); return; }
    pull().then(push).catch(function () { busy = false; setBadge("Erreur", "err"); });
  }

  /* -------------------- ENVOI -------------------- */
  function push() {
    if (busy || !signedIn || !navigator.onLine) return Promise.resolve();
    busy = true; setBadge("Envoi…", "sync");
    return pushEntries()
      .then(pushPhotos)
      .then(function () { return persistState(); })
      .then(function () { busy = false; countPending(); updateBadge(); })
      .catch(function (e) { busy = false; setBadge("Erreur", "err"); console.warn("push", e); });
  }

  function buildEntryRow(id) {
    var ts = state.ts[id] || nowISO();
    var row = { id: id, updated_at: ts, device: state.sync.device,
                author: (state.meta.auditeur || ""), deleted: false, body: {} };
    if (id === "meta") { row.type = "meta"; row.body = { auditeur: state.meta.auditeur || "" }; return row; }
    if (id.indexOf("zone:") === 0) { row.type = "zone"; row.body = state.zones[id.slice(5)] || {}; return row; }
    if (id.indexOf("equip:") === 0) { row.type = "equip"; row.body = state.equip[id.slice(6)] || {}; return row; }
    if (id.indexOf("custom:") === 0) {
      row.type = "custom";
      var rest = id.slice(7), p = rest.split(":"), zone = p[0], cid = p[1];
      row.body = { zone: Number(zone), cid: Number(cid) };
      if ((state.customDel || {})[rest]) { row.deleted = true; return row; }
      var arr = state.custom[zone] || [];
      var o = arr.filter(function (x) { return String(x.cid) === String(cid); })[0];
      if (!o) { row.deleted = true; return row; }
      row.body.name = o.name || "";
      return row;
    }
    return null;
  }

  function pushEntries() {
    var ids = Object.keys(state.dirty || {});
    if (!ids.length) return Promise.resolve();
    var rows = [];
    ids.forEach(function (id) { var r = buildEntryRow(id); if (r) rows.push(r); });
    var chain = Promise.resolve();
    for (var i = 0; i < rows.length; i += 200) {
      (function (chunk) {
        chain = chain.then(function () {
          return sb.from("entries").upsert(chunk, { onConflict: "id" })
            .then(function (res) { if (res.error) throw res.error; });
        });
      })(rows.slice(i, i + 200));
    }
    return chain.then(function () { ids.forEach(function (id) { delete state.dirty[id]; }); });
  }

  function pushPhotos() {
    var ups = [];
    for (var id in photos) {
      if (photos.hasOwnProperty(id) && !photos[id].synced && !(state.photoDel || {})[id]) ups.push(photos[id]);
    }
    var chain = Promise.resolve();
    ups.forEach(function (p) {
      var path = "eq/" + p.key + "/" + p.id + ".jpg";
      chain = chain.then(function () {
        return sb.storage.from(BUCKET).upload(path, p.blob, { upsert: true, contentType: "image/jpeg" });
      }).then(function (up) {
        if (up && up.error) { var c = up.error.statusCode; if (c && String(c) !== "409") throw up.error; }
        var row = { id: p.id, key: p.key, zone_id: (typeof p.zoneId === "number" && isFinite(p.zoneId)) ? p.zoneId : null, path: path, deleted: false,
                    plate: !!p.plate,
                    device: state.sync.device, author: (state.meta.auditeur || ""),
                    updated_at: new Date(photoTime(p.id)).toISOString() };
        return sb.from("photos").upsert(row, { onConflict: "id" });
      }).then(function (res) {
        if (res && res.error) throw res.error;
        p.synced = true;
        if (idbOK) { try { return idbPut("photos", { id: p.id, key: p.key, zoneId: p.zoneId, blob: p.blob, synced: true }); } catch (e) {} }
      });
    });
    // tombstones photos
    var dels = Object.keys(state.photoDel || {});
    dels.forEach(function (pid) {
      var info = state.photoDel[pid];
      if (!info || info.done === true) return;
      var path = "eq/" + (info.key || "") + "/" + pid + ".jpg";
      chain = chain.then(function () {
        return sb.from("photos").update({ deleted: true, device: state.sync.device,
          author: (state.meta.auditeur || ""), updated_at: nowISO() }).eq("id", pid);
      }).then(function (res) {
        if (res && res.error) throw res.error;
        if (info.key) { try { return sb.storage.from(BUCKET).remove([path]); } catch (e) {} }
      }).then(function () { state.photoDel[pid] = { key: info.key, done: true }; });
    });
    return chain;
  }

  /* -------------------- RÉCEPTION -------------------- */
  function pull() {
    if (!signedIn || !navigator.onLine) return Promise.resolve();
    busy = true; setBadge("Réception…", "sync"); changed = false;
    return pullEntries().then(pullPhotos).then(function () {
      return persistState();
    }).then(function () {
      busy = false; countPending(); updateBadge();
      if (changed) maybeRerender();
    }).catch(function (e) { busy = false; setBadge("Erreur", "err"); console.warn("pull", e); });
  }

  function applyEntry(row) {
    if (row.type === "meta") {
      if (row.body && typeof row.body.auditeur === "string") state.meta.auditeur = row.body.auditeur;
      return;
    }
    if (row.type === "zone") { state.zones[row.id.slice(5)] = row.body || {}; return; }
    if (row.type === "equip") {
      var k = row.id.slice(6);
      if (row.deleted) delete state.equip[k]; else state.equip[k] = row.body || {};
      return;
    }
    if (row.type === "custom") {
      var b = row.body || {}, zone = String(b.zone), cid = b.cid;
      if (!state.custom[zone]) state.custom[zone] = [];
      var arr = state.custom[zone];
      var idx = -1;
      for (var i = 0; i < arr.length; i++) { if (String(arr[i].cid) === String(cid)) { idx = i; break; } }
      if (row.deleted) {
        if (idx >= 0) arr.splice(idx, 1);
        delete state.equip["z" + zone + "_c" + cid];
        var key = "z" + zone + "_c" + cid;
        for (var pid in photos) { if (photos.hasOwnProperty(pid) && photos[pid].key === key) removePhotoLocal(pid); }
        state.customDel[zone + ":" + cid] = "done";
      } else {
        if (idx >= 0) { if (b.name) arr[idx].name = b.name; }
        else arr.push({ cid: Number(cid), name: b.name || "Équipement ajouté" });
      }
    }
  }

  function pullEntries() {
    var since = state.sync.entriesPull;
    return sb.from("entries").select("*").gt("updated_at", since)
      .order("updated_at", { ascending: true }).limit(5000)
      .then(function (res) {
        if (res.error) throw res.error;
        var rows = res.data || [], maxTs = since;
        rows.forEach(function (row) {
          if (T(row.updated_at) > T(maxTs)) maxTs = row.updated_at;
          if (row.device === state.sync.device) {
            if (T(row.updated_at) > T(state.ts[row.id])) state.ts[row.id] = row.updated_at;
            return; // notre propre écho
          }
          var localTs = state.ts[row.id];
          if (localTs && T(localTs) >= T(row.updated_at)) return; // local plus récent -> on garde (et on poussera)
          applyEntry(row);
          state.ts[row.id] = row.updated_at;
          delete state.dirty[row.id]; // version distante appliquée -> on abandonne notre version périmée
          changed = true;
        });
        state.sync.entriesPull = maxTs;
      });
  }

  function pullPhotos() {
    var since = state.sync.photosPull;
    return sb.from("photos").select("*").gt("updated_at", since)
      .order("updated_at", { ascending: true }).limit(5000)
      .then(function (res) {
        if (res.error) throw res.error;
        var rows = res.data || [], maxTs = since;
        var chain = Promise.resolve();
        rows.forEach(function (row) {
          if (T(row.updated_at) > T(maxTs)) maxTs = row.updated_at;
          if (row.device === state.sync.device) return; // notre propre écho
          if (row.deleted) {
            if (photos[row.id]) { removePhotoLocal(row.id); changed = true; }
            state.photoDel[row.id] = { key: row.key, done: true };
            return;
          }
          if (photos[row.id] || (state.photoDel || {})[row.id]) return;
          chain = chain.then(function () {
            return sb.storage.from(BUCKET).download(row.path).then(function (dl) {
              if (!dl || dl.error || !dl.data) return;
              var blob = dl.data;
              var rec = { id: row.id, key: row.key, zoneId: row.zone_id, blob: blob, plate: !!row.plate, synced: true };
              var put = (idbOK) ? Promise.resolve().then(function () { return idbPut("photos", rec); }).catch(function () {}) : Promise.resolve();
              return put.then(function () {
                var rec2 = { id: row.id, key: row.key, zoneId: row.zone_id, blob: blob, plate: !!row.plate, synced: true };
                rec2.url = URL.createObjectURL(blob);
                photos[row.id] = rec2;
                changed = true;
              });
            }).catch(function () {});
          });
        });
        return chain.then(function () { state.sync.photosPull = maxTs; });
      });
  }

  function removePhotoLocal(id) {
    var p = photos[id]; if (!p) return;
    if (p.url) { try { URL.revokeObjectURL(p.url); } catch (e) {} }
    delete photos[id];
    if (idbOK) { try { idbDel("photos", id); } catch (e) {} }
  }

  /* re-render sans gêner une saisie en cours */
  function maybeRerender() {
    var a = document.activeElement;
    var editing = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT");
    if (editing) return; // on rafraîchira au prochain cycle
    if (typeof nav === "function" && view && view.name) {
      try { nav(view.name); } catch (e) {}
    }
  }

  /* -------------------- portail mot de passe partagé -------------------- */
  function showGate() {
    if (document.getElementById("syncGate")) return;
    var ov = document.createElement("div");
    ov.id = "syncGate";
    ov.style.cssText =
      "position:fixed;inset:0;z-index:400;background:rgba(13,30,28,.96);display:flex;" +
      "flex-direction:column;align-items:center;justify-content:center;padding:24px;color:#fff;" +
      "padding-top:calc(env(safe-area-inset-top) + 24px)";
    ov.innerHTML =
      '<div style="max-width:360px;width:100%;text-align:center">' +
      '<div style="font-size:19px;font-weight:800;margin-bottom:6px">Base partagée WADRA Bay</div>' +
      '<div style="font-size:13.5px;opacity:.85;margin-bottom:18px;line-height:1.5">' +
      'Entrez le mot de passe partagé pour synchroniser vos relevés avec l\'équipe.</div>' +
      '<input id="gateName" type="text" placeholder="Votre nom (opérateur)" ' +
      'style="width:100%;padding:12px;border-radius:11px;border:none;margin-bottom:10px;font-size:16px">' +
      '<input id="gatePass" type="password" placeholder="Mot de passe partagé" ' +
      'style="width:100%;padding:12px;border-radius:11px;border:none;margin-bottom:6px;font-size:16px">' +
      '<div id="gateMsg" style="min-height:18px;font-size:12.5px;color:#ffd2cc;margin-bottom:10px"></div>' +
      '<button id="gateGo" style="width:100%;padding:13px;border-radius:11px;border:none;' +
      'background:#1a9d5a;color:#fff;font-weight:700;font-size:15px">Se connecter</button>' +
      '<button id="gateSkip" style="width:100%;padding:12px;border-radius:11px;border:1.5px solid rgba(255,255,255,.4);' +
      'background:transparent;color:#fff;font-weight:600;font-size:14px;margin-top:9px">Continuer hors-ligne</button>' +
      '</div>';
    document.body.appendChild(ov);
    var nameEl = ov.querySelector("#gateName");
    if (state.meta && state.meta.auditeur) nameEl.value = state.meta.auditeur;
    ov.querySelector("#gateSkip").onclick = function () { ov.remove(); updateBadge(); };
    ov.querySelector("#gateGo").onclick = function () { doSignIn(ov); };
    ov.querySelector("#gatePass").addEventListener("keydown", function (e) { if (e.key === "Enter") doSignIn(ov); });
  }
  function doSignIn(ov) {
    var msg = ov.querySelector("#gateMsg");
    var name = ov.querySelector("#gateName").value.trim();
    var pass = ov.querySelector("#gatePass").value;
    if (!pass) { msg.textContent = "Saisissez le mot de passe."; return; }
    msg.style.color = "#cfe9d8"; msg.textContent = "Connexion…";
    sb.auth.signInWithPassword({ email: CFG.SHARED_EMAIL, password: pass })
      .then(function (r) {
        if (r.error) { msg.style.color = "#ffd2cc"; msg.textContent = "Mot de passe incorrect."; return; }
        if (name) { state.meta.auditeur = name; state.ts["meta"] = nowISO(); state.dirty["meta"] = 1; persistState(); }
        ov.remove(); onReady();
      })
      .catch(function () { msg.style.color = "#ffd2cc"; msg.textContent = "Connexion impossible (réseau ?)."; });
  }

  /* -------------------- API exposée à index.html -------------------- */
  window.Sync = {
    configured: configured,
    start: start,
    kick: kick,
    cycle: cycle,
    gate: showGate,
    reset: ensureSyncState
  };

  // si l'appli est déjà prête au moment du chargement de ce script
  if (window.__APP_READY) start();
})();
