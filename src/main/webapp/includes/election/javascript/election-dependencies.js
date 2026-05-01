/**
 * Copyright 2025 Voxaly Docaposte
 */

/**
 * JS permettant la génération du fichier "vendors.bundle.js".
 * Ce fichier ne contient que les librairies utilisées sur toutes les pages électeur
 * Pour ajouter une nouvelle librairie :
 * - Ajouter la librairie au fichier "package.json" (sous "dependencies") => nécessite un build maven du projet web
 * - Ajouter "require(librairie)" dans ce fichier
 */

// JS
window.jQuery = window.$ = require('jquery');
require('jquery/dist/jquery.min');
require('../../libs/jquery.clientinfos/jquery.clientinfos.js');

// CSS
// require('jquery-ui-dist/jquery-ui.css');
require('bootstrap/dist/css/bootstrap.css');

// Images
require("jquery-ui-dist/images/ui-icons_444444_256x240.png");
require("jquery-ui-dist/images/ui-icons_555555_256x240.png");
require("jquery-ui-dist/images/ui-icons_777620_256x240.png");
require("jquery-ui-dist/images/ui-icons_777777_256x240.png");
require("jquery-ui-dist/images/ui-icons_cc0000_256x240.png");
require("jquery-ui-dist/images/ui-icons_ffffff_256x240.png");