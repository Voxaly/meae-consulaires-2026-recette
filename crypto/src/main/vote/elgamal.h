/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#ifndef ELGAMALH
#define ELGAMALH
#include "../arithmetic/sc25519.h"
#include "../arithmetic/edwards25519.h"
void elgamal_keygen(uint8_t* sk,ed25519pt* pk);
#endif