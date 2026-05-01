/**
 * Copyright 2025 Voxaly Docaposte
 */

import {EtablissementLEC, SelectionLecData} from "../models/pages/selectionLec.model";
import {getDataSelectionLEC, postSelectionLEC} from "../api/selectionLEC.service";
import {AxiosError, AxiosResponse} from "axios";
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from "@tanstack/react-query";
import {Error} from "../models/error.model";

const ENTITY_NAME = 'selection-lec';

export const useGetSelectionLEC = (config?: Partial<UseQueryOptions<AxiosResponse<SelectionLecData>, AxiosError>>) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: () => getDataSelectionLEC(),
        ...(config || {})
    });

    return {data: data?.data, ...rest};
};

export const usePostSelectionLEC = (
    config: UseMutationOptions<AxiosResponse<string>, AxiosError<{ errors: Error[] }>, { form: EtablissementLEC }> = {}
) => {
    return useMutation({
        mutationFn: async ({form}) => postSelectionLEC(form),
        ...config,
    })
}