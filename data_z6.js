/* WADRA Bay v11 — Départ 6 : 6-TD-LT7 */
BASE.zones.push({
  "id": 6, "tab": "6-TD-LT7", "title": "DÉPART 6/10 : TD-LT7 — Local Technique 7", "ref": "TD-LT7 — Local Technique 7 | 70 kVA | 101 A | 42C51",
  "equipments": [
    {"n": "1", "aRelever": "OUI", "equipement": "PAC réversible / ECS logements", "local": "Logements du personnel · Logements personnel", "ref": "Schémas 42C57/58/59", "notice": "✗", "aVerifier": "Relever par typologie"},
    {"n": "2", "aRelever": "OUI", "equipement": "Cuisines + équipements logements", "local": "Logements du personnel · Logements personnel", "ref": "Schémas 42C57/58/59", "notice": "✗", "aVerifier": "Relever (plaques, hottes)"},
    {"n": "3", "aRelever": "OUI", "equipement": "Pompes logements personnel", "local": "Logements du personnel · Logements personnel", "ref": "Schémas 42C57/58/59", "notice": "✗", "aVerifier": "Relever"},
    {"n": "4", "aRelever": "NON", "equipement": "Climatiseurs / PAC réversibles logements", "local": "Logements du personnel · Logements F1/F2/F4", "ref": "Schémas 42C57/58/59", "notice": "✓", "marque": "GREE", "aVerifier": "Relever par typologie"},
    {"n": "5", "aRelever": "NON", "equipement": "Éclairage des logements", "local": "Logements du personnel · Logements", "ref": "Plans EL09", "notice": "✓", "aVerifier": "Relever"},
    {"n": "6", "aRelever": "OUI", "equipement": "Éclairage & prises communs (THQ-LT7)", "qte": "1", "local": "THQ-LT7 · Local technique 7", "notice": "✗", "aVerifier": "Relever"}
  ]
});
