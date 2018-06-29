$(document).ready(() => {
    // Needs to be a function not arrow for whatever reason
    // Add link for all rows to view page
    $('.row').click(function() {
        window.location = '/view?id=' + $(this).attr('id');
    });
});

function passConf() {
    alert("TEST!");
    let pass1 = document.getElementById("pass").value;
    let pass2 = document.getElementById("passConf").value;
    if (pass1 == pass2) {
        alert("Paswords Match!");
    } else {
        document.getElementById("pass1").style.borderColor = "#E34234";
        document.getElementById("pass2").style.borderColor = "#E34234";
        alert("Paswords Don't Match!");
    }
}