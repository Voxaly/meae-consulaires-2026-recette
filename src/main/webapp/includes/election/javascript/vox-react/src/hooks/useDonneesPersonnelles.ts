/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useQuery, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError, AxiosResponse} from "axios";
import {DonneesPersonnellesData} from "../models/pages/donneesPersonnelles.model";
import {getDataDonneesPersonnelles} from "../api/donneesPersonnelles.service";

const ENTITY_NAME = 'donnees-personnelles';

export const useGetDonneesPersonnelles = (
    config?: Partial<UseQueryOptions<AxiosResponse<DonneesPersonnellesData>, AxiosError>>
) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: () => getDataDonneesPersonnelles(),
        ...(config || {})
    });
    return {data: data?.data, ...rest};
};