/* =====================================================================
   WADRA Bay — Module MAINTENANCE par lieu (chambres, bungalows et tous les bâtiments)
   ---------------------------------------------------------------------
   Pensé pour le technicien : une clé = un écran, une liste de points à
   cocher (OK / à surveiller / HS), une liste de travaux à faire que l'on
   coche quand c'est réglé, des photos. Tout est daté et signé, et
   l'historique se construit tout seul.
   - 50 clés : villas Plage 101-105, bungalows Forêt 201-204,
     chambres 301-322 (bâtiments N et O), bungalows Lagune 401-419 ;
   - + tous les autres lieux de l'hôtel (accueil, restaurant, bar, cuisine,
     Sea Food, spa, salle polyvalente, administration, lingerie, atelier,
     TGBT / groupe, piscine, lagunarium, STEP, WC, extérieurs, buanderies,
     ascenseurs, logements du personnel, locaux techniques) ;
   - point de départ : le rapport de JC ALIKIE du 22 mars 2026 (seed) ;
   - « À faire » global regroupé par clé, export xlsx (état, travaux, historique) ;
   - passerelle avec l'inventaire (data.js / arbre TREE) : chaque lieu est
     relié aux pièces de l'inventaire qui s'y trouvent ; l'écran du lieu
     liste les équipements recensés (marque, modèle, état de maintenance)
     et permet d'ouvrir une intervention dessus ; l'inventaire renvoie
     vers le lieu (liens par défaut + liens ajoutés par le technicien,
     champs rooms / roomsOff du lieu, synchronisés) ;
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
               items: ["clim", "pac", "tv", "wifi", "brasseur", "ecl_int", "ecl_ext", "plomb", "fplafond", "deck", "divers"] },
    /* ---- lieux communs et techniques ---- */
    accueil: { label: "Accueil",            color: "#8e44ad", items: ["clim", "ecl_int", "ecl_ext", "elec", "wifi", "ecran", "menuis", "sanit", "secu", "divers"] },
    resto:   { label: "Salle restaurant",   color: "#8e44ad", items: ["clim", "brasseur", "ecl_int", "ecl_ext", "elec", "sono", "menuis", "mobilier", "sanit", "secu", "divers"] },
    bar:     { label: "Bar",                color: "#8e44ad", items: ["froid", "glacons", "ecl_int", "elec", "plomb", "menuis", "divers"] },
    cuisine: { label: "Cuisine",            color: "#c0392b", items: ["froid", "congel", "cuisson", "hotte", "lavevaisselle", "ecs", "plomb", "ecl_int", "elec", "evac", "secu", "divers"] },
    seafood: { label: "Sea Food",           color: "#8e44ad", items: ["clim", "froid", "cuisson", "hotte", "ecl_int", "ecl_ext", "elec", "plomb", "deck", "menuis", "divers"] },
    bienetre:{ label: "Spa / fitness",      color: "#d4a017", items: ["clim", "ventil", "ecl_int", "elec", "plomb", "appareils", "menuis", "divers"] },
    salle:   { label: "Salle polyvalente",  color: "#8e44ad", items: ["clim", "ecl_int", "ecl_ext", "elec", "sono", "menuis", "sanit", "divers"] },
    admin:   { label: "Administration",     color: "#8e44ad", items: ["clim", "ecl_int", "elec", "reseau", "menuis", "sanit", "divers"] },
    lingerie:{ label: "Lingerie / laverie", color: "#5d6d7e", items: ["lavelinge", "sechelinge", "calandre", "pac", "ventil", "ecl_int", "elec", "plomb", "divers"] },
    atelier: { label: "Atelier",            color: "#5d6d7e", items: ["ecl_int", "elec", "outillage", "rangement", "divers"] },
    tgbt:    { label: "TGBT / groupe électrogène", color: "#5d6d7e", items: ["groupe", "gasoil", "tgbt", "condens", "ventil", "ecl_int", "divers"] },
    piscine: { label: "Piscine",            color: "#1f7a8c", items: ["filtration", "traitement", "horloge", "ecl_bassin", "plomb", "local", "divers"] },
    lagun:   { label: "Lagunarium",         color: "#1f7a8c", items: ["pompes", "canal", "sondes", "ventil", "ecl_int", "elec", "divers"] },
    pomp:    { label: "Pomperie / défense incendie", color: "#1f7a8c", items: ["pompes", "tableau", "alarme", "plomb", "ecl_int", "divers"] },
    sg:      { label: "Services généraux",  color: "#5d6d7e", items: ["clim", "ventil", "sanit", "sechemains", "ecl_int", "ecl_ext", "elec", "divers"] },
    step:    { label: "Station d'épuration (STEP)", color: "#5d6d7e", items: ["pompes", "aerateur", "degrilleur", "alarme", "ecl_int", "elec", "divers"] },
    wc:      { label: "WC publics",         color: "#7f8c8d", items: ["cuvettes", "lavabos", "sechemains", "ventil", "ecl_int", "portes", "divers"] },
    ext:     { label: "Extérieurs",         color: "#2e7d32", items: ["ecl_allees", "bornes", "arrosage", "allees", "signal", "portail", "divers"] },
    buand:   { label: "Buanderie d'étage",  color: "#5d6d7e", items: ["lavelinge", "sechelinge", "ecl_int", "elec", "plomb", "divers"] },
    asc:     { label: "Ascenseur",          color: "#5d6d7e", items: ["ascenseur", "alarme", "ecl_int", "divers"] },
    logt:    { label: "Logement du personnel", color: "#2e7d32", items: ["clim", "ecs", "ecl_int", "elec", "plomb", "cuisinette", "menuis", "divers"] },
    lt:      { label: "Local technique",    color: "#5d6d7e", items: ["tableau", "ventil", "ecl_int", "acces", "divers"] }
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
    divers:     { label: "Autre point",                ic: "📝", hint: "coffre, mini-bar, porte, serrure…" },
    /* lieux communs */
    elec:       { label: "Électricité (prises, tableau)", ic: "🔌", hint: "prise HS, disjoncteur qui saute…" },
    ecran:      { label: "Écran / TV",                 ic: "📺", hint: "" },
    sono:       { label: "Sono / écran / micro",       ic: "🔊", hint: "" },
    reseau:     { label: "Réseau / wifi / imprimante", ic: "📶", hint: "" },
    menuis:     { label: "Portes, serrures, vitrages", ic: "🚪", hint: "ferme-porte, gond, vitre…" },
    mobilier:   { label: "Mobilier",                   ic: "🪑", hint: "" },
    sanit:      { label: "Sanitaires",                 ic: "🚻", hint: "chasse, robinet, évacuation…" },
    secu:       { label: "Sécurité (BAES, extincteurs, alarme)", ic: "🧯", hint: "" },
    froid:      { label: "Froid (frigos, chambres froides)", ic: "🧊", hint: "température, givre, joint, compresseur…" },
    congel:     { label: "Congélateurs",               ic: "🧊", hint: "température, alarme…" },
    glacons:    { label: "Machine à glaçons",          ic: "🧊", hint: "" },
    cuisson:    { label: "Cuisson (fours, plaques, friteuse)", ic: "🔥", hint: "" },
    hotte:      { label: "Hotte / extraction",         ic: "🌬️", hint: "filtres, moteur, bruit…" },
    lavevaisselle: { label: "Lave-vaisselle",          ic: "🍽️", hint: "" },
    ecs:        { label: "Eau chaude (ballons)",       ic: "♨️", hint: "" },
    evac:       { label: "Sols / évacuations / bac à graisse", ic: "🕳️", hint: "" },
    ventil:     { label: "Ventilation / VMC",          ic: "🌬️", hint: "" },
    appareils:  { label: "Appareils (fitness, cabines)", ic: "🏋️", hint: "" },
    lavelinge:  { label: "Lave-linge",                 ic: "🫧", hint: "" },
    sechelinge: { label: "Sèche-linge",                ic: "🫧", hint: "" },
    calandre:   { label: "Calandreuse",                ic: "🫧", hint: "" },
    outillage:  { label: "Outillage",                  ic: "🧰", hint: "" },
    rangement:  { label: "Rangement / propreté",       ic: "🧹", hint: "" },
    groupe:     { label: "Groupe électrogène (essai)", ic: "⚙️", hint: "démarrage, heures compteur…" },
    gasoil:     { label: "Niveau gasoil",              ic: "⛽", hint: "" },
    tgbt:       { label: "TGBT (disjoncteurs, voyants)", ic: "⚡", hint: "" },
    condens:    { label: "Batterie de condensateurs",  ic: "⚡", hint: "" },
    filtration: { label: "Filtration (pompe, filtre)", ic: "💧", hint: "pression, bruit, fuite…" },
    traitement: { label: "Traitement de l'eau (chlore, pH)", ic: "🧪", hint: "" },
    horloge:    { label: "Horloge de filtration",      ic: "⏰", hint: "plages horaires" },
    ecl_bassin: { label: "Éclairage du bassin",        ic: "💡", hint: "" },
    local:      { label: "Local technique",            ic: "🏚️", hint: "" },
    pompes:     { label: "Pompes",                     ic: "💧", hint: "bruit, fuite, débit…" },
    canal:      { label: "Canalisations / vannes",     ic: "🔧", hint: "" },
    sondes:     { label: "Sondes / capteurs",          ic: "🌡️", hint: "" },
    aerateur:   { label: "Aérateur / surpresseur",     ic: "🌬️", hint: "" },
    degrilleur: { label: "Dégrilleur / prétraitement", ic: "🧹", hint: "" },
    alarme:     { label: "Alarme / téléalarme",        ic: "🚨", hint: "" },
    cuvettes:   { label: "Cuvettes / chasses d'eau",   ic: "🚽", hint: "" },
    lavabos:    { label: "Lavabos / robinets",         ic: "🚰", hint: "" },
    sechemains: { label: "Sèche-mains / distributeurs", ic: "🧴", hint: "" },
    portes:     { label: "Portes / verrous",           ic: "🚪", hint: "" },
    ecl_allees: { label: "Éclairage des allées",       ic: "🔦", hint: "" },
    bornes:     { label: "Bornes / prises extérieures", ic: "🔌", hint: "" },
    arrosage:   { label: "Arrosage",                   ic: "💦", hint: "" },
    allees:     { label: "Allées / decks / passerelles", ic: "🪵", hint: "" },
    signal:     { label: "Signalétique",               ic: "🪧", hint: "" },
    portail:    { label: "Portail / accès / parking",  ic: "🚗", hint: "" },
    ascenseur:  { label: "Ascenseur (fonctionnement)", ic: "🛗", hint: "" },
    cuisinette: { label: "Cuisinette",                 ic: "🍳", hint: "" },
    tableau:    { label: "Tableau électrique (TD)",    ic: "⚡", hint: "" },
    acces:      { label: "Accès / propreté / fuites",  ic: "🧹", hint: "" }
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
  /* lieux communs : nom complet sur la tuile */
  function place(id, type, name, grp) { KEYS.push({ id: id, type: type, grp: grp, name: name, wide: true }); }
  var G1 = "Accueil, restaurant, bar", G2 = "Cuisine, Sea Food, bien-être", G3 = "Bâtiments techniques et personnel", G4 = "WC publics et extérieurs";
  place("ACC",   "accueil",  "Accueil / réception",      G1);
  place("REST",  "resto",    "Salle restaurant",         G1);
  place("BAR",   "bar",      "Bar",                      G1);
  place("SPOLY", "salle",    "Salle polyvalente",        G1);
  place("ADM",   "admin",    "Administration / bureaux", G1);
  place("CUIS",  "cuisine",  "Cuisine",                  G2);
  place("SEAF",  "seafood",  "Sea Food",                 G2);
  place("SPA",   "bienetre", "Spa",                      G2);
  place("FIT",   "bienetre", "Salle de fitness",         G2);
  place("PISC",  "piscine",  "Piscine + local technique", G2);
  place("LING",  "lingerie", "Lingerie / laverie",       G3);
  place("SG",    "sg",       "Services généraux bât. I (bureau gouvernante, vestiaires)", G3);
  place("ATEL",  "atelier",  "Atelier",                  G3);
  place("TGBT",  "tgbt",     "TGBT / groupe électrogène", G3);
  place("LAGU",  "lagun",    "Lagunarium",               G3);
  place("POMP",  "pomp",     "Pomperie / défense incendie", G3);
  place("STEP",  "step",     "Station d'épuration",      G3);
  place("LT1",   "lt",       "Local technique LT1 (Lagune)", G3);
  place("LT4",   "lt",       "Local technique LT4 (Plage / Forêt / chambres)", G3);
  place("LT6",   "lt",       "Local technique LT6 (Lagune)", G3);
  place("LT7",   "lt",       "Local technique LT7 (logements)", G3);
  place("BU-N",  "buand",    "Buanderie d'étage N",      G3);
  place("BU-O",  "buand",    "Buanderie d'étage O",      G3);
  place("ASC-N", "asc",      "Ascenseur bâtiment N",     G3);
  place("ASC-O", "asc",      "Ascenseur bâtiment O",     G3);
  place("LOG-F1","logt",     "Logement F1",              G3);
  place("LOG-F2","logt",     "Logement F2",              G3);
  place("LOG-F4","logt",     "Logement F4",              G3);
  place("WC-ACC","wc",       "WC accueil",               G4);
  place("WC-REST","wc",      "WC restaurant",            G4);
  place("WC-PL", "wc",       "WC plage / piscine",       G4);
  place("WC-SP", "wc",       "WC salle polyvalente",     G4);
  place("EXT",   "ext",      "Allées, éclairage extérieur, arrosage", G4);
  place("PARK",  "ext",      "Entrée, portail, parking", G4);
  /* ---- passerelle inventaire : pièces de l'inventaire (data.js) présentes dans chaque lieu ---- */
  var INV_BY_TYPE = {
    plage:   ["z_lt4_r8", "z_lt4_r9", "z_lt4_r10", "z_lt4_r11"],
    foret:   ["z_lt4_r21", "z_lt4_r22", "z_lt4_r23", "z_lt4_r24"],
    chambre: ["z_lt4_r16", "z_lt4_r17", "z_lt4_r18", "z_lt4_r20"],
    lagune:  ["z_lt1_r22", "z_lt1_r23", "z_lt1_r24", "z_lt1_r25"]
  };
  var INV_BY_ID = {
    ACC: ["z_c_r2"], REST: ["z_c_r20"], BAR: ["z_c_r19"], SPOLY: ["z_sp_r1", "z_sp_r4", "z_sp_r5"], ADM: ["z_c_r3", "z_c_r4", "z_c_r5"],
    CUIS: ["z_c_r11", "z_c_r17", "z_c_r12", "z_c_r13", "z_c_r16", "z_c_r18", "z_c_r14", "z_c_r15", "z_c_r6", "z_c_r9", "z_c_r10", "z_c_r7", "z_c_r8"],
    SEAF: ["z_lt1_r15", "z_lt1_r12", "z_lt1_r13", "z_lt1_r14"], SPA: ["z_lt1_r17", "z_lt1_r16", "z_lt1_r19", "z_lt1_r18"], FIT: ["z_lt1_r20", "z_lt1_r19", "z_lt1_r18"],
    PISC: ["z_c_r1"], LING: ["z_sg_r4", "z_sg_r7", "z_sg_r6", "z_sg_r5", "z_sg_r8", "z_lt1_r26", "z_lt1_r11", "z_lt6_r6"],
    SG: ["z_sg_r2", "z_sg_r1", "z_sg_r3", "z_sg_r9", "z_sg_r10", "z_sg_r11", "z_sg_r12"],
    ATEL: ["z_atelier_r1"], TGBT: ["z_tgbt_r4", "z_tgbt_r1", "z_tgbt_r3", "z_tgbt_r2"], LAGU: ["z_sp_r2", "z_sp_r3"],
    POMP: ["z_pomperie_r3", "z_pomperie_r1", "z_pomperie_r2"], STEP: ["z_step_r5", "z_step_r1", "z_step_r2", "z_step_r4", "z_step_r3"],
    LT1: ["z_lt1_r21", "z_lt1_r1", "z_lt1_r6"], LT4: ["z_lt4_r12", "z_lt4_r7"], LT6: ["z_lt6_r1"], LT7: ["z_lt7_r4"],
    "BU-N": ["z_lt4_r13"], "BU-O": ["z_lt4_r14"], "ASC-N": ["z_lt4_r15"], "ASC-O": ["z_lt4_r15"],
    "LOG-F1": ["z_lt7_r2", "z_lt7_r3", "z_lt7_r1"], "LOG-F2": ["z_lt7_r2", "z_lt7_r3", "z_lt7_r1"], "LOG-F4": ["z_lt7_r2", "z_lt7_r3", "z_lt7_r1"],
    "WC-ACC": ["z_c_r21"], "WC-REST": ["z_c_r21"], "WC-PL": [], "WC-SP": ["z_sp_r8", "z_sp_r6", "z_sp_r7", "z_sp_r9"],
    EXT: ["z_c_r26", "z_c_r25", "z_c_r23"], PARK: ["z_c_r22", "z_c_r24"]
  };
  function defaultRooms(id) { var k = keyInfo(id); if (!k) return []; return (INV_BY_ID[id] || (k.type ? INV_BY_TYPE[k.type] : null) || []).slice(); }
  function roomsFor(id) { /* liens par défaut + liens ajoutés − liens retirés */
    var r = rec(id) || {}, out = [], off = r.roomsOff || [];
    defaultRooms(id).concat(r.rooms || []).forEach(function (rid) { if (out.indexOf(rid) < 0 && off.indexOf(rid) < 0) out.push(rid); });
    return out;
  }
  function treeRooms() { /* toutes les pièces de l'inventaire (arbre effectif) */
    try { if (typeof rebuildTree === "function") rebuildTree(); } catch (e) {}
    var out = [], idx = {};
    var T = (typeof TREE !== "undefined" && TREE) ? TREE : (window.TREE || []);
    T.forEach(function (z) { z.rooms.forEach(function (rm) { var o = { id: rm.id, name: rm.name, zone: z.name, zoneId: z.id, equipment: rm.equipment }; out.push(o); idx[rm.id] = o; }); });
    return { list: out, idx: idx };
  }
  function invRooms(id) { var tr = treeRooms(); return roomsFor(id).map(function (rid) { return tr.idx[rid]; }).filter(function (x) { return !!x; }); }
  function invEquipIds(id) { var ids = []; invRooms(id).forEach(function (rm) { rm.equipment.forEach(function (e) { ids.push(e.id); }); }); return ids; }
  function placesForRoom(rid) { /* lieux de maintenance auxquels une pièce de l'inventaire est rattachée */
    var out = [], typesDone = {};
    KEYS.forEach(function (k) {
      if (roomsFor(k.id).indexOf(rid) < 0) return;
      var r = rec(k.id) || {};
      var byType = !k.wide && !INV_BY_ID[k.id] && (r.rooms || []).indexOf(rid) < 0 && (INV_BY_TYPE[k.type] || []).indexOf(rid) >= 0;
      if (byType) { if (!typesDone[k.type]) { typesDone[k.type] = 1; out.push({ id: null, type: k.type, label: k.grp }); } }
      else out.push({ id: k.id, label: keyLabel(k.id) });
    });
    return out;
  }
  function interFor(id) { /* interventions du lieu : rattachées au lieu, ou à un de ses équipements recensés */
    if (!window.MAINT || !MAINT.all) return [];
    var eq = invEquipIds(id);
    return MAINT.all().filter(function (r) { return r.hebg === id || (r.equip && eq.indexOf(r.equip) >= 0); });
  }
  var GROUPS = [];
  KEYS.forEach(function (k) { if (GROUPS.indexOf(k.grp) < 0) GROUPS.push(k.grp); });
  function keyInfo(id) { return KEYS.filter(function (k) { return k.id === id; })[0] || null; }
  function keyLabel(id) { var k = keyInfo(id); if (!k) return "Lieu " + id; return k.name ? k.name : (TYPES[k.type].label + " " + id); }
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
    if (V.screen === "key") { V.screen = "grid"; V.id = null; V.showEq = false; render(); return true; }
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
      '<div style="font-size:19px;font-weight:800">🛠️ Maintenance — interventions &amp; pannes</div>' +
      '<div style="font-size:12.5px;opacity:.92;margin-top:3px">Un lieu = un écran : chambres, bungalows et tous les bâtiments. Coche OK / ⚠ / HS, note les travaux, coche quand c\'est fait.' +
      (lastDate ? " Dernier passage : " + frDate(lastDate) : "") + '</div>' +
      '<div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap">' +
      stat(nHs, "points HS", "#ffb3a7") + stat(nAtt, "à surveiller", "#ffd9a8") + stat(nTodo, "travaux à faire", "#fff") +
      stat(Object.keys(nKeysPb).length + " / " + KEYS.length, "lieux avec un point", "#fff") +
      '</div></div>';

    html += '<button class="btn primary" id="hTodo" style="background:#c0392b">📋 Tout ce qu\'il reste à faire (' + iss.length + ')</button>';

    html += '<div class="panel" style="margin-top:12px"><h2>Rechercher</h2>' +
      '<input type="text" id="hSearch" placeholder="N° de clé, lieu, clim, décodeur, douche…" value="' + esc(V.q) + '" ' +
      'style="width:100%;border:1.4px solid #d6dbde;border-radius:9px;padding:9px 10px;background:#fafbfb"></div>';

    html += '<div id="hGrid"></div>';

    html += '<div class="panel"><h2>Légende</h2><div class="small" style="display:flex;gap:8px;flex-wrap:wrap">' +
      chip("ok", "OK : tout fonctionne") + chip("att", "⚠ : point à surveiller ou travaux en attente") + chip("hs", "HS : au moins un équipement en panne") + chip("na", "? : lieu non visité") +
      '</div></div>';

    html += '<div class="panel"><h2>Export</h2>' +
      '<button class="btn sec" id="hExp">⬇️ État des lieux + travaux + historique (xlsx)</button></div>';

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
      var wide = !!ks[0].wide;
      h += '<div class="panel" style="padding:12px 12px 8px"><h2 style="color:' + t.color + '">' + esc(g) + '</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + (wide ? "150px" : "62px") + ',1fr));gap:7px">';
      ks.forEach(function (k) {
        var st = keyStatus(k.id), s = STATES[st], n = issues(k.id).length;
        var lab = (st === "na" ? "non visité" : (n ? n + " point" + (n > 1 ? "s" : "") : "OK"));
        h += '<div class="hk" data-k="' + k.id + '" style="border-radius:10px;padding:9px ' + (wide ? "8px" : "4px") + ';text-align:' + (wide ? "left" : "center") + ';cursor:pointer;background:' + s.bg +
          ';border:1.6px solid ' + s.color + ';color:' + s.color + '">' +
          (wide ? '<div style="font-size:13.5px;font-weight:800;color:#1a2025;line-height:1.2">' + esc(k.name) + '</div>' +
                  '<div style="font-size:10.5px;font-weight:800;margin-top:2px">' + lab + '</div>'
                : '<div style="font-size:17px;font-weight:800;color:#1a2025">' + k.id + '</div>' +
                  '<div style="font-size:10.5px;font-weight:800">' + lab + '</div>') + '</div>';
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
      '<div class="tiny muted">Regroupé par lieu. Touche une ligne pour la régler (réparé / fait) ou ouvrir le lieu.</div>' +
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
      { label: "🏠 Ouvrir " + keyLabel(k), cb: function () { V.screen = "key"; V.id = k; render(); } }
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
      { label: "🏠 Ouvrir " + keyLabel(k), cb: function () { V.screen = "key"; V.id = k; render(); } }
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
      '<div style="font-size:' + (k.wide ? "22px" : "30px") + ';font-weight:800">' + (k.wide ? "🏢" : id) + '</div>' +
      '<div style="flex:1"><div style="font-size:15px;font-weight:800">' + esc(k.wide ? k.name : t.label) + '</div>' +
      '<div style="font-size:12px;opacity:.9">' + (r.date ? "Dernier passage : " + frDate(r.date) + (r.by ? " · " + esc(r.by) : "") : "Jamais visité") + '</div></div>' +
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

    /* équipements de l'inventaire présents dans ce lieu */
    var rooms = invRooms(id), nEq = 0;
    rooms.forEach(function (rm) { nEq += rm.equipment.length; });
    var showAll = V.showEq || nEq <= 14;
    html += '<div class="panel" style="padding:12px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '<h2 style="margin:0;flex:1">📋 Équipements recensés (' + nEq + ')</h2>' +
      '<button class="btn sec" id="hLinkRoom" style="width:auto;padding:6px 10px;margin:0;font-size:12px">🔗 Lier une pièce</button></div>' +
      '<div class="tiny muted" style="margin-bottom:6px">Inventaire électrique de l\'hôtel : touche un équipement pour sa fiche, 🔧 pour une intervention.</div>';
    if (!rooms.length) html += '<div class="tiny muted">Aucune pièce de l\'inventaire n\'est reliée à ce lieu — « Lier une pièce » pour choisir.</div>';
    if (showAll) rooms.forEach(function (rm) {
      html += '<div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding-top:6px;border-top:1px solid #eef1f2">' +
        '<div style="flex:1;font-size:11.5px;font-weight:800;color:#6b7785;text-transform:uppercase;letter-spacing:.03em">' + esc(rm.zone) + ' · ' + esc(rm.name) + '</div>' +
        '<button class="hRoomAct" data-rid="' + esc(rm.id) + '" style="border:0;background:transparent;color:#8895a3;font-size:16px;padding:0 4px">⋯</button></div>';
      if (!rm.equipment.length) html += '<div class="tiny muted">Pièce vide dans l\'inventaire.</div>';
      rm.equipment.forEach(function (e) {
        var f = (state.equip && state.equip[e.id]) || {};
        var hm = window.MAINT ? MAINT.health(e.id) : null;
        var col = hm === "panne" ? "#c0392b" : hm === "degrade" ? "#e0892a" : hm === "ok" ? "#1a9d5a" : "#c3cad0";
        var mm = [(f.marque || e.marque || ""), (f.modele || e.modele || "")].filter(function (x) { return x; }).join(" ");
        var nOpen = window.MAINT ? MAINT.forEquip(e.id).filter(MAINT.isOpen).length : 0;
        html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0 6px 8px;border-left:4px solid ' + col + ';margin-top:4px">' +
          '<div class="hEq" data-eid="' + esc(e.id) + '" data-rid="' + esc(rm.id) + '" data-zid="' + esc(rm.zoneId) + '" style="flex:1;min-width:0;cursor:pointer">' +
          '<div style="font-weight:700;font-size:13.5px;line-height:1.25">' + esc(e.name) + (e.qte && +e.qte > 1 ? ' <span style="color:#0d7a6f;font-weight:800">×' + esc(e.qte) + '</span>' : '') +
          (hm && hm !== "ok" ? ' <span style="color:' + col + ';font-weight:800;font-size:11px">' + MAINT.healthLabel(hm) + '</span>' : '') + '</div>' +
          '<div class="tiny muted">' + esc(mm || (f.local || "")) + (nOpen ? (mm || f.local ? " · " : "") + nOpen + ' intervention(s) ouverte(s)' : '') + '</div></div>' +
          '<button class="hEqInter" data-eid="' + esc(e.id) + '" title="Nouvelle intervention" style="border:1.4px solid #d6dbde;background:#fafbfb;border-radius:8px;padding:5px 8px;font-size:15px">🔧</button></div>';
      });
    });
    else html += '<button class="btn sec" id="hShowEq" style="margin-top:8px">Afficher les ' + nEq + ' équipements (' + rooms.length + ' pièces)</button>';
    html += '</div>';

    /* interventions rattachées au lieu ou à ses équipements */
    var its = interFor(id).slice().sort(function (a, b) { return (a.date + (a.heure || "")) < (b.date + (b.heure || "")) ? 1 : -1; });
    var itsOpen = its.filter(function (x) { return MAINT.isOpen(x); });
    html += '<div class="panel" style="padding:12px"><h2>🔧 Interventions (' + itsOpen.length + ' ouverte' + (itsOpen.length > 1 ? 's' : '') + ' / ' + its.length + ')</h2>';
    if (!its.length) html += '<div class="tiny muted">Aucune intervention enregistrée sur ce lieu ni sur ses équipements.</div>';
    itsOpen.concat(its.filter(function (x) { return !MAINT.isOpen(x); })).slice(0, 6).forEach(function (it) {
      var s = MAINT.statutInfo(it);
      html += '<div class="hIt" data-iid="' + esc(it._id) + '" style="padding:7px 0;border-top:1px solid #eef1f2;cursor:pointer">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;font-size:13.5px"><b>' + MAINT.frDate(it.date) + ' · ' + esc(MAINT.natLabel(it)) + '</b>' +
        '<span style="color:' + s.color + ';font-weight:800;font-size:11.5px;white-space:nowrap">' + esc(s.label.split(" — ")[0].split(" (")[0]) + '</span></div>' +
        '<div class="tiny muted">' + esc(it.equipTxt || "") + (it.sympt || it.action ? (it.equipTxt ? " — " : "") + esc((it.sympt || it.action).slice(0, 70)) : "") + (it.tech ? ' · ' + esc(it.tech) : '') + '</div></div>';
    });
    if (its.length > 6) html += '<div class="tiny muted" style="margin-top:4px">… et ' + (its.length - 6) + ' autre(s) dans le registre des interventions.</div>';
    html += '<button class="btn sec" id="hNewInter" style="margin-top:8px">＋ Nouvelle intervention sur ce lieu</button></div>';

    /* travaux à faire */
    var open = openTodos(r), done = r.todos.filter(function (x) { return x.done; });
    html += '<div class="panel" style="padding:12px"><h2>Travaux à faire (' + open.length + ')</h2>';
    if (!open.length) html += '<div class="tiny muted">Rien en attente ici.</div>';
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
    html += '<div class="panel"><label class="fld"><span>Observations</span>' +
      '<textarea id="hObs" placeholder="remarques générales, à surveiller…">' + esc(r.obs || "") + '</textarea></label>' +
      '<h2>📷 Photos (' + ph.length + ')</h2><div class="photos" id="hPh"></div></div>';

    html += '<button class="btn primary" id="hSave" style="background:' + t.color + '">💾 Enregistrer le passage (' + frDate(nowDate()) + ')</button>';
    html += '<button class="btn sec" id="hHist" style="margin-top:9px">🕘 Historique (' + (r.hist || []).length + ')</button>' +
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
    /* passerelle inventaire */
    if ($("hShowEq")) $("hShowEq").onclick = function () { V.showEq = true; render(); };
    document.querySelectorAll(".hEq").forEach(function (el) {
      el.onclick = function () { view.tdId = el.dataset.zid; view.roomId = el.dataset.rid; view.equipId = el.dataset.eid; view.fromKey = id; nav("equip"); };
    });
    document.querySelectorAll(".hEqInter").forEach(function (b2) {
      b2.onclick = function (ev) { ev.stopPropagation(); if (!window.MAINT) return; MAINT.openForEquipKey(b2.dataset.eid, id); };
    });
    document.querySelectorAll(".hRoomAct").forEach(function (b2) {
      b2.onclick = function () {
        var rid2 = b2.dataset.rid, tr = treeRooms(), rm = tr.idx[rid2];
        sheetActions(rm ? (rm.zone + " · " + rm.name) : rid2, [
          { label: "📋 Ouvrir la pièce dans l'inventaire", cb: function () { view.tdId = rm.zoneId; view.roomId = rid2; view.fromKey = id; nav("room"); } },
          { label: "✕ Retirer ce lien (la pièce n'est pas dans ce lieu)", danger: true, cb: function () {
            r.rooms = (r.rooms || []).filter(function (x) { return x !== rid2; });
            r.roomsOff = r.roomsOff || []; if (r.roomsOff.indexOf(rid2) < 0) r.roomsOff.push(rid2);
            pushHist(r, "Lien inventaire retiré : " + (rm ? rm.name : rid2), who()); touch("hebg:" + id); render(); } }
        ]);
      };
    });
    $("hLinkRoom").onclick = function () {
      var tr = treeRooms(), cur = roomsFor(id);
      var opts = tr.list.filter(function (rm) { return cur.indexOf(rm.id) < 0; }).map(function (rm) { return { label: rm.zone + " · " + rm.name + " (" + rm.equipment.length + ")", value: rm.id }; });
      sheetChoose("Lier une pièce de l'inventaire", "Les équipements de cette pièce apparaîtront dans « " + keyLabel(id) + " ».", opts, function (rid2) {
        if (!rid2) return;
        r.rooms = r.rooms || []; if (r.rooms.indexOf(rid2) < 0) r.rooms.push(rid2);
        r.roomsOff = (r.roomsOff || []).filter(function (x) { return x !== rid2; });
        pushHist(r, "Lien inventaire ajouté : " + (tr.idx[rid2] ? tr.idx[rid2].name : rid2), who()); touch("hebg:" + id); V.showEq = true; render();
      });
    };
    document.querySelectorAll(".hIt").forEach(function (el) { el.onclick = function () { MAINT.openDetail(el.dataset.iid, id); }; });
    $("hNewInter").onclick = function () { if (window.MAINT) MAINT.openForKey(id); };
    $("hAllOk").onclick = function () {
      sheetConfirm("Tout marquer OK ?", "Tous les points de « " + keyLabel(id) + " » passent en OK (les travaux à faire restent).", "Tout OK", false, function () {
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
        toast("💾 " + keyLabel(id) + " : passage enregistré" + (nPb ? " — " + nPb + " point(s) à suivre" : " — tout OK"));
        V.screen = "grid"; render();
      });
    };
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
    var tr0 = treeRooms();
    var allItems = Object.keys(ITEMS);
    var aoa = [["ÉTAT DES LIEUX — MAINTENANCE — HÔTEL WADRA BAY"], ["Généré le", nowDate() + " " + nowTime()], [],
      ["Lieu", "Nom", "État global", "Dernier passage", "Par", "Travaux en attente"].concat(allItems.map(function (k) { return ITEMS[k].label; })).concat(["Observations"])];
    KEYS.forEach(function (k) {
      var r = rec(k.id) || { items: {}, todos: [] }, st = keyStatus(k.id);
      var row = [k.id, keyLabel(k.id), st === "na" ? "non visité" : STATES[st].label, r.date ? frDate(r.date) : "", r.by || "", openTodos(r).length];
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
    XLSX.utils.book_append_sheet(wb, ws, "État des lieux");

    var aoa2 = [["TRAVAUX ET POINTS EN ATTENTE"], [], ["Lieu", "Nom", "Nature", "Point / travaux", "État", "Depuis le"]];
    allIssues().forEach(function (x) {
      aoa2.push([x.key, keyLabel(x.key), x.kind === "todo" ? "Travaux" : "Équipement", x.txt, x.kind === "todo" ? "à faire" : STATES[x.st].label, frDate(x.date)]);
    });
    var ws2 = XLSX.utils.aoa_to_sheet(aoa2);
    ws2["!cols"] = [{ wch: 8 }, { wch: 26 }, { wch: 11 }, { wch: 60 }, { wch: 13 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "À faire");

    var aoa3 = [["HISTORIQUE"], [], ["Date", "Heure", "Lieu", "Par", "Événement"]], ev = [];
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
    /* inventaire par lieu : passerelle inventaire ↔ maintenance */
    var inv = [["INVENTAIRE PAR LIEU — équipements recensés dans chaque lieu de maintenance"], [], ["Lieu", "Nom du lieu", "Pièce (inventaire)", "Tableau", "Équipement", "Qté", "Marque", "Modèle", "État maintenance", "Interventions ouvertes"]];
    KEYS.forEach(function (k) {
      roomsFor(k.id).forEach(function (rid2) {
        var rm = tr0.idx[rid2]; if (!rm) return;
        rm.equipment.forEach(function (e) {
          var f = (state.equip && state.equip[e.id]) || {}, hm = window.MAINT ? MAINT.health(e.id) : null;
          inv.push([k.id, keyLabel(k.id), rm.name, rm.zone, e.name, e.qte || "", f.marque || e.marque || "", f.modele || e.modele || "", hm ? MAINT.healthLabel(hm) : "", window.MAINT ? MAINT.forEquip(e.id).filter(MAINT.isOpen).length : 0]);
        });
      });
    });
    var wsI = XLSX.utils.aoa_to_sheet(inv); wsI["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 34 }, { wch: 12 }, { wch: 40 }, { wch: 5 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsI, "Inventaire par lieu");
    XLSX.writeFile(wb, "WADRA_Bay_Maintenance_Etat_des_lieux_" + nowDate() + ".xlsx");
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
    openKey: function (id) { if (V.id !== id) V.showEq = false; V.screen = "key"; V.id = id; nav("hebg"); },
    openGrid: function () { V.screen = "grid"; V.id = null; nav("hebg"); },
    placesForRoom: placesForRoom,
    roomsFor: roomsFor,
    interFor: interFor,
    photoAdded: function (key) {
      if (view.name !== "hebg" || V.screen !== "key") return;
      if (key === "hebg_" + V.id) paintPhotos(V.id);
    }
  };
})();
