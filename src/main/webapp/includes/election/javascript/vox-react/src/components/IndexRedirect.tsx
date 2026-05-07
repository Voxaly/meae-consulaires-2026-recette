/**
 * Copyright 2025 Voxaly Docaposte
 */

import {Navigate} from "react-router-dom";
import {useSession} from "../hooks/useSession";
import {URL_CHOIX_ELECTION, URL_IDENTIFICATION} from "../config/const";

/**
 * Composant de redirection pour la route index (/).
 * Redirige un utilisateur connecté vers la page de choix d'élection,
 * et un utilisateur non connecté vers la page d'identification.
 */
const IndexRedirect = () => {
    const {data: sessionData, isLoading} = useSession({
        staleTime: 0,
    });

    if (isLoading) return null;

    if (sessionData?.authenticated) {
        return <Navigate to={URL_CHOIX_ELECTION} replace/>;
    }

    return <Navigate to={URL_IDENTIFICATION} replace/>;
};

export default IndexRedirect;