// dark mode just 4 fun

$(document).ready(function() {
    
    
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    
    
    darkmode = getCookie("darkmode")
    
    if(darkmode == "enabled") {
        $("#switchMode").text("Switch to light mode");
        $("#mobileChatHeaderSwitchMode").text("Light mode");
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.href = '/static/css/darkmode.css';
        head.appendChild(link);
    } else {
        $("#switchMode").text("Switch to dark mode");
        $("#mobileChatHeaderSwitchMode").text("Dark mode");
    }
	
	function switchMode() {
        if(darkmode == "enabled") {
            setCookie("darkmode", "disabled", true);
            darkmode = getCookie("darkmode");
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.getElementsByTagName('link')[11];
            head.removeChild(link);
            document.getElementById("switchMode").innerHTML = "Switch to dark mode";
            document.getElementById("mobileChatHeaderSwitchMode").innerHTML = "Dark mode";
        } else {
            setCookie("darkmode", "enabled", true);
            darkmode = getCookie("darkmode");
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.href = '/static/css/darkmode.css';
            head.appendChild(link);
            document.getElementById("switchMode").innerHTML = "Switch to light mode";
            document.getElementById("mobileChatHeaderSwitchMode").innerHTML = "Light mode";
        }
	}
    
    $("#switchMode").click(function() {
		switchMode();
    });
    
    $("#mobileChatHeaderSwitchMode").click(function() {
		switchMode();
    });
    

});