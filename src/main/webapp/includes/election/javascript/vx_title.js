/**
 * Copyright 2025 Voxaly Docaposte
 */

function fermerPage() {
    window.open('/', '_self', '');
    window.close();
}

const pageRenouvellementId = "/pages/renouvellement-id.htm";
const pageRenouvellementMdp = "/pages/renouvellement-mdp.htm";
const pageRenouvellementConfirmationId = "/pages/renouvellement-id-confirmation.htm";
const pageRenouvellementConfirmationMdp = "/pages/renouvellement-mdp-confirmation.htm";
const pageRenouvellementConfirmationIdCode = "/pages/renouvellement-id-confirmation.htm?code";
const pageRenouvellementConfirmationMdpCode = "/pages/renouvellement-mdp-confirmation.htm?code";
const contextPath = document.getElementById('vxTitleData').dataset.path;

function retour() {
    const x = document.referrer;

    //<%--la page accusé reception du duplicata doit fermer l'onglet et non pas juste faire un history.back --%>
    const accrecdupref = contextPath + "/pages/duplicata/search.htm";
    if (x.indexOf(accrecdupref, x.length - accrecdupref.length) > 0) {
        fermerPage();
        return false;
    }

    const page = location.href;
    //Gestion retour pour les pages de renouvellement identifiant et mot de passe
    if (page.includes(pageRenouvellementId) || page.includes(pageRenouvellementMdp)) {
        if (history.length === 1)
            fermerPage();
        else
            window.open('/', '_self', '');
        return false;
    } else if (page.includes(pageRenouvellementConfirmationIdCode)
        || page.includes(pageRenouvellementConfirmationMdpCode)
        || page.includes(pageRenouvellementConfirmationMdp)) {
        window.open('/', '_self', '');
        return false;
    } else if (page.includes(pageRenouvellementConfirmationId)) {
        window.open('/', '_blank', '');
        return false;
    }

    if (x == null || x === '') {
        window.location.assign(contextPath + "/pages/identification");
    } else {
        history.go(-1);
        if (history.length === 1)
            fermerPage();
        return false;
    }
}