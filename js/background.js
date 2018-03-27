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
        if (!db_options.tableExists("settings")){
            var version = db_options.queryAll("settings", {
                query:{
                    key : "version"
                }
            });
            if(isArray(version) && version.length > 0 && version.value != VERSION){
                //update to new version
            }
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
            db_options.createTable("whales", ["min", "max", "book", "status"]);
            db_options.commit();
        }
        if(!db_options.columnExists("whales", "book")) {
            db_options.alterTable("whales", "book", "xrp_mxn");
            db_options.commit();
        }
        if (!db_options.tableExists("notifications")) {
            db_options.createTable("notifications", ["min", "max", "book", "status"]);
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
        return i.length != undefined && i.length >= 1;
    }

    function showNotification(id, title, message, buttons, callbackButtons) {
        //log({"id" : id, "title" : title, "message" : message, "buttons" : buttons, "callbackButtons" : callbackButtons});
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
                    if (!existNotificationId(request.id)){
                        db_options.insertOrUpdate("chrome_notifications", {
                            "id": request.id
                        }, {
                            "id": request.id
                        });
                        db_options.commit();
                        showNotification(request.id, request.title, request.message, request.buttons, request.callbackButtons);
                    }
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

    function ballenas(){
        var db_options = new localStorageDB("options", localStorage);
        var check_books = db_options.queryAll("orders",{
            distinct: ["book"]
        });
        if (isArray(check_books)){
            for (var i = 0; item = check_books[i]; i++) {
                var book = item.book.toUpperCase().replace("_", "/");
                var whales = db_options.queryAll("whales",{
                    query: {
                        "book" : item.book,
                        "status" : 1
                    }
                });
                if(isArray(whales) && whales.length == 0){
                    showNotification(
                        item.book + "_NOT_"+(Math.floor(Math.random() * 10000 + 1)),
                        "Sin ballenas",
                        "Tienes postura(s) en " + book + " y no hay ballenas activas/configuradas."
                    );
                    continue;
                }
                if(isArray(whales)){
                    $.getJSON("https://api.bitso.com/v3/order_book/?book=" + item.book).done(function(json) {
                        if (!(json.success != undefined && json.success && json.payload.length >= 1)) return;
                        var orders = db_options.queryAll("orders",{
                            query:{
                                "book" : item.book
                            }
                        });
                        for (var j = 0; item = notifies[j]; j++) {
                            item.min *= 1;
                            item.max *= 1;
                            var price = json.payload[0].price * 1;
                            var book = json.payload[0].book.toUpperCase().replace("_", "/");
                        }
                    });
                }
            }
        }
    }

    notifications();
    //sballenas();
    setInterval(function() {
        notifications();
        //ballenas();
    }, 10000);
    //log(db_options.queryAll("orders"));
})();