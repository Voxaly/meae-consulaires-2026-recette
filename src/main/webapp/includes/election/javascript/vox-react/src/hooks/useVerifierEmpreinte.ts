/**
 * Copyright 2025 Voxaly Docaposte
 */

import {AxiosError, AxiosResponse} from "axios";
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from "@tanstack/react-query";
import {getDataVerifierEmpreinte, postVerifierEmpreinte} from "../api/verifierEmpreinte.service";
import {VerifierEmpreinteData, VerifierEmpreinteForm, VerifierEmpreinteResult} from "../models/pages/verifierEmpreinte.model";

const ENTITY_NAME = 'verifier-empreinte';

export const useGetVerifierEmpreinteData = (
    empreinte?: string,
    config?: Partial<UseQueryOptions<AxiosResponse<VerifierEmpreinteData>, AxiosError>>
) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME, empreinte],
        queryFn: () => getDataVerifierEmpreinte(empreinte),
        ...(config || {})
    });

    return {data: data?.data, ...rest};
};

export const usePostVerifierEmpreinte = (
    config: UseMutationOptions<AxiosResponse<VerifierEmpreinteResult>, AxiosError, {form: VerifierEmpreinteForm}> = {}
) => {
    return useMutation({
        mutationFn: async ({form}) => postVerifierEmpreinte(form),
        ...config,
    });
};