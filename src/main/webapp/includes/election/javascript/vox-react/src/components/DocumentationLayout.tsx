/**
 * Copyright 2025 Voxaly Docaposte
 */

import {Outlet} from "react-router-dom";
import VoxHeader from "./VoxHeader";
import VoxFooter from "./VoxFooter";
import {useGlobal} from "../hooks/useGlobal";
import AutoScrollToTop from "./AutoScrollToTop";
import VoxSkipLinks from "./VoxSkipLinks";
import {VoxModalLogout} from "./VoxModal";
import ModalGestionInactivite from "./ModalGestionInactivite";
import {useSession} from "../hooks/useSession";

/**
 * Layout pour les pages de documentation (Mentions légales, Accessibilité, Données personnelles)
 * Ces pages doivent être accessibles indépendamment de l'état du scrutin
 */
const DocumentationLayout = () => {
    const {data: sessionData} = useSession();
    const isConnected = sessionData?.authenticated ?? false;
    const {globalData, isLoading} = useGlobal();

    if (isLoading || !globalData) return null;

    return (
        <>
            <AutoScrollToTop/>
            <VoxSkipLinks/>
            <div className="vox-flex-wrapper">
                <VoxHeader/>
                <Outlet/>
                <VoxFooter textes={globalData.footer.textes}/>
            </div>
            {isConnected && (
                <VoxModalLogout/>
            )}
            {isConnected &&
                <ModalGestionInactivite delaiAffichagePopIn={globalData.common.delaiAffichagePopIn * 60}
                                        delaiChoixPopIn={globalData.common.delaiChoixPopIn}
                                        delaisSurcis={globalData.common.delaisSurcis * 60}/>}
        </>
    );
};

export default DocumentationLayout;
