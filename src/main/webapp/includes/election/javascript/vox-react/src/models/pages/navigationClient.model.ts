/**
 * Copyright 2025 Voxaly Docaposte
 */

export interface NavigationClientData {
    election: Election;
    data: {
        election: ElectionSettings;
        jsConfigCryptoJSON: string;
    };
    parameters: Parameters;
    textes: Record<string, string>;
}

export interface Election {
    id: number;
    nom: string;
    libelleSuspension: string | null;
    dateSuspension: string | null;
}

export interface ElectionSettings {
    nbChoixCandidatMax: number;
    nbSiegePourvoir: number;
    ordre: number;
    listesCandidat: Liste[];
    id: number;
    typeEN: {
        typeIhm: string; // NOM ou LSR
        lib: string;
        nom: string;
    }
    nom: string;
}

export interface Parameters {
    idTour: number;
    electeurEtOrdre: number;
    ballotContextWithAnonymisationKey: string;
    raturesPossible: boolean | null;
    ddvElecteur: string;
    ddvElecteurFormatted: string;
    isMonoe: boolean | null;
    contextPath: string;
    isReferendum: boolean | null;
    electeurEmail: string;
    overtime: number;
    electeurFIN: boolean;
}

export interface VoteStatus {
    chosenElection: ElectionSettings | undefined;
    chosenCandidates: number[]; // Scrutin de nom (législatives)
    chosenLSRCONCandidate: number | undefined; // Scrutin LSRCON (consulaires)
    chosenList: number | undefined; // Scrutin de liste
    voteBlanc: boolean | null;
}

export interface UpdateVoteStatus {
    chooseCandidates: (candidates: VoteStatus['chosenCandidates']) => void,
    chooseLSRCONCandidate: (candidate: VoteStatus['chosenLSRCONCandidate']) => void,
    chooseList: (listId: VoteStatus['chosenList']) => void,
}

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
    choisieComplete?: boolean;
    choisieRature?: boolean;
}

export interface NavigationClientContext {
    jsConfigCryptoJSON: string;
    voteStatus: VoteStatus;
    updateVoteStatus: UpdateVoteStatus;
    stepperState: StepperState;
    updateStepper: UpdateStepper;
    parameters: Parameters;
    textes: Record<string, string>;
}


// STEPPER

export interface Step {
    text: string;
    path: string;
}

export interface StepperState {
    steps: Step[];
    pos: number;
}

export interface UpdateStepper {
    back: () => void,
    next: () => void,
    go: (step: number) => void;
}


// CONFIRMATION VOTE

export interface CheckCodeActivationForm {
    bulletin: string;
    hashBulletin: string;
}

export interface CheckCodeActivationBlockedResponse {
    blocked: true;
    redirect: string;
    error: string;
    errorArgs: string[];
}

export type CheckCodeActivationResponse = "OK" | "KO" | CheckCodeActivationBlockedResponse;

export interface SubmitVoteForm {
    bulletin: string;
    cryptoLibrary: string;
    clientInfos: string;
    idElection: number;
    hashBulletin: string;
    voteSignature: string;
}