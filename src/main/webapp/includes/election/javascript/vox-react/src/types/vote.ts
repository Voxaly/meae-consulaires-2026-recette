/**
 * Copyright 2025 Voxaly Docaposte
 */

export interface Candidat {
    nomPrenomSansAccent: string;
    ordre: number;
    nom: string;
    prenom: string;
    sexe: number;
    nomPrenom: string;
    professionFoi: null; // ?
    choisiCandidatTemoin?: boolean;
    info1: null; // ?
    info2: string; // circonscription ?
    info3: string | null; // nom suppléant
    info4: string | null; // prénom suppléant
    info5: string; // slogan
}

export interface Liste {
    candidats: Record<string, {
        candidats: Candidat[];
    }>;
    isCommune: boolean;
    ordre: number;
    affiliation: null; // ?
    logo: null; // ?
    choisiListeTemoin?: boolean;
    isScrutinNom: boolean;
    nom: string;
    professionFoi: null; // ?
    // TODO: when list vote is implemented, remove these fields and store info in state
    choisieComplete?: boolean;
    choisieRature?: boolean;
}

export interface ElectionSettings {
    nbChoixCandidatMax: number;
    nbSiegePourvoir: number;
    ordre: number;
    listesCandidat: Liste[];
    id: number;
    typeEN: {
        typeIhm: string; // NOM or LSR
        lib: string;
        nom: string;
    }
    nom: string;
}

export interface Parameters {
    ballotContextWithAnonymisationKey: string;
    isMonoe: boolean;
    contextPathAngular: string;
    afficheCalendar: boolean;
    zoomEnabled: boolean;
    errorView: string;
    afficherCandidatsEnabled: boolean;
    photosEnabled: boolean;
    isReferendum: boolean;
    afficheElectionRestante: boolean;
    idTour: number;
    electeurEtOrdre: number;
    signatureEnabled: boolean;
    baseUrl: string;
    raturesPossible: boolean;
    activerFormatDateAutomatique: boolean;
    photosPrefix: string;
    maxCandidatsPerPage: number;
    candidatsGroupByInfo5Enabled: boolean;
    blancSiZeroSelection: boolean;
    afficherEmpreinteSuffrage: boolean;
    isElectionDdvEnabled: boolean;
    ddvElecteur: string;
    ddvElecteurFormatted: string;
    urlLogo?: string;
    urlProfessionFoi?: string;
    pageAidelien?: string;
    electeurEmail: string;
    isElecteurFIN: boolean;
    overtime: number;
}

export interface GlobalVoteData {
    textes: Record<string, string>;
    param: Parameters;
    nomOperation: string;
    election: ElectionSettings;
    jsConfigCryptoJSON: string;
    electionT: ElectionSettings;
    jsConfigCryptoTemoinJSON: string;
}
