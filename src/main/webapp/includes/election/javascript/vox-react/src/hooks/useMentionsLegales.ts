/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useQuery, UseQueryOptions} from "@tanstack/react-query";
import {AxiosError, AxiosResponse} from "axios";
import {getDataMentionsLegales} from "../api/mentionsLegales.service";
import {MentionsLegalesData} from "../models/pages/mentionsLegales.model";

const ENTITY_NAME = 'mentions-legales';

export const useGetMentionsLegales = (
    config?: Partial<UseQueryOptions<AxiosResponse<MentionsLegalesData>, AxiosError>>
) => {
    const {data, ...rest} = useQuery({
        queryKey: [ENTITY_NAME],
        queryFn: () => getDataMentionsLegales(),
        ...(config || {})
    });
    return {data: data?.data, ...rest};
};