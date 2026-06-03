/* WADRA Bay v11 — Départ 8 : 8-TD-SP */
BASE.zones.push({
  "id": 8, "tab": "8-TD-SP", "title": "DÉPART 8/10 : TD-SP — Salle Polyvalente", "ref": "TD-SP — Salle Polyvalente | 43,7 kVA | 42C32a/b",
  "equipments": [
    {"n": "1", "aRelever": "OUI", "equipement": "PAC réversible + ballon tampon", "qte": "1", "local": "Grande salle · Grande salle", "ref": "Schéma 42C32a 'PAC'", "notice": "✗", "aVerifier": "Relever PAC + ballon"},
    {"n": "2", "aRelever": "NON", "equipement": "Climatiseurs Salle Polyvalente", "qte": "3", "local": "Grande salle · Grande salle", "ref": "Schéma 42C32a 'C1'", "notice": "✓", "marque": "GREE", "aVerifier": "3 climatiseurs — relever plaques"},
    {"n": "3", "aRelever": "OUI", "equipement": "Éclairage grande salle", "qte": "1", "local": "Grande salle · Grande salle", "notice": "✗", "aVerifier": "Relever"},
    {"n": "4", "aRelever": "OUI", "equipement": "Prises & sonorisation", "qte": "1", "local": "Grande salle · Grande salle", "notice": "✗", "aVerifier": "Relever"},
    {"n": "5", "aRelever": "OUI", "equipement": "Éclairage + prises office", "qte": "1", "local": "Office · Office", "notice": "✗", "aVerifier": "Relever"},
    {"n": "6", "aRelever": "OUI", "equipement": "Éclairage salle de rangement", "qte": "1", "local": "Salle de rangement · Salle rangement", "notice": "✗", "aVerifier": "Relever"},
    {"n": "7", "aRelever": "OUI", "equipement": "Éclairage Sanitaire F", "qte": "1", "local": "Sanitaires · Sanitaire F", "notice": "✗", "aVerifier": "Relever"},
    {"n": "8", "aRelever": "OUI", "equipement": "Éclairage Sanitaire H", "qte": "1", "local": "Sanitaires · Sanitaire H", "notice": "✗", "aVerifier": "Relever"},
    {"n": "9", "aRelever": "OUI", "equipement": "Éclairage WC PMR", "qte": "1", "local": "Sanitaires · WC PMR", "notice": "✗", "aVerifier": "Relever"},
    {"n": "10", "aRelever": "NON", "equipement": "Extracteurs de ventilation sanitaires", "qte": "3", "local": "Sanitaires · Sanitaires", "ref": "Schéma 42C32a 'Extr'", "notice": "✓", "aVerifier": "3 extracteurs"},
    {"n": "11", "aRelever": "NON", "equipement": "Pompe de circulation lagunarium n°1", "qte": "1", "local": "LAGUNARIUM · LT-Lagunarium", "ref": "Note de calcul PDC", "notice": "✓", "marque": "Xylem", "modele": "NSCF 100-250/75/P45", "aVerifier": "150 m³/h avec variateur — relever plaque"},
    {"n": "12", "aRelever": "NON", "equipement": "Pompe de circulation lagunarium n°2", "qte": "1", "local": "LAGUNARIUM · LT-Lagunarium", "ref": "Note de calcul PDC", "notice": "✓", "marque": "Xylem", "modele": "NSCF 100-250/75/P45", "aVerifier": "Relever plaque"},
    {"n": "13", "aRelever": "NON", "equipement": "Pompe de circulation lagunarium n°3", "qte": "1", "local": "LAGUNARIUM · LT-Lagunarium", "ref": "Note de calcul PDC", "notice": "✓", "marque": "Xylem", "modele": "NSCF 100-250/75/P45", "aVerifier": "Relever plaque"},
    {"n": "14", "aRelever": "NON", "equipement": "Variateurs de vitesse pompes lagune", "qte": "3", "local": "LAGUNARIUM · LT-Lagunarium", "ref": "Analyse fonctionnelle", "notice": "✓", "modele": "variateurs", "aVerifier": "Marque / modèle variateurs"},
    {"n": "15", "aRelever": "OUI", "equipement": "Surpresseur d'air lagunarium", "qte": "1", "local": "LAGUNARIUM · LT-Lagunarium", "ref": "—", "notice": "✗", "aVerifier": "Confirmer présence"},
    {"n": "16", "aRelever": "OUI", "equipement": "Système UV / ozonation lagune", "qte": "1", "local": "LAGUNARIUM · LT-Lagunarium", "ref": "—", "notice": "✗", "aVerifier": "Confirmer présence"},
    {"n": "17", "aRelever": "NON", "equipement": "Éclairage du local Lagunarium", "local": "LAGUNARIUM · Local Lagunarium", "ref": "NOTICES Lagune", "notice": "✓", "aVerifier": "Relever"}
  ]
});
