/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#include "elgamal.h"
void elgamal_keygen(uint8_t* sk, ed25519pt* pk){
    sc25519_rnd(sk);
    ed25519_exp_base(sk,pk);
}