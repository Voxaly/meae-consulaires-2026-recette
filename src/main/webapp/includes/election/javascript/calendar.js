/**
 * Copyright 2025 Voxaly Docaposte
 */

$(document).ready(function () {

    var datepickerOptions = {
        dateFormat: 'dd/mm/yy',
        showButtonPanel: true,
        currentText: 'Maintenant',
        closeText: 'OK',
        changeMonth: true,
        changeYear: true,
        firstDay: 1,
        defaultDate: -6575,
        maxDate: "0",
        yearRange: '1899:+0',
        monthNamesShort : [
            'Janvier',
            'F&#233;vrier',
            'Mars',
            'Avril',
            'Mai',
            'Juin',
            'Juillet',
            'Ao&#251;t',
            'Septembre',
            'Octobre',
            'Novembre',
            'D&#233;cembre'
        ],
        minDate: new Date(1899, 1 - 1, 1),
        prevText: "Mois pr&#233;c&#233;dent",
        nextText: "Mois suivant",
        onClose: function (selectedDate) {
            //if($(this).val() == ""){
            //    $(this).val(patternDate);
            //    $(this).css("color", "#B0B6BF");
            //}
            //else {
            //    $(this).css("color", "black");
            //}
        },
        buttonImage: '../includes/election/images/date-picker.gif',
        buttonImageOnly: true,
        buttonText: "Cliquez ici pour entrer votre date de naissance",
        showOn: 'focus'
    };

    // On affecte le datepicker sur une class plutôt que un ID (trop restrictif)
    $('.defi-datepicker').datepicker(datepickerOptions);
    
});