/**
 * Copyright 2025 Voxaly Docaposte
 */

import {AxiosError, AxiosResponse} from "axios";
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from "@tanstack/react-query";
import {getDataVerifierCachet, postVerifierCachet} from "../api/verifierCachet.service";
import {VerifierCachetData, VerifierCachetForm, VerifierCachetResult} from "../models/pages/verifierCachet.model";

const ENTITY_NAME = 'verifier-cachet';

export const useGetVerifierCachetData = (
    cachetServeur?: string,
    config?: Partial<UseQueryOptions<AxiosResponse<VerifierCachetData>, AxiosError>>
) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME, cachetServeur],
        queryFn: () => getDataVerifierCachet(cachetServeur),
        ...(config || {})
    });

    return {data: data?.data, ...rest};
};

export const usePostVerifierCachet = (
    config: UseMutationOptions<AxiosResponse<VerifierCachetResult>, AxiosError, {form: VerifierCachetForm}> = {}
) => {
    return useMutation({
        mutationFn: async ({form}) => postVerifierCachet(form),
        ...config,
    });
};