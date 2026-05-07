/**
 * Copyright 2025 Voxaly Docaposte
 */

/**
    Gestion des @media query comme pour les css
**/

function redimensionnement() {
  if("matchMedia" in window) { // Détection
    if(window.matchMedia("(max-width: 640px)").matches) {
        hideAllBootstrapTooltip();
    } else {
        showAllBootstrapTooltip();
    }
  }
}

// Fix IE < 9 : Polyfill
window.addEventListener = window.addEventListener || function (e, f) { window.attachEvent('on' + e, f); };

// On lie l'événement resize à la fonction + premier appel
window.addEventListener('resize', redimensionnement, false);

// Exécution de cette même fonction au démarrage pour avoir un retour initial
redimensionnement();


/* ----------------- Details ----------------- */
function showAllBootstrapTooltip() {
    $('[data-bs-toggle="tooltip"]').tooltip();
}
function hideAllBootstrapTooltip() {
    $('[data-bs-toggle="tooltip"]').tooltip('destroy');
}


