/**
 * Copyright 2025 Voxaly Docaposte
 */

import axios, {AxiosResponse} from "axios";
import {APIInstances, PREFIX_API} from "./config";
import {AuthenticationStatus} from "../models/global.model";


export const getSession = async (): Promise<AxiosResponse<AuthenticationStatus>> => {
    try {
        const response = await axios.get(PREFIX_API + APIInstances.SESSION);
        return response;
    } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
        throw error;
    }
};