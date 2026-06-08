/* =====================================================================
   WADRA Bay — Graine de données (SEED) : Mission 1 — Z03 / TG-SG
   Services Généraux (Bât. I) — laverie/repassage/buanderie.
   Pré-remplit l'appli au 1er chargement (données saisies + photos terrain).
   N'écrase JAMAIS une saisie existante ; ne s'exécute qu'une seule fois
   (drapeau state.meta.seedVersion). Les 29 photos sont dans ./photos_z03/.
   ===================================================================== */
window.WADRA_SEED = {
  "version": "z03-mission1-2025-05-22",
  "date": "2025-05-22T19:28:00Z",
  "zone": "z_sg",
  "equip": {
    "eq_1_7": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "Primus (Alliance Laundry)",
      "modele": "à relever sur plaque",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-E7). Plaque à relever."
    },
    "eq_1_9": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "Primus (Alliance Laundry)",
      "modele": "à relever sur plaque",
      "puissance": "",
      "observations": "Ajouté au relevé terrain mission 1 (photo Z03-C1). Plaque à relever."
    },
    "eq_1_31": {
      "statut": "ok",
      "local": "Buanderie personnel",
      "marque": "Primus (Alliance Laundry)",
      "modele": "à relever sur plaque",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-C2). Plaque à relever."
    },
    "eq_1_32": {
      "statut": "ok",
      "local": "Buanderie personnel",
      "marque": "Primus (Alliance Laundry)",
      "modele": "TX9",
      "puissance": "9.4",
      "observations": "Plaque relevée : 9,4 kW total (chauffage 9 kW), 3×380-415 V +N, 20 A (photo Z03-C3)."
    },
    "eq_1_10": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "Primus (Alliance Laundry)",
      "modele": "T24 / T35 (à confirmer)",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-E1). Modèle exact + kW chauffage à relever."
    },
    "eq_1_11": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "Primus (Alliance Laundry)",
      "modele": "T24 / T35 (à confirmer)",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-E2). Plaque à relever."
    },
    "eq_1_12": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "Primus (Alliance Laundry)",
      "modele": "T24 / T35 (à confirmer)",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-E3). Plaque à relever."
    },
    "eq_1_13": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "Primus (Alliance Laundry)",
      "modele": "T24 / T35 (à confirmer)",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-E4). Plaque à relever."
    },
    "eq_1_17": {
      "statut": "ok",
      "local": "Repassage",
      "marque": "Alliance Laundry (Primus)",
      "modele": "IF50-320",
      "puissance": "64.8",
      "observations": "EN PANNE / hors service (constat terrain). Plaque relevée : 64,8 kW chauffage, P max 66,3 kW, 125 A (photo Z03-E5). 1 seule calandreuse sur site."
    },
    "eq_1_21": {
      "statut": "ok",
      "local": "Bureau gouvernante",
      "marque": "CLIPSAL",
      "modele": "P3x1200 Series",
      "puissance": "0.06",
      "observations": "Plaque relevée : 230-240 V, 50 Hz, 60 W (photo Z03-C7)."
    },
    "eq_1_35": {
      "statut": "ok",
      "local": "Local ECS",
      "marque": "DCSM",
      "modele": "à relever sur plaque",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-C4). Capacité ballon + puissance appoint élec. à relever."
    },
    "eq_1_18": {
      "statut": "ok",
      "local": "Repassage",
      "marque": "GREE",
      "modele": "split (à relever)",
      "puissance": "",
      "observations": "Climatisation services généraux photographiée (Z03-C5 / E10). Plusieurs unités relevées (repères C5/C6/E10) — répartition exacte à confirmer."
    },
    "eq_1_20": {
      "statut": "ok",
      "local": "Bureau gouvernante",
      "marque": "GREE",
      "modele": "split mural (à relever)",
      "puissance": "",
      "observations": "Climatisation services généraux photographiée (Z03-C6). Voir aussi C5/E10."
    },
    "eq_1_16": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "",
      "modele": "à relever (en hauteur)",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-E9). 6 extracteurs en hauteur, non inspectables — relevé via notice."
    },
    "eq_1_14": {
      "statut": "ok",
      "local": "Laverie",
      "marque": "",
      "modele": "réglette LED étanche",
      "puissance": "",
      "observations": "Relevé terrain mission 1 (photo Z03-E11). Réglettes LED étanches — nombre à compter."
    }
  },
  "photos": [
    {
      "id": "pZ03_E1_1",
      "key": "eq_1_10",
      "file": "Z03_E1_seche-linge-n-1_1.jpg",
      "src": "./photos_z03/Z03_E1_seche-linge-n-1_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E1_2",
      "key": "eq_1_10",
      "file": "Z03_E1_seche-linge-n-1_2.jpg",
      "src": "./photos_z03/Z03_E1_seche-linge-n-1_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E2_1",
      "key": "eq_1_11",
      "file": "Z03_E2_seche-linge-n-2_1.jpg",
      "src": "./photos_z03/Z03_E2_seche-linge-n-2_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E2_2",
      "key": "eq_1_11",
      "file": "Z03_E2_seche-linge-n-2_2.jpg",
      "src": "./photos_z03/Z03_E2_seche-linge-n-2_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E3_1",
      "key": "eq_1_12",
      "file": "Z03_E3_seche-linge-n-3_1.jpg",
      "src": "./photos_z03/Z03_E3_seche-linge-n-3_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E3_2",
      "key": "eq_1_12",
      "file": "Z03_E3_seche-linge-n-3_2.jpg",
      "src": "./photos_z03/Z03_E3_seche-linge-n-3_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E4_1",
      "key": "eq_1_13",
      "file": "Z03_E4_seche-linge-n-4_1.jpg",
      "src": "./photos_z03/Z03_E4_seche-linge-n-4_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E4_2",
      "key": "eq_1_13",
      "file": "Z03_E4_seche-linge-n-4_2.jpg",
      "src": "./photos_z03/Z03_E4_seche-linge-n-4_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E11_1",
      "key": "eq_1_14",
      "file": "Z03_E11_eclairage-services-generaux-la_1.jpg",
      "src": "./photos_z03/Z03_E11_eclairage-services-generaux-la_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E9_1",
      "key": "eq_1_16",
      "file": "Z03_E9_extracteurs-de-ventilation-lav_1.jpg",
      "src": "./photos_z03/Z03_E9_extracteurs-de-ventilation-lav_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E5_1",
      "key": "eq_1_17",
      "file": "Z03_E5_calandreuse-n-1_1.jpg",
      "src": "./photos_z03/Z03_E5_calandreuse-n-1_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E5_2",
      "key": "eq_1_17",
      "file": "Z03_E5_calandreuse-n-1_2.jpg",
      "src": "./photos_z03/Z03_E5_calandreuse-n-1_2.jpg",
      "plate": true
    },
    {
      "id": "pZ03_C5_1",
      "key": "eq_1_18",
      "file": "Z03_C5_climatisation-services-generau_1.jpg",
      "src": "./photos_z03/Z03_C5_climatisation-services-generau_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C5_2",
      "key": "eq_1_18",
      "file": "Z03_C5_climatisation-services-generau_2.jpg",
      "src": "./photos_z03/Z03_C5_climatisation-services-generau_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E10_1",
      "key": "eq_1_18",
      "file": "Z03_E10_climatisation-services-generau_1.jpg",
      "src": "./photos_z03/Z03_E10_climatisation-services-generau_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E10_2",
      "key": "eq_1_18",
      "file": "Z03_E10_climatisation-services-generau_2.jpg",
      "src": "./photos_z03/Z03_E10_climatisation-services-generau_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C6_1",
      "key": "eq_1_20",
      "file": "Z03_C6_climatisation-services-generau_1.jpg",
      "src": "./photos_z03/Z03_C6_climatisation-services-generau_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C6_2",
      "key": "eq_1_20",
      "file": "Z03_C6_climatisation-services-generau_2.jpg",
      "src": "./photos_z03/Z03_C6_climatisation-services-generau_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C7_1",
      "key": "eq_1_21",
      "file": "Z03_C7_brasseur-d-air_1.jpg",
      "src": "./photos_z03/Z03_C7_brasseur-d-air_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C7_2",
      "key": "eq_1_21",
      "file": "Z03_C7_brasseur-d-air_2.jpg",
      "src": "./photos_z03/Z03_C7_brasseur-d-air_2.jpg",
      "plate": true
    },
    {
      "id": "pZ03_C2_1",
      "key": "eq_1_31",
      "file": "Z03_C2_lave-linge-personnel_1.jpg",
      "src": "./photos_z03/Z03_C2_lave-linge-personnel_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C2_2",
      "key": "eq_1_31",
      "file": "Z03_C2_lave-linge-personnel_2.jpg",
      "src": "./photos_z03/Z03_C2_lave-linge-personnel_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C3_1",
      "key": "eq_1_32",
      "file": "Z03_C3_seche-linge-personnel_1.jpg",
      "src": "./photos_z03/Z03_C3_seche-linge-personnel_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C4_1",
      "key": "eq_1_35",
      "file": "Z03_C4_pompe-a-chaleur-pour-ecs_1.jpg",
      "src": "./photos_z03/Z03_C4_pompe-a-chaleur-pour-ecs_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C4_2",
      "key": "eq_1_35",
      "file": "Z03_C4_pompe-a-chaleur-pour-ecs_2.jpg",
      "src": "./photos_z03/Z03_C4_pompe-a-chaleur-pour-ecs_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E7_1",
      "key": "eq_1_7",
      "file": "Z03_E7_lave-linge-professionnel_1.jpg",
      "src": "./photos_z03/Z03_E7_lave-linge-professionnel_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_E7_2",
      "key": "eq_1_7",
      "file": "Z03_E7_lave-linge-professionnel_2.jpg",
      "src": "./photos_z03/Z03_E7_lave-linge-professionnel_2.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C1_1",
      "key": "eq_1_9",
      "file": "Z03_C1_lave-linge-professionnel-n-3_1.jpg",
      "src": "./photos_z03/Z03_C1_lave-linge-professionnel-n-3_1.jpg",
      "plate": false
    },
    {
      "id": "pZ03_C1_2",
      "key": "eq_1_9",
      "file": "Z03_C1_lave-linge-professionnel-n-3_2.jpg",
      "src": "./photos_z03/Z03_C1_lave-linge-professionnel-n-3_2.jpg",
      "plate": false
    }
  ]
};
