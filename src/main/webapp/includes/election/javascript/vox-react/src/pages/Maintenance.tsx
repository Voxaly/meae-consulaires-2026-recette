/**
 * Copyright 2025 Voxaly Docaposte
 */

import {MAIN_ID} from "../components/VoxMain";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {useGlobal} from "../hooks/useGlobal";
import {getText} from "../utils/utils";

const Maintenance = () => {
    const {globalData} = useGlobal();
    const textes = globalData?.common?.textes;

    useDocumentTitle(getText("maintenance.titre-onglet", textes));

    return (
        <main id={MAIN_ID} role="main">
            <div className="fr-container">
                <div className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
                    <div className="fr-py-0 fr-col-12 fr-col-md-6">
                        <h1>{getText("maintenance.titre", textes)}</h1>
                        <p className="fr-text--lead fr-mb-3w">
                            {getText("maintenance.description", textes)}
                        </p>
                        <p className="fr-text--sm fr-mb-5w" dangerouslySetInnerHTML={{__html: getText("maintenance.aide", textes)}} />
                    </div>
                    <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0 fr-py-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="fr-responsive-img fr-artwork"
                             aria-hidden="true" width="160" height="200" viewBox="0 0 160 200">
                            <use className="fr-artwork-motif" href="/resources/dsfr/background/ovoid.svg#artwork-motif"></use>
                            <use className="fr-artwork-background" href="/resources/dsfr/background/ovoid.svg#artwork-background"></use>
                            <g transform="translate(40, 60)">
                                <use className="fr-artwork-decorative" href="/resources/dsfr/picto/system/technical-error.svg#artwork-decorative"></use>
                                <use className="fr-artwork-minor" href="/resources/dsfr/picto/system/technical-error.svg#artwork-minor"></use>
                                <use className="fr-artwork-major" href="/resources/dsfr/picto/system/technical-error.svg#artwork-major"></use>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Maintenance;