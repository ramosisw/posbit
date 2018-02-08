(function() {

    if (localStorageDB == undefined) log('localStorage not defined!');
    else {
        db_options = new localStorageDB("options", localStorage);
        if (db_options.isNew()) {
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
        if (!db_options.tableExists("orders")) {
            db_options.createTable("orders", ["book", "isBuy", "price", "amount", "value"]);
            db_options.commit();
        }
        if (!db_options.tableExists("chrome_notifications")) {
            db_options.createTable("chrome_notifications", ["id"]);
            db_options.commit();
        }
        if (!db_options.tableExists("whales")) {
            db_options.createTable("whales", ["min", "max", "status"]);
            db_options.commit();
            db_options.insertOrUpdate("whales", {
                "min": 100000
            }, {
                "min": 100000,
                "max": 5000000,
                "status": 1
            });
            db_options.commit();
        }
        if (!db_options.tableExists("notifications")) {
            db_options.createTable("notifications", ["min", "max", "book", "status"]);
            db_options.commit();
            db_options.insertOrUpdate("notifications", {
                "min": 15
            }, {
                "min": 15,
                "max": 20,
                "book": "xrp_mxn",
                "status": 1
            });
            db_options.commit();
        }
        if (!db_options.tableExists("books")) {
            db_options.createTable("books", ["book"]);
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

    function existNotificationId(id) {
        var i = db_options.queryAll("chrome_notifications", {
            query: {
                "id": id
            }
        });
        log({
            "chrome_notifications": i
        });
        return i.length != undefined && i.length >= 1;
    }

    function showNotification(id, title, message, buttons, callbackButtons) {
        //log({"id" : id, "title" : title, "message" : message, "buttons" : buttons, "callbackButtons" : callbackButtons});
        if (existNotificationId(id)) return;
        var options = {
            iconUrl: '/icons/icon48x48.png',
            title: 'Posbit | ' + title,
            message: message,
            type: "basic"
        };
        if (buttons != undefined) {
            options.buttons = buttons;
        }
        db_options.insertOrUpdate("chrome_notifications", {
            "id": id
        }, {
            "id": id
        });
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

    function addOrders(orders, book) {
        if (orders.isArray) {
            db_options.deleteRows("orders", {
                "book": book
            });
            db_options.commit();
            for (var i = 0; order = orders[i]; i++) {
                db_options.insert("orders", order);
            }
            db_options.commit();
        }
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
                    if (request.orders != undefined)
                        addOrders(request.orders, request.book);
                    responseMessage("OK", sendResponse);
                    break;
                default:
                    responseMessage("OK", sendResponse);
            }
    });

    $(document).ready(function() {
        $.getJSON("https://api.bitso.com/v3/available_books/").done(function(json) {
            if (!(json.success != undefined && json.success)) return;
            for (var i = 0; item = json.payload[i]; i++) {
                db_options.insertOrUpdate("books", {
                    book: item.book
                }, {
                    book: item.book
                });
                db_options.commit();
            }
        });
    });

    function notifications() {
        var db_options = new localStorageDB("options", localStorage);
        var check_books = db_options.queryAll("notifications", {
            distinct: ["book"],
            query: {
                "status": 1
            }
        });
        if (isArray(check_books)) {
            for (var i = 0; item = check_books[i]; i++) {
                $.getJSON("https://api.bitso.com/v3/trades/?limit=1&book=" + item.book).done(function(json) {
                    if (!(json.success != undefined && json.success && json.payload.length >= 1)) return;
                    var notifies = db_options.queryAll("notifications", {
                        query: {
                            "book": json.payload[0].book,
                            "status": 1
                        }
                    });
                    for (var j = 0; item = notifies[j]; j++) {
                        item.max *= 1;
                        item.min *= 1;
                        var price = json.payload[0].price * 1;
                        log({
                            "book": json.payload[0].book,
                            "min_max_price" : [item.min, item.max, price],
                            "notify_max": item.max > 0 && price >= item.max,
                            "notify_min": item.min > 0 && price <= item.min,
                            "price": json.payload[0].price
                        });
                        var book = json.payload[0].book.toUpperCase().replace("_", "/");
                        var prety_price = book.indexOf("MXN") == -1 ? price.toFixed(8) : formatCurrency(price.toFixed(2));
                        //check max
                        if (item.max > 0 && price >= item.max) {
                            showNotification(
                                item.ID + "_alto_" + json.payload[0].tid * 10,
                                "Precio Alto ↑",
                                "El precio de " + book + " es " + prety_price
                            );
                        }
                        if (item.min > 0 && price <= item.min) {
                            showNotification(
                                item.ID + "_bajo_" + json.payload[0].tid * 20,
                                "Precio Bajo ↓",
                                "El precio de " + book + " es " + prety_price
                            );
                        }
                    }
                });
            }
        }
    }
    notifications();
    setInterval(function() {
        notifications();
    }, 10000);
    log(db_options.queryAll("orders"));
})();