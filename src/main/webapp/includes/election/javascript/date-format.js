/**
 * Copyright 2025 Voxaly Docaposte
 */

$(document).ready(function () {

    // Est lié actuellement avec la propertie 'election.identification.activer.format.date-naissance'
    $('.defi-format').keyup(function(e) {
        // Touche [DEL] / [BACKSPACE]
        if(e.which !== 8 && e.which !== 46) {
            var nb_car = $(this).val().length;

            // On Parcours tous les caractères saisies
            for (var iter = 0; iter < nb_car; iter++) {
                var car = $(this).val().substr(iter, 1)

                // le format attendu est JJ/MM/AAAA
                if ((iter < 2) || (iter >2 && iter < 5) || (iter > 5) ) {
                    if ($.isNumeric(car)  === false) {
                        $(this).val($(this).val().substr(0, iter));
                    }
                }

                // On test les séparateurs
                if ((iter == 2) || (iter == 5)) {
                    // L'utilisateur a saisie un caractère
                    if ($.isNumeric(car)  === false) {
                        // Ce n'est pas le '/' attendu, alors on le remplace
                        if (car !== '/') {
                            var valeur = $(this).val().substr(0, iter) + '/';
                            $(this).val(valeur);
                        }
                    } else {
                        // Si il n'y a pas de séparateur (saisie de chiffre), on le rajoute
                        var valeur = $(this).val().substr(0, iter) + '/' + $(this).val().substr(iter);
                        $(this).val(valeur);
                    }
                }
            }
        }
    });

});