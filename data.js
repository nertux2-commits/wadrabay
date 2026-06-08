// WADRA Bay — Hiérarchie complète : TD → Pièce → Équipement
// TGBT séparé (accueil) + 10 TDs + données saisies du relevé v11
// IDs de pièce uniques (corrige la navigation entre pièces).

const zones = [
  {
    "id": "z_tgbt",
    "name": "TGBT",
    "fullName": "Poste HT-BT / Transformateur 630 kVA / Groupe électrogène",
    "kVA": "630 kVA",
    "rooms": [
      {
        "id": "z_tgbt_r1",
        "name": "Tête TGBT/Source · Local groupe",
        "equipment": [
          {
            "id": "eq_1_2",
            "name": "Groupe électrogène de secours",
            "marque": "CUMMINS",
            "modele": "QSG12-G2",
            "puissance": "",
            "qte": "1",
            "ref": "Notice complète",
            "aVerifier": "409 kVA / 328 kW PRP — relever heures au compteur"
          }
        ]
      },
      {
        "id": "z_tgbt_r2",
        "name": "Tête TGBT/Source · Local poste",
        "equipment": [
          {
            "id": "eq_1_6",
            "name": "Éclairage du local poste / TGBT",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C21",
            "aVerifier": "Relever type et nombre de luminaires"
          }
        ]
      },
      {
        "id": "z_tgbt_r3",
        "name": "Tête TGBT/Source · Pied TGBT",
        "equipment": [
          {
            "id": "eq_1_4",
            "name": "Batterie de condensateurs 125 kvar automatique",
            "marque": "Schneider",
            "modele": "VarSet 125 kvar",
            "puissance": "",
            "qte": "1",
            "ref": "DOE lot 13A",
            "aVerifier": "Relever l'état (gradins, voyants)"
          },
          {
            "id": "eq_1_5",
            "name": "Batterie de condensateurs 22 kvar fixe",
            "marque": "Schneider",
            "modele": "VarSet 22 kvar",
            "puissance": "",
            "qte": "1",
            "ref": "DOE lot 13A",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_tgbt_r4",
        "name": "Tête TGBT/Source · Poste HT-BT",
        "equipment": [
          {
            "id": "eq_1_1",
            "name": "TGBT — armoire générale BT",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C20",
            "aVerifier": "Photographier l'armoire, relever calibre du disjoncteur général"
          },
          {
            "id": "eq_1_3",
            "name": "Transformateur HT-BT",
            "marque": "France Transfo",
            "modele": "MINERA 630 kVA",
            "puissance": "",
            "qte": "1",
            "ref": "DOE lot 13A",
            "aVerifier": "Relever / photographier la plaque"
          }
        ]
      }
    ]
  },
  {
    "id": "z_sg",
    "name": "TG-SG",
    "fullName": "Services Généraux (Bât. I)",
    "kVA": "200 kVA",
    "rooms": [
      {
        "id": "z_sg_r1",
        "name": "TD-SG · Buanderie personnel",
        "equipment": [
          {
            "id": "eq_1_31",
            "name": "Lave-linge personnel",
            "marque": "Primus (Alliance Laundry)",
            "modele": "à relever sur plaque",
            "puissance": "",
            "qte": "1",
            "ref": "Photo terrain Z03-C2",
            "aVerifier": "Ajouté au relevé terrain — confirmer le local"
          },
          {
            "id": "eq_1_32",
            "name": "Sèche-linge personnel",
            "marque": "Primus (Alliance Laundry)",
            "modele": "TX9",
            "puissance": "9.4",
            "qte": "1",
            "ref": "Photo terrain Z03-C3",
            "aVerifier": "Plaque : 9,4 kW total (chauffage 9 kW), 3x380-415V +N, 20 A"
          }
        ]
      },
      {
        "id": "z_sg_r2",
        "name": "TD-SG · Bureau gouvernante",
        "equipment": [
          {
            "id": "eq_1_20",
            "name": "Climatisation bureau gouvernante",
            "marque": "GREE",
            "modele": "split mural (à relever)",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. C2 / plan CL01",
            "aVerifier": "Relever plaque du split"
          },
          {
            "id": "eq_1_21",
            "name": "Brasseur d'air",
            "marque": "CLIPSAL",
            "modele": "P3x1200 Series",
            "puissance": "0.06",
            "qte": "1",
            "ref": "Schéma 42C31 dép. BA / photo Z03-C7",
            "aVerifier": "Plaque : 230-240 V, 50 Hz, 60 W"
          },
          {
            "id": "eq_1_22",
            "name": "Éclairage bureau gouvernante",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31",
            "aVerifier": "Compter les luminaires"
          },
          {
            "id": "eq_1_23",
            "name": "Prises / matériel bureautique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. P2",
            "aVerifier": "Recenser le matériel branché"
          }
        ]
      },
      {
        "id": "z_sg_r3",
        "name": "TD-SG · Façade Bât. I",
        "equipment": [
          {
            "id": "eq_1_36",
            "name": "Éclairage façade extérieure",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. Ext",
            "aVerifier": "Compter les hublots / appliques"
          }
        ]
      },
      {
        "id": "z_sg_r4",
        "name": "TD-SG · Laverie",
        "equipment": [
          {
            "id": "eq_1_7",
            "name": "Lave-linge professionnel n°1",
            "marque": "Primus (Alliance Laundry)",
            "modele": "à relever sur plaque",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. LL1 / photo Z03-E7",
            "aVerifier": "Relever modèle + puissance plaque"
          },
          {
            "id": "eq_1_8",
            "name": "Lave-linge professionnel n°2",
            "marque": "Primus (Alliance Laundry)",
            "modele": "à relever sur plaque",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. LL3",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_1_9",
            "name": "Lave-linge professionnel n°3",
            "marque": "Primus (Alliance Laundry)",
            "modele": "à relever sur plaque",
            "puissance": "",
            "qte": "1",
            "ref": "Photo terrain Z03-C1",
            "aVerifier": "Ajouté au relevé terrain — relever plaque"
          },
          {
            "id": "eq_1_10",
            "name": "Sèche-linge n°1",
            "marque": "Primus (Alliance Laundry)",
            "modele": "T24 / T35 (à confirmer)",
            "puissance": "",
            "qte": "1",
            "ref": "Notice Primus / photo Z03-E1",
            "aVerifier": "Relever modèle exact + kW chauffage"
          },
          {
            "id": "eq_1_11",
            "name": "Sèche-linge n°2",
            "marque": "Primus (Alliance Laundry)",
            "modele": "T24 / T35 (à confirmer)",
            "puissance": "",
            "qte": "1",
            "ref": "Photo Z03-E2",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_1_12",
            "name": "Sèche-linge n°3",
            "marque": "Primus (Alliance Laundry)",
            "modele": "T24 / T35 (à confirmer)",
            "puissance": "",
            "qte": "1",
            "ref": "Photo Z03-E3",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_1_13",
            "name": "Sèche-linge n°4",
            "marque": "Primus (Alliance Laundry)",
            "modele": "T24 / T35 (à confirmer)",
            "puissance": "",
            "qte": "1",
            "ref": "Photo Z03-E4",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_1_14",
            "name": "Éclairage laverie (réglettes LED type tube)",
            "marque": "",
            "modele": "réglette LED étanche",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. E1 / photo Z03-E11",
            "aVerifier": "Compter les réglettes — voir doc 08-Éclairage"
          },
          {
            "id": "eq_1_15",
            "name": "VMC laverie",
            "marque": "France Air",
            "modele": "CANALFAST D160 (à confirmer)",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. VMC1",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_1_16",
            "name": "Extracteurs d'air laverie",
            "marque": "",
            "modele": "à relever (en hauteur — voir notice)",
            "puissance": "",
            "qte": "6",
            "ref": "Schéma 42C31 dép. Vex3 à Vex8",
            "aVerifier": "6 extracteurs non inspectables — relever via notice / doc 07-CVC"
          }
        ]
      },
      {
        "id": "z_sg_r5",
        "name": "TD-SG · Local CF",
        "equipment": [
          {
            "id": "eq_1_33",
            "name": "Chambre froide positive",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. CF1",
            "aVerifier": "Compresseur — PRIORITÉ mesure"
          },
          {
            "id": "eq_1_34",
            "name": "Chambre froide négative",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. CF2",
            "aVerifier": "Compresseur — PRIORITÉ mesure"
          }
        ]
      },
      {
        "id": "z_sg_r6",
        "name": "TD-SG · Local ECS",
        "equipment": [
          {
            "id": "eq_1_35",
            "name": "Ballon ECS thermodynamique / PAC",
            "marque": "DCSM",
            "modele": "à relever sur plaque",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. PAC / photo Z03-C4",
            "aVerifier": "Relever capacité ballon + puissance (appoint élec. visible sur régulateur)"
          }
        ]
      },
      {
        "id": "z_sg_r7",
        "name": "TD-SG · Repassage",
        "equipment": [
          {
            "id": "eq_1_17",
            "name": "Calandreuse / repasseuse-sécheuse",
            "marque": "Alliance Laundry (Primus)",
            "modele": "IF50-320",
            "puissance": "64.8",
            "qte": "1",
            "ref": "Schéma 42C31 dép. REP1 / photo Z03-E5",
            "aVerifier": "1 SEULE calandreuse sur site — EN PANNE / hors service (constat terrain). Plaque : 64,8 kW chauffage, P max 66,3 kW, 125 A"
          },
          {
            "id": "eq_1_18",
            "name": "Climatisation Repassage",
            "marque": "GREE",
            "modele": "split (à relever)",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. C1 / plan CL01",
            "aVerifier": "Relever groupe + unité"
          },
          {
            "id": "eq_1_19",
            "name": "Éclairage Repassage",
            "marque": "",
            "modele": "réglette LED",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. E2",
            "aVerifier": "Compter les réglettes"
          }
        ]
      },
      {
        "id": "z_sg_r8",
        "name": "TD-SG · Réserve",
        "equipment": [
          {
            "id": "eq_1_24",
            "name": "Éclairage Réserve",
            "marque": "",
            "modele": "réglette LED",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. E3 / E4",
            "aVerifier": "Compter les réglettes"
          },
          {
            "id": "eq_1_25",
            "name": "VMC Réserve",
            "marque": "France Air",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. VMC2",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_sg_r9",
        "name": "TD-SG · Sanitaires",
        "equipment": [
          {
            "id": "eq_1_29",
            "name": "Sèche-mains électriques",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31",
            "aVerifier": "Compter + relever puissance"
          },
          {
            "id": "eq_1_30",
            "name": "Prises Sanitaires",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. P3",
            "aVerifier": "Recenser"
          }
        ]
      },
      {
        "id": "z_sg_r10",
        "name": "TD-SG · Sanitaires F",
        "equipment": [
          {
            "id": "eq_1_27",
            "name": "Éclairage Sanitaires Femmes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. E6",
            "aVerifier": "Compter les luminaires"
          }
        ]
      },
      {
        "id": "z_sg_r11",
        "name": "TD-SG · Sanitaires H",
        "equipment": [
          {
            "id": "eq_1_26",
            "name": "Éclairage Sanitaires Hommes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. E5",
            "aVerifier": "Compter les luminaires"
          }
        ]
      },
      {
        "id": "z_sg_r12",
        "name": "TD-SG · Vestiaires",
        "equipment": [
          {
            "id": "eq_1_28",
            "name": "VMC Vestiaires / Sanitaires",
            "marque": "France Air",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C31 dép. VMC3",
            "aVerifier": "Relever"
          }
        ]
      }
    ]
  },
  {
    "id": "z_c",
    "name": "TG-C",
    "fullName": "Cœur du site",
    "kVA": "110.9 kVA",
    "rooms": [
      {
        "id": "z_c_r1",
        "name": "LT-PISCINE · LT-Piscine",
        "equipment": [
          {
            "id": "eq_2_71",
            "name": "Pompe de filtration piscine principale",
            "marque": "Waterco",
            "modele": "Hydrostar MK4/Plus",
            "puissance": "",
            "qte": "1",
            "ref": "42C37 + notice",
            "aVerifier": "3 à 11 kW — modèle exact sur plaque"
          },
          {
            "id": "eq_2_72",
            "name": "Pompe de filtration piscine secours",
            "marque": "Waterco",
            "modele": "Hydrostar",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C37",
            "aVerifier": "Confirmer la présence"
          },
          {
            "id": "eq_2_73",
            "name": "Filtre à sable piscine",
            "marque": "Waterco",
            "modele": "série S",
            "puissance": "",
            "qte": "1",
            "ref": "Notice Waterco",
            "aVerifier": "Ø cuve + modèle"
          },
          {
            "id": "eq_2_74",
            "name": "Pompe doseuse chlore",
            "marque": "Concept-Plus",
            "modele": "péristaltique",
            "puissance": "",
            "qte": "1",
            "ref": "Notice Concept-Plus",
            "aVerifier": "< 0,1 kW"
          },
          {
            "id": "eq_2_75",
            "name": "Pompe doseuse pH",
            "marque": "Concept-Plus",
            "modele": "péristaltique",
            "puissance": "",
            "qte": "1",
            "ref": "Notice Concept-Plus",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_76",
            "name": "Électrolyseur traitement eau",
            "marque": "ROX",
            "modele": "électrolyseur",
            "puissance": "",
            "qte": "1",
            "ref": "Notice ROX",
            "aVerifier": "Confirmer présence"
          },
          {
            "id": "eq_2_77",
            "name": "Programmateur horaire filtration",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "—",
            "aVerifier": "Modèle + plages horaires"
          },
          {
            "id": "eq_2_78",
            "name": "Pompe Faré Piscine",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C39",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_2_79",
            "name": "Chauffage piscine (PAC ?)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Confirmer présence + type"
          },
          {
            "id": "eq_2_80",
            "name": "Éclairage local technique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans EL03/EL04",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r2",
        "name": "TD-ACCUEIL · Accueil",
        "equipment": [
          {
            "id": "eq_2_43",
            "name": "Imprimantes, photocopieurs",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Comptage global"
          },
          {
            "id": "eq_2_44",
            "name": "Climatisation Accueil / réception",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C34b TC-Accueil",
            "aVerifier": "Relever groupes + unités"
          },
          {
            "id": "eq_2_45",
            "name": "Éclairage Accueil / réception",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan EL02 + LUST01",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_46",
            "name": "Prises & matériel comptoir réception",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r3",
        "name": "TD-ADMIN · Bureaux admin",
        "equipment": [
          {
            "id": "eq_2_48",
            "name": "Postes informatiques / bureautique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "~10",
            "ref": "Présomption",
            "aVerifier": "Comptage global"
          },
          {
            "id": "eq_2_50",
            "name": "Climatisation bureaux administration",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "4",
            "ref": "Schéma 42C44a 'C1'",
            "aVerifier": "4 climatiseurs — relever plaques"
          },
          {
            "id": "eq_2_52",
            "name": "VMC + ventilateur d'extraction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C44a 'VMC'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_53",
            "name": "Éclairage bureaux administration",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r4",
        "name": "TD-ADMIN · Local serveur",
        "equipment": [
          {
            "id": "eq_2_47",
            "name": "Serveur informatique central",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Poste continu 24/24"
          },
          {
            "id": "eq_2_51",
            "name": "Climatisation dédiée local serveur",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Confirmer — fonctionne 24/24"
          }
        ]
      },
      {
        "id": "z_c_r5",
        "name": "TD-ADMIN · Local technique",
        "equipment": [
          {
            "id": "eq_2_49",
            "name": "Système GTB / GTC / supervision",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Repère 'GTB'",
            "aVerifier": "Recenser — pilotage du site"
          }
        ]
      },
      {
        "id": "z_c_r6",
        "name": "TD-Cuisine · Cafétéria",
        "equipment": [
          {
            "id": "eq_2_10",
            "name": "Élément self distributeur chaud 3 bacs",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_24",
            "name": "Élément self distributeur froid 3 bacs",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_25",
            "name": "Fontaine réfrigérée",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_39",
            "name": "Machine à café",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r7",
        "name": "TD-Cuisine · Cuisine",
        "equipment": [
          {
            "id": "eq_2_42",
            "name": "Éclairage cuisine et annexes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan EL02 CUIS-ADMIN",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r8",
        "name": "TD-Cuisine · Cuisine (toutes zones)",
        "equipment": [
          {
            "id": "eq_2_40",
            "name": "Petit matériel divers (blenders, mixeurs...)",
            "marque": "",
            "modele": "divers",
            "puissance": "",
            "qte": "~15",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Comptage global"
          }
        ]
      },
      {
        "id": "z_c_r9",
        "name": "TD-Cuisine · Cuisine / Cafétéria",
        "equipment": [
          {
            "id": "eq_2_11",
            "name": "Four micro-ondes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "2",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r10",
        "name": "TD-Cuisine · Cuisine / Garde manger / Cafét.",
        "equipment": [
          {
            "id": "eq_2_18",
            "name": "Armoire réfrigérée 1 porte",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "4",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever (4 unités)"
          }
        ]
      },
      {
        "id": "z_c_r11",
        "name": "TD-Cuisine · Cuisine principale",
        "equipment": [
          {
            "id": "eq_2_1",
            "name": "Four mixte électrique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Plaque kW — PRIORITÉ mesure"
          },
          {
            "id": "eq_2_2",
            "name": "Plaque à induction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "2",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Puissance de plaque"
          },
          {
            "id": "eq_2_3",
            "name": "Salamandre suspendue",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_4",
            "name": "Bain-marie électrique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_5",
            "name": "Passe chauffe-plat",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_6",
            "name": "Thermoplongeur 1200 W",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Confirmer (1,2 kW)"
          },
          {
            "id": "eq_2_7",
            "name": "Cuiseur de riz 10 L",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_8",
            "name": "Fumoir électrique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_9",
            "name": "Toasteur convoyeur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_12",
            "name": "Cellule de refroidissement",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Compresseur — PRIORITÉ mesure"
          },
          {
            "id": "eq_2_13",
            "name": "Congélateur coffre 200 L",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_14",
            "name": "Meuble adossé réfrigéré 2 portes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "3",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever (3 unités)"
          },
          {
            "id": "eq_2_15",
            "name": "Saladette 3 portes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r12",
        "name": "TD-Cuisine · Garde manger",
        "equipment": [
          {
            "id": "eq_2_16",
            "name": "Meuble bas réfrigéré 3 portes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_17",
            "name": "Meuble réfrigéré saladette 2 portes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_32",
            "name": "Machine sous vide",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_33",
            "name": "Hachoir",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_34",
            "name": "Trancheuse électrique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r13",
        "name": "TD-Cuisine · Local CF",
        "equipment": [
          {
            "id": "eq_2_27",
            "name": "Chambre froide positive",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C - FROID",
            "aVerifier": "Compresseur — PRIORITÉ mesure"
          },
          {
            "id": "eq_2_28",
            "name": "Chambre froide négative",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C - FROID",
            "aVerifier": "Compresseur — PRIORITÉ mesure"
          }
        ]
      },
      {
        "id": "z_c_r14",
        "name": "TD-Cuisine · Légumerie",
        "equipment": [
          {
            "id": "eq_2_29",
            "name": "Éplucheuse à légumes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_30",
            "name": "Râpe à coco électrique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r15",
        "name": "TD-Cuisine · Plonge",
        "equipment": [
          {
            "id": "eq_2_31",
            "name": "Lave-vaisselle à capot",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Plaque — PRIORITÉ mesure"
          }
        ]
      },
      {
        "id": "z_c_r16",
        "name": "TD-Cuisine · Pâtisserie",
        "equipment": [
          {
            "id": "eq_2_20",
            "name": "Meuble adossé réfrigéré 3 portes (pâtisserie)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_21",
            "name": "Armoire négative 1 porte",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_22",
            "name": "Armoire positive 1 porte",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_23",
            "name": "Chambre de pousse",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_35",
            "name": "Laminoir Dito Sama",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_36",
            "name": "Pétrin mélangeur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_37",
            "name": "Batteur mélangeur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_38",
            "name": "Sorbetière 5 L",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r17",
        "name": "TD-Cuisine · Zone cuisson",
        "equipment": [
          {
            "id": "eq_2_41",
            "name": "Hotte d'extraction cuisson",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Débit + puissance moteur"
          }
        ]
      },
      {
        "id": "z_c_r18",
        "name": "TD-Cuisine · Zone déboitage",
        "equipment": [
          {
            "id": "eq_2_19",
            "name": "Armoire réfrigérée 2 portes",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_26",
            "name": "Machine à glaçons (déboitage)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire MAINTENANCE",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r19",
        "name": "TD-FARE-BAR · Bar",
        "equipment": [
          {
            "id": "eq_2_54",
            "name": "Tireuse à bière + refroidisseur de fût",
            "marque": "Gamko",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Plaque du groupe froid"
          },
          {
            "id": "eq_2_55",
            "name": "Machine à glaçons — Bar",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_56",
            "name": "Machine à paillette 85 kg/j",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_57",
            "name": "Machine à glaçons — Sea Food",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_58",
            "name": "Lave-verres",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C35a",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_59",
            "name": "Meuble bas réfrigéré 2 portes vitrées",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "3",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever (3 unités)"
          },
          {
            "id": "eq_2_60",
            "name": "Meuble réfrigéré 2 portes pleines",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "2",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_61",
            "name": "Tiroir à bouteilles réfrigéré",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "3",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_62",
            "name": "Cave à vin 110 bouteilles",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "3",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_63",
            "name": "Refroidisseur de fût Gamko 3/4",
            "marque": "Gamko",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_64",
            "name": "Machine à café Nespresso Gemini",
            "marque": "Nespresso",
            "modele": "Gemini",
            "puissance": "",
            "qte": "2",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_65",
            "name": "Ballon ECS Bar",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C35a",
            "aVerifier": "Relever capacité + puissance"
          },
          {
            "id": "eq_2_66",
            "name": "Climatisation Bar",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C35b TC-Bar",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_67",
            "name": "Éclairage Bar",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r20",
        "name": "TD-RESTAURANT · Restaurant",
        "equipment": [
          {
            "id": "eq_2_68",
            "name": "Ballon ECS Restaurant",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C36a",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_2_69",
            "name": "Climatisation Restaurant",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C36b TC-Resto",
            "aVerifier": "Poste important — relever groupes"
          },
          {
            "id": "eq_2_70",
            "name": "Éclairage Restaurant",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r21",
        "name": "TD-SANITAIRES · Local sanitaires",
        "equipment": [
          {
            "id": "eq_2_81",
            "name": "PAC ECS centrale",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C38",
            "aVerifier": "Type PAC + COP sur plaque"
          },
          {
            "id": "eq_2_82",
            "name": "Ballon ECS centrale",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C38",
            "aVerifier": "Capacité + puissance appoint"
          },
          {
            "id": "eq_2_83",
            "name": "Pompe de bouclage ECS",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schémas 42C",
            "aVerifier": "Anti-légionellose"
          },
          {
            "id": "eq_2_84",
            "name": "Sèche-mains électriques",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C38",
            "aVerifier": "Compter + relever puissance"
          },
          {
            "id": "eq_2_85",
            "name": "Éclairage local Production ECS",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C38",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_c_r22",
        "name": "Éclairage extérieur & VRD (départ aval TG-C) · Accès site",
        "equipment": [
          {
            "id": "eq_2_89",
            "name": "Portails / barrières motorisés",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Recenser"
          }
        ]
      },
      {
        "id": "z_c_r23",
        "name": "Éclairage extérieur & VRD (départ aval TG-C) · Local technique extérieur",
        "equipment": [
          {
            "id": "eq_2_88",
            "name": "Surpresseur / pompe d'arrosage",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Confirmer + relever"
          }
        ]
      },
      {
        "id": "z_c_r24",
        "name": "Éclairage extérieur & VRD (départ aval TG-C) · Parking",
        "equipment": [
          {
            "id": "eq_2_90",
            "name": "Bornes de recharge véhicules (IRVE)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Confirmer présence"
          }
        ]
      },
      {
        "id": "z_c_r25",
        "name": "Éclairage extérieur & VRD (départ aval TG-C) · Tout le site",
        "equipment": [
          {
            "id": "eq_2_87",
            "name": "Éclairage de sécurité (BAES)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Dossier partagé 08",
            "aVerifier": "Compter + relever"
          },
          {
            "id": "eq_2_91",
            "name": "Luminaires LED + drivers",
            "marque": "",
            "modele": "drivers SNP20-VF",
            "puissance": "",
            "qte": "1",
            "ref": "Dossier partagé 08",
            "aVerifier": "Croiser avec l'inventaire 08-Éclairage"
          }
        ]
      },
      {
        "id": "z_c_r26",
        "name": "Éclairage extérieur & VRD (départ aval TG-C) · Voiries / espaces verts",
        "equipment": [
          {
            "id": "eq_2_86",
            "name": "Éclairage extérieur voiries / espaces verts",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans EL00.1/00.2 VRD",
            "aVerifier": "Relever bornes + projecteurs"
          }
        ]
      }
    ]
  },
  {
    "id": "z_lt1",
    "name": "TD-LT1",
    "fullName": "Local Technique 1",
    "kVA": "130 kVA",
    "rooms": [
      {
        "id": "z_lt1_r1",
        "name": "TD-LT2 · THQ-LT2 · Local technique 2",
        "equipment": [
          {
            "id": "eq_3_25",
            "name": "Éclairage & prises communs (THQ-LT2)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r2",
        "name": "TD-LT2 · TT-LAG — Bungalows Lagune · Bungalow",
        "equipment": [
          {
            "id": "eq_3_15",
            "name": "Climatiseur (split réversible)",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'C1'",
            "aVerifier": "Relever plaque — RELEVER 1 BUNGALOW TYPE"
          },
          {
            "id": "eq_3_17",
            "name": "VMC / extraction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'VMC'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_18",
            "name": "Mini-bar / réfrigérateur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Mini-bar'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_19",
            "name": "Téléviseur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_20",
            "name": "Pompe (booster ECS)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Pompe'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_22",
            "name": "Coffre-fort + sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_23",
            "name": "Module domotique KNX",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'GTC'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r3",
        "name": "TD-LT2 · TT-LAG — Bungalows Lagune · Bungalow + terrasse",
        "equipment": [
          {
            "id": "eq_3_24",
            "name": "Éclairage intérieur + terrasse",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan lustrerie EL06",
            "aVerifier": "Relever 1 bungalow type"
          }
        ]
      },
      {
        "id": "z_lt1_r4",
        "name": "TD-LT2 · TT-LAG — Bungalows Lagune · Sous-bassement bungalow",
        "equipment": [
          {
            "id": "eq_3_16",
            "name": "PAC ECS bungalow Lagune",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53",
            "aVerifier": "Relever 1 type"
          }
        ]
      },
      {
        "id": "z_lt1_r5",
        "name": "TD-LT2 · TT-LAG — Bungalows Lagune · Terrasse",
        "equipment": [
          {
            "id": "eq_3_21",
            "name": "Borne / prise extérieure",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Bornes'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r6",
        "name": "TD-LT3 · THQ-LT3 · Local technique 3",
        "equipment": [
          {
            "id": "eq_3_26",
            "name": "Éclairage & prises communs (THQ-LT3)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r7",
        "name": "TD-LT3 · TT-LAG — Bungalows Lagune · Bungalow",
        "equipment": [
          {
            "id": "eq_3_27",
            "name": "Climatiseur (split réversible)",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'C1'",
            "aVerifier": "Relever plaque — RELEVER 1 BUNGALOW TYPE"
          },
          {
            "id": "eq_3_29",
            "name": "VMC / extraction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'VMC'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_30",
            "name": "Mini-bar / réfrigérateur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Mini-bar'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_31",
            "name": "Téléviseur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_32",
            "name": "Pompe (booster ECS)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Pompe'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_34",
            "name": "Coffre-fort + sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_35",
            "name": "Module domotique KNX",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'GTC'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r8",
        "name": "TD-LT3 · TT-LAG — Bungalows Lagune · Bungalow + terrasse",
        "equipment": [
          {
            "id": "eq_3_36",
            "name": "Éclairage intérieur + terrasse",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan lustrerie EL06",
            "aVerifier": "Relever 1 bungalow type"
          }
        ]
      },
      {
        "id": "z_lt1_r9",
        "name": "TD-LT3 · TT-LAG — Bungalows Lagune · Sous-bassement bungalow",
        "equipment": [
          {
            "id": "eq_3_28",
            "name": "PAC ECS bungalow Lagune",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53",
            "aVerifier": "Relever 1 type"
          }
        ]
      },
      {
        "id": "z_lt1_r10",
        "name": "TD-LT3 · TT-LAG — Bungalows Lagune · Terrasse",
        "equipment": [
          {
            "id": "eq_3_33",
            "name": "Borne / prise extérieure",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Bornes'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r11",
        "name": "TD-LT3 · TT-Lingerie3 — Lingerie LT3 · Lingerie LT3",
        "equipment": [
          {
            "id": "eq_3_57",
            "name": "Lave-linge lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_58",
            "name": "Sèche-linge lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_59",
            "name": "Éclairage + prises lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r12",
        "name": "TD-LT3 · TT-SEAFOOD — Restaurant Sea Food · Cuisine Sea Food",
        "equipment": [
          {
            "id": "eq_3_48",
            "name": "Plancha Sea Food",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C60",
            "aVerifier": "Plaque — PRIORITÉ mesure"
          },
          {
            "id": "eq_3_49",
            "name": "Barbecue Sea Food",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "3",
            "ref": "Schéma 42C60",
            "aVerifier": "Relever (3 unités)"
          },
          {
            "id": "eq_3_50",
            "name": "Hotte Sea Food + caisson",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C60",
            "aVerifier": "Débit + moteur"
          }
        ]
      },
      {
        "id": "z_lt1_r13",
        "name": "TD-LT3 · TT-SEAFOOD — Restaurant Sea Food · Office",
        "equipment": [
          {
            "id": "eq_3_47",
            "name": "Machine à glaçons — Office",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r14",
        "name": "TD-LT3 · TT-SEAFOOD — Restaurant Sea Food · Office SF",
        "equipment": [
          {
            "id": "eq_3_51",
            "name": "Lave-vaisselle / plonge Sea Food",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C60",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r15",
        "name": "TD-LT3 · TT-SEAFOOD — Restaurant Sea Food · Sea Food",
        "equipment": [
          {
            "id": "eq_3_52",
            "name": "Meubles réfrigérés Sea Food",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "2",
            "ref": "Schéma 42C60",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_53",
            "name": "Perco",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Inventaire RESTO BAR",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_54",
            "name": "PAC ECS Sea Food",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C60",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_55",
            "name": "Climatisation Sea Food",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C61 TC Sea Food",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_56",
            "name": "Éclairage Sea Food",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r16",
        "name": "TD-LT3 · TT-SPA — SPA / Fitness · Local technique SPA",
        "equipment": [
          {
            "id": "eq_3_38",
            "name": "Pompe SPA",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C55",
            "aVerifier": "Relever plaque"
          }
        ]
      },
      {
        "id": "z_lt1_r17",
        "name": "TD-LT3 · TT-SPA — SPA / Fitness · SPA",
        "equipment": [
          {
            "id": "eq_3_39",
            "name": "Sonorisation SPA / Fitness",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C55",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_41",
            "name": "Jacuzzi",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "—",
            "aVerifier": "Confirmer présence"
          },
          {
            "id": "eq_3_42",
            "name": "Sauna",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "—",
            "aVerifier": "Confirmer présence + puissance résistances"
          },
          {
            "id": "eq_3_43",
            "name": "Hammam (générateur de vapeur)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "—",
            "aVerifier": "Confirmer présence"
          },
          {
            "id": "eq_3_45",
            "name": "Extraction SPA",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C55 'Extr'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r18",
        "name": "TD-LT3 · TT-SPA — SPA / Fitness · SPA / fitness",
        "equipment": [
          {
            "id": "eq_3_46",
            "name": "Éclairage SPA / Fitness",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans EL11 / CL11",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r19",
        "name": "TD-LT3 · TT-SPA — SPA / Fitness · SPA / salle fitness",
        "equipment": [
          {
            "id": "eq_3_44",
            "name": "Climatisation SPA / Fitness",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C55 'CLIM'",
            "aVerifier": "Relever groupe(s) + unités"
          }
        ]
      },
      {
        "id": "z_lt1_r20",
        "name": "TD-LT3 · TT-SPA — SPA / Fitness · Salle fitness",
        "equipment": [
          {
            "id": "eq_3_37",
            "name": "Réfrigérateur fitness",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C55",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_40",
            "name": "Équipements fitness (tapis, vélos)",
            "marque": "Techno Gym",
            "modele": "voir devis",
            "puissance": "",
            "qte": "1",
            "ref": "Devis Techno Gym",
            "aVerifier": "Confirmer la liste"
          }
        ]
      },
      {
        "id": "z_lt1_r21",
        "name": "THQ-LT1 — Tableau éclairage / prises communs LT1 · Local technique 1",
        "equipment": [
          {
            "id": "eq_3_14",
            "name": "Éclairage & prises communs (THQ-LT1)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r22",
        "name": "TT-LAG — Bungalows Lagune · Bungalow",
        "equipment": [
          {
            "id": "eq_3_1",
            "name": "Climatiseur (split réversible)",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'C1'",
            "aVerifier": "Relever plaque — RELEVER 1 BUNGALOW TYPE"
          },
          {
            "id": "eq_3_3",
            "name": "VMC / extraction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'VMC'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_4",
            "name": "Mini-bar / réfrigérateur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Mini-bar'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_5",
            "name": "Téléviseur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_6",
            "name": "Pompe (booster ECS)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Pompe'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_8",
            "name": "Coffre-fort + sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_9",
            "name": "Module domotique KNX",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'GTC'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r23",
        "name": "TT-LAG — Bungalows Lagune · Bungalow + terrasse",
        "equipment": [
          {
            "id": "eq_3_10",
            "name": "Éclairage intérieur + terrasse",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan lustrerie EL06",
            "aVerifier": "Relever 1 bungalow type"
          }
        ]
      },
      {
        "id": "z_lt1_r24",
        "name": "TT-LAG — Bungalows Lagune · Sous-bassement bungalow",
        "equipment": [
          {
            "id": "eq_3_2",
            "name": "PAC ECS bungalow Lagune",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53",
            "aVerifier": "Relever 1 type"
          }
        ]
      },
      {
        "id": "z_lt1_r25",
        "name": "TT-LAG — Bungalows Lagune · Terrasse",
        "equipment": [
          {
            "id": "eq_3_7",
            "name": "Borne / prise extérieure",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Bornes'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt1_r26",
        "name": "TT-Lingerie — Lingerie LT1 · Lingerie LT1",
        "equipment": [
          {
            "id": "eq_3_11",
            "name": "Lave-linge lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_12",
            "name": "Sèche-linge lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_3_13",
            "name": "Éclairage + prises lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      }
    ]
  },
  {
    "id": "z_lt4",
    "name": "TD-LT4",
    "fullName": "Local Technique 4",
    "kVA": "130 kVA",
    "rooms": [
      {
        "id": "z_lt4_r1",
        "name": "Chambres RS (à confirmer) · Bâtiment chambres RS · Cage d'ascenseur",
        "equipment": [
          {
            "id": "eq_4_50",
            "name": "Ascenseur du bâtiment RS",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Confirmer présence + relever"
          }
        ]
      },
      {
        "id": "z_lt4_r2",
        "name": "Chambres RS (à confirmer) · Bâtiment chambres RS · Chambres",
        "equipment": [
          {
            "id": "eq_4_46",
            "name": "Mini-bars / réfrigérateurs de chambre",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56",
            "aVerifier": "Poste continu — relever 1 type"
          },
          {
            "id": "eq_4_47",
            "name": "Téléviseurs de chambre",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever 1 type + compter"
          },
          {
            "id": "eq_4_48",
            "name": "Coffres-forts + sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Compter / relever"
          }
        ]
      },
      {
        "id": "z_lt4_r3",
        "name": "Chambres RS (à confirmer) · Bâtiment chambres RS · Chambres + circulations",
        "equipment": [
          {
            "id": "eq_4_43",
            "name": "Climatisation des chambres RS",
            "marque": "GREE",
            "modele": "GMV5 DRV / splits",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56",
            "aVerifier": "Type de système — relever"
          },
          {
            "id": "eq_4_44",
            "name": "Éclairage chambres RS, circulations",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 'Liseuse'",
            "aVerifier": "Relever 1 chambre type"
          }
        ]
      },
      {
        "id": "z_lt4_r4",
        "name": "Chambres RS (à confirmer) · Bâtiment chambres RS · Gaines / toiture",
        "equipment": [
          {
            "id": "eq_4_45",
            "name": "VMC / extraction sanitaires RS",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans CL09 / CL10",
            "aVerifier": "Relever caissons VMC"
          }
        ]
      },
      {
        "id": "z_lt4_r5",
        "name": "Chambres RS (à confirmer) · Bâtiment chambres RS · Local buanderie d'étage",
        "equipment": [
          {
            "id": "eq_4_51",
            "name": "Buanderie d'étage RS",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans CL09 / CL10",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r6",
        "name": "Chambres RS (à confirmer) · Bâtiment chambres RS · Terrasses chambres",
        "equipment": [
          {
            "id": "eq_4_49",
            "name": "Bornes / prises terrasses",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r7",
        "name": "TD-LT5 · THQ-LT5 · Local technique 5",
        "equipment": [
          {
            "id": "eq_4_42",
            "name": "Éclairage & prises communs (THQ-LT5)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r8",
        "name": "TD-LT5 · TT-PL — Bungalows Plage · Bungalow",
        "equipment": [
          {
            "id": "eq_4_33",
            "name": "Climatiseur (split réversible)",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C54 'C1'",
            "aVerifier": "Relever plaque — RELEVER 1 BUNGALOW TYPE"
          },
          {
            "id": "eq_4_35",
            "name": "VMC / extraction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C54 'VMC'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_36",
            "name": "Mini-bar / réfrigérateur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C54 'Mini-bar'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_37",
            "name": "Téléviseur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_38",
            "name": "Pompe (booster ECS)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C54 'Pompe'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_40",
            "name": "Coffre-fort + sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r9",
        "name": "TD-LT5 · TT-PL — Bungalows Plage · Bungalow + terrasse",
        "equipment": [
          {
            "id": "eq_4_41",
            "name": "Éclairage intérieur + terrasse",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan lustrerie EL06",
            "aVerifier": "Relever 1 bungalow type"
          }
        ]
      },
      {
        "id": "z_lt4_r10",
        "name": "TD-LT5 · TT-PL — Bungalows Plage · Sous-bassement bungalow",
        "equipment": [
          {
            "id": "eq_4_34",
            "name": "PAC ECS bungalow Plage",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C54",
            "aVerifier": "Relever 1 type"
          }
        ]
      },
      {
        "id": "z_lt4_r11",
        "name": "TD-LT5 · TT-PL — Bungalows Plage · Terrasse",
        "equipment": [
          {
            "id": "eq_4_39",
            "name": "Borne / prise extérieure",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C54 'Bornes'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r12",
        "name": "THQ-LT4 · Local technique 4",
        "equipment": [
          {
            "id": "eq_4_32",
            "name": "Éclairage & prises communs (THQ-LT4)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r13",
        "name": "TT-BUAND-N — Buanderie d'étage bât. N · Buanderie N",
        "equipment": [
          {
            "id": "eq_4_31",
            "name": "Buanderie d'étage N (lave-linge + sèche-linge)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r14",
        "name": "TT-BUAND-O — Buanderie d'étage bât. O · Buanderie O",
        "equipment": [
          {
            "id": "eq_4_30",
            "name": "Buanderie d'étage O (lave-linge + sèche-linge)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r15",
        "name": "TT-CH — Chambres · Cage d'ascenseur",
        "equipment": [
          {
            "id": "eq_4_18",
            "name": "Ascenseur du bâtiment O",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Confirmer présence + relever"
          },
          {
            "id": "eq_4_28",
            "name": "Ascenseur du bâtiment N",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Confirmer présence + relever"
          }
        ]
      },
      {
        "id": "z_lt4_r16",
        "name": "TT-CH — Chambres · Chambres",
        "equipment": [
          {
            "id": "eq_4_13",
            "name": "Mini-bars / réfrigérateurs de chambre",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 'Mini-bar'",
            "aVerifier": "Poste continu — relever 1 type"
          },
          {
            "id": "eq_4_14",
            "name": "Téléviseurs de chambre",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever 1 type + compter"
          },
          {
            "id": "eq_4_15",
            "name": "Coffres-forts électroniques",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Compter"
          },
          {
            "id": "eq_4_16",
            "name": "Sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever puissance + compter"
          },
          {
            "id": "eq_4_23",
            "name": "Mini-bars / réfrigérateurs de chambre",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 'Mini-bar'",
            "aVerifier": "Poste continu — relever 1 type"
          },
          {
            "id": "eq_4_24",
            "name": "Téléviseurs de chambre",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever 1 type + compter"
          },
          {
            "id": "eq_4_25",
            "name": "Coffres-forts électroniques",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Compter"
          },
          {
            "id": "eq_4_26",
            "name": "Sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever puissance + compter"
          }
        ]
      },
      {
        "id": "z_lt4_r17",
        "name": "TT-CH — Chambres · Chambres + circulations",
        "equipment": [
          {
            "id": "eq_4_10",
            "name": "Climatisation des chambres O (VRV)",
            "marque": "GREE",
            "modele": "GMV5 DRV / splits",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 / VRV BAT O",
            "aVerifier": "Type de système — relever groupes ext."
          },
          {
            "id": "eq_4_11",
            "name": "Éclairage chambres O, circulations, communs",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 'Liseuse'",
            "aVerifier": "Relever 1 chambre type"
          },
          {
            "id": "eq_4_20",
            "name": "Climatisation des chambres N (VRV)",
            "marque": "GREE",
            "modele": "GMV5 DRV / splits",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 / VRV BAT N",
            "aVerifier": "Type de système — relever groupes ext."
          },
          {
            "id": "eq_4_21",
            "name": "Éclairage chambres N, circulations, communs",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 'Liseuse'",
            "aVerifier": "Relever 1 chambre type"
          }
        ]
      },
      {
        "id": "z_lt4_r18",
        "name": "TT-CH — Chambres · Gaines / toiture",
        "equipment": [
          {
            "id": "eq_4_12",
            "name": "VMC / extraction sanitaires O",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans CL06 / CL07",
            "aVerifier": "Relever caissons VMC"
          },
          {
            "id": "eq_4_22",
            "name": "VMC / extraction sanitaires N",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans CL06 / CL07",
            "aVerifier": "Relever caissons VMC"
          }
        ]
      },
      {
        "id": "z_lt4_r19",
        "name": "TT-CH — Chambres · Local buanderie d'étage",
        "equipment": [
          {
            "id": "eq_4_19",
            "name": "Buanderie d'étage O",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C62 TT Buanderie-O",
            "aVerifier": "Relever (clim + équipements)"
          },
          {
            "id": "eq_4_29",
            "name": "Buanderie d'étage N",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C63 TT Buanderie-N",
            "aVerifier": "Relever (clim + équipements)"
          }
        ]
      },
      {
        "id": "z_lt4_r20",
        "name": "TT-CH — Chambres · Terrasses chambres",
        "equipment": [
          {
            "id": "eq_4_17",
            "name": "Bornes / prises terrasses",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 'Bornes'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_27",
            "name": "Bornes / prises terrasses",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C56 'Bornes'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r21",
        "name": "TT-FOR — Bungalows Forêt · Bungalow",
        "equipment": [
          {
            "id": "eq_4_1",
            "name": "Climatiseur (split réversible)",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C52 'C1'",
            "aVerifier": "Relever plaque — RELEVER 1 BUNGALOW TYPE"
          },
          {
            "id": "eq_4_3",
            "name": "VMC / extraction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C52 'VMC'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_4",
            "name": "Mini-bar / réfrigérateur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C52 'Mini-bar'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_5",
            "name": "Téléviseur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_6",
            "name": "Pompe (booster ECS)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C52 'Pompe'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_4_8",
            "name": "Coffre-fort + sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt4_r22",
        "name": "TT-FOR — Bungalows Forêt · Bungalow + terrasse",
        "equipment": [
          {
            "id": "eq_4_9",
            "name": "Éclairage intérieur + terrasse",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan lustrerie EL06",
            "aVerifier": "Relever 1 bungalow type"
          }
        ]
      },
      {
        "id": "z_lt4_r23",
        "name": "TT-FOR — Bungalows Forêt · Sous-bassement bungalow",
        "equipment": [
          {
            "id": "eq_4_2",
            "name": "PAC ECS bungalow Forêt",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C52",
            "aVerifier": "Relever 1 type"
          }
        ]
      },
      {
        "id": "z_lt4_r24",
        "name": "TT-FOR — Bungalows Forêt · Terrasse",
        "equipment": [
          {
            "id": "eq_4_7",
            "name": "Borne / prise extérieure",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C52 'Bornes'",
            "aVerifier": "Relever"
          }
        ]
      }
    ]
  },
  {
    "id": "z_lt6",
    "name": "TD-LT6",
    "fullName": "Local Technique 6",
    "kVA": "30 kVA",
    "rooms": [
      {
        "id": "z_lt6_r1",
        "name": "THQ-LT6 · Local technique 6",
        "equipment": [
          {
            "id": "eq_5_11",
            "name": "Éclairage & prises communs (THQ-LT6)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt6_r2",
        "name": "TT-LAG — Bungalows Lagune · Bungalow",
        "equipment": [
          {
            "id": "eq_5_1",
            "name": "Climatiseur (split réversible)",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'C1'",
            "aVerifier": "Relever plaque — RELEVER 1 BUNGALOW TYPE"
          },
          {
            "id": "eq_5_3",
            "name": "VMC / extraction",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'VMC'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_5_4",
            "name": "Mini-bar / réfrigérateur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Mini-bar'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_5_5",
            "name": "Téléviseur",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_5_6",
            "name": "Pompe (booster ECS)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Pompe'",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_5_8",
            "name": "Coffre-fort + sèche-cheveux",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Présomption",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_5_9",
            "name": "Module domotique KNX",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'GTC'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt6_r3",
        "name": "TT-LAG — Bungalows Lagune · Bungalow + terrasse",
        "equipment": [
          {
            "id": "eq_5_10",
            "name": "Éclairage intérieur + terrasse",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plan lustrerie EL06",
            "aVerifier": "Relever 1 bungalow type"
          }
        ]
      },
      {
        "id": "z_lt6_r4",
        "name": "TT-LAG — Bungalows Lagune · Sous-bassement bungalow",
        "equipment": [
          {
            "id": "eq_5_2",
            "name": "PAC ECS bungalow Lagune",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53",
            "aVerifier": "Relever 1 type"
          }
        ]
      },
      {
        "id": "z_lt6_r5",
        "name": "TT-LAG — Bungalows Lagune · Terrasse",
        "equipment": [
          {
            "id": "eq_5_7",
            "name": "Borne / prise extérieure",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C53 'Bornes'",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt6_r6",
        "name": "TT-Lingerie2 — Lingerie LT6 · Lingerie LT6",
        "equipment": [
          {
            "id": "eq_5_12",
            "name": "Lave-linge lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_5_13",
            "name": "Sèche-linge lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_5_14",
            "name": "Éclairage + prises lingerie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      }
    ]
  },
  {
    "id": "z_lt7",
    "name": "TD-LT7",
    "fullName": "Local Technique 7",
    "kVA": "70 kVA",
    "rooms": [
      {
        "id": "z_lt7_r1",
        "name": "Logements du personnel · Logements",
        "equipment": [
          {
            "id": "eq_6_5",
            "name": "Éclairage des logements",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Plans EL09",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt7_r2",
        "name": "Logements du personnel · Logements F1/F2/F4",
        "equipment": [
          {
            "id": "eq_6_4",
            "name": "Climatiseurs / PAC réversibles logements",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schémas 42C57/58/59",
            "aVerifier": "Relever par typologie"
          }
        ]
      },
      {
        "id": "z_lt7_r3",
        "name": "Logements du personnel · Logements personnel",
        "equipment": [
          {
            "id": "eq_6_1",
            "name": "PAC réversible / ECS logements",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schémas 42C57/58/59",
            "aVerifier": "Relever par typologie"
          },
          {
            "id": "eq_6_2",
            "name": "Cuisines + équipements logements",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schémas 42C57/58/59",
            "aVerifier": "Relever (plaques, hottes)"
          },
          {
            "id": "eq_6_3",
            "name": "Pompes logements personnel",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schémas 42C57/58/59",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_lt7_r4",
        "name": "THQ-LT7 · Local technique 7",
        "equipment": [
          {
            "id": "eq_6_6",
            "name": "Éclairage & prises communs (THQ-LT7)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      }
    ]
  },
  {
    "id": "z_atelier",
    "name": "TD-ATELIER",
    "fullName": "Atelier maintenance",
    "kVA": "27.7 kVA",
    "rooms": [
      {
        "id": "z_atelier_r1",
        "name": "Atelier",
        "equipment": [
          {
            "id": "eq_7_1",
            "name": "Machines & outillage atelier",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_7_2",
            "name": "Éclairage & prises atelier",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      }
    ]
  },
  {
    "id": "z_sp",
    "name": "TD-SP",
    "fullName": "Salle Polyvalente",
    "kVA": "43.7 kVA",
    "rooms": [
      {
        "id": "z_sp_r1",
        "name": "Grande salle · Grande salle",
        "equipment": [
          {
            "id": "eq_8_1",
            "name": "PAC réversible + ballon tampon",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C32a 'PAC'",
            "aVerifier": "Relever PAC + ballon"
          },
          {
            "id": "eq_8_2",
            "name": "Climatiseurs Salle Polyvalente",
            "marque": "GREE",
            "modele": "",
            "puissance": "",
            "qte": "3",
            "ref": "Schéma 42C32a 'C1'",
            "aVerifier": "3 climatiseurs — relever plaques"
          },
          {
            "id": "eq_8_3",
            "name": "Éclairage grande salle",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_8_4",
            "name": "Prises & sonorisation",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_sp_r2",
        "name": "LAGUNARIUM · LT-Lagunarium",
        "equipment": [
          {
            "id": "eq_8_11",
            "name": "Pompe de circulation lagunarium n°1",
            "marque": "Xylem",
            "modele": "NSCF 100-250/75/P45",
            "puissance": "",
            "qte": "1",
            "ref": "Note de calcul PDC",
            "aVerifier": "150 m³/h avec variateur — relever plaque"
          },
          {
            "id": "eq_8_12",
            "name": "Pompe de circulation lagunarium n°2",
            "marque": "Xylem",
            "modele": "NSCF 100-250/75/P45",
            "puissance": "",
            "qte": "1",
            "ref": "Note de calcul PDC",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_8_13",
            "name": "Pompe de circulation lagunarium n°3",
            "marque": "Xylem",
            "modele": "NSCF 100-250/75/P45",
            "puissance": "",
            "qte": "1",
            "ref": "Note de calcul PDC",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_8_14",
            "name": "Variateurs de vitesse pompes lagune",
            "marque": "",
            "modele": "variateurs",
            "puissance": "",
            "qte": "3",
            "ref": "Analyse fonctionnelle",
            "aVerifier": "Marque / modèle variateurs"
          },
          {
            "id": "eq_8_15",
            "name": "Surpresseur d'air lagunarium",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "—",
            "aVerifier": "Confirmer présence"
          },
          {
            "id": "eq_8_16",
            "name": "Système UV / ozonation lagune",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "—",
            "aVerifier": "Confirmer présence"
          }
        ]
      },
      {
        "id": "z_sp_r3",
        "name": "LAGUNARIUM · Local Lagunarium",
        "equipment": [
          {
            "id": "eq_8_17",
            "name": "Éclairage du local Lagunarium",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "NOTICES Lagune",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_sp_r4",
        "name": "Office · Office",
        "equipment": [
          {
            "id": "eq_8_5",
            "name": "Éclairage + prises office",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_sp_r5",
        "name": "Salle de rangement · Salle rangement",
        "equipment": [
          {
            "id": "eq_8_6",
            "name": "Éclairage salle de rangement",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_sp_r6",
        "name": "Sanitaires · Sanitaire F",
        "equipment": [
          {
            "id": "eq_8_7",
            "name": "Éclairage Sanitaire F",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_sp_r7",
        "name": "Sanitaires · Sanitaire H",
        "equipment": [
          {
            "id": "eq_8_8",
            "name": "Éclairage Sanitaire H",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_sp_r8",
        "name": "Sanitaires · Sanitaires",
        "equipment": [
          {
            "id": "eq_8_10",
            "name": "Extracteurs de ventilation sanitaires",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "3",
            "ref": "Schéma 42C32a 'Extr'",
            "aVerifier": "3 extracteurs"
          }
        ]
      },
      {
        "id": "z_sp_r9",
        "name": "Sanitaires · WC PMR",
        "equipment": [
          {
            "id": "eq_8_9",
            "name": "Éclairage WC PMR",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "",
            "aVerifier": "Relever"
          }
        ]
      }
    ]
  },
  {
    "id": "z_step",
    "name": "STEP",
    "fullName": "Station d'épuration",
    "kVA": "22.2 kVA",
    "rooms": [
      {
        "id": "z_step_r1",
        "name": "Bassin relevage entrée",
        "equipment": [
          {
            "id": "eq_9_1",
            "name": "Pompe de relevage entrée STEP",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "2",
            "ref": "DOE STEP*",
            "aVerifier": "Relever plaques (2 pompes)"
          }
        ]
      },
      {
        "id": "z_step_r2",
        "name": "Entrée STEP",
        "equipment": [
          {
            "id": "eq_9_2",
            "name": "Dégrilleur automatique",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Notice moteur (SharePoint)"
          }
        ]
      },
      {
        "id": "z_step_r3",
        "name": "Local STEP",
        "equipment": [
          {
            "id": "eq_9_15",
            "name": "Éclairage du local STEP",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_step_r4",
        "name": "Réseau",
        "equipment": [
          {
            "id": "eq_9_14",
            "name": "Postes de relevage réseau",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Localiser + relever"
          }
        ]
      },
      {
        "id": "z_step_r5",
        "name": "STEP",
        "equipment": [
          {
            "id": "eq_9_3",
            "name": "Décanteur primaire 20 m³",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Équipement éventuellement motorisé"
          },
          {
            "id": "eq_9_4",
            "name": "Cuves dénitrification",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Relever si motorisé"
          },
          {
            "id": "eq_9_5",
            "name": "Biodisques",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Relever moteur d'entraînement"
          },
          {
            "id": "eq_9_6",
            "name": "Pompe de relevage sortie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_9_7",
            "name": "Système UV",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Notice électrique (SharePoint)"
          },
          {
            "id": "eq_9_8",
            "name": "Surpresseur EI",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_9_9",
            "name": "Surpresseur d'air STEP",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Élément majeur de consommation"
          },
          {
            "id": "eq_9_10",
            "name": "Pompe de lavage filtre",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_9_11",
            "name": "Compresseur d'air STEP",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_9_12",
            "name": "Coffret chlorure ferrique (pompe dosage)",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Relever"
          },
          {
            "id": "eq_9_13",
            "name": "Armoire électrique STEP + automate",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "DOE STEP*",
            "aVerifier": "Photographier la face avant"
          }
        ]
      }
    ]
  },
  {
    "id": "z_pomperie",
    "name": "POMPERIE",
    "fullName": "Pomperie générale",
    "kVA": "20.4 kVA",
    "rooms": [
      {
        "id": "z_pomperie_r1",
        "name": "Local DI",
        "equipment": [
          {
            "id": "eq_10_4",
            "name": "Pompe défense incendie RIA n°1",
            "marque": "Lowara",
            "modele": "surpresseur IE3",
            "puissance": "",
            "qte": "1",
            "ref": "Notice surpresseur",
            "aVerifier": "4 kW / 7,56 A"
          },
          {
            "id": "eq_10_5",
            "name": "Pompe défense incendie RIA n°2",
            "marque": "Lowara",
            "modele": "surpresseur IE3",
            "puissance": "",
            "qte": "1",
            "ref": "Notice surpresseur",
            "aVerifier": "Confirmer"
          },
          {
            "id": "eq_10_6",
            "name": "Pompe jockey DI (secours)",
            "marque": "Lowara",
            "modele": "surpresseur",
            "puissance": "",
            "qte": "1",
            "ref": "Notice surpresseur",
            "aVerifier": "Confirmer"
          }
        ]
      },
      {
        "id": "z_pomperie_r2",
        "name": "Local Pomperie",
        "equipment": [
          {
            "id": "eq_10_8",
            "name": "Éclairage du local Pomperie",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "Schéma 42C",
            "aVerifier": "Relever"
          }
        ]
      },
      {
        "id": "z_pomperie_r3",
        "name": "Pomperie",
        "equipment": [
          {
            "id": "eq_10_1",
            "name": "Pompe eau potable n°1",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "NDC folio 16",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_10_2",
            "name": "Pompe eau potable n°2",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "NDC folio 16",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_10_3",
            "name": "Surpresseur eau froide bâtiments",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "NDC folio 16",
            "aVerifier": "Relever plaque"
          },
          {
            "id": "eq_10_7",
            "name": "Adoucisseur d'eau",
            "marque": "",
            "modele": "",
            "puissance": "",
            "qte": "1",
            "ref": "—",
            "aVerifier": "Confirmer présence"
          }
        ]
      }
    ]
  }
];

function findZone(zoneId) {
  return zones.find(z => z.id === zoneId);
}

function findRoom(zoneId, roomId) {
  const zone = findZone(zoneId);
  return zone ? zone.rooms.find(r => r.id === roomId) : null;
}

function findEquipment(zoneId, roomId, equipId) {
  const room = findRoom(zoneId, roomId);
  return room ? room.equipment.find(e => e.id === equipId) : null;
}
