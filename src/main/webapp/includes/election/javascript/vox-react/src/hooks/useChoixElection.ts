/**
 * Copyright 2025 Voxaly Docaposte
 */

import {AxiosError, AxiosResponse} from "axios";
import {ChoixElectionData} from "../models/pages/choixElection.model";
import {getDataChoixElection} from "../api/choixElection.service";
import {useQuery, UseQueryOptions} from "@tanstack/react-query";

const ENTITY_NAME = 'choix-election';

export const useGetChoixElectionData = (
    config?: Partial<UseQueryOptions<AxiosResponse<ChoixElectionData>, AxiosError>>
) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: () => getDataChoixElection(),
        ...(config || {})
    });

    return {data: data?.data, ...rest};
};