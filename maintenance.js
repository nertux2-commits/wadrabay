/* =====================================================================
   WADRA Bay — Module MAINTENANCE (registre des interventions)
   ---------------------------------------------------------------------
   Greffé sur l'appli existante SANS rien modifier de l'inventaire ni
   de la campagne de mesures. Démarche qualité (esprit SMÉ / PDCA) :
   - Signalement rapide d'une panne par n'importe qui (30 s, photo) ;
   - Fiche d'intervention complète (correctif / préventif) : constat,
     cause identifiée, action réalisée, pièces, statut, contrôle de
     l'efficacité après réparation, photos avant/après ;
   - Impact direct sur le recensement : l'état de santé de l'équipement
     (En service / Dégradé / En panne) est déduit des interventions,
     et un équipement à l'arrêt passe en régime « panne » dans le bilan ;
   - Historique par équipement + moteur de recherche ;
   - Export xlsx : Registre + Par équipement + Indicateurs.
   Stockage local (state.inter) + synchro Supabase (type "inter").
   Dépend des globales de index.html : state, $, esc, toast, touch, nav,
   view, rndId, TREE, rebuildTree, photosFor, triggerPhoto, openViewer,
   openSheet, closeSheet, sheetConfirm, sheetChoose, sheetActions,
   sheetInput, addEquipStruct, XLSX.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------- référentiels -------------------- */
  var NATURES = [
    { key: "elec",  label: "Électrique",                 ic: "⚡" },
    { key: "meca",  label: "Mécanique",                  ic: "⚙️" },
    { key: "hydr",  label: "Hydraulique / plomberie",    ic: "💧" },
    { key: "froid", label: "Froid / climatisation",      ic: "❄️" },
    { key: "regul", label: "Régulation / automatisme",   ic: "🎛️" },
    { key: "fuite", label: "Fuite / étanchéité",         ic: "💦" },
    { key: "usure", label: "Usure / vétusté",            ic: "🪫" },
    { key: "autre", label: "Autre",                      ic: "🔧" }
  ];
  var GAMMES = [
    { key: "graissage", label: "Graissage / lubrification" },
    { key: "filtres",   label: "Filtres (nettoyage / remplacement)" },
    { key: "nettoyage", label: "Nettoyage / détartrage / dégrilleur" },
    { key: "controle",  label: "Contrôle / inspection périodique" },
    { key: "serrage",   label: "Resserrage connexions électriques" },
    { key: "autre",     label: "Autre entretien" }
  ];
  var STATUTS = [
    { key: "signale",    label: "Signalé — à prendre en charge",          open: true,  color: "#c0392b" },
    { key: "encours",    label: "En cours de traitement",                 open: true,  color: "#e0892a" },
    { key: "attente",    label: "En attente (pièce / devis / presta.)",   open: true,  color: "#8e44ad" },
    { key: "provisoire", label: "Réparation provisoire — à fiabiliser",   open: false, color: "#e0892a" },
    { key: "repare",     label: "Réparé — clôturé",                       open: false, color: "#1a9d5a" },
    { key: "fait",       label: "Fait (entretien préventif)",             open: false, color: "#1a9d5a" }
  ];
  var TECHS_DEFAUT = ["JC ALIKIE", "François YANTAO"];
  /* déclarants : tout agent de l'hôtel peut signaler — liste complétable dans l'appli */
  var STAFF_DEFAUT = ["Jordan (direction)", "JC ALIKIE", "François YANTAO", "Marvin WAITRONYIE",
    "Célestin", "Réception", "Femme de chambre", "Cuisine", "Restaurant / bar", "Jardinier / extérieurs"];

  function natureBy(k) { return NATURES.filter(function (n) { return n.key === k; })[0] || null; }
  function gammeBy(k) { return GAMMES.filter(function (g) { return g.key === k; })[0] || null; }
  function statutBy(k) { return STATUTS.filter(function (s) { return s.key === k; })[0] || STATUTS[0]; }
  function natLabel(r) {
    if (r.type === "prev") { var g = gammeBy(r.gamme); return g ? g.label : "Entretien"; }
    var n = natureBy(r.nature); return n ? n.label : "—";
  }
  function natIcon(r) {
    if (r.type === "prev") return "🧰";
    var n = natureBy(r.nature); return n ? n.ic : "🔧";
  }

  /* -------------------- accès aux données -------------------- */
  function ensureI() { state.inter = state.inter || {}; return state.inter; }
  function techList() {
    var c = ensureI()["_techs"];
    if (c && c.list && c.list.length) return c.list;
    return TECHS_DEFAUT.slice();
  }
  function addTech(name) {
    var I = ensureI();
    var cur = techList();
    if (cur.indexOf(name) >= 0) return;
    cur.push(name);
    I["_techs"] = { list: cur };
    touch("inter:_techs");
  }
  function staffList() {
    var c = ensureI()["_staff"];
    var base = STAFF_DEFAUT.slice();
    if (c && c.list && c.list.length) {
      c.list.forEach(function (n) { if (base.indexOf(n) < 0) base.push(n); });
    }
    return base;
  }
  function addStaff(name) {
    var I = ensureI();
    if (staffList().indexOf(name) >= 0) return;
    var c = I["_staff"] || { list: [] };
    c.list = c.list || [];
    c.list.push(name);
    I["_staff"] = c;
    touch("inter:_staff");
  }
  function lastDecl() { try { return localStorage.getItem("wadra_decl") || ""; } catch (e) { return ""; } }
  function rememberDecl(n) { try { if (n) localStorage.setItem("wadra_decl", n); } catch (e) {} }
  function allInter() {
    var I = ensureI(), out = [];
    for (var k in I) {
      if (!I.hasOwnProperty(k) || k.charAt(0) === "_") continue;
      var r = I[k];
      if (r && r.date) out.push(Object.assign({ _id: k }, r));
    }
    out.sort(function (a, b) {
      return (a.date + " " + (a.heure || "")) < (b.date + " " + (b.heure || "")) ? -1 : 1;
    });
    return out;
  }
  function forEquip(eqId) {
    return allInter().filter(function (r) { return r.equip === eqId; });
  }
  function isOpen(r) { return !!statutBy(r.statut).open; }
  function openRows() { return allInter().filter(isOpen); }

  /* état de santé d'un équipement, déduit de ses interventions */
  function health(eqId) {
    var rs = forEquip(eqId);
    if (!rs.length) return null;
    var worst = null;
    rs.forEach(function (r) {
      if (isOpen(r)) worst = (r.arret ? "panne" : (worst === "panne" ? worst : "degrade"));
    });
    if (worst) return worst;
    var last = rs[rs.length - 1];
    return last.statut === "provisoire" ? "degrade" : "ok";
  }
  function healthLabel(code) {
    return code === "panne" ? "EN PANNE" : code === "degrade" ? "DÉGRADÉ" : code === "ok" ? "EN SERVICE" : "";
  }
  function healthColor(code) {
    return code === "panne" ? "#c0392b" : code === "degrade" ? "#e0892a" : "#1a9d5a";
  }

  /* -------------------- index des équipements (recensement) -------------------- */
  function equipIndex() {
    try { rebuildTree(); } catch (e) {}
    var out = [];
    (TREE || []).forEach(function (z) {
      z.rooms.forEach(function (rm) {
        rm.equipment.forEach(function (e) {
          out.push({ id: e.id, name: e.name, zone: z.name, zoneId: z.id, room: rm.name, roomId: rm.id });
        });
      });
    });
    return out;
  }
  var EQ_CACHE = null;
  function eqInfo(eqId) {
    if (!eqId) return null;
    if (!EQ_CACHE) EQ_CACHE = {};
    if (EQ_CACHE[eqId]) return EQ_CACHE[eqId];
    var hit = equipIndex().filter(function (x) { return x.id === eqId; })[0] || null;
    if (hit) EQ_CACHE[eqId] = hit;
    return hit;
  }
  function eqLabel(r) {
    var inf = eqInfo(r.equip);
    if (inf) return inf.name;
    return r.equipTxt || "Équipement non précisé";
  }
  function eqPlace(r) {
    var inf = eqInfo(r.equip);
    return inf ? (inf.zone + " · " + inf.room) : "";
  }

  /* -------------------- utilitaires -------------------- */
  function nowDate() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function nowTime() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function frDate(d) { return d ? (d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4)) : ""; }
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    try { s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) {}
    return s;
  }
  function immoJours(r) { /* durée d'immobilisation en jours (si à l'arrêt et clôturé) */
    if (!r.arret || !r.dateRes) return null;
    var t0 = Date.parse(r.date + "T" + (r.heure || "00:00") + ":00");
    var t1 = Date.parse(r.dateRes + "T" + (r.heureRes || "12:00") + ":00");
    if (isNaN(t0) || isNaN(t1) || t1 < t0) return null;
    return Math.round((t1 - t0) / 86400000 * 10) / 10;
  }
  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isNaN(n) ? null : n; }

  /* impact recensement : équipement à l'arrêt -> régime « panne » (bilan) ;
     à la clôture, restauration du régime antérieur si aucune autre
     intervention ouverte ne l'immobilise. */
  function applyEquipImpact(id) {
    var I = ensureI(), r = I[id];
    if (!r || !r.equip) return;
    state.equip[r.equip] = state.equip[r.equip] || {};
    var f = state.equip[r.equip];
    var openStop = allInter().some(function (x) { return x.equip === r.equip && isOpen(x) && x.arret; });
    if (openStop) {
      if (f.regime !== "panne") {
        r.regPrev = f.regime || "";
        f.regime = "panne";
        touch("equip:" + r.equip);
        touch("inter:" + id);
      }
    } else if (f.regime === "panne") {
      var prev = null;
      forEquip(r.equip).forEach(function (x) { if (x.regPrev != null) prev = x.regPrev; });
      if (prev != null) { f.regime = prev; touch("equip:" + r.equip); }
    }
  }

  /* -------------------- état interne du module -------------------- */
  var V = { screen: "dash", id: null, editId: null, draft: null, mode: null, preEquip: null, q: "" };

  function cleanDraftPhotos() { /* photos prises sur une fiche jamais enregistrée */
    if (!V.draft) return;
    var ph = photosFor(V.draft);
    ph.forEach(function (p) {
      if (p.synced) { state.photoDel = state.photoDel || {}; state.photoDel[p.id] = { key: p.key }; }
      try { deletePhoto(p.id); } catch (e) {}
    });
    V.draft = null;
  }
  function back() {
    if (V.screen === "form") {
      if (!V.editId) cleanDraftPhotos();
      V.screen = V.id ? "detail" : "dash"; V.editId = null; V.mode = null; render(); return true;
    }
    if (V.screen === "detail") { V.screen = "dash"; V.id = null; render(); return true; }
    return false;
  }

  /* -------------------- RENDU : tableau de bord -------------------- */
  function statutChip(r) {
    var s = statutBy(r.statut);
    return '<span style="display:inline-block;padding:1px 7px;border-radius:6px;font-size:10.5px;font-weight:800;' +
      'color:#fff;background:' + s.color + ';vertical-align:1px">' + esc(s.label.split(" — ")[0].split(" (")[0]) + '</span>';
  }
  function interRow(r) {
    return '<div class="row-item" data-iid="' + esc(r._id) + '">' +
      '<div class="row-icon" style="background:' + statutBy(r.statut).color + '">' + natIcon(r) + '</div>' +
      '<div class="row-body"><div class="row-title">' + esc(eqLabel(r)) + ' ' + statutChip(r) + '</div>' +
      '<div class="row-desc">' + frDate(r.date) + " " + esc(r.heure || "") + " · " + esc(natLabel(r)) +
      (r.tech ? " · " + esc(r.tech) : "") +
      (r.sympt ? " — " + esc(String(r.sympt).slice(0, 60)) : "") + '</div></div>' +
      '<div class="row-chev">›</div></div>';
  }
  function matchInter(r, q) {
    if (!q) return true;
    var hay = norm([eqLabel(r), eqPlace(r), natLabel(r), r.sympt, r.cause, r.action, r.pieces,
      r.tech, r.decl, r.obs, r.date, frDate(r.date), statutBy(r.statut).label].join(" "));
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function paintList() {
    var box = $("iList"); if (!box) return;
    var q = norm(V.q);
    var rows = allInter().filter(function (r) { return matchInter(r, q); });
    var open = rows.filter(isOpen);
    var closed = rows.filter(function (r) { return !isOpen(r); }).reverse();
    var h = "";
    if (open.length) {
      h += '<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#c0392b;margin:14px 2px 9px;font-weight:700">🔴 En cours (' + open.length + ')</h2>';
      open.forEach(function (r) { h += interRow(r); });
    }
    h += '<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#6b7785;margin:14px 2px 9px;font-weight:700">Historique — clôturées (' + closed.length + ')</h2>';
    if (!closed.length) h += '<div class="panel tiny muted">Aucune intervention clôturée' + (q ? " pour cette recherche" : "") + '.</div>';
    closed.slice(0, 50).forEach(function (r) { h += interRow(r); });
    if (closed.length > 50) h += '<div class="tiny muted" style="text-align:center;padding:6px">… ' + (closed.length - 50) + ' plus anciennes (affinez la recherche ou exportez le registre)</div>';
    if (!rows.length && q) h += '<div class="panel tiny muted">Aucun résultat pour « ' + esc(V.q) + ' ».</div>';
    box.innerHTML = h;
    box.querySelectorAll(".row-item[data-iid]").forEach(function (el) {
      el.onclick = function () { V.screen = "detail"; V.id = el.dataset.iid; render(); };
    });
  }
  function renderDash() {
    EQ_CACHE = null;
    var rows = allInter();
    var open = rows.filter(isOpen);
    var stops = {};
    open.forEach(function (r) { if (r.arret && r.equip) stops[r.equip] = 1; });
    var nStops = Object.keys(stops).length;

    var html = '<div style="border-radius:16px;overflow:hidden;margin-bottom:12px;padding:16px;color:#fff;' +
      'background:linear-gradient(135deg,#b3541e,#8a3a12 60%,#5f270a);box-shadow:0 2px 10px rgba(20,30,40,.18)">' +
      '<div style="font-size:19px;font-weight:800">🛠️ Maintenance — registre des interventions</div>' +
      '<div style="font-size:12.5px;opacity:.92;margin-top:3px">Traçabilité · analyse des causes · vérification de l\'efficacité · amélioration continue (PDCA)</div>' +
      '<div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + open.length + '</div><div style="font-size:11px;opacity:.9">en cours</div></div>' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + nStops + '</div><div style="font-size:11px;opacity:.9">équip. à l\'arrêt</div></div>' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + rows.length + '</div><div style="font-size:11px;opacity:.9">interventions</div></div>' +
      '</div></div>';

    html += '<button class="btn primary" id="iSignal" style="background:#c0392b">🚨 Signaler une panne (30 secondes)</button>' +
      '<button class="btn primary" id="iNew" style="background:#b3541e;margin-top:9px">🛠️ Nouvelle intervention (correctif)</button>' +
      '<button class="btn primary" id="iPrev" style="background:#0d7a6f;margin-top:9px">🧰 Entretien préventif</button>';

    html += '<div class="panel" style="margin-top:12px"><h2>Rechercher</h2>' +
      '<input type="text" id="iSearch" placeholder="Équipement, panne, technicien, date…" value="' + esc(V.q) + '" ' +
      'style="width:100%;border:1.4px solid #d6dbde;border-radius:9px;padding:9px 10px;background:#fafbfb"></div>';

    html += '<div class="panel"><h2>Export</h2>' +
      '<button class="btn sec" id="iExp">⬇️ Registre + indicateurs (xlsx)</button>' +
      '<div class="tiny muted" style="margin-top:7px">3 feuilles : registre chronologique complet, synthèse par équipement (récidives, immobilisation), indicateurs (délais, natures de panne, taux de clôture).</div></div>';

    html += '<div id="iList"></div>';

    $("app").innerHTML = html;
    $("iSignal").onclick = function () { openForm(null, null, "signal"); };
    $("iNew").onclick = function () { openForm(null, null, "cor"); };
    $("iPrev").onclick = function () { openForm(null, null, "prev"); };
    $("iExp").onclick = exportRegistre;
    $("iSearch").addEventListener("input", function () { V.q = this.value; paintList(); });
    paintList();
  }

  /* -------------------- RENDU : détail d'une intervention -------------------- */
  function renderDetail() {
    var r = ensureI()[V.id];
    if (!r) { V.screen = "dash"; return renderDash(); }
    r = Object.assign({ _id: V.id }, r);
    var s = statutBy(r.statut);
    var hl = r.equip ? health(r.equip) : null;
    var ph = photosFor(V.id);

    var html = '<div class="panel">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
      '<div style="font-size:26px">' + natIcon(r) + '</div>' +
      '<div style="flex:1"><div style="font-weight:800;font-size:16px">' + esc(eqLabel(r)) + '</div>' +
      '<div class="tiny muted">' + esc(eqPlace(r) || "hors recensement") + '</div></div></div>' +
      '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:4px">' +
      '<span class="badge" style="background:' + s.color + ';color:#fff">' + esc(s.label) + '</span>' +
      '<span class="badge" style="background:#eef1f2;color:#1a2025">' + (r.type === "prev" ? "🧰 Préventif" : "🛠️ Correctif") + '</span>' +
      (r.arret ? '<span class="badge" style="background:#c0392b;color:#fff">Équipement à l\'arrêt</span>' : "") +
      (hl ? '<span class="badge" style="background:' + healthColor(hl) + ';color:#fff">État actuel : ' + healthLabel(hl) + '</span>' : "") +
      '</div>' +
      '<div class="small" style="line-height:1.6">' +
      '<b>Constat :</b> ' + frDate(r.date) + " " + esc(r.heure || "") + (r.decl ? " · déclaré par " + esc(r.decl) : "") + "<br>" +
      '<b>Nature :</b> ' + esc(natLabel(r)) + "<br>" +
      (r.sympt ? '<b>Symptôme / constat :</b> ' + esc(r.sympt) + "<br>" : "") +
      (r.cause ? '<b>Cause identifiée :</b> ' + esc(r.cause) + "<br>" : "") +
      (r.action ? '<b>Action réalisée :</b> ' + esc(r.action) + "<br>" : "") +
      (r.pieces ? '<b>Pièces remplacées :</b> ' + esc(r.pieces) + "<br>" : "") +
      (r.tech ? '<b>Technicien :</b> ' + esc(r.tech) + "<br>" : "") +
      (r.duree ? '<b>Durée d\'intervention :</b> ' + esc(r.duree) + " h<br>" : "") +
      (r.dateRes ? '<b>Résolution :</b> ' + frDate(r.dateRes) + " " + esc(r.heureRes || "") +
        (immoJours(r) != null ? " · immobilisation " + immoJours(r) + " j" : "") + "<br>" : "") +
      (statutBy(r.statut).open ? "" : '<b>Efficacité vérifiée :</b> ' + (r.ctrl ? "✅ bon fonctionnement contrôlé" : "⚠️ non vérifiée") + "<br>") +
      (r.obs ? '<b>Observations :</b> ' + esc(r.obs) : "") +
      '</div></div>';

    var nAv = ph.filter(function (p) { return !p.plate; }).length;
    var nAp = ph.length - nAv;
    html += '<div class="panel"><h2>📷 Photos AVANT — constat (' + nAv + ')</h2><div class="photos" id="iPhAv"></div></div>' +
      '<div class="panel"><h2>📷 Photos APRÈS — réparation (' + nAp + ')</h2><div class="photos" id="iPhAp"></div></div>';

    if (isOpen(r)) {
      if (r.statut === "signale") html += '<button class="btn primary" id="iTake" style="background:#e0892a">👷 Prendre en charge (passe « en cours »)</button>';
      html += '<button class="btn primary" id="iClose" style="background:#1a9d5a;margin-top:9px">✅ Clôturer — réparé</button>';
    }
    html += '<button class="btn sec" id="iEdit" style="margin-top:9px">✏️ Modifier la fiche</button>';
    if (r.equip) html += '<button class="btn sec" id="iGoEq" style="margin-top:9px">📋 Voir l\'équipement (historique complet)</button>';
    html += '<button class="btn sec" id="iDel" style="margin-top:9px;color:#c0392b;border-color:#e7b3ab">🗑 Supprimer cette fiche</button>';

    $("app").innerHTML = html;
    paintAllStrips("iPh", V.id);
    if ($("iTake")) $("iTake").onclick = function () {
      var techs = techList().map(function (t) { return { label: "👷 " + t, value: t }; });
      sheetChoose("Prise en charge par…", "", techs, function (t) {
        var rec = ensureI()[V.id];
        rec.statut = "encours"; rec.tech = t;
        touch("inter:" + V.id); applyEquipImpact(V.id); render();
        toast("Intervention prise en charge par " + t);
      });
    };
    if ($("iClose")) $("iClose").onclick = function () {
      sheetActions("Clôturer l'intervention", [
        { label: "✅ Réparé — bon fonctionnement VÉRIFIÉ", cb: function () { closeInter(true, "repare"); } },
        { label: "☑️ Réparé — vérification à faire plus tard", cb: function () { closeInter(false, "repare"); } },
        { label: "🩹 Réparation provisoire (à fiabiliser)", cb: function () { closeInter(false, "provisoire"); } }
      ]);
    };
    $("iEdit").onclick = function () { openForm(null, V.id, null); };
    if ($("iGoEq")) $("iGoEq").onclick = function () {
      var inf = eqInfo(r.equip);
      if (!inf) { toast("Équipement hors recensement"); return; }
      view.tdId = inf.zoneId; view.roomId = inf.roomId; view.equipId = inf.id;
      nav("equip");
    };
    $("iDel").onclick = function () {
      sheetConfirm("Supprimer cette fiche ?", "L'historique de l'équipement perdra cette intervention.", "Supprimer", true, function () {
        var eq = (ensureI()[V.id] || {}).equip;
        delete ensureI()[V.id];
        touch("inter:" + V.id);
        if (eq) { /* recalcul de l'impact éventuel sur le régime */
          var fake = { equip: eq }; ensureI()["_tmp"] = fake; applyEquipImpact("_tmp"); delete ensureI()["_tmp"];
        }
        V.screen = "dash"; V.id = null; render();
        toast("Fiche supprimée");
      });
    };
  }
  function closeInter(ctrl, statut) {
    var rec = ensureI()[V.id];
    if (!rec) return;
    rec.statut = statut; rec.ctrl = !!ctrl;
    rec.dateRes = rec.dateRes || nowDate(); rec.heureRes = rec.heureRes || nowTime();
    if (!rec.tech) rec.tech = techList()[0] || "";
    touch("inter:" + V.id);
    applyEquipImpact(V.id);
    render();
    toast(statut === "provisoire" ? "Clôturée en réparation provisoire" : "Intervention clôturée — réparé");
  }

  /* deux zones : AVANT (plate=false) / APRÈS (plate=true) — réutilise le flag
     photo existant, la visionneuse permet de reclasser Avant↔Après */
  function paintPhotoStrip(boxId, key, apres) {
    var box = $(boxId); if (!box) return;
    var ph = photosFor(key).filter(function (p) { return !!p.plate === !!apres; });
    var h = "";
    ph.forEach(function (p) { h += '<div class="thumb" data-pid="' + p.id + '"><img src="' + p.url + '" alt=""></div>'; });
    h += '<button class="addphoto" id="' + boxId + 'Add">📷<span>' + (apres ? "APRÈS" : "AVANT") + '</span></button>';
    box.innerHTML = h;
    box.querySelectorAll(".thumb").forEach(function (t) { t.onclick = function () { openViewer(t.dataset.pid); }; });
    var ab = $(boxId + "Add");
    if (ab) ab.onclick = function () { triggerPhoto(key, !!apres); };
  }
  function paintAllStrips(prefix, key) {
    paintPhotoStrip(prefix + "Av", key, false);
    paintPhotoStrip(prefix + "Ap", key, true);
  }

  /* -------------------- sélecteur d'équipement -------------------- */
  function pickEquip(cb) {
    var idx = equipIndex();
    var recent = {};
    allInter().slice(-8).forEach(function (r) { if (r.equip) recent[r.equip] = 1; });
    openSheet('<h3>Équipement concerné</h3>' +
      '<input id="peQ" type="text" placeholder="Rechercher : nom, zone, pièce…" style="margin-bottom:8px">' +
      '<div id="peList" style="max-height:44vh;overflow:auto;margin-bottom:6px"></div>' +
      '<div class="sbtns"><button class="sbtn-cancel" id="peCancel">Annuler</button><button class="sbtn-ok" id="peNew">＋ Créer</button></div>');
    function paint() {
      var q = norm($("peQ").value);
      var list = idx.filter(function (e) {
        if (!q) return true;
        var f = state.equip[e.id] || {};
        var hay = norm(e.name + " " + e.zone + " " + e.room + " " + (f.marque || "") + " " + (f.modele || "") + " " + (f.local || ""));
        return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
      });
      var rec = list.filter(function (e) { return recent[e.id]; });
      var rest = list.filter(function (e) { return !recent[e.id]; });
      var show = rec.concat(rest).slice(0, 40);
      var h = "";
      show.forEach(function (e) {
        var hl = health(e.id);
        h += '<div class="opt" data-eid="' + esc(e.id) + '">' + (recent[e.id] ? "🕘 " : "") + esc(e.name) +
          (hl && hl !== "ok" ? ' <span style="color:' + healthColor(hl) + ';font-weight:800;font-size:11px">' + healthLabel(hl) + '</span>' : "") +
          '<div style="font-size:11.5px;color:#6b7785;font-weight:400">' + esc(e.zone + " · " + e.room) + '</div></div>';
      });
      if (list.length > 40) h += '<div class="tiny muted" style="padding:6px 2px">… ' + (list.length - 40) + ' autres — affinez la recherche</div>';
      if (!list.length) h += '<div class="tiny muted" style="padding:6px 2px">Aucun équipement trouvé — « ＋ Créer » pour l\'ajouter au recensement.</div>';
      $("peList").innerHTML = h;
      document.querySelectorAll("#peList .opt").forEach(function (el) {
        el.onclick = function () { closeSheet(); cb(el.dataset.eid); };
      });
    }
    $("peQ").addEventListener("input", paint);
    $("peCancel").onclick = closeSheet;
    $("peNew").onclick = function () {
      var pre = $("peQ").value.trim();
      closeSheet();
      setTimeout(function () { createEquipFlow(pre, cb); }, 200);
    };
    paint();
    setTimeout(function () { try { $("peQ").focus(); } catch (e) {} }, 80);
  }
  function createEquipFlow(preName, cb) {
    sheetInput("Nouvel équipement (ajouté au recensement)", "Il apparaîtra aussi dans l'inventaire", preName || "", "Continuer", function (name) {
      var opts = [];
      try { rebuildTree(); } catch (e) {}
      (TREE || []).forEach(function (z) { z.rooms.forEach(function (rm) { opts.push({ label: z.name + " · " + rm.name, value: rm.id }); }); });
      sheetChoose("Dans quelle pièce ?", name, opts, function (rid) {
        var id = addEquipStruct(rid, name);
        EQ_CACHE = null;
        toast("Équipement créé : " + name);
        cb(id);
      });
    });
  }

  /* -------------------- RENDU : formulaire -------------------- */
  function openForm(preEquip, editId, mode) {
    V.screen = "form";
    V.editId = editId || null;
    V.mode = editId ? null : (mode || "cor");
    V.preEquip = preEquip || null;
    if (!editId) V.draft = "it_" + rndId();
    render();
  }

  function renderForm() {
    var edit = V.editId ? ensureI()[V.editId] : null;
    var isSignal = !edit && V.mode === "signal";
    var cur = edit ? Object.assign({}, edit) : {
      type: V.mode === "prev" ? "prev" : "cor",
      statut: isSignal ? "signale" : (V.mode === "prev" ? "fait" : "encours"),
      equip: V.preEquip, equipTxt: "",
      date: nowDate(), heure: nowTime(),
      nature: "", gamme: "", sympt: "", cause: "", action: "", pieces: "",
      arret: false, dateRes: "", heureRes: "", ctrl: false,
      tech: "", decl: "", duree: "", obs: ""
    };
    var recId = V.editId || V.draft;
    var title = edit ? "Modifier la fiche" : (isSignal ? "🚨 Signaler une panne" : (cur.type === "prev" ? "🧰 Entretien préventif" : "🛠️ Nouvelle intervention"));

    var html = '<div class="panel"><h2>' + title + '</h2>';
    if (isSignal) html += '<div class="consigne">Décris en 30 secondes : l\'équipement, une photo, ce qui ne va pas. L\'équipe maintenance prendra le relais.</div>';

    if (!isSignal) {
      html += '<label class="fld"><span>Type d\'intervention</span><select id="fType">' +
        '<option value="cor"' + (cur.type !== "prev" ? " selected" : "") + '>🛠️ Correctif (panne / dysfonctionnement)</option>' +
        '<option value="prev"' + (cur.type === "prev" ? " selected" : "") + '>🧰 Préventif (entretien planifié)</option>' +
        '</select></label>';
    }

    html += '<label class="fld"><span>Équipement concerné</span>' +
      '<button type="button" class="btn sec" id="fEq" style="justify-content:flex-start;text-align:left;padding:10px 12px">' +
      (cur.equip ? "📋 " + esc(eqLabel(cur)) + '<span class="tiny muted" style="margin-left:6px">' + esc(eqPlace(cur)) + '</span>' : "👉 Choisir l\'équipement…") +
      '</button></label>' +
      '<div class="row2">' +
      '<label class="fld"><span>Date (auto, modifiable)</span><input type="date" id="fDate" value="' + esc(cur.date) + '"></label>' +
      '<label class="fld"><span>Heure</span><input type="time" id="fTime" value="' + esc(cur.heure) + '"></label>' +
      '</div>';

    /* nature / gamme */
    html += '<div id="fNatWrap">';
    html += '<label class="fld fCor"><span>Nature de la panne' + (isSignal ? " (si connue — l'équipe qualifiera)" : "") + '</span><select id="fNature">' +
      '<option value="">— choisir —</option>' +
      NATURES.map(function (n) { return '<option value="' + n.key + '"' + (cur.nature === n.key ? " selected" : "") + '>' + n.ic + " " + esc(n.label) + '</option>'; }).join("") +
      '</select></label>';
    html += '<label class="fld fPrev"><span>Type d\'entretien</span><select id="fGamme">' +
      '<option value="">— choisir —</option>' +
      GAMMES.map(function (g) { return '<option value="' + g.key + '"' + (cur.gamme === g.key ? " selected" : "") + '>' + esc(g.label) + '</option>'; }).join("") +
      '</select></label>';
    html += '</div>';

    html += '<label class="fld"><span id="fSymptLbl">Symptôme / constat</span>' +
      '<textarea id="fSympt" placeholder="ex. disjoncte au démarrage · fuite au presse-étoupe · bruit anormal">' + esc(cur.sympt || "") + '</textarea></label>';

    html += '<label class="fld" style="margin:4px 0 10px"><span style="display:flex;align-items:center;gap:8px;font-size:13px;color:#1a2025">' +
      '<input type="checkbox" id="fArret"' + (cur.arret ? " checked" : "") + ' style="width:auto;margin:0;transform:scale(1.2)"> ⛔ Équipement à l\'arrêt (hors service)</span>' +
      '<span class="tiny muted" style="display:block;margin-top:3px">Si coché : l\'équipement passe « EN PANNE » dans le recensement et sort du bilan jusqu\'à la réparation.</span></label>';

    /* déclarant : sélecteur pré-rempli (tous les agents de l'hôtel), complétable */
    var declSel = cur.decl || lastDecl() || "";
    var declOpts = staffList();
    if (declSel && declOpts.indexOf(declSel) < 0) declOpts = [declSel].concat(declOpts);
    var declHtml = '<select id="fDecl">' +
      '<option value="">— qui signale ? —</option>' +
      declOpts.map(function (n) { return '<option value="' + esc(n) + '"' + (n === declSel ? " selected" : "") + '>' + esc(n) + '</option>'; }).join("") +
      '<option value="__add">＋ Ajouter mon nom…</option>' +
      '</select>';

    if (isSignal) {
      html += '<label class="fld"><span>Votre nom (déclarant)</span>' + declHtml + '</label>';
    } else {
      /* volet traitement */
      html += '<div style="border-top:1px solid #eef1f2;margin:4px 0 10px;padding-top:10px">' +
        '<label class="fld fCor"><span>Cause identifiée (analyse)</span>' +
        '<textarea id="fCause" placeholder="ex. condensateur HS · flotteur bloqué · encrassement">' + esc(cur.cause || "") + '</textarea></label>' +
        '<label class="fld"><span id="fActLbl">Action réalisée</span>' +
        '<textarea id="fAction" placeholder="ex. remplacement du condensateur · nettoyage capteur · réarmement">' + esc(cur.action || "") + '</textarea></label>' +
        '<label class="fld"><span>Pièces remplacées (le cas échéant)</span>' +
        '<input type="text" id="fPieces" placeholder="ex. condensateur 45 µF · courroie SPZ" value="' + esc(cur.pieces || "") + '"></label>' +
        '<div class="row2">' +
        '<label class="fld"><span>Technicien</span><select id="fTech">' +
        '<option value="">— choisir —</option>' +
        techList().map(function (t) { return '<option value="' + esc(t) + '"' + (cur.tech === t ? " selected" : "") + '>' + esc(t) + '</option>'; }).join("") +
        '<option value="__add">＋ Ajouter un agent…</option>' +
        '</select></label>' +
        '<label class="fld"><span>Durée (h)</span><input type="text" inputmode="decimal" id="fDuree" placeholder="ex. 1.5" value="' + esc(cur.duree || "") + '"></label>' +
        '</div>' +
        '<label class="fld"><span>Statut</span><select id="fStatut">' +
        STATUTS.filter(function (s) { return s.key !== "fait" || cur.type === "prev" || V.mode === "prev"; })
          .map(function (s) { return '<option value="' + s.key + '"' + (cur.statut === s.key ? " selected" : "") + '>' + esc(s.label) + '</option>'; }).join("") +
        '</select></label>' +
        '<div id="fResWrap" style="display:none">' +
        '<div class="row2">' +
        '<label class="fld"><span>Date de résolution</span><input type="date" id="fDateRes" value="' + esc(cur.dateRes || "") + '"></label>' +
        '<label class="fld"><span>Heure</span><input type="time" id="fTimeRes" value="' + esc(cur.heureRes || "") + '"></label>' +
        '</div>' +
        '<label class="fld" style="margin:2px 0 8px"><span style="display:flex;align-items:center;gap:8px;font-size:13px;color:#1a2025">' +
        '<input type="checkbox" id="fCtrl"' + (cur.ctrl ? " checked" : "") + ' style="width:auto;margin:0;transform:scale(1.2)"> ✅ Efficacité vérifiée (bon fonctionnement contrôlé après intervention)</span></label>' +
        '</div>' +
        '<label class="fld"><span>Déclaré par (si différent du technicien)</span>' + declHtml + '</label>' +
        '</div>';
    }

    html += '<label class="fld"><span>Observations</span>' +
      '<textarea id="fObs" placeholder="contexte, recommandations, à surveiller…">' + esc(cur.obs || "") + '</textarea></label>';

    html += '</div>';

    html += '<div class="panel"><h2>📷 Photos AVANT — constat</h2><div class="photos" id="fPhAv"></div></div>' +
      '<div class="panel"><h2>📷 Photos APRÈS — réparation</h2><div class="photos" id="fPhAp"></div></div>';

    html += '<button class="btn primary" id="fSave" style="background:#b3541e">💾 Enregistrer</button>' +
      '<button class="btn sec" id="fCancel" style="margin-top:9px">Annuler</button>';

    $("app").innerHTML = html;
    paintAllStrips("fPh", recId);

    var typeSel = $("fType");
    function syncType() {
      var t = typeSel ? typeSel.value : cur.type;
      document.querySelectorAll(".fCor").forEach(function (el) { el.style.display = (t === "prev") ? "none" : ""; });
      document.querySelectorAll(".fPrev").forEach(function (el) { el.style.display = (t === "prev") ? "" : "none"; });
      if ($("fSymptLbl")) $("fSymptLbl").textContent = (t === "prev") ? "Travaux prévus / constat initial" : "Symptôme / constat";
      if ($("fActLbl")) $("fActLbl").textContent = (t === "prev") ? "Entretien réalisé" : "Action réalisée";
    }
    if (typeSel) typeSel.addEventListener("change", syncType);
    syncType();

    function syncStatut() {
      var sel = $("fStatut"); if (!sel) return;
      var closed = !statutBy(sel.value).open;
      $("fResWrap").style.display = closed ? "" : "none";
      if (closed && $("fDateRes") && !$("fDateRes").value) { $("fDateRes").value = nowDate(); $("fTimeRes").value = nowTime(); }
    }
    if ($("fStatut")) { $("fStatut").addEventListener("change", syncStatut); syncStatut(); }

    if ($("fTech")) $("fTech").addEventListener("change", function () {
      var self = this;
      if (this.value === "__add") {
        sheetInput("Nouvel agent", "Sera proposé à toute l'équipe", "", "Ajouter", function (name) {
          addTech(name);
          var opt = document.createElement("option");
          opt.value = name; opt.textContent = name;
          self.insertBefore(opt, self.querySelector('option[value="__add"]'));
          self.value = name;
        });
        this.value = cur.tech || "";
      }
    });

    if ($("fDecl")) $("fDecl").addEventListener("change", function () {
      var self = this;
      if (this.value === "__add") {
        sheetInput("Votre nom", "Sera proposé à tout le monde pour les prochains signalements", "", "Ajouter", function (name) {
          addStaff(name);
          var opt = document.createElement("option");
          opt.value = name; opt.textContent = name;
          self.insertBefore(opt, self.querySelector('option[value="__add"]'));
          self.value = name;
        });
        this.value = declSel || "";
      }
    });

    var selEquip = { id: cur.equip || null };
    $("fEq").onclick = function () {
      pickEquip(function (eid) {
        selEquip.id = eid;
        var inf = eqInfo(eid);
        $("fEq").innerHTML = "📋 " + esc(inf ? inf.name : eid) +
          '<span class="tiny muted" style="margin-left:6px">' + esc(inf ? (inf.zone + " · " + inf.room) : "") + '</span>';
      });
    };

    $("fSave").onclick = function () {
      if (!selEquip.id) { toast("Choisir l'équipement concerné"); return; }
      var t = typeSel ? typeSel.value : cur.type;
      var statut = isSignal ? "signale" : ($("fStatut") ? $("fStatut").value : cur.statut);
      var rec = {
        type: t,
        statut: statut,
        equip: selEquip.id,
        equipTxt: (eqInfo(selEquip.id) || {}).name || "",
        date: $("fDate").value || nowDate(),
        heure: $("fTime").value || nowTime(),
        nature: $("fNature") ? $("fNature").value : (cur.nature || ""),
        gamme: $("fGamme") ? $("fGamme").value : (cur.gamme || ""),
        sympt: $("fSympt").value.trim(),
        cause: $("fCause") ? $("fCause").value.trim() : (cur.cause || ""),
        action: $("fAction") ? $("fAction").value.trim() : (cur.action || ""),
        pieces: $("fPieces") ? $("fPieces").value.trim() : (cur.pieces || ""),
        arret: $("fArret").checked,
        dateRes: (!statutBy(statut).open && $("fDateRes")) ? $("fDateRes").value : (cur.dateRes || ""),
        heureRes: (!statutBy(statut).open && $("fTimeRes")) ? $("fTimeRes").value : (cur.heureRes || ""),
        ctrl: $("fCtrl") ? $("fCtrl").checked : !!cur.ctrl,
        tech: $("fTech") ? $("fTech").value : (cur.tech || ""),
        decl: ($("fDecl") && $("fDecl").value !== "__add") ? $("fDecl").value : (cur.decl || ""),
        duree: $("fDuree") ? $("fDuree").value.trim() : (cur.duree || ""),
        obs: $("fObs").value,
        regPrev: cur.regPrev
      };
      if (!isSignal && t === "cor" && !rec.nature) { toast("Indiquer la nature de la panne"); return; }
      if (!isSignal && t === "prev" && !rec.gamme) { toast("Indiquer le type d'entretien"); return; }
      if (isSignal && !rec.sympt) { toast("Décrire en une phrase ce qui ne va pas"); return; }
      if (isSignal && !rec.decl) { toast("Indiquer qui signale (votre nom)"); return; }
      rememberDecl(rec.decl);
      if (!isSignal && !statutBy(statut).open && !rec.action) { toast("Décrire l'action réalisée avant de clôturer"); return; }
      var id = V.editId || V.draft || ("it_" + rndId());
      ensureI()[id] = rec;
      touch("inter:" + id);
      applyEquipImpact(id);
      V.draft = null;
      V.screen = "detail"; V.id = id; V.editId = null; V.mode = null;
      render();
      toast(isSignal ? "🚨 Panne signalée — l'équipe est prévenue à la prochaine synchro" : "Fiche enregistrée");
    };
    $("fCancel").onclick = function () { back(); };
  }

  /* -------------------- EXPORT xlsx : registre + indicateurs -------------------- */
  function exportRegistre() {
    var rows = allInter();
    if (!rows.length) { toast("Aucune intervention à exporter"); return; }
    var wb = XLSX.utils.book_new();

    /* --- Feuille 1 : registre chronologique --- */
    var aoa = [
      ["REGISTRE DE MAINTENANCE — HÔTEL WADRA BAY"],
      ["Traçabilité des interventions · analyse des causes · vérification de l'efficacité · amélioration continue (PDCA)"],
      ["Généré le", nowDate() + " " + nowTime(), "", "Interventions", rows.length,
        "dont en cours", rows.filter(isOpen).length], [],
      ["N°", "Type", "Statut", "Équipement", "Zone / TD", "Pièce", "Date constat", "Heure",
        "Nature", "Symptôme / constat", "Cause identifiée", "Action réalisée", "Pièces remplacées",
        "À l'arrêt", "Date résolution", "Heure", "Immobilisation (j)", "Efficacité vérifiée",
        "Technicien", "Déclarant", "Durée interv. (h)", "Photos avant", "Photos après", "Observations"]
    ];
    rows.forEach(function (r, i) {
      var inf = eqInfo(r.equip);
      aoa.push([i + 1, r.type === "prev" ? "Préventif" : "Correctif", statutBy(r.statut).label,
        eqLabel(r), inf ? inf.zone : "", inf ? inf.room : "",
        r.date, r.heure || "", natLabel(r),
        (r.sympt || "").replace(/\s+/g, " "), (r.cause || "").replace(/\s+/g, " "),
        (r.action || "").replace(/\s+/g, " "), r.pieces || "",
        r.arret ? "OUI" : "", r.dateRes || "", r.heureRes || "", immoJours(r),
        statutBy(r.statut).open ? "" : (r.ctrl ? "OUI" : "NON"),
        r.tech || "", r.decl || "",
        num(r.duree),
        photosFor(r._id).filter(function (p) { return !p.plate; }).length || "",
        photosFor(r._id).filter(function (p) { return !!p.plate; }).length || "",
        (r.obs || "").replace(/\s+/g, " ")]);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = aoa[4].map(function (h, i) {
      return { wch: (i === 3 || i === 9 || i === 10 || i === 11 || i === 23) ? 34 : Math.max(9, String(h).length + 2) };
    });
    XLSX.utils.book_append_sheet(wb, ws, "Registre");

    /* --- Feuille 2 : par équipement --- */
    var byEq = {};
    rows.forEach(function (r) {
      var k = r.equip || ("txt:" + (r.equipTxt || "?"));
      byEq[k] = byEq[k] || { rows: [] };
      byEq[k].rows.push(r);
    });
    var dataEq = [];
    Object.keys(byEq).forEach(function (k) {
      var g = byEq[k].rows;
      var eqId = g[0].equip;
      var inf = eqInfo(eqId);
      var nCor = g.filter(function (r) { return r.type !== "prev"; }).length;
      var immo = 0;
      g.forEach(function (r) { var j = immoJours(r); if (j != null) immo += j; });
      var hl = eqId ? health(eqId) : null;
      var last = g[g.length - 1];
      dataEq.push([eqLabel(g[0]), inf ? inf.zone : "", inf ? inf.room : "",
        hl ? healthLabel(hl) : "", g.length, nCor,
        g.length - nCor, g.filter(isOpen).length, Math.round(immo * 10) / 10,
        frDate(last.date) + " · " + natLabel(last), nCor >= 3 ? "OUI ⚠" : ""]);
    });
    dataEq.sort(function (a, b) { return b[5] - a[5]; });
    var aoa2 = [["SYNTHÈSE PAR ÉQUIPEMENT — récidives & immobilisation"], [],
      ["Équipement", "Zone / TD", "Pièce", "État actuel", "Nb interventions", "Nb pannes (correctif)",
        "Nb préventif", "En cours", "Immobilisation cumulée (j)", "Dernière intervention", "Récidiviste (≥3 pannes)"]].concat(dataEq);
    var ws2 = XLSX.utils.aoa_to_sheet(aoa2);
    ws2["!cols"] = [{ wch: 34 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 9 }, { wch: 12 }, { wch: 28 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Par équipement");

    /* --- Feuille 3 : indicateurs --- */
    var closed = rows.filter(function (r) { return !isOpen(r); });
    var delais = [];
    closed.forEach(function (r) {
      if (!r.dateRes) return;
      var t0 = Date.parse(r.date + "T" + (r.heure || "00:00") + ":00");
      var t1 = Date.parse(r.dateRes + "T" + (r.heureRes || "12:00") + ":00");
      if (!isNaN(t0) && !isNaN(t1) && t1 >= t0) delais.push((t1 - t0) / 86400000);
    });
    var dMoy = delais.length ? Math.round(delais.reduce(function (s, x) { return s + x; }, 0) / delais.length * 10) / 10 : null;
    var natCount = {};
    rows.filter(function (r) { return r.type !== "prev"; }).forEach(function (r) {
      var l = natLabel(r); natCount[l] = (natCount[l] || 0) + 1;
    });
    var natTop = Object.keys(natCount).map(function (k) { return [k, natCount[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
    var nCtrl = closed.filter(function (r) { return r.ctrl; }).length;
    var aoa3 = [
      ["INDICATEURS MAINTENANCE — suivi & amélioration continue"], [],
      ["Période couverte", rows.length ? (frDate(rows[0].date) + " → " + frDate(rows[rows.length - 1].date)) : "—"],
      ["Interventions totales", rows.length, "", "dont correctif", rows.filter(function (r) { return r.type !== "prev"; }).length, "dont préventif", rows.filter(function (r) { return r.type === "prev"; }).length],
      ["Clôturées", closed.length, "", "Taux de clôture", rows.length ? Math.round(closed.length / rows.length * 100) + " %" : "—"],
      ["Délai moyen de résolution (jours)", dMoy != null ? dMoy : "—", "", "sur", delais.length + " fiches datées"],
      ["Efficacité vérifiée après intervention", closed.length ? (nCtrl + " / " + closed.length + " (" + Math.round(nCtrl / closed.length * 100) + " %)") : "—"],
      ["En attente (pièce / devis / prestataire)", rows.filter(function (r) { return r.statut === "attente"; }).length], [],
      ["TOP NATURES DE PANNE (correctif)"]
    ];
    natTop.slice(0, 8).forEach(function (t) { aoa3.push([t[0], t[1]]); });
    aoa3.push([]);
    aoa3.push(["ÉQUIPEMENTS À SURVEILLER (récidive ≥ 3 pannes) — candidats au plan d'actions énergie"]);
    Object.keys(byEq).forEach(function (k) {
      var g = byEq[k].rows;
      var nCor = g.filter(function (r) { return r.type !== "prev"; }).length;
      if (nCor >= 3) aoa3.push([eqLabel(g[0]), nCor + " pannes"]);
    });
    aoa3.push([]);
    aoa3.push(["Rappel PDCA : revue périodique du registre → analyse des récidives → actions correctives → vérification de l'efficacité. Un équipement qui dysfonctionne consomme souvent mal : croiser avec la campagne de mesures."]);
    var ws3 = XLSX.utils.aoa_to_sheet(aoa3);
    ws3["!cols"] = [{ wch: 44 }, { wch: 14 }, { wch: 4 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Indicateurs");

    XLSX.writeFile(wb, "WADRA_Bay_Registre_Maintenance_" + nowDate() + ".xlsx");
    toast("Registre maintenance téléchargé (" + rows.length + " interventions)");
  }

  /* -------------------- rendu principal -------------------- */
  function render() {
    ensureI();
    window.scrollTo(0, 0);
    if (V.screen === "form") renderForm();
    else if (V.screen === "detail") renderDetail();
    else renderDash();
  }

  /* -------------------- API -------------------- */
  window.MAINT = {
    render: render,
    back: back,
    count: function () { return allInter().length; },
    openCount: function () { return openRows().length; },
    stopCount: function () {
      var s = {}; openRows().forEach(function (r) { if (r.arret && r.equip) s[r.equip] = 1; });
      return Object.keys(s).length;
    },
    lastLabel: function () {
      var rs = allInter();
      if (!rs.length) return null;
      var r = rs[rs.length - 1];
      return eqLabel(r) + " · " + frDate(r.date);
    },
    health: health,
    healthLabel: healthLabel,
    healthColor: healthColor,
    forEquip: forEquip,
    natLabel: natLabel,
    statutInfo: function (r) { return statutBy(r.statut); },
    frDate: frDate,
    isOpen: isOpen,
    openForEquip: function (eqId) {
      V.screen = "form"; V.editId = null; V.mode = "cor"; V.preEquip = eqId;
      V.draft = "it_" + rndId();
      nav("maint");
    },
    openDetail: function (id) { V.screen = "detail"; V.id = id; nav("maint"); },
    photoAdded: function (key) {
      if (view.name !== "maint") return;
      if (V.screen === "form" && key === (V.editId || V.draft)) paintAllStrips("fPh", key);
      else if (V.screen === "detail" && key === V.id) paintAllStrips("iPh", key);
    }
  };
})();
