//posbit.js
/**
posbit v 1.0.0
author ramosisw
email ramos.isw@gmail.com
**/
! function(parent) {
    /**
     * @return {instance} Instance of API
     */
    function core() {
        console.log('Posbit Core loading!');
        var flagBuy = "fa fa-arrow-right";
        var commision = 0.008;
        if (localStorageDB == undefined) console.log('localStorage not defined!');
        else var db_options = new localStorageDB("posbit", localStorage);

        function isArray(array) {
            return typeof array == 'object' && array.length != undefined;
        }

        /**
         * @param  {string} Message to log
         * @return {boolean} Always true
         */
        function log(message) {
            if (typeof message == "object") message = JSON.stringify(JSON.parse(JSON.stringify(message)),null,2); 
            console.log(message);
            return true;
        }
        /**
         * @return {boolean} Always true
         */
        function tradeListener() {

        }

        function processColumnsRows(columns) {
            if (!isArray(columns)) return {};
            return {
                buy: columns[0].querySelector("span").className == flagBuy,
                received: (columns[1].innerText.replace(/[^\d\.]/g, "") * 1).toFixed(8) * 1,
                paged: columns[2].innerText.replace(/[^\d\.]/g, "") * 1,
                price: columns[3].innerText.replace(/[^\d\.]/g, "") * 1
            };
        }

        function processOrderColumns(columns) {
            if (!isArray(columns)) return {};
            return {
                isBuy: columns[0].querySelector("span").className == flagBuy,
                price: (columns[1].innerText.replace(/[^\d\.]/g, "") * 1).toFixed(8) * 1,
                amount: columns[2].innerText.replace(/[^\d\.]/g, "") * 1,
                value: columns[3].innerText.replace(/[^\d\.]/g, "") * 1
            };
        }

        function fastSell(evt) {
            var amount = evt.path[0].innerText;
            var price = evt.path[1].querySelectorAll("td")[3].innerText.replace(/[^\d\.]/g, "") * 1;
            var b = price;
            var c = commision;
            var x = (b * (1 + 2 * c) + 0.01).toFixed(2);
            var sell_amount = document.querySelector("#sell-amount");
            var sell_rate = document.querySelector("#sell-rate");
            var changeEvent = new Event('change');
            if (sell_amount != undefined) {
                sell_amount.value = amount;
                sell_rate.value = x;
                sell_rate.dispatchEvent(changeEvent);
                sell_amount.dispatchEvent(changeEvent);
            }
        }

        var $this = this;
        return {
            log: function(message) {
                log(message);
            },
            saveCommision: function(commision) {
                $this.commision = commision;
                //Set commision base 100
                chrome.extension.sendRequest({
                    code: SET_COMMISION,
                    value: (commision * 100).toFixed(2) + 0
                }, function(response) {
                    log(response);
                });
            },
            addOrders: function(ordersArray) {
                if(!isArray(ordersArray)) return;
                var $orders = [];
                for (var i = 0; $order = ordersArray[i]; i++) {
                    $orders.push(processOrderColumns($order.querySelectorAll("td")));
                }
                chrome.extension.sendRequest({
                    code: ADD_ORDERS,
                    orders: $orders
                }, function(response) {
                    log(message);
                });
            },
            processRowTrade: function(row) {

            },
            processColumnsRows: function(columns) {
                return processColumnsRows(columns);
            },
            processOrderColumns : function(columns){
                return processOrderColumns(columns);
            },
            injectTooltip: function() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                var code = "(function() {$(document).ready(function() { $('[data-toggle=\"tooltip\"]').tooltip();});})();";
                try {
                    script.appendChild(document.createTextNode(code));
                    document.body.appendChild(script);
                } catch (e) {
                    script.text = code;
                    document.body.appendChild(script);
                }
            },
            normalizeValues: function(userTrades, commision) {
                if (commision == undefined) commision = 0.008;
                if (isArray(userTrades)) {
                    for (var i = 0; trade = userTrades[i]; i++) {
                        var columns = trade.querySelectorAll("td");
                        var transaction = processColumnsRows(columns);
                        if (!transaction) continue;
                        if (transaction.buy) {
                            userTrades[i].className = "success";
                            columns[1].innerText = (transaction.received * (1 - commision)).toFixed(6);
                            columns[3].setAttribute("data-toggle", "tooltip");
                            //b * ( 1 + 2 * c)
                            var b = transaction.price;
                            var c = commision;
                            var x = b * (1 + 2 * c) + 0.01;
                            columns[3].setAttribute("title", "$" + x.toFixed(2));
                        } else {
                            columns[2].innerText = transaction.paged;
                        }
                    }
                }
            },
            addFastSell: function(userTrades, commision) {
                if (isArray(userTrades));
                for (var i = 0; trade = userTrades[i]; i++) {
                    var columns = trade.querySelectorAll("td");
                    if (trade.className == "success" && columns[1].getAttribute("data-fast-sell") != "ok") {
                        columns[1].addEventListener("click", fastSell);
                        columns[1].setAttribute("data-fast-sell", "ok");
                    }
                }
            },
            listenerNotifications: function() {
                document.addEventListener("DOMSubtreeModified", function(evt) {
                    //console.log(evt);
                    var notyElement = evt.srcElement.querySelector(".noty_bar.noty_type_alert");
                    if (notyElement != null) {
                        var $message = notyElement.querySelector(".noty_text").innerText;
                        var $id = notyElement.getAttribute("id");
                        chrome.extension.sendRequest({
                            code: SHOW_NOTIFICATION,
                            id: $id, 
                            message : $message,
                            title : "Notification"
                        }, function(response) {
                            log(response);
                        });
                    }
                }, false);
            }
        };
    }
    //Return instance
    "undefined" != typeof module && module.exports ? module.exports = core : "function" == typeof define && define.amd ? define(function() {
        return core;
    }) : parent.posbitCore = core;
}("undefined" != typeof window ? window : this);