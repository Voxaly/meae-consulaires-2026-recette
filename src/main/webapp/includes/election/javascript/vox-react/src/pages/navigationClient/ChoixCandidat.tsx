/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useNavigationClientContext} from "../../hooks/useNavigationClient";
import {getText} from "../../utils/utils";
import React, {useEffect, useState} from "react";
import {Candidat} from "../../models/pages/navigationClient.model";
import {ButtonProps} from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import useDocumentTitle from "../../hooks/useDocumentTitle";

interface ChoixCandidatState {
    candidatsChoisis: number[];
    messageErreur: string | null;
    voteBlanc: boolean;
}

const ChoixCandidat = () => {
    const {
        voteStatus,
        updateVoteStatus,
        stepperState,
        updateStepper,
        parameters,
        textes
    } = useNavigationClientContext();

    useDocumentTitle(getText('choix-candidat.titre-onglet', textes, [stepperState.pos + 1, stepperState.steps.length]));

    const election = voteStatus.chosenElection;
    const listeChoisie = election?.listesCandidat[0];
    const afficherVoteBlanc = getText('choix-candidat.vote-blanc', textes) !== 'choix-candidat.vote-blanc'; // Si clé de properties vide, pas de vote blanc

    const [state, setState] = useState<ChoixCandidatState>({
        candidatsChoisis: voteStatus.chosenCandidates,
        voteBlanc: voteStatus.voteBlanc === true,
        messageErreur: '',
    });

    const handleClick = (chosenCandidate?: Candidat) => {
        if (chosenCandidate) {
            setState({
                ...state,
                candidatsChoisis: [chosenCandidate.ordre],
                voteBlanc: false,
            })
        } else {
            setState({
                ...state,
                candidatsChoisis: [],
                voteBlanc: true,
            })
        }
    }

    const onBack = () => updateStepper.back();

    const onSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (state.candidatsChoisis.length > 0 || state.voteBlanc) {
            updateVoteStatus.chooseCandidates(state.voteBlanc ? [] : state.candidatsChoisis);
            updateStepper.next();
        } else {
            setState(prevState => ({...prevState, messageErreur: getText('choix-candidat.erreur-anormale', textes)}));
        }
    };

    const submitBtn: ButtonProps = {
        type: 'submit',
        children: getText('choix-candidat.bouton.suivant', textes),
        onClick: (e) => onSubmit(e),
        disabled: state.candidatsChoisis.length == 0 && !state.voteBlanc,
    }

    useEffect(() => {
        setState({
            candidatsChoisis: voteStatus.chosenCandidates,
            voteBlanc: voteStatus.voteBlanc === true,
            messageErreur: '',
        });
    }, [listeChoisie?.candidats]);

    return (
        <>
            {state.messageErreur && (
                <div className="fr-alert fr-alert--warning fr-mb-3w">
                    <p className="fr-text--bold">{state.messageErreur}</p>
                </div>
            )}

            <p>{getText('choix-candidat.ordre-affichage', textes)}</p>

            <p className="fr-stepper__state">
                {getText('choix-candidat.nombre-candidats', textes, [listeChoisie?.candidats[0].candidats.length])}
            </p>

            <form id="choix_candidat_form" name="choix_candidat_form" className="navigation-electeur">
                <fieldset className="fr-fieldset fr-mt-3w" aria-labelledby="form-legend">
                    <legend id="form-legend" className="fr-fieldset__legend--regular fr-fieldset__legend fr-h5 fr-mb-0">
                        {getText('choix-candidat.titre', textes)}
                    </legend>

                    {/* Candidats */}
                    {listeChoisie?.candidats[0].candidats.map(candidat => (
                        <div key={candidat.nomPrenomSansAccent} className="fr-fieldset__element">
                            <div className="fr-radio-group fr-radio-rich" onClick={() => handleClick(candidat)}>
                                <input
                                    id={`candidat-ordre-${candidat.ordre}`}
                                    type="radio"
                                    name="choix-candidat-radio"
                                    checked={state.candidatsChoisis.includes(candidat.ordre)}
                                    onChange={() => {
                                    }} // Géré par le fichier .min.js du DSFR
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
                    ))}

                    {/* Vote blanc */}
                    {afficherVoteBlanc && (
                        <div className="fr-fieldset__element">
                            <div className="fr-radio-group fr-radio-rich" onClick={() => handleClick()}>
                                <input
                                    id={`vote-blanc`}
                                    type="radio"
                                    name="choix-candidat-radio"
                                    checked={state.voteBlanc}
                                    onChange={() => {
                                    }} // Géré par le fichier .min.js du DSFR
                                />
                                <label className="fr-label" htmlFor={`vote-blanc`}>
                                    {getText('choix-candidat.vote-blanc', textes)}
                                </label>
                            </div>
                        </div>
                    )}
                </fieldset>

                <ButtonsGroup
                    alignment="right"
                    inlineLayoutWhen="sm and up"
                    buttons={parameters.isMonoe ? [
                        submitBtn
                    ] : [
                        {
                            // Bouton "Retour" en multi-inscriptions seulement
                            type: 'button',
                            children: getText('choix-candidat.bouton.retour', textes),
                            priority: 'secondary',
                            onClick: onBack,
                        },
                        submitBtn
                    ]}
                />
            </form>

            {/* Formulaire de retour à la page précédente */}
            <form id="cancelForm"
                  name="cancelForm"
                  method="post"
                  action={`${parameters.contextPath}/pages/generic_vote.htm`}
                  hidden
                  aria-hidden
            >
                <input type="hidden" name="_target0" value="nothing"/>
                <input type="hidden" name="_page" value="1"/>
                <input type="hidden" name="idListe" value="-3"/>
                <input type="hidden" name="isChoixCandidats" value=""/>
            </form>
        </>
    );
};

export default ChoixCandidat;