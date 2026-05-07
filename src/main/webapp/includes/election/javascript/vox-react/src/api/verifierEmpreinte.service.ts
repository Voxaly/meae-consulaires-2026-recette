/**
 * Copyright 2025 Voxaly Docaposte
 */

import axios, {AxiosResponse} from "axios";
import {VerifierEmpreinteData, VerifierEmpreinteForm, VerifierEmpreinteResult} from "../models/pages/verifierEmpreinte.model";
import {APIInstances, PREFIX_API} from "./config";

const URL_API = PREFIX_API + APIInstances.VERIFIER_EMPREINTE;

export const getDataVerifierEmpreinte = (empreinte?: string): Promise<AxiosResponse<VerifierEmpreinteData>> => {
    return axios.get(`${URL_API}/data`, {params: empreinte ? {empreinte} : {}});
};

export const postVerifierEmpreinte = (form: VerifierEmpreinteForm): Promise<AxiosResponse<VerifierEmpreinteResult>> => {
    return axios.post(`${URL_API}/verifier`, form);
};