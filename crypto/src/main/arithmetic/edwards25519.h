/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#ifndef EDWARDS25519H
#define EDWARDS25519H
#include "fe25519.h"
#include <sodium.h>

typedef struct ed25519pt{
    fe25519 x, y, z, t;
} ed25519pt;

void ed25519_set_neutral(ed25519pt*);
void ed25519_generator_to_bytes(uint8_t* dst);
void ed25519_set_random(ed25519pt*);

int ed25519_from_bytes(uint8_t* src, ed25519pt* dst);
void ed25519_to_bytes(ed25519pt* src, uint8_t* dst);
void ed25519_set(ed25519pt* src, ed25519pt* dst);

void ed25519_mul(ed25519pt*, ed25519pt*, ed25519pt* res);
void ed25519_sqr(ed25519pt*, ed25519pt* res);
void ed25519_div(ed25519pt*, ed25519pt*, ed25519pt* res);
void ed25519_inv(ed25519pt*, ed25519pt* res);

int ed25519_eq(ed25519pt*, ed25519pt*);
int ed25519_is_neutral(ed25519pt*);
int ed25519_is_generator(ed25519pt*);
int ed25519_test_membership(ed25519pt*);

void ed25519_exp(ed25519pt* base, uint8_t*, ed25519pt* res);
void ed25519_exp_base(uint8_t*, ed25519pt* res);

typedef struct ge25519_cached{
    fe25519 x, y, t;
} ge25519_cached;

#endif