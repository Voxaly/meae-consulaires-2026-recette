Ce répertoire contient du code source du client de vote relatif à l'authentification.
Les instructions de compilation ont été testées sur une distribution Ubuntu 22.04.5 Jammy Jellyfish.

# Dépendances :

Sur une machine virtuelle, installez git, gcc, make et cmake.
Assurez-vous que Python3 est bien installé.

Installez ensuite [libsodium](https://doc.libsodium.org) et [emscripten](https://emscripten.org/) en
suivant les instructions fournies sur leurs sites respectifs (n'utilisez pas apt).
La version de libsodium que nous avons utilisée date du 26 septembre 2024.

# Compilation :

Dans un répertoire vide, téléchargez et décompressez libsodium puis placez-vous dans le
sous-répertoire LATEST/libsodium-stable. Utilisez les commandes d'emscripten pour recompiler la bibliothèque (n'utilisez pas make check ou make install).

```
emconfigure ./configure
emmake make
```

Localisez le fichier libsodium.a (probablement dans ./src/libsodium/.libs/) et copiez-le à la racine de ce répertoire (où se situent le Makefile et le README).

Pour compiler le code C en webassembly, utilisez la commande _make_.