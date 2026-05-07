/**
 * Copyright 2025 Voxaly Docaposte
 */

/**
 * Méthode permettant d'afficher le contenu d'une clé de texte (election-textes.properties)
 * @param key
 * @param textes
 * @param args
 */
export const getText = (key: string, textes?: Record<string, string>, args?: (string | number | undefined)[]): string => {
    if (!textes || !textes[key]) return key;
    if (!args) return textes[key];
    else return textes[key].replace(/\{(\w)\}/g, (m, key) => '' + (args[+key] ?? key));
}

export function navigatorInfos() {
    const infos = [
        (navigator.cookieEnabled ? "cookie" : "nocookie"),
        (navigator.javaEnabled() ? "java" : "nojava"),
        navigator.appCodeName,
        navigator.appName,
        navigator.appVersion,
        navigator.platform,
        navigator.language,
        navigator.userAgent,
    ];
    return infos.join('|').replace(/;/g, ',');
}

export const scrollToTop = () => {
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
}

export const deleteLastCharIfDot = (str: string): string => {
    return str.slice(-1) === "." ? str.substring(0, str.length - 1) : str;
}