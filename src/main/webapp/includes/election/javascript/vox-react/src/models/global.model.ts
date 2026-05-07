/**
 * Copyright 2025 Voxaly Docaposte
 */

export enum EtatScrutin {
    EN_COURS = 0,
    AVANT_VOTE = 1, // TODO: Redirection à faire selon l'état du scrutin
    VOTE_CLOS = 2,
    RESULTATS = 3,
    MAINTENANCE = 4,
}

export interface CommonData {
    etatScrutin: EtatScrutin;
    nomOperation: string;
    pageAidelien: string;
    delaiAffichagePopIn: number;
    delaiChoixPopIn: number;
    delaisSurcis: number;
    textes: Record<string, string>; // Contient les messages d'erreurs génériques
}

export interface AuthenticationStatus {
    authenticated: boolean;
}

export interface GlobalData {
    common: CommonData;
    footer: { textes: Record<string, string> };
    header: { textes: Record<string, string> };
}

export interface VoterData {
    electeur: any; // Électeur connecté ou null TODO: Voir si on peut définir le type
    election: any; // Élection en cours TODO: Voir si on peut définir le type
}

export interface ConfigProperties {
    // TODO: Récupérer les clés utilisées sur les pages React
}

export interface TokenCSRF {
    headerName: string;
    parameterName: string;
    token: string;
}

export interface UnknownObject {
    [x: string]: string;
}

export interface ReactJSCaptcha {
    getCaptchaId: () => string; // Current Captcha ID, which will be used for server-side validation purpose
    reloadImage: () => void;
    // Voir fichier src/reactjs-captcha.js dans le dossier node_modules pour plus de fonctions
}