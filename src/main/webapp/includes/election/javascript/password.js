/**
 * Copyright 2025 Voxaly Docaposte
 */

(function () {
    'use strict';

    $(function () {
        $('.password-input .password-show-button').on('click', function () {

            const $button = $(this);
            const $inputField = $button.closest('.input-field').find('input');

            if ($inputField.attr('type') === 'text') {
                // Passage en mode caché
                $inputField.attr('type', 'password');

                // Gestion des icônes password
                $button.find('#password-see').addClass('d-none').removeClass('d-block');
                $button.find('#password-unsee').addClass('d-block').removeClass('d-none');

                // Gestion des icônes ID
                $button.find('#id-see').addClass('d-none').removeClass('d-block');
                $button.find('#id-unsee').addClass('d-block').removeClass('d-none');
            } else {
                // Passage en mode visible
                $inputField.attr('type', 'text');

                // Gestion des icônes password
                $button.find('#password-unsee').addClass('d-none').removeClass('d-block');
                $button.find('#password-see').addClass('d-block').removeClass('d-none');

                // Gestion des icônes ID
                $button.find('#id-unsee').addClass('d-none').removeClass('d-block');
                $button.find('#id-see').addClass('d-block').removeClass('d-none');
            }
        });
    });
})();