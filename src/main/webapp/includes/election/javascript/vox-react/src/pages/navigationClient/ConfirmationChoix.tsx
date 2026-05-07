/**
 * Copyright 2025 Voxaly Docaposte
 */

import React, {useEffect, useState} from "react";
import {useNavigationClientContext, usePostCodeActivation} from "../../hooks/useNavigationClient";
import {URL_CHOIX_ELECTION, URL_TUNNEL_CONFIRM_VOTE} from "../../config/const";
import ConfirmationChoixCandidat from "../../components/ConfirmationChoixCandidat";
import ConfirmationChoixListe from "../../components/ConfirmationChoixListe";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import {getText} from "../../utils/utils";
import {useNavigate} from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const ConfirmationChoix = () => {
    const navigate = useNavigate();

    const {voteStatus, stepperState, updateStepper, textes} = useNavigationClientContext();

    useDocumentTitle(getText('confirmation-choix.titre-onglet', textes, [stepperState.pos + 1, stepperState.steps.length]));

    const [state, setState] = useState<{ confirmed: boolean }>({confirmed: false});

    const election = voteStatus.chosenElection;
    const listeChoisie = election?.listesCandidat[0]!; // Toujours index 0 vu qu'on a une seule liste dans un scrutin de noms
    const typeIHM = election?.typeEN.typeIhm;

    const {mutate: sendActivationCode} = usePostCodeActivation({
        onSuccess: (data) => {
            if (data.data === "ok") {
                navigate(URL_TUNNEL_CONFIRM_VOTE);
            } else {
                // TODO: Do something if "ko"
            }
        },
    });

    const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!state.confirmed) {
            setState({confirmed: true})
            await sendActivationCode();
        }
    }

    useEffect(() => {
        if (typeIHM === "NOM" && !voteStatus.voteBlanc && voteStatus.chosenCandidates.length < 1 ||
            typeIHM === "LSRCON" && !voteStatus.voteBlanc && !voteStatus.chosenLSRCONCandidate) {
            window.location.assign(URL_CHOIX_ELECTION);
        }
    }, [voteStatus.voteBlanc, voteStatus.chosenCandidates.length, voteStatus.chosenLSRCONCandidate]);

    return (
        <form id="voteForm" name="voteForm" method="post" autoComplete="off">
            {typeIHM === "NOM" ? (
                <ConfirmationChoixCandidat voteStatus={voteStatus} listeChoisie={listeChoisie}/>
            ) : (
                <ConfirmationChoixListe voteStatus={voteStatus}/>
            )}

            <ButtonsGroup
                alignment="right"
                inlineLayoutWhen="sm and up"
                buttons={[
                    {
                        type: 'button',
                        children: getText('confirmation-choix.bouton.retour', textes),
                        priority: 'secondary',
                        onClick: () => updateStepper.back(),
                    },
                    {
                        type: 'submit',
                        children: getText('confirmation-choix.bouton.suivant', textes),
                        disabled: state.confirmed,
                        onClick: onSubmit,
                    }
                ]}
            />
        </form>
    );
};

export default ConfirmationChoix;