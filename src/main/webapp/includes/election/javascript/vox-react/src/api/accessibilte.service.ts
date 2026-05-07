/**
 * Copyright 2025 Voxaly Docaposte
 */

import {APIInstances, PREFIX_API} from "./config";
import axios, {AxiosResponse} from "axios";
import {AccessibiliteData} from "../models/pages/accessibilite.model";

const URL_API = PREFIX_API + APIInstances.ACCESSIBILITE;

export const getDataAccessibilite = async (): Promise<AxiosResponse<AccessibiliteData>> => {
    return axios.get(`${URL_API}/data`);
};