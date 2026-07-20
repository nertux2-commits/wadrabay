/* =====================================================================
   WADRA Bay — Module CAMPAGNE DE MESURES (pince ampèremétrique)
   ---------------------------------------------------------------------
   Greffé sur l'appli existante SANS rien modifier de l'inventaire.
   - Saisie rapide des snapshots pince (Kyoritsu 2056R) par point de
     mesure : 10 départs TGBT + arrivée + sous-comptages + témoins.
   - Date/heure pré-remplies automatiquement, modifiables.
   - Créneau horaire déduit de l'heure (modifiable) → base de
     l'« audit réconcilié » (profil journalier, talon, semaine/WE).
   - Stockage local (state.mesures) + synchro Supabase (type "mesure",
     voir sync.js) : plusieurs opérateurs peuvent saisir en parallèle.
   - Export xlsx brut + export xlsx « Traitement audit » calculé sur
     place (synthèse par départ, profil, talon, contrôles).
   Dépend des globales de index.html : state, $, esc, toast, touch,
   nav, view, fmtNum, rndId, TREE, rebuildTree, equipEnergy, roomUnits,
   openSheet, closeSheet, sheetConfirm, sheetActions, sheetInput, XLSX.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------- points de mesure -------------------- */
  var GRP_TGBT = "TGBT — tournée des départs";
  var GRP_SOUS = "Sous-comptages";
  var GRP_TEM  = "Logements témoins";
  var GRP_AUTRE = "Autres points";

  var POINTS_BASE = [
    {code:"ARR",        label:"Arrivée générale TGBT",                                grp:GRP_TGBT, zone:"z_tgbt",    reseau:"tri",  ord:1},
    {code:"TG-SG",      label:"Départ TG-SG — Services généraux (Bât. I)",            grp:GRP_TGBT, zone:"z_sg",      reseau:"tri",  ord:2},
    {code:"TD-LT1",     label:"Départ TD-LT1 — Bungalows lagune / villas",            grp:GRP_TGBT, zone:"z_lt1",     reseau:"tri",  ord:3},
    {code:"TD-LT4",     label:"Départ TD-LT4 — Chambres N/O + forêt",                 grp:GRP_TGBT, zone:"z_lt4",     reseau:"tri",  ord:4},
    {code:"TG-C",       label:"Départ TG-C — Cœur du site (cuisine, resto, piscine)", grp:GRP_TGBT, zone:"z_c",       reseau:"tri",  ord:5},
    {code:"TD-LT7",     label:"Départ TD-LT7 — Logements personnel + DI/AEP",         grp:GRP_TGBT, zone:"z_lt7",     reseau:"tri",  ord:6},
    {code:"TD-SP",      label:"Départ TD-SP — Salle polyvalente + lagunarium",        grp:GRP_TGBT, zone:"z_sp",      reseau:"tri",  ord:7},
    {code:"TD-LT6",     label:"Départ TD-LT6 — Bungalows lagune (suite)",             grp:GRP_TGBT, zone:"z_lt6",     reseau:"tri",  ord:8},
    {code:"TD-ATELIER", label:"Départ TD-ATELIER — Atelier maintenance",              grp:GRP_TGBT, zone:"z_atelier", reseau:"tri",  ord:9},
    {code:"STEP",       label:"Départ STEP — Station d'épuration",                    grp:GRP_TGBT, zone:"z_step",    reseau:"tri",  ord:10},
    {code:"POMPERIE",   label:"Départ POMPERIE (usage réel à noter en obs.)",         grp:GRP_TGBT, zone:"z_pomperie",reseau:"tri",  ord:11},
    {code:"TD-CUISINE",    label:"Tête TD-Cuisine (sous TG-C)",                       grp:GRP_SOUS, zone:null, reseau:"tri",  ord:20},
    {code:"LT-PISCINE",    label:"Tête LT-Piscine (sous TG-C)",                       grp:GRP_SOUS, zone:null, reseau:"tri",  ord:21},
    {code:"LT-LAGUNARIUM", label:"Tête LT-Lagunarium (sous TD-SP) — talon eau de mer",grp:GRP_SOUS, zone:null, reseau:"tri",  ord:22},
    {code:"TEM-LAGUNE",  label:"Témoin bungalow lagune (préciser K… en obs.)",        grp:GRP_TEM,  zone:null, reseau:"mono", ord:30},
    {code:"TEM-CHAMBRE", label:"Témoin chambre bât. O (préciser n° en obs.)",         grp:GRP_TEM,  zone:null, reseau:"mono", ord:31},
    {code:"TEM-PLAGE",   label:"Témoin villa plage (préciser M… en obs.)",            grp:GRP_TEM,  zone:null, reseau:"mono", ord:32},
    {code:"TEM-FORET",   label:"Témoin bungalow forêt (préciser L… en obs.)",         grp:GRP_TEM,  zone:null, reseau:"mono", ord:33}
  ];

  /* -------------------- créneaux horaires (audit réconcilié) -------------------- */
  var CRENEAUX = [
    {key:"talon", label:"00h-05h · Talon nuit",  h0:0,  h1:5,  hrs:5},
    {key:"dem",   label:"05h-07h · Démarrage",   h0:5,  h1:7,  hrs:2},
    {key:"mat",   label:"07h-09h · Matin",       h0:7,  h1:9,  hrs:2},
    {key:"jour",  label:"09h-12h · Matinée",     h0:9,  h1:12, hrs:3},
    {key:"midi",  label:"12h-14h · Midi",        h0:12, h1:14, hrs:2},
    {key:"am",    label:"14h-18h · Après-midi",  h0:14, h1:18, hrs:4},
    {key:"soir",  label:"18h-21h · Soirée",      h0:18, h1:21, hrs:3},
    {key:"nuit",  label:"21h-24h · Nuit",        h0:21, h1:24, hrs:3}
  ];
  var TALON_EEC_KW = 49;   // talon nuit moyen — courbe de charge EEC (réf.)

  function creneauFromTime(hhmm) {
    var h = parseInt(String(hhmm || "").slice(0, 2), 10);
    if (isNaN(h)) return "";
    for (var i = 0; i < CRENEAUX.length; i++) {
      if (h >= CRENEAUX[i].h0 && h < CRENEAUX[i].h1) return CRENEAUX[i].key;
    }
    return "talon";
  }
  function creneauLabel(key) {
    var c = CRENEAUX.filter(function (x) { return x.key === key; })[0];
    return c ? c.label : (key || "—");
  }

  /* -------------------- accès aux données -------------------- */
  function ensureM() { state.mesures = state.mesures || {}; return state.mesures; }
  function customPoints() {
    var cfg = ensureM()["_points"];
    return (cfg && cfg.list && cfg.list.length) ? cfg.list : [];
  }
  function allPoints() {
    var l = POINTS_BASE.slice();
    customPoints().forEach(function (p) { l.push(p); });
    l.sort(function (a, b) { return (a.ord || 99) - (b.ord || 99); });
    return l;
  }
  function pointBy(code) {
    return allPoints().filter(function (p) { return p.code === code; })[0] || null;
  }
  function allRows() {
    var M = ensureM(), out = [];
    for (var k in M) {
      if (!M.hasOwnProperty(k) || k === "_points") continue;
      var r = M[k];
      if (r && r.point) out.push(Object.assign({ _id: k }, r));
    }
    out.sort(function (a, b) {
      return (a.date + " " + a.heure) < (b.date + " " + b.heure) ? -1 : 1;
    });
    return out;
  }
  function rowsOf(code) { return allRows().filter(function (r) { return r.point === code; }); }
  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isNaN(n) ? null : n; }

  /* puissance d'un enregistrement (kW) */
  function pOf(r) {
    var cos = num(r.cosphi); if (cos == null) cos = 0.99;
    var u = num(r.u);
    if (r.reseau === "mono") {
      if (u == null) u = 230;
      var i = num(r.i1); if (i == null) return null;
      return u * i * cos / 1000;
    }
    if (u == null) u = 400;
    var is = [num(r.i1), num(r.i2), num(r.i3)].filter(function (x) { return x != null; });
    if (!is.length) return null;
    var im = is.reduce(function (s, x) { return s + x; }, 0) / is.length;
    return 1.732 * u * im * cos / 1000;
  }
  function desOf(r) { /* déséquilibre % entre phases */
    if (r.reseau === "mono") return null;
    var is = [num(r.i1), num(r.i2), num(r.i3)].filter(function (x) { return x != null; });
    if (is.length < 2) return null;
    var mx = Math.max.apply(null, is), mn = Math.min.apply(null, is);
    return mx > 0 ? Math.round((mx - mn) / mx * 100) : 0;
  }
  function isWE(dateStr) { var d = new Date(dateStr + "T12:00:00"); var g = d.getDay(); return g === 0 || g === 6; }
  function fmtP(p) { return p == null ? "—" : (fmtNum(p, p < 10 ? 2 : 1) + " kW"); }
  function nowDate() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function nowTime() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }

  /* P installée inventaire par zone (réconciliation) */
  function pInstZone(zoneId) {
    if (!zoneId) return null;
    try {
      rebuildTree();
      var z = TREE.filter(function (x) { return x.id === zoneId; })[0];
      if (!z) return null;
      var p = 0, kwh = 0;
      z.rooms.forEach(function (r) {
        var u = roomUnits(r.id);
        r.equipment.forEach(function (e) {
          var ee = equipEnergy(e);
          p += ee.pInst * u;
          if (ee.kwhYear != null) kwh += ee.kwhYear * u;
        });
      });
      return { p: p, kwh: kwh };
    } catch (e) { return null; }
  }

  /* -------------------- état interne du module -------------------- */
  var V = { screen: "dash", point: null, editId: null, tour: -1 };

  function back() {
    if (V.screen !== "dash") { V.screen = "dash"; V.editId = null; V.tour = -1; render(); return true; }
    return false;
  }

  /* -------------------- RENDU : tableau de bord -------------------- */
  function renderDash() {
    var rows = allRows();
    var pts = allPoints();
    var covered = {};
    rows.forEach(function (r) { covered[r.point] = 1; });
    var last = rows.length ? rows[rows.length - 1] : null;

    var html = "";
    /* bandeau campagne */
    html += '<div style="border-radius:16px;overflow:hidden;margin-bottom:12px;padding:16px;color:#fff;' +
      'background:linear-gradient(135deg,#155e9c,#0d3f6b 60%,#092c4c);box-shadow:0 2px 10px rgba(20,30,40,.18)">' +
      '<div style="font-size:19px;font-weight:800">📈 Campagne de mesures à la pince</div>' +
      '<div style="font-size:12.5px;opacity:.92;margin-top:3px">Plan de mesurage ISO 50001 §6.6 · Kyoritsu 2056R · 20 → 26 juillet 2026 · réf. talon EEC ≈ ' + TALON_EEC_KW + ' kW</div>' +
      '<div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + rows.length + '</div><div style="font-size:11px;opacity:.9">mesures saisies</div></div>' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + Object.keys(covered).length + '/' + pts.length + '</div><div style="font-size:11px;opacity:.9">points couverts</div></div>' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:15px;font-weight:800;line-height:1.35">' + (last ? esc(last.point) + "<br>" + esc(last.heure) : "—") + '</div><div style="font-size:11px;opacity:.9">dernière mesure</div></div>' +
      '</div></div>';

    html += '<button class="btn primary" id="mNew" style="background:#155e9c">➕ Nouvelle mesure</button>' +
      '<button class="btn primary" id="mTour" style="background:#0d7a6f;margin-top:9px">🔄 Tournée TGBT guidée (arrivée + 10 départs)</button>';

    html += '<div class="panel" style="margin-top:12px"><h2>Exports</h2>' +
      '<button class="btn sec" id="mExpBrut">⬇️ Export brut des saisies (xlsx)</button>' +
      '<button class="btn sec" id="mExpAudit" style="margin-top:9px">📊 Export traitement « Audit réconcilié » (xlsx)</button>' +
      '<div class="tiny muted" style="margin-top:7px">Le traitement calcule automatiquement : P par départ et par créneau, profil journalier, talon vs EEC, foisonnement vs inventaire, contrôles de cohérence.</div></div>';

    /* liste des points par groupe */
    var grps = [];
    pts.forEach(function (p) { if (grps.indexOf(p.grp) < 0) grps.push(p.grp); });
    grps.forEach(function (g) {
      html += '<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#6b7785;margin:14px 2px 9px;font-weight:700">' + esc(g) + '</h2>';
      pts.filter(function (p) { return p.grp === g; }).forEach(function (p) {
        var rs = rowsOf(p.code);
        var lastR = rs.length ? rs[rs.length - 1] : null;
        var lastP = lastR ? pOf(lastR) : null;
        html += '<div class="row-item" data-mp="' + esc(p.code) + '">' +
          '<div class="row-icon" style="background:#155e9c;font-size:11px">' + esc(p.code.slice(0, 4)) + '</div>' +
          '<div class="row-body"><div class="row-title">' + esc(p.code) + (rs.length ? ' <span style="color:#155e9c;font-weight:800">· ' + rs.length + '</span>' : '') + '</div>' +
          '<div class="row-desc">' + esc(p.label) + (lastR ? (' — dern. : ' + fmtP(lastP) + ' (' + esc(lastR.heure) + ')') : ' — aucune mesure') + '</div></div>' +
          '<div class="row-chev">›</div></div>';
      });
    });

    html += '<button class="btn sec" id="mAddPt" style="margin-top:9px">＋ Ajouter un point de mesure</button>';

    $("app").innerHTML = html;
    $("mNew").onclick = function () { openForm(null, null); };
    $("mTour").onclick = startTour;
    $("mExpBrut").onclick = exportBrut;
    $("mExpAudit").onclick = exportAudit;
    $("mAddPt").onclick = addPointSheet;
    document.querySelectorAll(".row-item[data-mp]").forEach(function (el) {
      el.onclick = function () { V.screen = "point"; V.point = el.dataset.mp; render(); };
    });
  }

  /* -------------------- RENDU : détail d'un point -------------------- */
  function renderPoint() {
    var p = pointBy(V.point);
    if (!p) { V.screen = "dash"; return renderDash(); }
    var rs = rowsOf(p.code).slice().reverse();
    var html = '<div class="panel"><h2>' + esc(p.grp) + '</h2>' +
      '<div style="font-weight:700;font-size:16px">' + esc(p.code) + '</div>' +
      '<div class="small muted">' + esc(p.label) + '</div>' +
      '<div class="tiny muted" style="margin-top:4px">' + (p.reseau === "mono" ? "Monophasé 230 V" : "Triphasé 400 V") + ' · ' + rs.length + ' mesure(s)</div></div>';
    html += '<button class="btn primary" id="mNewHere" style="background:#155e9c">➕ Mesure sur ce point</button>';
    html += '<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#6b7785;margin:14px 2px 9px;font-weight:700">Historique</h2>';
    if (!rs.length) html += '<div class="panel tiny muted">Aucune mesure pour l\'instant.</div>';
    rs.forEach(function (r) {
      var pw = pOf(r), dz = desOf(r);
      html += '<div class="row-item" data-mid="' + esc(r._id) + '">' +
        '<div class="row-icon" style="background:#155e9c">⚡</div>' +
        '<div class="row-body"><div class="row-title">' + fmtP(pw) + (r.mf ? ' <span style="color:#e0892a;font-weight:800">MF</span>' : '') + '</div>' +
        '<div class="row-desc">' + esc(r.date) + " " + esc(r.heure) + " · " + esc(creneauLabel(r.creneau)) +
        (r.reseau === "mono" ? (" · I " + esc(r.i1 || "—") + " A") : (" · I " + esc(r.i1 || "—") + "/" + esc(r.i2 || "—") + "/" + esc(r.i3 || "—") + " A" + (dz != null && dz >= 20 ? " · ⚠ déséq. " + dz + "%" : ""))) +
        '</div></div><div class="row-chev">›</div></div>';
    });
    $("app").innerHTML = html;
    $("mNewHere").onclick = function () { openForm(p.code, null); };
    document.querySelectorAll(".row-item[data-mid]").forEach(function (el) {
      el.onclick = function () { openForm(null, el.dataset.mid); };
    });
  }

  /* -------------------- RENDU : formulaire de saisie -------------------- */
  function openForm(pointCode, editId) {
    V.screen = "form";
    V.editId = editId || null;
    V.point = pointCode || V.point;
    render();
  }

  function renderForm() {
    var edit = V.editId ? ensureM()[V.editId] : null;
    var pts = allPoints();
    var cur = edit ? edit : {
      point: V.point || (pts[0] && pts[0].code),
      date: nowDate(), heure: nowTime(),
      creneau: creneauFromTime(nowTime()),
      reseau: null, u: "", cosphi: "0.99",
      i1: "", i2: "", i3: "", mf: false, obs: ""
    };
    var pdef = pointBy(cur.point) || {};
    var reseau = cur.reseau || pdef.reseau || "tri";
    var uDef = reseau === "mono" ? "230" : "400";
    var inTour = V.tour >= 0;
    var tourPts = pts.filter(function (p) { return p.grp === GRP_TGBT; });

    var html = '<div class="panel">' +
      '<h2>' + (edit ? "Modifier la mesure" : (inTour ? ("Tournée TGBT — point " + (V.tour + 1) + "/" + tourPts.length) : "Nouvelle mesure")) + '</h2>' +
      '<label class="fld"><span>Point de mesure</span><select id="mPt">' +
      pts.map(function (p) { return '<option value="' + esc(p.code) + '"' + (p.code === cur.point ? " selected" : "") + '>' + esc(p.code + " — " + p.label) + '</option>'; }).join("") +
      '</select></label>' +
      '<div class="row2">' +
      '<label class="fld"><span>Date (auto, modifiable)</span><input type="date" id="mDate" value="' + esc(cur.date || nowDate()) + '"></label>' +
      '<label class="fld"><span>Heure (auto, modifiable)</span><input type="time" id="mTime" value="' + esc(cur.heure || nowTime()) + '"></label>' +
      '</div>' +
      '<label class="fld"><span>Créneau (déduit de l\'heure, modifiable)</span><select id="mCren">' +
      CRENEAUX.map(function (c) { return '<option value="' + c.key + '"' + (c.key === cur.creneau ? " selected" : "") + '>' + esc(c.label) + '</option>'; }).join("") +
      '</select></label>' +
      '</div>';

    html += '<div class="panel"><h2>Mesure pince</h2>' +
      '<label class="fld"><span>Réseau</span><select id="mRes">' +
      '<option value="tri"' + (reseau === "tri" ? " selected" : "") + '>Triphasé 400 V (3 phases)</option>' +
      '<option value="mono"' + (reseau === "mono" ? " selected" : "") + '>Monophasé 230 V</option>' +
      '</select></label>' +
      '<div class="row2" id="mIrow">' +
      '<label class="fld"><span>I L1 (A)</span><input type="text" inputmode="decimal" id="mI1" placeholder="A" value="' + esc(cur.i1 || "") + '"></label>' +
      '<label class="fld mTriOnly"><span>I L2 (A)</span><input type="text" inputmode="decimal" id="mI2" placeholder="A" value="' + esc(cur.i2 || "") + '"></label>' +
      '<label class="fld mTriOnly"><span>I L3 (A)</span><input type="text" inputmode="decimal" id="mI3" placeholder="A" value="' + esc(cur.i3 || "") + '"></label>' +
      '</div>' +
      '<div class="row2">' +
      '<label class="fld"><span>U (V)</span><input type="text" inputmode="decimal" id="mU" placeholder="' + uDef + '" value="' + esc(cur.u || "") + '"></label>' +
      '<label class="fld"><span>cos φ</span><input type="text" inputmode="decimal" id="mCos" value="' + esc(cur.cosphi || "0.99") + '"></label>' +
      '</div>' +
      '<div class="consigne" id="mCalc">P ≈ —</div>' +
      '<label class="fld" style="margin:8px 0 4px"><span style="display:flex;align-items:center;gap:8px;font-size:13px;color:#1a2025">' +
      '<input type="checkbox" id="mMF"' + (cur.mf ? " checked" : "") + ' style="width:auto;margin:0;transform:scale(1.2)"> Marche forcée (témoin / essai)</span></label>' +
      '<label class="fld"><span>Observations (ce qui tourne, n° logement, météo…)</span>' +
      '<textarea id="mObs" placeholder="ex. lessive en cours · K11 clim 24°C forcée · pluie">' + esc(cur.obs || "") + '</textarea></label>' +
      '</div>';

    html += '<button class="btn primary" id="mSave" style="background:#155e9c">💾 Enregistrer</button>';
    if (inTour) html += '<button class="btn primary" id="mSaveNext" style="background:#0d7a6f;margin-top:9px">💾 Enregistrer → point suivant</button>';
    html += '<button class="btn sec" id="mCancel" style="margin-top:9px">Annuler</button>';
    if (edit) html += '<button class="btn sec" id="mDel" style="margin-top:9px;color:#c0392b;border-color:#e7b3ab">🗑 Supprimer cette mesure</button>';

    $("app").innerHTML = html;

    var updCalc = function () {
      var r = readForm();
      var pw = pOf(r), dz = desOf(r);
      $("mCalc").innerHTML = "P ≈ <b>" + fmtP(pw) + "</b>" +
        (r.reseau === "tri" && pw != null ? " · S ≈ " + fmtNum(pw / (num(r.cosphi) || 0.99), 1) + " kVA" : "") +
        (dz != null && dz >= 20 ? ' · <span style="color:#c0392b;font-weight:700">déséquilibre ' + dz + "%</span>" : "");
      var mono = $("mRes").value === "mono";
      document.querySelectorAll(".mTriOnly").forEach(function (el) { el.style.display = mono ? "none" : ""; });
      if (!$("mU").value) $("mU").placeholder = mono ? "230" : "400";
    };
    function readForm() {
      return {
        point: $("mPt").value,
        date: $("mDate").value || nowDate(),
        heure: $("mTime").value || nowTime(),
        creneau: $("mCren").value,
        reseau: $("mRes").value,
        i1: $("mI1").value.trim(), i2: $("mI2").value.trim(), i3: $("mI3").value.trim(),
        u: $("mU").value.trim() || ($("mRes").value === "mono" ? "230" : "400"),
        cosphi: $("mCos").value.trim() || "0.99",
        mf: $("mMF").checked,
        obs: $("mObs").value,
        op: (state.meta && state.meta.auditeur) || ""
      };
    }
    ["mI1", "mI2", "mI3", "mU", "mCos"].forEach(function (id) { $(id).addEventListener("input", updCalc); });
    $("mRes").addEventListener("change", updCalc);
    $("mTime").addEventListener("change", function () { $("mCren").value = creneauFromTime(this.value); });
    $("mPt").addEventListener("change", function () {
      var pd = pointBy(this.value) || {};
      $("mRes").value = pd.reseau || "tri";
      updCalc();
    });
    updCalc();

    var save = function () {
      var r = readForm();
      if (!r.point) { toast("Choisir un point"); return null; }
      if (num(r.i1) == null && num(r.i2) == null && num(r.i3) == null) { toast("Saisir au moins un courant (A)"); return null; }
      var id = V.editId || ("m_" + rndId());
      ensureM()[id] = r;
      touch("mesure:" + id);
      toast("Mesure enregistrée — " + r.point + " · " + fmtP(pOf(r)));
      return id;
    };
    $("mSave").onclick = function () {
      if (save() == null) return;
      if (V.tour >= 0) { V.tour = -1; }
      V.editId = null; V.screen = V.point ? "point" : "dash"; V.point = $("mPt").value;
      V.screen = "point"; render();
    };
    if ($("mSaveNext")) $("mSaveNext").onclick = function () {
      if (save() == null) return;
      var tourPts = allPoints().filter(function (p) { return p.grp === GRP_TGBT; });
      V.tour++;
      if (V.tour >= tourPts.length) {
        V.tour = -1; V.editId = null; V.screen = "dash";
        toast("🔄 Tournée TGBT terminée !");
        render(); return;
      }
      V.editId = null; V.point = tourPts[V.tour].code;
      render();
    };
    $("mCancel").onclick = function () { V.editId = null; V.tour = -1; V.screen = V.point ? "point" : "dash"; render(); };
    if ($("mDel")) $("mDel").onclick = function () {
      sheetConfirm("Supprimer cette mesure ?", "", "Supprimer", true, function () {
        var id = V.editId;
        delete ensureM()[id];
        touch("mesure:" + id);
        V.editId = null; V.screen = "point"; render();
        toast("Mesure supprimée");
      });
    };
  }

  function startTour() {
    var tourPts = allPoints().filter(function (p) { return p.grp === GRP_TGBT; });
    V.tour = 0; V.editId = null; V.point = tourPts[0].code;
    V.screen = "form"; render();
    toast("Tournée : mesurer chaque départ dans l'ordre, toujours le même");
  }

  /* -------------------- point personnalisé -------------------- */
  function addPointSheet() {
    openSheet('<h3>Nouveau point de mesure</h3>' +
      '<div class="sub">Ex. sous-comptage supplémentaire, essai ponctuel…</div>' +
      '<input id="npCode" type="text" placeholder="Code court (ex. TD-FARE)" style="text-transform:uppercase">' +
      '<input id="npLbl" type="text" placeholder="Libellé">' +
      '<div class="sbtns"><button class="sbtn-cancel" id="npCancel">Annuler</button><button class="sbtn-ok" id="npOk">Ajouter</button></div>');
    $("npCancel").onclick = closeSheet;
    $("npOk").onclick = function () {
      var code = ($("npCode").value || "").trim().toUpperCase();
      var lbl = ($("npLbl").value || "").trim();
      if (!code) { $("npCode").focus(); return; }
      if (pointBy(code)) { toast("Ce code existe déjà"); return; }
      var M = ensureM();
      var cfg = M["_points"] || { list: [] };
      cfg.list = cfg.list || [];
      cfg.list.push({ code: code, label: lbl || code, grp: GRP_AUTRE, zone: null, reseau: "tri", ord: 90 + cfg.list.length });
      M["_points"] = cfg;
      touch("mesure:_points");
      closeSheet(); render();
      toast("Point ajouté : " + code);
    };
  }

  /* -------------------- EXPORT 1 : brut -------------------- */
  function rowsForExport() {
    return allRows().map(function (r) {
      var pw = pOf(r), dz = desOf(r);
      var cos = num(r.cosphi) || 0.99;
      return {
        r: r, p: pw, dz: dz,
        s: (pw != null ? pw / cos : null),
        we: isWE(r.date)
      };
    });
  }
  function exportBrut() {
    var data = rowsForExport();
    if (!data.length) { toast("Aucune mesure à exporter"); return; }
    var aoa = [["Date", "Heure", "Jour", "Sem/WE", "Créneau", "Point", "Libellé", "Réseau",
      "I L1 (A)", "I L2 (A)", "I L3 (A)", "I moy (A)", "Déséq. (%)", "U (V)", "cos φ",
      "P (kW)", "S (kVA)", "Marche forcée", "Opérateur", "Observations"]];
    var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    data.forEach(function (d) {
      var r = d.r;
      var is = [num(r.i1), num(r.i2), num(r.i3)].filter(function (x) { return x != null; });
      var im = is.length ? is.reduce(function (s, x) { return s + x; }, 0) / is.length : null;
      var pd = pointBy(r.point) || {};
      aoa.push([r.date, r.heure, JOURS[new Date(r.date + "T12:00:00").getDay()], d.we ? "WE" : "semaine",
        creneauLabel(r.creneau), r.point, pd.label || "", r.reseau === "mono" ? "mono 230V" : "tri 400V",
        num(r.i1), num(r.i2), num(r.i3), im != null ? Math.round(im * 10) / 10 : null, d.dz,
        num(r.u), num(r.cosphi), d.p != null ? Math.round(d.p * 100) / 100 : null,
        d.s != null ? Math.round(d.s * 100) / 100 : null,
        r.mf ? "OUI" : "", r.op || "", (r.obs || "").replace(/\s+/g, " ").trim()]);
    });
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = aoa[0].map(function (h, i) { return { wch: i === 6 || i === 19 ? 40 : Math.max(9, String(h).length + 2) }; });
    XLSX.utils.book_append_sheet(wb, ws, "Mesures");
    XLSX.writeFile(wb, "WADRA_Bay_Mesures_Pince_BRUT_" + nowDate() + ".xlsx");
    toast("Export brut téléchargé (" + data.length + " mesures)");
  }

  /* -------------------- EXPORT 2 : traitement « audit réconcilié » -------------------- */
  function avg(arr) { return arr.length ? arr.reduce(function (s, x) { return s + x; }, 0) / arr.length : null; }
  function rnd(x, d) { return x == null ? null : Math.round(x * Math.pow(10, d)) / Math.pow(10, d); }

  function exportAudit() {
    var data = rowsForExport().filter(function (d) { return d.p != null && !d.r.mf; });
    var dataMF = rowsForExport().filter(function (d) { return d.p != null && d.r.mf; });
    if (!data.length && !dataMF.length) { toast("Aucune mesure exploitable"); return; }
    var pts = allPoints();
    var wb = XLSX.utils.book_new();

    /* --- Feuille 0 : cadre SMÉ ISO 50001 --- */
    var aoa0 = [
      ["SMÉ — MAÎTRISE DE L'ÉNERGIE · HÔTEL WADRA BAY (esprit ISO 50001)"], [],
      ["Objet du classeur", "Traitement automatique des mesures pince (plan de mesurage §6.6) pour l'audit réconcilié : identification des usages énergétiques significatifs (UES), IPÉ, écarts vs revue énergétique (§6.3)."],
      ["Généré le", nowDate() + " " + nowTime()],
      ["Mesures exploitées", data.length + " (hors marche forcée : " + dataMF.length + " exclues des moyennes)"], [],
      ["SITUATION ÉNERGÉTIQUE DE RÉFÉRENCE (SER) — sources factures/contrat EEC"],
      ["Consommation exploitation", "514 600 kWh/an"],
      ["Talon", "183 100 kWh/an ≈ 36 % · ≈ " + TALON_EEC_KW + " kW la nuit (courbe EEC)"],
      ["Puissance souscrite", "125 kVA · cos φ 0,99 · abattement hôtelier 33,8 %"], [],
      ["IPÉ SUIVIS (indicateurs de performance énergétique)"],
      ["IPÉ-1", "kW de talon nuit (04h) — feuille Talon"],
      ["IPÉ-2", "kWh/jour par départ TGBT — feuille Synthèse départs"],
      ["IPÉ-3", "kWh/clé par type de logement (témoins en marche forcée) — feuille Semaine vs WE"],
      ["IPÉ-4", "Foisonnement Pmax/Pinstallée par départ (réconciliation revue énergétique)"], [],
      ["Amélioration continue (PDCA) : ces IPÉ alimentent le plan d'actions (registre WADRA_Bay_Registre_Actions_Energie.xlsx) et la vérification des gains après travaux."]
    ];
    var ws0 = XLSX.utils.aoa_to_sheet(aoa0);
    ws0["!cols"] = [{ wch: 26 }, { wch: 110 }];
    XLSX.utils.book_append_sheet(wb, ws0, "SMÉ ISO 50001");

    /* P moyenne par point × créneau (hors marche forcée) */
    function slotAvg(code, slotKey, weFilter) {
      var v = data.filter(function (d) {
        if (d.r.point !== code || d.r.creneau !== slotKey) return false;
        if (weFilter === "we") return d.we;
        if (weFilter === "sem") return !d.we;
        return true;
      }).map(function (d) { return d.p; });
      return avg(v);
    }
    /* kWh/j estimé : Σ créneaux × heures ; créneaux manquants comblés par la
       moyenne des créneaux disponibles (marqué "partiel") */
    function kwhJour(code, weFilter) {
      var vals = [], have = 0;
      CRENEAUX.forEach(function (c) {
        var a = slotAvg(code, c.key, weFilter);
        vals.push({ c: c, p: a });
        if (a != null) have++;
      });
      if (!have) return { kwh: null, cov: 0 };
      var fallback = avg(vals.filter(function (v) { return v.p != null; }).map(function (v) { return v.p; }));
      var kwh = 0;
      vals.forEach(function (v) { kwh += (v.p != null ? v.p : fallback) * v.c.hrs; });
      return { kwh: kwh, cov: have };
    }

    /* --- Feuille 1 : Synthèse par départ --- */
    var head = ["Point", "Libellé", "Nb mesures", "P max (kW)"];
    CRENEAUX.forEach(function (c) { head.push("P moy " + c.label.slice(0, 7) + " (kW)"); });
    head = head.concat(["Couverture créneaux", "kWh/j estimé", "kWh/an extrapolé",
      "P installée inventaire (kW)", "Foisonnement Pmax/Pinst", "kWh/an inventaire", "Écart mesure/inventaire"]);
    var aoa1 = [head];
    pts.forEach(function (pt) {
      var rs = data.filter(function (d) { return d.r.point === pt.code; });
      if (!rs.length) { aoa1.push([pt.code, pt.label, 0]); return; }
      var pmax = Math.max.apply(null, rs.map(function (d) { return d.p; }));
      var row = [pt.code, pt.label, rs.length, rnd(pmax, 2)];
      CRENEAUX.forEach(function (c) { row.push(rnd(slotAvg(pt.code, c.key), 2)); });
      var kjS = kwhJour(pt.code, "sem"), kjW = kwhJour(pt.code, "we"), kj = kwhJour(pt.code);
      var kAn = null;
      if (kjS.kwh != null && kjW.kwh != null) kAn = (kjS.kwh * 5 + kjW.kwh * 2) * 52;
      else if (kj.kwh != null) kAn = kj.kwh * 365;
      var inv = pInstZone(pt.zone);
      row.push(kj.cov + "/8" + (kj.cov < 8 ? " (partiel)" : ""));
      row.push(rnd(kj.kwh, 1));
      row.push(kAn != null ? Math.round(kAn) : null);
      row.push(inv ? rnd(inv.p, 1) : null);
      row.push(inv && inv.p > 0 ? rnd(pmax / inv.p, 2) : null);
      row.push(inv && inv.kwh ? Math.round(inv.kwh) : null);
      row.push(inv && inv.kwh && kAn != null ? (Math.round((kAn - inv.kwh) / inv.kwh * 100) + " %") : null);
      aoa1.push(row);
    });
    var ws1 = XLSX.utils.aoa_to_sheet(aoa1);
    ws1["!cols"] = head.map(function (h, i) { return { wch: i === 1 ? 42 : 13 }; });
    XLSX.utils.book_append_sheet(wb, ws1, "Synthèse départs");

    /* --- Feuille 2 : Profil journalier --- */
    var codes = pts.filter(function (p) { return data.some(function (d) { return d.r.point === p.code; }); }).map(function (p) { return p.code; });
    var aoa2 = [["Créneau", "Heures"].concat(codes)];
    CRENEAUX.forEach(function (c) {
      var row = [c.label, c.hrs];
      codes.forEach(function (code) { row.push(rnd(slotAvg(code, c.key), 2)); });
      aoa2.push(row);
    });
    var aoaTot = ["TOTAL départs TGBT (hors ARR)", ""];
    codes.forEach(function () { aoaTot.push(null); });
    aoa2.push([]);
    aoa2.push(["P moy en kW par point et par créneau — hors mesures en marche forcée."]);
    var ws2 = XLSX.utils.aoa_to_sheet(aoa2);
    ws2["!cols"] = [{ wch: 24 }, { wch: 7 }].concat(codes.map(function () { return { wch: 11 }; }));
    XLSX.utils.book_append_sheet(wb, ws2, "Profil journalier");

    /* --- Feuille 3 : Talon --- */
    var aoa3 = [["TALON — mesures 00h-05h (créneau talon)"], [],
      ["Point", "Date", "Heure", "P (kW)", "Observations"]];
    var talonRows = data.filter(function (d) { return d.r.creneau === "talon"; });
    talonRows.forEach(function (d) {
      aoa3.push([d.r.point, d.r.date, d.r.heure, rnd(d.p, 2), (d.r.obs || "").replace(/\s+/g, " ")]);
    });
    aoa3.push([]);
    var talSum = 0, talN = 0;
    pts.filter(function (p) { return p.grp === GRP_TGBT && p.code !== "ARR"; }).forEach(function (p) {
      var a = slotAvg(p.code, "talon");
      if (a != null) { talSum += a; talN++; }
    });
    var arrTal = slotAvg("ARR", "talon");
    aoa3.push(["Σ départs mesurés au talon (" + talN + "/10 départs)", null, null, rnd(talSum, 1)]);
    if (arrTal != null) aoa3.push(["Arrivée générale au talon", null, null, rnd(arrTal, 1)]);
    aoa3.push(["Référence courbe EEC (talon nuit moyen)", null, null, TALON_EEC_KW]);
    if (arrTal != null) aoa3.push(["Écart arrivée vs EEC", null, null, rnd(arrTal - TALON_EEC_KW, 1)]);
    aoa3.push([]);
    aoa3.push(["Rappel audit : talon = 183 100 kWh/an ≈ 36 % de la conso — cible n°1 (lagunarium, STEP, pomperie, froid, veilles)."]);
    var ws3 = XLSX.utils.aoa_to_sheet(aoa3);
    ws3["!cols"] = [{ wch: 44 }, { wch: 11 }, { wch: 7 }, { wch: 9 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Talon");

    /* --- Feuille 4 : Semaine vs Week-end --- */
    var aoa4 = [["Point", "P moy semaine (kW)", "P moy WE (kW)", "kWh/j semaine", "kWh/j WE", "kWh/an extrapolé (5 sem + 2 WE)"]];
    pts.forEach(function (pt) {
      var s = data.filter(function (d) { return d.r.point === pt.code && !d.we; }).map(function (d) { return d.p; });
      var w = data.filter(function (d) { return d.r.point === pt.code && d.we; }).map(function (d) { return d.p; });
      if (!s.length && !w.length) return;
      var kjS = kwhJour(pt.code, "sem"), kjW = kwhJour(pt.code, "we");
      var kAn = (kjS.kwh != null && kjW.kwh != null) ? (kjS.kwh * 5 + kjW.kwh * 2) * 52 : null;
      aoa4.push([pt.code, rnd(avg(s), 2), rnd(avg(w), 2), rnd(kjS.kwh, 1), rnd(kjW.kwh, 1), kAn != null ? Math.round(kAn) : null]);
    });
    var ws4 = XLSX.utils.aoa_to_sheet(aoa4);
    ws4["!cols"] = aoa4[0].map(function () { return { wch: 17 }; });
    XLSX.utils.book_append_sheet(wb, ws4, "Semaine vs WE");

    /* --- Feuille 5 : Contrôles --- */
    var aoa5 = [["CONTRÔLES DE COHÉRENCE"], []];
    /* a) Σ départs vs arrivée, par passage (même date + créneau) */
    aoa5.push(["a) Somme des départs vs arrivée générale (par passage)"]);
    aoa5.push(["Date", "Créneau", "Nb départs mesurés", "Σ départs (kW)", "Arrivée (kW)", "Écart (%)"]);
    var passes = {};
    data.forEach(function (d) {
      var pd = pointBy(d.r.point) || {};
      if (pd.grp !== GRP_TGBT) return;
      var k = d.r.date + "|" + d.r.creneau;
      passes[k] = passes[k] || { dep: {}, arr: null };
      if (d.r.point === "ARR") passes[k].arr = d.p;
      else passes[k].dep[d.r.point] = d.p;
    });
    Object.keys(passes).sort().forEach(function (k) {
      var p = passes[k], nd = Object.keys(p.dep).length;
      if (!nd) return;
      var sum = 0; Object.keys(p.dep).forEach(function (c) { sum += p.dep[c]; });
      var parts = k.split("|");
      aoa5.push([parts[0], creneauLabel(parts[1]), nd, rnd(sum, 1), rnd(p.arr, 1),
        (p.arr && nd >= 8) ? Math.round((sum - p.arr) / p.arr * 100) + " %" : (nd < 8 ? "passage incomplet" : "arrivée non mesurée")]);
    });
    aoa5.push([]);
    /* b) déséquilibres */
    aoa5.push(["b) Déséquilibres de phases ≥ 20 % (à re-vérifier)"]);
    aoa5.push(["Point", "Date", "Heure", "I L1", "I L2", "I L3", "Déséq. (%)"]);
    rowsForExport().filter(function (d) { return d.dz != null && d.dz >= 20; }).forEach(function (d) {
      aoa5.push([d.r.point, d.r.date, d.r.heure, num(d.r.i1), num(d.r.i2), num(d.r.i3), d.dz]);
    });
    aoa5.push([]);
    /* c) couverture */
    aoa5.push(["c) Points sans aucune mesure"]);
    pts.forEach(function (pt) {
      if (!rowsForExport().some(function (d) { return d.r.point === pt.code; })) aoa5.push([pt.code, pt.label]);
    });
    aoa5.push([]);
    aoa5.push(["d) Mesures en marche forcée (exclues des moyennes) : " + dataMF.length]);
    dataMF.forEach(function (d) { aoa5.push([d.r.point, d.r.date, d.r.heure, rnd(d.p, 2), (d.r.obs || "").replace(/\s+/g, " ")]); });
    var ws5 = XLSX.utils.aoa_to_sheet(aoa5);
    ws5["!cols"] = [{ wch: 22 }, { wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws5, "Contrôles");

    XLSX.writeFile(wb, "WADRA_Bay_Audit_Reconcilie_Traitement_" + nowDate() + ".xlsx");
    toast("Traitement audit téléchargé (" + data.length + " mesures exploitées)");
  }

  /* -------------------- rendu principal -------------------- */
  function render() {
    ensureM();
    window.scrollTo(0, 0);
    if (V.screen === "form") renderForm();
    else if (V.screen === "point") renderPoint();
    else renderDash();
  }

  /* -------------------- API -------------------- */
  window.MESURES = {
    render: render,
    back: back,
    count: function () {
      var M = state.mesures || {}, n = 0;
      for (var k in M) { if (M.hasOwnProperty(k) && k !== "_points" && M[k] && M[k].point) n++; }
      return n;
    },
    lastLabel: function () {
      var rs = allRows();
      if (!rs.length) return null;
      var r = rs[rs.length - 1];
      return r.point + " · " + r.date.slice(8) + "/" + r.date.slice(5, 7) + " " + r.heure;
    }
  };
})();
