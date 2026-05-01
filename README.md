# Code Source Public - Contexte Électeur

Ce repository contient le code source JavaScript de l'interface électeur des élections consulaires 2026.

## Document de spécifications

**[📄 Spécifications publiques VPI - meae_vpi_n_specs_PUBLIQUES-0-11.pdf](https://github.com/Voxaly/meae-consulaires-2026-recette/releases/download/meae-consulaire-4.14.17/meae_vpi_n_specs_PUBLIQUES-0-11.pdf)**

Ce document décrit les spécifications techniques et fonctionnelles du système de vote par internet (VPI).

## Informations de publication

- **Version** : meae-consulaire-4.14.17
- **Date** : 2026-05-01 16:23:21
- **Commit** : 2d64e664cd
- **Auteur** : jenkins

## Structure du projet

```
.
├── LICENCE.md                         # Licence du code publié
├── README.md                          # Ce fichier
├── package.json                       # Dépendances npm
├── webpack.config.js                  # Configuration de compilation électeur
├── src/
│   └── includes/
│       ├── election/javascript/       # Code source TypeScript/React électeur
│       └── commun/javascript/         # Utilitaires partagés
├── dist/election/                     # Bundles compilés
│   ├── app.bundle.js                  # Application React Vox
│   ├── app.style.css                  # Styles CSS
│   ├── crypto.bundle.js               # Cryptographie (chiffrement des votes)
│   └── *.chunk.js                     # Modules chargés dynamiquement
└── crypto/                            # Bibliothèque cryptographique edwards25519
    └── src/                           # Sources C de la crypto
```

---

## Empreintes des bundles distribués

**Checksums SHA-256 des fichiers JavaScript :**

Ces empreintes permettent de vérifier que les bundles distribués correspondent exactement au code source publié.

- `app.bundle.js`: `f9dad3c245930945d9c0e528654b6e105a725a753d3006f319ae79e5a6c51cd9`
- `crypto.bundle.js`: `50fad4c0442990b2a9955613fd257df92401c9dfefbfefdf28e730729146208d`
- `315.chunk.js`: `c6c0c0faf99f7d24ff57befc72ab87c271da8138c2ba85395249833141107928`
- `354.chunk.js`: `a65ea0cc3ddc59cafe04fdafff7d6455a0f5e9bd1e2810079eb93cdf872025cf`
- `500.chunk.js`: `79b9833b0e07783dd8c53a35e723ba4dbf9f0cacf0c5577116050cce7f092022`
- `903.chunk.js`: `73c2abd2fbd21f9c903c4c318afa1434d80e95fcbc675c2106be3f9813eeddb4`
---

## Vérification de l'intégrité

### Pour les électeurs et auditeurs (vérification depuis le navigateur)

Toute personne peut vérifier que le code exécuté dans son navigateur correspond au code source publié ici.

#### 1. Accéder au site et ouvrir les outils développeur

- Rendez-vous sur : https://votefae-n.diplomatie.gouv.fr/
- Ouvrez les DevTools : `F12` ou `Ctrl+Maj+I` (Windows/Linux) / `Cmd+Option+I` (Mac)

#### 2. Identifier les fichiers chargés

1. Allez dans l'onglet **"Sources"** (Chrome/Edge) ou **"Débogueur"** (Firefox)
2. Développez l'arborescence jusqu'à `/includes/dist/election/`

**Vous devriez voir les fichiers suivants :**
- `app.bundle.js` ← **Application de vote (fichier principal)**
- `crypto.bundle.js` ← **Cryptographie**
- `app.style.css` ← Styles
- `500.chunk.js` ← Module d'erreur (optionnel)

**En naviguant dans l'application (bulletin de vote, confirmation), d'autres modules peuvent apparaître :**
- `315.chunk.js`, `354.chunk.js`, `418.chunk.js`, etc.

Ces modules sont chargés automatiquement selon vos actions pour optimiser la performance.

#### 3. Télécharger les fichiers JavaScript

**Méthode 1 : Via l'onglet Sources**
- Clic droit sur chaque fichier `.js` → **"Save as..."** / **"Enregistrer sous..."**

**Méthode 2 : URLs directes**

Vous pouvez télécharger directement les fichiers en accédant aux URLs :
```
https://votefae-n.diplomatie.gouv.fr/includes/dist/election/app.bundle.js
https://votefae-n.diplomatie.gouv.fr/includes/dist/election/crypto.bundle.js
https://votefae-n.diplomatie.gouv.fr/includes/dist/election/500.chunk.js
```

**Note :** Pour voir et télécharger tous les modules, parcourez l'application complète (identification → bulletin → confirmation). Chaque étape peut charger de nouveaux modules.

#### 4. Calculer les empreintes SHA-256

**Windows (PowerShell) :**
```powershell
Get-FileHash *.js -Algorithm SHA256 | Format-Table -AutoSize
```

**macOS/Linux :**
```bash
shasum -a 256 *.js
```

**En ligne :** [https://emn178.github.io/online-tools/sha256_checksum.html](https://emn178.github.io/online-tools/sha256_checksum.html)

#### 5. Comparer avec les empreintes publiées

Les checksums calculés doivent correspondre **exactement** à ceux listés ci-dessus. Toute différence indique une modification du code.

### Que faire si les checksums ne correspondent pas ?

1. **Vérifiez la version :** Assurez-vous de comparer le bon tag Git (meae-consulaire-4.14.17)
2. **Retéléchargez le fichier :** Le téléchargement a pu être corrompu
3. **Vérifiez le nom du fichier :** Assurez-vous de comparer le bon fichier

---

### Pour allez plus loins... (vérification par recompilation)

#### Prérequis

- Node.js v20.18.0 (version identique à celle du build Jenkins)
- npm
- Java 17+ et Maven 3.6.3+

#### 1. Cloner et installer

```bash
git clone https://github.com/Voxaly/meae-consulaires-2026-recette.git
cd meae-consulaires-2026-recette
npm ci
```

#### 2. Recompiler en production

```bash
# Linux/Mac
NODE_ENV=production npm run bundle:election

# Windows (cmd)
set NODE_ENV=production && npm run bundle:election

# Windows (PowerShell)
$env:NODE_ENV="production"; npm run bundle:election

```

#### 3. Vérifier les checksums

```bash
cd src/main/webapp/includes/dist/election/

# Linux/Mac
sha256sum *.js | sort

# Windows (PowerShell)
Get-ChildItem *.js | Get-FileHash -Algorithm SHA256 | Sort-Object Path
```

**Important :** Tous les checksums doivent correspondre exactement. Utilisez `npm ci` (pas `npm install`) pour garantir les versions exactes des dépendances.

---

## Garanties de reproductibilité

Ce projet garantit des builds reproductibles :

- ✅ **package-lock.json versionné** : Versions exactes des dépendances npm
- ✅ **Webpack déterministe** : Configuration avec `chunkIds: 'deterministic'` et `moduleIds: 'deterministic'`
- ✅ **Pas de timestamps** : Aucune date dans les bundles
- ✅ **NODE_ENV=production** : Mode de build cohérent (géré automatiquement par `bundle:election:public`)
- ✅ **Terser monothread** : `parallel: false` pour un minification déterministe
- ✅ **TCachr Babel désdctivé** : `cacheDirectory: false` pour évoter les artefacts de cache
- ✅ **Séparation des contextes** : Build électeur totalement isolé de l'administration

**Résultat :** Deux développeurs compilant le même commit avec les mêmes dépendances obtiennent des fichiers identiques (byte-par-byte) avec les mêmes checksums.

---

## Description des bundles

### app.bundle.js (~4.8 MB source, ~1.2 MB minifié)

Le bundle principal contenant l'application de vote.

**Contenu :**
- Application React complète (composants, interface utilisateur)
- Logique de vote (bulletin, confirmation, reçu)
- Gestion de l'authentification électeur
- Navigation et routage
- Bibliothèques React et dépendances tierces

⚠️ **C'est le fichier le plus important à vérifier** car il contient toute l'interface de vote.

### crypto.bundle.js (~90 KB)

Bibliothèque cryptographique pour le chiffrement des votes.

**Contenu :**
- Chiffrement homomorphe ElGamal sur courbes elliptiques edwards25519
- Génération et vérification des preuves de validité (zero-knowledge proofs)
- Protocoles de vérifiabilité individuelle (reçu électeur)
- Interface avec WebAssembly pour les opérations cryptographiques natives

⚠️ **C'est le deuxième fichier critique** car il garantit la sécurité et la vérifiabilité des votes.

### app.style.css (~3 KB)

Feuille de styles CSS de l'application électeur.

### Modules dynamiques (XXX.chunk.js)

Modules React chargés à la demande pour optimiser les performances initiales.

**Exemples courants :**
- `500.chunk.js` : Page d'erreur serveur
- `315.chunk.js`, `354.chunk.js` : Composants secondaires
- `418.chunk.js` : Bibliothèques conditionnelles

Les numéros sont générés de manière déterministe par Webpack en fonction du contenu des modules. Pour une même version du code, ils restent toujours identiques.

---

## Bibliothèque cryptographique

Le dossier `crypto/` contient les sources C de la bibliothèque edwards25519 utilisée par Crypto pour :
- Les opérations sur courbes elliptiques Curve25519
- Le chiffrement homomorphe ElGamal
- La génération de preuves zero-knowledge

**Compilation :** Voir `crypto/README.md`

---

## Pourquoi cette transparence ?

Cette publication permet à toute personne de vérifier que :

1. ✅ Le code exécuté lors du vote correspond au code source publié
2. ✅ Aucune modification n'a été ajoutée entre la compilation et le déploiement
3. ✅ Les algorithmes cryptographiques utilisent les spécifications attendues
4. ✅ L'interface électeur ne contient pas de code malveillant
5. ✅ Le code d'administration est totalement isolé du code électeur

Démarche de transparence du processus électoral numérique.

---

## Questions fréquentes

### Pourquoi ne vois-je que 3-4 fichiers dans le navigateur ?

C'est normal ! L'application utilise le chargement dynamique (code splitting) pour optimiser les performances.

Sur la page d'identification, seuls les fichiers essentiels sont chargés :
- `app.bundle.js` (application React)
- `crypto.bundle.js` (cryptographie)
- `app.style.css` (styles)

En naviguant vers le bulletin de vote et la confirmation, d'autres modules sont téléchargés automatiquement selon vos besoins.

### Dois-je vérifier tous les fichiers ?

Concentrez-vous sur les 2 fichiers critiques :
1. `app.bundle.js` - Interface de vote complète
2. `crypto.bundle.js` - Cryptographie

Ces deux fichiers représentent le cœur du système de vote.

Les modules complémentaires (chunks) sont secondaires et peuvent être vérifiés par des auditeurs techniques pour une validation complète.

### Comment voir tous les modules chargés ?

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet **"Network"** (Réseau)
3. Filtrez par "JS"
4. Parcourez l'application complète : identification → bulletin → confirmation
5. Tous les fichiers JavaScript téléchargés s'afficheront dans la liste

Vous pouvez ensuite les télécharger en cliquant dessus, puis clic droit → **"Save as..."**

---

## Licence

Voir le fichier `LICENCE.md`.

Copyright © 2026 Voxaly Docaposte

---

## Contact

**Pour les électeurs :**
- Questions sur la vérification : contact-vpi.fae-sfe-adf@diplomatie.gouv.fr

---

*Document généré automatiquement par Jenkins - Publication transparente du code source électeur*
