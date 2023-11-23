$(function(){
   let header = $('#header_inner')
   let headerH = header.innerHeight()


   let scrollPos = $(window).scrollTop();


   $(window).on('scroll load resize', function() {
    scrollPos = $(this).scrollTop()
    if(scrollPos>headerH){
        header.addClass('fixed')
    }  
    else{
        header.removeClass('fixed')
    }

    });



});