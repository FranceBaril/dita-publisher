/*global alert */
function start1() {
   "use strict"; 
   /*****************************************************************************/
   /*** Pop ups *****************************************************************/
   /*****************************************************************************/
   /*** Pop form */
   function popform(req, reqparams, resid, refreshids) {
      $('#pop-std-form').show();
   }
   
   /**************************************************************************/
   /*** Refresh content areas ************************************************/
   /**************************************************************************/
   function displayPresentationSlide(mapid, mapelemid) {
      var params,
      presentationsrc = 'http://localhost:8984/dita/slides/' + mapid + '#/' + mapelemid,
      presframe,
      req = 'get-presentation-frame';
      params = {
         'map-id': mapid, 'map-elem-id': mapelemid
      }
      
      if ($('#fake-frame').html() == undefined) {
         $.get(req, params).done(function (data) {
            // Makes the presentation jump...
            $('#area-presentation').html(data);
         });
      }
      $('#fake-frame').hide();
      $('iframe').attr('src', presentationsrc).load('on', function () {
         // In case hidden by presentation refresh elsewhere
         $('#fake-frame').show();
      });
   }
   
   function displayTopicContent(topicid) {
      var req = 'http://localhost:8984/dita/get-topic-as-div';
      var hashindex = topicid.indexOf('#')
      if (hashindex >= 0) {
         topicid = topicid.substring(0, hashindex -1)
      }
      if (topicid !== undefined) {
         $.post(req, {
            topicid: topicid
         }).done(function (data) {
            //alert( 'Data Loaded: ' + data );
            $('#area-content').children().remove();
            $('#area-content').append(data);
         },
         "string").fail(function (err) {
            alert (err.responseText);
            $('#area-content').children().remove();
         });
      } else {
         $('#area-content').children().remove();
      }
   }
   
   /**************************************************************************/
   /*** Right-click menus ****************************************************/
   /**************************************************************************/
   
   var contextmapid, contextditatopicitem, contextitem, contexttopicid;
   // Menu/title
   $('.presentation .title').off('contextmenu').on('contextmenu', function (event) {
      $('#menucontext-presentation-title').css('left', mouseX - 2);
      $('#menucontext-presentation-title').css('top', mouseY - 2);
      $('#menucontext-presentation-title').show();
      contextmapid = $(this).closest('.presentation,.map').attr('data-map-elem-id');
      contextditatopicitem = $(this).attr('data-map-elem-id');
      contextitem = $(this);
      //contexttopicid = $(this).attr('data-id');
      event.preventDefault();
   });
   // Menu/slideref
   $('.slideref').off('contextmenu').on('contextmenu', function (event) {
      $('#menucontext-slideref').css('left', mouseX - 2);
      $('#menucontext-slideref').css('top', mouseY - 2);
      $('#menucontext-slideref').show();
      contextmapid = $(this).closest('.presentation,.map').attr('data-map-elem-id');
      contextitem = $(this);
      contextditatopicitem = $(this).attr('data-map-elem-id');
      contexttopicid = $(this).attr('data-id');
      event.preventDefault();
   });
   // Menu/topichead/slideset/title
   $('.slideset-title').off('contextmenu').on('contextmenu', function (event) {
      $('#menucontext-slideset-title').css('left', mouseX - 2);
      $('#menucontext-slideset-title').css('top', mouseY - 2);
      $('#menucontext-slideset-title').show();
      contextmapid = $(this).closest('.presentation,.map').attr('data-map-elem-id');
      contextditatopicitem = $(this).attr('data-map-elem-id');
      contextitem = $(this);
      contexttopicid = $(this).attr('data-id');
      event.preventDefault();
   });
   // Menu/topichead/title
   $('.topichead .topicmeta .navtitle').off('contextmenu').on('contextmenu', function (event) {
      $('#menucontext-topichead-title').css('left', mouseX - 2);
      $('#menucontext-topichead-title').css('top', mouseY - 2);
      $('#menucontext-topichead-title').show();
      contextmapid = $(this).closest('.presentation,.map').attr('data-map-elem-id');
      contextditatopicitem = $(this).attr('data-map-elem-id');
      contextitem = $(this);
      contexttopicid = $(this).attr('data-id');
      event.preventDefault();
   });
   // Search result/topic
   $('.search-result-item:has(".dita-topic-item")').off('contextmenu').on('contextmenu', function (event) {
      $('#context-searchres-topic').css('left', mouseX - 2);
      $('#context-searchres-topic').css('top', mouseY - 2);
      $('#context-searchres-topic').show();
      //searchresitem = $(this);
      contexttopicid = $(this).find('.dita-topic-item').attr('data-id');
      event.preventDefault();
   });
   $('.menucontext').off('mouseleave').on('mouseleave', function (event) {
      $(this).hide();
   });
   $('.menucontext-item').off('click').on('click', function (event) {
      //alert('in');
      $(this).closest('.menucontext').hide();
      var req = $(this).attr('data-http-req'),
      refreshids,
      refreshidsattr = $(this).attr('data-refresh-ids'),
      params = {
         'map-id': contextmapid, 'item-id': contextditatopicitem, 'topic-id': contexttopicid
      };
      if (refreshidsattr !== undefined) {
         refreshids = refreshidsattr.split(/[\s,]+/);
      };
      // http-reqs that trigger pop up start with pop-
      // the server and call the equivalent get- item on the server
      if (req.substr(0, 4) == "pop-") {
         //alert('in 2');
         var srvreq = req.replace('pop-', 'get-');
         $.get(srvreq, params).done(function (data) {
            //alert('in 3');
            $('#pop-std-form').find('.modalInside').html(data);
            $('#pop-std-form').show();
            //('#area-navigation').html(data);
            // refreshes content divs
         }).fail(function (err) {
            alert('The operation could not be completed server-side: ' + err.responseText);
         });
         // Present goes to slideshow div.
      } else if (req.substr(0, 8) == "present-") {
         var srvreq = req.replace('present-', 'get-');
         $.get(srvreq, params).done(function (data) {
            if (contexttopicid != undefined) {
               displayTopicContent(contexttopicid);
            }
            $('#area-presentation').html(data);
            setActiveDitaItem(contextitem);
            //('#area-navigation').html(data);
            // refreshes content divs
         }).fail(function (err) {
            alert('The operation could not be completed server-side: ' + err.responseText);
         });
      } else if (req.substr(0, 6) == 'input-') {
         var value = $('[data-map-elem-id=' + contextditatopicitem + ']').html();
         var srvreq = req.replace('input-', 'get-');
         params.value = value;
         //alert('value: ' + value);
         // Surround-item with input field
         var input = $.get(srvreq, params).done(function (data) {
            $('[data-map-elem-id=' + contextditatopicitem + ']').html(data);
            $('[data-map-elem-id=' + contextditatopicitem + ']').focus();
         }).fail(function (err) {
            alert('The operation could not be completed server-side: ' + err.responseText);
         });
      } else {
         /* None pop request just apply the server action*/
         $.get(req, params).done(function (data) {
            $('#area-navigation').html(data);
            // Submit forms from controls to refresh
            if (refreshids !== undefined) {
               $.each(refreshids, function (index, value) {
                  //alert('submitting ' + value);
                  $('#' + value).trigger('submit');
               });
            }
            // refreshes content divs
         }).fail(function (err) {
            alert('The operation could not be completed server-side: ' + err.responseText)
         });
      };
      
      
      
      //$('#area-navigation .active').trigger('click');
      $(this).closest('.menucontent').hide();
   });
   $('.modalInside button').off('click').on('click', function () {
      $('#pop-std-form').hide();
   });
   
   $('.direct-input').focus();
   $('.direct-input').on('keypress', function (event) {
      //alert('key');
      if (event.which == 13) {
         //alert('enter');
         $(this).closest('form').submit();
      }
   });
   $('.direct-input').off('focusout').on('focusout', function (event) {
      //alert('focusout');
      $(this).closest('form').submit();
      
      event.preventDefault();
   });
   
   /**************************************************************************/
   /*** form submission ******************************************************/
   /**************************************************************************/
   /* Doesn't seem to catch forms that it triggers with refresh ids.*/
   $('form').off().on("submit", function (event) {
      //alert('In form');
      var postops = $(this).attr('data-post-ops'),
      req = $(this).attr('data-http-req'),
      res,
      resetinputsattr = $(this).attr('data-reset-inputs'),
      resetinputs,
      resid = $(this).attr('data-res-id'),
      params = $(this).serialize(),
      refreshidsattr = $(this).attr('data-refresh-ids'),
      refreshids;
      if (refreshidsattr !== undefined) {
         refreshids = refreshidsattr.split(/[\s,]+/);
      };
      if (resetinputsattr !== undefined) {
         resetinputs = resetinputsattr.split(/[\s,]+/);
      };
      $.get(req, params).done(function (data) {
         // Reset form
         // Show returned value in result element
         if (resid !== undefined) {
            //alert(resid);
            //alert(data);
            res = $('#' + resid);
            $(res).html(data);
         }
         // for now, works only for text input
         if (resetinputs !== undefined) {
            $.each(resetinputs, function (index, value) {
               $('#' + value).val('');
            });
         }
         // Submit forms from controls to refresh
         if (refreshids !== undefined) {
            $.each(refreshids, function (index, value) {
               //alert('submitting ' + value);
               $('#' + value).trigger('submit');
            });
         }
      });
      
      event.preventDefault();
   });
   
   
   $('#show-slide-form').off().on('submit', function (event) {
      //alert('bof');
      var mapid = $('#area-navigation').find('.presentation').attr('data-map-elem-id'),
      mapelemid;
      if ($('#area-navigation .active').hasClass('navtitle')) {
         mapelemid = $('#area-navigation .active').closest('.topichead').attr('data-map-elem-id');
      } else {
         mapelemid = $('#area-navigation .active').attr('data-map-elem-id');
      };
      //alert(mapid);
      //alert(mapelemid);
      
      displayPresentationSlide(mapid, mapelemid);
      event.preventDefault();
   });
   
   /* Called from within another form... js doesn't seem to work recursively */
   $("#newest-topics,#newest-maps").off().on('submit', function (event) {
      var req = $(this).attr('data-http-req'),
      res,
      resid = $(this).attr('data-res-id'),
      params = $(this).serialize();
      $.get(req, params).done(function (data) {
         // Reset form
         // Show returned value in result element
         if (resid !== undefined) {
            res = $('#' + resid);
            $(res).html(data);
         }
      }).fail(function (err) {
         alert(err.responseText);
      });
      event.preventDefault();
   });
   
   /*** Submit for on radio item selection ***/
   $(".quick-submit").off().on('click', function (event) {
      var form = $(this).closest('form').submit();
   });
   /**************************************************************************/
   /*** dita item click events ********************************************/
   /*******************************************************(******************/
   $('.dita-topic-item').off('click').on('click', function (event) {
      //alert('in click');
      var topicid = $(this).attr('data-id'),
      //req = 'http://localhost:8984/dita/get-topic-as-div',
      mapid = $('#area-navigation').find(".presentation, .map").attr('data-map-elem-id'),
      // Works for item in map, to get the exact item.
      // Will need to search the map when click from search result
      // Will need message when not found in map
      mapelemid;
      if ($(this).hasClass('navtitle')) {
         mapelemid = $(this).closest('.topichead').attr('data-map-elem-id');
      } else {
         mapelemid = $(this).attr('data-map-elem-id');
      };
      
      //$('iframe').attr('src', presentationsrc);
      // Refresh slide view
      //alert('Req ' + req + '&#32;'+ 'http://localhost:8984/dita/slides/' + mapid + '#/' + mapelemid);
      if (topicid != undefined) {
         displayTopicContent(topicid);
      }
      displayPresentationSlide(mapid, mapelemid);
      
      
      //$('#area-navigation, .result-table-std').find('*').removeClass('active');
      //$(this).addClass('active');
      setActiveDitaItem($(this));
      event.preventDefault();
      event.stopPropagation();
      return false;
   });
   
   // Leave after dita-topic-item. This overrides the dita-topic-item click.
   // $('.slideset-title').off('click').on('click', function (event) {
   //    var isClosed = $(this).closest('.slideset').hasClass('closed');
   //$('.slideset').removeClass('opened');
   //$('.slideset').addClass('closed');
   //    if (isClosed) {
   //       $(this).closest('.slideset').removeClass('closed');
   //       $(this).closest('.slideset').addClass('opened');
   //   } else {
   //      $(this).closest('.slideset').removeClass('opened');
   //      $(this).closest('.slideset').addClass('closed');
   //   }
   //   $(this).parent().find('.topic-slides').find('.dita-topic-item').first().trigger('click');
   //});
   
   $('.dita-map-item').off('click').on('click', function () {
      var mapid = $(this).attr('data-id'),
      presentationsrc = 'slides/' + mapid + '#/' + mapid,
      req = 'get-map-as-div';
      // Open map, refresh topic view, refresh slide view, but keep search results as they are.
      // Slide view doesn't work... we'll want to see existing slideset instead any way.
      $('#frame-presentation').attr('src', presentationsrc);
      $.get(req, {
         'map-id': mapid
      }).done(function (data) {
         $('#area-navigation').html(data);
         $('#area-content').children().remove();
      },
      "string");
      //$('#area-navigation, .result-table-std').find('*').removeClass('active');
      //$(this).addClass('active');
      displayPresentationSlide(mapid, mapid);
      setActiveDitaItem($(this));
      event.preventDefault();
   });
   
   function setActiveDitaItem(selected) {
      var resTable = selected.closest('.result-table-std'),
      trAncestor = selected.closest('tr'),
      tds = trAncestor.children('td');
      $('#area-navigation, .result-table-std').find('*').removeClass('active');
      selected.addClass('active');
      if (resTable !== undefined && trAncestor !== undefined) {
         trAncestor.addClass('active');
      }
      $.each(tds, function () {
         if (resTable !== undefined && tds !== undefined) {
            $(this).addClass('active');
         }
      });
   }
   
   /**************************************************************************/
   /*** Search/create tabs ***************************************************/
   /**************************************************************************/
   
   function setTabBlocks() {
      var tabblocks = $('.tabs')
      //$.each('.tab').insertAfter(tabset, '<span>' + $(this).find('.tab-heading') + '</span>')
      
      $.each(tabblocks, function () {
         if ($(this).find('.tab-headings').length === 0) {
            setTabBlock($(this));
         }
      });
   };
   
   function setTabBlock(tabblock) {
      var active,
      tabs = tabblock.find('.tab'),
      tabHeadings = '';
      //alert('tabs: ' + tabs.length);
      $.each(tabs, function () {
         if ($(this).hasClass('active')) {
            active = '&#32;active';
         } else {
            active = '';
         }
         tabHeadings = tabHeadings + '<span class="tab-heading' + active + '" data-tab-id="' + $(this).attr("id") + '">' + $(this).find('h1.tab-heading').html() + '</span>';
      });
      tabblock.prepend('<div class="tab-headings">' + tabHeadings + '</div>');
   };
   
   setTabBlocks();
   
   // Leave after setTabBlocks...
   $('span.tab-heading').off().on('click', function (event) {
      // Toggle content and the tab heading
      var tabid = $(this).attr('data-tab-id');
      $(this).closest('.tab-headings').find('.tab-heading').removeClass('active');
      $(this).addClass('active');
      $(this).closest('.tabs').find('.tab').removeClass('active');
      $('#' + tabid).addClass('active');
   });
   
   /*****************************************************************************/
   /*** Dragging and dropping items *********************************************/
   /*****************************************************************************/
   var dragSrc;
   var action;
   // For drag leave... we don't want topichead dragleave to be triggered by slideref dragleave
   // Trick from : http://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
   
   //$('.topichead').off('dragstart').on('dragstart', function dragStart(e) {
   //   alert('Hi');
   //});
   
   $('.slideref, .slideset, .topichead, .search-result-item .dita-topic-item').off('dragstart').on('dragstart', function dragStart(e) {
      //alert('In dragstart slideref');
      var dragobj;
      //alert ($(this).attr('class'));
      dragobj = $(this);
      dragobj.toggleClass('dragging');
      // if elem id from map... move within the map, else is from search result and we want to add;
      if (dragobj.attr('data-map-elem-id') != undefined) {
         action = 'move-item-in-map';
      } else {
         action = 'add-item-to-map';
      }
      dragSrc = dragobj;
      e.originalEvent.dataTransfer.setData('text/html', $(this));
      e.originalEvent.dataTransfer.effectAllowed = 'move';
      // If slideref, do not also match to ancestor topichead, therefore need stopPropagation!
      e.stopPropagation()
      // Do not prevent event and propagation... it blocks the mode or drop.
   });
   $('.dita-topic-item').off('dragenter').on('dragenter', function (e) {
      // this / e.target is the current hover target.
      // closest class + hasclass seems like a duplication, but it doesn't work without it!
      if (dragSrc.hasClass('topichead') && ($(this).hasClass('topichead') || $(this).closest('.topichead').hasClass('topichead'))) {
         $('.over').toggleClass('over');
         $(this).closest('.topichead').addClass('over');
      } else if (dragSrc.hasClass('topichead') && $(this).hasClass('presentation')) {
         $('.over').toggleClass('over');
         $(this).find('.title').addClass('over');
      } else if (dragSrc.hasClass('slideset') && ($(this).hasClass('slideset') || $(this).closest('.slideset').hasClass('slideset'))) {
         $('.over').toggleClass('over');
         $(this).closest('.slideset').addClass('over');
      } else {
         $('.over').toggleClass('over');
         $(this).addClass('over');
      }
   });
   $('.dita-topic-item, .topichead, .slideset').off('dragover').on('dragover', function (e) {
      if (e.preventDefault) {
         e.preventDefault();
         // Necessary. Allows us to drop.
      }
      e.originalEvent.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.
   });
   
   $('.slideref').off('dragleave').on('dragleave', function (e) {
      // this.classList.remove('over');
      if (dragSrc.hasClass('slideref')) {
         //alert('Remove 1');
         $(this).removeClass('over');
      }
   });
   
   $('.topichead').off('dragleave').on('dragleave', function (e) {
      // Moved to enter .topichead because leave considers entering a child is leaving!!!
   });
   
   $('.dita-topic-item, .topichead').off('dragend').on('dragend', function (e) {
      // this/e.target is the source node.
      $(dragSrc).toggleClass('dragging');
      $('.over').toggleClass('over');
   });
   $('.dita-topic-item, .topichead').off('drop').on('drop', function handleDrop(e) {
      //alert('In drop');
      //alert(dragSrc);
      // this / e.target is current target element.
      // Move item within the map, insert item if from a search result
      var srcmapitem = dragSrc.attr('data-map-elem-id'),
      srcsearchtopicid = dragSrc.attr('data-id'),
      targetmap = $(this).closest('.presentation, .map').attr('data-map-elem-id'),
      targetmapitem = $(this).attr('data-map-elem-id'),
      reqadd = 'add-item-to-map',
      reqmove = 'move-item-in-map',
      paramsadd = {
         'map-id': targetmap, 'topic-id': srcsearchtopicid, 'after-id': targetmapitem
      },
      paramsmove = {
         'map-id': targetmap, 'from-id': srcmapitem, 'to-after-id': targetmapitem
      };
      
      // if (e.stopPropagation) {
      //   e.stopPropagation(); // stops the browser from redirecting.
      // }
      
      // See the section on the DataTransfer object.
      if (action === 'move-item-in-map' & targetmap !== undefined) {
         // move in map model on server
         $.get(reqmove, paramsmove).done(function (data) {
            // refresh from map, will have to send list of collapse element when map can collapse.
            $('#area-navigation').html(data);
         }).fail(function (err) {
            alert('An error occured, the item wasn\'t moved.' + err.responseText);
         });
      } else if (targetmap !== undefined) {
         $.get(reqadd, paramsadd).done(function (data) {
            // refresh from map, will have to send list of collapse element when map can collapse.
            $('#area-navigation').html(data);
            //alert(targetmap + ' ' + $('#area-navigation .active').attr('data-map-elem-id'));
            // open window for slide selection
            var srvreq = 'get-define-slideset-form',
            params = {
               'map-id': targetmap, 'item-id': $('#area-navigation .active').attr('data-map-elem-id')
            };
            $.get(srvreq, params).done(function (data) {
               //alert('in 3');
               displayTopicContent(srcsearchtopicid);
               $('#area-presentation').html(data);
               //setActiveDitaItem(contextitem);
               //('#area-navigation').html(data);
               // refreshes content divs
            }).fail(function (err) {
               alert('The operation could not be completed server-side: ' + err.responseText);
            });
         }).fail(function (err) {
            alert('An error occured, the item wasn\'t added.' + err.responseText);
         })
      } else {
      }
      if (action === 'move-item-in-map') {
         $('#fake-frame').hide();
         $('iframe').attr('src', 'http://localhost:8984/dita/slides/' + targetmap).load('on', function () {
            // refreshes content divs
            $('#area-navigation .active').trigger('click');
         });
      }
      e.stopPropagation();
   });
};