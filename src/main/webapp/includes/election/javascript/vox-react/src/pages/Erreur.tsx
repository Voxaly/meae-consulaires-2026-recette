/**
 * Copyright 2025 Voxaly Docaposte
 */

import {MAIN_ID} from "../components/VoxMain";
import {Link, useNavigate} from "react-router-dom";
import {URL_IDENTIFICATION} from "../config/const";
import {useGlobal} from "../hooks/useGlobal";
import {getText} from "../utils/utils";
import {useMemo} from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Button from "@codegouvfr/react-dsfr/Button";

interface ErreurProps {
    type?: "404" | "generic" | "maintenance";
}

const Erreur = ({type = "generic"}: ErreurProps) => {
    const {globalData, isLoading} = useGlobal();
    const navigate = useNavigate();

    const keyPrefix = useMemo(() => {
        switch (type) {
            case "404":
                return "page404";
            case "maintenance":
                return "maintenance";
            case "generic":
            default:
                return "erreur";
        }
    }, [type]);

    const textes = globalData?.common.textes;

    useDocumentTitle(getText(`${keyPrefix}.titre-onglet`, globalData?.common.textes));

    if (isLoading) return null;

    return (
        <main id={MAIN_ID} role="main">
            <div className="fr-container">
                <div
                    className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">

                    {/* LEFT PART */}
                    <div className="fr-py-0 fr-col-12 fr-col-md-6">

                        {/* IMPORTANT :
                            L'affichage des clés est conditionnée selon les clés existantes
                            dans le fichier election-textes.properties. Les 3 types d'erreur
                            possèdent leurs propres clés dans ce fichier. */}

                        {/* TITRE DE PAGE */}
                        <h1>{getText(`${keyPrefix}.titre`, textes)}</h1>

                        {/* NOM DE l'ERREUR */}
                        {type === "404" && (
                            <p className="fr-text--sm fr-mb-3w">
                                {getText(`${keyPrefix}.erreur`, textes)}
                            </p>
                        )}

                        {/* DESCRIPTION DE L'ERREUR */}
                        <p className="fr-text--lead fr-mb-3w"
                           dangerouslySetInnerHTML={{__html: getText(`${keyPrefix}.description`, textes)}}
                        />

                        {/* AIDE POUR REDIRIGER L'UTILISATEUR */}
                        <p className="fr-text--sm fr-mb-5w"
                           dangerouslySetInnerHTML={{__html: getText(`${keyPrefix}.aide`, textes)}}
                        />

                        {/* BOUTON DE RETOUR */}
                        {type !== "maintenance" && (
                            <ul className="fr-btns-group fr-btns-group--inline-md">
                                <li>
                                    {type === "404" ? (
                                        <Button onClick={() => navigate(-1)}>
                                            {getText(`${keyPrefix}.bouton.retour`, textes)}
                                        </Button>
                                    ) : (
                                        <Link to={URL_IDENTIFICATION} className="fr-btn">
                                            {getText(`${keyPrefix}.bouton.accueil`, textes)}
                                        </Link>
                                    )}
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* RIGHT PART (DECORATION) */}
                    <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0 fr-py-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="fr-responsive-img fr-artwork"
                             aria-hidden="true" width="160"
                             height="200" viewBox="0 0 160 200">
                            <use className="fr-artwork-motif"
                                 href="/resources/dsfr/background/ovoid.svg#artwork-motif"></use>
                            <use className="fr-artwork-background"
                                 href="/resources/dsfr/background/ovoid.svg#artwork-background"></use>
                            <g transform="translate(40, 60)">
                                <use className="fr-artwork-decorative"
                                     href="/resources/dsfr/picto/system/technical-error.svg#artwork-decorative"></use>
                                <use className="fr-artwork-minor"
                                     href="/resources/dsfr/picto/system/technical-error.svg#artwork-minor"></use>
                                <use className="fr-artwork-major"
                                     href="/resources/dsfr/picto/system/technical-error.svg#artwork-major"></use>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Erreur;