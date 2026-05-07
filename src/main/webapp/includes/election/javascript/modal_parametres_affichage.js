/**
 * Copyright 2025 Voxaly Docaposte
 */

document.addEventListener("DOMContentLoaded", () => {
    const themeRadios = document.querySelectorAll('input[name="themeChoice"]');
    themeRadios.forEach((radio) => {
        radio.addEventListener('change', () => setTheme(radio.value));
    })
})

const dataset = document.getElementById('modalParameterData').dataset;

function setTheme(theme) {
    const themeCssLink = document.getElementById('theme-link');
    const lightModeCss = dataset.path + '/pages/includes/election/css/election.css';
    const darkModeCss  = dataset.path+ '/pages/includes/election/css/election-sombre.css';

    let isDarkMode;

    switch (theme) {
        case 'light':
            themeCssLink.href = lightModeCss;
            isDarkMode = false;
            break;
        case 'dark':
            themeCssLink.href = darkModeCss;
            isDarkMode = true;
            break;
        case 'system':
        default:
            themeCssLink.href = window.matchMedia('(prefers-color-scheme: dark)').matches ? darkModeCss : lightModeCss;
            isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            break;
    }
    document.cookie = 'modeSombre='+dataset.isDark+';path=/pages';
}