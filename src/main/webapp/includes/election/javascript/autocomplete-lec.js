/**
 * Copyright 2025 Voxaly Docaposte
 */

const label = document.querySelector('label[for="lecInput"]');
const inputIdLec = document.querySelector('#idlecInput');
const input = document.querySelector('#lecInput');
const dropdown = document.querySelector('#autocomplete-results');
const submitBtn = document.querySelector('#submitBtn');
const dataLEC = window.LEC_DATA;

// Création de la liste qui va recevoir les résultats dans le dropdown
const listWrapper = document.createElement("ul");
listWrapper.setAttribute("role", "listbox");
listWrapper.setAttribute("aria-label", label.childNodes[0].textContent.trim() ?? "Suggestions")
listWrapper.setAttribute("tabindex", "-1");


document.addEventListener("DOMContentLoaded", () => {
    // Init DOM
    input.value = '';
    submitBtn.disabled = true;

    // Init RGAA
    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", dropdown.id);
    input.setAttribute("aria-expanded", "false");

    // Gestion du dropdown
    input.addEventListener("focus", (e) => checkForMatches(e))
    input.addEventListener("input", (e) => checkForMatches(e))
});


document.addEventListener("click", (e) => {
    // Gestion du clic en dehors du dropdown
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        closeDropdown();
    }
});

function checkForMatches(e) {
    const value = e.target.value.trim().toLowerCase();

    listWrapper.innerHTML = '';
    input.setAttribute("aria-expanded", "false");

    // Si moins de 3 caractères, on cherche seulement ceux qui commencent par la saisie
    if (value.length < 3) {
        const matches = dataLEC.filter(item =>
            item['nomEtablissement'].toLowerCase().startsWith(value)
        ).sort((a, b) => a['nomEtablissement'].localeCompare(b['nomEtablissement']));

        displayMatches(matches, e);
        return;
    }

    // Si 3 caractères ou plus, appliquer la logique complexe
    const startsWithMatches = dataLEC.filter(item =>
        item['nomEtablissement'].toLowerCase().startsWith(value)
    );

    const containsMatches = dataLEC.filter(item => {
        const name = item['nomEtablissement'].toLowerCase();
        // Inclure l'établissement uniquement si son nom ne commence pas par la valeur recherchée."
        return name.includes(value) && !name.startsWith(value);
    });

    // Combiner les résultats : d'abord ceux qui commencent, puis ceux qui contiennent
    // Chaque groupe est trié alphabétiquement
    const sortedStartsWith = startsWithMatches.sort((a, b) =>
        a['nomEtablissement'].localeCompare(b['nomEtablissement'])
    );

    const sortedContains = containsMatches.sort((a, b) =>
        a['nomEtablissement'].localeCompare(b['nomEtablissement'])
    );

    const matches = [...sortedStartsWith, ...sortedContains];

    displayMatches(matches, e);
}

function displayMatches(matches, e) {
    // Cas "FOCUS" : si le champ contient déjà une LEC valide, on n'affiche pas le dropdown
    if (e.type === "focus") {
        const isExactMatch = matches.some(item => item['nomEtablissement'] === e.target.value);
        if (isExactMatch) return;
    }

    submitBtn.disabled = true;

    matches.forEach((item, index) => {
        const option = document.createElement("li");
        option.textContent = item['nomEtablissement'];
        option.setAttribute("role", "option");
        option.setAttribute("tabindex", index === 0 ? "0" : "-1");
        option.dataset.id = item['idEtablissement'];

        option.addEventListener('click', (e) => selectAnOption(e, item));
        option.addEventListener('keydown', (e) => handleKeyboardNavigation(e, item));

        listWrapper.appendChild(option);
    });

    if (matches.length) {
        input.setAttribute("aria-expanded", "true");
        dropdown.appendChild(listWrapper);
    }
}

function selectAnOption(e, item) {
    input.value = item['nomEtablissement'];

    inputIdLec.value = item['idEtablissement'];

    submitBtn.disabled = false;
    closeDropdown();

    e.preventDefault();
    input.focus();
}


function handleKeyboardNavigation(e, item) {
    const current = e.target;
    const parent = current.parentElement;

    if (!parent) return;

    switch (e.key) {
        case "Enter":
            selectAnOption(e, item)
            break;
        case "Escape":
        case "Tab":
            closeDropdown();
            break;
        case "ArrowDown":
        case "ArrowRight":
            e.preventDefault();
            const next = current.nextElementSibling;
            (next ?? parent.firstElementChild)?.focus();
            break;
        case "ArrowUp":
        case "ArrowLeft":
            e.preventDefault();
            const prev = current.previousElementSibling;
            (prev ?? parent.lastElementChild)?.focus();
            break;
    }
}


function closeDropdown() {
    listWrapper.remove();
    input.setAttribute("aria-expanded", "false");
}