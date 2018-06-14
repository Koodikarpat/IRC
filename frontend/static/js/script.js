var username = '';
var id = undefined;

$(document).ready(function () {

    $("#revealLogin").click(function () {
        $("#loginPopup").show();
        $("#loginPopup").animate({top: "0%"}, 200);
        $(".hidePopup").show();
        $(".hidePopup").animate({top: "2%"}, 200);
    });

    $("#revealSignup").click(function () {
        $("#signupPopup").show();
        $("#signupPopup").animate({top: "0%"}, 200);
        $(".hidePopup").show();
        $(".hidePopup").animate({top: "2%"}, 200);
    });

    $("#revealSignupFromLogin").click(function () {
        $("#signupPopup").show();
        $("#signupPopup").animate({top: "0%"}, 200);
        $("#loginPopup").animate({top: "100%"}, 200);
    });

    $("#revealLoginFromSignup").click(function () {
        $("#loginPopup").show();
        $("#loginPopup").animate({top: "0%"}, 200);
        $("#signupPopup").animate({top: "100%"}, 200);
    });


    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            hidePopup();
        }
    });

    $(".hidePopup").click(function () {
        hidePopup();
    });

    function hidePopup() {
        $(".hidePopup").animate({top: "100%"}, 200);
        $(".popup").animate({top: "100%"}, 200);
    }


    $("#signup_username").keyup(function () {
        checkIfUsernameIsValid();
    });

    $("#signup_password").keyup(function () {
        checkIfPasswordsMatch();
    });

    $("#signup_password2").keyup(function () {
        checkIfPasswordsMatch();
    });

    $("#signup_email").keyup(function () {
        checkIfEmailIsValid();
    });

    $("#signup input").keyup(function () {
        checkIfSignupFormIsValid();
    });

    $("#login input").keyup(function () {
        checkIfLoginFormIsValid();
    });

    function checkIfUsernameIsValid() {
        var validUsername = $("#signup_username").val() !== "";
    }

    function checkIfEmailIsValid() {
        email = $("#signup_email").val();
        emailCheck = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ($("#signup_email").val() === "") {
            $("#signup_email_alert").fadeOut();
            $("#signup_email_alert").text("");
            validEmail = false;
        } else if (emailCheck.test(email)) {
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
        if ($("#signup_password").val() === "" && $("#signup_password2").val() === "") {
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
        if (validUsername && validEmail && validPasswords) {
            $("input[type=submit]").removeAttr('disabled');
        } else {
            $("input[type=submit]").attr('disabled', 'disabled');
        }
    }

    function checkIfLoginFormIsValid() {
        if ($("#login_username").val() != "" && $("#login_password").val() != "") {
            $("input[type=submit]").removeAttr('disabled');
        } else {
            $("input[type=submit]").attr('disabled', 'disabled');
        }
    }


    // new message form

    $("textarea").keydown(function (e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            $("#postmessage").submit();
        }
    });


    // http requests n stuff
    $("#login").on('submit', function (e) {
        e.preventDefault();

        var formdata = $('#login').serializeArray();
        var jsondata = {};

        $.each(formdata, function () {
            jsondata[this.name] = this.value;
        });
        var json = JSON.stringify(jsondata);

        fetch('/login', {
            method: 'POST',
            body: json,
            credentials: 'include' // save cookies)
        }).then(function (response) {
            if (response.redirected) {
                $(location).attr('href', response.url);
            } else {
                loginErrorMessage(response.statusText);
            }
        })
    });


    // signup request stuff

    $("#signup").on('submit', function (e) {
        e.preventDefault();

        var form_signup = document.getElementById("signup");
        var formData_signup = new FormData(form_signup);

        var object_signup = {};
        formData_signup.forEach(function (value, key) {
            object_signup[key] = value;
        });
        var json_signup = JSON.stringify(object_signup);

        fetch('/register', {
            method: 'POST',
            body: json_signup,
            credentials: 'include' // save cookies)
        }).then(function (response) {
            if (response.redirected) {
                $(location).attr('href', response.url);
            } else {
                loginErrorMessage(response.statusText);
            }
        })
    });


    function sendMessage() {
        var form_postmessage = document.getElementById("postmessage");
        var xhr_postmessage = new XMLHttpRequest();

        xhr_postmessage.open('POST', "/channels/" + current_channel + "/sendmessage", true);

        var formData_postmessage = new FormData(form_postmessage);

        $("#postmessage textarea").val('');


        var object_postmessage = {};
        formData_postmessage.forEach(function (value, key) {
            object_postmessage[key] = value;
        });
        var json_postmessage = JSON.stringify(object_postmessage);

        xhr_postmessage.send(json_postmessage);
    }


    $("#postmessage").on('submit', function (e) {
        e.preventDefault();
        if ($("#postmessage textarea").val().length > 0) {
            sendMessage();
        } else {
            fancyAlert("Et voi lähettää tyhjää viestiä!");
        }
    });


    // Scroll down on chat load

    if ($("#messages").length > 0) {
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    }


    // Delete message

    function deleteMessage(message) {

        messageAuthor = message.closest(".messageBody").find(".username").text();
        messageTimestamp = message.closest(".messageBody").find(".timestamp").text();

        moderatorReminder = '';
        if (username !== messageAuthor) {
            if (moderators.includes(username)) {
                moderatorReminder = 'Olet poistamassa käyttäjän ' + messageAuthor + ' viestiä. Huomioi, että toisen käyttäjän viestin poistaminen on sallittua ainoastaan viestin sisällön ollessa chatin sääntöjen vastaista.\n\n';
            } else {
                alert('Sinulla ei ole oikeuksia poistaa käyttäjän ' + messageAuthor + ' viestiä. Voit poistaa ainoastaan omia viestejäsi.\n\nMikäli viesti mielestäsi rikkoo chatin sääntöjä, ota yhteyttä ylläpitoon.');
                return;
            }
        }

        var deleteMessageConfirmation = confirm('Oletko varma, että haluat poistaa tämän viestin?\n\n	' + messageAuthor + ' ' + messageTimestamp + ': "' + message.text() + '"\n\n' + moderatorReminder + 'Paina OK poistaaksesi viesti.');
        if (deleteMessageConfirmation) {
            message.html("<i>This message was deleted.</i>");
            if (username == messageAuthor) {
                message.css({"color": "#777", "opacity": 0.5});
            } else {
                message.css({"color": "#DDD", "opacity": 0.5});
            }

            var xhr_deletemessage = new XMLHttpRequest();

            xhr_deletemessage.open('POST', "/deletemessage/", true);

            var object_deletemessage = {deletor: username, author: messageAuthor, messageId: message.attr("id")};
            var json_deletemessage = JSON.stringify(object_deletemessage);

            xhr_deletemessage.send(json_deletemessage);

            xhr_deletemessage.onreadystatechange = function () {
                if (this.readyState == 4) {
                    console.log("UBER FANCY");
                }
            }
        }
    }

    // Logout / leave chat

    function logOut() {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(function (response) {
                if (response.redirected) {
                    clearInterval(id);
                    $(location).attr('href', '/authenticate.html');
                }
            });
    }

    $("#logOut").click(function () {
        logOut();
    });


    // Create channel


    // http requests n stuff
    $("#createchannel").on('submit', function (e) {
        e.preventDefault();

        var form_createchannel = document.getElementById("createchannel");
        var xhr_createchannel = new XMLHttpRequest();

        xhr_createchannel.open('POST', "/createchannel/", true);

        var formData_createchannel = new FormData(form_createchannel);

        xhr_createchannel.setRequestHeader("Content-length", formData_createchannel.length);
        xhr_createchannel.setRequestHeader("Connection", "close");

        var object_createchannel = {};
        formData_createchannel.forEach(function (value, key) {
            object_createchannel[key] = value;
        });
        var json_createchannel = JSON.stringify(object_createchannel);

        console.log(json_createchannel);
        xhr_createchannel.send(json_createchannel);

        xhr_createchannel.onreadystatechange = function () {
            if (this.readyState == 4) {
                console.log("UBER FANCY");
            }
        }
    });


    // Postmessage form

    $("#postmessage textarea").keyup(function () {
        if ($("#postmessage textarea").val().length > 0) {
            $("#postmessage #submitBackground").fadeIn(200);
        } else {
            $("#postmessage #submitBackground").fadeOut(200);
        }
    });

    // MENU STUFF


    $("#inviteToChannel").click(function () {
        $("#inviteToChannelPopup").show();
        $("#inviteToChannelPopup").animate({top: "0%"}, 200);
        $(".hidePopup").show();
        $(".hidePopup").animate({top: "2%"}, 200);
    });

    $("#findChannels").click(function () {
        $("#switchChannelMenu").show();
        $("#switchChannelMenu").animate({top: "0%"}, 200);
        $(".hidePopup").show();
        $(".hidePopup").animate({top: "2%"}, 200);
    });

    $("#tos").click(function () {
        $("#tosPopup").show();
        $("#tosPopup").animate({top: "0%"}, 200);
        $(".hidePopup").show();
        $(".hidePopup").animate({top: "2%"}, 200);
    });


});

// Set values on channel page
function setChannelInformation(channelName, channelDescription, channelOnlineCount) {
    $("#channelName").text("#" + channelName);
    $("#channelDescription").text(channelDescription);
    $("#channelOnlineCount").text(channelOnlineCount);
}


// Mobile menu
function toggleMobileMenu(button) {
    button.classList.toggle("change");
    if ($("#mobileMenuButton").hasClass("change")) {
        $("#sidebar").slideDown(200);
    } else {
        $("#sidebar").slideUp(200);
    }
}


// session

var currentUsername = "";
var channels = [];
var current_channel = 0;


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

function incomingChatMessage(author, timestamp, message) {

    if (author == currentUsername) {
        me = "me";
        meStyle = "right:-500px;"
    } else {
        me = "";
        meStyle = "left:-500px;"
    }

    var emojis = [
        '\ud83c[\udf00-\udfff]',
        '\ud83d[\udc00-\ude4f]',
        '\ud83d[\ude80-\udeff]',
        '\u2764\ufe0f'
    ];

    var bigEmojiCheck = message.toString().replace(new RegExp(emojis.join('|'), 'g'), '');

    if (bigEmojiCheck === '') {
        bigEmojis = 'bigEmojis';
    } else {
        bigEmojis = '';
    }


    previousMessageHasSameAuthor = document.getElementById('messages').lastChild.classList + '';
    previousMessageHasSameAuthor = previousMessageHasSameAuthor.toString();

    if ((author == currentUsername && previousMessageHasSameAuthor.includes(' me ')) || previousMessageHasSameAuthor.includes(author)) {
        previousMessageHasSameAuthor = 'sameAuthorAsPreviousMessage';
    } else {
        previousMessageHasSameAuthor = '';
    }

    document.getElementById('messages').insertAdjacentHTML('beforeend', '<div class="message ' + author + ' ' + me + ' ' + previousMessageHasSameAuthor + '" style="position:relative;' + meStyle + '"><img src="/static/img/avatar.jpg" class="avatar avatar1"><div class="messageBody"><div class="messageData"><span class="username">' + author + '</span> <span class="timestamp">' + timestamp + '</span></div><span class="messageContent ' + bigEmojis + '">' + message + '</span></div><img src="/static/img/avatar.jpg" class="avatar avatar2"></div>');
    $("#messages").children().last().animate({left: "0", right: "0"}, 100);
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
	
    $(".message .messageContent").dblclick(function () {
        deleteMessage($(this));
    });

}


window.onload = function () {
    if (this.location.pathname !== '/chat.html') {
        return;
    }

    fetch('/me', {
        method: 'POST',
        credentials: 'include'
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            currentUsername = json['username'];
            username = json['username'];
            document.getElementById('username').innerHTML = '@' + username;
        });

    fetch('/channels/get', {
        method: 'POST',
        credentials: 'include'
    })
        .then(function (response) {
            if (response.status === 200) {
                return response.json();
            }
        })
        .then(function (json) {
            var channel = json[0];
            channels = json;
            current_channel = channel['id'];
            setChannelInformation(channel['name'], '', channel['users'].length)

            channel['messages'].forEach(function (message) {
                incomingChatMessage(message['author'], message['date'], message['content'])
            });
        });

    function get_new() {
        if (current_channel === 0) {
            return;
        }

        fetch('/channels/' + current_channel + '/getupdates', {
            method: 'POST',
            credentials: 'include'
        })
            .then(function (response) {
                if (response.status === 200) {
                    return response.json();
                } else {
                    clearInterval(id);
                }
            })
            .then(function (json) {
                json.forEach(function (message) {
                    incomingChatMessage(message['author'], message['date'], message['content']);
                })
            })
    }

    id = setInterval(get_new, 1000);
};
