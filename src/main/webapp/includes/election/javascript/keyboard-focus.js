/**
 * Copyright 2025 Voxaly Docaposte
 */

 document.body.addEventListener('mousedown', function() {
   document.body.classList.remove('using-keyboard');
 });

 document.body.addEventListener('keydown', function(event) {
   if (event.keyCode === 9) {
     document.body.classList.add('using-keyboard');
   }
 });