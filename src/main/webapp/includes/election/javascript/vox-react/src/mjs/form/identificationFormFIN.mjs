import {VoximiusElectorModule} from "../vote_api.mjs";

const electorModule = new VoximiusElectorModule();

function nonceValide(url, prefixeAttendu) {
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
}

$(document).ready(function () {
    $('#openid').submit(function (event) {
        event.preventDefault();

        // Récupération de la clé publique de signature
        const pkKey = electorModule.generateAndStoreSk();

        $.ajax({
            url: 'generatenonce',
            method: 'POST',
            data: {pk: pkKey},
            dataType: 'json',
            global: false,
            cache: false,
            success: function (data) {
                if (data.success) {
                    $.get({
                        url: 'openid_connect_login',
                        success: function (response) {
                            const estValide = nonceValide(response, pkKey);
                            if (estValide) {
                                window.location.href = response;
                            } else {
                                sessionStorage.setItem("erreurId", "ERR-OIDC-002");
                                window.location.reload();
                            }
                        },
                        error: function (error) {
                            let errorMessage = "Erreur lors de la récupération de l'URL de redirection.";

                            if (error.responseJSON && error.responseJSON.message) {
                                errorMessage += error.responseJSON.message;
                            } else if (error.statusText) {
                                errorMessage += `${error.status}: ${error.statusText}`;
                            }

                        }
                    });
                } else {
                    // Recharger la page pour afficher le message d'erreur qui se trouve en session http
                    window.location.reload();
                }
            },
            error: function (error) {
                let errorMessage = "Une erreur s'est produite lors de la communication avec le serveur.";

                if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = error.responseJSON.message;
                } else if (error.statusText) {
                    errorMessage = `Erreur ${error.status}: ${error.statusText}`;
                }
                sessionStorage.setItem("erreurId", "ERR-OIDC-003");
                window.location.reload();
            }
        });
    });

});