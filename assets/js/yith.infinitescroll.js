(function ($, window, document) {
    "use strict";

    $.fn.yit_infinitescroll = function (options) {

        var opts = $.extend({

                nextSelector   : false,
                navSelector    : false,
                itemSelector   : false,
                contentSelector: false,
                maxPage        : false,
                loader         : false,
                is_shop        : false

            }, options),

            loading  = false,
            finished = false,
            desturl  = $( opts.nextSelector ).attr( 'href' ); // init next url

        // validate options and hide std navigation
        if( $( opts.nextSelector ).length && $( opts.navSelector ).length && $( opts.itemSelector ).length && $( opts.contentSelector ).length ) {
            $( opts.navSelector ).hide();
        }
        else {
            // set finished true
            finished = true;
        }

        // set elem columns ( in shop page )
        var first_elem  = $( opts.contentSelector ).find( opts.itemSelector ).first(),
            columns = first_elem.nextUntil( '.first', opts.itemSelector ).length + 1;

        var main_ajax = function () {

            var last_elem   = $( opts.contentSelector ).find( opts.itemSelector ).last();
            // set loader and loading
            if( opts.loader )
                    $( opts.navSelector ).after( '<div class="yith-infs-loader">' + opts.loader + '</div>' );
            loading = true;

            // ajax call
            $.ajax({
                // params
                url         : desturl,
                dataType    : 'html',
                success     : function (data) {

                    var obj  = $( data),
                        elem = obj.find( opts.itemSelector ),
                        next = obj.find( opts.nextSelector );

                    if( next.length ) {
                        desturl = next.attr( 'href' );
                    }
                    else {
                        finished = true;
                    }
                    // recalculate element position
                    if( ! last_elem.hasClass( 'last' ) && opts.is_shop ) {
                        position_elem( last_elem, columns, elem );
                    }

                    elem.css({
                        'opacity':'0'
                    });

                    last_elem.after( elem );

                    $( '.yith-infs-loader' ).remove();

                    $(document).trigger( 'yith_infs_adding_elem' );

                    elem.animate({
                        opacity: 1
                    }, 1000, function() {
                        loading = false;
                    });

                }
            });
        };

        // recalculate element position
        var position_elem = function( last, columns, elem ) {


            var offset  = ( columns - last.prevUntil( '.last', opts.itemSelector ).length ),
                loop    = 0;

            elem.each(function () {

                var t = $(this);
                loop++;

                t.removeClass('first');
                t.removeClass('last');

                if ( ( ( loop - offset ) % columns ) === 0 ) {
                    t.addClass('first');
                }
                else if ( ( ( loop - ( offset - 1 ) ) % columns ) === 0 ) {
                    t.addClass('last');
                }
            });
        };

        // scroll event
        $( window ).on( 'scroll touchstart', function (){
            var t       = $(this),
                offset  = $( opts.itemSelector ).last().offset();

            if ( ! loading && ! finished && t.scrollTop() >= Math.abs( offset.top - ( t.height() - 150 ) ) ) {
                main_ajax();
            }
        });
    }

})( jQuery, window, document );