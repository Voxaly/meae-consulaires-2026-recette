/**
 * Copyright 2025 Voxaly Docaposte
 */

; // Required for Meteor package, the use of window prevents export by Meteor
(function (window) {
    if (window.Package) {
        Materialize = {};
    } else {
        window.Materialize = {};
    }
})(window);
(function() {
    'use strict';

    $(document).ready(function() {

        window.validate_field = function (object) {
            var hasLength = object.attr('data-length') !== undefined;
            var lenAttr = parseInt(object.attr('data-length'));
            var len = object.val().length;

            if (object.val().length === 0 && (!object[0].validity || object[0].validity.badInput === false)) {
                if (object.hasClass('validate')) {
                    object.removeClass('valid');
                    object.removeClass('invalid');
                }
            }
            else {
                if (object.hasClass('validate')) {
                    // Check for character counter attributes
                    if ((object.is(':valid') && hasLength && (len <= lenAttr)) || (object.is(':valid') && !hasLength)) {
                        object.removeClass('invalid');
                        object.addClass('valid');
                    }
                    else {
                        object.removeClass('valid');
                        object.addClass('invalid');
                    }
                }
            }
        };

        // Function to update labels of text fields and select-field
        Materialize.updateTextFields = function () {
            var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], textarea, .input-field.select-field select';
            $(input_selector).each(function (index, element) {
                var $this = $(this);
                if ($(element).val() != null && ($(element).val().length > 0 || element.autofocus || $this.attr('placeholder') !== undefined)) {
                    $this.siblings('label').addClass('active');
                } else if ($(element)[0].validity) {
                    $this.siblings('label').toggleClass('active', $(element)[0].validity.bad === true);
                } else {
                    $this.siblings('label').removeClass('active');
                }
            });
        };

        // Text based inputs and select-field
        var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], textarea, .input-field.select-field select';

        // Add active if form auto complete
        $(document).on('change', input_selector, function () {
            if ($(this).val().length !== 0 || $(this).attr('placeholder') !== undefined) {
                $(this).siblings('label').addClass('active');
            }
            validate_field($(this));
        });

        // Add active if input element has been pre-populated on document ready
        Materialize.updateTextFields();

        // HTML DOM FORM RESET handling
        $(document).on('reset', function (e) {
            var formReset = $(e.target);
            if (formReset.is('form')) {
                formReset.find(input_selector).removeClass('valid').removeClass('invalid');
                formReset.find(input_selector).each(function () {
                    if ($(this).attr('value') === '') {
                        $(this).siblings('label').removeClass('active');
                    }
                });

                // Reset select
                formReset.find('select.initialized').each(function () {
                    var reset_text = formReset.find('option[selected]').text();
                    formReset.siblings('input.select-dropdown').val(reset_text);
                });
            }
        });

        // Add active when element has focus
        $(document).on('focus', input_selector, function () {
            $(this).siblings('label, .prefix').addClass('active');
        });

        $(document).on('blur', input_selector, function () {
            var $inputElement = $(this);
            var selector = ".prefix";

            if ($inputElement.val() == null || $inputElement.val().length === 0 && (!$inputElement[0].validity || $inputElement[0].validity.badInput !== true) && $inputElement.attr('placeholder') === undefined) {
                selector += ", label";
            }

            $inputElement.siblings(selector).removeClass('active');

            validate_field($inputElement);
        });

        // Radio and Checkbox focus class
        var radio_checkbox = 'input[type=radio], input[type=checkbox]';
        $(document).on('keyup.radio', radio_checkbox, function (e) {
            // TAB, check if tabbing to radio or checkbox.
            if (e.which === 9) {
                $(this).addClass('tabbed');
                var $this = $(this);
                $this.one('blur', function (e) {

                    $(this).removeClass('tabbed');
                });
                return;
            }
        });

        // Textarea Auto Resize
        var hiddenDiv = $('.hiddendiv').first();
        if (!hiddenDiv.length) {
            hiddenDiv = $('<div class="hiddendiv common"></div>');
            $('body').append(hiddenDiv);
        }
        var text_area_selector = '.materialize-textarea';

        function textareaAutoResize($textarea) {
            // Set font properties of hiddenDiv

            var fontFamily = $textarea.css('font-family');
            var fontSize = $textarea.css('font-size');
            var lineHeight = $textarea.css('line-height');

            if (fontSize) {
                hiddenDiv.css('font-size', fontSize);
            }
            if (fontFamily) {
                hiddenDiv.css('font-family', fontFamily);
            }
            if (lineHeight) {
                hiddenDiv.css('line-height', lineHeight);
            }

            if ($textarea.attr('wrap') === "off") {
                hiddenDiv.css('overflow-wrap', "normal")
                    .css('white-space', "pre");
            }

            hiddenDiv.text($textarea.val() + '\n');
            var content = hiddenDiv.html().replace(/\n/g, '<br>');
            hiddenDiv.html(content);

            // When textarea is hidden, width goes crazy.
            // Approximate with half of window size

            if ($textarea.is(':visible')) {
                hiddenDiv.css('width', $textarea.width());
            }
            else {
                hiddenDiv.css('width', $(window).width() / 2);
            }

            $textarea.css('height', hiddenDiv.height());
        }

        $(text_area_selector).each(function () {
            var $textarea = $(this);
            if ($textarea.val().length) {
                textareaAutoResize($textarea);
            }
        });

        $('body').on('keyup keydown autoresize', text_area_selector, function () {
            textareaAutoResize($(this));
        });

        // File Input Path (copier/coller du fichier officiel materialize.js)
        $(document).on('change', '.file-field input[type="file"]', function () {
            var file_field = $(this).closest('.file-field');
            var path_input = file_field.find('input.file-path');
            var files = $(this)[0].files;
            var file_names = [];
            for (var i = 0; i < files.length; i++) {
                file_names.push(files[i].name);
            }
            path_input[0].value = file_names.join(', ');
            path_input.trigger('change');
        });

    });

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function offset(elem) {
        var docElem, win,
            box = {top: 0, left: 0},
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(obj) {
        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += (a + ':' + obj[a] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 750,

        show: function(e, element) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            var el = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos         = offset(el);
            var relativeY   = (e.pageY - pos.top);
            var relativeX   = (e.pageX - pos.left);
            var scale       = 'scale('+((el.clientWidth / 100) * 10)+')';

            // Support for touch devices
            if ('touches' in e) {
                relativeY   = (e.touches[0].pageY - pos.top);
                relativeX   = (e.touches[0].pageX - pos.left);
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY+'px',
                'left': relativeX+'px'
            };

            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.className = ripple.className.replace('waves-notransition', '');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale;
            rippleStyle['-moz-transform'] = scale;
            rippleStyle['-ms-transform'] = scale;
            rippleStyle['-o-transform'] = scale;
            rippleStyle.transform = scale;
            rippleStyle.opacity   = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration']    = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration']      = Effect.duration + 'ms';
            rippleStyle['transition-duration']         = Effect.duration + 'ms';

            rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-moz-transition-timing-function']    = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-o-transition-timing-function']      = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['transition-timing-function']         = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function(e) {
            TouchHandler.touchup(e);

            var el = this;
            var width = el.clientWidth * 1.4;

            // Get first ripple
            var ripple = null;
            var ripples = el.getElementsByClassName('waves-ripple');
            if (ripples.length > 0) {
                ripple = ripples[ripples.length - 1];
            } else {
                return false;
            }

            var relativeX   = ripple.getAttribute('data-x');
            var relativeY   = ripple.getAttribute('data-y');
            var scale       = ripple.getAttribute('data-scale');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 350 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function() {
                var style = {
                    'top': relativeY+'px',
                    'left': relativeX+'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                    '-webkit-transform': scale,
                    '-moz-transform': scale,
                    '-ms-transform': scale,
                    '-o-transform': scale,
                    'transform': scale,
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function() {
                    try {
                        el.removeChild(ripple);
                    } catch(e) {
                        return false;
                    }
                }, Effect.duration);
            }, delay);
        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function(elements) {
            for (var a = 0; a < elements.length; a++) {
                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {
                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        continue;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', elementStyle);

                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);
                }
            }
        }
    };


    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {
        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,
        allowEvent: function(e) {
            var allow = true;

            if (e.type === 'touchstart') {
                TouchHandler.touches += 1; //push
            } else if (e.type === 'touchend' || e.type === 'touchcancel') {
                setTimeout(function() {
                    if (TouchHandler.touches > 0) {
                        TouchHandler.touches -= 1; //pop after 500ms
                    }
                }, 500);
            } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
                allow = false;
            }

            return allow;
        },
        touchup: function(e) {
            TouchHandler.allowEvent(e);
        }
    };


    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {
        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentElement !== null) {
            if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
                element = target;
                break;
            } else if ($(target).hasClass('waves-effect')) {
                element = target;
                break;
            }
            target = target.parentElement;
        }

        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {
        var element = getWavesEffectElement(e);

        if (element !== null) {
            Effect.show(e, element);

            if ('ontouchstart' in window) {
                element.addEventListener('touchend', Effect.hide, false);
                element.addEventListener('touchcancel', Effect.hide, false);
            }

            element.addEventListener('mouseup', Effect.hide, false);
            element.addEventListener('mouseleave', Effect.hide, false);
        }
    }

    Waves.displayEffect = function(options) {
        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        if ('ontouchstart' in window) {
            document.body.addEventListener('touchstart', showEffect, false);
        }

        document.body.addEventListener('mousedown', showEffect, false);
    };

    /**
     * Attach Waves to an input element (or any element which doesn't
     * bubble mouseup/mousedown events).
     *   Intended to be used with dynamically loaded forms/inputs, or
     * where the user doesn't want a delegated click handler.
     */
    Waves.attach = function(element) {
        //FUTURE: automatically add waves classes and allow users
        // to specify them with an options param? Eg. light/classic/button
        if (element.tagName.toLowerCase() === 'input') {
            Effect.wrapInput([element]);
            element = element.parentElement;
        }

        if ('ontouchstart' in window) {
            element.addEventListener('touchstart', showEffect, false);
        }

        element.addEventListener('mousedown', showEffect, false);
    };

    window.Waves = Waves;

    document.addEventListener('DOMContentLoaded', function() {
        Waves.displayEffect();
    }, false);



    (function ($) {
      $.fn.collapsible = function(options, methodParam) {
        var defaults = {
          accordion: undefined,
          onOpen: undefined,
          onClose: undefined
        };

        var methodName = options;
        options = $.extend(defaults, options);


        return this.each(function() {

          var $this = $(this);

          var $panel_headers = $(this).find('> li > .collapsible-header');

          var collapsible_type = $this.data("collapsible");

          /****************
          Helper Functions
          ****************/

          // Accordion Open
          function accordionOpen(object) {
            $panel_headers = $this.find('> li > .collapsible-header');
            if (object.hasClass('active')) {
              object.parent().addClass('active');
            }
            else {
              object.parent().removeClass('active');
            }
            if (object.parent().hasClass('active')){
              object.siblings('.collapsible-body').stop(true,false).slideDown({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
            }
            else{
              object.siblings('.collapsible-body').stop(true,false).slideUp({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
            }

            $panel_headers.not(object).removeClass('active').parent().removeClass('active');

            // Close previously open accordion elements.
            $panel_headers.not(object).parent().children('.collapsible-body').stop(true,false).each(function() {
              if ($(this).is(':visible')) {
                $(this).slideUp({
                  duration: 350,
                  easing: "easeOutQuart",
                  queue: false,
                  complete:
                    function() {
                      $(this).css('height', '');
                      execCallbacks($(this).siblings('.collapsible-header'));
                    }
                });
              }
            });
          }

          // Expandable Open
          function expandableOpen(object) {
            if (object.hasClass('active')) {
              object.parent().addClass('active');
            }
            else {
              object.parent().removeClass('active');
            }
            if (object.parent().hasClass('active')){
              object.siblings('.collapsible-body').stop(true,false).slideDown({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
            }
            else {
              object.siblings('.collapsible-body').stop(true,false).slideUp({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
            }
          }

          // Open collapsible. object: .collapsible-header
          function collapsibleOpen(object, noToggle) {
            if (!noToggle) {
              object.toggleClass('active');
            }

            if (options.accordion || collapsible_type === "accordion" || collapsible_type === undefined) { // Handle Accordion
              accordionOpen(object);
            } else { // Handle Expandables
              expandableOpen(object);
            }

            execCallbacks(object);
          }

          // Handle callbacks
          function execCallbacks(object) {
            if (object.hasClass('active')) {
              if (typeof(options.onOpen) === "function") {
                options.onOpen.call(this, object.parent());
              }
            } else {
              if (typeof(options.onClose) === "function") {
                options.onClose.call(this, object.parent());
              }
            }
          }

          /**
           * Check if object is children of panel header
           * @param  {Object}  object Jquery object
           * @return {Boolean} true if it is children
           */
          function isChildrenOfPanelHeader(object) {

            var panelHeader = getPanelHeader(object);

            return panelHeader.length > 0;
          }

          /**
           * Get panel header from a children element
           * @param  {Object} object Jquery object
           * @return {Object} panel header object
           */
          function getPanelHeader(object) {

            return object.closest('li > .collapsible-header');
          }


          // Turn off any existing event handlers
          function removeEventHandlers() {
            $this.off('click.collapse', '> li > .collapsible-header');
          }

          /*****  End Helper Functions  *****/


          // Methods
          if (methodName === 'destroy') {
            removeEventHandlers();
            return;
          } else if (methodParam >= 0 &&
              methodParam < $panel_headers.length) {
            var $curr_header = $panel_headers.eq(methodParam);
            if ($curr_header.length &&
                (methodName === 'open' ||
                (methodName === 'close' &&
                $curr_header.hasClass('active')))) {
              collapsibleOpen($curr_header);
            }
            return;
          }


          removeEventHandlers();


          // Add click handler to only direct collapsible header children
          $this.on('click.collapse', '> li > .collapsible-header', function(e) {
            var element = $(e.target);

            if (isChildrenOfPanelHeader(element)) {
              element = getPanelHeader(element);
            }

            collapsibleOpen(element);
          });


          // Open first active
          if (options.accordion || collapsible_type === "accordion" || collapsible_type === undefined) { // Handle Accordion
            collapsibleOpen($panel_headers.filter('.active').first(), true);

          } else { // Handle Expandables
            $panel_headers.filter('.active').each(function() {
              collapsibleOpen($(this), true);
            });
          }

        });
      };

      $(document).ready(function(){
        $('.collapsible').collapsible();
      });
    }( jQuery ));

})();