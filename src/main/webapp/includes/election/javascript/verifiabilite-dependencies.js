/**
 * Copyright 2025 Voxaly Docaposte
 */

/**
 * JS permettant la génération du fichier "verifiabilite.bundle.js".
 * Ce fichier ne contient que les librairies utilisées sur toutes les pages lièes à la vérifiabilité
 * Pour ajouter une nouvelle librairie:
 * - Ajouter la librairie au fichier "package.json" (sous "dependencies") => nécessite un build maven du projet web
 * - Ajouter "require(librairie)" dans ce fichier
 */

module.exports = [
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/jsbn.js',
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/jsbn2.js',
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/rng.js',
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/sec.js',
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/sha.js',
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/ec.js',
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/dlcrypto.js',
    './src/main/webapp/includes/libs/elliptic-curve-cryptography/choixcompress.js'
];