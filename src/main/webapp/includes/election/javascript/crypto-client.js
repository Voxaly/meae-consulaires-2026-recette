/**
 * Copyright 2025 Voxaly Docaposte
 */

const cryptoClientDataset = document.getElementById('cryptoClientData').dataset;
let engine;
let timer;
document.addEventListener('DOMContentLoaded', function() {

    function unescape(str){
        const replaced = str.replaceAll('\\"','"');
        return replaced.substring(1, replaced.length-1);
    }

    $(document).ready(function() {

        engine = new JsEncryptionEngine();

        const publicKey = JSON.parse(unescape(cryptoClientDataset.pk));
        const temoinClair = unescape(cryptoClientDataset.temoin);

        engine.init(publicKey);

        const scoreTabs = temoinClair.split(',').map(function (val) {
            return +val;
        });
        try {
            engine.setVote([scoreTabs]);
            checkCryptageFiniPourSendVote();
        } catch (e) {
            clearTimeout(timer);
        }

    });

});
const checkCryptageFiniPourSendVote = function() {
    if (engine.isFinished()) {
        $("#temoin").val(engine.getBallot("").ballot);
        $("#clientInfos").val("temoin:" + $.clientinfos.all());
        $("#subPwdBtn").prop("disabled",false);
        clearTimeout(timer);
    } else {
        timer = setTimeout(function() { checkCryptageFiniPourSendVote(''); }, 500);
        $("#btnSub").prop("disabled",true);
        $("#subPwdBtn").prop("disabled",true);
    }
};