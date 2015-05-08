/*global alert */
$(document).ready(function () {
   "use strict";
   /**************************************************************************/
   /*** Main nav *************************************************************/
   /**************************************************************************/
   $('.nav').off().on('click', function (event) {
      var req = $(this).attr('href');
      // Display page content
      $.get(req).done(function (data) {
         $('.master').html(data);
      });
      // Toggle active tab
      $('.nav').removeClass('active');
      $(this).toggleClass('active');
      
      event.preventDefault();
   });
   
   // Show default tab!
   $('.active').trigger('click');
   
   $('button').off().on('click', function (event) {
      alert('In std-get-form');
      /*var req = $(this).attr('data-http-req'),
      resid = $(this).attr('data-res-id'),
      params = $(this).serialize();
      $.get(req, params)
      .done(function(data){
      // Reset form
      
      // Show returned value in result element
      if (resid !== undefined) {
      res = $('#' + resid);
      $(res).html(data);
      }
      
      });
      
      });*/
      event.preventDefault();
   });
});