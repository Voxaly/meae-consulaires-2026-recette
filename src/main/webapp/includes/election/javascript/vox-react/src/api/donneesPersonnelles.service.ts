/**
 * Copyright 2025 Voxaly Docaposte
 */

import {APIInstances, PREFIX_API} from "./config";
import axios, {AxiosResponse} from "axios";
import {DonneesPersonnellesData} from "../models/pages/donneesPersonnelles.model";

const URL_API = PREFIX_API + APIInstances.DONNEES_PERSONNELLES;

export const getDataDonneesPersonnelles = async (): Promise<AxiosResponse<DonneesPersonnellesData>> => {
    return axios.get(`${URL_API}/data`);
};