import {isLibsodiumInit, voximiusCreateRenewToken} from "./vote_api.mjs"; // "@voxaly/voxsecreta";

// TODO: À supprimer lorsque le parcours de renouvellement du MDP sera refait avec le DSFR

let valid_frag = false;
const data = document.getElementById('modelData');
const renouvellementType = Number(data.dataset.type);
const oId = data.dataset.oid;
const fragPattern = '[\\w\-]{15}';

$(document).ready(function () {
    isLibsodiumInit(); // comment remonter l'erreur (compatibilité navigateur) ?
    $('#passwordInput').on('input', () => checkFragmentFormat());
    $("#captchaDetect").on("input", function () {
        updateSubmitButton();
    });
    updateSubmitButton();
});

function checkFragmentFormat(){
    const input = $('#passwordInput');
    const frag = input.val();
    valid_frag = frag.match(fragPattern);
    if(valid_frag){
        $("#fragment-invalid").css("display", "none");
        $('#autTokenId').val(voximiusCreateRenewToken(oId,frag,renouvellementType));
    } else{
        $("#fragment-invalid").css("display", "block");
    }
    updateSubmitButton();
}

function updateSubmitButton() {
    const captcha = $("#captchaDetect").val();
    $("#btnSub").prop('disabled', !valid_frag || captcha.length !== 4);
}