/**
 * Copyright 2025 Voxaly Docaposte
 */

import {APIInstances, PREFIX_API} from "./config";
import axios, {AxiosResponse} from "axios";
import {CheckHashBallotError, RecepisseData} from "../models/pages/recepisse.model";
import {throwIfValidationErrors} from "../utils/error.util";

const URL_API = PREFIX_API + APIInstances.RECEPISSE;

export const getDataRecepisse = (): Promise<AxiosResponse<RecepisseData>> => {
    return axios.get(`${URL_API}/data`);
};

export const postCheckHashBallotError = async (form: CheckHashBallotError): Promise<AxiosResponse<any>> => {
    const response = await axios.post(`${PREFIX_API}/verification-hash-bulletin-erreur`, form);
    return throwIfValidationErrors(response);
};
