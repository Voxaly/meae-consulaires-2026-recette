/**
 * Copyright 2025 Voxaly Docaposte
 */

import {APIInstances, PREFIX_API} from "./config";
import axios, {AxiosResponse} from "axios";
import {MentionsLegalesData} from "../models/pages/mentionsLegales.model";

const URL_API = PREFIX_API + APIInstances.MENTIONS_LEGALES;

export const getDataMentionsLegales = async (): Promise<AxiosResponse<MentionsLegalesData>> => {
    return axios.get(`${URL_API}/data`);
};