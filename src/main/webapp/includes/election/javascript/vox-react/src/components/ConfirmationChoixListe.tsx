/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useMemo} from "react";
import {getText} from "../utils/utils";
import {Candidat} from "../types/vote";
import {useNavigationClientContext} from "../hooks/useNavigationClient";
import {VoteStatus} from "../models/pages/navigationClient.model";

interface ConfirmationChoixListeProps {
    voteStatus: VoteStatus;
}

const ConfirmationChoixListe = ({voteStatus}: ConfirmationChoixListeProps) => {
    const {textes, parameters} = useNavigationClientContext();
    const isElecteurFIN = parameters.electeurFIN;

    const getChosenCandidate: Candidat | undefined = useMemo(() => {
        const election = voteStatus.chosenElection;
        const candidats = election!.listesCandidat[0].candidats[0].candidats;
        return candidats.find(candidat => candidat.ordre === voteStatus.chosenLSRCONCandidate);
    }, [voteStatus.chosenLSRCONCandidate, voteStatus.chosenElection]);

    return (
        <fieldset className="fr-fieldset fr-mt-3w" aria-labelledby="form-legend"  style={{minWidth: 0, width : '100%' }}>
            <legend id="form-legend" className="fr-fieldset__legend--regular fr-fieldset__legend fr-h5 fr-mb-0">
                {isElecteurFIN ? (
                    getText('confirmation-choix.titre.fin', textes)
                ):(
                    getText('confirmation-choix.titre', textes)
                )}
            </legend>

            {getChosenCandidate ? (
                <div className="fr-fieldset__element">
                    <div className="fr-radio-group fr-radio-rich">
                        <input
                            id={`liste-ordre-${getChosenCandidate.ordre}`}
                            type="radio"
                            name="choix-liste-radio"
                            checked
                            readOnly
                        />
                        <label className="fr-label" htmlFor={`liste-ordre-${getChosenCandidate.ordre}`}>
                            <span className="fr-mb-1v">
                                <span className="fr-text--bold">{getChosenCandidate.nom}</span>,
                                {' '}
                                {getText('choix-liste.conduite-par', textes)}
                                {' '}
                                {getChosenCandidate.prenom}
                            </span>
                            <span className={"fr-hint-text"}>
                                {getChosenCandidate.info5 ?? ''}
                            </span>
                        </label>
                    </div>
                </div>
            ) : (
                <div className="fr-fieldset__element">
                    <div className="fr-radio-group fr-radio-rich">
                        <input
                            id="vote-blanc"
                            type="radio"
                            name="choix-liste-radio"
                            checked
                            readOnly
                        />
                        <label className="fr-label" htmlFor={`vote-blanc`}>
                            {getText('choix-liste.vote-blanc', textes)}
                        </label>
                    </div>
                </div>
            )}
        </fieldset>
    );
};

export default ConfirmationChoixListe;