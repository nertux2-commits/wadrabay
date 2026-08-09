// Liste des documents du site.
// Pour ajouter un document : 1) déposez le fichier dans le dossier documents/
// 2) ajoutez un bloc { ... } ci-dessous dans la bonne catégorie (categorie: id existant ou nouveau).
const CATEGORIES = [
  { id: "cours", nom: "Supports de cours", icone: "📚" },
  { id: "programme", nom: "Programme & organisation", icone: "🗓️" },
  { id: "referentiels", nom: "Manuels & référentiels", icone: "📖" },
];

const DOCUMENTS = [
  {
    categorie: "cours",
    titre: "Physiologie & accidents de l'apnée",
    description: "Formation complète en 60 diapositives et deux parties — lois physiques, physiologie, réflexe d'immersion, hyperventilation, et toutes les fiches accidents (barotraumatismes, syncope, taravana…). Notes formateur incluses.",
    fichier: "documents/Synthese_physiologie_accidents_apnee.pptx",
    type: "PPTX",
  },
  {
    categorie: "cours",
    titre: "Les facteurs de la performance en apnée",
    description: "21 diapositives actualisées : équation de la performance, stocks d'O₂, spleen effect, tolérances CO₂/hypoxie, facteurs psychologiques et techniques, sécurité, méthodologie d'entraînement.",
    fichier: "documents/Facteurs_performance_apnee_2026.pptx",
    type: "PPTX",
  },
  {
    categorie: "programme",
    titre: "Programme officiel du stage initial",
    description: "Programme détaillé des 7, 8 et 9 août 2026 à Lifou : horaires, thèmes et intervenants, jour par jour.",
    fichier: "documents/Programme_stage_initial_Lifou_aout_2026.pdf",
    type: "PDF",
  },
  {
    categorie: "programme",
    titre: "Récap organisation & logistique",
    description: "Informations pratiques : hébergement à Luecila, repas, transport, et rappels importants pour les participants (licences, certificats médicaux).",
    fichier: "documents/Recap_organisation_stage_Lifou.docx",
    type: "DOCX",
  },
  {
    categorie: "referentiels",
    titre: "Manuel du Moniteur d'apnée stagiaire",
    description: "Le manuel fédéral de référence du moniteur d'apnée (67 pages) — pédagogie, organisation, sécurité, réglementation.",
    fichier: "documents/Manuel_Moniteur.pdf",
    type: "PDF",
  },
];
