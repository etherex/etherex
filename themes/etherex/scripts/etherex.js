(function($) {

  // Mobile menu 
  Drupal.settings.mobileToggles = {
    nav: {
      toggle: '#mobile-toggle-menu',
      opposites: '#mobile-toggle-search',
      elements: '#nav, #sidebar-left .inner-content > div',
      container: '#sidebar-right'
    },
    search: {
      toggle: '#mobile-toggle-search',
      opposites: '#mobile-toggle-menu',
      elements: '#nav, #sidebar-left .inner-content > div, #etherex-search-box',
      container: '#sidebar-right'
    }
  };

  Drupal.behaviors.etherex = function(context) {
  
    // // The "Add New Comment" heading will be turned into a toggle to
    // //     open/close the comments
    // $('#comment-form-box #comment-form').hide();

    // $('#comment-form-box .box h2').addClass('closed').bind('click', function() {
    //   var $self = $(this),
    //       $form = $('#comment-form'),
    //       speed = 250;

    //   if ($self.hasClass('open')) {
    //     $self.addClass('transition').removeClass('open');
    //     $form.hide(speed, function() {
    //       $self.addClass('closed').removeClass('transition');
    //     });
    //   }
    //   else {
    //     $self.addClass('transition').removeClass('closed');
    //     $form.show(speed, function() {
    //       $self.addClass('open').removeClass('transition');
    //     });
    //   }
    // });

  };

})(jQuery);