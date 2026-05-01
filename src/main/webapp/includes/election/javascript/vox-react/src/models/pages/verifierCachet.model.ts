/**
 * Copyright 2025 Voxaly Docaposte
 */

export interface VerifierCachetData {
    textes: Record<string, string>;
    cachetServeur?: string;
}

export interface VerifierCachetForm {
    cachetElectronique: string;
    captchaId: string;
    captchaDefi: string;
}

export interface VerifierCachetResult {
    signatureValid: boolean;
    bulletinTrouve: boolean;
    empreinteSHA256?: string;
    exceptionMessage?: string;
    erreurCode?: string;
}