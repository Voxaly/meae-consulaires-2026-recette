/**
 * Copyright 2025 Voxaly Docaposte
 */

import Button from "@codegouvfr/react-dsfr/Button";
import {getText} from "../utils/utils";
import React from "react";
import {logoutModal} from "./VoxModal";
import {useSession} from "../hooks/useSession";

interface VoxFooterProps {
    textes: Record<string, string>;
}

interface LinkProps {
    href: string,
    label: string,
    title: string,
}

// NOTE :
// On n'utilise pas le composant <Footer> de la lib react-dsfr car
// elle oblige de renseigner l'accessibilité en dur, hors on souhaite
// utiliser nos propres clés de traduction (election-textes.properties)

const VoxFooter = ({textes}: VoxFooterProps) => {

    const {data: sessionData} = useSession();
    const isConnected = sessionData?.authenticated ?? false;

    const handleHomeLink = () => {
        if (isConnected) {
            logoutModal.open();
        } else {
            window.location.assign('/');
        }
    };

    const officialLinks: LinkProps[] = [
        {
            href: getText('footer.liens.info.lien', textes),
            label: getText('footer.liens.info.libelle', textes),
            title: getText('footer.liens.info.title', textes)
        },
        {
            href: getText('footer.liens.service-public.lien', textes),
            label: getText('footer.liens.service-public.libelle', textes),
            title: getText('footer.liens.service-public.title', textes)
        },
        {
            href: getText('footer.liens.legifrance.lien', textes),
            label: getText('footer.liens.legifrance.libelle', textes),
            title: getText('footer.liens.legifrance.title', textes)
        },
        {
            href: getText('footer.liens.data.lien', textes),
            label: getText('footer.liens.data.libelle', textes),
            title: getText('footer.liens.data.title', textes)
        },
    ]

    const bottomLinks: LinkProps[] = [
        {
            href: getText('footer.bottom.faq.lien', textes),
            label: getText('footer.bottom.faq.libelle', textes),
            title: getText('footer.bottom.faq.title', textes)
        },
        {
            href: getText('footer.bottom.mentions-legales.lien', textes),
            label: getText('footer.bottom.mentions-legales.libelle', textes),
            title: getText('footer.bottom.mentions-legales.title', textes)
        },
        {
            href: getText('footer.bottom.accessibilite.lien', textes),
            label: getText('footer.bottom.accessibilite.libelle', textes),
            title: getText('footer.bottom.accessibilite.title', textes)
        },
        {
            href: getText('footer.bottom.donnees-perso.lien', textes),
            label: getText('footer.bottom.donnees-perso.libelle', textes),
            title: getText('footer.bottom.donnees-perso.title', textes)
        },
        {
            href: getText('footer.bottom.code-source.lien', textes),
            label: getText('footer.bottom.code-source.libelle', textes),
            title: getText('footer.bottom.code-source.title', textes)
        },
    ]

    return (
        <footer id="footer" className="fr-footer fr-mt-auto" role="contentinfo">
            <div className="fr-container">
                <div className="fr-footer__body">
                    {/* LOGO */}
                    <div className="fr-footer__brand fr-enlarge-link">
                        <a href="#"
                           title={getText('footer.logo.title', textes)}
                           onClick={(e) => {
                               e.preventDefault();
                               handleHomeLink();
                           }}>
                            <p className="fr-logo"
                               dangerouslySetInnerHTML={{__html: getText('footer.logo.libelle', textes)}}/>
                        </a>
                    </div>

                    {/* LIENS OFFICIELS */}
                    <div className="fr-footer__content">
                        <ul className="fr-footer__content-list">
                            {officialLinks.map(link => (
                                <li key={link.href} className="fr-footer__content-item">
                                    <a
                                        className="fr-footer__content-link"
                                        href={link.href}
                                        title={link.title}
                                        target="_blank"
                                        rel="noreferrer"
                                    >{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* LIGNE DU BAS */}
                <div className="fr-footer__bottom">
                    <ul className="fr-footer__bottom-list">
                        {bottomLinks.map(link => (
                            <li key={link.href} className="fr-footer__bottom-item">
                                <a
                                    className="fr-footer__bottom-link"
                                    href={link.href}
                                    title={link.title}
                                    target="_blank"
                                    rel="noreferrer"
                                >{link.label}</a>
                            </li>
                        ))}
                        <li className="fr-footer__bottom-item">
                            <Button
                                className="fr-btn--display"
                                iconId="fr-icon-theme-fill"
                                aria-controls="fr-theme-modal"
                                data-fr-opened="false"
                            >
                                {getText('footer.bottom.parametres-affichage', textes)}
                            </Button>
                        </li>
                    </ul>
                    <div className="fr-footer__bottom-copy">
                        <p dangerouslySetInnerHTML={{__html: getText('footer.bottom.copyrights', textes)}}/>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default VoxFooter;