/**
 * Copyright 2025 Voxaly Docaposte
 */

import React, {useMemo} from "react";
import {Header, HeaderProps} from "@codegouvfr/react-dsfr/Header";
import {addDisplayTranslations, headerFooterDisplayItem} from "@codegouvfr/react-dsfr/Display";
import {logoutModal} from "./VoxModal";
import {useGlobal} from "../hooks/useGlobal";
import {URL_IDENTIFICATION} from "../config/const";
import {getText} from "../utils/utils";
import {useSession} from "../hooks/useSession";

const VoxHeader = () => {
    const {globalData} = useGlobal();
    const textes = globalData!.header.textes;

    const {data: sessionData} = useSession();
    const isConnected = sessionData?.authenticated ?? false;

    const homeLinkProps = {
        to: '/',
        title: getText('header.logo.title', textes),
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleHomeLink(e),
    }

    // Interception du retour à l'identification pour demander l'accord de l'électeur
    const handleHomeLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (isConnected) {
            logoutModal.open();
        } else {
            window.location.assign('/');
        }
    };

    const quickAccessItems: HeaderProps['quickAccessItems'] = useMemo(() => [
        {
            ...headerFooterDisplayItem,
            text: getText("header.parametres.affichage", textes)
        },
        {
            iconId: 'fr-icon-question-fill',
            text: getText('header.aide', textes),
            linkProps: {
                to: globalData!.common.pageAidelien,
                title: getText('header.aide.title', textes)
            }
        },
        isConnected ?
            {
                iconId: 'fr-icon-logout-box-r-fill',
                text: getText('header.deconnexion', textes),
                buttonProps: {
                    ...logoutModal.buttonProps,
                    className: 'fr-btn--tertiary',
                    onClick: () => logoutModal.open(),
                },
            } :
            {
                iconId: 'fr-icon-account-circle-fill',
                text: getText('header.connexion', textes),
                linkProps: {
                    to: URL_IDENTIFICATION,
                    className: 'fr-btn fr-btn--tertiary'
                },
            }
    ], [isConnected]);

    addDisplayTranslations({
        lang: 'fr',
        messages: {
            "close": getText('modale.parametres-affichage.fermer', textes),
            "display settings": getText('modale.parametres-affichage.titre', textes),
            "pick a theme": getText('modale.parametres-affichage.description', textes),
            "light theme": getText('modale.parametres-affichage.theme.clair', textes),
            "dark theme": getText('modale.parametres-affichage.theme.sombre', textes),
            "system theme": getText('modale.parametres-affichage.systeme', textes),
            "system theme hint": getText('modale.parametres-affichage.systeme.description', textes),
        }
    })

    return (
        <Header
            id="header"
            brandTop={<span dangerouslySetInnerHTML={{__html: getText('header.logo.libelle', textes)}}/>}
            homeLinkProps={homeLinkProps}
            serviceTitle={getText('header.titre', textes)}
            quickAccessItems={quickAccessItems}
        />
    );
};

export default VoxHeader;