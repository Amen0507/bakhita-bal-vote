````md
# Étape 1 — Initialisation du backend FastAPI et modèles SQLAlchemy

Tu es un développeur Senior Fullstack spécialisé en **Python (FastAPI, SQLAlchemy) et React**.

Nous développons une plateforme web événementielle permettant de gérer les élections du **Roi, de la Reine et du Duo le plus élégant** lors d'un bal de fin d'année.

Le cahier de cadrage fonctionnel définit notamment un système dans lequel chaque personne entrant au bal reçoit un numéro de votant et un code de vote unique. Un code ne peut servir qu'une seule fois, et le bulletin de vote est anonyme : le vote ne doit pas être directement relié au votant ou à son code. La plateforme doit également gérer les inscriptions publiques des candidats Roi, Reine et des Duos, ainsi que les paramètres et l'état du vote.

L'objectif de cette première étape est **uniquement d'initialiser la structure de base du backend FastAPI et de créer tous les modèles de données SQLAlchemy**.

---

# 1. Stack & environnement backend

Utiliser :

- Python 3.11+
- FastAPI
- Uvicorn
- SQLAlchemy 2.0
- Pydantic v2
- Pydantic Settings
- SQLite pour le développement local
- Compatibilité PostgreSQL pour la production
- `python-jose`
- `passlib[bcrypt]`
- `python-multipart`

Utiliser exclusivement la syntaxe moderne de SQLAlchemy 2.0 avec :

- `DeclarativeBase`
- `Mapped`
- `mapped_column`
- `relationship` lorsque pertinent
- les annotations de types Python modernes

---

# 2. Structure des fichiers

Créer la structure suivante sous un répertoire `backend/` :

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── voter.py
│   │   ├── vote_code.py
│   │   ├── candidate.py
│   │   ├── duo.py
│   │   ├── vote.py
│   │   └── system_settings.py
│   ├── schemas/
│   ├── services/
│   └── main.py
├── .env.example
├── .env
└── requirements.txt
````

Créer également les fichiers `__init__.py` nécessaires pour que les packages Python fonctionnent correctement.

Ne pas créer de logique métier complexe à cette étape.

---

# 3. `requirements.txt`

Créer un `requirements.txt` contenant au minimum :

```text
fastapi
uvicorn
sqlalchemy
pydantic
pydantic-settings
python-jose
passlib[bcrypt]
python-multipart
```

Tu peux ajouter uniquement les dépendances strictement nécessaires à cette étape si elles sont indispensables au fonctionnement du projet.

**Ne pas installer les dépendances automatiquement.**

À la fin, fournir uniquement les commandes que je devrai exécuter moi-même pour installer les dépendances.

---

# 4. Configuration — `app/core/config.py`

Créer une classe `Settings` utilisant `pydantic-settings`.

Elle doit permettre de charger les variables suivantes :

```text
PROJECT_NAME
SECRET_KEY
DATABASE_URL
BACKEND_CORS_ORIGINS
```

Prévoir des valeurs par défaut raisonnables pour le développement lorsque cela est pertinent.

La configuration doit être compatible avec un fichier `.env`.

Utiliser une approche moderne compatible avec Pydantic v2.

Créer également :

```text
.env.example
.env
```

Le `.env.example` doit contenir les variables nécessaires sans secrets réels.

Le `.env` peut contenir des valeurs de développement locales.

Ne jamais placer de secret réel dans le code source.

---

# 5. Base de données — `app/core/database.py`

Configurer SQLAlchemy 2.0.

Créer :

* l'engine SQLAlchemy ;
* `SessionLocal` ;
* le générateur de dépendance `get_db()`.

Le code doit fonctionner avec SQLite en développement et rester compatible avec PostgreSQL.

Prendre en compte le cas particulier de SQLite concernant les connexions multithread si nécessaire.

La base doit être configurée de manière propre afin de pouvoir ajouter Alembic ultérieurement.

---

# 6. Base SQLAlchemy — `app/models/base.py`

Créer une classe de base commune :

```python
class Base(DeclarativeBase):
    pass
```

Tous les modèles doivent hériter de cette classe.

Ne pas définir `Base` dans un modèle métier.

---

# 7. Modèle `User`

Fichier :

```text
app/models/user.py
```

Créer le modèle `User` avec les champs suivants :

### `id`

* UUID
* clé primaire
* généré côté Python avec `uuid.uuid4`

### `username`

* String
* unique
* indexé
* non nullable

### `password_hash`

* String
* non nullable

### `role`

Enum :

```text
ADMIN
AGENT_ACCUEIL
```

Le champ est obligatoire.

### `created_at`

* DateTime
* non nullable
* valeur par défaut générée côté application
* utiliser des datetime timezone-aware en UTC

---

# 8. Modèle `Voter`

Fichier :

```text
app/models/voter.py
```

Créer le modèle `Voter` avec :

### `id`

* UUID
* clé primaire
* généré avec `uuid.uuid4`

### `voter_number`

* Integer
* unique
* indexé
* séquentiel
* non nullable

### `created_at`

* DateTime
* non nullable
* UTC timezone-aware

## IMPORTANT — numéro séquentiel

Le numéro du votant est un numéro administratif séquentiel.

**Ne jamais utiliser :**

```python
max(voter_number) + 1
```

ou une variante équivalente.

Cette approche créerait des problèmes en cas de créations concurrentes.

La solution choisie doit être compatible autant que possible avec SQLite pour le développement et PostgreSQL pour la production.

Si une véritable génération séquentielle portable entre SQLite et PostgreSQL ne peut pas être garantie uniquement au niveau du modèle SQLAlchemy, documenter clairement cette limitation et préparer le modèle afin que la logique puisse être implémentée proprement dans le service dédié lors d'une prochaine étape.

Ne pas créer ce service maintenant.

---

# 9. Modèle `VoteCode`

Fichier :

```text
app/models/vote_code.py
```

Créer le modèle `VoteCode` avec :

### `id`

* UUID
* clé primaire
* généré avec `uuid.uuid4`

### `code`

* String(6)
* unique
* indexé
* non nullable

### `voter_id`

* UUID
* clé étrangère vers `voters.id`
* non nullable

### `status`

Enum :

```text
ACTIVE
USED
REVOKED
```

### `created_at`

* DateTime
* non nullable
* UTC timezone-aware

### `used_at`

* DateTime
* nullable

### `revoked_at`

* DateTime
* nullable

Créer une relation SQLAlchemy avec `Voter` si cela améliore la cohérence du modèle.

Le code de vote ne doit pas être séquentiel.

La génération sécurisée et aléatoire des codes sera implémentée dans une étape ultérieure.

---

# 10. Modèle `Candidate`

Fichier :

```text
app/models/candidate.py
```

Ce modèle représente les candidats au titre de Roi et de Reine.

Créer :

### `id`

* UUID
* clé primaire
* généré avec `uuid.uuid4`

### `category`

Enum :

```text
ROI
REINE
```

### `first_name`

* String
* non nullable

### `last_name`

* String
* non nullable

### `photo_url`

* String
* nullable

### `is_manual_entry`

* Boolean
* non nullable
* valeur par défaut : `False`

### `created_at`

* DateTime
* non nullable
* UTC timezone-aware

---

# 11. Modèle `Duo`

Fichier :

```text
app/models/duo.py
```

Créer le modèle représentant les Duos.

Champs :

### `id`

* UUID
* clé primaire
* généré avec `uuid.uuid4`

### `duo_name`

* String
* nullable

### Cavalier

```text
cavalier_first_name
cavalier_last_name
cavalier_photo_url
```

Les deux premiers sont obligatoires et la photo est nullable.

### Cavalière

```text
cavaliere_first_name
cavaliere_last_name
cavaliere_photo_url
```

Les deux premiers sont obligatoires et la photo est nullable.

### `is_manual_entry`

* Boolean
* non nullable
* défaut : `False`

### `created_at`

* DateTime
* non nullable
* UTC timezone-aware

---

# 12. Modèle `Vote`

Fichier :

```text
app/models/vote.py
```

Ce modèle représente le bulletin de vote anonyme.

## RÈGLE D'ANONYMAT CRITIQUE

Le modèle `Vote` **NE DOIT AVOIR AUCUNE clé étrangère vers `Voter` ou `VoteCode`.**

Il ne doit donc contenir ni :

```text
voter_id
```

ni :

```text
vote_code_id
```

Le bulletin doit rester indépendant du votant et de son code afin de préserver l'anonymat.

Créer uniquement :

### `id`

* UUID
* clé primaire
* généré avec `uuid.uuid4`

### `roi_candidate_id`

* UUID
* FK vers `candidates.id`
* non nullable

### `reine_candidate_id`

* UUID
* FK vers `candidates.id`
* non nullable

### `duo_id`

* UUID
* FK vers `duos.id`
* non nullable

### `created_at`

* DateTime
* non nullable
* UTC timezone-aware

Créer les relations SQLAlchemy vers `Candidate` et `Duo` si pertinent.

## Important

Les FK ne suffisent pas à garantir qu'un candidat de catégorie `ROI` soit utilisé dans `roi_candidate_id` et qu'un candidat de catégorie `REINE` soit utilisé dans `reine_candidate_id`.

Cette validation devra être faite au niveau du service métier lors de l'implémentation du système de vote.

À cette étape, ne pas créer le service de vote.

Documenter clairement cette règle pour éviter qu'elle soit oubliée.

---

# 13. Modèle `SystemSettings`

Fichier :

```text
app/models/system_settings.py
```

Ce modèle représente la configuration globale du bal.

### `id`

* Integer
* clé primaire
* toujours égal à `1`

### `roi_limit`

* Integer
* défaut : `10`

### `reine_limit`

* Integer
* défaut : `10`

### `roi_inscriptions_open`

* Boolean
* défaut : `True`

### `reine_inscriptions_open`

* Boolean
* défaut : `True`

### `duo_inscriptions_open`

* Boolean
* défaut : `True`

### `voting_status`

Enum :

```text
CLOSED
OPEN
```

Prévoir une valeur par défaut cohérente, idéalement `CLOSED`.

### `results_published`

* Boolean
* défaut : `False`

Le modèle doit permettre de respecter les états définis dans le cahier de cadrage :

```text
Inscriptions Roi : ouvertes / fermées
Inscriptions Reine : ouvertes / fermées
Inscriptions Duo : ouvertes / fermées
Vote : CLOSED / OPEN
Résultats : masqués / visibles
```

Le singleton `SystemSettings` doit avoir `id = 1`.

Ne pas créer pour l'instant de logique automatique pour empêcher plusieurs lignes : cette logique pourra être renforcée dans le service ou la couche d'administration.

---

# 14. Enums

Créer les enums de manière propre et réutilisable.

Les enums nécessaires sont :

```text
UserRole
    ADMIN
    AGENT_ACCUEIL

VoteCodeStatus
    ACTIVE
    USED
    REVOKED

CandidateCategory
    ROI
    REINE

VotingStatus
    CLOSED
    OPEN
```

Éviter de dupliquer les définitions des enums dans plusieurs fichiers.

Organiser le code de manière claire et maintenable.

---

# 15. Relations SQLAlchemy

Définir les relations nécessaires entre les modèles.

Relations attendues :

```text
Voter
  └── VoteCode

Candidate
  └── Vote (pour Roi)

Candidate
  └── Vote (pour Reine)

Duo
  └── Vote
```

Attention :

```text
Voter ──X── Vote
VoteCode ──X── Vote
```

Ces relations ne doivent absolument pas exister.

Le vote doit rester anonymisé au niveau du modèle de données.

---

# 16. Contraintes SQL et index

Ajouter les contraintes nécessaires :

* clés primaires ;
* clés étrangères ;
* unicité ;
* index ;
* `nullable=False` lorsque nécessaire.

Les champs suivants doivent notamment être uniques :

```text
User.username
Voter.voter_number
VoteCode.code
```

Les index doivent être présents sur les champs pour lesquels ils sont explicitement demandés.

Ne pas ajouter des contraintes métier complexes directement dans les modèles si elles doivent être gérées par les services.

---

# 17. UUID et compatibilité SQLite/PostgreSQL

Les UUID doivent être générés côté Python avec :

```python
uuid.uuid4
```

afin de faciliter la compatibilité entre SQLite et PostgreSQL.

Éviter les fonctionnalités exclusivement PostgreSQL dans les modèles de cette première étape.

Si une différence SQLite/PostgreSQL est inévitable, documenter clairement la décision.

---

# 18. Dates et heures

Tous les champs temporels doivent utiliser des datetime UTC timezone-aware.

Éviter :

```python
datetime.utcnow()
```

Préférer une approche moderne permettant de produire des datetime avec timezone UTC.

La même convention doit être utilisée pour :

```text
created_at
used_at
revoked_at
```

---

# 19. `app/models/__init__.py`

Exporter tous les modèles depuis :

```text
app/models/__init__.py
```

Il doit être possible d'importer les modèles depuis ce module central.

Par exemple :

```python
from app.models import User, Voter, VoteCode
```

Inclure également les enums si cela rend l'organisation plus propre.

---

# 20. `app/core/security.py`

Pour cette première étape, préparer uniquement la structure du module.

Ne pas encore implémenter toute l'authentification.

Le fichier doit pouvoir accueillir ultérieurement :

* hashage des mots de passe ;
* vérification des mots de passe ;
* création des JWT ;
* validation des JWT.

Ne pas créer de routes d'authentification maintenant.

---

# 21. `app/main.py`

Créer l'application FastAPI.

Elle doit :

* créer l'instance `FastAPI`;
* charger la configuration ;
* configurer le middleware CORS ;
* exposer un endpoint `/`;
* exposer un endpoint `/health`.

Exemple de comportement attendu :

```text
GET /
→ message indiquant que l'API fonctionne

GET /health
→ statut de santé de l'application
```

Le serveur doit pouvoir être lancé avec :

```bash
uvicorn app.main:app --reload
```

depuis le répertoire `backend/`.

---

# 22. API v1

Créer la structure :

```text
app/api/v1/
```

mais ne pas encore implémenter les routes métier.

La version de l'API sera utilisée ultérieurement pour organiser les endpoints :

```text
/api/v1/...
```

---

# 23. Ce qui NE doit PAS être développé maintenant

Cette étape est limitée à l'infrastructure et aux modèles.

Ne pas implémenter maintenant :

* authentification complète ;
* login ;
* JWT fonctionnels ;
* CRUD des candidats ;
* inscriptions publiques ;
* génération des codes de vote ;
* création des votants ;
* système de vote ;
* transaction anti-double-vote ;
* dashboard ;
* résultats ;
* upload des photos ;
* frontend React ;
* routes métier ;
* services métier ;
* Alembic et migrations ;
* PostgreSQL réel.

Ces éléments seront développés dans des étapes ultérieures.

---

# 24. Qualité du code

Le code doit être :

* propre ;
* lisible ;
* modulaire ;
* entièrement typé ;
* compatible Python 3.11+ ;
* compatible SQLAlchemy 2.0 ;
* compatible Pydantic v2 ;
* directement exécutable.

Éviter les hacks ou solutions temporaires qui compliqueraient les étapes suivantes.

Ajouter de petites docstrings lorsque cela apporte une réelle valeur.

Ne pas sur-ingénieriser le projet.

---

# 25. Tests

**Avant d'effectuer le moindre test, donne-moi d'abord la liste des tests que tu proposes de réaliser.**

Ne lance aucun test automatiquement avant que je valide cette liste.

Les tests proposés devront notamment couvrir :

* import de tous les modèles ;
* création de la base SQLite ;
* création des tables ;
* création d'un `User` ;
* création d'un `Voter` ;
* création d'un `VoteCode` ;
* création d'un `Candidate` Roi ;
* création d'un `Candidate` Reine ;
* création d'un `Duo` ;
* création d'un `Vote` ;
* vérification des relations ;
* vérification de l'absence de relation `Vote → Voter` ;
* vérification des contraintes d'unicité principales ;
* vérification des valeurs par défaut ;
* démarrage de l'application FastAPI ;
* fonctionnement de `/` ;
* fonctionnement de `/health`.

Ne lance pas ces tests avant mon accord.

---

# 26. Dépendances

Si des dépendances doivent être installées, **ne les installe pas toi-même**.

À la fin de ton travail, donne-moi simplement les commandes à exécuter, par exemple :

```bash
python -m venv .venv
```

puis les commandes d'activation adaptées à mon environnement et :

```bash
pip install -r requirements.txt
```

Je réaliserai moi-même l'installation.

---

# 27. Résultat attendu

À la fin de cette étape :

1. La structure `backend/` doit être créée.
2. La configuration FastAPI doit fonctionner.
3. SQLAlchemy doit être correctement configuré.
4. Tous les modèles doivent être créés.
5. Les relations doivent être correctement définies.
6. Les contraintes importantes doivent être présentes.
7. L'anonymat du modèle `Vote` doit être préservé.
8. Le projet doit pouvoir démarrer avec :

```bash
uvicorn app.main:app --reload
```

9. Aucun développement frontend ou métier ne doit être effectué.
10. Aucun test ne doit être exécuté avant que tu m'aies présenté la liste des tests et que je l'aie validée.

---

# 28. Format de ta réponse

Lorsque tu as terminé l'implémentation :

1. Présente-moi brièvement les fichiers créés/modifiés.
2. Présente les principales décisions techniques prises.
3. Signale explicitement les éventuels points qui devront être traités dans une prochaine étape.
4. Donne les commandes d'installation à exécuter.
5. Donne la liste des tests proposés.
6. **N'exécute aucun test avant mon accord.**
7. Ne commence aucune étape supplémentaire sans que je te le demande.


# Étape 2 — Mise en place d'Alembic et des migrations SQLAlchemy

Tu es un développeur Senior Fullstack spécialisé en **Python, FastAPI et SQLAlchemy**.

Nous poursuivons le développement d'une plateforme web événementielle permettant de gérer les élections du **Roi, de la Reine et du Duo le plus élégant** lors d'un bal de fin d'année.

L'étape 1 a été réalisée et validée avec succès.

Le backend dispose actuellement de :

- FastAPI ;
- Uvicorn ;
- SQLAlchemy 2.0 ;
- Pydantic v2 ;
- Pydantic Settings ;
- SQLite pour le développement ;
- modèles SQLAlchemy ;
- configuration de la base de données ;
- `Base` SQLAlchemy ;
- modèles `User`, `Voter`, `VoteCode`, `Candidate`, `Duo`, `Vote` et `SystemSettings` ;
- enums métier ;
- endpoint `/` ;
- endpoint `/health`.

Les tests de l'étape 1 ont été exécutés avec succès.

Les points suivants ont notamment été vérifiés :

- import central des modèles ;
- création des tables SQLite temporaires ;
- création des modèles et relations ;
- valeurs par défaut ;
- anonymat du modèle `Vote` ;
- unicité de `username`, `voter_number` et `VoteCode.code` ;
- démarrage réel d'Uvicorn ;
- fonctionnement de `/` ;
- fonctionnement de `/health`.

Le projet doit maintenant passer à une vraie gestion des migrations avec **Alembic**.

---

# 1. Objectif de cette étape

Mettre en place **Alembic** afin de gérer proprement l'évolution du schéma de base de données.

À la fin de cette étape, nous devons pouvoir :

```text
Modèles SQLAlchemy
        ↓
Alembic
        ↓
Migration
        ↓
Base SQLite
````

et ultérieurement :

```text
Modèles SQLAlchemy
        ↓
Alembic
        ↓
Migration
        ↓
PostgreSQL
```

L'objectif est d'avoir une infrastructure de migration propre avant de commencer les fonctionnalités métier.

---

# 2. Contraintes importantes

Cette étape concerne **uniquement Alembic et la gestion des migrations**.

Ne pas développer maintenant :

* authentification ;
* JWT ;
* CRUD ;
* inscriptions publiques ;
* génération des codes ;
* création des votants ;
* système de vote ;
* dashboard ;
* résultats ;
* frontend React ;
* upload de photos ;
* services métier ;
* routes métier.

Ne pas modifier inutilement les modèles validés lors de l'étape 1.

Si un problème dans les modèles existants empêche la migration de fonctionner correctement, signale-le avant de modifier le modèle.

---

# 3. Dépendance à ajouter

Ajouter uniquement la dépendance nécessaire :

```text
alembic
```

dans :

```text
backend/requirements.txt
```

Ne pas installer la dépendance automatiquement.

À la fin, donner la commande que je dois exécuter moi-même.

---

# 4. Structure Alembic

Mettre en place une structure standard :

```text
backend/
├── alembic/
│   ├── versions/
│   │   └── ...
│   ├── env.py
│   ├── script.py.mako
│   └── README
├── alembic.ini
├── app/
│   ├── ...
│   └── models/
│       ├── base.py
│       ├── user.py
│       ├── voter.py
│       ├── vote_code.py
│       ├── candidate.py
│       ├── duo.py
│       ├── vote.py
│       └── system_settings.py
├── .env
├── .env.example
└── requirements.txt
```

Utiliser la structure standard générée par Alembic lorsque cela est possible.

---

# 5. Configuration de la connexion

Alembic doit utiliser la même configuration de base de données que l'application.

La source de vérité pour l'URL de la base doit rester :

```text
DATABASE_URL
```

définie dans la configuration de l'application.

Ne pas créer une deuxième URL de base de données indépendante qui pourrait devenir différente de celle utilisée par FastAPI.

Si nécessaire, adapter `alembic/env.py` afin de récupérer l'URL depuis `app.core.config`.

---

# 6. Import des modèles

Configurer correctement :

```text
alembic/env.py
```

afin qu'Alembic connaisse le `Base.metadata` de SQLAlchemy.

Il doit notamment pouvoir accéder à tous les modèles :

```text
User
Voter
VoteCode
Candidate
Duo
Vote
SystemSettings
```

Utiliser le `Base` existant :

```python
from app.models.base import Base
```

et configurer :

```python
target_metadata = Base.metadata
```

S'assurer que tous les modèles sont effectivement importés avant l'utilisation de `Base.metadata`.

Le but est qu'Alembic détecte toutes les tables existantes.

---

# 7. Autogenerate

Configurer Alembic afin de permettre :

```bash
alembic revision --autogenerate -m "..."
```

L'autogénération doit détecter les différences entre :

```text
Base.metadata
```

et :

```text
Base de données
```

Ne pas écrire de logique d'autogénération personnalisée inutile.

---

# 8. Première migration

Créer la première migration officielle du projet.

Nommer la migration de manière claire, par exemple :

```text
initial_schema
```

ou :

```text
create_initial_schema
```

La migration doit créer toutes les tables nécessaires aux modèles validés à l'étape 1.

Tables attendues :

```text
users
voters
vote_codes
candidates
duos
votes
system_settings
```

Respecter les noms de tables déjà définis par les modèles.

**Ne pas modifier silencieusement les noms des tables ou colonnes existants.**

---

# 9. Contenu de la migration initiale

La migration doit prendre en compte :

## `users`

* UUID PK ;
* username unique ;
* index username ;
* password_hash ;
* role ;
* created_at.

## `voters`

* UUID PK ;
* voter_number ;
* contrainte UNIQUE ;
* index ;
* created_at.

## `vote_codes`

* UUID PK ;
* code ;
* contrainte UNIQUE ;
* index ;
* voter_id FK ;
* status ;
* created_at ;
* used_at nullable ;
* revoked_at nullable.

## `candidates`

* UUID PK ;
* category ;
* first_name ;
* last_name ;
* photo_url nullable ;
* is_manual_entry ;
* created_at.

## `duos`

* UUID PK ;
* duo_name nullable ;
* informations du cavalier ;
* informations de la cavalière ;
* photos nullable ;
* is_manual_entry ;
* created_at.

## `votes`

* UUID PK ;
* roi_candidate_id FK ;
* reine_candidate_id FK ;
* duo_id FK ;
* created_at.

IMPORTANT :

La table `votes` ne doit contenir aucune colonne :

```text
voter_id
vote_code_id
```

et aucune FK vers :

```text
voters
vote_codes
```

L'anonymat du bulletin doit être conservé.

## `system_settings`

* id INTEGER PK ;
* roi_limit ;
* reine_limit ;
* roi_inscriptions_open ;
* reine_inscriptions_open ;
* duo_inscriptions_open ;
* voting_status ;
* results_published.

---

# 10. Ordre de création des tables

Faire en sorte que les clés étrangères puissent être créées correctement.

Les tables référencées doivent être créées avant les tables qui les référencent.

Par exemple :

```text
users
voters
candidates
duos
        ↓
vote_codes
votes
system_settings
```

L'ordre exact peut être adapté à la structure réelle des modèles.

---

# 11. Downgrade

La migration initiale doit avoir un `downgrade()` propre.

Le downgrade doit supprimer les tables dans l'ordre inverse des dépendances.

Il ne doit pas laisser de tables orphelines.

---

# 12. SQLite

Le développement local utilise SQLite.

Vérifier que :

```bash
alembic upgrade head
```

fonctionne correctement avec SQLite.

La migration doit créer correctement les tables, contraintes et index.

Ne pas utiliser dans la migration initiale des fonctionnalités exclusivement PostgreSQL qui empêcheraient son exécution sur SQLite.

---

# 13. PostgreSQL

Le projet devra être compatible PostgreSQL en production.

Ne pas ajouter de logique spécifique à PostgreSQL lorsque cela n'est pas nécessaire.

Si une fonctionnalité doit être différente entre SQLite et PostgreSQL, documenter clairement le problème au lieu de masquer la différence.

---

# 14. Variables d'environnement

Vérifier que le fichier :

```text
.env.example
```

contient bien :

```text
DATABASE_URL
```

avec une valeur adaptée au développement local.

Ne pas mettre de mot de passe ou de secret réel dans `.env.example`.

Le `.env` reste réservé à l'environnement local.

---

# 15. Configuration d'Alembic

Configurer correctement :

```text
alembic.ini
```

et :

```text
alembic/env.py
```

pour que les commandes suivantes puissent être utilisées depuis `backend/` :

```bash
alembic current
alembic history
alembic upgrade head
alembic downgrade -1
```

et :

```bash
alembic revision --autogenerate -m "message"
```

---

# 16. Vérification de l'état des migrations

Après création de la migration initiale, vérifier que :

```bash
alembic current
```

permet de connaître la révision actuellement appliquée.

Et :

```bash
alembic history
```

doit afficher correctement la migration initiale.

---

# 17. Test du cycle upgrade / downgrade

Préparer un environnement SQLite temporaire pour vérifier le cycle :

```text
Base vide
   ↓
alembic upgrade head
   ↓
Toutes les tables existent
   ↓
alembic downgrade -1
   ↓
Les tables de la migration sont supprimées
   ↓
alembic upgrade head
   ↓
Les tables sont recréées
```

Attention :

Ne pas utiliser la base de développement réelle pour un downgrade destructif sans me prévenir.

Utiliser une base SQLite temporaire ou une copie dédiée aux tests.

---

# 18. Vérification avec SQLAlchemy

Après :

```bash
alembic upgrade head
```

vérifier que les tables créées correspondent bien aux modèles SQLAlchemy.

Vérifier notamment :

* présence de toutes les tables ;
* présence des PK ;
* présence des FK ;
* présence des contraintes UNIQUE ;
* présence des index ;
* présence des colonnes nullable ;
* valeurs par défaut lorsque pertinentes ;
* absence de `voter_id` dans `votes` ;
* absence de `vote_code_id` dans `votes`.

---

# 19. Ne pas ajouter de données métier

La migration initiale ne doit pas insérer de candidats, votants ou utilisateurs administrateurs.

Ne pas créer automatiquement :

```text
Admin
Voter
Candidate
Duo
Vote
VoteCode
```

dans la migration.

La création de l'administrateur et les données initiales seront traitées dans une prochaine étape.

Concernant `SystemSettings`, respecter la structure du modèle mais ne pas créer silencieusement une logique de seed si elle n'existe pas déjà dans l'architecture.

Si tu estimes qu'un seed initial est nécessaire, signale-le avant de l'ajouter.

---

# 20. Modification des modèles

Les modèles de l'étape 1 ont été validés.

Ne pas les refactorer inutilement.

Si Alembic révèle un problème structurel réel, par exemple :

* table non détectée ;
* FK incorrecte ;
* type incompatible ;
* index manquant ;
* contrainte absente ;

corriger uniquement ce qui est nécessaire.

Pour toute modification qui change le comportement métier, arrêter l'implémentation et me signaler le problème.

---

# 21. Qualité du code

Le code doit rester :

* propre ;
* lisible ;
* typé ;
* modulaire ;
* compatible Python 3.11+ ;
* compatible SQLAlchemy 2.0 ;
* compatible SQLite ;
* préparé pour PostgreSQL.

Ne pas ajouter de dépendances inutiles.

Ne pas dupliquer la configuration de base de données.

Ne pas créer de système parallèle de gestion des migrations.

---

# 22. Tests

**IMPORTANT : ne lance aucun test immédiatement.**

Avant d'exécuter quoi que ce soit, présente-moi d'abord la liste exacte des tests que tu proposes.

La liste devrait notamment couvrir :

### Configuration

* Alembic démarre correctement.
* `alembic current` fonctionne.
* `alembic history` fonctionne.

### Migration

* `alembic upgrade head` fonctionne sur une SQLite temporaire.
* Toutes les tables attendues sont créées.
* Toutes les FK attendues existent.
* Les contraintes UNIQUE sont présentes.
* Les index attendus sont présents.

### Anonymat

Vérifier que la table `votes` :

* ne contient pas `voter_id` ;
* ne contient pas `vote_code_id` ;
* n'a aucune FK vers `voters` ;
* n'a aucune FK vers `vote_codes`.

### Downgrade

* `alembic downgrade -1` fonctionne ;
* les tables de la migration sont supprimées ;
* `alembic upgrade head` fonctionne à nouveau après le downgrade.

### Cohérence

* Les tables produites par Alembic correspondent aux modèles SQLAlchemy.
* Aucun changement inattendu n'est détecté par `alembic revision --autogenerate`.

**Ne lance aucun de ces tests avant mon accord.**

---

# 23. Dépendances

Ne pas installer les dépendances automatiquement.

À la fin, donner les commandes que je dois exécuter moi-même.

Par exemple :

```bash
pip install -r requirements.txt
```

Si Alembic est ajouté au fichier `requirements.txt`, ne pas exécuter la commande d'installation.

---

# 24. Commandes à me fournir

À la fin de l'implémentation, me donner les commandes nécessaires pour :

### Installer les dépendances

```bash
pip install -r requirements.txt
```

### Vérifier Alembic

```bash
alembic current
```

### Voir l'historique

```bash
alembic history
```

### Appliquer les migrations

```bash
alembic upgrade head
```

### Revenir d'une migration

```bash
alembic downgrade -1
```

Ne pas exécuter ces commandes sans mon accord lorsqu'elles impliquent une modification de la base.

---

# 25. Résultat attendu

À la fin de cette étape, le projet doit disposer de :

```text
backend/
├── alembic/
│   ├── versions/
│   │   └── <migration_initiale>.py
│   ├── env.py
│   ├── script.py.mako
│   └── README
├── alembic.ini
├── app/
│   ├── ...
│   └── models/
│       └── ...
├── .env
├── .env.example
└── requirements.txt
```

Et nous devons pouvoir avoir le workflow suivant :

```text
Modèles SQLAlchemy
        ↓
Base.metadata
        ↓
Alembic
        ↓
Migration initiale
        ↓
SQLite
```

avec une architecture prête pour :

```text
PostgreSQL
```

en production.

---

# 26. Ce que tu dois me retourner à la fin

Lorsque tu as terminé :

1. Résume les fichiers créés ou modifiés.
2. Indique comment Alembic récupère la configuration `DATABASE_URL`.
3. Indique comment `Base.metadata` est connecté à Alembic.
4. Indique le nom de la migration initiale.
5. Signale les éventuelles modifications apportées aux modèles de l'étape 1.
6. Donne les commandes d'installation à exécuter.
7. Donne les commandes Alembic utiles.
8. Présente la liste des tests que tu proposes.
9. **N'exécute aucun test avant mon accord.**
10. Ne commence aucune fonctionnalité de l'étape suivante.

L'objectif est de terminer proprement **uniquement la gestion des migrations** avant de passer au développement métier.

# Étape 3 — Authentification, Sécurité et Initialisation de l'Administrateur

Tu es un développeur Senior Fullstack spécialisé en Python, FastAPI et SQLAlchemy.

Nous développons une plateforme web événementielle pour un bal de fin d'année. 
L'Étape 1 (Modèles SQLAlchemy) et l'Étape 2 (Migrations Alembic) ont été réalisées et validées avec succès. 
Le schéma de base de données est propre, et les migrations fonctionnent parfaitement.

L'objectif de cette Étape 3 est de mettre en place la couche de sécurité (hachage des mots de passe, génération/validation de JWT) et de créer les routes d'authentification pour les Administrateurs et les Agents d'accueil.

---

# 1. Objectifs de l'étape

1. Implémenter `app/core/security.py` pour la gestion des mots de passe et des tokens JWT.
2. Créer les schémas Pydantic pour l'authentification et les utilisateurs.
3. Créer les dépendances FastAPI (`app/api/deps.py`) pour récupérer l'utilisateur courant.
4. Créer les endpoints de login (`/login/access-token`).
5. Créer un script d'initialisation (`init_db.py`) pour générer le premier compte Administrateur par défaut si la base est vide.

---

# 2. Sécurité (`app/core/security.py`)

Implémenter les fonctions suivantes en utilisant `passlib` (avec bcrypt) et `python-jose` :
- `verify_password(plain_password: str, hashed_password: str) -> bool`
- `get_password_hash(password: str) -> str`
- `create_access_token(subject: str | Any, expires_delta: timedelta = None) -> str`

Le token JWT doit inclure le `role` de l'utilisateur dans son payload pour faciliter les vérifications ultérieures côté frontend.

---

# 3. Schémas Pydantic (`app/schemas/`)

Créer les fichiers suivants :

### `app/schemas/token.py`
- `Token` : contenant `access_token` (str) et `token_type` (str).
- `TokenPayload` : contenant `sub` (str, pour l'ID de l'utilisateur) et `role` (str).

### `app/schemas/user.py`
- `UserBase` : propriétés communes (username, role).
- `UserCreate` : pour la création (ajoute password).
- `UserResponse` : pour les retours d'API (ajoute id, created_at, exclut le mot de passe). Configuré avec `model_config = ConfigDict(from_attributes=True)`.

---

# 4. Service / CRUD Utilisateur (`app/services/user_service.py`)

Créer un service simple pour encapsuler les opérations sur la table `users` :
- `get_user_by_username(db: Session, username: str) -> User | None`
- `authenticate_user(db: Session, username: str, password: str) -> User | None`
- `create_user(db: Session, user_in: UserCreate) -> User` (doit hacher le mot de passe avant insertion).

---

# 5. Dépendances FastAPI (`app/api/deps.py`)

Créer les dépendances d'injection pour sécuriser les routes :
- `get_current_user` : vérifie le token JWT dans le header `Authorization`, décode le payload, et retourne l'objet `User` depuis la DB. Lève une `HTTPException` (401) si invalide.
- `get_current_admin` : utilise `get_current_user` et vérifie que `user.role == UserRole.ADMIN`. Lève une `HTTPException` (403) si le rôle est insuffisant.

---

# 6. Endpoints d'Authentification (`app/api/v1/auth.py`)

Créer un routeur FastAPI (`APIRouter`) avec les endpoints suivants :
- `POST /login/access-token` : Route compatible avec OAuth2 (utiliser `OAuth2PasswordRequestForm`). Vérifie les identifiants et retourne un `Token`.
- `GET /me` : Route protégée (utilisant `get_current_user`) qui retourne l'utilisateur actuellement connecté (`UserResponse`).

Intégrer ce routeur dans `app/main.py` sous le préfixe `/api/v1/auth`.

---

# 7. Initialisation de la base (`app/initial_data.py` ou `scripts/init_db.py`)

Créer un script exécutable indépendant (ex: `python -m app.initial_data`) qui :
1. Crée une session DB.
2. Vérifie s'il existe déjà un utilisateur avec le rôle `ADMIN`.
3. Si aucun n'existe, crée un utilisateur Administrateur par défaut (ex: username: `admin`, password: récupéré depuis les variables d'environnement ou une valeur par défaut forte générée).
4. Initialise également une ligne unique dans `SystemSettings` (id=1) avec les valeurs par défaut si elle n'existe pas.

---

# 8. Contraintes et Règles strictes

- Ne modifier aucun modèle SQLAlchemy existant.
- Ne pas encore créer les routes de gestion des candidats, des votants ou des votes.
- Respecter le typage strict Python 3.11+.
- Gérer proprement les erreurs HTTP (401, 403, 404) avec des messages clairs.
- Ne lancer aucun test automatisé ni serveur sans m'avoir d'abord présenté le plan de test.

---

# 9. Format de ta réponse

1. Liste et affiche le code des fichiers créés/modifiés de manière claire.
2. Explique brièvement l'implémentation de `get_current_user` et la gestion du payload JWT.
3. Propose les variables d'environnement supplémentaires à ajouter à `.env.example` (ex: `FIRST_SUPERUSER`, `FIRST_SUPERUSER_PASSWORD`).
4. **Fournis une liste précise des tests que tu proposes de réaliser pour valider cette étape.**
5. **N'exécute aucun test avant mon accord explicite.**

# Étape 4 — Gestion de l'Administration : Paramètres globaux et Candidats

Tu es un développeur Senior Fullstack spécialisé en Python, FastAPI et SQLAlchemy.

Nous développons une plateforme web événementielle pour un bal de fin d'année.
L'Étape 3 (Authentification et Sécurité) a été validée avec succès. Le système de JWT et la dépendance `get_current_admin` sont fonctionnels.

L'objectif de cette Étape 4 est de développer les fonctionnalités d'administration : 
1. La gestion des paramètres globaux du bal (limites, statuts d'ouverture/fermeture).
2. Le CRUD (Create, Read, Update, Delete) complet pour les candidats (Roi/Reine) et les Duos, strictement réservé aux administrateurs.

---

# 1. Objectifs de l'étape

- Créer les schémas Pydantic pour `SystemSettings`, `Candidate`, et `Duo`.
- Implémenter les services métiers (`services/`) pour encapsuler la logique de base de données.
- Créer les routes d'API sécurisées (`api/v1/`) protégées par la dépendance `get_current_admin`.
- Enregistrer ces nouveaux routeurs dans l'application FastAPI principale.

---

# 2. Schémas Pydantic (`app/schemas/`)

Créer les fichiers suivants en utilisant `ConfigDict(from_attributes=True)` pour les réponses :

### `app/schemas/system_settings.py`
- `SystemSettingsUpdate` : Permet de mettre à jour partiellement les limites (roi_limit, reine_limit) et les statuts (roi_inscriptions_open, reine_inscriptions_open, duo_inscriptions_open, voting_status, results_published)[cite: 2]. Tous les champs doivent être optionnels.
- `SystemSettingsResponse` : Reflète l'intégralité du modèle SQLAlchemy.

### `app/schemas/candidate.py`
- `CandidateCreate` : category, first_name, last_name, photo_url (optionnel).
- `CandidateUpdate` : Mêmes champs que Create, mais tous optionnels.
- `CandidateResponse` : Ajoute `id`, `is_manual_entry` et `created_at`.

### `app/schemas/duo.py`
- `DuoCreate` : duo_name (optionnel), cavalier_first_name, cavalier_last_name, cavalier_photo_url (optionnel), cavaliere_first_name, cavaliere_last_name, cavaliere_photo_url (optionnel)[cite: 2].
- `DuoUpdate` : Mêmes champs, tous optionnels.
- `DuoResponse` : Ajoute `id`, `is_manual_entry` et `created_at`.

---

# 3. Services Métier (`app/services/`)

Créer les fichiers suivants pour interagir avec SQLAlchemy :

### `app/services/settings_service.py`
- `get_settings(db: Session)` : Récupère la ligne unique `SystemSettings` (id=1).
- `update_settings(db: Session, settings_in: SystemSettingsUpdate)` : Met à jour la configuration existante.

### `app/services/candidate_service.py`
- `get_candidates(db: Session, category: CandidateCategory | None = None)` : Liste les candidats (filtrables par catégorie).
- `get_candidate(db: Session, candidate_id: UUID)` : Récupère un candidat spécifique.
- `create_candidate(db: Session, candidate_in: CandidateCreate, is_manual_entry: bool = True)` : Crée un candidat. Pour cette étape (administration), `is_manual_entry` sera forcé à `True` par le routeur[cite: 2].
- `update_candidate(...)` et `delete_candidate(...)`.

### `app/services/duo_service.py`
- Opérations CRUD similaires : `get_duos`, `get_duo`, `create_duo` (avec `is_manual_entry=True`)[cite: 2], `update_duo`, `delete_duo`.

---

# 4. Routeurs API (`app/api/v1/`)

Toutes les routes de cette étape doivent être protégées par la dépendance `get_current_admin` provenant de `app.api.deps`.

Créer les routeurs suivants :

### `app/api/v1/admin_settings.py` (Prefix: `/admin/settings`)
- `GET /` : Retourne les paramètres.
- `PATCH /` : Met à jour les paramètres (limites, ouvertures/fermetures, etc.).

### `app/api/v1/admin_candidates.py` (Prefix: `/admin/candidates`)
- `GET /` : Liste les candidats.
- `POST /` : Ajoute manuellement un candidat (force `is_manual_entry=True`).
- `GET /{candidate_id}`
- `PATCH /{candidate_id}`
- `DELETE /{candidate_id}`

### `app/api/v1/admin_duos.py` (Prefix: `/admin/duos`)
- Mêmes endpoints CRUD que pour les candidats, adaptés aux Duos. L'ajout manuel force `is_manual_entry=True`[cite: 2].

---

# 5. Intégration

- Modifier `app/main.py` pour inclure ces trois nouveaux routeurs avec leurs préfixes respectifs.

---

# 6. Contraintes strictes

- **Ne pas développer les inscriptions publiques** : Ces routes sont purement administratives. Les limites configurées dans `SystemSettings` n'empêchent pas l'administrateur d'ajouter manuellement des candidats (règle métier)[cite: 2].
- Ne pas implémenter l'upload d'images physique : `photo_url` est traité comme une simple chaîne de caractères (String) pour le moment.
- Conserver une gestion d'erreur propre : Lancer des `HTTPException(status_code=404)` si un élément est introuvable lors d'un GET/PATCH/DELETE.
- Ne lancer aucun test automatisé avant que je valide le plan de test.

---

# 7. Format de ta réponse

1. Liste le code des fichiers créés ou modifiés.
2. Explique brièvement comment tu as géré le forçage de `is_manual_entry=True` pour les ajouts administratifs.
3. **Fournis une liste précise des tests (CRUD, protection des routes, mise à jour des settings) que tu proposes de réaliser pour valider cette étape.**
4. **N'exécute aucun test avant mon accord explicite.**

# Étape 5 — Inscriptions Publiques des Candidats et des Duos

Tu es un développeur Senior Fullstack spécialisé en Python, FastAPI et SQLAlchemy.

Nous développons une plateforme web événementielle pour un bal de fin d'année.
L'Étape 4 (Administration, Paramètres et CRUD admin) a été validée avec succès. L'administrateur peut configurer les limites et forcer l'ajout de candidats.

L'objectif de cette Étape 5 est de créer les routes publiques permettant aux étudiants de soumettre eux-mêmes leur candidature (Roi, Reine, ou Duo). Ces routes ne requièrent aucune authentification mais doivent **strictement respecter les limites et les statuts d'ouverture** définis dans les paramètres du système.

---

# 1. Objectifs de l'étape

1. Exposer des routes publiques (sans JWT) pour l'inscription des candidats et des duos.
2. Exposer une route publique permettant au frontend de connaître l'état des inscriptions (ouvert/fermé) pour adapter l'affichage.
3. Implémenter la logique métier de validation : refuser toute inscription publique si les inscriptions sont fermées ou si le quota est atteint.
4. Assurer que toute inscription via ces routes ait le champ `is_manual_entry=False`.

---

# 2. Logique Métier & Validation (`app/services/`)

Tu dois créer ou mettre à jour les services pour gérer les vérifications suivantes avant l'insertion en base de données :

### Validation Candidat Public
- Vérifier la configuration globale `SystemSettings` (id=1).
- Si `category == ROI` :
  - Vérifier que `roi_inscriptions_open` est `True`. Sinon, lever une `HTTPException(400, "Les inscriptions pour la catégorie Roi sont fermées.")`.
  - Compter le nombre actuel de candidats Roi **publics** (`category=ROI` ET `is_manual_entry=False`). Si ce nombre est `>= roi_limit`, lever une `HTTPException(400, "La limite de candidats pour la catégorie Roi est atteinte.")`.
- Même logique pour `category == REINE` avec `reine_inscriptions_open` et `reine_limit`.

### Validation Duo Public
- Vérifier que `duo_inscriptions_open` est `True`. Sinon, lever une `HTTPException(400, "Les inscriptions pour les Duos sont fermées.")`.
- *Note : Il n'y a pas de limite numérique (quota) pour les duos dans le cahier des charges actuel, seul le statut d'ouverture compte.*

---

# 3. Routeurs API (`app/api/v1/public/`)

Créer un nouveau routeur `app/api/v1/public_registrations.py` (Prefix : `/public`) sans aucune dépendance d'authentification.

### `GET /settings`
- Retourne l'état actuel des inscriptions (peut réutiliser `SystemSettingsResponse` ou un schéma simplifié `PublicSettingsResponse` ne contenant que les booléens d'ouverture).

### `POST /candidates`
- Reçoit un `CandidateCreate`.
- Appelle le service de validation et de création en s'assurant de passer `is_manual_entry=False`.
- Retourne le candidat créé (Code 201).

### `POST /duos`
- Reçoit un `DuoCreate`.
- Appelle le service de validation et de création en s'assurant de passer `is_manual_entry=False`.
- Retourne le duo créé (Code 201).

---

# 4. Intégration

- Modifier `app/main.py` pour inclure ce nouveau routeur sous le préfixe `/api/v1/public`.

---

# 5. Contraintes strictes

- **Aucune sécurité JWT :** Ces routes doivent être accessibles à tous.
- **Séparation stricte :** Les candidats créés par l'administrateur (`is_manual_entry=True`) ne doivent **pas** être comptabilisés dans le calcul de la limite (`roi_limit`, `reine_limit`). La limite ne s'applique qu'aux candidatures spontanées.
- Gérer les erreurs proprement avec des messages clairs en français pour le frontend.
- Ne lancer aucun test automatisé avant que je valide le plan de test.

---

# 6. Format de ta réponse

1. Liste le code des fichiers créés ou modifiés (services, routeurs, intégration).
2. Explique précisément la requête SQLAlchemy utilisée pour compter les candidats et vérifier la limite sans inclure les ajouts administratifs.
3. **Fournis une liste précise des tests que tu proposes de réaliser pour valider ces vérifications de quotas et de statuts.**
4. **N'exécute aucun test avant mon accord explicite.**

# Étape 6 — Le Système de Vote

Tu es un développeur Senior Fullstack spécialisé en Python, FastAPI et SQLAlchemy.

Nous développons une plateforme web événementielle pour un bal de fin d'année.
L'Étape 5 (Inscriptions Publiques) a été validée avec succès. Les candidats et les duos peuvent s'inscrire en respectant les limites configurées par l'administration.

L'objectif de cette Étape 6 est d'implémenter le moteur de vote. Ce système doit permettre d'enregistrer les votes des étudiants tout en garantissant l'intégrité du scrutin (un seul vote par catégorie et par étudiant) et le respect des paramètres globaux.

---

# 1. Objectifs de l'étape

1. Créer les schémas Pydantic pour la soumission et la lecture des votes.
2. Implémenter la logique métier pour valider un vote (vérification de l'état global du vote, existence du candidat/duo, vérification de l'unicité).
3. Créer le routeur API pour soumettre un vote.
4. Assurer que les administrateurs puissent consulter les résultats partiels ou finaux si nécessaire.

---

# 2. Schémas Pydantic (`app/schemas/vote.py`)

Créer les schémas suivants :
- `VoteCreate` : Doit contenir `voter_identifier` (str - ex: numéro d'étudiant, email ou code unique), `category` (enum : ROI, REINE, DUO), et `candidate_id` (UUID, optionnel) ou `duo_id` (UUID, optionnel).
- `VoteResponse` : Reflète le modèle créé (avec `id` et `created_at`). `model_config = ConfigDict(from_attributes=True)`.

---

# 3. Logique Métier & Validation (`app/services/vote_service.py`)

Créer le service de gestion des votes avec les vérifications critiques suivantes avant insertion :

### Validation du Vote
- **Vérification globale :** Récupérer `SystemSettings` (id=1). Si `voting_status` n'est pas `OPEN` (ou `True`, selon ton implémentation de l'Étape 1), lever une `HTTPException(400, "Les votes sont actuellement fermés.")`.
- **Cohérence des données :** 
  - Si `category == ROI` ou `REINE`, vérifier que `candidate_id` est fourni et que le candidat existe dans la bonne catégorie. Sinon, erreur 400/404.
  - Si `category == DUO`, vérifier que `duo_id` est fourni et que le duo existe. Sinon, erreur 400/404.
- **Unicité :** Interroger la base de données pour vérifier si un vote existe déjà pour ce `voter_identifier` dans cette `category`. Si oui, lever une `HTTPException(400, "Vous avez déjà voté pour cette catégorie.")`.

### Comptage (Pour l'administration)
- Créer une fonction `get_vote_results(db: Session)` qui retourne le compte des votes groupés par candidats et par duos (utile pour le tableau de bord admin).

---

# 4. Routeurs API 

### Routeur Public (`app/api/v1/public_votes.py`) (Prefix : `/public/votes`)
- `POST /` : Reçoit un `VoteCreate`, effectue les validations via le service, et enregistre le vote. Retourne un `VoteResponse` (Code 201). Aucune authentification JWT requise, l'identification se fait via le `voter_identifier`.

### Routeur Admin (`app/api/v1/admin_votes.py`) (Prefix : `/admin/votes`)
- `GET /results` : Protégé par `Depends(get_current_admin)`. Retourne les statistiques et le comptage des votes.

---

# 5. Intégration

- Modifier `app/main.py` pour inclure ces deux nouveaux routeurs avec leurs préfixes et dépendances respectifs.

---

# 6. Contraintes strictes

- **Intégrité absolue :** La vérification de l'unicité (`voter_identifier` + `category`) est la règle la plus importante du système.
- Conserver des messages d'erreur clairs et en français.
- Ne modifier aucun modèle SQLAlchemy existant sans mon accord (le modèle Vote doit déjà exister depuis l'Étape 1).
- Ne lancer aucun test automatisé avant que je valide le plan de test.

---

# 7. Format de ta réponse

1. Liste le code des fichiers créés ou modifiés (schémas, services, routeurs).
2. Explique précisément comment tu gères la validation d'unicité (requête SQLAlchemy) et la gestion des exceptions.
3. **Fournis une liste précise des tests (cas nominaux, rejets pour double vote, rejets pour vote fermé) que tu proposes de réaliser.**
4. **N'exécute aucun test avant mon accord explicite.**

# Étape 7 — Tableau de bord des résultats finaux, publication et clôture

Tu es un développeur Senior Fullstack spécialisé en Python, FastAPI et SQLAlchemy.

Nous développons une plateforme web événementielle pour un bal de fin d'année.
L'Étape 6 (Système de vote et contrôle d'unicité) a été validée avec succès. 

L'objectif de cette Étape 7 (la dernière ligne droite) est de gérer la publication des résultats et de finaliser le tableau de bord pour que le public puisse consulter les vainqueurs lorsque l'administrateur décide de publier les résultats.

---

# 1. Objectifs de l'étape

1. Mettre en place un endpoint public de consultation des résultats (`GET /api/v1/public/results`) qui vérifie le paramètre global `results_published` dans `SystemSettings`.
2. S'assurer que l'administrateur peut basculer l'état de publication (`results_published`) via le routeur de configuration existant (`PATCH /api/v1/admin/settings`).
3. Structurer les données de résultats retournées au public (comptage par candidat pour Roi/Reine et par duo, identification claire des gagnants ou classement).

---

# 2. Logique Métier & Service (`app/services/vote_service.py` ou nouveau service)

- Étendre ou créer une fonction de calcul des résultats publics qui :
  - Vérifie si `SystemSettings.results_published` est à `True`. Si `False`, lève une `HTTPException(403, "Les résultats ne sont pas encore publiés.")`.
  - Agrège les votes pour chaque catégorie (`ROI`, `REINE`, `DUO`) en comptant le nombre de votes par candidat/duo.
  - Retourne une structure claire (ex: liste des candidats avec leur nombre de votes, triée par ordre décroissant).

---

# 3. Routeurs API

### Routeur Public (`app/api/v1/public_votes.py` ou `public_results.py`) (Prefix : `/public`)
- `GET /results` : Route publique retournant les résultats agrégés si `results_published` est vrai, sinon erreur 403.

### Routeur Admin (Vérification)
- S'assurer que l'administrateur peut modifier `results_published` à l'aide de l'endpoint de configuration (`PATCH /admin/settings`) créé à l'Étape 4.

---

# 4. Intégration

- Enregistrer ou vérifier l'intégration des routes de résultats publics dans `app/main.py`.

---

# 5. Contraintes strictes

- **Sécurité et Confidentialité :** Les votes détaillés ou les totaux intermédiaires ne doivent **jamais** être accessibles au public tant que l'administrateur n'a pas basculé `results_published` à `True`.
- Conserver des messages clairs en français.
- Ne lancer aucun test automatisé avant que je valide le plan de test.

---

# 6. Format de ta réponse

1. Liste le code des fichiers créés ou modifiés.
2. Explique comment est gérée la vérification de `results_published` pour bloquer ou autoriser l'accès public aux résultats.
3. **Fournis une liste précise des tests que tu proposes de réaliser pour valider cette étape (accès refusé quand non publié, accès autorisé et cohérence des comptages quand publié).**
4. **N'exécute aucun test avant mon accord explicite.**