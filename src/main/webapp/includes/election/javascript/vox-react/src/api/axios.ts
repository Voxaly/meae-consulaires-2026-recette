/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useNavigate} from 'react-router-dom'
import axios from "axios";
import {useContext, useEffect, useState} from "react";
import {URL_ERREUR} from "../config/const";
import {LoaderContext} from "../contexts/LoaderContext";

const AxiosInterceptor = ({children}: any) => {
    const navigate = useNavigate();
    const loader = useContext(LoaderContext);
    const [redirect, setRedirect] = useState("");
    const [forceReload, setForceReload] = useState(false);

    // Fonction gérant les résultats de requêtes SANS erreurs
    const resInterceptor = (response: any) => {
        if (response.status === 302) {
            return Promise.reject("A redirection has been asked");
        } else {
            setRedirect("");
            return response;
        }
    };

    // Fonction gérant les résultats de requêtes AVEC erreurs
    const errInterceptor = (error: any) => {
        if (error.response.status === 303) {
            if (error.response.data.redirection) {
                setRedirect(error.response.data.redirection)
            }
        }
        // Gestion du 401 (blocage après 5 tentatives échouées)
        // On force le rechargement complet pour récupérer un nouveau token CSRF
        if (error.response.status === 401) {
            if (error.response.data.redirect) {
                // Stocker l'erreur dans sessionStorage pour la récupérer après le rechargement
                if (error.response.data.error) {
                    sessionStorage.setItem('redirectError', JSON.stringify({
                        message: error.response.data.error,
                        args: error.response.data.errorArgs || []
                    }));
                }
                setRedirect(error.response.data.redirect)
                setForceReload(true)
            }
        }
        if (error.response.status === 404 || error.response.status === 500) {
            setRedirect(URL_ERREUR);
        }
        return Promise.reject(error);
    };

    useEffect(() => {
        if (redirect !== "") {
            if (redirect.endsWith("erreur")) {
                navigate(URL_ERREUR);
            } else if (forceReload) {
                // Rechargement complet pour récupérer un nouveau token CSRF après invalidation de session
                window.location.href = redirect;
            } else {
                navigate(redirect);
            }
        }
    }, [redirect, navigate, forceReload]);

    axios.interceptors.response.use(resInterceptor, errInterceptor);

    axios.interceptors.request.use(
        function (successfulReq) {
            // All status between 200 and 302 are considered as ok
            successfulReq.validateStatus = (status) => status >= 200 && status <= 302;
            // On lance le loader lorsqu'une requête http GET est effectuée
            if (successfulReq.method === "get") loader.setLoading(true);
            return successfulReq;
        },
        function (error) {
            return Promise.reject(error);
        }
    );

    return children;
};

export default AxiosInterceptor;
