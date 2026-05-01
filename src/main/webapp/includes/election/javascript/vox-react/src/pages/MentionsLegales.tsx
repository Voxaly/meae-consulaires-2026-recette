/**
 * Copyright 2025 Voxaly Docaposte
 */

import React from "react";
import VoxMain from "../components/VoxMain";
import {getText} from "../utils/utils";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {useGetMentionsLegales} from "../hooks/useMentionsLegales";

const MentionsLegales = () => {

    const {data, isLoading} = useGetMentionsLegales();
    const textes = data?.textes;

    const HtmlText = ({ textKey, textes }: { textKey: string; textes: any }) => {
        const content = getText(textKey, textes);
        return <span dangerouslySetInnerHTML={{ __html: content }} />;
    };

    useDocumentTitle(getText('mentions-legales.titre-onglet', textes));

    if (isLoading) return null;

    return (
        <VoxMain type={"docs"}>
            <h1>{getText('mentions-legales.titre', textes)}</h1>

            {/* Bloc 1 */}
            <h2 className="fr-mt-6w"><HtmlText textKey="mentions-legales.bloc1.titre" textes={textes} /></h2>
            <div className="fr-mt-4w">
                <h3><HtmlText textKey="mentions-legales.bloc1.section1.titre" textes={textes} /></h3>
                <p><HtmlText textKey="mentions-legales.bloc1.section1.texte1" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section1.texte2" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section1.texte3" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section1.texte4" textes={textes} /></p>
            </div>
            <div className="fr-mt-4w">
                <h3><HtmlText textKey="mentions-legales.bloc1.section2.titre" textes={textes} /></h3>
                <p><HtmlText textKey="mentions-legales.bloc1.section2.texte1" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section2.texte2" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section2.texte3" textes={textes} /></p>
            </div>
            <div className="fr-mt-4w">
                <h3><HtmlText textKey="mentions-legales.bloc1.section3.titre" textes={textes} /></h3>
                <p><HtmlText textKey="mentions-legales.bloc1.section3.texte1" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section3.texte2" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section3.texte3" textes={textes} /></p>
            </div>
            <div className="fr-mt-4w">
                <h3><HtmlText textKey="mentions-legales.bloc1.section4.titre" textes={textes} /></h3>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte1" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte2" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte3" textes={textes} /></p>
                <h4><HtmlText textKey="mentions-legales.bloc1.section4.sous-titre1" textes={textes} /></h4>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte4" textes={textes} /></p>
                <h4><HtmlText textKey="mentions-legales.bloc1.section4.sous-titre2" textes={textes} /></h4>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte5" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte6" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte7" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte8" textes={textes} /></p>
                <p><HtmlText textKey="mentions-legales.bloc1.section4.texte9" textes={textes} /></p>
            </div>
            <div className="fr-mt-4w">
                <h3><HtmlText textKey="mentions-legales.bloc1.section5.titre" textes={textes} /></h3>
                <p><HtmlText textKey="mentions-legales.bloc1.section5.texte1" textes={textes} /></p>
            </div>
        </VoxMain>
    )
}

export default MentionsLegales;