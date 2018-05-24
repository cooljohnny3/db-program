$(document).ready(() => {
    // Needs to be a function not arrow for whatever reason
    $('.row').click(function() {
        //console.log($(this).attr('id'));
        window.location = '/view?id=' + $(this).attr('id');
    });
});