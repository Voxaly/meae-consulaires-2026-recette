/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#include "signature.h"

int verify_schnorr_signature(uint8_t* signature,uint8_t* pkSign,char* context,const size_t context_len,char* message,const size_t len){
    const size_t total = context_len+len+96;
    ed25519pt pk, tmp, com;
    uint8_t digest[32], *to_hash = (uint8_t*) malloc(total*sizeof(uint8_t));
    ed25519_generator_to_bytes(to_hash);
    memcpy(to_hash+32,pkSign,32);
    memcpy(to_hash+96,context,context_len);
    memcpy(to_hash+(context_len+96),message,len);
    int ok = ed25519_from_bytes(pkSign,&pk);
    ed25519_exp_base(signature+32,&tmp);
    ed25519_exp(&pk,signature,&com);
    ed25519_mul(&tmp,&com,&com);
    ed25519_to_bytes(&com,to_hash+64);
    crypto_hash_sha256(digest,to_hash,total); digest[31]&=15;
    free(to_hash);
    for (int i=0;i<32;i++) ok &= digest[i] == signature[i];
    return ok;
}

void create_schnorr_signature(uint8_t* sk,ed25519pt* pk,uint8_t* pkBin,char* context,const size_t context_len,char* message,const size_t len,uint8_t* signature){
    const size_t total = context_len+len+96;
    ed25519pt com;
    uint8_t* to_hash = (uint8_t*) malloc(total*sizeof(uint8_t)), *alpha=signature+32;
    sc25519 t1, t2;
    ed25519_generator_to_bytes(to_hash); // g
    memcpy(to_hash+32,pkBin,32); // h
    memcpy(to_hash+96,context,context_len); // context
    memcpy(to_hash+(96+context_len),message,len); // message
    sc25519_rnd(alpha);
    ed25519_exp_base(alpha,&com);
    ed25519_to_bytes(&com,to_hash+64);
    crypto_hash_sha256(signature,to_hash,total); signature[31]&=15;
    free(to_hash);
    sc25519_from_bytes(sk,t1); sc25519_from_bytes(signature,t2);
    sc25519_mult(t1,t2,t2);
    sc25519_from_bytes(alpha,t1);
    sc25519_sub(t1,t2,t1);
    sc25519_to_bytes(t1,alpha);
}

void create_generalized_schnorr_signature(uint8_t* sk,ed25519pt* base,uint8_t* baseBin,ed25519pt* pk,uint8_t* pkBin,char* context,const size_t context_len,char* message,const size_t len,uint8_t* signature){
    const size_t total = context_len+len+96;
    ed25519pt com;
    uint8_t* to_hash = (uint8_t*) malloc(total*sizeof(uint8_t)), *alpha=signature+32;
    sc25519 t1, t2;
    memcpy(to_hash,baseBin,32); // g
    memcpy(to_hash+32,pkBin,32); // h
    memcpy(to_hash+96,context,context_len); // context
    memcpy(to_hash+(96+context_len),message,len); // message
    sc25519_rnd(alpha);
    ed25519_exp(base,alpha,&com);
    ed25519_to_bytes(&com,to_hash+64);
    crypto_hash_sha256(signature,to_hash,total); signature[31]&=15;
    free(to_hash);
    sc25519_from_bytes(sk,t1); sc25519_from_bytes(signature,t2);
    sc25519_mult(t1,t2,t2);
    sc25519_from_bytes(alpha,t1);
    sc25519_sub(t1,t2,t1);
    sc25519_to_bytes(t1,alpha);
}

int verify_generalized_schnorr_signature(uint8_t* signature,uint8_t* base,uint8_t* pkSign,char* context,const size_t context_len,char* message,const size_t len){
    const size_t total = context_len+len+96;
    ed25519pt g, pk, tmp, com;
    uint8_t digest[32], *to_hash = (uint8_t*) malloc(total*sizeof(uint8_t));
    memcpy(to_hash,base,32);
    memcpy(to_hash+32,pkSign,32);
    memcpy(to_hash+96,context,context_len);
    memcpy(to_hash+(context_len+96),message,len);
    int ok = ed25519_from_bytes(pkSign,&pk);
    ok = ok && ed25519_from_bytes(base,&g);
    ed25519_exp(&g,signature+32,&tmp);
    ed25519_exp(&pk,signature,&com);
    ed25519_mul(&tmp,&com,&com);
    ed25519_to_bytes(&com,to_hash+64);
    crypto_hash_sha256(digest,to_hash,total); digest[31]&=15;
    free(to_hash);
    for (int i=0;i<32;i++) ok &= digest[i] == signature[i];
    return ok;
}