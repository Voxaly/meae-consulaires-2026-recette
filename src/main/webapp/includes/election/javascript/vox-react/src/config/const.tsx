/**
 * Copyright 2025 Voxaly Docaposte
 */

/*
 * Fichier listant toutes les URIs de l'application React
 * Afin d'éviter les URIs en dur, merci de toujours passer par ces constantes
 *
 * Dans le but d'uniformiser, merci de respecter les règles suivantes :
 *    - Pas de majuscules dans le path
 *    - Remplacer les espaces par des tirets (-)
 *    - La constante associée doit être autosuffisante
 */

const contextPath = '/pages'

export const URL_IDENTIFICATION = contextPath + '/identification';
export const URL_SELECTION_LEC = contextPath + '/selection-lec';
export const URL_CHOIX_ELECTION = contextPath + '/choix-election';

export const URL_TUNNEL = contextPath + '/tunnel';
export const URL_TUNNEL_CHOIX_CANDIDAT = contextPath + '/choix-candidat';
export const URL_TUNNEL_CONFIRM_CANDIDAT = contextPath + '/confirmation-candidat';
export const URL_TUNNEL_CHOIX_LISTE = contextPath + '/choix-liste';
export const URL_TUNNEL_CONFIRM_LISTE = contextPath + '/confirmation-liste';
export const URL_TUNNEL_CONFIRM_VOTE = contextPath + '/confirmation-vote';

export const URL_ACCESSIBILITE = contextPath + '/docs/accessibilite';
export const URL_DONNEES_PERSONNELLES = contextPath + '/docs/donnees-personnelles';
export const URL_MENTIONS_LEGALES = contextPath + '/docs/mentions-legales';

export const URL_RECEPISSE_VOTE = contextPath + '/recepisse';

export const URL_MAINTENANCE = contextPath + '/maintenance';
export const URL_ERREUR = contextPath + '/erreur';
export const URL_ERREUR_404 = contextPath + '/erreur-404';

export const URL_VERIFIER_EMPREINTE = contextPath + '/verifier-empreinte';
export const URL_VERIFIER_CACHET = contextPath + '/verifier-cachet';

// URI hors React
export const URL_AVANT_VOTE = contextPath + '/avant-vote.htm'
export const URL_VOTE_CLOS = contextPath + '/vote-clos.htm'

export const isTunnelDeVote = (pathname: string) => {
    return [URL_TUNNEL, URL_TUNNEL_CHOIX_CANDIDAT,URL_TUNNEL_CONFIRM_CANDIDAT, URL_TUNNEL_CHOIX_LISTE, URL_TUNNEL_CONFIRM_LISTE, URL_TUNNEL_CONFIRM_VOTE].includes(pathname)
}