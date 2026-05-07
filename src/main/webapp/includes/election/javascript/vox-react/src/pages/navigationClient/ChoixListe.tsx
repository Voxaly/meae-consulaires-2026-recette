/**
 * Copyright 2025 Voxaly Docaposte
 */

import React, {useEffect, useState} from "react";
import {useNavigationClientContext} from "../../hooks/useNavigationClient";
import {Candidat} from "../../types/vote";
import {getText} from "../../utils/utils";
import {ButtonProps} from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import useDocumentTitle from "../../hooks/useDocumentTitle";

interface ChoixListeState {
    candidatChoisi: number | undefined;
    messageErreur: string | null;
    voteBlanc: boolean;
}

const ChoixListe = () => {
    const {
        voteStatus,
        updateVoteStatus,
        stepperState,
        updateStepper,
        parameters,
        textes
    } = useNavigationClientContext();

    useDocumentTitle(getText('choix-liste.titre-onglet', textes, [stepperState.pos + 1, stepperState.steps.length]));

    const election = voteStatus.chosenElection;
    const listeChoisie = election?.listesCandidat[0];
    const afficherVoteBlanc = getText('choix-liste.vote-blanc', textes) !== 'choix-liste.vote-blanc'; // Si clé de properties vide, pas de vote blanc

    const [state, setState] = useState<ChoixListeState>({
        candidatChoisi: voteStatus.chosenLSRCONCandidate,
        voteBlanc: voteStatus.voteBlanc === true,
        messageErreur: "",
    });

    const handleClick = (candidat?: Candidat) => {
        if (candidat) {
            setState({
                ...state,
                candidatChoisi: candidat.ordre,
                voteBlanc: false,
            })
        } else {
            setState({
                ...state,
                candidatChoisi: undefined,
                voteBlanc: true,
            })
        }
    }

    const onBack = () => updateStepper.back();

    const onSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (state.candidatChoisi || state.voteBlanc) {
            updateVoteStatus.chooseLSRCONCandidate(state.voteBlanc ? undefined : state.candidatChoisi);
            updateStepper.next();
        } else {
            setState(prevState => ({...prevState, messageErreur: getText('choix-liste.erreur-anormale', textes)}));
        }
    };

    const submitBtn: ButtonProps = {
        type: 'submit',
        children: getText('choix-liste.bouton.suivant', textes),
        onClick: (e) => onSubmit(e),
        disabled: !state.candidatChoisi && !state.voteBlanc,
    }

    useEffect(() => {
        setState({
            candidatChoisi: voteStatus.chosenLSRCONCandidate,
            voteBlanc: voteStatus.voteBlanc === true,
            messageErreur: "",
        })
    }, [listeChoisie?.candidats]);

    return (
        <>
            {state.messageErreur && (
                <div className="fr-alert fr-alert--warning fr-mb-3w">
                    <p className="fr-text--bold">{state.messageErreur}</p>
                </div>
            )}

            <p className="fr-stepper__state">
                {getText('choix-liste.nombre-listes', textes, [listeChoisie?.candidats[0].candidats.length])}
            </p>

            <form id="choix_liste_form" name="choix_liste_form" className="navigation-electeur">
                <fieldset className="fr-fieldset fr-mt-3w" style={{minWidth: 0, width : '100%' }} aria-labelledby="form-legend">
                    <legend id="form-legend" className="fr-fieldset__legend--regular fr-fieldset__legend fr-h5 fr-mb-0">
                        {getText('choix-liste.titre', textes)}
                    </legend>
                    {/* Listes */}
                    {listeChoisie?.candidats[0].candidats.map(candidat => (
                        <div key={candidat.nomPrenomSansAccent} className="fr-fieldset__element">
                            <div className="fr-radio-group fr-radio-rich" onClick={() => handleClick(candidat)}>
                                <input
                                    id={`liste-ordre-${candidat.ordre}`}
                                    type="radio"
                                    name="choix-liste-radio"
                                    checked={state.candidatChoisi === candidat.ordre}
                                    onChange={() => {
                                    }} // Géré par le fichier .min.js du DSFR
                                />
                                <label className="fr-label" htmlFor={`liste-ordre-${candidat.ordre}`}>
                                    <span className="fr-mb-1v">
                                        <span className="fr-text--bold">{candidat.nom}</span>
                                        {' '}
                                        {getText('choix-liste.conduite-par', textes)}
                                        {' '}
                                        {candidat.prenom}
                                    </span>
                                    <span className={"fr-hint-text"}>
                                        {candidat.info5 ?? ''}
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
                                    name="choix-liste-radio"
                                    checked={state.voteBlanc}
                                    onChange={() => {
                                    }} // Géré par le fichier .min.js du DSFR
                                />
                                <label className="fr-label" htmlFor={`vote-blanc`}>
                                    {getText('choix-liste.vote-blanc', textes)}
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
                            children: getText('choix-liste.bouton.retour', textes),
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

export default ChoixListe;