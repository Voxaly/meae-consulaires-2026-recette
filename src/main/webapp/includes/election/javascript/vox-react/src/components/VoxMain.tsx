/**
 * Copyright 2025 Voxaly Docaposte
 */

import {ReactNode, useContext} from "react";
import {useGlobalContext} from "../hooks/useGlobal";
import {ElectionContext} from "../contexts/ElectionContext";

interface VoxMainProps {
    type?: "page" | "choixElection" | "tunnelDeVote" | "colonne" | "docs";
    children: ReactNode;
}

interface LayoutProps {
    children: ReactNode;
}

export const MAIN_ID = "content";

/**
 * Composant qui retourne la structure du <main> selon le type de page :
 * - "page" = layout par défaut, pleine largeur sur fond blanc
 * - "choixElection" = layout dédié à la page "Vos élections"
 * - "tunnelDeVote" = fond gris avec container blanc
 * - "colonne" = formulaire de connexion ou sélection de LEC
 */
const VoxMain = (props: VoxMainProps) => {
    const {type = "page", children} = props;

    if (type === "choixElection") {
        return (
            <LayoutChoixElection>
                {children}
            </LayoutChoixElection>
        )
    }
    if (type === "docs") {
        return (
            <LayoutDocs>
                {children}
            </LayoutDocs>
        );
    }
    if (type === "tunnelDeVote") {
        return (
            <LayoutTunnelDeVote>
                {children}
            </LayoutTunnelDeVote>
        );
    } else if (type === "colonne") {
        return (
            <LayoutColonne>
                {children}
            </LayoutColonne>
        );
    } else {
        return (
            <LayoutPage>
                {children}
            </LayoutPage>
        );
    }
};

const LayoutPage = ({children}: LayoutProps) => {
    return (
        <main id={MAIN_ID} role="main">
            <div className="fr-container">
                <div
                    className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
                    <div className="fr-py-0 fr-col-12 fr-col-md-6">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
};

const LayoutColonne = ({children}: LayoutProps) => {
    return (
        <main id={MAIN_ID} role="main">
            <div className="fr-container fr-py-7w">
                <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
};

const LayoutDocs = ({children}: LayoutProps) => {
    return (
        <main id={MAIN_ID} role="main">
            <div className="fr-container fr-py-7w">
                <div className="fr-grid-row">
                    <div className="fr-col-12">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
};

const LayoutTunnelDeVote = ({children}: LayoutProps) => {
    const global = useGlobalContext();
    const {election} = useContext(ElectionContext);

    return (
        <main id={MAIN_ID} role="main" className="fr-background-alt--grey">
            <div className="fr-container">
                <div
                    className="fr-my-3w fr-my-md-7w fr-my-lg-7w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
                    <div className="fr-py-0 fr-col-12 fr-col-md-10">
                        <h1 className="fr-h2 fr-mb-1w">{global.nomOperation}</h1>
                        <p className="fr-text--lead fr-mb-5w">{election?.name}</p>
                        <div
                            className="fr-container fr-background-default--grey fr-px-2w fr-px-md-13w fr-py-5w fr-py-md-7w">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

const LayoutChoixElection = ({children}: LayoutProps) => {
    return (
        <main id={MAIN_ID} role="main">
            <div className="fr-container">
                <div
                    className="fr-my-3w fr-my-md-7w fr-my-lg-7w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
                    <div className="fr-py-0 fr-col-12 fr-col-md-10">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default VoxMain;