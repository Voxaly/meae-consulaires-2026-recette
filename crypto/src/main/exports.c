/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#include<emscripten.h>
#include "vote/elgamal.h"
#include "crypto/signature.h"
#include "crypto/pbkdf2_hmac_sha256.h"
#define context_length 52

EMSCRIPTEN_KEEPALIVE
void base64_decode(char* src, const size_t bin_size, uint8_t* dst){
    const size_t b64_size = sodium_base64_ENCODED_LEN(bin_size, sodium_base64_VARIANT_URLSAFE_NO_PADDING);
    size_t bin_len = bin_size;
    sodium_base642bin(dst,bin_size,src,b64_size,NULL,&bin_len,NULL,sodium_base64_VARIANT_URLSAFE_NO_PADDING);
}

void set_context(char* pkB64, char* context,uint8_t* to_hash,ed25519pt* pk){
    base64_decode(context,context_length,to_hash);
    ed25519_generator_to_bytes(to_hash+context_length);
    base64_decode(pkB64,32,to_hash+(context_length+32));
    ed25519_from_bytes(to_hash+(context_length+32),pk);
}

EMSCRIPTEN_KEEPALIVE
char* hex_encode(uint8_t* src, const size_t len){
    const size_t hex_len = 2*len+1;
    char* hex = (char*) malloc(hex_len*sizeof(char));
    sodium_bin2hex(hex,hex_len,src,len);
    return hex;
}

EMSCRIPTEN_KEEPALIVE
char* base64_encode(uint8_t* src,const size_t len){
    const size_t b64_len = sodium_base64_ENCODED_LEN(len, sodium_base64_VARIANT_URLSAFE_NO_PADDING);
    char* b64 = (char*) malloc(b64_len*sizeof(char));
    sodium_bin2base64(b64,b64_len,src,len,sodium_base64_VARIANT_URLSAFE_NO_PADDING);
    return b64;
}

EMSCRIPTEN_KEEPALIVE
int check_sodium_init(){
    if (sodium_init()<0) return 0;
    return 1;
}

void computeSalt(char* oId,cuint oidLen,uint8_t* salt){
    cuint pLen = 14;
    const char* prefix = "VoximiusKDFSel";
    cuint h_len = pLen+oidLen;
    unsigned char* toHash = (unsigned char*) malloc(h_len*sizeof(char));
    uint8_t digest[32];
    memcpy(toHash,prefix,pLen);
    memcpy(toHash+pLen,oId,oidLen);
    crypto_hash_sha256(digest,toHash,h_len);
    free(toHash);
    for (uint i=0;i<8;i++){
        salt[i]=digest[i]^digest[i+8]^digest[i+16]^digest[i+24];
    }
}

void voximius_derive_ed25519_key(uint8_t* salt,const unsigned char* frag,cuint len,uint8_t* sk){
    uint8_t buffer[33];
    pbkdf2_hmac_sha256(frag,len,salt,9,16384,32,buffer);
    buffer[32] = 0;
    crypto_hash_sha256(sk,buffer,33);
    sk[31]&=31;
    while (sc25519_greater_than_q(sk)){
        buffer[32]++;
        crypto_hash_sha256(sk,buffer,33);
        sk[31]&=31;
    }
}
/**
 * dst : pk||id (64 bytes)
 * oId : salt seed utilisée pour déterminer le sel
 * type : 0 pour un réassort de mot de passe, 255 pour un réassort d'identifiant
 * frag : le fragment secret tappé par l'électeur (identifiant ou mot de passe)
 */
EMSCRIPTEN_KEEPALIVE
char* voximius_derive_id_rea(char* oId, cuint oidLen, uint8_t type,
                            const unsigned char* frag, cuint len,
                            uint8_t* dst){
    uint8_t toHash[41];
    uint8_t* salt = toHash+32;
    ed25519pt pk;
    computeSalt(oId,oidLen,salt);salt[8]=type;
    voximius_derive_ed25519_key(salt,frag,len,toHash);
    ed25519_exp_base(toHash,&pk);
    ed25519_to_bytes(&pk,dst);
    crypto_hash_sha256(dst+32,toHash,40);
    return base64_encode(dst,64);
}

/**
 * oId : salt seed utilisée pour déterminer le sel
 * dst : pk||ida||idb (96 bytes)
 */
EMSCRIPTEN_KEEPALIVE
char* voximius_derive_ids(char* oId, cuint oidLen,
                        const unsigned char* idt, cuint i_len,
                        const unsigned char* pwd, cuint p_len,
                        uint8_t* sk,ed25519pt* pk){
    uint8_t toHash[41], dst[96];
    uint8_t* salt = toHash+32;
    computeSalt(oId,oidLen,salt);salt[8]=0;
    voximius_derive_ed25519_key(salt,idt,i_len,toHash);
    memcpy(sk,toHash,32);
    crypto_hash_sha256(dst+64,toHash,40);
    salt[8]=255;
    voximius_derive_ed25519_key(salt,pwd,p_len,toHash);
    crypto_hash_sha256(dst+32,toHash,40);
    sc25519 sa, sb;
    sc25519_from_bytes(sk,sa); sc25519_from_bytes(toHash,sb);
    sc25519_add(sa,sb,sa); sc25519_to_bytes(sa,sk);
    ed25519_exp_base(sk,pk);
    ed25519_to_bytes(pk,dst);
    return base64_encode(dst,96);
}

/**
 * src : contexte envoyé par le serveur (52 octets encodé en base 64 : elid, pastille, ddv, pkr)
 * sk : la clef secrète de signature
 * calcule la clef publique anonymisée pk et remplit le contexte dans dst (elid, pastille, ddv, pkanon)
 * remplit baseBin et pkR, lu depuis src
 * return : le numéros de la pastille (0 = invalide)
 */
EMSCRIPTEN_KEEPALIVE
int voximius_read_context(char* src,uint8_t* sk,ed25519pt* base,uint8_t*baseBin,ed25519pt* pk,uint8_t* dst){
    uint8_t buffer[context_length];
    base64_decode(src, context_length, buffer);
    int ok = ed25519_from_bytes(buffer+20, base);
    if (ok && ed25519_is_generator(base)){
        ed25519_exp(base, sk, pk);
        memcpy(dst,buffer,20);
        memcpy(baseBin,buffer+20,32);
        ed25519_to_bytes(pk,dst+20);
        return dst[8]|(dst[9]<<8)|(dst[10]<<16)|(dst[11]<<24);
    } else return 0;
}

/**
 * sk : la clef secrète de signature
 * calcule la clef publique anonymisée pk et remplit le contexte dans dst (ddv+pastille+pk)
 * remplit baseBin et pkR, lu depuis src
 * return : le numéros de la pastille (0 = invalide)
 */
EMSCRIPTEN_KEEPALIVE
char* voximius_sign_ballot(uint8_t* sk,ed25519pt* base,uint8_t* baseBin,ed25519pt* pk,uint8_t* pkBin,char* ballot,const size_t len){
    uint8_t sig[64];
    create_generalized_schnorr_signature(sk,base,baseBin,pk,pkBin,"VoximiusSignatureBulletin",25,ballot,len,sig);
    return base64_encode(sig,64);
}

EMSCRIPTEN_KEEPALIVE
char* concatenate_hex_b64(char* hex, const size_t hex_len, char* b64, const size_t b64_bin_len){
    const size_t hex_bin_len = hex_len/2;
    const size_t total_len = hex_bin_len+b64_bin_len;
    size_t ptr = hex_bin_len;
    uint8_t* bin = (uint8_t*) malloc(total_len*sizeof(uint8_t));
    sodium_hex2bin(bin,hex_bin_len,hex,hex_len,NULL,&ptr,NULL);
    base64_decode(b64, b64_bin_len, bin+hex_bin_len);
    char* res = base64_encode(bin,total_len);
    free(bin);
    return res;
}

EMSCRIPTEN_KEEPALIVE
char* elgamal_public_key(uint8_t* sk, ed25519pt* pk){
    uint8_t encoding[32];
    elgamal_keygen(sk,pk);
    ed25519_to_bytes(pk,encoding);
    return base64_encode(encoding,32);
}