import {VoximiusElectorModule} from "../vote_api.mjs";

const electorModule = new VoximiusElectorModule();
const oId = document.getElementById('modelData').dataset.oid;

// Configuration initiale
const REGEX_VALIDATION = /^[\w\-]{15}$/;

// Initialisation des états
const state = {
    loginInput: false,
    passwordInput: false,
    captchaDetect: false,
}

// Récupération des éléments
const loginInput = document.querySelector('#loginInput');
const passwordInput = document.querySelector('#passwordInput');
const captchaInput = document.querySelector('#captchaDetect');
const loginCheckbox = document.querySelector('#loginInput-show');
const passwordCheckbox = document.querySelector('#passwordInput-show');
const btnSubmit = document.querySelector('#submitBtn');
const autTokenId = document.querySelector('#autTokenId');

// Réinitialisation des champs au chargement
[loginInput, passwordInput, captchaInput].forEach(el => {
    if (el) el.value = ''
});
btnSubmit.disabled = true;

// Gestion de l'affichage/masquage des champs login/password
changeInputType(loginInput, loginCheckbox);
changeInputType(passwordInput, passwordCheckbox);

// Gestion des events "input" et "blur" sur les différents champs
onChange(loginInput, 'loginInput', REGEX_VALIDATION);
onChange(passwordInput, 'passwordInput', REGEX_VALIDATION);
onChange(captchaInput, 'captchaDetect', /\d{4}/);
onBlur(loginInput, 'loginInput', REGEX_VALIDATION);
onBlur(passwordInput, 'passwordInput', REGEX_VALIDATION);
onBlur(captchaInput, 'captchaDetect', /\d{4}/);


/**
 * Met à jour le type d'input (text ou password) selon si l'utilisateur coche ou non la case d'affichage
 * @param {HTMLInputElement} inputToUpdate
 * @param {HTMLInputElement} checkbox
 */
function changeInputType(inputToUpdate, checkbox,) {
    checkbox.addEventListener('change', () => inputToUpdate.type = checkbox.checked ? 'text' : 'password');
}

/**
 * Event déclenché quand l'utilisateur modifie le contenu du champ
 * @param {HTMLInputElement} input
 * @param {'loginInput', 'passwordInput', 'captchaDetect'} inputId
 * @param {RegExp} regex
 */
function onChange(input, inputId, regex) {
    input.addEventListener('input', () => {
        state[inputId] = false;

        // On supprime le statut "error" en supprimant l'éventuel message d'erreur affiché
        const parent = input.closest('.fr-input-group');
        const errorElement = parent?.querySelector('.fr-messages-group');
        if (errorElement) errorElement.innerHTML = '';

        state[inputId] = regex.test(input.value);
        updateSubmitButton();

        // Authentication Token
        if (state[inputId]) {
            autTokenId.value = electorModule.deriveIds(loginInput.value, passwordInput.value, oId);
        }
    })
}

/**
 * Event déclenché quand l'utilisateur clique en dehors du champ -
 * Une erreur est ajoutée si la Regex n'est pas respectée
 * @param {HTMLInputElement} input
 * @param {'loginInput', 'passwordInput', 'captchaDetect'} inputId
 * @param {RegExp} regex
 */
function onBlur(input, inputId, regex) {
    input.addEventListener('blur', () => {
        state[inputId] = regex.test(input.value);
        updateSubmitButton();

        if (!state[inputId]) {
            const parent = input.closest('.fr-input-group');
            const errorElement = parent?.querySelector('.fr-messages-group');

            if (errorElement) {
                // On commence par supprimer les éventuelles anciennes erreurs
                errorElement.innerHTML = '';
                // On ajoute la nouvelle erreur dynamiquement
                const newElement = document.createElement('div');
                if (input.value === '') {
                    newElement.innerText = erreursKeys[inputId].vide;
                } else {
                    newElement.innerText = erreursKeys[inputId].format;
                }
                newElement.setAttribute('id', `${inputId}-errors`);
                newElement.setAttribute('class', 'fr-message fr-message--error');
                newElement.setAttribute('aria-live', 'polite');
                errorElement.appendChild(newElement);
            }
        }
    })
}

/**
 * Actualise l'état du bouton Submit selon la validation des 3 champs
 */
function updateSubmitButton() {
    const currentState = Object.values(state).every(Boolean);
    btnSubmit.disabled = !currentState;
}