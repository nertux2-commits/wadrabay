/* WADRA Bay v11 — Départ 10 : 10-POMPERIE générale | 20,4 kVA | NDC CANECO folio 16 */
BASE.zones.push({
  "id": 10, "tab": "10-POMPERIE générale", "title": "DÉPART 10/10 : POMPERIE générale", "ref": "POMPERIE générale | 20,4 kVA | NDC CANECO folio 16",
  "equipments": [
    {"n": "1", "aRelever": "OUI", "equipement": "Pompe eau potable n°1", "qte": "1", "local": "Pomperie", "ref": "NDC folio 16", "notice": "✗", "aVerifier": "Relever plaque"},
    {"n": "2", "aRelever": "OUI", "equipement": "Pompe eau potable n°2", "qte": "1", "local": "Pomperie", "ref": "NDC folio 16", "notice": "✗", "aVerifier": "Relever plaque"},
    {"n": "3", "aRelever": "OUI", "equipement": "Surpresseur eau froide bâtiments", "qte": "1", "local": "Pomperie", "ref": "NDC folio 16", "notice": "✗", "aVerifier": "Relever plaque"},
    {"n": "4", "aRelever": "NON", "equipement": "Pompe défense incendie RIA n°1", "qte": "1", "local": "Local DI", "ref": "Notice surpresseur", "notice": "✓", "marque": "Lowara", "modele": "surpresseur IE3", "aVerifier": "4 kW / 7,56 A"},
    {"n": "5", "aRelever": "NON", "equipement": "Pompe défense incendie RIA n°2", "qte": "1", "local": "Local DI", "ref": "Notice surpresseur", "notice": "✓", "marque": "Lowara", "modele": "surpresseur IE3", "aVerifier": "Confirmer"},
    {"n": "6", "aRelever": "NON", "equipement": "Pompe jockey DI (secours)", "qte": "1", "local": "Local DI", "ref": "Notice surpresseur", "notice": "✓", "marque": "Lowara", "modele": "surpresseur", "aVerifier": "Confirmer"},
    {"n": "7", "aRelever": "OUI", "equipement": "Adoucisseur d'eau", "qte": "1", "local": "Pomperie", "ref": "—", "notice": "✗", "aVerifier": "Confirmer présence"},
    {"n": "8", "aRelever": "OUI", "equipement": "Éclairage du local Pomperie", "local": "Local Pomperie", "ref": "Schéma 42C", "notice": "✗", "aVerifier": "Relever"}
  ]
});
