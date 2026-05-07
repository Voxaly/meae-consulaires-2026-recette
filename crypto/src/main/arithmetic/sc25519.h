/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#ifndef SCALAR25519H
#define SCALAR25519H
#include <stdint.h>
#include <sodium.h>
typedef int32_t sc25519[14];
typedef unsigned int uint;
typedef const unsigned int cuint;

void sc25519_set0(sc25519);
void sc25519_set(sc25519 val,sc25519 dst);
void sc25519_cset(const int b,sc25519 v, sc25519 e);
int sc25519_is_zero(sc25519);
void sc25519_rnd(uint8_t*);
void sc25519_from_bytes(uint8_t* src, sc25519 dst);
void sc25519_to_bytes(sc25519 src, uint8_t* dst);
int sc25519_greater_than_q(uint8_t* src);
void sc25519_add_int(sc25519,int,sc25519 res);
void sc25519_add(sc25519, sc25519, sc25519 res);
void sc25519_sub(sc25519, sc25519, sc25519 res);
void sc25519_mult(sc25519, sc25519, sc25519 res);
void sc25519_red(sc25519);
#endif