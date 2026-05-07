/**
 * Copyright 2025 Voxaly Docaposte
 */

export const PREFIX_API = "/pages/api";

export enum APIInstances {
    CSRF = "/security/csrf",
    GLOBAL = "/global/data",
    SESSION = "/auth/status",
    IDENTIFICATION = "/identification",
    SELECTION_LEC = "/selection-lec",
    CHOIX_ELECTION = "/choix-election",
    NAVIGATION_CLIENT = "/navigation-client",
    RECEPISSE = "/accuse-reception",
    ACCESSIBILITE = "/accessibilite",
    DONNEES_PERSONNELLES = "/donnees-personnelles",
    MENTIONS_LEGALES = "/mentions-legales",
    VERIFIER_EMPREINTE = "/verifier-empreinte",
    VERIFIER_CACHET = "/verifier-cachet",
}