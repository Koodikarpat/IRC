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
    
    

});