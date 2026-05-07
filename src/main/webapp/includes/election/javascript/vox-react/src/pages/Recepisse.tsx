/**
 * Copyright 2025 Voxaly Docaposte
 */

import Badge from "@codegouvfr/react-dsfr/Badge";
import {getText} from "../utils/utils";
import CopyToClipboardButton from "../components/CopyToClipboard/CopyToClipboardButton";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import React from "react";
import {useNavigate} from "react-router-dom";
import {ButtonProps} from "@codegouvfr/react-dsfr/Button";
import {useGetRecepisse} from "../hooks/useRecepisse";
import {useQueryClient} from "@tanstack/react-query";
import {URL_CHOIX_ELECTION} from "../config/const";
import {useGlobal} from "../hooks/useGlobal";
import RecepissePDF from "../components/RecepissePDF";
import {logoutModal} from "../components/VoxModal";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {useNavigationClientContext} from "../hooks/useNavigationClient";


const Recepisse = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const {globalData, isLoading: isLoadingGlobal} = useGlobal();
    const {data, isLoading: isLoadingRecepisse} = useGetRecepisse();

    const {stepperState} = useNavigationClientContext();
    useDocumentTitle(getText('recepisse.titre-onglet', data?.textes, [stepperState.pos + 1, stepperState.steps.length]));

    const logoutBtn: ButtonProps = {
        type: 'button',
        children: getText('recepisse.bouton.deconnexion', data?.textes),
        priority: data?.electionsRestantes ? 'secondary' : 'primary',
        onClick: () => {
            logoutModal.open();
        },
    }

    const onClickOtherElection = () => {
        // On force la mise à jour des élections mises en cache avant d'afficher la page
        queryClient.refetchQueries({queryKey: ['choix-election']})
            .then(() => navigate(URL_CHOIX_ELECTION));
    };


    if (isLoadingGlobal || isLoadingRecepisse) return null;

    return (
        <>
            {/* PICTO "URNE" + TAG "A VOTÉ" */}
            <div className="fr-grid-row fr-grid-row--gutters fr-text--center fr-mb-2w">
                <div className="fr-col-12">
                    <svg className="fr-artwork" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
                        <use className="fr-artwork-decorative"
                             href="/resources/vox/picto/vote.svg#artwork-decorative"></use>
                        <use className="fr-artwork-minor" href="/resources/vox/picto/vote.svg#artwork-minor"></use>
                        <use className="fr-artwork-major" href="/resources/vox/picto/vote.svg#artwork-major"></use>
                    </svg>
                </div>
                <div className="fr-col-12">
                    <Badge severity="success">
                        {getText('recepisse.tag.a-vote', data?.textes)}
                    </Badge>
                </div>
            </div>

            <p className="fr-mb-8w"
               dangerouslySetInnerHTML={{
                   __html:
                       getText('recepisse.enregistrement', data?.textes, [data?.dateEmargement])
               }}
            />

            <p dangerouslySetInnerHTML={{__html: getText('recepisse.verification-depouillement', data?.textes)}}/>
            <p dangerouslySetInnerHTML={{__html: getText('recepisse.preuve-emargement', data?.textes)}}/>

            {/* PDF Récépissé */}
            <div id="errorHashVerification" className="fr-mb-5w" hidden>
                <div id="errorLibelleVerification" className="fr-alert fr-alert--error" role="alert" hidden>
                    <p id="errorMsgId">
                        {getText('recepisse.erreur-verification', data?.textes)}
                    </p>
                </div>
                <div id="errorDetailVerification" className="error stronger" hidden>
                    <p id="dateErreurId"></p>
                    <p id="sessionHashId"></p>
                    <p id="serveurHashId"></p>
                </div>
            </div>

            <RecepissePDF nomOperation={globalData?.common.nomOperation ?? ''} dataRecepisse={data}/>

            <p className="fr-mt-4w"
               dangerouslySetInnerHTML={{__html: getText('recepisse.verification-urne', data?.textes, [data?.cachetBulletin])}}
            />

            <p className="fr-text--bold fr-mb-1w"
               dangerouslySetInnerHTML={{__html: getText('recepisse.cachet', data?.textes)}}
            />
            <CopyToClipboardButton
                contentToCopy={data?.cachetBulletin ?? ''}
                textButton={getText('recepisse.cachet.bouton', data?.textes)}
                textTooltip={getText('recepisse.cachet.bouton.confirmation', data?.textes)}
            />

            {/* Obligé de passer par du HTML ici, car le CallOut de la lib React n'est pas assez personnalisable */}
            <div className="fr-callout fr-callout--pink-tuile fr-mt-8w fr-mb-5w">
                <h3 className="fr-callout__title">
                    {getText('recepisse.avis.titre', data?.textes)}
                </h3>
                <p>
                    {getText('recepisse.avis.description', data?.textes)}
                </p>
                <div className="vox-avis-flex fr-mt-3w">
                    <a title={getText('recepisse.avis.lien.title', data?.textes)}
                       href={getText('recepisse.avis.lien.url', data?.textes)}
                       target="_blank"
                       rel="noopener external"
                       className="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                    >
                        {getText('recepisse.avis.lien.libelle', data?.textes)}
                    </a>
                    <img src="/resources/vox/images/services-publics.svg" alt="" aria-hidden="true"/>
                </div>
            </div>

            <ButtonsGroup
                alignment="right"
                inlineLayoutWhen="sm and up"
                buttons={data?.electionsRestantes ? [
                    logoutBtn,
                    {
                        // Bouton "Sélectionner un autre scrutin" s'il reste des élections
                        type: 'button',
                        children: getText('recepisse.bouton.autre-scrutin', data?.textes),
                        priority: 'primary',
                        onClick: onClickOtherElection,
                    }
                ] : [
                    logoutBtn
                ]}
            />
        </>
    )
};

export default Recepisse;
