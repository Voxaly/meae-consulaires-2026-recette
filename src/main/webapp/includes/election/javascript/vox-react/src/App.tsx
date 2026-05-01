/**
 * Copyright 2025 Voxaly Docaposte
 */

import {Suspense, useEffect} from "react";
import {createBrowserRouter, Outlet, RouterProvider, useLocation, useNavigate} from "react-router-dom";
import {
    isTunnelDeVote,
    URL_ACCESSIBILITE,
    URL_AVANT_VOTE,
    URL_CHOIX_ELECTION,
    URL_DONNEES_PERSONNELLES,
    URL_ERREUR,
    URL_ERREUR_404,
    URL_IDENTIFICATION,
    URL_MAINTENANCE,
    URL_MENTIONS_LEGALES,
    URL_RECEPISSE_VOTE,
    URL_SELECTION_LEC,
    URL_TUNNEL,
    URL_TUNNEL_CHOIX_CANDIDAT,
    URL_TUNNEL_CHOIX_LISTE,
    URL_TUNNEL_CONFIRM_CANDIDAT,
    URL_TUNNEL_CONFIRM_LISTE,
    URL_TUNNEL_CONFIRM_VOTE,
    URL_VERIFIER_CACHET,
    URL_VERIFIER_EMPREINTE,
    URL_VOTE_CLOS
} from "./config/const";
import {GlobalProvider} from "./contexts/GlobalContext";
import AxiosInterceptor from "./api/axios";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import VoxFooter from "./components/VoxFooter";
import VoxHeader from "./components/VoxHeader";
import VoxSkipLinks from "./components/VoxSkipLinks";
import Identification from "./pages/Identification";
import {useGlobal, useTokenCsrf} from "./hooks/useGlobal";
import useDocumentTitle from "./hooks/useDocumentTitle";
import {getText} from "./utils/utils";
import {EtatScrutin} from "./models/global.model";
import ChoixElection from "./pages/ChoixElection";
import TunnelDeVote from "./pages/TunnelDeVote";
import Erreur from "./pages/Erreur";
import Maintenance from "./pages/Maintenance";
import SelectionLEC from "./pages/SelectionLEC";
import Recepisse from "./pages/Recepisse";
import ConfirmationChoix from "./pages/navigationClient/ConfirmationChoix";
import {ElectionProvider} from "./contexts/ElectionContext";
import ChoixCandidat from "./pages/navigationClient/ChoixCandidat";
import ChoixListe from "./pages/navigationClient/ChoixListe";
import Dispatch from "./pages/navigationClient/Dispatch";
import ConfirmationVote from "./pages/navigationClient/ConfirmationVote";
import {VoxModalLogout} from "./components/VoxModal";
import {useSession} from "./hooks/useSession";
import AutoScrollToTop from "./components/AutoScrollToTop";
import MentionsLegales from "./pages/MentionsLegales";
import DonneesPersonnelles from "./pages/DonneesPersonnelles";
import Accessibilite from "./pages/Accessibilite";
import ModalGestionInactivite from "./components/ModalGestionInactivite";
import DocumentationLayout from "./components/DocumentationLayout";
import VerifierEmpreinte from "./pages/VerifierEmpreinte";
import VerifierCachet from "./pages/VerifierCachet";
import IndexRedirect from "./components/IndexRedirect";


export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense>
                <RouterProvider router={router}/>
            </Suspense>
        </QueryClientProvider>
    );
};


const Root = () => {
    useTokenCsrf();

    const navigate = useNavigate();
    const location = useLocation();

    const {data: sessionData} = useSession();
    const isConnected = sessionData?.authenticated ?? false;
    const {globalData, isLoading, isError} = useGlobal();

    // Si erreur de chargement des données globales, rediriger vers maintenance
    useEffect(() => {
        if (isError || (!isLoading && !globalData)) {
            navigate(URL_MAINTENANCE);
        }
    }, [isError, isLoading, globalData, navigate]);

    // Titre du document seulement si les données sont disponibles
    useDocumentTitle(globalData?.header?.textes ? getText('header.titre', globalData.header.textes) : 'Chargement...')

    // Redirection selon l'état du scrutin
    useEffect(() => {
        if (!isLoading && globalData) {
            if (globalData.common.etatScrutin === EtatScrutin.AVANT_VOTE) {
                document.location.href = URL_AVANT_VOTE;
            } else if (globalData.common.etatScrutin === EtatScrutin.VOTE_CLOS) {
                document.location.href = URL_VOTE_CLOS;
            }
        }
    }, [isLoading, globalData]);

    // Vérification de l'électeur en session
    useEffect(() => {
        if (!isTunnelDeVote(location.pathname)) {
            queryClient.invalidateQueries({queryKey: ['session']});
        }
    }, [location.pathname]);

    // Affichage de la page de maintenance si le scrutin est en maintenance
    if (!isLoading && globalData?.common.etatScrutin === EtatScrutin.MAINTENANCE) {
        return (
            <AxiosInterceptor>
                <GlobalProvider global={globalData!}>
                    <VoxSkipLinks/>
                    <div className="vox-flex-wrapper">
                        <VoxHeader/>
                        <Maintenance/>
                        <VoxFooter textes={globalData!.footer.textes}/>
                    </div>
                </GlobalProvider>
            </AxiosInterceptor>
        );
    }

    if (isLoading || globalData?.common.etatScrutin !== EtatScrutin.EN_COURS) return null;
    else return (
        <AxiosInterceptor>
            <GlobalProvider global={globalData!}>
                <ElectionProvider>
                    <AutoScrollToTop/>
                    <VoxSkipLinks/>
                    <div className="vox-flex-wrapper">
                        <VoxHeader/>
                        <Outlet context={globalData.common}/>
                        <VoxFooter textes={globalData!.footer.textes}/>
                    </div>
                    {isConnected && (
                        <VoxModalLogout/>
                    )}
                    {isConnected &&
                        <ModalGestionInactivite delaiAffichagePopIn={globalData.common.delaiAffichagePopIn * 60}
                                                delaiChoixPopIn={globalData.common.delaiChoixPopIn}
                                                delaisSurcis={globalData.common.delaisSurcis * 60}/>}
                </ElectionProvider>
            </GlobalProvider>
        </AxiosInterceptor>
    )
}

const MaintenanceLayout = () => {
    const {globalData, isLoading} = useGlobal();

    if (isLoading || !globalData) return null;

    return (
        <AxiosInterceptor>
            <GlobalProvider global={globalData}>
                <VoxSkipLinks/>
                <div className="vox-flex-wrapper">
                    <VoxHeader/>
                    <Maintenance/>
                    <VoxFooter textes={globalData.footer.textes}/>
                </div>
            </GlobalProvider>
        </AxiosInterceptor>
    );
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root/>,
        children: [
            {
                index: true,
                element: <IndexRedirect/>,
            },
            {
                path: URL_IDENTIFICATION,
                element: <Identification/>,
            },
            {
                path: URL_SELECTION_LEC,
                element: <SelectionLEC/>
            },
            {
                path: URL_CHOIX_ELECTION,
                element: <ChoixElection/>
            },
            {
                path: URL_ERREUR,
                element: <Erreur type="generic"/>
            },
            {
                path: URL_ERREUR_404,
                element: <Erreur type="404"/>
            },
            {
                path: URL_VERIFIER_EMPREINTE,
                element: <VerifierEmpreinte/>
            },
            {
                path: URL_VERIFIER_CACHET,
                element: <VerifierCachet/>
            },
            {
                element: <TunnelDeVote/>,
                children: [
                    {
                        index: true,
                        path: URL_TUNNEL,
                        element: <Dispatch/>
                    },
                    {
                        path: URL_TUNNEL_CHOIX_CANDIDAT,
                        element: <ChoixCandidat/>
                    },
                    {
                        path: URL_TUNNEL_CONFIRM_CANDIDAT,
                        element: <ConfirmationChoix/>
                    },
                    {
                        path: URL_TUNNEL_CHOIX_LISTE,
                        element: <ChoixListe/>
                    },
                    {
                        path: URL_TUNNEL_CONFIRM_LISTE,
                        element: <ConfirmationChoix/>
                    },
                    {
                        path: URL_TUNNEL_CONFIRM_VOTE,
                        element: <ConfirmationVote/>
                    },
                    {
                        path: URL_RECEPISSE_VOTE,
                        element: <Recepisse/>
                    },
                ],
            },
            {
                path: '*',
                element: <Erreur type="404"/>
            }
        ]

    },
    {
        path: URL_MAINTENANCE,
        element: <MaintenanceLayout/>
    },
    {
        element: <DocumentationLayout/>,
        children: [
            {
                path: URL_ACCESSIBILITE,
                element: <Accessibilite/>
            },
            {
                path: URL_DONNEES_PERSONNELLES,
                element: <DonneesPersonnelles/>
            },
            {
                path: URL_MENTIONS_LEGALES,
                element: <MentionsLegales/>
            }
        ]
    }
]);


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 30, // 30 secondes
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                return !(failureCount >= 1 || error?.response?.status === 404);
            },
        },
    },
});


export default App;