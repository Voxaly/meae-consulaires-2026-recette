/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#ifndef SIGNATUREH
#define SIGNATUREH
#include "../arithmetic/edwards25519.h"
#include "../arithmetic/fe25519.h"
#include "../arithmetic/sc25519.h"
#include <string.h>
int verify_schnorr_signature(uint8_t* signature,uint8_t* pkSign,char* context,const size_t context_len,char* message,const size_t message_len);
void create_schnorr_signature(uint8_t* sk,ed25519pt* pk,uint8_t* pkBin,char* context,const size_t context_len,char* message,const size_t len,uint8_t* signature);
int verify_generalized_schnorr_signature(uint8_t* signature,uint8_t* base,uint8_t* pkSign,char* context,const size_t context_len,char* message,const size_t len);
void create_generalized_schnorr_signature(uint8_t* sk,ed25519pt* base,uint8_t* baseBin,ed25519pt* pk,uint8_t* pkBin,char* context,const size_t context_len,char* message,const size_t len,uint8_t* signature);
#endif