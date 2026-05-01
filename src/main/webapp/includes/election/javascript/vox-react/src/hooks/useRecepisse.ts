/**
 * Copyright 2025 Voxaly Docaposte
 */

import {AxiosError, AxiosResponse} from "axios";
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from "@tanstack/react-query";
import {getDataRecepisse, postCheckHashBallotError} from "../api/recepisse.service";
import {CheckHashBallotError, RecepisseData} from "../models/pages/recepisse.model";

const ENTITY_NAME = 'recepisse';

export const useGetRecepisse = (config?: Partial<UseQueryOptions<AxiosResponse<RecepisseData>, AxiosError>>) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: () => getDataRecepisse(),
        ...(config || {})
    });

    return {data: data?.data, ...rest};
};

export const usePostCheckHashBallotError = (
    config: UseMutationOptions<AxiosResponse<any>, AxiosError, { form: CheckHashBallotError }> = {}
) => {
    return useMutation({
        mutationFn: async ({form}) => postCheckHashBallotError(form),
        ...config,
    });
};