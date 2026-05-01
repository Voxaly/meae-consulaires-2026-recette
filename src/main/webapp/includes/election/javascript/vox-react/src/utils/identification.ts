/**
 * Copyright 2025 Voxaly Docaposte
 */

export const isNonceValide = (url: string, prefixeAttendu: string) => {
    try {
        const urlObject = new URL(url);
        const nonce = urlObject.searchParams.get("nonce");

        if (nonce) {
            return nonce.startsWith(prefixeAttendu); // Retourne true si valide, false sinon
        } else {
            return false; // Nonce non trouvé
        }
    } catch (error) {
        console.error("Erreur lors de la validation du nonce:", error);
        return false; // Erreur lors de l'extraction
    }
};