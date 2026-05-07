/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useContext, useEffect, useState} from "react";
import {getText} from "../utils/utils";
import {
    URL_CHOIX_ELECTION,
    URL_RECEPISSE_VOTE,
    URL_TUNNEL_CHOIX_CANDIDAT,
    URL_TUNNEL_CHOIX_LISTE,
    URL_TUNNEL_CONFIRM_CANDIDAT,
    URL_TUNNEL_CONFIRM_LISTE,
    URL_TUNNEL_CONFIRM_VOTE
} from "../config/const";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import VoxMain from "../components/VoxMain";
import VoxStepper from "../components/VoxStepper";
import {useGetNavigationClient} from "../hooks/useNavigationClient";
import {Step, StepperState, UpdateStepper, UpdateVoteStatus, VoteStatus} from "../models/pages/navigationClient.model";
import {ElectionContext} from "../contexts/ElectionContext";

declare const JsEncryptionEngine: any;

const TunnelDeVote = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {election} = useContext(ElectionContext);
    if (!election) navigate(URL_CHOIX_ELECTION) // Retour sur ChoixElection si l'électeur rafraîchit la page

    const {data, isLoading, isSuccess} = useGetNavigationClient(election?.id!);

    const isElecteurFIN = data?.parameters.electeurFIN;

    // --------------------------- VOTE ------------------------------ //

    const [voteStatus, setVoteStatus] = useState<VoteStatus>({
        chosenElection: undefined,
        chosenCandidates: [],
        chosenLSRCONCandidate: undefined,
        chosenList: undefined,
        voteBlanc: null,
    });

    useEffect(() => {
        if (data?.data.election) {
            setVoteStatus(voteStatus => ({
                ...voteStatus,
                chosenElection: data.data.election,
            }))
        }
    }, [data]);

    const updateVoteStatus: UpdateVoteStatus = {
        chooseList: (listId: number | undefined) => {
            setVoteStatus(voteStatus => ({
                ...voteStatus,
                chosenCandidates: [],
                chosenLSRCONCandidate: undefined,
                chosenList: listId,
                voteBlanc: listId === undefined,
            }));
        },
        chooseCandidates: (candidates: number[]) => {
            setVoteStatus(voteStatus => ({
                ...voteStatus,
                chosenCandidates: candidates,
                voteBlanc: candidates.length === 0,
            }));
        },
        chooseLSRCONCandidate: (candidate) => {
            setVoteStatus(voteStatus => ({
                ...voteStatus,
                chosenLSRCONCandidate: candidate,
                voteBlanc: candidate === undefined,
            }))
        }
    };

    const typeIHM = voteStatus?.chosenElection?.typeEN.typeIhm;

    useEffect(() => {
        // On choisit directement la liste 0 pour les scrutins de nom ou LSRCON
        // Les jeux de données pour ces scrutins ne contiennent qu'une seule liste (non visible de l'électeur)
        if (typeIHM === 'NOM' || typeIHM === "LSRCON") {
            setVoteStatus(voteStatus => ({...voteStatus, chosenList: 0}));
        }
    }, [typeIHM]);


    // --------------------------- STEPPER ------------------------------ //

    const [stepperState, setStepper] = useState<StepperState>({pos: 0, steps: []});

    const updateStepper: UpdateStepper = {
        back: () => {
            if (stepperState.pos > 0) {
                const pos = stepperState.pos - 1;
                setStepper({...stepperState, pos});
                navigate(stepperState.steps[pos].path);
            } else if (stepperState.pos === 0) {
                navigate(URL_CHOIX_ELECTION);
            }
        },
        next: () => {
            if (stepperState.pos >= 0 && stepperState.pos < stepperState.steps.length - 1) {
                const pos = stepperState.pos + 1;
                setStepper({...stepperState, pos});
                navigate(stepperState.steps[pos].path);
            }
        },
        go: (pos: number) => setStepper({...stepperState, pos}),
    };

    // Initial Stepper
    useEffect(() => {
            const steps: Step[] = [];

            // Si l'électeur est connecté via FIN (France Identité Numérique),
            // l'étape du récap est décalée sur la page de confirmation du vote
            // et on ne demande pas de code de validation à l'électeur pour confirmer son vote
            if (typeIHM === 'NOM') {
                steps.push(
                    {text: getText('stepper.etape1.libelle.nom', data?.textes), path: URL_TUNNEL_CHOIX_CANDIDAT},
                    ...(!isElecteurFIN ? [{
                        text: getText('stepper.etape2.libelle', data?.textes),
                        path: URL_TUNNEL_CONFIRM_CANDIDAT
                    }] : []),
                    {text: getText('stepper.etape3.libelle', data?.textes), path: URL_TUNNEL_CONFIRM_VOTE},
                    {text: getText('stepper.etape4.libelle', data?.textes), path: URL_RECEPISSE_VOTE},
                );
            } else if (typeIHM === "LSRCON") { // (Listes Sans Rature Consulaires)
                steps.push(
                    {text: getText('stepper.etape1.libelle.liste', data?.textes), path: URL_TUNNEL_CHOIX_LISTE},
                    ...(!isElecteurFIN ? [{
                        text: getText('stepper.etape2.libelle', data?.textes),
                        path: URL_TUNNEL_CONFIRM_LISTE
                    }] : []),
                    {text: getText('stepper.etape3.libelle', data?.textes), path: URL_TUNNEL_CONFIRM_VOTE},
                    {text: getText('stepper.etape4.libelle', data?.textes), path: URL_RECEPISSE_VOTE},
                );
            } else {
                // Fallback
                if (typeIHM !== undefined) {
                    alert(`Erreur : le type IHM "${typeIHM}" n'est pas supporté. Seuls les types IHM "NOM" et "LSRCON" sont pris en charge.`)
                }
            }
            setStepper({steps, pos: 0})
        },
        [voteStatus.chosenElection]
    );

    useEffect(() => {
        // MAJ du Stepper quand l'URL est modifiée
        setStepper(stepperState => {
            const pos = stepperState.steps.findIndex(step => step.path === location.pathname);
            return {...stepperState, pos};
        });
    }, [location]);


    if (isLoading) return null;

    return (
        <VoxMain type="tunnelDeVote">
            <VoxStepper steps={stepperState.steps} pos={stepperState.pos} textes={data?.textes!}/>
            <Outlet
                context={{
                    jsConfigCryptoJSON: data?.data.jsConfigCryptoJSON,
                    voteStatus,
                    updateVoteStatus,
                    stepperState,
                    updateStepper,
                    parameters: data?.parameters,
                    textes: data?.textes!
                }}
            />
        </VoxMain>
    );
};

export default TunnelDeVote;