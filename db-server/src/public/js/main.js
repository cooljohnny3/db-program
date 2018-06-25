$(document).ready(() => {
    // Needs to be a function not arrow for whatever reason
    // Add link for all rows to view page
    $('.row').click(function() {
        window.location = '/view?id=' + $(this).attr('id');
    });
});