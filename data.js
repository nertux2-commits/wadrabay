// WADRA Bay — Hiérarchie complète : TD → Pièce → Équipement
// Structure de base avec les TDs et pièces du fichier Excel

const zones = [
  // TGBT — Poste HT-BT, Transfo, Groupe électrogène
  {
    id: "z_tgbt",
    name: "TGBT",
    fullName: "Poste HT-BT / Transformateur 630 kVA / Groupe électrogène",
    kVA: "630 kVA",
    rooms: [
      { id: "z_tgbt_r_poste", name: "Poste HT-BT", equipment: [] },
      { id: "z_tgbt_r_groupe", name: "Local groupe", equipment: [] },
      { id: "z_tgbt_r_pied", name: "Pied TGBT", equipment: [] },
      { id: "z_tgbt_r_local_poste", name: "Local poste", equipment: [] }
    ]
  },

  // TG-SG — Services Généraux (Bât. I)
  {
    id: "z_sg",
    name: "TG-SG",
    fullName: "Services Généraux (Bât. I)",
    kVA: "200 kVA",
    rooms: [
      { id: "z_sg_r_laverie", name: "Laverie", equipment: [] },
      { id: "z_sg_r_repassage", name: "Repassage", equipment: [] },
      { id: "z_sg_r_buanderie_perso", name: "Buanderie personnel", equipment: [] },
      { id: "z_sg_r_bureau_gouv", name: "Bureau gouvernante", equipment: [] },
      { id: "z_sg_r_facade", name: "Façade Bât. I", equipment: [] },
      { id: "z_sg_r_local_cf", name: "Local CF", equipment: [] },
      { id: "z_sg_r_local_ecs", name: "Local ECS", equipment: [] },
      { id: "z_sg_r_reserve", name: "Réserve", equipment: [] },
      { id: "z_sg_r_sanitaires", name: "Sanitaires", equipment: [] },
      { id: "z_sg_r_sanitaires_f", name: "Sanitaires F", equipment: [] },
      { id: "z_sg_r_sanitaires_h", name: "Sanitaires H", equipment: [] },
      { id: "z_sg_r_vestiaires", name: "Vestiaires", equipment: [] }
    ]
  },

  // TG-C — Cœur du site (Cuisine, Accueil, Restaurant, Bar)
  {
    id: "z_c",
    name: "TG-C",
    fullName: "Cœur du site (Cuisine, Accueil, Restaurant)",
    kVA: "110.9 kVA",
    rooms: [
      { id: "z_c_r_accueil", name: "Accueil", equipment: [] },
      { id: "z_c_r_acces_site", name: "Accès site", equipment: [] },
      { id: "z_c_r_bar", name: "Bar", equipment: [] },
      { id: "z_c_r_bureaux_admin", name: "Bureaux admin", equipment: [] },
      { id: "z_c_r_cafeteria", name: "Cafétéria", equipment: [] },
      { id: "z_c_r_cuisine_principale", name: "Cuisine principale", equipment: [] },
      { id: "z_c_r_garde_manger", name: "Garde manger", equipment: [] },
      { id: "z_c_r_legumerie", name: "Légumerie", equipment: [] },
      { id: "z_c_r_plonge", name: "Plonge", equipment: [] },
      { id: "z_c_r_patisserie", name: "Pâtisserie", equipment: [] },
      { id: "z_c_r_restaurant", name: "Restaurant", equipment: [] },
      { id: "z_c_r_local_cf", name: "Local CF", equipment: [] },
      { id: "z_c_r_local_sanitaires", name: "Local sanitaires", equipment: [] },
      { id: "z_c_r_local_serveur", name: "Local serveur", equipment: [] },
      { id: "z_c_r_local_technique", name: "Local technique", equipment: [] },
      { id: "z_c_r_parking", name: "Parking", equipment: [] }
    ]
  },

  // TD-LT1 — Local Technique 1
  {
    id: "z_lt1",
    name: "TD-LT1",
    fullName: "Local Technique 1 (Bungalows, SPA, Sea Food)",
    kVA: "130 kVA",
    rooms: [
      { id: "z_lt1_r_local_tech_1", name: "Local technique 1", equipment: [] },
      { id: "z_lt1_r_local_tech_2", name: "Local technique 2", equipment: [] },
      { id: "z_lt1_r_local_tech_3", name: "Local technique 3", equipment: [] },
      { id: "z_lt1_r_local_spa", name: "Local technique SPA", equipment: [] },
      { id: "z_lt1_r_bungalow", name: "Bungalow", equipment: [] },
      { id: "z_lt1_r_bungalow_terrasse", name: "Bungalow + terrasse", equipment: [] },
      { id: "z_lt1_r_spa", name: "SPA", equipment: [] },
      { id: "z_lt1_r_salle_fitness", name: "Salle fitness", equipment: [] },
      { id: "z_lt1_r_sea_food", name: "Sea Food", equipment: [] },
      { id: "z_lt1_r_cuisine_sf", name: "Cuisine Sea Food", equipment: [] },
      { id: "z_lt1_r_office", name: "Office", equipment: [] },
      { id: "z_lt1_r_lingerie_1", name: "Lingerie LT1", equipment: [] },
      { id: "z_lt1_r_lingerie_3", name: "Lingerie LT3", equipment: [] },
      { id: "z_lt1_r_terrasse", name: "Terrasse", equipment: [] },
      { id: "z_lt1_r_sous_bassement", name: "Sous-bassement bungalow", equipment: [] }
    ]
  },

  // TD-LT4 — Local Technique 4
  {
    id: "z_lt4",
    name: "TD-LT4",
    fullName: "Local Technique 4 (Chambres, Buanderie N/O)",
    kVA: "130 kVA",
    rooms: [
      { id: "z_lt4_r_local_tech_4", name: "Local technique 4", equipment: [] },
      { id: "z_lt4_r_local_tech_5", name: "Local technique 5", equipment: [] },
      { id: "z_lt4_r_buanderie_n", name: "Buanderie N", equipment: [] },
      { id: "z_lt4_r_buanderie_o", name: "Buanderie O", equipment: [] },
      { id: "z_lt4_r_local_buanderie_etage", name: "Local buanderie d'étage", equipment: [] },
      { id: "z_lt4_r_bungalow", name: "Bungalow", equipment: [] },
      { id: "z_lt4_r_bungalow_terrasse", name: "Bungalow + terrasse", equipment: [] },
      { id: "z_lt4_r_chambres", name: "Chambres", equipment: [] },
      { id: "z_lt4_r_chambres_circulations", name: "Chambres + circulations", equipment: [] },
      { id: "z_lt4_r_cage_ascenseur", name: "Cage d'ascenseur", equipment: [] },
      { id: "z_lt4_r_gaines_toiture", name: "Gaines / toiture", equipment: [] },
      { id: "z_lt4_r_terrasse", name: "Terrasse", equipment: [] },
      { id: "z_lt4_r_terrasses_chambres", name: "Terrasses chambres", equipment: [] },
      { id: "z_lt4_r_sous_bassement", name: "Sous-bassement bungalow", equipment: [] }
    ]
  },

  // TD-LT6 — Local Technique 6
  {
    id: "z_lt6",
    name: "TD-LT6",
    fullName: "Local Technique 6 (Bungalows, Lingerie)",
    kVA: "30 kVA",
    rooms: [
      { id: "z_lt6_r_local_tech_6", name: "Local technique 6", equipment: [] },
      { id: "z_lt6_r_bungalow", name: "Bungalow", equipment: [] },
      { id: "z_lt6_r_bungalow_terrasse", name: "Bungalow + terrasse", equipment: [] },
      { id: "z_lt6_r_lingerie", name: "Lingerie LT6", equipment: [] },
      { id: "z_lt6_r_terrasse", name: "Terrasse", equipment: [] },
      { id: "z_lt6_r_sous_bassement", name: "Sous-bassement bungalow", equipment: [] }
    ]
  },

  // TD-LT7 — Local Technique 7
  {
    id: "z_lt7",
    name: "TD-LT7",
    fullName: "Local Technique 7 (Logements personnel)",
    kVA: "70 kVA",
    rooms: [
      { id: "z_lt7_r_local_tech_7", name: "Local technique 7", equipment: [] },
      { id: "z_lt7_r_logements", name: "Logements", equipment: [] },
      { id: "z_lt7_r_logements_f1f2f4", name: "Logements F1/F2/F4", equipment: [] },
      { id: "z_lt7_r_logements_perso", name: "Logements personnel", equipment: [] }
    ]
  },

  // TD-ATELIER — Atelier maintenance
  {
    id: "z_atelier",
    name: "TD-ATELIER",
    fullName: "Atelier maintenance",
    kVA: "27.7 kVA",
    rooms: [
      { id: "z_atelier_r_atelier", name: "Atelier", equipment: [] }
    ]
  },

  // TD-SP — Salle Polyvalente
  {
    id: "z_sp",
    name: "TD-SP",
    fullName: "Salle Polyvalente (Grande salle, Lagunarium)",
    kVA: "43.7 kVA",
    rooms: [
      { id: "z_sp_r_grande_salle", name: "Grande salle", equipment: [] },
      { id: "z_sp_r_office", name: "Office", equipment: [] },
      { id: "z_sp_r_salle_rangement", name: "Salle rangement", equipment: [] },
      { id: "z_sp_r_sanitaire_f", name: "Sanitaire F", equipment: [] },
      { id: "z_sp_r_sanitaire_h", name: "Sanitaire H", equipment: [] },
      { id: "z_sp_r_wc_pmr", name: "WC PMR", equipment: [] },
      { id: "z_sp_r_local_lagunarium", name: "Local Lagunarium", equipment: [] }
    ]
  },

  // STEP — Station d'épuration
  {
    id: "z_step",
    name: "STEP",
    fullName: "Station d'épuration (biodisques)",
    kVA: "22.2 kVA",
    rooms: [
      { id: "z_step_r_local_step", name: "Local STEP", equipment: [] },
      { id: "z_step_r_entree_step", name: "Entrée STEP", equipment: [] },
      { id: "z_step_r_bassin_relevage", name: "Bassin relevage entrée", equipment: [] },
      { id: "z_step_r_reseau", name: "Réseau", equipment: [] },
      { id: "z_step_r_step", name: "STEP", equipment: [] }
    ]
  },

  // POMPERIE générale
  {
    id: "z_pomperie",
    name: "POMPERIE",
    fullName: "Pomperie générale (Ascenseurs, Circulation)",
    kVA: "20.4 kVA",
    rooms: [
      { id: "z_pomperie_r_local_pomperie", name: "Local Pomperie", equipment: [] },
      { id: "z_pomperie_r_local_di", name: "Local DI", equipment: [] },
      { id: "z_pomperie_r_cage_ascenseur", name: "Cage d'ascenseur", equipment: [] },
      { id: "z_pomperie_r_chambres", name: "Chambres", equipment: [] },
      { id: "z_pomperie_r_chambres_circulations", name: "Chambres + circulations", equipment: [] },
      { id: "z_pomperie_r_gaines_toiture", name: "Gaines / toiture", equipment: [] },
      { id: "z_pomperie_r_local_buanderie_etage", name: "Local buanderie d'étage", equipment: [] },
      { id: "z_pomperie_r_terrasses_chambres", name: "Terrasses chambres", equipment: [] },
      { id: "z_pomperie_r_pomperie", name: "Pomperie", equipment: [] }
    ]
  }
];

// Utility function to find a TD by ID
function findZone(zoneId) {
  return zones.find(z => z.id === zoneId);
}

// Utility function to find a room by zone and room ID
function findRoom(zoneId, roomId) {
  const zone = findZone(zoneId);
  return zone ? zone.rooms.find(r => r.id === roomId) : null;
}

// Utility function to find equipment by zone, room, and equipment ID
function findEquipment(zoneId, roomId, equipId) {
  const room = findRoom(zoneId, roomId);
  return room ? room.equipment.find(e => e.id === equipId) : null;
}
                            