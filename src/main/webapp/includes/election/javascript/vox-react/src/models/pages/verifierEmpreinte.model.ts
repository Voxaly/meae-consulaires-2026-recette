/**
 * Copyright 2025 Voxaly Docaposte
 */

export interface VerifierEmpreinteData {
    textes: Record<string, string>;
    isDepouillement: string;
    empreinte?: string;
}

export interface VerifierEmpreinteForm {
    empreinte: string;
    captchaId: string;
    captchaDefi: string;
}

export interface VerifierEmpreinteResult {
    empreinteValide: boolean;
    chiffrementSuffrage?: string;
    erreurCode?: string;
}