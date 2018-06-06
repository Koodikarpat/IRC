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
    
    
    $("#signup_email").keyup(function() {
        checkIfEmailIsValid();
    });
    $("#signup_password").keyup(function() {
        checkIfPasswordsMatch();
    });
    $("#signup_password2").keyup(function() {
        checkIfPasswordsMatch();
    });
        
    function checkIfPasswordsMatch() {
        if($("#signup_password").val() != $("#signup_password2").val()) {
            $("#signup_password2_alert").text("Salasanat eivät täsmää!");
        } else {
            $("#signup_password2_alert").text("");
        }
    }
    
    function checkIfEmailIsValid() {
        if($("#signup_email").length < 8) {
            $("#signup_email_alert").text("Sähköpostiosoite on liian lyhyt!");
        } else {
            $("#signup_email_alert").text("");
        }
    }
    
    

});