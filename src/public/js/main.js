$(document).ready(() => {
    // Needs to be a function not arrow for whatever reason
    // Add link for all rows to view page
    $('.row').click(function() {
        window.location = '/view?id=' + $(this).attr('id');
    });
    $('.col').click(function() {
        console.log(this.innerHTML);
        window.location = '/?order=' + this.innerHTML;
    });
});

function checkPass() {
    let pass1 = document.getElementById("pass").value;
    let pass2 = document.getElementById("passConf").value;
    if (pass1 == pass2) {
        return true;
    } else {
        alert("Paswords Don't Match!");
        return false;
    }
}