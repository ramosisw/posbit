(function() {
    if (localStorageDB == undefined) console.log('localStorage not defined!');
    else {
        var db_options = new localStorageDB("options", localStorage);
        if (db_options.isNew()) {
            console.log('creating db_settings');
            var settings = [{
                key: "comision",
                value: 0.80
            }, {
                key: "last_tab",
                value: "#formulas"
            }];
            // create the "books" table
            db_options.createTableWithData("settings", settings);
            db_options.commit();
        }
    }

    function saveCommision(commision) {
        if (db_options == undefined) return;
        db_options.insertOrUpdate("settings", {
            key: "comision"
        }, {
            key: "comision",
            value: commision
        });
        db_options.commit();
    }

    function responseMessage(message, sendResponse){
         if(sendResponse != undefined && typeof sendResponse == "function") sendResponse(message);
    }

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        console.log(JSON.stringify({
            'Requested background': request,
            "sender": sender
        }));
        if(request.code != undefined)
        switch (request.code) {
            case SET_COMMISION:
                saveCommision(request.value);
                responseMessage("OK", sendResponse);
                break;
            case SHOW_NOTIFICATION:
                var containsRequest = ["title", "message"];
                var isValidRequest = false;
                for (var key in request) {
                    if (!request.hasOwnProperty(key)) continue;
                    for (var i = 0; contain = containsRequest[i]; i++) {
                        if (isValidRequest = contain == key) break;
                    }
                    if (!isValidRequest) return;
                }
                showNotification(request.title, request.message, [{
                    title: "Sell",
                    iconUrl: "/icons/icon16x16.png"
                }], function(id, index) {

                });

                sendResponse({
                    returnMsg: "All good!"
                }); // optional response
                break;
            default:
                responseMessage("OK", sendResponse);
        }
    });

    function showNotification(title, message, buttons, callbackButtons) {
        var options = {
            iconUrl: '/icons/icon48x48.png',
            title: 'Posbit | ' + title,
            message: message,
            type: "basic"
        };
        if (buttons != undefined) {
            options.buttons = buttons;
        }
        /*var notification = webkitNotifications.createNotification(icons[icon], // icon url - can be relative
            'Feebbo Check Surveys | ' + title, // notification title
            message // notification body text
        );
        notification.show();*/
        chrome.notifications.create("id", options, function() {});
        if (callbackButtons != undefined && typeof callbackButtons == 'function') {
            chrome.notifications.onButtonClicked.addListener(callbackButtons);
        }
    }
})();