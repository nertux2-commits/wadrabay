/* =====================================================================
   WADRA Bay — Module ÉCLAIREMENT (luxmètre)
   ---------------------------------------------------------------------
   Greffé sur l'appli existante SANS rien modifier de l'inventaire ni
   de la campagne pince.
   - Relevés d'éclairement (lx) par lieu, à comparer aux valeurs de
     référence : NF EN 12464-1:2021 (intérieur), NF EN 12464-2 (extérieur),
     NF EN 13201-2 (voiries / allées, classes P), NF EN 1838 (sécurité).
   - Chaque lieu porte : Ēm requis en exploitation, cible « nuit » pour
     l'audit (ce qui devrait rester allumé à 02 h), plan de mesure, source.
   - Saisie multi-points (jusqu'à 5 lectures) → Ēm, Emin, Emax, Uo.
   - Verdict automatique : sous-éclairé / conforme / sur-éclairé (gisement)
     + drapeau « à éteindre / à réduire la nuit ».
   - Stockage local (state.lux) + synchro Supabase (type "lux", voir sync.js).
   - Exports xlsx : brut + synthèse par lieu + référentiel.
   Dépend des globales de index.html : state, $, esc, toast, touch, nav,
   fmtNum, rndId, TREE, openSheet, closeSheet, sheetConfirm, XLSX.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------- groupes de lieux -------------------- */
  var G_EXT = "Extérieur — utile la nuit";
  var G_INT = "Intérieur — communs";
  var G_HEB = "Hébergement (témoins)";
  var G_LT  = "Locaux techniques — à éteindre la nuit";
  var G_SEC = "Éclairage de sécurité";

  /* Lieux de référence.
     em   : éclairement moyen maintenu requis en exploitation (lx)
     emin : éclairement minimal requis (lx) quand la norme le fixe
     uo   : uniformité minimale Emin/Ēm quand la norme la fixe
     nuit : cible audit à 02 h (lx) — 0 = doit être éteint ; null = pas de cible
     plan : plan de mesure conseillé
     src  : source de la valeur
     tour : ordre dans la tournée guidée de nuit (undefined = hors tournée) */
  var LIEUX = [
    /* ---------- extérieur ---------- */
    {code:"EXT-ACCES",    grp:G_EXT, ord:1,  tour:1, label:"Accès site · portail → parvis réception (dépose clients)",
      em:20, emin:5, uo:null, nuit:10, plan:"sol", zone:"z_c",
      src:"EN 12464-2 : circulation véhicules 20 lx · piétons 5 lx. Nuit : 10 lx suffisent (gradation)."},
    {code:"EXT-PARKING",  grp:G_EXT, ord:2,  tour:2, label:"Parking clients / personnel",
      em:5, emin:1, uo:0.25, nuit:5, plan:"sol", zone:"z_c",
      src:"EN 12464-2 §5.9 : parking faible trafic 5 lx (moyen 10, fort 20). Détection de présence recommandée."},
    {code:"EXT-VOIRIE",   grp:G_EXT, ord:3,  tour:3, label:"Voiries internes (golfettes, service)",
      em:7.5, emin:1.5, uo:null, nuit:5, plan:"sol", zone:"z_c",
      src:"EN 13201-2 classe P3 : 7,5 lx moy / 1,5 lx min. Nuit profonde : P4 (5 lx / 1 lx)."},
    {code:"EXT-ALLEES",   grp:G_EXT, ord:4,  tour:4, label:"Allées piétonnes vers bungalows (lagune / forêt / plage)",
      em:5, emin:1, uo:null, nuit:3, plan:"sol", zone:"z_c",
      src:"EN 13201-2 classe P4 : 5 lx moy / 1 lx min · EN 12464-2 piétons 5 lx. Nuit : P5 (3 lx / 0,6 lx) avec détection."},
    {code:"EXT-ESCALIERS",grp:G_EXT, ord:5,  tour:5, label:"Escaliers, marches, passerelles extérieures",
      em:10, emin:2, uo:null, nuit:10, plan:"sol", zone:"z_c",
      src:"EN 13201-2 classe P2 : 10 lx moy / 2 lx min (zone de conflit piéton). À maintenir toute la nuit."},
    {code:"EXT-PISCINE",  grp:G_EXT, ord:6,  tour:6, label:"Plage de piscine (bassin fermé la nuit)",
      em:50, emin:5, uo:null, nuit:5, plan:"sol", zone:"z_c",
      src:"Repère audit : 50 lx sur la plage en soirée (usage) · piscine fermée : 5 lx de circulation (EN 12464-2 piétons). Éclairage subaquatique : cible 0 la nuit."},
    {code:"EXT-TERRASSES",grp:G_EXT, ord:7,  tour:7, label:"Terrasses bar / restaurant (soirée)",
      em:100, emin:null, uo:null, nuit:0, plan:"table", zone:"z_c",
      src:"EN 12464-1 §5.29.3 : restaurant = ambiance, pas de valeur imposée. Repère 100 lx sur table au service. Après fermeture : 0."},
    {code:"EXT-PAYSAGER", grp:G_EXT, ord:8,  tour:8, label:"Façades, jardins, mise en valeur, bord de lagune",
      em:null, emin:null, uo:null, nuit:0, plan:"sol", zone:"z_c",
      src:"Aucune exigence. Cible nuit 0 lx (extinction 23 h : trame noire, tortues, économie). Mesurer au sol sous le luminaire."},

    /* ---------- intérieur communs ---------- */
    {code:"INT-RECEPTION",grp:G_INT, ord:10, tour:9, label:"Réception · comptoir d'accueil (veille de nuit)",
      em:300, emin:null, uo:0.6, nuit:50, plan:"table", zone:"z_c",
      src:"EN 12464-1 §5.29.1 : réception 300 lx, Uo 0,6, Ra 80. Hall 100 lx. Nuit sans veilleur : 50 lx (niveau réduit admis)."},
    {code:"INT-COULOIRS", grp:G_INT, ord:11, tour:10, label:"Couloirs et escaliers chambres bât. N / O, ascenseur",
      em:100, emin:null, uo:0.4, nuit:50, plan:"sol", zone:"z_lt4",
      src:"EN 12464-1 §5.29.7 / §5.2 : couloirs 100 lx, escaliers 150 lx, Uo 0,4 — « des niveaux plus bas sont acceptables la nuit ». Cible 50 lx + détection."},
    {code:"INT-SANIT",    grp:G_INT, ord:12, tour:11, label:"Sanitaires communs (restaurant, salle polyvalente)",
      em:200, emin:null, uo:0.4, nuit:0, plan:"sol", zone:"z_sp",
      src:"EN 12464-1 §5.2 : toilettes / lavabos 200 lx. Nuit : 0 (détecteur de présence)."},
    {code:"INT-RESTO",    grp:G_INT, ord:13, tour:12, label:"Salle restaurant / bar (service du soir)",
      em:150, emin:null, uo:null, nuit:0, plan:"table", zone:"z_c",
      src:"EN 12464-1 §5.29.3 : ambiance, pas de valeur. Repères : tables 100–200 lx, buffet 300 lx (§5.29.5), self 200 lx (§5.29.4). Après service : 0."},
    {code:"INT-CUISINE",  grp:G_INT, ord:14, tour:13, label:"Cuisine principale / cuisine Sea Food",
      em:500, emin:null, uo:0.6, nuit:0, plan:"table", zone:"z_c",
      src:"EN 12464-1 §5.29.2 : cuisine 500 lx, Uo 0,6, Ra 80. Nuit : 0 (hors veilleuses froid)."},
    {code:"INT-RESERVES", grp:G_INT, ord:15, tour:14, label:"Réserves, garde-manger, plonge, économat",
      em:100, emin:null, uo:0.4, nuit:0, plan:"sol", zone:"z_c",
      src:"EN 12464-1 §5.2 : locaux de stockage 100 lx (200 lx si manutention). Nuit : 0."},
    {code:"INT-LINGERIE", grp:G_INT, ord:16, tour:15, label:"Lingerie · laverie · repassage (Bât. I)",
      em:300, emin:null, uo:0.6, nuit:0, plan:"table", zone:"z_sg",
      src:"EN 12464-1 §5.14 : lavage / repassage 300 lx, Uo 0,6. Nuit : 0 — si la lingerie tourne le soir, vérifier la commande."},
    {code:"INT-SALLEPOLY",grp:G_INT, ord:17, tour:16, label:"Salle polyvalente (événements)",
      em:300, emin:null, uo:0.6, nuit:0, plan:"table", zone:"z_sp",
      src:"EN 12464-1 : salle de réunion / conférence 500 lx (§5.29.6) ; usage polyvalent 300 lx. Nuit : 0."},
    {code:"INT-SPA",      grp:G_INT, ord:18, tour:17, label:"SPA / fitness",
      em:300, emin:null, uo:0.6, nuit:0, plan:"sol", zone:"z_lt1",
      src:"EN 12464-1 : salle de sport 300 lx ; SPA = ambiance. Nuit : 0."},
    {code:"INT-BUREAUX",  grp:G_INT, ord:19, tour:18, label:"Bureaux administration / gouvernante",
      em:500, emin:null, uo:0.6, nuit:0, plan:"table", zone:"z_c",
      src:"EN 12464-1 §5.26 : écriture / lecture / écran 500 lx, Uo 0,6. Nuit : 0."},

    /* ---------- hébergement ---------- */
    {code:"CH-CHAMBRE",   grp:G_HEB, ord:20, label:"Chambre / bungalow — éclairage général (témoin)",
      em:150, emin:null, uo:null, nuit:null, plan:"sol", zone:"z_lt4",
      src:"Hors EN 12464-1 (logement). Repère hôtelier : 100–150 lx général, 300 lx lecture chevet. Sert à qualifier la puissance installée (W/m²)."},
    {code:"CH-SDB",       grp:G_HEB, ord:21, label:"Salle de bain — miroir (témoin)",
      em:200, emin:null, uo:null, nuit:null, plan:"table", zone:"z_lt4",
      src:"EN 12464-1 §5.2 : salles d'eau 200 lx. Veilleuse nuit : 10–20 lx suffisent."},
    {code:"CH-TERRASSE",  grp:G_HEB, ord:22, label:"Terrasse bungalow (témoin)",
      em:30, emin:null, uo:null, nuit:0, plan:"sol", zone:"z_lt4",
      src:"Repère ambiance 20–50 lx. Nuit bungalow inoccupé : 0."},

    /* ---------- locaux techniques ---------- */
    {code:"LT-TGBT",      grp:G_LT, ord:30, tour:19, label:"Local TGBT / poste HT-BT / local groupe",
      em:200, emin:null, uo:0.4, nuit:0, plan:"sol", zone:"z_tgbt",
      src:"EN 12464-1 §5.2 : locaux techniques / tableaux 200 lx. Nuit sans intervention : 0 (minuterie / détecteur)."},
    {code:"LT-POMPERIE",  grp:G_LT, ord:31, tour:20, label:"Pomperie · local DI · STEP",
      em:200, emin:null, uo:0.4, nuit:0, plan:"sol", zone:"z_pomperie",
      src:"EN 12464-1 §5.2 : locaux techniques 200 lx. Nuit : 0."},
    {code:"LT-PISCINE",   grp:G_LT, ord:32, tour:21, label:"Local technique piscine · local lagunarium",
      em:200, emin:null, uo:0.4, nuit:0, plan:"sol", zone:"z_sp",
      src:"EN 12464-1 §5.2 : locaux techniques 200 lx. Nuit : 0."},
    {code:"LT-AUTRES",    grp:G_LT, ord:33, tour:22, label:"Locaux techniques LT1→LT7, atelier, local serveur, ECS",
      em:200, emin:null, uo:0.4, nuit:0, plan:"sol", zone:null,
      src:"EN 12464-1 §5.2 : locaux techniques 200 lx, atelier mécanique 300 lx. Nuit : 0."},

    /* ---------- sécurité ---------- */
    {code:"SEC-EVAC",     grp:G_SEC, ord:40, label:"BAES · chemin d'évacuation (éclairage normal éteint)",
      em:1, emin:1, uo:null, nuit:1, plan:"sol", zone:"z_c",
      src:"EN 1838 : 1 lx sur l'axe du cheminement (0,5 lx anti-panique ; 15 lx poste à risque). Mesurer éclairage normal éteint, au sol."}
  ];

  var PLANS = {
    sol:   "au sol (0 m) — capteur horizontal, à plat",
    table: "plan utile 0,85 m (table, comptoir, plan de travail)",
    autre: "hauteur précisée"
  };
  var ETATS = [
    {key:"trouve", short:"trouvé", label:"Tel que trouvé (état réel à l'heure du relevé)"},
    {key:"on",     short:"tout allumé", label:"Tout allumé (essai / marche forcée)"},
    {key:"off",    short:"éteint", label:"Éteint — lumière ambiante seule (lune, voisinage)"},
    {key:"secours",short:"BAES seul", label:"Éclairage de sécurité seul (BAES)"}
  ];
  var COMMANDES = [
    {key:"", label:"— non relevé —"},
    {key:"inter", label:"Interrupteur manuel"},
    {key:"permanent", label:"Permanent (jamais éteint)"},
    {key:"horloge", label:"Horloge / programmateur"},
    {key:"crepus", label:"Cellule crépusculaire"},
    {key:"detect", label:"Détecteur de présence"},
    {key:"minuterie", label:"Minuterie"},
    {key:"grad", label:"Gradation / abaissement nocturne"}
  ];
  var SOURCES = [
    {key:"", label:"— non relevé —"},
    {key:"led", label:"LED"},
    {key:"fluo", label:"Fluo / tube / éco"},
    {key:"halo", label:"Halogène"},
    {key:"inc", label:"Incandescent"},
    {key:"hid", label:"Décharge (SHP, iodure)"},
    {key:"mixte", label:"Mixte"}
  ];

  /* créneaux — mêmes bornes que le module pince (cohérence des exports) */
  var CRENEAUX = [
    {key:"talon", label:"00h-05h · Talon nuit",  h0:0,  h1:5},
    {key:"dem",   label:"05h-07h · Démarrage",   h0:5,  h1:7},
    {key:"mat",   label:"07h-09h · Matin",       h0:7,  h1:9},
    {key:"jour",  label:"09h-12h · Matinée",     h0:9,  h1:12},
    {key:"midi",  label:"12h-14h · Midi",        h0:12, h1:14},
    {key:"am",    label:"14h-18h · Après-midi",  h0:14, h1:18},
    {key:"soir",  label:"18h-21h · Soirée",      h0:18, h1:21},
    {key:"nuit",  label:"21h-24h · Nuit",        h0:21, h1:24}
  ];
  function creneauFromTime(hhmm) {
    var h = parseInt(String(hhmm || "").slice(0, 2), 10);
    if (isNaN(h)) return "nuit";
    for (var i = 0; i < CRENEAUX.length; i++) if (h >= CRENEAUX[i].h0 && h < CRENEAUX[i].h1) return CRENEAUX[i].key;
    return "nuit";
  }
  function creneauLabel(k) { var c = CRENEAUX.filter(function (x) { return x.key === k; })[0]; return c ? c.label : k; }
  function isNightKey(k) { return k === "talon" || k === "nuit" || k === "dem"; }

  /* -------------------- état -------------------- */
  var V = { screen: "dash", lieu: null, editId: null, tour: -1 };
  function ensureL() { state.lux = state.lux || {}; return state.lux; }
  function cfg() { var L = ensureL(); L._cfg = L._cfg || {}; return L._cfg; }
  function customLieux() { var c = ensureL()._lieux; return (c && c.list) ? c.list : []; }
  function allLieux() {
    var l = LIEUX.slice();
    customLieux().forEach(function (x) { l.push(x); });
    l.sort(function (a, b) { return (a.ord || 99) - (b.ord || 99); });
    return l;
  }
  function lieuBy(code) { return allLieux().filter(function (p) { return p.code === code; })[0] || null; }
  function allRows() {
    var L = ensureL(), out = [];
    for (var k in L) {
      if (!L.hasOwnProperty(k) || k.charAt(0) === "_") continue;
      var r = L[k]; if (!r || !r.lieu) continue;
      r.id = k; out.push(r);
    }
    out.sort(function (a, b) { return (a.date + a.heure) < (b.date + b.heure) ? -1 : 1; });
    return out;
  }
  function rowsOf(code) { return allRows().filter(function (r) { return r.lieu === code; }); }
  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(",", ".").replace(/\s/g, "")); return isNaN(n) ? null : n; }
  function nowDate() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function nowTime() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function rnd(x, d) { if (x == null) return null; var m = Math.pow(10, d || 0); return Math.round(x * m) / m; }
  function fmtLx(x) { if (x == null) return "—"; return (x < 10 ? fmtNum(x, 1) : fmtNum(x, 0)) + " lx"; }

  /* -------------------- calculs -------------------- */
  function eArr(r) { return [num(r.e1), num(r.e2), num(r.e3), num(r.e4), num(r.e5)].filter(function (x) { return x != null; }); }
  function calc(r) {
    var a = eArr(r);
    if (!a.length) return { n: 0, em: null, emin: null, emax: null, uo: null };
    var s = 0, mn = Infinity, mx = -Infinity;
    a.forEach(function (x) { s += x; if (x < mn) mn = x; if (x > mx) mx = x; });
    var em = s / a.length;
    return { n: a.length, em: em, emin: mn, emax: mx, uo: (em > 0 && a.length > 1) ? mn / em : null };
  }
  function densite(r) { /* W/m² et W/m² pour 100 lx */
    var w = num(r.pw), s = num(r.surf), c = calc(r);
    if (w == null || !s) return { wm2: null, wm2_100: null };
    var wm2 = w / s;
    return { wm2: wm2, wm2_100: (c.em && c.em > 0) ? wm2 / (c.em / 100) : null };
  }

  /* verdict : {cls, txt, action} */
  function verdict(r) {
    var p = lieuBy(r.lieu) || {};
    var c = calc(r);
    if (c.n === 0) return { cls: "na", txt: "sans lecture", action: "" };
    var night = isNightKey(r.creneau);
    if (r.etat === "off") {
      if (p.grp === G_SEC) return { cls: "na", txt: "ambiant " + fmtLx(c.em), action: "" };
      return { cls: "na", txt: "ambiant " + fmtLx(c.em), action: "" };
    }
    if (r.etat === "secours" || p.grp === G_SEC) {
      if (c.emin != null && c.emin >= 1) return { cls: "ok", txt: "BAES conforme (≥ 1 lx)", action: "" };
      return { cls: "low", txt: "BAES insuffisant (< 1 lx)", action: "Vérifier BAES / batteries" };
    }
    var out;
    if (p.em == null) {
      out = { cls: "info", txt: fmtLx(c.em) + " · pas d'exigence", action: "" };
    } else {
      var ratio = c.em / p.em;
      if (ratio < 0.7) out = { cls: "low", txt: "sous-éclairé · " + Math.round(ratio * 100) + " % du requis", action: "Nettoyage / remplacement de sources, revoir implantation" };
      else if (ratio <= 1.5) out = { cls: "ok", txt: "conforme · " + Math.round(ratio * 100) + " % du requis", action: "" };
      else if (ratio <= 3) out = { cls: "high", txt: "sur-éclairé · ×" + fmtNum(ratio, 1) + " du requis", action: "Gisement : gradation, dépose d'une partie des sources" };
      else out = { cls: "high", txt: "très sur-éclairé · ×" + fmtNum(ratio, 1) + " du requis", action: "Gisement fort : réduire la puissance installée" };
      if (p.uo != null && c.uo != null && c.uo < p.uo && out.cls === "ok") {
        out.txt += " · Uo " + fmtNum(c.uo, 2) + " < " + p.uo;
      }
    }
    /* drapeau nuit */
    if (night && r.etat !== "on") {
      if (p.nuit === 0 && c.em > 5) { out.night = "À ÉTEINDRE la nuit"; out.cls = out.cls === "low" ? "high" : "high"; }
      else if (p.nuit > 0 && c.em > 2 * p.nuit) { out.night = "À RÉDUIRE la nuit (cible " + fmtLx(p.nuit) + ")"; if (out.cls === "ok") out.cls = "high"; }
      else if (p.nuit > 0 && c.em < 0.7 * p.nuit) { out.night = "Insuffisant la nuit (cible " + fmtLx(p.nuit) + ")"; out.cls = "low"; }
    }
    return out;
  }
  var VCOL = { ok: "#1a9d5a", low: "#c0392b", high: "#e0892a", info: "#155e9c", na: "#8895a3" };

  /* -------------------- pièces (lien inventaire) -------------------- */
  function roomOptions(sel, zonePref) {
    var html = '<option value="">— aucune (facultatif) —</option>';
    var tree = (typeof TREE !== "undefined" && TREE) ? TREE : [];
    var ordered = tree.slice();
    if (zonePref) ordered.sort(function (a, b) { return (a.id === zonePref ? -1 : 0) - (b.id === zonePref ? -1 : 0); });
    ordered.forEach(function (z) {
      html += '<optgroup label="' + esc(z.name) + '">';
      z.rooms.forEach(function (r) {
        html += '<option value="' + esc(r.id) + '"' + (r.id === sel ? " selected" : "") + '>' + esc(r.name) + '</option>';
      });
      html += '</optgroup>';
    });
    return html;
  }
  function roomLabel(rid) {
    if (!rid) return "";
    var tree = (typeof TREE !== "undefined" && TREE) ? TREE : [];
    for (var i = 0; i < tree.length; i++) {
      var z = tree[i];
      for (var j = 0; j < z.rooms.length; j++) if (z.rooms[j].id === rid) return z.name + " · " + z.rooms[j].name;
    }
    return rid;
  }

  /* -------------------- navigation -------------------- */
  function back() {
    if (V.screen !== "dash") { V.screen = "dash"; V.editId = null; V.tour = -1; render(); return true; }
    return false;
  }
  function badge(v) {
    return '<span style="display:inline-block;background:' + VCOL[v.cls] + ';color:#fff;border-radius:8px;padding:1px 7px;font-size:11px;font-weight:800">' +
      esc(v.night ? v.night : v.txt) + '</span>';
  }

  /* -------------------- RENDU : tableau de bord -------------------- */
  function renderDash() {
    var rows = allRows(), lieux = allLieux();
    var covered = {}; rows.forEach(function (r) { covered[r.lieu] = 1; });
    var last = rows.length ? rows[rows.length - 1] : null;
    var nHigh = rows.filter(function (r) { return verdict(r).cls === "high"; }).length;
    var C = cfg();

    var html = '<div style="border-radius:16px;overflow:hidden;margin-bottom:12px;padding:16px;color:#fff;' +
      'background:linear-gradient(135deg,#b8860b,#7a5a06 60%,#4e3a03);box-shadow:0 2px 10px rgba(20,30,40,.18)">' +
      '<div style="font-size:19px;font-weight:800">💡 Éclairement — Luxmètre</div>' +
      '<div style="font-size:12.5px;opacity:.92;margin-top:3px">Campagne de nuit · ' + esc(C.appareil || "luxmètre (à renseigner)") +
      ' · références EN 12464-1/-2 · EN 13201 · EN 1838</div>' +
      '<div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + rows.length + '</div><div style="font-size:11px;opacity:.9">relevés</div></div>' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + Object.keys(covered).length + '/' + lieux.length + '</div><div style="font-size:11px;opacity:.9">lieux couverts</div></div>' +
      '<div style="flex:1;min-width:90px;background:rgba(255,255,255,.13);border-radius:10px;padding:8px 10px">' +
      '<div style="font-size:19px;font-weight:800">' + nHigh + '</div><div style="font-size:11px;opacity:.9">gisements (sur-éclairé / à éteindre)</div></div>' +
      '</div></div>';

    html += '<button class="btn primary" id="lxNew" style="background:#b8860b">➕ Nouveau relevé</button>' +
      '<button class="btn primary" id="lxTour" style="background:#0d7a6f;margin-top:9px">🌙 Tournée de nuit guidée (' +
      lieux.filter(function (p) { return p.tour; }).length + ' lieux)</button>';

    html += '<div class="panel" style="margin-top:12px"><h2>Appareil &amp; protocole</h2>' +
      '<label class="fld"><span>Luxmètre utilisé (marque, modèle, n° série)</span>' +
      '<input type="text" id="lxApp" placeholder="ex. PCE-172 n° …" value="' + esc(C.appareil || "") + '"></label>' +
      '<div class="tiny muted" style="line-height:1.5">' +
      '1. Capteur horizontal sur le plan de mesure (sol pour circulations, 0,85 m pour tables / comptoirs), capuchon retiré, lecture stabilisée (5 s).<br>' +
      '2. Corps et téléphone hors du faisceau ; lampe frontale éteinte ; pas d\'ombre portée.<br>' +
      '3. 3 à 5 points par lieu (centre + extrémités / sous et entre luminaires) → Ēm, Emin, Uo.<br>' +
      '4. La nuit, noter l\'état trouvé (allumé / éteint) AVANT de toucher aux interrupteurs ; si utile, refaire une lecture « éteint » pour l\'ambiant.<br>' +
      '5. Compter les luminaires allumés et, si possible, la puissance (plaque ou inventaire) et la surface → W/m² pour 100 lx (LED ≈ 2 · fluo ≈ 3 · halogène ≈ 10).' +
      '</div></div>';

    html += '<div class="panel"><h2>Exports</h2>' +
      '<button class="btn sec" id="lxExp">⬇️ Export xlsx (brut · synthèse par lieu · référentiel)</button>' +
      '<div class="tiny muted" style="margin-top:7px">Chaque relevé est rapproché de sa valeur de référence ; les lieux allumés la nuit sans besoin sont signalés comme gisements.</div></div>';

    var grps = [];
    lieux.forEach(function (p) { if (grps.indexOf(p.grp) < 0) grps.push(p.grp); });
    grps.forEach(function (g) {
      html += '<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#6b7785;margin:14px 2px 9px;font-weight:700">' + esc(g) + '</h2>';
      lieux.filter(function (p) { return p.grp === g; }).forEach(function (p) {
        var rs = rowsOf(p.code);
        var lastR = rs.length ? rs[rs.length - 1] : null;
        var ref = p.em != null ? ("réf. " + fmtLx(p.em)) : "pas d'exigence";
        if (p.nuit != null) ref += " · nuit " + (p.nuit === 0 ? "éteint" : fmtLx(p.nuit));
        html += '<div class="row-item" data-lx="' + esc(p.code) + '">' +
          '<div class="row-icon" style="background:#b8860b;font-size:10px">' + esc(p.code.split("-")[0]) + '</div>' +
          '<div class="row-body"><div class="row-title">' + esc(p.label) + (rs.length ? ' <span style="color:#b8860b;font-weight:800">· ' + rs.length + '</span>' : '') + '</div>' +
          '<div class="row-desc">' + esc(ref) + (lastR ? (' — dern. : ' + fmtLx(calc(lastR).em) + ' ' + badge(verdict(lastR))) : '') + '</div></div>' +
          '<div class="row-chev">›</div></div>';
      });
    });
    html += '<button class="btn sec" id="lxAddLieu" style="margin-top:9px">＋ Ajouter un lieu</button>';

    $("app").innerHTML = html;
    $("lxNew").onclick = function () { openForm(null, null); };
    $("lxTour").onclick = startTour;
    $("lxExp").onclick = exportXlsx;
    $("lxAddLieu").onclick = addLieuSheet;
    $("lxApp").addEventListener("change", function () { cfg().appareil = this.value.trim(); touch("lux:_cfg"); toast("Appareil enregistré"); });
    document.querySelectorAll(".row-item[data-lx]").forEach(function (el) {
      el.onclick = function () { V.screen = "lieu"; V.lieu = el.dataset.lx; render(); };
    });
  }

  /* -------------------- RENDU : un lieu -------------------- */
  function renderLieu() {
    var p = lieuBy(V.lieu); if (!p) { V.screen = "dash"; renderDash(); return; }
    var rs = rowsOf(p.code).slice().reverse();
    var html = '<div class="panel"><h2>' + esc(p.label) + '</h2>' +
      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:6px">' +
      '<div style="flex:1;min-width:110px;background:#fbf6e9;border-radius:11px;padding:9px 11px"><div class="tiny muted">Ēm requis (usage)</div><div style="font-size:16px;font-weight:800;color:#7a5a06">' + (p.em != null ? fmtLx(p.em) : "—") + '</div></div>' +
      '<div style="flex:1;min-width:110px;background:#fbf6e9;border-radius:11px;padding:9px 11px"><div class="tiny muted">Cible nuit (02 h)</div><div style="font-size:16px;font-weight:800;color:#7a5a06">' + (p.nuit == null ? "—" : (p.nuit === 0 ? "éteint" : fmtLx(p.nuit))) + '</div></div>' +
      '<div style="flex:1;min-width:110px;background:#fbf6e9;border-radius:11px;padding:9px 11px"><div class="tiny muted">Emin / Uo</div><div style="font-size:16px;font-weight:800;color:#7a5a06">' + (p.emin != null ? fmtLx(p.emin) : "—") + (p.uo != null ? " / " + p.uo : "") + '</div></div>' +
      '</div>' +
      '<div class="tiny muted" style="margin-top:8px">Plan de mesure : ' + esc(PLANS[p.plan] || p.plan) + '</div>' +
      '<div class="tiny" style="margin-top:4px;color:#1a2025">' + esc(p.src) + '</div></div>';
    html += '<button class="btn primary" id="lxNewHere" style="background:#b8860b">➕ Relevé sur ce lieu</button>';
    if (!rs.length) html += '<div class="tiny muted" style="margin:10px 2px">Aucun relevé.</div>';
    rs.forEach(function (r) {
      var c = calc(r), v = verdict(r), d = densite(r);
      html += '<div class="row-item" data-lid="' + esc(r.id) + '">' +
        '<div class="row-icon" style="background:' + VCOL[v.cls] + ';font-size:11px">' + (c.em != null ? (c.em < 10 ? fmtNum(c.em, 1) : fmtNum(c.em, 0)) : "—") + '</div>' +
        '<div class="row-body"><div class="row-title">' + esc(r.date.slice(8) + "/" + r.date.slice(5, 7) + " " + r.heure) + ' · ' + esc(creneauLabel(r.creneau).split(" · ")[1] || r.creneau) +
        (r.libelle ? ' · ' + esc(r.libelle) : '') + '</div>' +
        '<div class="row-desc">' + badge(v) + (v.night ? ' <span class="tiny muted">' + esc(v.txt) + '</span>' : '') +
        ' · ' + c.n + ' pt' + (c.n > 1 ? 's' : '') + (c.uo != null ? ' · Uo ' + fmtNum(c.uo, 2) : '') +
        (d.wm2_100 != null ? ' · ' + fmtNum(d.wm2_100, 1) + ' W/m²/100lx' : '') +
        (r.etat && r.etat !== "trouve" ? ' · ' + esc((ETATS.filter(function (e) { return e.key === r.etat; })[0] || {}).short || r.etat) : '') +
        '</div></div><div class="row-chev">›</div></div>';
    });
    $("app").innerHTML = html;
    $("lxNewHere").onclick = function () { openForm(p.code, null); };
    document.querySelectorAll(".row-item[data-lid]").forEach(function (el) {
      el.onclick = function () { openForm(null, el.dataset.lid); };
    });
  }

  /* -------------------- RENDU : formulaire -------------------- */
  function openForm(code, editId) {
    V.screen = "form"; V.editId = editId || null;
    if (editId) { var r = ensureL()[editId]; if (r) V.lieu = r.lieu; }
    else V.lieu = code || V.lieu;
    render();
  }
  function renderForm() {
    var edit = V.editId ? ensureL()[V.editId] : null;
    var lieux = allLieux();
    var cur = edit ? edit : {
      lieu: V.lieu || lieux[0].code, room: "", libelle: "",
      date: nowDate(), heure: nowTime(), creneau: creneauFromTime(nowTime()),
      etat: "trouve", plan: "", hplan: "", e1: "", e2: "", e3: "", e4: "", e5: "",
      nlum: "", pw: "", surf: "", source: "", cmd: "", obs: ""
    };
    var p = lieuBy(cur.lieu) || {};
    var plan = cur.plan || p.plan || "sol";
    var inTour = V.tour >= 0;
    var tourL = lieux.filter(function (x) { return x.tour; }).sort(function (a, b) { return a.tour - b.tour; });

    var html = '<div class="panel"><h2>' + (edit ? "Modifier le relevé" : (inTour ? ("Tournée de nuit — lieu " + (V.tour + 1) + "/" + tourL.length) : "Nouveau relevé d'éclairement")) + '</h2>' +
      '<label class="fld"><span>Lieu</span><select id="lxLieu">' +
      lieux.map(function (x) { return '<option value="' + esc(x.code) + '"' + (x.code === cur.lieu ? " selected" : "") + '>' + esc(x.label) + '</option>'; }).join("") +
      '</select></label>' +
      '<div class="consigne" id="lxRef"></div>' +
      '<label class="fld"><span>Précision (n° chambre, tronçon d\'allée, bâtiment…)</span><input type="text" id="lxLib" value="' + esc(cur.libelle || "") + '" placeholder="ex. allée K11→K14 · chambre 305"></label>' +
      '<label class="fld"><span>Pièce de l\'inventaire (facultatif, pour rattacher au départ TGBT)</span><select id="lxRoom">' + roomOptions(cur.room, p.zone) + '</select></label>' +
      '<div class="row2">' +
      '<label class="fld"><span>Date</span><input type="date" id="lxDate" value="' + esc(cur.date) + '"></label>' +
      '<label class="fld"><span>Heure</span><input type="time" id="lxTime" value="' + esc(cur.heure) + '"></label>' +
      '</div>' +
      '<label class="fld"><span>Créneau (déduit de l\'heure)</span><select id="lxCren">' +
      CRENEAUX.map(function (c) { return '<option value="' + c.key + '"' + (c.key === cur.creneau ? " selected" : "") + '>' + esc(c.label) + '</option>'; }).join("") +
      '</select></label></div>';

    html += '<div class="panel"><h2>Lecture luxmètre</h2>' +
      '<label class="fld"><span>État de l\'éclairage pendant la lecture</span><select id="lxEtat">' +
      ETATS.map(function (e) { return '<option value="' + e.key + '"' + (e.key === cur.etat ? " selected" : "") + '>' + esc(e.label) + '</option>'; }).join("") +
      '</select></label>' +
      '<div class="row2">' +
      '<label class="fld"><span>Plan de mesure</span><select id="lxPlan">' +
      Object.keys(PLANS).map(function (k) { return '<option value="' + k + '"' + (k === plan ? " selected" : "") + '>' + esc(PLANS[k]) + '</option>'; }).join("") +
      '</select></label>' +
      '<label class="fld"><span>Hauteur si « autre » (m)</span><input type="text" inputmode="decimal" id="lxH" value="' + esc(cur.hplan || "") + '" placeholder="m"></label>' +
      '</div>' +
      '<div class="row2">' +
      '<label class="fld"><span>E1 (lx)</span><input type="text" inputmode="decimal" id="lxE1" value="' + esc(cur.e1 || "") + '" placeholder="lx"></label>' +
      '<label class="fld"><span>E2 (lx)</span><input type="text" inputmode="decimal" id="lxE2" value="' + esc(cur.e2 || "") + '" placeholder="lx"></label>' +
      '<label class="fld"><span>E3 (lx)</span><input type="text" inputmode="decimal" id="lxE3" value="' + esc(cur.e3 || "") + '" placeholder="lx"></label>' +
      '</div><div class="row2">' +
      '<label class="fld"><span>E4 (lx)</span><input type="text" inputmode="decimal" id="lxE4" value="' + esc(cur.e4 || "") + '" placeholder="lx"></label>' +
      '<label class="fld"><span>E5 (lx)</span><input type="text" inputmode="decimal" id="lxE5" value="' + esc(cur.e5 || "") + '" placeholder="lx"></label>' +
      '</div>' +
      '<div class="consigne" id="lxCalc">Ēm ≈ —</div></div>';

    html += '<div class="panel"><h2>Installation (pour le gisement)</h2>' +
      '<div class="row2">' +
      '<label class="fld"><span>Luminaires allumés (nb)</span><input type="text" inputmode="numeric" id="lxN" value="' + esc(cur.nlum || "") + '"></label>' +
      '<label class="fld"><span>Puissance allumée (W)</span><input type="text" inputmode="decimal" id="lxW" value="' + esc(cur.pw || "") + '" placeholder="W"></label>' +
      '<label class="fld"><span>Surface éclairée (m²)</span><input type="text" inputmode="decimal" id="lxS" value="' + esc(cur.surf || "") + '" placeholder="m²"></label>' +
      '</div><div class="row2">' +
      '<label class="fld"><span>Type de source</span><select id="lxSrc">' +
      SOURCES.map(function (e) { return '<option value="' + e.key + '"' + (e.key === (cur.source || "") ? " selected" : "") + '>' + esc(e.label) + '</option>'; }).join("") +
      '</select></label>' +
      '<label class="fld"><span>Commande</span><select id="lxCmd">' +
      COMMANDES.map(function (e) { return '<option value="' + e.key + '"' + (e.key === (cur.cmd || "") ? " selected" : "") + '>' + esc(e.label) + '</option>'; }).join("") +
      '</select></label>' +
      '</div>' +
      '<label class="fld"><span>Observations (lune, luminaires HS, ce qui est allumé pour rien…)</span>' +
      '<textarea id="lxObs" placeholder="ex. 2 hublots HS · applique terrasse allumée bungalow vide · pleine lune">' + esc(cur.obs || "") + '</textarea></label></div>';

    html += '<button class="btn primary" id="lxSave" style="background:#b8860b">💾 Enregistrer</button>';
    if (inTour) html += '<button class="btn primary" id="lxSaveNext" style="background:#0d7a6f;margin-top:9px">💾 Enregistrer → lieu suivant</button>';
    html += '<button class="btn sec" id="lxCancel" style="margin-top:9px">Annuler</button>';
    if (edit) html += '<button class="btn sec" id="lxDel" style="margin-top:9px;color:#c0392b;border-color:#e7b3ab">🗑 Supprimer ce relevé</button>';
    $("app").innerHTML = html;

    function readForm() {
      return {
        lieu: $("lxLieu").value, room: $("lxRoom").value, libelle: $("lxLib").value.trim(),
        date: $("lxDate").value || nowDate(), heure: $("lxTime").value || nowTime(), creneau: $("lxCren").value,
        etat: $("lxEtat").value, plan: $("lxPlan").value, hplan: $("lxH").value.trim(),
        e1: $("lxE1").value.trim(), e2: $("lxE2").value.trim(), e3: $("lxE3").value.trim(), e4: $("lxE4").value.trim(), e5: $("lxE5").value.trim(),
        nlum: $("lxN").value.trim(), pw: $("lxW").value.trim(), surf: $("lxS").value.trim(),
        source: $("lxSrc").value, cmd: $("lxCmd").value, obs: $("lxObs").value.trim(),
        appareil: cfg().appareil || "", op: (state.meta && state.meta.auditeur) || ""
      };
    }
    function paintRef() {
      var q = lieuBy($("lxLieu").value) || {};
      $("lxRef").innerHTML = '<b>Référence :</b> ' + (q.em != null ? ("Ēm " + fmtLx(q.em)) : "pas d'exigence") +
        (q.emin != null ? " · Emin " + fmtLx(q.emin) : "") + (q.uo != null ? " · Uo ≥ " + q.uo : "") +
        (q.nuit != null ? " · <b>nuit : " + (q.nuit === 0 ? "éteint" : fmtLx(q.nuit)) + "</b>" : "") +
        '<div class="tiny muted" style="margin-top:3px">' + esc(q.src || "") + ' — mesure ' + esc(PLANS[q.plan] || "") + '</div>';
    }
    function upd() {
      var r = readForm(), c = calc(r), v = verdict(r), d = densite(r);
      var t = "Ēm ≈ <b>" + fmtLx(c.em) + "</b>";
      if (c.n > 1) t += " · Emin " + fmtLx(c.emin) + " · Emax " + fmtLx(c.emax) + (c.uo != null ? " · Uo " + fmtNum(c.uo, 2) : "");
      if (d.wm2 != null) t += " · " + fmtNum(d.wm2, 1) + " W/m²" + (d.wm2_100 != null ? " (" + fmtNum(d.wm2_100, 1) + " W/m²/100 lx)" : "");
      if (c.n) t += "<br>" + badge(v) + (v.night ? ' <span class="tiny">' + esc(v.txt) + '</span>' : '') + (v.action ? '<div class="tiny muted">' + esc(v.action) + '</div>' : '');
      $("lxCalc").innerHTML = t;
    }
    ["lxE1", "lxE2", "lxE3", "lxE4", "lxE5", "lxW", "lxS", "lxEtat", "lxCren"].forEach(function (id) { $(id).addEventListener("input", upd); $(id).addEventListener("change", upd); });
    $("lxTime").addEventListener("change", function () { $("lxCren").value = creneauFromTime(this.value); upd(); });
    $("lxLieu").addEventListener("change", function () {
      var q = lieuBy(this.value) || {};
      if (q.plan) $("lxPlan").value = q.plan;
      $("lxRoom").innerHTML = roomOptions("", q.zone);
      paintRef(); upd();
    });
    paintRef(); upd();

    var save = function () {
      var r = readForm();
      if (!r.lieu) { toast("Choisir un lieu"); return null; }
      if (!eArr(r).length) { toast("Saisir au moins une lecture (lx)"); return null; }
      var id = V.editId || ("lx_" + rndId());
      ensureL()[id] = r;
      touch("lux:" + id);
      toast("Relevé enregistré — " + fmtLx(calc(r).em));
      return id;
    };
    $("lxSave").onclick = function () {
      if (save() == null) return;
      V.tour = -1; V.editId = null; V.lieu = $("lxLieu").value; V.screen = "lieu"; render();
    };
    if ($("lxSaveNext")) $("lxSaveNext").onclick = function () {
      if (save() == null) return;
      V.tour++;
      if (V.tour >= tourL.length) { V.tour = -1; V.editId = null; V.screen = "dash"; toast("🌙 Tournée de nuit terminée !"); render(); return; }
      V.editId = null; V.lieu = tourL[V.tour].code; render();
    };
    $("lxCancel").onclick = function () { V.editId = null; V.tour = -1; V.screen = V.lieu ? "lieu" : "dash"; render(); };
    if ($("lxDel")) $("lxDel").onclick = function () {
      sheetConfirm("Supprimer ce relevé ?", "", "Supprimer", true, function () {
        var id = V.editId; delete ensureL()[id]; touch("lux:" + id);
        V.editId = null; V.screen = "lieu"; render(); toast("Relevé supprimé");
      });
    };
  }

  function startTour() {
    var tourL = allLieux().filter(function (x) { return x.tour; }).sort(function (a, b) { return a.tour - b.tour; });
    V.tour = 0; V.editId = null; V.lieu = tourL[0].code; V.screen = "form"; render();
    toast("Tournée : extérieur → communs → locaux techniques. Noter l'état trouvé avant d'agir.");
  }

  /* -------------------- lieu personnalisé -------------------- */
  function addLieuSheet() {
    openSheet('<h3>Nouveau lieu</h3><div class="sub">Code court, libellé, Ēm requis et cible nuit (lx, 0 = éteint, vide = sans cible).</div>' +
      '<input id="nlCode" type="text" placeholder="Code (ex. EXT-PONTON)" style="text-transform:uppercase">' +
      '<input id="nlLbl" type="text" placeholder="Libellé">' +
      '<input id="nlEm" type="text" inputmode="decimal" placeholder="Ēm requis (lx)">' +
      '<input id="nlNuit" type="text" inputmode="decimal" placeholder="Cible nuit (lx)">' +
      '<div class="sbtns"><button class="sbtn-cancel" id="nlCancel">Annuler</button><button class="sbtn-ok" id="nlOk">Ajouter</button></div>');
    $("nlCancel").onclick = closeSheet;
    $("nlOk").onclick = function () {
      var code = ($("nlCode").value || "").trim().toUpperCase(), lbl = ($("nlLbl").value || "").trim();
      if (!code) { $("nlCode").focus(); return; }
      if (lieuBy(code)) { toast("Ce code existe déjà"); return; }
      var L = ensureL(); var c = L._lieux || { list: [] }; c.list = c.list || [];
      c.list.push({ code: code, label: lbl || code, grp: "Autres lieux", ord: 90 + c.list.length, em: num($("nlEm").value), emin: null, uo: null,
        nuit: num($("nlNuit").value), plan: "sol", zone: null, src: "Valeur saisie sur le terrain (hors référentiel)." });
      L._lieux = c; touch("lux:_lieux"); closeSheet(); render(); toast("Lieu ajouté : " + code);
    };
  }

  /* -------------------- export xlsx -------------------- */
  function exportXlsx() {
    var rows = allRows();
    if (!rows.length) { toast("Aucun relevé à exporter"); return; }
    if (typeof XLSX === "undefined") { toast("Librairie xlsx non chargée (ouvrir avec du réseau une fois)"); return; }
    var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    var wb = XLSX.utils.book_new();

    var aoa = [["Date", "Heure", "Jour", "Créneau", "Lieu", "Libellé", "Précision", "Pièce inventaire", "État éclairage", "Plan", "Hauteur (m)",
      "E1", "E2", "E3", "E4", "E5", "n", "Ēm (lx)", "Emin (lx)", "Emax (lx)", "Uo",
      "Ēm requis (lx)", "Emin requis", "Uo requis", "Cible nuit (lx)", "Ratio Ēm/requis", "Verdict", "Nuit", "Action",
      "Luminaires allumés", "P allumée (W)", "Surface (m²)", "W/m²", "W/m²/100lx", "Source", "Commande", "Appareil", "Opérateur", "Observations", "Référence"]];
    rows.forEach(function (r) {
      var p = lieuBy(r.lieu) || {}, c = calc(r), v = verdict(r), d = densite(r);
      aoa.push([r.date, r.heure, JOURS[new Date(r.date + "T12:00:00").getDay()], creneauLabel(r.creneau), r.lieu, p.label || "", r.libelle || "", roomLabel(r.room),
        (ETATS.filter(function (e) { return e.key === r.etat; })[0] || {}).label || r.etat, PLANS[r.plan] || r.plan, num(r.hplan),
        num(r.e1), num(r.e2), num(r.e3), num(r.e4), num(r.e5), c.n, rnd(c.em, 1), rnd(c.emin, 1), rnd(c.emax, 1), rnd(c.uo, 2),
        p.em, p.emin, p.uo, p.nuit, (p.em && c.em != null) ? rnd(c.em / p.em, 2) : null, v.txt, v.night || "", v.action || "",
        num(r.nlum), num(r.pw), num(r.surf), rnd(d.wm2, 2), rnd(d.wm2_100, 2),
        (SOURCES.filter(function (e) { return e.key === r.source; })[0] || {}).label || "", (COMMANDES.filter(function (e) { return e.key === r.cmd; })[0] || {}).label || "",
        r.appareil || "", r.op || "", r.obs || "", p.src || ""]);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = aoa[0].map(function (h) { return { wch: Math.max(9, Math.min(40, String(h).length + 2)) }; });
    XLSX.utils.book_append_sheet(wb, ws, "Relevés");

    /* synthèse par lieu */
    var aoa2 = [["Lieu", "Libellé", "Groupe", "Relevés", "Ēm moyen relevé (lx)", "Ēm requis (lx)", "Ratio", "Cible nuit (lx)", "Ēm relevé la nuit (lx)", "Diagnostic", "Action proposée"]];
    allLieux().forEach(function (p) {
      var rs = rowsOf(p.code).filter(function (r) { return r.etat !== "off"; });
      if (!rs.length) return;
      var ems = rs.map(function (r) { return calc(r).em; }).filter(function (x) { return x != null; });
      var em = ems.length ? ems.reduce(function (s, x) { return s + x; }, 0) / ems.length : null;
      var rn = rs.filter(function (r) { return isNightKey(r.creneau) && r.etat !== "on"; });
      var emsN = rn.map(function (r) { return calc(r).em; }).filter(function (x) { return x != null; });
      var emN = emsN.length ? emsN.reduce(function (s, x) { return s + x; }, 0) / emsN.length : null;
      var diag = [], act = [];
      rs.forEach(function (r) { var v = verdict(r); if (v.night && diag.indexOf(v.night) < 0) diag.push(v.night); if (v.action && act.indexOf(v.action) < 0) act.push(v.action); });
      var last = verdict(rs[rs.length - 1]);
      if (!diag.length) diag.push(last.txt);
      aoa2.push([p.code, p.label, p.grp, rs.length, rnd(em, 1), p.em, (p.em && em != null) ? rnd(em / p.em, 2) : null, p.nuit, rnd(emN, 1), diag.join(" ; "), act.join(" ; ")]);
    });
    var ws2 = XLSX.utils.aoa_to_sheet(aoa2);
    ws2["!cols"] = [{ wch: 14 }, { wch: 44 }, { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 34 }, { wch: 44 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Synthèse par lieu");

    /* référentiel */
    var aoa3 = [["Code", "Lieu", "Groupe", "Ēm requis (lx)", "Emin (lx)", "Uo", "Cible nuit (lx)", "Plan de mesure", "Source / justification"]];
    allLieux().forEach(function (p) { aoa3.push([p.code, p.label, p.grp, p.em, p.emin, p.uo, p.nuit, PLANS[p.plan] || p.plan, p.src]); });
    var ws3 = XLSX.utils.aoa_to_sheet(aoa3);
    ws3["!cols"] = [{ wch: 14 }, { wch: 44 }, { wch: 30 }, { wch: 10 }, { wch: 8 }, { wch: 6 }, { wch: 10 }, { wch: 34 }, { wch: 90 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Référentiel");

    XLSX.writeFile(wb, "WADRA_Bay_Eclairement_" + nowDate() + ".xlsx");
    toast("Export éclairement téléchargé (" + rows.length + " relevés)");
  }

  /* -------------------- rendu principal -------------------- */
  function render() {
    ensureL(); window.scrollTo(0, 0);
    if (V.screen === "form") renderForm();
    else if (V.screen === "lieu") renderLieu();
    else renderDash();
  }

  window.LUX = {
    render: render, back: back,
    count: function () { return allRows().length; },
    lastLabel: function () {
      var rs = allRows(); if (!rs.length) return null;
      var r = rs[rs.length - 1];
      return r.lieu + " · " + r.date.slice(8) + "/" + r.date.slice(5, 7) + " " + r.heure;
    },
    gisements: function () { return allRows().filter(function (r) { return verdict(r).cls === "high"; }).length; }
  };
})();
