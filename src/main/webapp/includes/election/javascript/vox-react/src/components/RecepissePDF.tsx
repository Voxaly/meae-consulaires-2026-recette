/**
 * Copyright 2025 Voxaly Docaposte
 */

import {PdfGeneratorService} from "../outil/pdf/pdf-generator";
import React, {useEffect, useState} from "react";
import {getText} from "../utils/utils";
import {RecepisseData} from "../models/pages/recepisse.model";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import {extractHashFromStamp} from "../mjs/vote_api.mjs";
import {usePostCheckHashBallotError} from "../hooks/useRecepisse";

interface RecepissePDFProps {
    nomOperation: string;
    dataRecepisse: RecepisseData | undefined;
}

interface HashError {
    date?: string;
    sessionHash?: string;
    serveurHash?: string;
    message?: string;
}

const RecepissePDF = (props: RecepissePDFProps) => {
    const {nomOperation, dataRecepisse} = props;

    const [hashError, setHashError] = useState<HashError | null>(null);

    const {mutate: checkHashBallotError} = usePostCheckHashBallotError();

    const onClickDownloadPdf = async () => {
        try {
            const pdfGenerator = new PdfGeneratorService();
            await pdfGenerator.generateRecepissePdf();
        } catch (err) {
            console.error('Erreur lors de la génération du PDF', err);
        }
    };

    useEffect(() => {
        const cachetServeur = dataRecepisse?.cachetBulletin.substring(1);
        const sessionHash = sessionStorage.getItem('HashClient');

        if (!sessionHash || sessionHash.trim() === '') {
            setHashError({
                message: getText('election.accuse-reception.texte.reference-bulletin-non-recuperable', dataRecepisse?.textes)
            });
            return;
        }

        const hashServeur = extractHashFromStamp(cachetServeur);

        if (hashServeur !== sessionHash) {
            const now = new Date();
            const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

            setHashError({
                date: dateStr,
                sessionHash,
                serveurHash: hashServeur,
            });

            checkHashBallotError({
                form: {
                    hashClient: sessionHash,
                    hashServer: hashServeur,
                    dateErreur: dateStr,
                }
            });
        }
    }, [])

    useEffect(() => {
        (window as any).textesPdf = {
            titreOperationTour: nomOperation,
            titreBulletin: getText('accuse.titre.bulletin', dataRecepisse?.textes),
            texteBulletin: getText('accuse.texte.bulletin', dataRecepisse?.textes),
            signatureBulletin: getText('accuse.bulletin.signature', dataRecepisse?.textes),
            cachetBulletin: dataRecepisse?.cachetBulletin,
            verifierCachetLien: "https://www.verifiabilites.lumiglobal.fr/#/verify/consulaires?cachetServeur=",
            cliquezIci: getText('accuse.cliquer-ici', dataRecepisse?.textes),
            logoCachet: dataRecepisse?.cachetIconeBase64,
            logoClient: dataRecepisse?.clientIcone,
            logoVote: dataRecepisse?.voteIconeBase64,
            controleBulletin: getText('accuse.bulletin.controle', dataRecepisse?.textes),
            controleCachet: getText('accuse.cachet.controle', dataRecepisse?.textes),
            texteAttention: getText('accuse.texte.attention', dataRecepisse?.textes),
        };
    }, [])

    return (
        <>
            {hashError && (
                <div className="fr-alert fr-alert--error fr-mb-4w" role="alert">
                    <p>{hashError.message ?? getText('recepisse.erreur-verification', dataRecepisse?.textes)}</p>
                    {hashError.date && (
                        <div className="error stronger">
                            <p>Date : {hashError.date}</p>
                            <p>Empreinte navigateur : {hashError.sessionHash}</p>
                            <p>Empreinte serveur : {hashError.serveurHash}</p>
                        </div>
                    )}
                </div>
            )}
            <Tile
                imageUrl="/resources/dsfr/picto/document/document.svg"
                start={<Badge>{getText('recepisse.document.tag', dataRecepisse?.textes)}</Badge>}
                title={getText('recepisse.document.titre', dataRecepisse?.textes)}
                desc={getText('recepisse.document.attention', dataRecepisse?.textes)}
                detail={getText('recepisse.document.details', dataRecepisse?.textes)}
                orientation="horizontal"
                imageSvg
                downloadButton
                buttonProps={{onClick: onClickDownloadPdf}}
            />
        </>
    );
};

export default RecepissePDF;