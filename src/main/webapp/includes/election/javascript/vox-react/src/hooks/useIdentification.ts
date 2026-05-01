/**
 * Copyright 2025 Voxaly Docaposte
 */

import {AxiosError, AxiosResponse} from "axios";
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from "@tanstack/react-query";
import {getDataIdentification, postIdentificationFIN, postIdentificationForm} from "../api/identification.service";
import {IdentificationData, IdentificationFIN, IdentificationForm} from "../models/pages/identification.model";
import {Error} from "../models/error.model";

const ENTITY_NAME = 'identification';

export const useGetIdentification = (config?: Partial<UseQueryOptions<AxiosResponse<IdentificationData>, AxiosError>>) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: () => getDataIdentification(),
        ...(config || {})
    });

    return {data: data?.data, ...rest};
};

export const usePostIdentification = (
    config: UseMutationOptions<AxiosResponse<"generic_vote">, AxiosError<{ errors: Error[] }>, { form: IdentificationForm }> = {}
) => {
    return useMutation({
        mutationFn: async ({form}) => postIdentificationForm(form),
        ...config,
    })
}

export const usePostIdentificationFIN = (
    config: UseMutationOptions<AxiosResponse<IdentificationFIN>,
        AxiosError<{ errors: Error[] }>,
        { data: { pk: string } }> = {}
) => {
    return useMutation({
        mutationFn: async ({data}) => postIdentificationFIN(data),
        ...config,
    })
}