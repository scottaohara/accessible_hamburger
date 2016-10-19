;(function ( $, w, doc ) {

  // Enable strict mode
  "use strict";

  // Local object for method references
  var A11yBurger = {};

  // Namespace
  A11yBurger.NS = "A11yBurger";
  A11yBurger.AUTHOR = "Scott O'Hara";
  A11yBurger.VERSION = "1.2.0";
  A11yBurger.LICENSE = "https://github.com/scottaohara/accessible-components/blob/master/LICENSE.md";

  // set base variables
  var $doc = $(document),
      $html = $('html'),
      $body = $('body'),
      $burgerBtn = $('[data-action="open-menu"]'),
      optionalOverlay = false,
      $menu,
      $burgerLabel,
      $currentBurger,
      overlayEl = 'off-screen-menu-overlay',
      $firstFocus,
      $lastFocus;


  // helper function for toggling attribute state
  function toggleState ( el, attrb, onState, offState ) {
    el.attr(attrb, el.attr(attrb) === offState ? onState : offState);
  }


  $.fn.extend({

    a11yBurger: function ( e ) {

      return this.each( function () {

        // ************************************
        // PRE-SETUP
        // if no ID was setup on the menu button
        // because we need IDs for this all to work...
        $burgerBtn.each( function () {

          var $this = $(this);

          if ( !$this[0].hasAttribute('id') ) {

            $this.attr('id', $this.attr('href').split('#')[1] +'__trigger' );

          } // if

        });
        // end PRE-SETUP **********************


        // Now we can target all the potential burger buttons by their
        // ID and finish the setup process
        var id = this.id,
            $self = $('#' + id),
            keyCode,


        setupA11yBurger = function () {

          // there's usually a single hamburger menu, but you never know...
          $burgerBtn.each( function () {

            var $this = $(this),
                $burgerTarget = $this.attr('href').split('#')[1];


            if ( !$doc.find('.'+overlayEl).length ){
              $('#'+$burgerTarget).parent().after('<div class="'+overlayEl+'" />');
            }


            // grab the text from the button label.
            // if a button label doesn't exit, use the word "Navigation"
            if ( $this.find('.btn--menu__label').length ) {
              $burgerLabel = $this.find('.btn--menu__label').text();
            }
            else {
              $burgerLabel = 'Navigation';
            }


            // check burger to see if it triggers an overlay
            if ( $this.attr('data-has-overlay') ) {
              optionalOverlay = true;
            }

            // set up the button's attributes
            $this.attr({
              'aria-controls': $burgerTarget,
              'aria-expanded': 'false',
              'aria-label': 'Open ' + $burgerLabel,
              'aria-live': 'polite',
              'role': 'button'
            });

            return [optionalOverlay, $burgerLabel];

          }); // end .each()

        },


        // Function to toggle (flipping, ha!) the hamburger menu
        flippingBurgers = function ( e ) {

          var $this = $(this);

          // since these are links with an href starting with '#',
          // the end URI gets updated and could cause some jumping
          // depending on the implementation of the menu.
          // Prevent default makes it so that this does not happen,
          // as long as JavaScript is enabled.
          e.preventDefault();


          // toggle a class to the <html> to allow for menu/button
          // transition/restyling via CSS
          $html.toggleClass('menu-is-open');


          // if triggered, the button should relay that
          // it's target is expanded, and since the
          // label will change from "menu" to 'close'
          // politely inform the user that the change
          // has occurred.
          toggleState( $this, 'aria-expanded', 'true', 'false' );
          toggleState( $this, 'aria-label', 'Open ' + $burgerLabel, 'Close ' + $burgerLabel );


          // define the menu based on the aria-controls
          $menu = $( '#'+$this.attr('aria-controls') );


          // set the menu to have a tabindex of -1 so focus
          // can be shifted to it when the menu is expanded
          if ( $this.attr('aria-expanded') === 'true' ) {
            $menu.attr('tabindex', '-1');
          }
          else {
            $menu.removeAttr('tabindex');
          }



          // if there is an overlay, then the document should not
          // be able to be interacted with. This not only means
          // that the focus should be trapped within the menu
          // but also the normal document should no longer be scrollable
          if ( optionalOverlay ) {

            $html.toggleClass('pause-document-scroll');

            // find the first and last links in the menu, which
            // will be needed to trap focus
            $firstFocus = $menu.find('a:first');
            $lastFocus = $menu.find('a:last');

          }


          // when the menu is opened, move focus to the menu container
          // and if the menu is being closed, then return focus to the
          // trigger
          if ( $html.hasClass('menu-is-open') ) {
            $menu.focus();
          }
          else {
            $this.focus();
          }


          // update the predefined variables with the
          return [$menu, $currentBurger, $firstFocus, $lastFocus];

        },


        // setup general keyboard controls for the burger/menu
        kbdTrigger = function ( e ) {

          keyCode = ( e.keyCode ? e.keyCode : e.which );

          switch ( keyCode ) {

            // allow space bar to work as well
            case 32:
              $(e.target).trigger('click');
              break;

          } // switch

        },


        // Close menu with escape key
        escClose = function ( e ) {

          if ( $html.hasClass('menu-is-open') ) {
          keyCode = ( e.keyCode ? e.keyCode : e.which );

            $currentBurger = $burgerBtn.attr('aria-expanded', 'true');

            switch ( keyCode ) {

              // esc
              case 27:
                $doc.find($currentBurger).trigger('click');
                break;

            } // switch

          }

        },


        // clicking outside the menu, when an overlay is open
        // should close the menu.
        outSideClick = function ( e ) {

          if ( $html.hasClass('menu-is-open') && optionalOverlay ) {

            $currentBurger = $burgerBtn.attr('aria-expanded', 'true');

            $doc.find($currentBurger).trigger('click');

          }

        },


        // Restrict focus to the opened navigation
        trapFocus = function ( e ) {

          if ( $html.hasClass('menu-is-open') ) {

          $currentBurger = $burgerBtn.attr('aria-expanded', 'true');

          keyCode = ( e.keyCode ? e.keyCode : e.which );

            if ( keyCode === 9 && !e.shiftKey && $lastFocus.is(':focus') ) {

              e.preventDefault();
              $currentBurger.focus();

            }
            else if ( keyCode === 9 && e.shiftKey && $currentBurger.is(':focus') ) {

              e.preventDefault();
              $lastFocus.focus();

            } // if

          } // if menu-is-open

        };


        setupA11yBurger();

        $doc.on( 'click', '.'+overlayEl, outSideClick );
        $self.on( 'click', flippingBurgers.bind(this) );
        $self.on( 'keydown', kbdTrigger.bind(this) );
        $doc.on( 'keydown', escClose );

        // restrict tab focus on elements only inside menu window
        if ( optionalOverlay ) {
          $body.bind('keydown', trapFocus.bind(this) );
        }

      }); // end: return this.each()

    } // end a11yBurger

  }); // end: $.fn.extend


  $burgerBtn.a11yBurger();


})( jQuery, this, this.document );
