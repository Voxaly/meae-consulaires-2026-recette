/**
 * Copyright 2025 Voxaly Docaposte
 */

import axios, {AxiosResponse} from "axios";
import {IdentificationData, IdentificationFIN, IdentificationForm} from "../models/pages/identification.model";
import {APIInstances, PREFIX_API} from "./config";
import {throwIfValidationErrors} from "../utils/error.util";

const URL_API = PREFIX_API + APIInstances.IDENTIFICATION;

export const getDataIdentification = (): Promise<AxiosResponse<IdentificationData>> => {
    return axios.get(`${URL_API}/data`);
};

export const postIdentificationForm = async (form: IdentificationForm): Promise<AxiosResponse<"generic_vote">> => {
    const response = await axios.post(URL_API, form);
    return throwIfValidationErrors(response);
};

export const postIdentificationFIN = async (data: { pk: string }): Promise<AxiosResponse<IdentificationFIN>> => {
    const response = await axios.post(`/pages/generatenonce`, data, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    });
    return throwIfValidationErrors(response);
};

export const getOpenIdConnectLoginURL = (): Promise<AxiosResponse<string>> => {
    return axios.get(`/pages/openid_connect_login`);
}