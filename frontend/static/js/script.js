$(document).ready(function() {

    $("#revealLogin").click(function() {
        $("#loginPopup").show();
        $("#loginPopup").animate({top: "0%"}, 200);
        $(".hidePopup").show();
        $(".hidePopup").animate({top: "2%"}, 200);
	});
    
    $("#revealSignup").click(function() {
        $("#signupPopup").show();
        $("#signupPopup").animate({top: "0%"}, 200);
        $(".hidePopup").show();
        $(".hidePopup").animate({top: "2%"}, 200);
	});
    
    
    $(document).keyup(function(e) {
        if(e.keyCode==27) {
            hidePopup();
        }
    });
    
    $(".hidePopup").click(function() {
        hidePopup();
    });
    
    function hidePopup() {
        $(".hidePopup").animate({top: "100%"}, 200);
        $(".popupForm").animate({top: "100%"}, 200);
	}
    
    
    $("#signup_username").keyup(function() {
        checkIfUsernameIsValid();
    });
    
    $("#signup_password").keyup(function() {
        checkIfPasswordsMatch();
    });
    
    $("#signup_password2").keyup(function() {
        checkIfPasswordsMatch();
    });
    
    $("#signup_email").keyup(function() {
        checkIfEmailIsValid();
    });
    
    $("#signup input").keyup(function() {
        checkIfSignupFormIsValid();
    });
    
    $("#login input").keyup(function() {
        checkIfLoginFormIsValid();
    });
        
    function checkIfUsernameIsValid() {
        if($("#signup_username").val() == "") {
            validUsername = false;
        } else {
            validUsername = true;
        }
    }
    
    function checkIfEmailIsValid() {
        email = $("#signup_email").val();
        emailCheck = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if($("#signup_email").val() == "") {
            $("#signup_email_alert").fadeOut();
            $("#signup_email_alert").text("");
            validEmail = false;
        } else if(emailCheck.test(email)) {
            $("#signup_email_alert").fadeOut();
            $("#signup_email_alert").text("");
            validEmail = true;
        } else {
            $("#signup_email_alert").fadeIn();
            $("#signup_email_alert").text("Syöttämäsi sähköpostiosoite ei näytä sähköpostiosoitteelta.");
            validEmail = false;
        }
    }
    
    function checkIfPasswordsMatch() {
        if($("#signup_password").val() == "" && $("#signup_password2").val() == "") {
            $("#signup_password_alert").fadeOut();
            $("#signup_password_alert").text("");
            $("#signup_password2_alert").fadeOut();
            $("#signup_password2_alert").text("");
            validPasswords = false;
        } else if ($("#signup_password").val() != "" && $("#signup_password").val().length < 6) {
            $("#signup_password_alert").fadeIn();
            $("#signup_password_alert").text("Salasanan on oltava vähintään 6 merkkiä.");
            validPasswords = false;
        } else if ($("#signup_password").val() != $("#signup_password2").val()) {
            $("#signup_password_alert").fadeOut();
            $("#signup_password_alert").text("");
            $("#signup_password2_alert").fadeIn();
            $("#signup_password2_alert").text("Syöttämäsi salasanat eivät täsmää.");
            validPasswords = false;
        } else {
            $("#signup_password_alert").fadeOut();
            $("#signup_password_alert").text("");
            $("#signup_password2_alert").fadeOut();
            $("#signup_password2_alert").text("");
            validPasswords = true;
        }
    }
    
    function checkIfSignupFormIsValid() {
        if(validUsername == true && validEmail == true && validPasswords == true) {
            $("input[type=submit]").removeAttr('disabled');
        } else {
            $("input[type=submit]").attr('disabled', 'disabled');
        }
    }
    
    function checkIfLoginFormIsValid() {
        if($("#login_username").val() != "" && $("#login_password").val() != "") {
            $("input[type=submit]").removeAttr('disabled');
        } else {
            $("input[type=submit]").attr('disabled', 'disabled');
        }
    }
    
    
    
    // new message form
    
    $("textarea").keydown(function(e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            alert("Viesti pitäisi lähettää nyt")
        }
    });
    
    
    
    // http requests n stuff
    
    
    var form_login = document.getElementById("login");
    
    $("#asdfhkjkasdf").click(function() {
        console.log("a");
        var xhr_login = new XMLHttpRequest();

        xhr_login.open('POST', "/login/", true);
        
        var formData_login = new FormData(form_login);
        formData_login.append('login_submit', true);

        xhr_login.setRequestHeader("Content-length", formData_login.length);
        xhr_login.setRequestHeader("Connection", "close");
        
        xhr_login.addEventListener("readystatechange", processRequest, false)
        console.log(formData_login);
        xhr_login.send(formData_login);
        alert("asfjhkasdf");


        function processRequest(e) {
            if(xhr_login.readyState == 4 && xhr_login.status == 200) {
                alert(xhr_login.response);
            }
        }
    });
    
    
    
    /* var xhr_signup = new XMLHttpRequest();
    
    xhr_signup.open('POST', "/register/", true);
    xhr_signup.send();
    
    xhr_signup.addEventListener("readystatechange", processRequest, false)
    
    function processRequest(e) {
        if(xhr_signup.readyState == 4 && xhr_signup.status == 200) {
            // überfancy
        }
    }
    
    */
    
    
    // login messages
    
    

});

function loginErrorMessage(message) {
    $("#loginErrorMessage").html(message);
    $("#loginErrorMessage").show();
    $("#loginErrorMessage").animate({top: "3%", opacity: "1"}, 200);
    $("#loginErrorMessage").delay(5000).animate({top: "-1%", opacity: "0"}, 200);
}