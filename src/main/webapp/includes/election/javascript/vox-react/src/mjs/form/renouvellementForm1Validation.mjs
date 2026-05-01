const REGEX_NUMIC = new RegExp(regex.numicInput);
const REGEX_EMAIL = /^[a-zA-Z0-9!#$%&'*+\/=?^`_{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@[a-zA-Z0-9]+[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

// Initialisation des états
const state = {
    numicInput: false,
    emailInput: false,
    captchaDetect: false,
}

// Récupération des éléments
const numicInput = document.querySelector('#numicInput');
const emailInput = document.querySelector('#emailInput');
const captchaInput = document.querySelector('#captchaDetect');
const btnSubmit = document.querySelector('#submitBtn');

// Désactivation du bouton Submit
setTimeout(() => {
    state.numicInput = REGEX_NUMIC.test(numicInput.value);
    state.emailInput = REGEX_EMAIL.test(emailInput.value);
    state.captchaDetect = /^\d{4}$/.test(captchaInput.value);
    updateSubmitButton();
}, 0);

// Gestion des events "input" et "blur" sur les différents champs
onChange(numicInput, 'numicInput', REGEX_NUMIC);
onChange(emailInput, 'emailInput', REGEX_EMAIL);
onChange(captchaInput, 'captchaDetect', /\d{4}/);
onBlur(numicInput, 'numicInput', REGEX_NUMIC);
onBlur(emailInput, 'emailInput', REGEX_EMAIL);
onBlur(captchaInput, 'captchaDetect', /\d{4}/);

/**
 * Event déclenché quand l'utilisateur modifie le contenu du champ
 * @param {HTMLInputElement} input
 * @param {'numicInput', 'emailInput', 'captchaDetect'} inputId
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
    })
}

/**
 * Event déclenché quand l'utilisateur clique en dehors du champ -
 * Une erreur est ajoutée si la Regex n'est pas respectée
 * @param {HTMLInputElement} input
 * @param {'numicInput', 'emailInput', 'captchaDetect'} inputId
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
 * Actualise l'état du bouton Submit selon la validation des champs
 */
function updateSubmitButton() {
    const currentState = Object.values(state).every(Boolean);
    btnSubmit.disabled = !currentState;
}
