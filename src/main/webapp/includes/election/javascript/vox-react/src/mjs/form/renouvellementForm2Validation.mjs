import {isLibsodiumInit, voximiusCreateRenewToken} from "../vote_api.mjs"; // "@voxaly/voxsecreta";

const REGEX_LOGIN_PASSWORD = /^[\w\-]{15}$/;

// Récupération des éléments
const loginInput = document.querySelector('#loginInput');
const loginCheckbox = document.querySelector('#loginInput-show');
const passwordInput = document.querySelector('#passwordInput');
const passwordCheckbox = document.querySelector('#passwordInput-show');
const canalReception = document.querySelector('#canalReception');
const captchaInput = document.querySelector('#captchaDetect');
const btnSubmit = document.querySelector('#submitBtn');

// Initialisation des états
const state = {
    loginInput: !loginInput,
    passwordInput: !passwordInput,
    canalReception: !canalReception,
    captchaDetect: !captchaInput,
}

// Voximius
const autTokenId = document.querySelector('#autTokenId');
const data = document.querySelector('#modelData');
const renouvellementType = Number(data.dataset.type);
const oId = data.dataset.oid;
isLibsodiumInit(); // comment remonter l'erreur (compatibilité navigateur) ?

// Désactivation du bouton Submit
btnSubmit.disabled = true;

// Gestion de l'affichage/masquage des champs login/password
changeInputType(loginInput, loginCheckbox);
changeInputType(passwordInput, passwordCheckbox);

// Gestion des events "input" et "blur" sur les différents champs
onChange(loginInput, 'loginInput', REGEX_LOGIN_PASSWORD);
onChange(passwordInput, 'passwordInput', REGEX_LOGIN_PASSWORD);
onChange(captchaInput, 'captchaDetect', /\d{4}/);
onChangeRadio(canalReception, 'canalReception');
isRadioChecked(canalReception, 'canalReception');
onBlur(loginInput, 'loginInput', REGEX_LOGIN_PASSWORD);
onBlur(passwordInput, 'passwordInput', REGEX_LOGIN_PASSWORD);
onBlur(captchaInput, 'captchaDetect', /\d{4}/);

/**
 * Met à jour le type d'input (text ou password) selon si l'utilisateur coche ou non la case d'affichage
 * @param {HTMLInputElement} inputToUpdate
 * @param {HTMLInputElement} checkbox
 */
function changeInputType(inputToUpdate, checkbox,) {
    if (!inputToUpdate) return;
    checkbox.addEventListener('change', () => inputToUpdate.type = checkbox.checked ? 'text' : 'password');
}

/**
 * Event déclenché quand l'utilisateur modifie le contenu du champ
 * @param {HTMLInputElement} input
 * @param {'loginInput', 'passwordInput', 'captchaDetect'} inputId
 * @param {RegExp} regex
 */
function onChange(input, inputId, regex) {
    if (!input) return;
    input.addEventListener('input', () => {
        state[inputId] = false;

        // On supprime le statut "error" en supprimant l'éventuel message d'erreur affiché
        const parent = input.closest('.fr-input-group');
        const errorElement = parent?.querySelector('.fr-messages-group');
        if (errorElement) errorElement.innerHTML = '';

        state[inputId] = regex.test(input.value);
        updateSubmitButton();

        if (inputId === 'loginInput' && state.loginInput) {
            autTokenId.value = voximiusCreateRenewToken(oId, loginInput.value, renouvellementType);
        }
        if (inputId === 'passwordInput' && state.passwordInput) {
            autTokenId.value = voximiusCreateRenewToken(oId, passwordInput.value, renouvellementType);
        }
    })
}

/**
 * Event déclenché quand l'utilisateur clique sur un bouton radio
 * @param {HTMLInputElement} radioGroup
 * @param {'canalReception'} radioGroupId
 */
function onChangeRadio(radioGroup, radioGroupId) {
    if (!radioGroup) return;
    const radios = radioGroup.querySelectorAll('input[type="radio"]');
    radios.forEach((radio) => {
        radio.addEventListener('input', () => {
            state[radioGroupId] = radio.checked;
            updateSubmitButton();
        })
    })
}

/**
 * On teste une première fois si le bouton radio est checked au chargement de la page
 * @param {HTMLInputElement} radioGroup
 * @param {'canalReception'} radioGroupId
 */
function isRadioChecked(radioGroup, radioGroupId) {
    if (!radioGroup) return;
    const radios = radioGroup.querySelectorAll('input[type="radio"]');
    radios.forEach((radio) => {
        state[radioGroupId] = radio.checked;
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
    if (!input) return;
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
