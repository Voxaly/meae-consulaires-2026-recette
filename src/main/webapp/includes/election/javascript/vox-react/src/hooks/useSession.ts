/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useQuery, UseQueryOptions} from "@tanstack/react-query";
import {getSession} from "../api/session.service";
import {AxiosError, AxiosResponse} from "axios";
import {AuthenticationStatus} from "../models/global.model";

export const useSession = (config?: Partial<UseQueryOptions<AxiosResponse<AuthenticationStatus>, AxiosError>>) => {
    const {data, ...rest} = useQuery({
        queryKey: ['session'],
        queryFn: async () => getSession(),
        ...(config || {})
    });
    return {data: data?.data, ...rest};
};