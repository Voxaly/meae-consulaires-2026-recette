/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#include "pbkdf2_hmac_sha256.h"

void rfc2898_F(const unsigned char* pwd, cuint p_len, uint8_t* salt, cuint s_len, cuint it, uint id, uint8_t* out){
    uint8_t o_hash[96], i_hash[96];
    for (int i=0;i<96;i++) {
        o_hash[i]=0;
        i_hash[i]=0;
    }
    if (p_len>64) crypto_hash_sha256(o_hash,pwd,p_len); // K = P si p_len<= block size , H(P) sinon
    else memcpy(o_hash,pwd,p_len);
    memcpy(i_hash,o_hash,64);
    for (int i=0;i<64;i++){
        o_hash[i]^=0x5c;
        i_hash[i]^=0x36;
    }
    uint8_t* tmp = (uint8_t*) malloc((68+s_len)*sizeof(uint8_t)); // HMAC(P,m) = H(K^opad||H(K^ipad||m))
    memcpy(tmp,i_hash,64);
    memcpy(tmp+64,salt,s_len);
    tmp[67+s_len] = id&255;id>>=8;
    tmp[66+s_len] = id&255;id>>=8;
    tmp[65+s_len] = id&255;id>>=8;
    tmp[64+s_len] = id&255;
    crypto_hash_sha256(o_hash+64,tmp,68+s_len);
    free(tmp);
    crypto_hash_sha256(out,o_hash,96); // U1 = HMAC(P, S|| i)
    memcpy(i_hash+64,out,32);
    for (int i=1;i<it;i++){ // F(P,S,c,i)=U1^...^Uc
        crypto_hash_sha256(o_hash+64,i_hash,96);
        crypto_hash_sha256(i_hash+64,o_hash,96); // Un+1=HMAC(P, Un)
        for (int j=0;j<32;j++){
            out[j]^=i_hash[j+64];
        }
    }
}

void pbkdf2_hmac_sha256(const unsigned char* pwd, cuint p_len, uint8_t* salt, cuint s_len, cuint it, cuint dk_len, uint8_t* out){
    cuint hlen = 32;
    cuint ell = (dk_len+hlen-1)/hlen;
    cuint r = dk_len-(ell-1)*hlen;
    uint8_t* buffer;
    if (r<hlen) buffer = (uint8_t*) malloc(ell*hlen*sizeof(uint8_t));
    else buffer = out;
    for (int i=1;i<=ell;i++) rfc2898_F(pwd,p_len,salt,s_len,it,i,buffer+(i-1)*hlen);
    if (r<hlen){
        memcpy(out,buffer,dk_len);
        free(buffer);
    }
}