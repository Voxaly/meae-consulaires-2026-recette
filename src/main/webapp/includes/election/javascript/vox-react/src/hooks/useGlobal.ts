/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useQuery, UseQueryOptions} from "@tanstack/react-query";
import {GlobalData, TokenCSRF} from "../models/global.model";
import axios, {AxiosError, AxiosResponse} from "axios";
import {getCsrfToken, getDataGlobal} from "../api/global.service";
import {useOutletContext} from "react-router-dom";

const ENTITY_NAME = 'global';
const BACKEND_URL = 'http://localhost:3000';

export const useGlobal = (config?: Partial<UseQueryOptions<AxiosResponse<GlobalData>, AxiosError>>) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: async () => getDataGlobal(),
        ...(config || {})
    });

    return {globalData: data?.data, ...rest};
};

export const useTokenCsrf = (config?: Partial<UseQueryOptions<AxiosResponse<TokenCSRF>, AxiosError>>) => {
    const {data} = useQuery({
        queryKey: ['csrf'],
        queryFn: () => getCsrfToken(),
        ...(config || {})
    });

    if (data?.data) {
        axios.defaults.headers.post[data.data.headerName] = data.data.token;
    }
    // Toujours envoyer les cookies (JSESSIONID, CSRF) avec les requêtes
    axios.defaults.withCredentials = true;
};

export const useGlobalContext = () => {
    return useOutletContext<GlobalData['common']>();
}