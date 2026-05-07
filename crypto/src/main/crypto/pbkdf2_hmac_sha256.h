/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#ifndef PBKDFHMACSHA256H
#define PBKDFHMACSHA256H

#include <sodium.h>
#include <string.h>
#include "../arithmetic/sc25519.h"

void pbkdf2_hmac_sha256(const unsigned char* pwd, cuint p_len, uint8_t* salt, cuint s_len, cuint it, cuint dk_len, uint8_t* out);

#endif