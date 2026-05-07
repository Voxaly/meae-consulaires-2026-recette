/**
 * Copyright 2025 Voxaly Docaposte
 */

import SkipLinks, {SkipLinksProps} from "@codegouvfr/react-dsfr/SkipLinks";
import {getText} from "../utils/utils";
import {useGlobal} from "../hooks/useGlobal";

const VoxSkipLinks = () => {
    const {globalData} = useGlobal();

    const links: SkipLinksProps['links'] = [
        {anchor: "#header", label: getText("header.evitement.header", globalData?.header.textes)},
        {anchor: "#content", label: getText("header.evitement.contenu", globalData?.header.textes)},
        {anchor: "#footer", label: getText("header.evitement.footer", globalData?.header.textes)},
    ]

    return (
        <SkipLinks links={links}/>
    );
};

export default VoxSkipLinks;