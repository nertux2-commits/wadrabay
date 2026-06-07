/* WADRA Bay v11 — Niveau 0 : SOURCE (Poste HT-BT & TGBT) — amont des 10 départs */
BASE.zones.push({
  "id": 0, "tab": "0-SOURCE", "title": "SOURCE — Poste HT-BT & TGBT (amont des 10 départs)", "ref": "Poste HT-BT 630 kVA + TGBT (≈785 kVA installé) | Niveau 0 — source commune",
  "equipments": [
    {"n": "1", "aRelever": "OUI", "equipement": "TGBT — armoire générale BT", "qte": "1", "local": "Poste HT-BT", "ref": "Schéma 42C20", "notice": "✗", "aVerifier": "Photographier l'armoire, relever calibre du disjoncteur général"},
    {"n": "2", "aRelever": "NON", "equipement": "Groupe électrogène de secours", "qte": "1", "local": "Local groupe", "ref": "Notice complète", "notice": "✓", "marque": "CUMMINS", "modele": "QSG12-G2", "aVerifier": "409 kVA / 328 kW PRP — relever heures au compteur"},
    {"n": "3", "aRelever": "NON", "equipement": "Transformateur HT-BT", "qte": "1", "local": "Poste HT-BT", "ref": "DOE lot 13A", "notice": "✓", "marque": "France Transfo", "modele": "MINERA 630 kVA", "aVerifier": "Relever / photographier la plaque"},
    {"n": "4", "aRelever": "NON", "equipement": "Batterie de condensateurs 125 kvar automatique", "qte": "1", "local": "Pied TGBT", "ref": "DOE lot 13A", "notice": "✓", "marque": "Schneider", "modele": "VarSet 125 kvar", "aVerifier": "Relever l'état (gradins, voyants)"},
    {"n": "5", "aRelever": "NON", "equipement": "Batterie de condensateurs 22 kvar fixe", "qte": "1", "local": "Pied TGBT", "ref": "DOE lot 13A", "notice": "✓", "marque": "Schneider", "modele": "VarSet 22 kvar", "aVerifier": "Relever"},
    {"n": "6", "aRelever": "OUI", "equipement": "Éclairage du local poste / TGBT", "local": "Local poste", "ref": "Schéma 42C21", "notice": "✗", "aVerifier": "Relever type et nombre de luminaires"}
  ]
});
