/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useQuery, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError, AxiosResponse} from "axios";
import {getDataAccessibilite} from "../api/accessibilte.service";
import {AccessibiliteData} from "../models/pages/accessibilite.model";

const ENTITY_NAME = 'accessibilite';

export const useGetAccessibilite = (
    config?: Partial<UseQueryOptions<AxiosResponse<AccessibiliteData>, AxiosError>>
) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: () => getDataAccessibilite(),
        ...(config || {})
    });
    return {data: data?.data, ...rest};
};