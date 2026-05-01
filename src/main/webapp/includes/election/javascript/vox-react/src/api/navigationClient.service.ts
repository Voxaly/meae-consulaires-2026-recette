/**
 * Copyright 2025 Voxaly Docaposte
 */

import axios, {AxiosResponse} from "axios";
import {APIInstances, PREFIX_API} from "./config";
import {CheckCodeActivationForm, CheckCodeActivationResponse, NavigationClientData, SubmitVoteForm} from "../models/pages/navigationClient.model";
import {throwIfValidationErrors} from "../utils/error.util";

const URL_API = PREFIX_API + APIInstances.NAVIGATION_CLIENT;

export const getDataNavigationClient = async (idElection: number): Promise<AxiosResponse<NavigationClientData>> => {
    return axios.get(`${URL_API}/data`, {params: {idElection}});
};

export const postActivationCode = async (): Promise<AxiosResponse<"ok" | "ko">> => {
    const response = await axios.post(`${PREFIX_API}/envoiCodeActivationVote`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });
    return throwIfValidationErrors(response);
};

export const postCheckActivationCode = async (form: CheckCodeActivationForm): Promise<AxiosResponse<CheckCodeActivationResponse>> => {
    const response = await axios.post(`${PREFIX_API}/controleCodeActivationVote`, form);
    return throwIfValidationErrors(response);
};

export const postVote = async (form: SubmitVoteForm): Promise<AxiosResponse<"accuse-reception">> => {
    const response = await axios.post(`${URL_API}/vote`, form);
    return throwIfValidationErrors(response);
};