/**
 * Copyright 2025 Voxaly Docaposte
 */

import CallOut, {CallOutProps} from "@codegouvfr/react-dsfr/CallOut";
import VoxMain from "../components/VoxMain";
import Badge from "@codegouvfr/react-dsfr/Badge";
import {useNavigate} from "react-router-dom";
import {URL_TUNNEL} from "../config/const";
import {useGetChoixElectionData} from "../hooks/useChoixElection";
import {useContext, useEffect, useMemo} from "react";
import {deleteLastCharIfDot, getText} from "../utils/utils";
import {ChoixElectionData, ElectionCard} from "../models/pages/choixElection.model";
import {getDateFromTimestamp} from "../utils/string.util";
import {ElectionContext} from "../contexts/ElectionContext";
import useDocumentTitle from "../hooks/useDocumentTitle";

interface ElectionCardProps {
    election: ElectionCard;
    textes: Record<string, string>;
    dates: Pick<ChoixElectionData, 'dateDebut' | 'dateFin' | 'tempsRestant'>
}

const ChoixElection = () => {
    // Reset du ElectionContext
    const {setElection} = useContext(ElectionContext);
    useEffect(() => setElection(null), []);

    const navigate = useNavigate();

    const {data, isLoading} = useGetChoixElectionData();
    useEffect(() => {
        if (data) {
            if (data?.suiviElections.length === 1 && data.suiviElections[0].dateEmargement == null && data.suiviElections[0].nbCandidats >= 1 && data.suiviElections[0].dateSuspension == null) {
                setElection({id: data.suiviElections[0].idElection, name: data.suiviElections[0].nomElection})
                navigate(URL_TUNNEL)
            }
        }
    }, [data]);

    const textes = data?.textes;

    useDocumentTitle(getText('choix-elections.titre-onglet', textes))

    const dates: Pick<ChoixElectionData, 'dateDebut' | 'dateFin' | 'tempsRestant'> = {
        dateDebut: data?.dateDebut ?? '',
        dateFin: data?.dateFin ?? '',
        tempsRestant: deleteLastCharIfDot(data?.tempsRestant ?? ''),
    }

    const electionsInProgress = useMemo(() => {
        return data?.suiviElections.filter(election =>
            election.dateSuspension == null &&
            election.dateEmargement == null &&
            election.nbCandidats > 0
        );
    }, [data?.suiviElections]);

    const electionsVoted = useMemo(() => {
        return data?.suiviElections.filter(election => election.dateEmargement != null);
    }, [data?.suiviElections]);

    // Élection suspendue ou en carence
    const electionsClosed = useMemo(() => {
        return data?.suiviElections.filter(election => (election.nbCandidats < 1 || election.dateSuspension != null));
    }, [data?.suiviElections]);

    if (isLoading) return null;

    return (
        <VoxMain type="choixElection">
            <h1 className="fr-h2 fr-mb-5w">{getText('choix-elections.titre', textes)}</h1>
            {data?.aucuneInscription ? (
                <p>{getText('choix-elections.aucune-inscription', textes)}</p>
            ) : (
                <>
                    {electionsInProgress?.map(election => (
                        <ElectionInProgress
                            key={election.nomElection}
                            election={election}
                            textes={textes || {}}
                            dates={dates}
                        />
                    ))}
                    {electionsVoted?.map(election => (
                        <ElectionVoted
                            key={election.nomElection}
                            election={election}
                            textes={textes || {}}
                            dates={dates}
                        />
                    ))}
                    {electionsClosed?.map(election => (
                        <ElectionClosed
                            key={election.nomElection}
                            election={election}
                            textes={textes || {}}
                            dates={dates}
                        />
                    ))}
                </>
            )}
        </VoxMain>
    );
};

const ElectionInProgress = ({election, textes, dates}: ElectionCardProps) => {
    const {setElection} = useContext(ElectionContext);
    const navigate = useNavigate();

    const calloutProps: Omit<CallOutProps, 'children'> = {
        title: election.nomElection,
        buttonProps: {
            children: getText('choix-elections.bandeau.bouton', textes),
            iconId: 'fr-icon-arrow-right-line',
            iconPosition: 'right',
            onClick: () => {
                setElection({id: election.idElection, name: election.nomElection})
                navigate(URL_TUNNEL)
            },
        },
        colorVariant: 'blue-cumulus',
    }

    return (
        <CallOut {...calloutProps}>
            {getText('choix-elections.bandeau.dates', textes, [dates?.dateDebut, dates?.dateFin])}
            {' '}
            {getText('choix-elections.bandeau.jours-restants', textes, [dates?.tempsRestant])}
        </CallOut>
    );
};

const ElectionVoted = ({election, textes, dates}: ElectionCardProps) => {
    const votedDate = election.dateEmargement && getDateFromTimestamp(election.dateEmargement);

    // La lib react-dsfr ne permet pas de mettre un Badge dans un CallOut.
    // Tous les children sont rendus dans une balise <p>, provoquant des anomalies HTML (impact RGAA).
    // On doit donc utiliser du code HTML/CSS pour ce CallOut et celui de <ElectionClosed>.
    return (
        <div className="fr-callout">
            <h2 className="fr-callout__title fr-h4">{election.nomElection}</h2>
            <p className="fr-callout__text">
                {getText('choix-elections.bandeau.dates', textes, [dates?.dateDebut, dates?.dateFin])}
                {' '}
                {getText('choix-elections.bandeau.jours-restants', textes, [dates?.tempsRestant])}
            </p>
            {election.dateEmargement && votedDate && (
                <Badge severity="success" className="fr-mt-2w">
                    {getText('choix-elections.bandeau.tag.deja-vote', textes, [votedDate.day, votedDate.hours])}
                </Badge>
            )}
        </div>
    );
}

const ElectionClosed = ({election, textes, dates}: ElectionCardProps) => {
    return (
        <div className="fr-callout">
            <h2 className="fr-callout__title fr-h4">{election.nomElection}</h2>
            <p className="fr-callout__text">
                {getText('choix-elections.bandeau.dates', textes, [dates?.dateDebut, dates?.dateFin])}
            </p>
            <Badge severity="warning" className="fr-mt-2w">
                {election.dateSuspension != null ? (
                    getText('choix-elections.bandeau.tag.suspendue', textes)
                ) : (
                    getText('choix-elections.bandeau.tag.carence', textes)
                )}
            </Badge>
            {/* Motif de la suspension (renseignée dans le gestionnaire) */}
            {election.libelleSuspension && <p className="fr-mt-2w">{election.libelleSuspension}</p>}
        </div>
    );
}

export default ChoixElection;