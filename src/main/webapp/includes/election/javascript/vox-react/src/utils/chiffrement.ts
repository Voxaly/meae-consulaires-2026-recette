/**
 * Copyright 2025 Voxaly Docaposte
 */

import {Liste} from "../types/vote";
import {Engine} from "../models/crypto.model";

export interface Ballot {
    ballot: string;
    secret: string;
    hash: string;
}

export const chiffrementTemoin = (engine: Engine, temoin: any): Promise<Ballot> => {
    return new Promise((resolve, reject) => {
        try {
            engine.setVote([temoin]);
        } catch (error) {
            return reject('Ballot creation: Refused vote vector: ' + error);
        }

        let count = 0;

        function checkIfFinished() {
            if (engine.isFinished()) {
                const ballot = engine.getBallot('');
                return resolve(ballot);
            } else {
                count += 1;
                if (count > 60) {
                    return reject('Ballot creation: Timeout');
                }
            }
            window.setTimeout(checkIfFinished, 500);
        }

        window.setTimeout(checkIfFinished, 100);
    });
}

export function createBallot(
    liste: Liste,
    chosenCandidates: number [],
    chosenLSRCONCandidate: number | undefined,
    isVoteBlanc: boolean | null,
    isTemoin: boolean,
    ihm: string,
    engine: Engine,
): Promise<Ballot> {
    return new Promise((resolve, reject) => {
        const choices = buildCryptoVoteVector(liste, chosenCandidates, chosenLSRCONCandidate, isVoteBlanc, isTemoin, ihm);

        try {
            engine.setVote([choices]);
        } catch (error) {
            return reject('Ballot creation: Refused vote vector: ' + error);
        }

        let count = 0;

        function checkIfFinished() {
            if (engine.isFinished()) {
                const ballot = engine.getBallot('');
                return resolve(ballot);
            } else {
                count += 1;
                if (count > 60) {
                    return reject('Ballot creation: Timeout');
                }
            }
            window.setTimeout(checkIfFinished, 500);
        }

        window.setTimeout(checkIfFinished, 100);
    });
}

/** Construction du bulletin en clair */
function buildCryptoVoteVector(
    liste: Liste,
    chosenCandidates: number [],
    chosenLSRCONCandidate: number | undefined,
    isVoteBlanc: boolean | null,
    isTemoin: boolean,
    ihm: string
): number[] {
    const choices: number[] = [];

    // Prise en compte du vote blanc
    // NB ! pour le bulletin témoin, il n'y a pas de vote blanc possible
    choices.push(isTemoin ? 0 : isVoteBlanc ? 1 : 0);

    // LAR : Choix de la liste et dans le cas le plus 'fin', on a aussi le choix des candidats
    // LSR : Choix de la liste, mais aucune interaction avec les candidats
    // NOM/LSRCON : Pas de notion de liste, on arrive directement sur la page des candidats.
    //              Chaque élection n'a qu'une seule liste.
    for (let listeId in liste.candidats) {
        switch (ihm) {
            case 'NOM':
                if (isTemoin) {
                    liste.candidats[listeId].candidats.forEach(candidate => {
                        choices.push(candidate.choisiCandidatTemoin ? 1 : 0);
                    });
                } else {
                    liste.candidats[listeId].candidats.forEach(candidate => {
                        choices.push(chosenCandidates.includes(candidate.ordre) ? 1 : 0);
                    });
                }
                break;

            case 'LSRCON':
                if (isTemoin) {
                    liste.candidats[listeId].candidats.forEach(candidate => {
                        choices.push(candidate.choisiCandidatTemoin ? 1 : 0);
                    });
                } else {
                    liste.candidats[listeId].candidats.forEach(candidate => {
                        choices.push(candidate.ordre === chosenLSRCONCandidate ? 1 : 0);
                    });
                }
                break;

            // case 'LAR':
            // case 'LSR':
            //     if ($scope.$parent.listeChoisie.ordre === listes[listeId].ordre) {
            //         choices[idxChoice++] = 1;
            //     } else {
            //         choices[idxChoice++] = 0;
            //     }

            default:
                alert(`Le vote avec ihm='${ihm}' n'est pas supporté`);
        }
    }
    return choices;
}