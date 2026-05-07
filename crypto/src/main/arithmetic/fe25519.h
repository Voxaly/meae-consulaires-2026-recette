/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#ifndef FE25519H
#define FE25519H
#include <stdint.h>

typedef int32_t fe25519[10];

void ffe25519_set0(fe25519);
void ffe25519_set1(fe25519);
void ffe25519_set(fe25519 src,fe25519 dst);
void ffe25519_add(fe25519,fe25519,fe25519 res);
void ffe25519_add_int(fe25519, int32_t, fe25519 res);
void ffe25519_neg(fe25519, fe25519 res);
void ffe25519_sub(fe25519, fe25519, fe25519 res);
void ffe25519_dbl(fe25519, fe25519 res);
void ffe25519_reduce(fe25519);
void ffe25519_mul(fe25519, fe25519, fe25519 res);
void ffe25519_mul2(fe25519, fe25519, fe25519 res);
void ffe25519_sqr(fe25519, fe25519 res);
void ffe25519_sqr2(fe25519, fe25519 res);
void ffe25519_inv(fe25519, fe25519 res);
void ffe25519_pm5d8(fe25519 base, fe25519 res);
void ffe25519_from_bytes(uint8_t* src, fe25519 dst);
void ffe25519_to_bytes(fe25519 src, uint8_t* dst);
int ffe25519_is_zero(fe25519);
int ffe25519_is_odd(fe25519);

#endif