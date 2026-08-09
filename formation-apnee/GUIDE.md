# Site de formation — Stage initial IE/MEF1 Apnée · Lifou 2026

Site fermé (mot de passe individuel) centralisant programme, supports de cours et photos.
100 % gratuit, sans serveur : tout tient dans ce dossier.

## 1. Mise en ligne sur GitHub Pages (gratuit, ~10 minutes)

1. Créez un compte gratuit sur https://github.com (si vous n'en avez pas).
2. Cliquez sur **New repository** → nom : `formation-apnee-lifou` → cochez **Private**… ⚠️ attention :
   GitHub Pages sur un dépôt privé nécessite un abonnement payant. Pour rester gratuit,
   choisissez **Public** : le code du site sera visible, mais la page demande le mot de passe
   et les visiteurs ne connaissent pas l'adresse. (Les mots de passe ne sont PAS stockés en clair.)
3. Dans le dépôt : **Add file → Upload files** → glissez TOUT le contenu de ce dossier
   (index.html, generateur.html, config/, documents/, photos/) → **Commit changes**.
4. Allez dans **Settings → Pages** → Source : `Deploy from a branch` → Branch : `main`, dossier `/ (root)` → **Save**.
5. Après ~2 minutes, votre site est en ligne à l'adresse affichée
   (ex. `https://votrecompte.github.io/formation-apnee-lifou/`).
6. Communiquez cette adresse + le mot de passe individuel à chaque participant.

> Alternative sans GitHub : https://app.netlify.com/drop — glissez le dossier entier, le site est en ligne immédiatement (compte gratuit requis pour le garder).

## 2. Ajouter un document

1. Déposez le fichier (PDF, PPTX, DOCX…) dans le dossier `documents/`.
2. Ouvrez `config/documents.js` et ajoutez un bloc dans la liste `DOCUMENTS` :
```js
{
  categorie: "cours",              // "cours", "programme", "referentiels" (ou créez une catégorie)
  titre: "Titre affiché",
  description: "Une ou deux phrases.",
  fichier: "documents/mon_fichier.pdf",
  type: "PDF",
},
```
3. Re-téléversez les deux fichiers modifiés sur GitHub (Upload files → écrase l'ancien).

## 3. Ajouter des photos

1. Déposez les images dans `photos/` (idéalement < 2 Mo chacune).
2. Ouvrez `config/photos.js` et ajoutez :
```js
{ fichier: "photos/nom_image.jpg", legende: "Description courte" },
```

## 4. Gérer les comptes (mots de passe)

- La liste des accès est dans `config/comptes.js` (seules des empreintes chiffrées y figurent, jamais les mots de passe).
- Pour **ajouter** quelqu'un : ouvrez `generateur.html` dans votre navigateur (double-clic),
  entrez nom + mot de passe choisi, copiez le bloc généré dans `config/comptes.js`.
- Pour **révoquer** un accès : supprimez sa ligne dans `config/comptes.js`.
- La liste des mots de passe en clair vous a été remise à part (`ACCES_MOTS_DE_PASSE.txt`) :
  **ne mettez JAMAIS ce fichier dans le dossier du site ni sur GitHub.**

## 5. Niveau de sécurité — à savoir

La protection convient à des supports pédagogiques : la page d'accueil bloque l'accès
et les mots de passe ne sont pas lisibles dans le code. Ce n'est toutefois pas un coffre-fort :
une personne très technique qui connaît l'adresse exacte d'un fichier pourrait le télécharger.
Ne mettez donc pas sur ce site de documents sensibles (données personnelles, certificats médicaux…).

## 6. Photos WhatsApp

Le site ne peut pas se connecter à WhatsApp. Pour récupérer les photos du groupe :
sur votre téléphone, ouvrez le groupe → sélectionnez les photos → Partager/Enregistrer,
puis ajoutez-les au dossier `photos/` (voir §3), ou envoyez-les-moi et je les intégrerai.
