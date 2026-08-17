# Refonte complète et intégration frontend/backend — BAL MASQUÉ

## CONTEXTE

Je développe une plateforme web événementielle pour un événement nommé **BAL MASQUÉ**.

L'interface actuelle possède déjà une direction artistique basée sur :

* une esthétique luxueuse et élégante ;
* des tons ivoire, crème, champagne et or ;
* une typographie serif élégante pour les titres ;
* des masques vénitiens comme élément graphique principal ;
* une navigation adaptée au mobile ;
* plusieurs pages déjà présentes.

Les captures d'écran fournies doivent servir de **référence visuelle**, mais elles ne doivent pas être reproduites littéralement.

L'objectif est maintenant de transformer cette interface en une **véritable application web responsive, vivante, fonctionnelle et connectée au backend**.

Le résultat final doit donner envie à un visiteur de naviguer sur le site, de consulter les candidats, de s'inscrire, de voter et de consulter les résultats.

---

# ⚠️ RÈGLE ABSOLUE : NE PAS CASSER L'EXISTANT

Avant toute modification :

1. Analyse entièrement le projet frontend.
2. Analyse entièrement le projet backend disponible.
3. Identifie :

   * les routes API existantes ;
   * les modèles ;
   * les serializers/schemas ;
   * les contrôleurs/views ;
   * l'authentification ;
   * les statuts ;
   * les quotas/limites ;
   * les catégories ;
   * les endpoints d'administration ;
   * les endpoints publics ;
   * les mécanismes de vote ;
   * les mécanismes d'inscription.
4. Identifie les composants frontend existants.
5. Identifie le système de routing existant.
6. Identifie le système de gestion d'état existant s'il y en a un.
7. Identifie la manière dont les appels API sont actuellement effectués.

**NE RÉÉCRIS PAS l'architecture existante simplement parce qu'une autre architecture te semble meilleure.**

Réutilise au maximum les composants, services, modèles et conventions déjà présents.

Si une fonctionnalité backend existe déjà, utilise-la.

Si une fonctionnalité manque réellement, indique précisément ce qui manque avant de créer une nouvelle implémentation.

---

# OBJECTIF PRINCIPAL

Construire une expérience cohérente autour de 6 espaces principaux :

1. Accueil immersif
2. Candidats
3. Inscription
4. Vote
5. Résultats
6. Administration

Et ajouter :

7. Connexion administrateur
8. États de succès
9. États d'erreur
10. Modales de confirmation
11. Listing public des candidats

---

# 1. PAGE D'ACCUEIL

Route :

`/`

La page d'accueil doit être immersive et rappeler une **affiche de gala luxueuse**, mais elle doit rester une véritable interface web.

## Direction artistique

Utiliser :

* fond ivoire/crème ;
* champagne ;
* or métallique ;
* noir/brun très foncé pour certains textes ;
* ombres très légères ;
* bordures dorées discrètes ;
* glassmorphism très léger ;
* masques et plumes comme éléments décoratifs.

Éviter absolument :

* les énormes éléments qui occupent tout l'écran ;
* les espaces verticaux excessifs ;
* les titres disproportionnés ;
* les animations lourdes ;
* les effets qui ralentissent le chargement.

Le design doit être **premium mais minimaliste**.

## Hero

Afficher notamment :

**BAL MASQUÉ**

**Une nuit. Un masque. Une expérience inoubliable.**

**19 AOÛT 2026 — QUEEN FAFA PALACE CALAVI**

Avec un masque comme élément visuel principal.

Le masque ne doit cependant PAS occuper toute la page.

Ajouter des CTA clairement visibles :

* `Découvrir les candidats`
* `S'inscrire`
* `Voter`

Les CTA doivent être de véritables liens/boutons fonctionnels.

---

# 2. PAGE DES CANDIDATS

Route :

`/candidats`

Cette page doit récupérer les candidats depuis le backend.

## IMPORTANT

Créer ou utiliser un endpoint API public permettant de récupérer les candidats visibles publiquement.

Exemple conceptuel :

`GET /api/candidates`

ou l'équivalent correspondant à l'architecture backend existante.

Ne pas exposer d'informations sensibles.

Le frontend ne doit afficher que les informations prévues pour le public.

---

## Organisation

Les candidats doivent être regroupés par catégorie.

Exemples :

* Roi
* Reine
* ou les catégories réellement définies dans le backend.

Ne jamais coder les catégories en dur si elles sont déjà gérées dynamiquement par le backend.

Chaque candidat doit être présenté dans une carte élégante contenant, selon les données disponibles :

* photo ;
* nom ;
* numéro ;
* catégorie ;
* courte présentation ;
* bouton `Voir le profil` ;
* bouton `Voter`.

La grille doit être responsive.

### Desktop

Plusieurs candidats par ligne.

### Tablet

Deux ou trois candidats par ligne selon la largeur.

### Mobile

Une ou deux cartes par ligne selon l'espace disponible.

Les cartes ne doivent jamais devenir gigantesques.

---

# 3. PAGE D'INSCRIPTION PUBLIQUE

Route :

`/inscription`

Cette page doit permettre à un utilisateur de soumettre une candidature.

Mais l'inscription doit être entièrement contrôlée par les règles du backend.

Le frontend ne doit jamais décider seul si une inscription est autorisée.

---

## Le frontend doit récupérer les informations depuis le backend

Avant d'afficher le formulaire :

* vérifier si les inscriptions sont ouvertes ;
* récupérer les catégories disponibles ;
* récupérer les limites/quotas ;
* vérifier les éventuelles places restantes ;
* récupérer les règles nécessaires.

Si les inscriptions sont fermées :

Afficher une interface claire :

> Les inscriptions sont actuellement fermées.

Si une catégorie est complète :

> Cette catégorie a atteint sa limite de candidatures.

Ne pas simplement cacher les boutons.

---

## Formulaire

Créer un formulaire moderne et simple.

Valider côté frontend pour améliorer l'expérience utilisateur.

Mais la validation finale doit toujours être faite côté backend.

Afficher clairement :

* champs obligatoires ;
* erreurs de validation ;
* catégorie sélectionnée ;
* état d'envoi ;
* état de succès.

Pendant l'envoi :

* désactiver le bouton ;
* afficher un indicateur de chargement ;
* empêcher les doubles soumissions.

Après succès :

Afficher une vraie confirmation :

> Candidature soumise avec succès !

Puis éventuellement proposer :

`Retour à l'accueil`

ou

`Découvrir les candidats`

---

# 4. PAGE DE VOTE

Route :

`/vote`

Cette page est extrêmement importante.

Elle doit récupérer les candidats depuis le backend.

Ne pas utiliser une liste de candidats codée en dur.

---

## Flux utilisateur

1. L'utilisateur arrive sur la page.
2. Le frontend vérifie si le vote est ouvert.
3. Le frontend récupère les catégories.
4. Le frontend récupère les candidats publics.
5. L'utilisateur sélectionne son candidat dans chaque catégorie autorisée.
6. Il voit clairement ses choix.
7. Il clique sur `Voter`.
8. Une confirmation apparaît.
9. Le vote est envoyé au backend.
10. Le frontend affiche le résultat de l'opération.

---

## IMPORTANT : empêcher les erreurs utilisateur

Le système doit gérer visuellement :

* vote fermé ;
* candidat indisponible ;
* catégorie inexistante ;
* double vote ;
* quota atteint ;
* requête échouée ;
* perte de connexion ;
* réponse serveur inattendue.

Exemples :

### Succès

> Votre vote pour la catégorie Roi a bien été enregistré !

### Double vote

> Vous avez déjà voté pour cette catégorie.

### Vote fermé

> Les votes sont actuellement fermés.

### Erreur serveur

> Une erreur est survenue. Veuillez réessayer.

Les messages doivent être compréhensibles par un utilisateur normal.

Ne jamais afficher directement des erreurs techniques comme des stack traces.

---

# 5. PAGE DES RÉSULTATS

Route :

`/resultats`

Cette page doit récupérer les résultats depuis le backend.

Elle doit afficher les gagnants de manière élégante.

## Podium

Afficher :

🥇 1er

🥈 2e

🥉 3e

Le podium doit être particulièrement travaillé visuellement.

Mais ne pas utiliser une énorme animation ou un composant qui prend tout l'écran.

---

## États possibles

### Résultats non disponibles

Afficher :

> Les résultats seront bientôt disponibles.

### Résultats disponibles

Afficher les gagnants par catégorie.

### Résultats en cours

Afficher clairement que le dépouillement/la publication est en cours si le backend possède cet état.

Ne jamais simuler des résultats côté frontend.

---

# 6. PANNEAU D'ADMINISTRATION

Routes :

`/admin/login`

et les routes protégées correspondantes.

Le panneau admin doit être totalement séparé de l'expérience publique tout en conservant une identité visuelle cohérente.

L'administration doit permettre, selon les fonctionnalités réellement présentes dans le backend :

* gérer les candidats ;
* gérer les catégories ;
* contrôler les inscriptions ;
* contrôler les votes ;
* gérer les quotas ;
* voir les candidatures ;
* accepter/refuser les candidatures ;
* consulter les statistiques ;
* gérer les résultats ;
* publier les gagnants.

Ne crée pas de fonctionnalités fictives si le backend ne les supporte pas.

---

# 7. CONNEXION ADMIN

Route :

`/admin/login`

Créer une interface simple :

* Email
* Mot de passe
* Se connecter

Lors de la connexion :

1. envoyer les identifiants au backend ;
2. récupérer le JWT ;
3. stocker le token selon la stratégie de sécurité déjà utilisée par le projet ;
4. mettre à jour l'état d'authentification ;
5. rediriger vers le dashboard admin.

Si le JWT existe déjà et est valide :

ne pas demander inutilement à l'administrateur de se reconnecter.

Si le token expire :

gérer proprement l'expiration et rediriger vers `/admin/login`.

Les routes admin doivent être protégées côté frontend ET côté backend.

**La protection frontend seule n'est jamais suffisante.**

---

# 8. API PUBLIQUE DES CANDIDATS

Vérifier impérativement si le backend possède déjà une route publique permettant de récupérer les candidats.

La page :

`/candidats`

et la page :

`/vote`

doivent pouvoir récupérer les candidats sans authentification administrateur.

Si cette route n'existe pas :

ajouter proprement un endpoint public en respectant l'architecture actuelle du backend.

Exemple conceptuel :

`GET /api/public/candidates`

La réponse doit uniquement exposer les données nécessaires au public.

Ne jamais exposer :

* mots de passe ;
* tokens ;
* informations administratives ;
* données privées ;
* informations internes inutiles.

---

# 9. GESTION DES ÉTATS

L'application doit avoir une gestion cohérente des états :

### Loading

Afficher un skeleton ou un indicateur élégant.

Éviter les écrans blancs pendant plusieurs secondes.

### Empty state

Exemple :

> Aucun candidat n'est actuellement disponible.

### Success

Exemple :

> Votre candidature a été soumise avec succès.

### Error

Exemple :

> Impossible de récupérer les candidats. Veuillez réessayer.

### Forbidden

Exemple :

> Vous n'avez pas accès à cette fonctionnalité.

### Closed

Exemple :

> Les inscriptions sont actuellement fermées.

### Quota reached

Exemple :

> Le nombre maximum de candidatures pour cette catégorie a été atteint.

---

# 10. MODALES ET CONFIRMATIONS

Créer un système cohérent de modales/toasts.

Après une action importante :

* inscription ;
* vote ;
* suppression admin ;
* validation d'une candidature ;
* publication des résultats ;

l'utilisateur doit avoir un retour visuel.

Exemple :

**Vote enregistré**

> Votre vote pour la catégorie Roi a bien été enregistré.

`Fermer`

Les modales doivent être :

* élégantes ;
* rapides ;
* accessibles ;
* responsive ;
* utilisables au clavier ;
* suffisamment contrastées.

---

# 11. RESPONSIVE DESIGN

C'est une priorité absolue.

Le site doit fonctionner correctement sur :

* petit téléphone ;
* grand téléphone ;
* tablette ;
* ordinateur portable ;
* écran desktop large.

Ne jamais construire une page en supposant une seule résolution.

Éviter :

```css
height: 100vh;
```

pour des sections qui doivent contenir du contenu dynamique.

Éviter les dimensions fixes inutiles.

Utiliser :

* max-width ;
* min-height lorsque nécessaire ;
* flexbox ;
* CSS grid ;
* clamp() ;
* media queries ;
* unités relatives.

---

# 12. RESPONSIVE MOBILE

Sur mobile :

* navigation basse si elle existe déjà ;
* boutons facilement accessibles au doigt ;
* cartes empilées ;
* textes lisibles ;
* images optimisées ;
* pas de débordement horizontal ;
* pas de zoom involontaire ;
* pas de contenu coupé.

La navigation mobile doit rester simple :

`Accueil | Candidats | Voter | Résultats`

L'onglet actif doit être clairement identifiable.

---

# 13. RESPONSIVE DESKTOP

Sur desktop :

NE PAS afficher une interface mobile géante.

La navigation basse doit être remplacée ou adaptée par une navigation horizontale dans le header.

Le contenu doit être centré avec une largeur maximale raisonnable.

Exemple conceptuel :

```text
┌──────────────────────────────────────────────────────────┐
│ BAL MASQUÉE     Accueil  Candidats  Pass  Voter  Résultats │
└──────────────────────────────────────────────────────────┘
```

---

# 14. PERFORMANCE

Optimiser :

* images ;
* chargement des données ;
* appels API ;
* composants ;
* animations.

Éviter :

* grosses images non optimisées ;
* animations permanentes ;
* appels API répétés inutilement ;
* re-render inutile ;
* polling inutile.

Les masques et éléments décoratifs doivent rester visuellement impressionnants sans ralentir le site.

---

# 15. EXPÉRIENCE UTILISATEUR

Le site doit toujours répondre à trois questions :

1. Où suis-je ?
2. Que puis-je faire ?
3. Que vient-il de se passer après mon action ?

Chaque action importante doit avoir une réponse visuelle.

Un utilisateur ne doit jamais se demander :

> "Est-ce que mon vote a été pris en compte ?"

ou :

> "Est-ce que mon inscription est passée ?"

---

# 16. ARCHITECTURE FRONTEND

Organiser proprement les responsabilités.

Créer/réutiliser des services API pour éviter de mettre directement les appels HTTP dans tous les composants.

Conceptuellement :

```text
src/
├── pages/
│   ├── Home
│   ├── Candidates
│   ├── Registration
│   ├── Voting
│   ├── Results
│   └── admin/
│
├── components/
│   ├── Header
│   ├── MobileNavigation
│   ├── CandidateCard
│   ├── PassCard
│   ├── VotingCard
│   ├── ResultPodium
│   ├── Modal
│   ├── Toast
│   └── Loading
│
├── services/
│   └── api
│
├── auth/
│
└── ...
```

ADAPTE cette organisation au framework et à l'architecture déjà présents.

Ne crée pas une nouvelle architecture juste pour suivre cet exemple.

---

# 17. RÈGLE IMPORTANTE SUR LE BACKEND

Le frontend ne doit jamais être considéré comme la source de vérité.

Par exemple :

❌ Mauvais :

```javascript
if (placesRestantes > 0) {
   autoriserInscription();
}
```

si le backend n'effectue pas également cette vérification.

Le bon fonctionnement est :

```text
Frontend
   ↓
Demande d'inscription
   ↓
Backend
   ↓
Vérification statut + quota + catégorie
   ↓
Acceptation / refus
   ↓
Frontend
   ↓
Message utilisateur
```

Même logique pour les votes.

---

# 18. SÉCURITÉ

Vérifier que :

* les routes admin sont protégées ;
* les opérations admin nécessitent une authentification ;
* les votes sont validés côté serveur ;
* les quotas sont contrôlés côté serveur ;
* les inscriptions sont contrôlées côté serveur ;
* les données privées ne sont pas exposées par les endpoints publics ;
* le JWT n'est pas exposé inutilement ;
* les erreurs backend sensibles ne sont jamais affichées directement à l'utilisateur.

---

# 19. DESIGN SYSTEM

Créer une cohérence globale.

Utiliser des variables CSS ou le système de design déjà présent.

Exemple :

```css
:root {
    --ivory: #F7F3EA;
    --cream: #EFE7D8;
    --gold: #C89B3C;
    --gold-dark: #A87922;
    --text: #332B25;
    --white: #FFFFFF;
    --border: #E8D8B5;
}
```

Les valeurs peuvent être adaptées si le projet possède déjà un design system.

---

# 20. ANIMATIONS

Les animations doivent être discrètes.

Utiliser éventuellement :

* fade-in ;
* hover léger ;
* transition des boutons ;
* apparition des cartes ;
* animation subtile du podium.

Éviter les animations excessives.

Le luxe doit venir de la **composition**, pas d'une accumulation d'effets.

---

# 21. IMPORTANT : NE PAS FAIRE UNE SIMPLE MAQUETTE

Je ne veux pas que tu te contentes de modifier le CSS.

Je veux une application réellement fonctionnelle.

Les données visibles dans :

* candidats ;
* inscriptions ;
* votes ;
* résultats ;
* catégories ;
* statuts ;
* quotas ;

doivent venir du backend lorsque celui-ci les fournit.

Aucune donnée métier importante ne doit être simulée en dur dans le frontend.

---

# 22. MÉTHODE DE TRAVAIL OBLIGATOIRE

Travaille dans cet ordre :

### ÉTAPE 1 — AUDIT

Analyse le projet existant.

Liste :

* frontend ;
* backend ;
* endpoints ;
* modèles ;
* authentification ;
* pages existantes ;
* composants existants ;
* problèmes actuels.

### ÉTAPE 2 — PLAN

Avant de modifier massivement le code, présente un plan indiquant :

* ce qui existe déjà ;
* ce qui doit être connecté ;
* ce qui manque ;
* ce qui doit être corrigé ;
* ce qui doit être ajouté.

### ÉTAPE 3 — BACKEND

Complète uniquement les endpoints réellement nécessaires.

Priorité :

1. candidats publics ;
2. paramètres/statuts publics nécessaires ;
3. inscription ;
4. vote ;
5. résultats ;
6. authentification admin ;
7. administration.

### ÉTAPE 4 — SERVICES FRONTEND

Centraliser les appels API.

### ÉTAPE 5 — AUTHENTIFICATION

Implémenter proprement la connexion admin et la protection des routes.

### ÉTAPE 6 — CONNEXION DES PAGES

Connecter progressivement :

Accueil → Candidats → Inscription → Vote → Résultats → Admin.

### ÉTAPE 7 — UX

Ajouter :

* loading ;
* erreurs ;
* succès ;
* confirmations ;
* états vides ;
* quotas ;
* statuts.

### ÉTAPE 8 — RESPONSIVE

Tester toutes les pages sur :

* 360 px ;
* 390 px ;
* 768 px ;
* 1024 px ;
* 1440 px.

### ÉTAPE 9 — TEST FINAL

Vérifier les parcours complets :

#### Parcours visiteur

Accueil → Candidats → Profil → Inscription

#### Parcours votant

Accueil → Candidats → Vote → Confirmation → Résultats

#### Parcours admin

Login → Dashboard → Candidats → Inscriptions → Votes → Résultats

---

# 23. CRITÈRE FINAL

À la fin, je dois avoir une plateforme qui donne cette impression :

**"C'est un vrai site d'événement premium."**

Et non :

**"C'est une maquette avec de belles cartes."**

Le design doit être élégant, mais la fonctionnalité et l'expérience utilisateur passent avant les effets visuels.

Ne supprime pas les fonctionnalités existantes sans raison.

Ne remplace pas une fonctionnalité backend par une simulation frontend.

Ne crée pas de données fictives pour masquer un problème d'intégration.

Si une API nécessaire n'existe pas, identifie-la et implémente-la proprement dans le backend en respectant l'architecture existante.

Enfin, après les modifications, indique clairement :

1. les fichiers modifiés ;
2. les endpoints utilisés/créés ;
3. les fonctionnalités maintenant connectées ;
4. les éventuelles dépendances ajoutées ;
5. les points restant à vérifier ;
6. les tests effectués.

**Priorité absolue :**

Fonctionnalité réelle → UX → responsive → performance → esthétique.

Le résultat doit être un site **vivant, connecté, intuitif et réellement utilisable**, tout en conservant l'identité luxueuse de **BAL MASQUÉ**.
