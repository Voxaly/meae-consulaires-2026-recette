/**
 * Copyright 2025 Voxaly Docaposte
 */

document.addEventListener('DOMContentLoaded', function () {
    // Récupération de l'erreur en session utilisateur
    const erreurId = sessionStorage.getItem("erreurId");
    // Récupération de l'élément dans lequel l'erreur doit être rendue
    const elementError = document.querySelector('#fin-error');

    if (erreurId && messagesErreur[erreurId] && elementError) {
        // Ajout du message d'erreur dans la bannière
        elementError.textContent = messagesErreur[erreurId];
        // Affichage de la bannière (+ suppression de l'aria-hidden pour les lecteurs d'écran)
        elementError.parentElement.style.display = "block";
        elementError.parentElement.removeAttribute("aria-hidden");
    }
    // Suppression de l'erreur en session utilisateur
    sessionStorage.removeItem("erreurId");
});