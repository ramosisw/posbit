(function() {

    if (localStorageDB == undefined) log('localStorage not defined!');
    else {
        var db_options = new localStorageDB("options", localStorage);
        if (db_options.isNew()) {
            log('creating db_settings');
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

    function responseMessage(message, sendResponse) {
        if (sendResponse != undefined && typeof sendResponse == "function") sendResponse(message);
    }

    function showNotification(id, title, message, buttons, callbackButtons) {
        var options = {
            iconUrl: '/icons/icon48x48.png',
            title: 'Posbit | ' + title,
            message: message,
            type: "basic"
        };
        if (buttons != undefined) {
            options.buttons = buttons;
        }

        chrome.notifications.create(id, options, function() {});
        if (callbackButtons != undefined && typeof callbackButtons == 'function') {
            chrome.notifications.onButtonClicked.addListener(callbackButtons);
        }
    }

    function errorRequest(request, containsRequest, sendResponse) {
        var isValidRequest = false;
        for (var key in request) {
            if (!request.hasOwnProperty(key)) continue;
            for (var i = 0; contain = containsRequest[i]; i++) {
                if (isValidRequest = contain == key && containsRequest.remove(i)) break;
            }
        }
        if (containsRequest.length > 0) {
            var message = {
                "Ned values": containsRequest,
                "Request": request
            };
            responseMessage(message, sendResponse);
            log(message);
            return true;
        }
        return false;
    }

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        log({
            "Requested background": request
            //,"sender": sender
        });
        if (request.code != undefined)
            switch (request.code) {
                case SET_COMMISION:
                    saveCommision(request.value);
                    responseMessage("OK", sendResponse);
                    break;
                case SHOW_NOTIFICATION:
                    if (errorRequest(request, ["id", "title", "message"], sendResponse)) return;
                    showNotification(request.id, request.title, request.message, request.buttons, request.callbackButtons);
                    responseMessage("OK", sendResponse);
                    break;
                case ADD_ORDERS:
                    
                    break;
                default:
                    responseMessage("OK", sendResponse);
            }
    });
})();