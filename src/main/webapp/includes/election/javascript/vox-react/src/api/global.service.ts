/**
 * Copyright 2025 Voxaly Docaposte
 */

import axios, {AxiosResponse} from "axios";
import {GlobalData, TokenCSRF} from "../models/global.model";
import {APIInstances, PREFIX_API} from "./config";

export const getDataGlobal = (): Promise<AxiosResponse<GlobalData>> => {
    return axios.get(PREFIX_API + APIInstances.GLOBAL );
}

export const getCsrfToken = (): Promise<AxiosResponse<TokenCSRF>> => {
    return axios.get(PREFIX_API + APIInstances.CSRF);
};