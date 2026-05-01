/**
 * Copyright 2025 Voxaly Docaposte
 */

import {AxiosError, AxiosResponse} from "axios";
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from "@tanstack/react-query";
import {
    getDataNavigationClient,
    postActivationCode,
    postCheckActivationCode,
    postVote
} from "../api/navigationClient.service";
import {
    CheckCodeActivationForm,
    CheckCodeActivationResponse,
    NavigationClientContext,
    NavigationClientData,
    SubmitVoteForm,
} from "../models/pages/navigationClient.model";
import {useOutletContext} from "react-router-dom";
import {Error} from "../models/error.model";

const ENTITY_NAME = 'navigation-client';

export const useGetNavigationClient = (
    idElection: number,
    config?: Partial<UseQueryOptions<AxiosResponse<NavigationClientData>, AxiosError>>
) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME, idElection],
        queryFn: () => getDataNavigationClient(idElection),
        refetchOnMount: false,
        refetchOnReconnect: false,
        ...(config || {})
    });

    return {data: data?.data, ...rest};
};

export const useNavigationClientContext = () => {
    return useOutletContext<NavigationClientContext>();
};

export const usePostCodeActivation = (
    config: UseMutationOptions<AxiosResponse<"ok" | "ko">, AxiosError> = {}
) => {
    return useMutation({
        mutationFn: async () => postActivationCode(),
        ...config,
    });
};

export const usePostCheckCodeActivation = (
    config: UseMutationOptions<AxiosResponse<CheckCodeActivationResponse>,
        AxiosError<{ errors: Error[] }>,
        { form: CheckCodeActivationForm }> = {}
) => {
    return useMutation({
        mutationFn: async ({form}) => postCheckActivationCode(form),
        ...config,
    });
};

export const usePostVote = (
    config: UseMutationOptions<AxiosResponse<"accuse-reception">,
        AxiosError<{ errors: Error[] }>,
        { form: SubmitVoteForm }> = {}
) => {
    return useMutation({
        mutationFn: async ({form}) => postVote(form),
        ...config,
    });
};