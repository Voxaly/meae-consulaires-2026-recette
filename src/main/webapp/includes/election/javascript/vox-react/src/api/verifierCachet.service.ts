/**
 * Copyright 2025 Voxaly Docaposte
 */

import axios, {AxiosResponse} from "axios";
import {VerifierCachetData, VerifierCachetForm, VerifierCachetResult} from "../models/pages/verifierCachet.model";
import {APIInstances, PREFIX_API} from "./config";

const URL_API = PREFIX_API + APIInstances.VERIFIER_CACHET;

export const getDataVerifierCachet = (cachetServeur?: string): Promise<AxiosResponse<VerifierCachetData>> => {
    return axios.get(`${URL_API}/data`, {params: cachetServeur ? {cachetServeur} : {}});
};

export const postVerifierCachet = (form: VerifierCachetForm): Promise<AxiosResponse<VerifierCachetResult>> => {
    return axios.post(`${URL_API}/verifier`, form);
};