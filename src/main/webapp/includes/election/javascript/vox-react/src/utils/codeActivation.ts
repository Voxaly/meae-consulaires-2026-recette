/**
 * Copyright 2025 Voxaly Docaposte
 */

import axios from "axios";

export async function sendActivationCode(navigateToNextPage: () => void) {
    try {
        const response = await axios.post('/pages/envoiCodeActivationVote');
        const responseText = response.data;
        if (responseText === 'ko') {
            console.log(`envoiCodeActivationVote didn't get an 'ok'`);
        } else {
            navigateToNextPage();
        }
    } catch (error) {
        // Vérification du type d'erreur
        if (axios.isAxiosError(error)) {
            // error est maintenant typé comme AxiosError
            if (error.response?.status === 404) {
                console.log(`envoiCodeActivationVote got a 404`);
            } else {
                alert("Erreur");
            }
        } else {
            // Autre type d'erreur
            console.error('Erreur inattendue:', error);
            alert("Erreur");
        }
    }
}