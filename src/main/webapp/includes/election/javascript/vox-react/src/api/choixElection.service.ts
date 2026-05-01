/**
 * Copyright 2025 Voxaly Docaposte
 */

import {APIInstances, PREFIX_API} from "./config";
import axios, {AxiosResponse} from "axios";
import {ChoixElectionData} from "../models/pages/choixElection.model";

const URL_API = PREFIX_API + APIInstances.CHOIX_ELECTION;

export const getDataChoixElection = (): Promise<AxiosResponse<ChoixElectionData>> => {
    return axios.get(`${URL_API}/data`);
};