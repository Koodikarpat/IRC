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
    
    


    $("#signup").on("submit", function(e) {
        e.preventDefault();

		var req = new XMLHttpRequest();
        req.open("POST", "/register/");

        console.log(document.cookie);
        req.setRequestHeader('Cookies', document.cookie);

		var form_data = $("#signup").serializeArray();
		var json_data = {};

		$.each(form_data, function() {
            json_data[this.name] = this.value;
		});
		var json = JSON.stringify(json_data);

        req.send(json);

        req.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 400) {
                // Show user what values were bad.
                loginErrorMessage(this.statusText);
            } else if (this.readyState == 4 && this.status == 200) {
                $(location).attr('href', this.statusText)
            }
        }
    });
    
    
	$("#login").on('submit', function(e) {
	    // Makes the browser not change pages(?)
		e.preventDefault();

		var form_data = $("#login").serializeArray();
		var json_data = {};

		$.each(form_data, function() {
            json_data[this.name] = this.value;
		});
		var json = JSON.stringify(json_data);

		(async () => {
		    const response = await fetch('/login', {
		        method: 'POST',
		        body: json,
		        credentials: 'include'  // save cookies
		    });

		    if (response.redirected) {
		        $(location).attr('href', response.url);
		    } else {
		        loginErrorMessage(response.statusText);
		    }
		})();
	});
	
	$("#postmessage").on('submit', function(e) {
		e.preventDefault();
		
		var form_postmessage = document.getElementById("postmessage");
		var xhr_postmessage = new XMLHttpRequest();

        xhr_postmessage.open('POST', "/postmessage/", true);
        
        var formData_postmessage = new FormData(form_postmessage);

        xhr_postmessage.setRequestHeader("Content-length", formData_postmessage.length);
        xhr_postmessage.setRequestHeader("Connection", "close");
		
		var post_user = "aliylikoski123";
		var post_timestamp = new Date();
		
		var object_postmessage = {"username":post_user,"timestamp":post_timestamp};
		formData_postmessage.forEach(function(value, key) {
			object_postmessage[key] = value;
		});
		var json_postmessage = JSON.stringify(object_postmessage);
		
		console.log(json_postmessage);
		
        xhr_postmessage.send(json_postmessage);

        xhr_postmessage.addEventListener("readystatechange", processRequest, false);

        function processRequest(e) {
            if(xhr_postmessage.readyState == 4 && xhr_postmessage.status == 200) {
                // überfancy
            }
        }
	});
});

function loginErrorMessage(message) {
    $("#loginErrorMessage").html(message);
    $("#loginErrorMessage").show();
    $("#loginErrorMessage").animate({top: "3%", opacity: "1"}, 200);
    $("#loginErrorMessage").delay(5000).animate({top: "-1%", opacity: "0"}, 200);
}