/**
 * Copyright 2025 Voxaly Docaposte
 */

import {getText} from "../utils/utils";
import {Liste} from "../types/vote";
import {useNavigationClientContext} from "../hooks/useNavigationClient";
import {VoteStatus} from "../models/pages/navigationClient.model";

interface ConfirmationChoixCandidatProps {
    voteStatus: VoteStatus;
    listeChoisie: Liste;
}

const ConfirmationChoixCandidat = (props: ConfirmationChoixCandidatProps) => {
    const {voteStatus, listeChoisie} = props;
    const {textes, parameters} = useNavigationClientContext();

    const isElecteurFIN = parameters.electeurFIN;

    return (
        <fieldset className="fr-fieldset fr-mt-3w" aria-labelledby="form-legend">
            <legend id="form-legend" className="fr-fieldset__legend--regular fr-fieldset__legend fr-h5 fr-mb-0">
                {isElecteurFIN ? (
                    getText('confirmation-choix.titre.fin', textes)
                ):(
                    getText('confirmation-choix.titre', textes)
                )}
            </legend>

            {voteStatus.voteBlanc ? (
                <div className="fr-fieldset__element">
                    <div className="fr-radio-group fr-radio-rich">
                        <input
                            id="vote-blanc"
                            type="radio"
                            name="choix-candidat-radio"
                            checked
                            readOnly
                        />
                        <label className="fr-label" htmlFor={`vote-blanc`}>
                            {getText('choix-candidat.vote-blanc', textes)}
                        </label>
                    </div>
                </div>
            ) : (
                listeChoisie.candidats[0].candidats.map(candidat => (
                    voteStatus.chosenCandidates.includes(candidat.ordre) && (
                        <div key={candidat.nomPrenomSansAccent} className="fr-fieldset__element">
                            <div className="fr-radio-group fr-radio-rich">
                                <input
                                    id={`candidat-ordre-${candidat.ordre}`}
                                    type="radio"
                                    name="choix-candidat-radio"
                                    checked
                                    readOnly
                                />
                                <label className="fr-label" htmlFor={`candidat-ordre-${candidat.ordre}`}>
                                    {candidat.prenom} {candidat.nom}, {candidat.info5}
                                    <br/>
                                    <span className={"fr-hint-text"}>
                                        {getText('choix-candidat.remplacant', textes)}
                                        {' '}
                                        {candidat.info4 ?? ''}
                                        {' '}
                                        {candidat.info3 ?? ''}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )
                ))
            )}
        </fieldset>
    );
};

export default ConfirmationChoixCandidat;