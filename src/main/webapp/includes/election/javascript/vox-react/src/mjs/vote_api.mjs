import createVotingModule from './voxaled.mjs';

export const voxaled = await createVotingModule();
export const ballotSignatureKey = 'ballotSignatureKey';

function stringToPtr(str){
    const len = voxaled.lengthBytesUTF8(str)+1;
    const ptr = voxaled._malloc(len);
    voxaled.stringToUTF8(str,ptr,len);
    return ptr;
}

export function isLibsodiumInit(){
    return voxaled._check_sodium_init() === 1;
}

/**
 * @param cachet le cachet serveur, encodé en base 64
 * @returns {*|string} l'empreinte du bulletin extraite du cachet, encodée en hexadécimal
 */
export function extractHashFromStamp(cachet){
    const stampPtr = stringToPtr(cachet);
    const ptrBin = voxaled._malloc(96);
    voxaled._base64_decode(stampPtr,96,ptrBin);
    voxaled._free(stampPtr);
    const ptrHex = voxaled._hex_encode(ptrBin,32);
    voxaled._free(ptrBin);
    const hex = voxaled.UTF8ToString(ptrHex);
    voxaled._free(ptrHex);
    return hex;
}

/**
 * Calcule un token sous forme de string à envoyer au serveur pour authentifier la demande de réassort.
 * @param {*} oId valeur de la variable voximiusKDFSel, envoyée par le serveur (string)
 * @param {*} frag le mot de passe pour un réassort d'identifiant, l'identifiant pour un réassort de mot de passe
 * @param {*} type 0 pour un réassort de mot de passe, 255 pour un réassort d'identifiant
 * @returns 
 */
export function voximiusCreateRenewToken(oId,frag,type){
    const binToken = voxaled._malloc(64);
    const ptrOid = stringToPtr(oId);
    const ptrFrag= stringToPtr(frag);
    const b64Token = voxaled._voximius_derive_id_rea(ptrOid,oId.length,type,ptrFrag,frag.length,binToken);
    const token = voxaled.UTF8ToString(b64Token);
    voxaled._free(binToken);
    voxaled._free(ptrOid);
    voxaled._free(ptrFrag);
    voxaled._free(b64Token);
    return token;
}

const edSize = 160;
const contextLength = 52;

/**
 * Objet à état persistant offrant une interface pour les actions du navigateur dans le
 * protocole voximius
 */
export class VoximiusElectorModule{
    /**
     * 0 - Instantiation de l'objet
     */
    constructor(){
        isLibsodiumInit();
    }

    /**
     * 1 - Effectue la dérivation de secret à partir des inputs pour calculer le token à envoyer dans la requête d'authentification
     * La clef secrète de signature this.skB64 est construite (ou remplacée) par effet de bord
     * @param {*} idt l'identifiant entré par l'utilisateur
     * @param {*} pwd le mot de passe entré par l'utilisateur
     * @param {*} oId un string envoyé par le serveur (la variable voximiusKDFSel)
     * @returns un string contenant les identifiants d'authentification à envoyer au serveur (pk||ida||idb)
     */
    deriveIds(idt, pwd, oId){
        const sk = voxaled._malloc(32);
        const pk = voxaled._malloc(edSize);
        const ptrOid = stringToPtr(oId);
        const ptrIdt = stringToPtr(idt);
        const ptrPwd = stringToPtr(pwd);
        const b64Token = voxaled._voximius_derive_ids(ptrOid, oId.length,
                ptrIdt, idt.length, ptrPwd, pwd.length, sk,pk);
        voxaled._free(pk);
        voxaled._free(ptrOid);
        voxaled._free(ptrIdt);
        voxaled._free(ptrPwd);
        const identifiants = voxaled.UTF8ToString(b64Token);
        voxaled._free(b64Token);
        const b64Secret = voxaled._base64_encode(sk,32);
        sessionStorage.setItem(ballotSignatureKey, voxaled.UTF8ToString(b64Secret));
        voxaled._free(b64Secret);
        return identifiants;
    }

    /**
     * Génère une paire de clefs (sk,pk), stocke sk en session (en base 64) et renvoie pk (en base 64)
     * @returns la clef publique pk, encodée en base 64
     */
    generateAndStoreSk(){
        const sk = voxaled._malloc(32);
        const pk = voxaled._malloc(edSize);
        const b64Public = voxaled._elgamal_public_key(sk,pk);
        const b64Secret = voxaled._base64_encode(sk,32);
        voxaled._free(sk);
        voxaled._free(pk);
        sessionStorage.setItem(ballotSignatureKey, voxaled.UTF8ToString(b64Secret));
        voxaled._free(b64Secret);
        const publicKey = voxaled.UTF8ToString(b64Public);
        voxaled._free(b64Public);
        return publicKey;
    }

    /**
     * 2 - recouvre la valeur de la clef de signature et la stocke dans this.sk
     * @param {*} skB64 la valeur de this.skB64 après le dernier appel réussi de deriveIds
     */
    recoverSk(skB64){
        const ptr = stringToPtr(skB64);
        this.sk = voxaled._malloc(32);
        voxaled._base64_decode(ptr, 32, this.sk);
        voxaled._free(ptr);
    }

    /**
     * 3 - Lit le contexte envoyé par le serveur et renvoie le numéros de la pastille.
     * Si le contexte est incohérent ou invalide, renvoie 0
     * @param {*} contextPkr une chaîne de caractères envoyée par le serveur
     * @returns un entier lec, correspondant aux informations de pasillage lues dans le contexte (0 = INVALIDE !)
     */
    setContext(contextPkr){
        const ptr = stringToPtr(contextPkr);
        this.base = voxaled._malloc(edSize);
        this.baseBin = voxaled._malloc(32);
        this.pk = voxaled._malloc(edSize);
        this.context = voxaled._malloc(contextLength);
        const lec = voxaled._voximius_read_context(ptr,this.sk,this.base,this.baseBin,this.pk,this.context);
        voxaled._free(ptr);
        return lec;
    }

       /**
     * Signe un bulletin avec la signature de schnorr généralisée
     * @returns la signature, encodée en base 64
     */
       signBallot(ballot){
        const ptr = stringToPtr(ballot);
        const sig64 = voxaled._voximius_sign_ballot(this.sk,this.base,this.baseBin,this.pk,this.context+20,ptr,ballot.length);
        voxaled._free(ptr);
        const signature = voxaled.UTF8ToString(sig64);
        voxaled._free(sig64);
        return signature;
    }

    clear(){
        voxaled._free(this.sk);
        voxaled._free(this.base);
        voxaled._free(this.baseBin);
        voxaled._free(this.pk);
        voxaled._free(this.context);
    }
}