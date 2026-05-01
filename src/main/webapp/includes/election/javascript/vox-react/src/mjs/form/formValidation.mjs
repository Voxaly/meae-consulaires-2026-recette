// Ce module JS permet de gérer le comportement dynamique des formulaires


// Gestion des erreurs DSFR
const updateErrorClasses = () => {
    const inputGroups = document.querySelectorAll('.fr-input-group');

    inputGroups.forEach((group) => {
        const hasError = group.querySelector('.fr-message--error') !== null;
        group.classList.toggle('fr-input-group--error', hasError);
    });
};

updateErrorClasses();


const observer = new MutationObserver(() => {
    updateErrorClasses();
})

observer.observe(document.body, {
    childList: true,
    subtree: true,
})