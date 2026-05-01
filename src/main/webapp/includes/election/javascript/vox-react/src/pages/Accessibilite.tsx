/**
 * Copyright 2025 Voxaly Docaposte
 */

import React from "react";
import VoxMain from "../components/VoxMain";
import { getText } from "../utils/utils";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useGetAccessibilite } from "../hooks/useAccessibilite";

const Accessibilite = () => {
    const { data, isLoading } = useGetAccessibilite();
    const textes = data?.textes;

    const HtmlText = ({ textKey, textes }: { textKey: string; textes: any }) => {
        const content = getText(textKey, textes);
        return <span dangerouslySetInnerHTML={{ __html: content }} />;
    };

    useDocumentTitle(getText('accessibilite.titre-onglet', textes));

    if (isLoading) return null;

    return (
        <VoxMain type="docs">
            {/* TITRE */}
            <h1>{getText("accessibilite.titre", textes)}</h1>

            {/* INTRODUCTION */}
            <p className="fr-mt-6w"><HtmlText textKey="accessibilite.intro.texte1" textes={textes} /></p>
            <p><HtmlText textKey="accessibilite.intro.texte2" textes={textes} /></p>

            {/* BLOC 1 - État de conformité */}
            <h2 className="fr-mt-6w">{getText("accessibilite.bloc1.titre", textes)}</h2>
            <p><HtmlText textKey="accessibilite.bloc1.texte1" textes={textes} /></p>
            <h3>{getText("accessibilite.bloc1.sous-titre1", textes)}</h3>
            <p><HtmlText textKey="accessibilite.bloc1.texte2" textes={textes} /></p>

            {/* BLOC 2 - Contenus non accessibles */}
            <h2 className="fr-mt-6w">{getText("accessibilite.bloc2.titre", textes)}</h2>
            <h3>{getText("accessibilite.bloc2.sous-titre1", textes)}</h3>
            <ul dangerouslySetInnerHTML={{ __html: getText("accessibilite.bloc2.texte1.liste", textes) }} />
            <h3>{getText("accessibilite.bloc2.sous-titre2", textes)}</h3>
            <p>{getText("accessibilite.bloc2.texte2", textes)}</p>
            <h3>{getText("accessibilite.bloc2.sous-titre3", textes)}</h3>
            <p>{getText("accessibilite.bloc2.texte3", textes)}</p>

            {/* BLOC 3 - Établissement de cette déclaration d'accessibilité */}
            <h2 className="fr-mt-6w">{getText("accessibilite.bloc3.titre", textes)}</h2>
            <p>{getText("accessibilite.bloc3.texte1", textes)}</p>
            <h3>{getText("accessibilite.bloc3.sous-titre1", textes)}</h3>
            <ul dangerouslySetInnerHTML={{ __html: getText("accessibilite.bloc3.texte2.liste", textes) }} />
            <h3>{getText("accessibilite.bloc3.sous-titre2", textes)}</h3>
            <p><HtmlText textKey="accessibilite.bloc3.texte3" textes={textes} /></p>
            <ul dangerouslySetInnerHTML={{ __html: getText("accessibilite.bloc3.texte4.liste", textes) }} />
            <h3>{getText("accessibilite.bloc3.sous-titre3", textes)}</h3>
            <ul dangerouslySetInnerHTML={{ __html: getText("accessibilite.bloc3.texte5.liste", textes) }} />
            <h3>{getText("accessibilite.bloc3.sous-titre4", textes)}</h3>
            <ul dangerouslySetInnerHTML={{ __html: getText("accessibilite.bloc3.texte6.liste", textes) }} />

            {/* BLOC 4 - Retour d'information et contact */}
            <h2 className="fr-mt-6w">{getText("accessibilite.bloc4.titre", textes)}</h2>
            <p><HtmlText textKey="accessibilite.bloc4.texte1" textes={textes} /></p>
            <ul dangerouslySetInnerHTML={{ __html: getText("accessibilite.bloc4.texte2.liste", textes) }} />

            {/* BLOC 5 - Voies de recours */}
            <h2 className="fr-mt-6w">{getText("accessibilite.bloc5.titre", textes)}</h2>
            <p><HtmlText textKey="accessibilite.bloc5.texte1" textes={textes} /></p>
            <p>{getText("accessibilite.bloc5.texte2", textes)}</p>
            <ul dangerouslySetInnerHTML={{ __html: getText("accessibilite.bloc5.texte3.liste", textes) }} />
        </VoxMain>
    );
};

export default Accessibilite;