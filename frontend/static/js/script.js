$(document).ready(function() {
	
	var username = "aliylikoski";
	var moderators = ["aliylioski", "pekka", "matti"];

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
	
	$("#revealSignupFromLogin").click(function() {
		$("#signupPopup").show();
		$("#signupPopup").animate({top: "0%"}, 200);
		$("#loginPopup").animate({top: "100%"}, 200);
	});
	
	$("#revealLoginFromSignup").click(function() {
		$("#loginPopup").show();
		$("#loginPopup").animate({top: "0%"}, 200);
		$("#signupPopup").animate({top: "100%"}, 200);
	});
	
	
	$(document).keyup(function(e) {
		if(e.keyCode==27) {
			hidePopup();
		}
	});
	
	$(".hidePopup").click(function() {
		hidePopup();
	});
	
	function hidePopup() {
		$(".hidePopup").animate({top: "100%"}, 200);
		$(".popup").animate({top: "100%"}, 200);
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
		if($("#signup_username").val() == "") {
			validUsername = false;
		} else {
			validUsername = true;
		}
	}
	
	function checkIfEmailIsValid() {
		email = $("#signup_email").val();
		emailCheck = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if($("#signup_email").val() == "") {
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
		if($("#signup_password").val() == "" && $("#signup_password2").val() == "") {
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
			$("#postmessage").submit();	
		}
	});
	
	
	// http requests n stuff
	$("#login").on('submit', function(e) {
		e.preventDefault();
		
		var form_login = document.getElementById("login");
		var xhr_login = new XMLHttpRequest();
		
		xhr_login.open('POST', "/login/", true);
		
		var formData_login = new FormData(form_login);
		
		xhr_login.setRequestHeader("Content-length", formData_login.length);
		xhr_login.setRequestHeader("Connection", "close");
		
		var object_login = {};
		formData_login.forEach(function(value, key) {
			object_login[key] = value;
		});
		var json_login = JSON.stringify(object_login);
		
		console.log(json_login);
		xhr_login.send(json_login);
		
		xhr_login.onreadystatechange = function() {
			if(this.readyState == 4) {
				console.log("UBER FANCY");
			}
		}
	});
	
	
	// signup request stuff
	
	$("#signup").on('submit', function(e) {
		e.preventDefault();
		
		var form_signup = document.getElementById("signup");
		var xhr_signup = new XMLHttpRequest();
		
		xhr_signup.open('POST', "/register/", true);
		
		var formData_signup = new FormData(form_signup);
		
		xhr_signup.setRequestHeader("Content-length", formData_signup.length);
		xhr_signup.setRequestHeader("Connection", "close");
		
		var object_signup = {};
		formData_signup.forEach(function(value, key) {
			object_signup[key] = value;
		});
		var json_signup = JSON.stringify(object_signup);
		
		console.log(json_signup);
		xhr_signup.send(json_signup);
		
		xhr_signup.onreadystatechange = function() {
			if(this.readyState == 4) {
				console.log("UBER FANCY");
			}
		}
	});
	
	
	
	function sendMessage() {
		var form_postmessage = document.getElementById("postmessage");
		var xhr_postmessage = new XMLHttpRequest();
		
		xhr_postmessage.open('POST', "/postmessage/", true);
		
		var formData_postmessage = new FormData(form_postmessage);
		
		xhr_postmessage.setRequestHeader("Content-length", formData_postmessage.length);
		xhr_postmessage.setRequestHeader("Connection", "close");
		
		function checkTime(i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		}
		
		var currentTimestamp = new Date();
		var currentH = currentTimestamp.getHours()
		var currentM = currentTimestamp.getMinutes()
		currentH = checkTime(currentH);
		currentM = checkTime(currentM);
		
		
		var object_postmessage = {author: username, timestamp: currentH + ":" + currentM};
		formData_postmessage.forEach(function(value, key) {
			object_postmessage[key] = value;
		});
		var json_postmessage = JSON.stringify(object_postmessage);
		
		console.log(json_postmessage);
		xhr_postmessage.send(json_postmessage);
		
		xhr_postmessage.onreadystatechange = function() {
			if(this.readyState == 4) {
				console.log("UBER LIT™");
				
				/*
				if(document.getElementById('messages').lastChild.classList.contains('me') == true) {
					previousMessageIsOwn = "sameUserAsInPreviousMessage"
				} else {
					previousMessageIsOwn = "";
				}
				*/
				
				
				previousMessageIsOwn = "";
				
				
				document.getElementById('messages').insertAdjacentHTML('beforeend', '<div class="message me ' + previousMessageIsOwn + '"><img src="/static/img/avatar.jpg" class="avatar avatar1"><div class="messageBody"><div class="messageData"><span class="username">' + object_postmessage['author'] + '</span> <span class="timestamp">' + object_postmessage['timestamp'] + '</span></div><span class="messageContent">' + object_postmessage['message'] + '</span></div><img src="/static/img/avatar.jpg" class="avatar avatar2"></div>');
				$("#messages").scrollTop($("#messages")[0].scrollHeight);
				$("#postmessage textarea").val('');
			}
		}
	}
	
	
	$("#postmessage").on('submit', function(e) {
		e.preventDefault();
		if($("#postmessage textarea").val().length > 0) {
			sendMessage();
		} else {
			fancyAlert("Et voi lähettää tyhjää viestiä!");
		}
	});
	
	
	
	// Chat
	
	if($("#messages").length > 0) {
		$("#messages").scrollTop($("#messages")[0].scrollHeight);
	}
	
	
	// Delete message
	
	function deleteMessage(message) {
		
		messageAuthor = message.closest(".messageBody").find(".username").text();
		messageTimestamp = message.closest(".messageBody").find(".timestamp").text();
		
		moderatorReminder = '';
		if(username !== messageAuthor) {
			if(moderators.includes(username)) {
				moderatorReminder = 'Olet poistamassa käyttäjän ' + messageAuthor + ' viestiä. Huomioi, että toisen käyttäjän viestin poistaminen on sallittua ainoastaan viestin sisällön ollessa chatin sääntöjen vastaista.\n\n';
			} else {
				alert('Sinulla ei ole oikeuksia poistaa käyttäjän ' + messageAuthor + ' viestiä. Voit poistaa ainoastaan omia viestejäsi.');
				return;
			}
		}
		
		var deleteMessageConfirmation = confirm('Oletko varma, että haluat poistaa tämän viestin?\n\n	' + messageAuthor + ' ' + messageTimestamp + ': "' + message.text() + '"\n\n' + moderatorReminder + 'Paina OK poistaaksesi viesti.');
		if(deleteMessageConfirmation) {
			message.html("<i>This message was deleted.</i>");
			if(username == messageAuthor) {
				message.css({"color": "#777", "opacity": 0.5});
			} else {
				message.css({"color": "#DDD", "opacity": 0.5});
			}
			
			var xhr_deletemessage = new XMLHttpRequest();

			xhr_deletemessage.open('POST', "/deletemessage/", true);

			var object_deletemessage = {deletor: username, author: messageAuthor, messageId: message.attr("id")};
			var json_deletemessage = JSON.stringify(object_deletemessage);

			console.log(json_deletemessage);
			xhr_deletemessage.send(json_deletemessage);

			xhr_deletemessage.onreadystatechange = function() {
				if(this.readyState == 4) {
					console.log("UBER FANCY");
				}
			}
		}
	}
	
	$(".message .messageContent").dblclick(function() {
		deleteMessage($(this));
	});
	
	
	// Logout / leave chat
	
	function logOut() {
		var xhr_logout = new XMLHttpRequest();

		xhr_logout.open('POST', "/logout/", true);
		
		xhr_logout.send();

		xhr_logout.onreadystatechange = function() {
			if(this.readyState == 4) {
				console.log("UBER FANCY, you are now logged out :D (at least I hope so)");
			}
		}
	}
	
	$(".logOut").click(function() {
		logOut();
	});
	
	
	
	
	// Postmessage form
	
	$("#postmessage textarea").keyup(function() {
		if($("#postmessage textarea").val().length > 0) {
			$("#postmessage #submitBackground").fadeIn(200);
		} else {
			$("#postmessage #submitBackground").fadeOut(200);
		}
	});
	
	// MENU STUFF
	
	$("#revealChannelSelection").click(function() {
		$("#switchChannelMenu").show();
		$("#switchChannelMenu").animate({top: "0%"}, 200);
		$(".hidePopup").show();
		$(".hidePopup").animate({top: "2%"}, 200);
	});
	
	
});



// Alerts and stuff

function loginErrorMessage(message) {
	$("#loginErrorMessage").html(message);
	$("#loginErrorMessage").show();
	$("#loginErrorMessage").animate({top: "4%", opacity: "1"}, 200);
	$("#loginErrorMessage").delay(5000).animate({top: "-4%", opacity: "0"}, 200);
}

function fancyAlert(message) {
    $("#fancyAlert").clearQueue();
	$("#fancyAlert").animate({top: "-4%", opacity: "0"}, 200);
	$("#fancyAlert").html(message);
	$("#fancyAlert").show();
	$("#fancyAlert").animate({top: "4%", opacity: "1"}, 200);
	$("#fancyAlert").delay(2000).animate({top: "-4%", opacity: "0"}, 200);
}

function incomingChatMessage(username, timestamp, message) {
	previousMessageIsOwn = "";
	
	document.getElementById('messages').insertAdjacentHTML('beforeend', '<div class="message ' + previousMessageIsOwn + '"><img src="/static/img/avatar.jpg" class="avatar avatar1"><div class="messageBody"><div class="messageData"><span class="username">' + username + '</span> <span class="timestamp">' + timestamp + '</span></div><span class="messageContent">' + message + '</span></div><img src="/static/img/avatar.jpg" class="avatar avatar2"></div>');
	$("#messages").scrollTop($("#messages")[0].scrollHeight);
	$("#postmessage textarea").val('');
}