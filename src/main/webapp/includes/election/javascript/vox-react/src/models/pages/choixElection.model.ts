/**
 * Copyright 2025 Voxaly Docaposte
 */

export interface ChoixElectionData {
    aucuneInscription: boolean;
    suiviElections: ElectionCard[];
    suiviElectionDateFormat: string;
    dateDebut: string; // Début du tour en cours
    dateFin: string; // Fin du tour en cours
    tempsRestant: string; // Avant la fin du tour en cours
    textes: Record<string, string>;
    aVote: boolean; // True si l'électeur a voté à toutes ses élections
}

export interface ElectionCard {
    idElection: number;
    nomElection: string;
    libelleSuspension: string | null;
    dateSuspension: string | null;
    nbCandidats: number;
    dateEmargement: number | null;
}
