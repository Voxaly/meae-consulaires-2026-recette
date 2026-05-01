/**
 * Copyright 2025 Voxaly Docaposte
 */

import React, {useEffect, useMemo, useRef, useState} from "react";
import {getText, navigatorInfos} from "../../utils/utils";
import Button from "@codegouvfr/react-dsfr/Button";
import {createBallot} from "../../utils/chiffrement";
import VoxModal, {activationCodeModal} from "../../components/VoxModal";
import ConfirmationChoixCandidat from "../../components/ConfirmationChoixCandidat";
import {ballotSignatureKey, VoximiusElectorModule} from '../../mjs/vote_api.mjs';
import ConfirmationChoixListe from "../../components/ConfirmationChoixListe";
import {useNavigationClientContext, usePostCheckCodeActivation, usePostVote} from "../../hooks/useNavigationClient";
import DSFRInput from "../../components/DSFRInput";
import {CODE_ACTIVATION_REGEX} from "../../utils/regex.util";
import {errorHandler} from "../../utils/error.util";
import {useNavigate} from "react-router-dom";
import {URL_RECEPISSE_VOTE} from "../../config/const";
import {useGlobal} from "../../hooks/useGlobal";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {UpdateStepper} from "../../models/pages/navigationClient.model";

declare const JsEncryptionEngine: any;
declare const jsSHA: any;

interface VoteState {
    erreurVoteSignature: boolean;
    erreurVoteSignatureDelai: boolean;
    voteSignature: string;
    preuveLegitimite: string;
    correctLength: boolean;
    choixCorrectementForme: boolean;
    aVote: boolean;
    timerCheckChiffrement: number;
    timerCheckTemoinChiffrement: number;
    cryptoLibrary: string;
    clientInfos: string;
    bulletinChiffre: string;
    chargerCalendarJs: boolean;
    showModalNoCode: boolean;
    hashBulletin: string;
}

const ConfirmationVote = () => {
    const {globalData} = useGlobal();
    const {jsConfigCryptoJSON, voteStatus, stepperState, updateStepper, parameters, textes} = useNavigationClientContext();

    useDocumentTitle(getText('confirmation-vote.titre-onglet', textes, [stepperState.pos + 1, stepperState.steps.length]));

    const isElecteurFIN = parameters.electeurFIN;
    const election = voteStatus.chosenElection!;

    const typeIHM = election.typeEN.typeIhm;
    const isScrutinNom = typeIHM === "NOM" || typeIHM === "LSRCON";

    const [state, setState] = useState<VoteState>({
        erreurVoteSignature: false,
        erreurVoteSignatureDelai: false,
        voteSignature: isElecteurFIN ? '000000' : '',
        preuveLegitimite: '',
        correctLength: isElecteurFIN,
        choixCorrectementForme: true,
        aVote: false,
        timerCheckChiffrement: -1,
        timerCheckTemoinChiffrement: -1,
        cryptoLibrary: 'tomwu',
        clientInfos: '',
        bulletinChiffre: '',
        chargerCalendarJs: false,
        showModalNoCode: false,
        hashBulletin: '',
    })

    const [readyToVote, setReadyToVote] = useState<boolean>(false);
    const readyToVoteRef = useRef<boolean>(false);
    const stateRef = useRef<VoteState>(state);

    // Synchroniser les refs avec les states
    useEffect(() => {
        readyToVoteRef.current = readyToVote;
    }, [readyToVote]);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);


    // ----- FORMULAIRE CODE ACTIVATION ------ //

    const [input, setInput] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();

    // Appel back-end pour contrôler le code d'activation
    const {
        mutate: checkCodeActivation,
        isPending: isPendingCheckCodeActivation
    } = usePostCheckCodeActivation({
        onError: (err) => errorHandler(err, setErrors, {...textes, ...globalData?.common.textes}),
        onSuccess: (data) => {
            if (data.data === "OK") {
                sendVote(stateRef.current);
            } else {
                setErrors({'codeActivation': getText('ERR-VOTE-8', textes)})
            }
        },
    })

    // Appel back-end pour soumettre le vote (lancé automatiquement si codeActivation en succès)
    const {mutate: postVote, isPending: isPendingPostVote} = usePostVote({
        onError: (err) => errorHandler(err, setErrors, {...textes, ...globalData?.common.textes}),
        onSuccess: (data) => {
            if (data.data === "accuse-reception") {
                navigate(URL_RECEPISSE_VOTE);
            }
        }
    })

    const onSubmit = async (e: React.FormEvent<EventTarget>) => {
        e.preventDefault();

        // Attendre que le bulletin soit prêt si ce n'est pas encore le cas
        if (!readyToVoteRef.current) {
            await new Promise<void>((resolve) => {
                const checkInterval = setInterval(() => {
                    if (readyToVoteRef.current) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        // Utiliser stateRef pour avoir les données à jour après l'attente
        const currentState = stateRef.current;

        const shaBulletinGenerator = new jsSHA('SHA-256', 'TEXT');
        shaBulletinGenerator.update(currentState.bulletinChiffre + input);
        const shaHashBulletin = shaBulletinGenerator.getHash('HEX');
        setState({...currentState, voteSignature: input, hashBulletin: shaHashBulletin, correctLength: true})

        if (isElecteurFIN) {
            sendVote(currentState, shaHashBulletin);
        } else {
            checkCodeActivation({
                form: {
                    bulletin: currentState.bulletinChiffre,
                    hashBulletin: shaHashBulletin,
                }
            });
        }

        setState({...currentState, aVote: true});
    }

    const sendVote = (currentState: VoteState, hashBulletin?: string) => {
        postVote({
            form: {
                bulletin: btoa(currentState.bulletinChiffre),
                cryptoLibrary: currentState.cryptoLibrary,
                clientInfos: currentState.clientInfos,
                idElection: election.id,
                hashBulletin: hashBulletin ?? currentState.hashBulletin,
                voteSignature: currentState.preuveLegitimite,
            }
        })
    }

    // Initial Setup
    useEffect(() => {
        if (voteStatus.chosenElection === undefined || voteStatus.chosenList === undefined) return;

        // Initialisation du Moteur Crypto
        const engine = new JsEncryptionEngine('MAIN');
        engine.init(JSON.parse(atob(jsConfigCryptoJSON)));

        (async function () {
            const listeChoisie = election!.listesCandidat[isScrutinNom ? 0 : voteStatus.chosenList!];

            try {
                const [ballot] = await Promise.all([
                    createBallot(
                        listeChoisie,
                        voteStatus.chosenCandidates,
                        voteStatus.chosenLSRCONCandidate,
                        voteStatus.voteBlanc,
                        false,
                        election!.typeEN.typeIhm,
                        engine,
                    )
                ]);

                const storage = sessionStorage;
                const electorModule = new VoximiusElectorModule();
                electorModule.recoverSk(storage.getItem(ballotSignatureKey)); // Généré par vote_api.mjs lors de la connexion
                let signatureBallot;
                if (electorModule.setContext(parameters.ballotContextWithAnonymisationKey)) {
                    signatureBallot = electorModule.signBallot(ballot.ballot);
                }
                electorModule.clear();

                const shaHashGenerator = new jsSHA('SHA-256', 'TEXT');
                shaHashGenerator.update(ballot.ballot);
                const shaHash = shaHashGenerator.getHash('HEX');
                storage.setItem('HashClient', shaHash);

                setState({
                    ...state,
                    bulletinChiffre: ballot.ballot,
                    preuveLegitimite: signatureBallot,
                    clientInfos: navigatorInfos()
                });

                setReadyToVote(true);

            } catch (error) {
                setState({...state, choixCorrectementForme: false});
                console.error(error);
            }
        })();
    }, []);

    const disableSubmitBtn = useMemo(() => {
        if (!readyToVote) {
            return true;
        } else {
            return isPendingCheckCodeActivation || isPendingPostVote || input.length < 6 || errors.codeActivation != undefined;
        }
    }, [readyToVote, isPendingCheckCodeActivation, isPendingPostVote, input, errors]);

    const disableSubmitBtnFin = useMemo(() => {
        if (!readyToVote) {
            return true;
        } else {
            return isPendingCheckCodeActivation || isPendingPostVote;
        }
    }, [readyToVote, isPendingCheckCodeActivation, isPendingPostVote]);


    if (!state.choixCorrectementForme) {
        return (
            <div className="fr-alert fr-alert--error fr-mb-3w">
                <p className="fr-text--bold">{getText('confirmation-vote.erreur-construction-bulletin', textes)}</p>
            </div>
        );
    } else if (isElecteurFIN) {
        return (
            <>
                <AlertVoteDefinitif/>
                <form autoComplete="off" onSubmit={onSubmit}>
                    {typeIHM === "NOM" ? (
                        <ConfirmationChoixCandidat
                            voteStatus={voteStatus}
                            listeChoisie={election.listesCandidat[0]}
                        />
                    ) : (
                        <ConfirmationChoixListe voteStatus={voteStatus}/>
                    )}
                    <div className="fr-mt-5w fr-btns-group fr-btns-group--right fr-btns-group--inline-sm">
                        <Button
                            type="button"
                            priority="secondary"
                            onClick={() => updateStepper.back()}
                        >
                            {getText('confirmation-vote.bouton.retour', textes)}
                        </Button>
                        <Button
                            type="submit"
                            disabled={disableSubmitBtnFin}
                        >
                            {getText('confirmation-vote.bouton.voter', textes)}
                        </Button>
                    </div>
                </form>
            </>
        )
    } else return (
        <>
            <AlertVoteDefinitif/>
            <p dangerouslySetInnerHTML={{
                __html: getText('confirmation-vote.instructions', textes, [parameters.electeurEmail])
            }}/>
            <form autoComplete="off" onSubmit={onSubmit}>
                <DSFRInput
                    id="codeActivation"
                    type="password"
                    onChange={(e) => setInput(e.target.value)}
                    nativeInputProps={{
                        value: input,
                        required: true,
                        maxLength: 6,
                        autoComplete: "off",
                    }}
                    regex={CODE_ACTIVATION_REGEX}
                    texts={{
                        label: getText('confirmation-vote.champ.code.label', textes),
                        errorIsEmpty: getText('confirmation-vote.champ.code.erreur.vide', textes),
                        errorFormat: getText('confirmation-vote.champ.code.erreur.format', textes),
                    }}
                    errors={errors}
                    setErrors={setErrors}
                />

                <Button type="button" priority="tertiary no outline" onClick={() => activationCodeModal.open()}>
                    {getText('confirmation-vote.code-non-recu', textes)}
                </Button>
                <div className="fr-mt-5w fr-btns-group fr-btns-group--right fr-btns-group--inline-sm">
                    <Button
                        type="submit"
                        disabled={disableSubmitBtn}
                    >
                        {getText('confirmation-vote.bouton.voter', textes)}
                    </Button>
                </div>
            </form>

            {/* Pop-in "Code non reçu" */}
            <VoxModal
                modalParams={activationCodeModal}
                title={getText('confirmation-vote.code-non-recu.modale.titre', textes)}
                buttons={[
                    {
                        children: getText('confirmation-vote.code-non-recu.modale.bouton', textes),
                        doClosesModal: true,
                    }
                ]}
            >
                <p>{getText('confirmation-vote.code-non-recu.modale.description', textes)}</p>
            </VoxModal>
        </>
    );
};

const AlertVoteDefinitif = () => {
    const {textes} = useNavigationClientContext();

    return (
        <div className="fr-alert fr-alert--warning fr-mb-3w">
            <p className="fr-text--bold">{getText('confirmation-vote.bandeau', textes)}</p>
        </div>
    )
}

export default ConfirmationVote;