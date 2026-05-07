/**
 * Copyright 2025 Voxaly Docaposte
 */

/**
 * JS permettant la génération du fichier "crypto.bundle.js".
 * Ce fichier contient les librairies utilisées pour le chiffrement
 * Pour ajouter une nouvelle librairie :
 * - Ajouter la librairie au fichier "package.json" (sous "dependencies") => nécessite un build maven du projet web
 * - Ajouter "require(librairie)" dans ce fichier
 */

module.exports = [
    './src/main/webapp/includes/libs/crypto/extlib/es5-shim.js',
    './src/main/webapp/includes/libs/crypto/extlib/sha256.js',
    './src/main/webapp/includes/libs/crypto/extlib/jsbn.js',
    './src/main/webapp/includes/libs/crypto/lib/shims.js',
    './src/main/webapp/includes/libs/crypto/lib/utils.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/fp.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/point.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/operand.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/operandBignum.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/operandString.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/group-abstract.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/groupbigintmod.js',
    './src/main/webapp/includes/libs/crypto/lib/maths/groupEcc.js',
    './src/main/webapp/includes/libs/crypto/lib/crypto/proof.js',
    './src/main/webapp/includes/libs/crypto/lib/crypto/elGamalCipherer.js',
    './src/main/webapp/includes/libs/crypto/lib/crypto/cipherText.js',
    './src/main/webapp/includes/libs/crypto/lib/crypto/iProofGenerator.js',
    './src/main/webapp/includes/libs/crypto/lib/crypto/otherProofsGenerator.js',
    './src/main/webapp/includes/libs/crypto/lib/groupParameters.js',
    './src/main/webapp/includes/libs/crypto/lib/question.js',
    './src/main/webapp/includes/libs/crypto/lib/election.js',
    './src/main/webapp/includes/libs/crypto/lib/ballot.js',
    './src/main/webapp/includes/libs/crypto/encryption_api.js'
];